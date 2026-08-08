import { ButtonHTMLAttributes, forwardRef } from "react";

import { cn } from "@/lib/utils";

const variants = {
  primary:
    "bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-strong)] shadow-sm",
  secondary:
    "bg-white text-[var(--color-ink)] border border-[var(--color-border)] hover:bg-[var(--color-surface-muted)]",
  ghost: "bg-transparent text-[var(--color-ink-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-ink)]",
  danger: "bg-red-600 text-white hover:bg-red-700",
} as const;

const sizes = {
  sm: "h-9 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  lg: "h-11 px-5 text-sm",
} as const;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", type = "button", ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-colors disabled:pointer-events-none disabled:opacity-50",
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      />
    );
  },
);

Button.displayName = "Button";
