import { revalidatePath } from "next/cache";

import { PageHeader } from "@/components/shared/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { requireAuthContext } from "@/lib/auth/session";
import {
  addKnowledgeDocument,
  listKnowledgeDocuments,
} from "@/services/knowledge";
import type { KnowledgeDocumentType } from "@/types";

export const metadata = { title: "Knowledge" };

export default async function KnowledgePage() {
  const auth = await requireAuthContext();
  const documents = await listKnowledgeDocuments(
    auth.activeOrganization.organization.id,
  );

  async function createDocumentAction(formData: FormData) {
    "use server";
    const context = await requireAuthContext();
    await addKnowledgeDocument({
      organizationId: context.activeOrganization.organization.id,
      title: String(formData.get("title") || "Untitled"),
      documentType: String(formData.get("documentType") || "text") as KnowledgeDocumentType,
      content: String(formData.get("content") || ""),
      sourceUrl: String(formData.get("sourceUrl") || "") || undefined,
    });
    revalidatePath("/knowledge");
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Knowledge"
        description="Train agents with company information. Documents are chunked for retrieval-augmented generation."
      />

      <Card>
        <CardHeader>
          <CardTitle>Add knowledge</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createDocumentAction} className="space-y-3">
            <div className="grid gap-3 md:grid-cols-2">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input id="title" name="title" required />
              </div>
              <div>
                <Label htmlFor="documentType">Type</Label>
                <select
                  id="documentType"
                  name="documentType"
                  className="flex h-11 w-full rounded-lg border border-[var(--color-border)] bg-white px-3 text-sm"
                  defaultValue="text"
                >
                  <option value="text">Text</option>
                  <option value="faq">FAQ</option>
                  <option value="website">Website URL</option>
                  <option value="pdf">PDF</option>
                  <option value="docx">DOCX</option>
                  <option value="txt">TXT</option>
                </select>
              </div>
            </div>
            <div>
              <Label htmlFor="sourceUrl">Source URL (optional)</Label>
              <Input id="sourceUrl" name="sourceUrl" placeholder="https://" />
            </div>
            <div>
              <Label htmlFor="content">Content</Label>
              <textarea
                id="content"
                name="content"
                required
                className="min-h-36 w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
                placeholder="Paste FAQ, policy text, or extracted document content."
              />
            </div>
            <Button type="submit">Add to knowledge base</Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {documents.map((document) => (
          <Card key={document.id}>
            <CardContent className="space-y-2 py-5">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold">{document.title}</h3>
                <Badge tone={document.status === "ready" ? "success" : "warning"}>
                  {document.status}
                </Badge>
              </div>
              <p className="text-xs uppercase tracking-wide text-[var(--color-ink-subtle)]">
                {document.document_type}
              </p>
              <p className="line-clamp-4 text-sm text-[var(--color-ink-muted)]">
                {document.raw_content}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
