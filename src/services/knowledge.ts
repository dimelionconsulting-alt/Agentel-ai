import { randomUUID } from "crypto";

import { isDemoMode } from "@/lib/auth/session";
import { getDemoStore } from "@/lib/demo-store";
import { createClient } from "@/lib/supabase/server";
import type {
  KnowledgeBase,
  KnowledgeDocument,
  KnowledgeDocumentType,
} from "@/types";

export function chunkText(content: string, chunkSize = 800): string[] {
  const normalized = content.replace(/\s+/g, " ").trim();
  if (!normalized) return [];

  const chunks: string[] = [];
  for (let index = 0; index < normalized.length; index += chunkSize) {
    chunks.push(normalized.slice(index, index + chunkSize));
  }
  return chunks;
}

export async function listKnowledgeBases(organizationId: string): Promise<KnowledgeBase[]> {
  if (isDemoMode()) {
    return getDemoStore().knowledgeBases.filter(
      (item) => item.organization_id === organizationId,
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("knowledge_bases")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as KnowledgeBase[];
}

export async function listKnowledgeDocuments(
  organizationId: string,
): Promise<KnowledgeDocument[]> {
  if (isDemoMode()) {
    return getDemoStore().knowledgeDocuments.filter(
      (item) => item.organization_id === organizationId,
    );
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("knowledge_documents")
    .select("*")
    .eq("organization_id", organizationId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []) as KnowledgeDocument[];
}

export async function addKnowledgeDocument(input: {
  organizationId: string;
  knowledgeBaseId?: string;
  title: string;
  documentType: KnowledgeDocumentType;
  content: string;
  sourceUrl?: string;
}): Promise<KnowledgeDocument> {
  const timestamp = new Date().toISOString();

  if (isDemoMode()) {
    const store = getDemoStore();
    let knowledgeBaseId = input.knowledgeBaseId;
    if (!knowledgeBaseId) {
      knowledgeBaseId = randomUUID();
      store.knowledgeBases.unshift({
        id: knowledgeBaseId,
        organization_id: input.organizationId,
        agent_id: null,
        name: "Default knowledge base",
        description: "Auto-created",
        created_at: timestamp,
        updated_at: timestamp,
      });
    }

    const document: KnowledgeDocument = {
      id: randomUUID(),
      organization_id: input.organizationId,
      knowledge_base_id: knowledgeBaseId,
      title: input.title,
      document_type: input.documentType,
      source_url: input.sourceUrl ?? null,
      storage_path: null,
      status: "ready",
      raw_content: input.content,
      error_message: null,
      created_at: timestamp,
      updated_at: timestamp,
    };
    store.knowledgeDocuments.unshift(document);
    return document;
  }

  const supabase = await createClient();
  let knowledgeBaseId = input.knowledgeBaseId;

  if (!knowledgeBaseId) {
    const { data: kb, error: kbError } = await supabase
      .from("knowledge_bases")
      .insert({
        organization_id: input.organizationId,
        name: "Default knowledge base",
      })
      .select("*")
      .single();
    if (kbError || !kb) throw new Error(kbError?.message ?? "Unable to create knowledge base");
    knowledgeBaseId = kb.id;
  }

  const { data, error } = await supabase
    .from("knowledge_documents")
    .insert({
      organization_id: input.organizationId,
      knowledge_base_id: knowledgeBaseId,
      title: input.title,
      document_type: input.documentType,
      source_url: input.sourceUrl ?? null,
      status: "processing",
      raw_content: input.content,
    })
    .select("*")
    .single();

  if (error || !data) throw new Error(error?.message ?? "Unable to create document");

  const chunks = chunkText(input.content);
  if (chunks.length) {
    await supabase.from("knowledge_chunks").insert(
      chunks.map((content, chunkIndex) => ({
        organization_id: input.organizationId,
        document_id: data.id,
        knowledge_base_id: knowledgeBaseId,
        chunk_index: chunkIndex,
        content,
        token_count: content.split(" ").length,
        metadata: {},
      })),
    );
  }

  await supabase
    .from("knowledge_documents")
    .update({ status: "ready" })
    .eq("id", data.id);

  return { ...(data as KnowledgeDocument), status: "ready" };
}

export async function retrieveKnowledgeChunks(input: {
  organizationId: string;
  query: string;
  limit?: number;
}): Promise<Array<{ content: string; documentId: string }>> {
  // Phase 5 embedding similarity will replace this lexical fallback.
  const documents = await listKnowledgeDocuments(input.organizationId);
  const query = input.query.toLowerCase();

  return documents
    .flatMap((document) =>
      chunkText(document.raw_content ?? "").map((content) => ({
        content,
        documentId: document.id,
      })),
    )
    .filter((chunk) => chunk.content.toLowerCase().includes(query))
    .slice(0, input.limit ?? 5);
}
