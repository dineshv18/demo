"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { BrandMark } from "@/components/shared/BrandMark";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { EASE_OUT } from "@/components/shared/motion";

/**
 * Structural facts about the platform, stated elsewhere on the public site.
 * Nothing here is a performance figure or a fabricated metric.
 */
const HIGHLIGHTS = [
  { value: "KYC", label: "Verified onboarding" },
  { value: "5-Level", label: "Referral rewards" },
  { value: "Real-Time", label: "Performance tracking" },
];

/**
 * The branded half of the split-screen auth layout. Deep navy ground, a drawn
 * gold growth curve, and the ORVANTA tagline — desktop only; mobile gets the
 * single-column card instead.
 */
export function AuthBrandPanel({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: ReactNode;
  description: string;
}) {
  const reduce = useReducedMotion();

  return (
    <div className="surface-navy relative hidden overflow-hidden lg:flex lg:w-[52%]">
      <span aria-hidden className="bg-ticker pointer-events-none absolute inset-0 opacity-30" />

      {/* Concentric rings + rising curve */}
      <svg
        aria-hidden
        viewBox="0 0 800 700"
        className="pointer-events-none absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id="authGoldGlow" cx="72%" cy="18%" r="60%">
            <stop offset="0%" stopColor="#D8B44A" stopOpacity="0.20" />
            <stop offset="100%" stopColor="#D8B44A" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="authCurve" x1="0" y1="700" x2="800" y2="0">
            <stop offset="0%" stopColor="#C9A227" stopOpacity="0" />
            <stop offset="50%" stopColor="#D8B44A" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#E5C766" stopOpacity="0.25" />
          </linearGradient>
        </defs>

        <rect width="800" height="700" fill="url(#authGoldGlow)" />
        <circle cx="620" cy="170" r="180" fill="none" stroke="rgba(216,180,74,0.12)" strokeWidth="1" />
        <circle cx="620" cy="170" r="270" fill="none" stroke="rgba(216,180,74,0.07)" strokeWidth="1" />
        <circle cx="140" cy="580" r="150" fill="none" stroke="rgba(216,180,74,0.09)" strokeWidth="1" />

        <motion.path
          d="M40 610 C 200 580, 320 520, 430 400 S 660 190, 790 110"
          stroke="url(#authCurve)"
          strokeWidth="2.5"
          strokeLinecap="round"
          fill="none"
          initial={reduce ? undefined : { pathLength: 0 }}
          animate={reduce ? undefined : { pathLength: 1 }}
          transition={{ duration: 2, ease: EASE_OUT, delay: 0.2 }}
        />
      </svg>

      <div className="relative z-10 flex w-full flex-col justify-between p-12 text-white xl:p-14">
        <div className="flex items-start justify-between gap-4">
          <Link href="/" aria-label="ORVANTA Financial — home">
            <BrandMark on="dark" className="h-12 w-auto" />
          </Link>
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-brand/30 bg-brand/10 px-3.5 py-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-gold-400">
            <span aria-hidden className="size-1.5 rounded-full bg-brand" />
            {eyebrow}
          </span>
        </div>

        <div>
          <h1 className="mb-5 font-display text-4xl font-semibold leading-[1.08] tracking-[-0.03em] xl:text-5xl">
            {title}
          </h1>
          <p className="max-w-sm text-base leading-relaxed text-white/60">{description}</p>

          <p className="mt-8 text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-brand">
            Growing Wealth. Building Futures.
          </p>

          <dl className="mt-8 grid max-w-md grid-cols-3 gap-6 border-t border-white/10 pt-6">
            {HIGHLIGHTS.map((h) => (
              <div key={h.label}>
                <dt className="sr-only">{h.label}</dt>
                <dd>
                  <span className="block font-display text-lg font-semibold text-white">
                    {h.value}
                  </span>
                  <span className="mt-0.5 block text-[0.6875rem] uppercase tracking-wide text-white/45">
                    {h.label}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}

/** Compact ORVANTA lockup shown above the auth card on mobile. */
export function AuthLogo() {
  return (
    <div className="flex justify-center lg:hidden">
      <Link href="/" className="flex items-center gap-3" aria-label="ORVANTA Financial — home">
        <BrandMark className="h-12 w-auto" />
      </Link>
    </div>
  );
}

export default function AuthShell({
  brandEyebrow,
  brandTitle,
  brandDescription,
  children,
}: {
  brandEyebrow: string;
  brandTitle: ReactNode;
  brandDescription: string;
  children: ReactNode;
}) {
  const reduce = useReducedMotion();

  return (
    <div className="relative flex min-h-svh w-full bg-background">
      <AuthBrandPanel
        eyebrow={brandEyebrow}
        title={brandTitle}
        description={brandDescription}
      />

      <div className="relative flex flex-1 items-center justify-center px-5 py-12 sm:px-6 lg:px-14 xl:px-20">
        {/* Quiet ground behind the form on mobile, where the navy panel is hidden */}
        <span aria-hidden className="bg-grid pointer-events-none absolute inset-0 opacity-40 lg:hidden" />

        <div className="absolute right-4 top-4 flex items-center gap-2 sm:right-6 sm:top-6">
          <Link
            href="/"
            className="hidden h-9 items-center rounded-lg border border-border px-3.5 text-[0.8125rem] font-semibold text-muted-foreground transition-colors hover:border-brand/45 hover:text-brand sm:inline-flex"
          >
            Back to site
          </Link>
          <ThemeToggle />
        </div>

        <motion.div
          initial={reduce ? undefined : { opacity: 0, y: 16 }}
          animate={reduce ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: EASE_OUT }}
          className="relative w-full max-w-md"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}
