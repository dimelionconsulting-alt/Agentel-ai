"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Agent } from "@/types";

export function OutboundCallForm({ agents }: { agents: Agent[] }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="space-y-4"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        startTransition(async () => {
          setError(null);
          const response = await fetch("/api/telephony/outbound", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              agentId: formData.get("agentId"),
              customerName: formData.get("customerName"),
              telephoneNumber: formData.get("telephoneNumber"),
              purpose: formData.get("purpose"),
              instructions: formData.get("instructions") || undefined,
            }),
          });
          const payload = await response.json();
          if (!response.ok) {
            setError(payload.error ?? "Unable to start outbound call");
            return;
          }
          router.push(`/calls/${payload.callId}`);
          router.refresh();
        });
      }}
    >
      {error ? <Alert tone="danger">{error}</Alert> : null}
      <div>
        <Label htmlFor="agentId">Agent</Label>
        <select
          id="agentId"
          name="agentId"
          required
          className="flex h-11 w-full rounded-lg border border-[var(--color-border)] bg-white px-3 text-sm"
        >
          {agents.map((agent) => (
            <option key={agent.id} value={agent.id}>
              {agent.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <Label htmlFor="customerName">Customer name</Label>
        <Input id="customerName" name="customerName" required />
      </div>
      <div>
        <Label htmlFor="telephoneNumber">Telephone number</Label>
        <Input id="telephoneNumber" name="telephoneNumber" placeholder="+1..." required />
      </div>
      <div>
        <Label htmlFor="purpose">Purpose</Label>
        <Input id="purpose" name="purpose" required />
      </div>
      <div>
        <Label htmlFor="instructions">Optional instructions</Label>
        <textarea
          id="instructions"
          name="instructions"
          className="min-h-24 w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
        />
      </div>
      <Button type="submit" disabled={pending || agents.length === 0}>
        {pending ? "Starting call..." : "Start AI outbound call"}
      </Button>
    </form>
  );
}
