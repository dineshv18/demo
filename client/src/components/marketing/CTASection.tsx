"use client";

import Link from "next/link";
import { IconArrowRight, IconSparkles } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

/**
 * Closing call to action. Navy ground, gold accent, abstract tick pattern —
 * deliberately no multi-hue gradient.
 */
export function CTASection({
  eyebrow = "Verification takes minutes",
  title,
  description,
  primary = { href: "/register", label: "Get Started" },
  secondary = { href: "/platform", label: "Learn More" },
  className,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description: string;
  primary?: { href: string; label: string };
  secondary?: { href: string; label: string } | null;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "surface-navy relative overflow-hidden rounded-2xl p-8 md:p-14",
        className
      )}
    >
      <span aria-hidden className="bg-ticker pointer-events-none absolute inset-0 opacity-40" />
      <span
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-28 size-80 rounded-full bg-brand/12 blur-3xl"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-brand/50 to-transparent"
      />

      <div className="relative flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-xl space-y-4">
          <span className="inline-flex select-none items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3.5 py-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-gold-400">
            <IconSparkles size={14} stroke={2} />
            {eyebrow}
          </span>

          <h2 className="font-display text-3xl font-semibold leading-tight tracking-[-0.03em] text-white md:text-4xl">
            {title}
          </h2>

          <p className="text-sm leading-relaxed text-white/65">{description}</p>
        </div>

        <div className="flex shrink-0 flex-wrap gap-3">
          <Link
            href={primary.href}
            className="btn-glow btn-glow-hover inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-semibold"
          >
            {primary.label} <IconArrowRight className="size-4" />
          </Link>
          {secondary && (
            <Link
              href={secondary.href}
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:border-brand/50 hover:text-gold-400"
            >
              {secondary.label}
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
