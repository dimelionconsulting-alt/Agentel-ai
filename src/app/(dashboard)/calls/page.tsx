import { ModulePlaceholder } from "@/components/shared/module-placeholder";

export const metadata = { title: "Calls" };

export default function CallsPage() {
  return (
    <ModulePlaceholder
      title="Calls"
      description="Searchable call history with transcripts, summaries, and outcomes."
      phase="Phase 4"
      bullets={[
        "Inbound and outbound call logging",
        "Transcript, sentiment, and cost detail pages",
        "Recording playback when enabled",
      ]}
    />
  );
}
