"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { saveAgentAction } from "@/lib/auth/agent-actions";
import {
  LANGUAGE_OPTIONS,
  TRANSFER_CONDITION_OPTIONS,
  VOICE_OPTIONS,
  defaultAgentFormValues,
  type AgentFormValues,
} from "@/lib/validations/agents";
import { systemTools } from "@/services/tools";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TestAgentPanel } from "@/components/agents/test-agent-panel";
import type { PhoneNumber } from "@/types";

const steps = [
  "Identity",
  "Voice & language",
  "Instructions",
  "Knowledge",
  "Tools",
  "Phone number",
  "Test",
  "Publish",
] as const;

function ToggleChip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-lg border px-3 py-1.5 text-sm transition ${
        active
          ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-ink)]"
          : "border-[var(--color-border)] bg-white text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-muted)]"
      }`}
    >
      {label}
    </button>
  );
}

export function AgentBuilder({
  initialValues,
  agentId,
  phoneNumbers,
}: {
  initialValues?: AgentFormValues;
  agentId?: string;
  phoneNumbers: PhoneNumber[];
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<AgentFormValues>(
    initialValues ?? defaultAgentFormValues,
  );
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const progress = useMemo(() => ((step + 1) / steps.length) * 100, [step]);

  function update<K extends keyof AgentFormValues>(key: K, value: AgentFormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
  }

  function toggleListValue(key: "additional_languages" | "transfer_conditions" | "enabled_tools", item: string) {
    setValues((current) => {
      const list = current[key];
      return {
        ...current,
        [key]: list.includes(item) ? list.filter((value) => value !== item) : [...list, item],
      };
    });
  }

  function save(status?: AgentFormValues["status"]) {
    const formData = new FormData();
    if (agentId) formData.set("agentId", agentId);
    const payload = { ...values, status: status ?? values.status };

    Object.entries(payload).forEach(([key, value]) => {
      if (value == null) {
        formData.set(key, "");
        return;
      }
      if (Array.isArray(value)) {
        formData.set(key, value.join(","));
        return;
      }
      if (typeof value === "object") {
        formData.set(key, JSON.stringify(value));
        return;
      }
      formData.set(key, String(value));
    });

    startTransition(async () => {
      setError(null);
      const result = await saveAgentAction(formData);
      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="py-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm font-medium text-[var(--color-ink)]">
              Step {step + 1} of {steps.length}: {steps[step]}
            </div>
            <Badge tone="info">{Math.round(progress)}%</Badge>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-[var(--color-surface-muted)]">
            <div
              className="h-full rounded-full bg-[var(--color-accent)] transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {steps.map((label, index) => (
              <button
                key={label}
                type="button"
                onClick={() => setStep(index)}
                className={`whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium ${
                  index === step
                    ? "bg-[var(--color-accent)] text-white"
                    : index < step
                      ? "bg-[var(--color-accent-soft)] text-[var(--color-ink)]"
                      : "bg-[var(--color-surface-muted)] text-[var(--color-ink-muted)]"
                }`}
              >
                {index + 1}. {label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {error ? <Alert tone="danger">{error}</Alert> : null}

      <Card className="animate-fade-up">
        <CardHeader>
          <CardTitle>{steps[step]}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === 0 ? (
            <>
              <div>
                <Label htmlFor="name">Agent name</Label>
                <Input
                  id="name"
                  value={values.name}
                  onChange={(event) => update("name", event.target.value)}
                  placeholder="Front Desk"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={values.description ?? ""}
                  onChange={(event) => update("description", event.target.value)}
                  placeholder="Handles inbound scheduling and FAQs"
                />
              </div>
              <div>
                <Label htmlFor="avatar_url">Profile image URL</Label>
                <Input
                  id="avatar_url"
                  value={values.avatar_url ?? ""}
                  onChange={(event) => update("avatar_url", event.target.value)}
                  placeholder="https://..."
                />
              </div>
              <div>
                <Label htmlFor="objective">Agent objective</Label>
                <Input
                  id="objective"
                  value={values.objective ?? ""}
                  onChange={(event) => update("objective", event.target.value)}
                />
              </div>
            </>
          ) : null}

          {step === 1 ? (
            <>
              <div>
                <Label>Voice</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {VOICE_OPTIONS.map((voice) => (
                    <ToggleChip
                      key={voice.id}
                      active={values.voice === voice.id}
                      label={voice.label}
                      onClick={() => update("voice", voice.id)}
                    />
                  ))}
                </div>
              </div>
              <div>
                <Label>Primary language</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {LANGUAGE_OPTIONS.map((language) => (
                    <ToggleChip
                      key={language.id}
                      active={values.language === language.id}
                      label={language.label}
                      onClick={() => update("language", language.id)}
                    />
                  ))}
                </div>
              </div>
              <div>
                <Label>Additional languages</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {LANGUAGE_OPTIONS.filter((language) => language.id !== values.language).map(
                    (language) => (
                      <ToggleChip
                        key={language.id}
                        active={values.additional_languages.includes(language.id)}
                        label={language.label}
                        onClick={() => toggleListValue("additional_languages", language.id)}
                      />
                    ),
                  )}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="speaking_speed">Speaking speed</Label>
                  <Input
                    id="speaking_speed"
                    type="number"
                    min={0.5}
                    max={2}
                    step={0.1}
                    value={values.speaking_speed}
                    onChange={(event) => update("speaking_speed", Number(event.target.value))}
                  />
                </div>
                <div>
                  <Label htmlFor="interruption_handling">Interruption handling</Label>
                  <select
                    id="interruption_handling"
                    className="flex h-11 w-full rounded-lg border border-[var(--color-border)] bg-white px-3 text-sm"
                    value={values.interruption_handling}
                    onChange={(event) =>
                      update(
                        "interruption_handling",
                        event.target.value as AgentFormValues["interruption_handling"],
                      )
                    }
                  >
                    <option value="strict">Strict</option>
                    <option value="balanced">Balanced</option>
                    <option value="permissive">Permissive</option>
                  </select>
                </div>
              </div>
            </>
          ) : null}

          {step === 2 ? (
            <>
              <div>
                <Label htmlFor="greeting_message">Greeting message</Label>
                <textarea
                  id="greeting_message"
                  className="min-h-24 w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
                  value={values.greeting_message ?? ""}
                  onChange={(event) => update("greeting_message", event.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="system_prompt">Agent instructions / system prompt</Label>
                <textarea
                  id="system_prompt"
                  className="min-h-40 w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
                  value={values.system_prompt ?? ""}
                  onChange={(event) => update("system_prompt", event.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="conversation_style">Conversation style</Label>
                <Input
                  id="conversation_style"
                  value={values.conversation_style ?? ""}
                  onChange={(event) => update("conversation_style", event.target.value)}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="max_call_duration_seconds">Max call duration (seconds)</Label>
                  <Input
                    id="max_call_duration_seconds"
                    type="number"
                    value={values.max_call_duration_seconds}
                    onChange={(event) =>
                      update("max_call_duration_seconds", Number(event.target.value))
                    }
                  />
                </div>
                <div>
                  <Label htmlFor="silence_timeout_seconds">Silence timeout (seconds)</Label>
                  <Input
                    id="silence_timeout_seconds"
                    type="number"
                    value={values.silence_timeout_seconds}
                    onChange={(event) =>
                      update("silence_timeout_seconds", Number(event.target.value))
                    }
                  />
                </div>
              </div>
            </>
          ) : null}

          {step === 3 ? (
            <>
              <div>
                <Label htmlFor="business_description">Business description</Label>
                <textarea
                  id="business_description"
                  className="min-h-28 w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
                  value={values.business_description ?? ""}
                  onChange={(event) => update("business_description", event.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="knowledge_notes">Business knowledge notes</Label>
                <textarea
                  id="knowledge_notes"
                  className="min-h-40 w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm"
                  value={values.knowledge_notes ?? ""}
                  onChange={(event) => update("knowledge_notes", event.target.value)}
                  placeholder="Paste FAQs, policies, pricing notes, or service details. Full document RAG lands in Knowledge."
                />
              </div>
            </>
          ) : null}

          {step === 4 ? (
            <>
              <div>
                <Label>Connected tools</Label>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {systemTools.map((tool) => (
                    <button
                      key={tool.name}
                      type="button"
                      onClick={() => toggleListValue("enabled_tools", tool.name)}
                      className={`rounded-xl border p-3 text-left transition ${
                        values.enabled_tools.includes(tool.name)
                          ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)]"
                          : "border-[var(--color-border)] bg-white"
                      }`}
                    >
                      <div className="text-sm font-medium">{tool.displayName}</div>
                      <div className="mt-1 text-xs text-[var(--color-ink-muted)]">
                        {tool.description}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label htmlFor="transfer_phone_number">Human transfer number</Label>
                <Input
                  id="transfer_phone_number"
                  value={values.transfer_phone_number ?? ""}
                  onChange={(event) => update("transfer_phone_number", event.target.value)}
                  placeholder="+15551234567"
                />
              </div>
              <div>
                <Label>Transfer conditions</Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {TRANSFER_CONDITION_OPTIONS.map((condition) => (
                    <ToggleChip
                      key={condition.id}
                      active={values.transfer_conditions.includes(condition.id)}
                      label={condition.label}
                      onClick={() => toggleListValue("transfer_conditions", condition.id)}
                    />
                  ))}
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <ToggleChip
                  active={values.emergency_transfer_enabled}
                  label="Emergency transfer enabled"
                  onClick={() =>
                    update("emergency_transfer_enabled", !values.emergency_transfer_enabled)
                  }
                />
                <ToggleChip
                  active={values.sms_follow_up_enabled}
                  label="SMS follow-up enabled"
                  onClick={() => update("sms_follow_up_enabled", !values.sms_follow_up_enabled)}
                />
              </div>
            </>
          ) : null}

          {step === 5 ? (
            <>
              <p className="text-sm text-[var(--color-ink-muted)]">
                Assign a telephone number now, or publish as draft and connect one later.
              </p>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => update("phone_number_id", null)}
                  className={`w-full rounded-xl border p-3 text-left ${
                    !values.phone_number_id
                      ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)]"
                      : "border-[var(--color-border)]"
                  }`}
                >
                  <div className="text-sm font-medium">Skip for now</div>
                  <div className="text-xs text-[var(--color-ink-muted)]">
                    Test in-browser before connecting telephony
                  </div>
                </button>
                {phoneNumbers.map((phone) => (
                  <button
                    key={phone.id}
                    type="button"
                    onClick={() => update("phone_number_id", phone.id)}
                    className={`w-full rounded-xl border p-3 text-left ${
                      values.phone_number_id === phone.id
                        ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)]"
                        : "border-[var(--color-border)]"
                    }`}
                  >
                    <div className="text-sm font-medium">{phone.e164}</div>
                    <div className="text-xs text-[var(--color-ink-muted)]">
                      {phone.friendly_name ?? phone.provider} · {phone.status}
                    </div>
                  </button>
                ))}
              </div>
            </>
          ) : null}

          {step === 6 ? (
            <TestAgentPanel
              agentName={values.name || "Draft agent"}
              greeting={values.greeting_message || ""}
              systemPrompt={values.system_prompt || ""}
              voice={values.voice}
              language={values.language}
            />
          ) : null}

          {step === 7 ? (
            <div className="space-y-4">
              <Alert tone="info">
                Review configuration, then save as draft or publish the agent as active.
              </Alert>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-[var(--color-border)] p-4 text-sm">
                  <div className="font-medium">{values.name || "Untitled agent"}</div>
                  <div className="mt-1 text-[var(--color-ink-muted)]">
                    {values.voice} · {values.language} · {values.enabled_tools.length} tools
                  </div>
                </div>
                <div className="rounded-xl border border-[var(--color-border)] p-4 text-sm text-[var(--color-ink-muted)]">
                  Transfer: {values.transfer_phone_number || "Not set"}
                  <br />
                  Phone:{" "}
                  {phoneNumbers.find((phone) => phone.id === values.phone_number_id)?.e164 ??
                    "Not assigned"}
                </div>
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button
          variant="secondary"
          onClick={() => (step === 0 ? router.push("/agents") : setStep((value) => value - 1))}
        >
          {step === 0 ? "Cancel" : "Back"}
        </Button>
        <div className="flex flex-wrap gap-2">
          {step < steps.length - 1 ? (
            <Button onClick={() => setStep((value) => Math.min(value + 1, steps.length - 1))}>
              Continue
            </Button>
          ) : (
            <>
              <Button variant="secondary" disabled={pending} onClick={() => save("draft")}>
                {pending ? "Saving..." : "Save draft"}
              </Button>
              <Button disabled={pending} onClick={() => save("active")}>
                {pending ? "Publishing..." : "Publish agent"}
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
