"use client";

import { useState } from "react";

import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export function DashboardShell({
  children,
  organizationName,
  userName,
  userEmail,
  role,
  demoMode,
}: {
  children: React.ReactNode;
  organizationName: string;
  userName: string;
  userEmail: string;
  role: string;
  demoMode: boolean;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--color-canvas)] lg:flex">
      <Sidebar
        open={open}
        onClose={() => setOpen(false)}
        organizationName={organizationName}
      />
      <div className="flex min-h-screen flex-1 flex-col">
        <Topbar
          onMenuClick={() => setOpen(true)}
          userName={userName}
          userEmail={userEmail}
          role={role}
          demoMode={demoMode}
        />
        <main className="flex-1 px-4 py-6 md:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
