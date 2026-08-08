import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function HomePage() {
  return (
    <div className="relative min-h-screen overflow-hidden text-white">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "linear-gradient(120deg, rgba(8,47,73,0.88), rgba(15,118,110,0.72)), url('https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?auto=format&fit=crop&w=2000&q=80')",
        }}
      />
      <div className="hero-glow absolute -left-24 top-16 h-72 w-72 rounded-full bg-cyan-300/20 blur-3xl" />
      <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-teal-200/10 blur-3xl" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-6">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 text-base font-bold backdrop-blur">
              V
            </span>
            <span className="text-lg font-semibold tracking-tight">Voxora AI</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm font-medium text-white/85 hover:text-white">
              Sign in
            </Link>
            <Link href="/signup">
              <Button className="bg-white text-slate-900 hover:bg-slate-100">Get started</Button>
            </Link>
          </div>
        </header>

        <main className="flex flex-1 flex-col justify-center pb-16 pt-20">
          <p
            className="animate-fade-up font-[family-name:var(--font-fraunces)] text-5xl leading-[1.05] tracking-tight sm:text-6xl md:text-7xl"
          >
            Voxora AI
          </p>
          <h1 className="animate-fade-up delay-100 mt-5 max-w-2xl text-2xl font-medium tracking-tight text-white/95 sm:text-3xl">
            AI voice agents that answer, qualify, and book — on every call.
          </h1>
          <p className="animate-fade-up mt-4 max-w-xl text-base text-white/75 sm:text-lg" style={{ animationDelay: "160ms" }}>
            Launch multi-tenant inbound and outbound voice agents with telephony,
            knowledge, and CRM workflows in one platform.
          </p>
          <div className="animate-fade-up mt-8 flex flex-wrap gap-3" style={{ animationDelay: "220ms" }}>
            <Link href="/signup">
              <Button size="lg" className="bg-white text-slate-900 hover:bg-slate-100">
                Start free trial
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button
                size="lg"
                variant="secondary"
                className="border-white/30 bg-white/10 text-white hover:bg-white/15"
              >
                Open dashboard
              </Button>
            </Link>
          </div>
        </main>
      </div>
    </div>
  );
}
