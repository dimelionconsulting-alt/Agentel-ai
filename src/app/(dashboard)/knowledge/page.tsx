import { ModulePlaceholder } from "@/components/shared/module-placeholder";

export const metadata = { title: "Knowledge" };

export default function KnowledgePage() {
  return (
    <ModulePlaceholder
      title="Knowledge"
      description="Train agents with documents, FAQs, websites, and files using RAG."
      phase="Phase 5"
      bullets={[
        "Documents → extraction → chunks → embeddings",
        "Supabase pgvector retrieval",
        "Text, FAQ, website, PDF, DOCX, TXT sources",
      ]}
    />
  );
}
