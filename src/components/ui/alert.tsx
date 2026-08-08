import { HTMLAttributes } from "react";

import { cn } from "@/lib/utils";

export function Alert({
  className,
  tone = "info",
  ...props
}: HTMLAttributes<HTMLDivElement> & { tone?: "info" | "success" | "danger" }) {
  const tones = {
    info: "border-sky-200 bg-sky-50 text-sky-900",
    success: "border-emerald-200 bg-emerald-50 text-emerald-900",
    danger: "border-red-200 bg-red-50 text-red-900",
  };

  return (
    <div
      className={cn("rounded-lg border px-3 py-2 text-sm", tones[tone], className)}
      {...props}
    />
  );
}
