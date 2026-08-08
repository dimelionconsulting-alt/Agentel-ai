"use client";

import { useEffect, useRef, useState } from "react";
import { Mic, MicOff, PhoneOff } from "lucide-react";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

type ChatLine = { role: "user" | "assistant"; text: string };

export function TestAgentPanel({
  agentName,
  greeting,
  systemPrompt,
  voice,
  language,
}: {
  agentName: string;
  greeting: string;
  systemPrompt: string;
  voice: string;
  language: string;
}) {
  const [active, setActive] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lines, setLines] = useState<ChatLine[]>([]);
  const [mode, setMode] = useState<"idle" | "realtime" | "simulated">("idle");
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
      window.speechSynthesis?.cancel();
    };
  }, []);

  async function startTest() {
    setError(null);
    setLines([{ role: "assistant", text: greeting || `Hi, I'm ${agentName}. How can I help?` }]);

    try {
      const response = await fetch("/api/voice/realtime-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agentName,
          systemPrompt,
          voice,
          language,
          greeting,
        }),
      });

      const payload = await response.json();

      if (response.ok && payload.mode === "realtime" && payload.clientSecret) {
        setMode("realtime");
        setActive(true);
        setLines((current) => [
          ...current,
          {
            role: "assistant",
            text: "Realtime session ready. Connect a WebRTC client or continue with mic simulation below.",
          },
        ]);
      } else {
        setMode("simulated");
        setActive(true);
      }

      if (greeting && "speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(greeting);
        utterance.lang = language === "en" ? "en-US" : language;
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start test session");
      setMode("simulated");
      setActive(true);
    }
  }

  function stopTest() {
    recognitionRef.current?.stop();
    window.speechSynthesis?.cancel();
    setListening(false);
    setActive(false);
    setMode("idle");
  }

  function startListening() {
    const SpeechRecognitionImpl =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognitionImpl) {
      setError("Speech recognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognitionImpl();
    recognition.lang = language === "en" ? "en-US" : language;
    recognition.interimResults = false;
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const text = event.results[0]?.[0]?.transcript;
      if (!text) return;
      setLines((current) => [...current, { role: "user", text }]);

      const reply = buildSimulatedReply(text, agentName);
      setLines((current) => [...current, { role: "assistant", text: reply }]);
      if ("speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(reply);
        window.speechSynthesis.speak(utterance);
      }
    };
    recognition.onerror = () => setListening(false);
    recognition.onend = () => setListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setListening(true);
  }

  return (
    <div className="space-y-4">
      <Alert tone="info">
        Speak with your agent in the browser before connecting a telephone number.
        {mode === "realtime"
          ? " OpenAI Realtime credentials were issued for this session."
          : " Using local mic simulation when Realtime credentials are unavailable."}
      </Alert>

      {error ? <Alert tone="danger">{error}</Alert> : null}

      <div className="flex flex-wrap gap-2">
        {!active ? (
          <Button onClick={startTest}>
            <Mic className="h-4 w-4" />
            Test Agent
          </Button>
        ) : (
          <>
            <Button
              variant="secondary"
              onClick={listening ? () => recognitionRef.current?.stop() : startListening}
            >
              {listening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
              {listening ? "Listening..." : "Speak"}
            </Button>
            <Button variant="danger" onClick={stopTest}>
              <PhoneOff className="h-4 w-4" />
              End test
            </Button>
          </>
        )}
      </div>

      <div className="max-h-72 space-y-2 overflow-y-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4">
        {lines.length === 0 ? (
          <p className="text-sm text-[var(--color-ink-muted)]">
            Start a test to preview the greeting and conversation flow.
          </p>
        ) : (
          lines.map((line, index) => (
            <div
              key={`${line.role}-${index}`}
              className={`rounded-lg px-3 py-2 text-sm ${
                line.role === "assistant"
                  ? "bg-white text-[var(--color-ink)]"
                  : "ml-8 bg-[var(--color-accent-soft)] text-[var(--color-ink)]"
              }`}
            >
              <span className="mr-2 text-xs font-semibold uppercase tracking-wide text-[var(--color-ink-subtle)]">
                {line.role}
              </span>
              {line.text}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function buildSimulatedReply(input: string, agentName: string) {
  const normalized = input.toLowerCase();
  if (normalized.includes("appointment") || normalized.includes("book")) {
    return "I can help with that. What day and time work best for you?";
  }
  if (normalized.includes("human") || normalized.includes("agent")) {
    return "Of course — I can transfer you to a teammate. One moment.";
  }
  if (normalized.includes("price") || normalized.includes("cost")) {
    return "I can share pricing details from our knowledge base. What service are you asking about?";
  }
  return `Thanks for sharing that. I'm ${agentName}, and I can help with appointments, questions, or taking a message.`;
}
