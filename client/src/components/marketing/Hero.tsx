"use client";

import { useRef } from "react";
import Link from "next/link";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import {
  IconArrowRight,
  IconChartLine,
  IconShieldCheck,
  IconSparkles,
  IconUserCheck,
} from "@tabler/icons-react";

import { EASE_OUT } from "@/components/shared/motion";
import { HeroPreview } from "@/components/marketing/HeroPreview";
import { SheenButton } from "@/components/marketing/SheenButton";

const proofPoints = [
  { icon: IconShieldCheck, label: "100% KYC-verified" },
  { icon: IconUserCheck, label: "5 referral levels" },
  { icon: IconChartLine, label: "Real-time tracking" },
];

/**
 * Landing hero.
 *
 * Centred lockup over a quiet navy/gold ground, with the dashboard preview
 * sitting below in a glass frame that lifts and un-tilts as it scrolls into
 * view. The perspective tilt is decorative only — it degrades to a flat, static
 * frame under `prefers-reduced-motion`.
 */
export function Hero() {
  const reduce = useReducedMotion();
  const frameRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: frameRef,
    offset: ["start end", "center center"],
  });

  const rotateX = useTransform(scrollYProgress, [0, 1], [14, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.94, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.4], [0.4, 1]);

  const rise = (delay: number) =>
    reduce
      ? {}
      : {
          initial: { opacity: 0, y: 18 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.7, ease: EASE_OUT, delay },
        };

  return (
    <section className="relative overflow-hidden">
      <GrowthGeometry />

      <div className="relative mx-auto max-w-5xl px-5 pb-10 pt-6 text-center lg:px-8 lg:pt-12">
        {/* Announcement pill */}
        <motion.div {...rise(0)}>
          <span className="inline-flex items-center gap-2 rounded-full border border-brand/25 bg-card px-2 py-1.5 pr-4 shadow-card">
            <span className="rounded-full bg-brand px-2.5 py-0.5 text-[0.625rem] font-bold uppercase tracking-[0.14em] text-brand-foreground">
              Index
            </span>
            <span className="text-[0.8125rem] font-medium text-foreground">
              KYC-verified investing, with every tier published upfront
            </span>
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          {...rise(0.07)}
          className="mt-8 font-display text-[2.75rem] font-semibold leading-[1.02] tracking-[-0.04em] text-foreground sm:text-6xl lg:text-7xl"
        >
          Growing wealth.
          <span className="mt-1 block text-gradient">Building futures.</span>
        </motion.h1>

        {/* Subtext */}
        <motion.p
          {...rise(0.14)}
          className="mx-auto mt-7 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg"
        >
          ORVANTA Financial is a transparent, KYC-verified Index investment
          platform. Deposit into your wallet, choose a tier with terms published
          before you commit, and track performance in real time.
        </motion.p>

        {/* CTAs */}
        <motion.div
          {...rise(0.21)}
          className="mt-9 flex flex-col justify-center gap-3 sm:flex-row"
        >
          <SheenButton href="/register" size="lg">
            Get Started
            <IconArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </SheenButton>
          <Link
            href="/login"
            className="inline-flex items-center justify-center rounded-xl border border-border bg-card px-8 py-4 text-[0.9375rem] font-semibold text-foreground shadow-card transition-colors hover:border-brand/45 hover:bg-accent"
          >
            Login
          </Link>
        </motion.div>

        {/* Proof points */}
        <motion.ul
          {...rise(0.28)}
          className="mt-9 flex flex-wrap items-center justify-center gap-x-7 gap-y-2.5"
        >
          {proofPoints.map((p) => (
            <li
              key={p.label}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground"
            >
              <p.icon className="size-3.5 text-brand" stroke={1.75} /> {p.label}
            </li>
          ))}
        </motion.ul>
      </div>

      {/* Dashboard preview — lifts into place as it enters the viewport */}
      <div
        ref={frameRef}
        className="relative mx-auto mt-4 max-w-6xl px-4 pb-4 sm:px-6 lg:px-8"
        style={{ perspective: reduce ? undefined : "1600px" }}
      >
        <motion.div
          style={reduce ? undefined : { rotateX, scale, opacity }}
          className="origin-top rounded-2xl border border-border bg-card/60 p-2 shadow-lifted backdrop-blur-xl sm:p-3"
        >
          {/* Gold hairline along the top edge of the frame */}
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-brand/60 to-transparent"
          />
          <HeroPreview />
        </motion.div>

        {/* Fades the frame into the page rather than cutting it off hard */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -bottom-1 h-28 bg-linear-to-t from-background to-transparent"
        />
      </div>
    </section>
  );
}

/**
 * Abstract investment-growth motif: a rising gold curve with column ticks,
 * echoing the bar-and-swoosh inside the ORVANTA mark. Purely decorative.
 */
function GrowthGeometry() {
  const reduce = useReducedMotion();

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* Soft gold bloom behind the headline */}
      <div
        className="absolute left-1/2 top-0 size-[42rem] -translate-x-1/2 -translate-y-1/3 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in oklab, var(--brand) 6%, transparent), transparent)",
        }}
      />

      <svg
        className="absolute inset-x-0 top-0 h-[42rem] w-full opacity-35"
        viewBox="0 0 1200 700"
        fill="none"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <linearGradient id="orvHeroGold" x1="0" y1="700" x2="1200" y2="0">
            <stop offset="0%" stopColor="var(--brand)" stopOpacity="0" />
            <stop offset="50%" stopColor="var(--brand)" stopOpacity="0.45" />
            <stop offset="100%" stopColor="var(--brand)" stopOpacity="0.1" />
          </linearGradient>
          <linearGradient id="orvHeroCol" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--foreground)" stopOpacity="0.07" />
            <stop offset="100%" stopColor="var(--foreground)" stopOpacity="0" />
          </linearGradient>
        </defs>

        {[
          { x: 120, h: 110 },
          { x: 210, h: 170 },
          { x: 980, h: 200 },
          { x: 1070, h: 140 },
        ].map((c) => (
          <rect
            key={c.x}
            x={c.x}
            y={560 - c.h}
            width="42"
            height={c.h}
            rx="8"
            fill="url(#orvHeroCol)"
          />
        ))}

        <motion.path
          d="M-20 600 C 200 560, 340 500, 500 380 S 860 160, 1220 90"
          stroke="url(#orvHeroGold)"
          strokeWidth="2.5"
          strokeLinecap="round"
          initial={reduce ? undefined : { pathLength: 0, opacity: 0 }}
          animate={reduce ? undefined : { pathLength: 1, opacity: 1 }}
          transition={{ duration: 2, ease: EASE_OUT, delay: 0.3 }}
        />
      </svg>
    </div>
  );
}

/** Small decorative sparkle used by section eyebrows elsewhere. */
export { IconSparkles as HeroSparkle };
