"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
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
import { useAuth } from "@/lib/AuthContext";

const proofPoints = [
  { icon: IconShieldCheck, label: "KYC verified" },
  { icon: IconUserCheck, label: "Clear tier terms" },
  { icon: IconChartLine, label: "Live tracking" },
];

export function Hero() {
  const reduce = useReducedMotion();
  const { user } = useAuth();
  const rise = (delay: number) => reduce ? {} : {
    initial: { opacity: 0, y: 22 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, ease: EASE_OUT, delay },
  };

  return (
    <section className="relative overflow-hidden px-4 pb-10 pt-3 sm:px-6 lg:pb-16">
      <div className="relative mx-auto grid max-w-7xl overflow-hidden rounded-[2rem] border border-brand/15 bg-card shadow-overlay lg:min-h-[670px] lg:grid-cols-[0.86fr_1.14fr]">
        <span aria-hidden className="pointer-events-none absolute -left-40 -top-40 size-[34rem] rounded-full bg-brand/10 blur-3xl" />

        <div className="relative z-10 flex flex-col justify-center px-6 py-14 sm:px-10 lg:px-14 lg:py-20">
          <motion.div {...rise(0)}>
            <span className="inline-flex items-center gap-2 rounded-full border border-brand/20 bg-accent px-3.5 py-1.5 text-[0.6875rem] font-bold uppercase tracking-[0.16em] text-brand">
              <span className="size-1.5 rounded-full bg-brand" />
              Transparent index investing
            </span>
          </motion.div>

          <motion.h1 {...rise(0.08)} className="mt-7 max-w-2xl font-classic text-[3rem] font-bold leading-[0.98] tracking-[-0.035em] text-foreground sm:text-6xl lg:text-[4.5rem]">
            Capital deserves
            <span className="mt-2 block text-gradient italic">clarity.</span>
          </motion.h1>

          <motion.p {...rise(0.16)} className="mt-7 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Build and track your ORVANTA portfolio from one secure account. Published terms, verified onboarding, and a live view of every balance—without the fine-print maze.
          </motion.p>

          <motion.div {...rise(0.24)} className="mt-9 flex flex-col gap-3 sm:flex-row">
            <SheenButton href={user ? "/dashboard" : "/register"} size="lg">
              {user ? "Open dashboard" : "Start investing"}<IconArrowRight className="size-4" />
            </SheenButton>
            <Link href="/platform" className="inline-flex h-14 items-center justify-center rounded-xl border border-border bg-card px-7 text-sm font-semibold text-foreground transition-colors hover:border-brand/40 hover:bg-accent">
              Explore the platform
            </Link>
          </motion.div>

          <motion.ul {...rise(0.32)} className="mt-10 grid gap-3 border-t border-border pt-6 sm:grid-cols-3">
            {proofPoints.map((point) => (
              <li key={point.label} className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-accent text-brand"><point.icon className="size-3.5" /></span>
                {point.label}
              </li>
            ))}
          </motion.ul>
        </div>

        <motion.div {...rise(0.12)} className="relative min-h-[480px] overflow-hidden bg-[#09070c] p-5 sm:p-8 lg:min-h-full lg:p-10">
          <span aria-hidden className="bg-ticker pointer-events-none absolute inset-0 opacity-25" />
          <span aria-hidden className="pointer-events-none absolute -right-32 -top-24 size-[30rem] rounded-full bg-brand/25 blur-3xl" />
          <div className="relative flex h-full flex-col justify-center">
            <div className="mb-5 flex items-center justify-between text-white">
              <div>
                <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-purple-300">Your financial command centre</p>
                <p className="mt-1 font-classic text-2xl font-bold">Everything important, visible.</p>
              </div>
              <span className="hidden rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-white/65 sm:block">Live overview</span>
            </div>
            <div className="rotate-[1.5deg] rounded-2xl border border-white/12 bg-white/7 p-2 shadow-2xl backdrop-blur-xl transition-transform duration-500 hover:rotate-0 sm:p-3">
              <HeroPreview />
            </div>
            <div className="mt-5 grid grid-cols-3 gap-2">
              {["Wallet", "Index", "Referrals"].map((item, index) => (
                <div key={item} className="rounded-xl border border-white/10 bg-white/5 px-3 py-3">
                  <span className="text-[0.625rem] font-semibold uppercase tracking-wider text-white/40">0{index + 1}</span>
                  <p className="mt-1 text-xs font-semibold text-white/75">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

export { IconSparkles as HeroSparkle };
