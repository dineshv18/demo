"use client";

import Link from "next/link";
import {
  IconArrowRight,
  IconChartLine,
  IconClock,
  IconEye,
  IconLock,
  IconShieldCheck,
  IconSparkles,
  IconUsers,
  type IconProps,
} from "@tabler/icons-react";

import { Reveal, Section } from "../site/primitives";
import { FeatureGrid, StatementSection } from "@/components/marketing/sections";
import { CTASection } from "@/components/marketing/CTASection";
import { SheenButton } from "@/components/marketing/SheenButton";

type TablerIcon = React.ComponentType<IconProps>;

const principles: { icon: TablerIcon; title: string; desc: string }[] = [
  {
    icon: IconEye,
    title: "Transparency First",
    desc: "Every tier, fee, and referral payout is published where you can see it — in your dashboard, not in fine print you find later.",
  },
  {
    icon: IconShieldCheck,
    title: "Security By Default",
    desc: "KYC verification, segregated wallet tracking, and role-based admin controls aren't add-ons — they're how the platform is built.",
  },
  {
    icon: IconUsers,
    title: "Investor-First",
    desc: "Features ship because they help investors understand and track their capital — not because they look good in a pitch deck.",
  },
];

const whyUs: { icon: TablerIcon; title: string; desc: string }[] = [
  {
    icon: IconChartLine,
    title: "Real-Time Visibility",
    desc: "Your Index performance, wallet balance, and transaction history update live — you're never guessing where things stand.",
  },
  {
    icon: IconLock,
    title: "Verified, Not Anonymous",
    desc: "Every account on the platform completes KYC. That protects you as much as it protects the platform.",
  },
  {
    icon: IconUsers,
    title: "A Referral Program That Pays Out",
    desc: "Five levels deep, tracked automatically, with payouts visible in your dashboard the moment they're earned.",
  },
];

/**
 * Structural facts only — the same discipline as the homepage's fact strip.
 * No user counts, no AUM, no engagement percentages: nothing here that would
 * need a source this page can't cite.
 */
const facts: { value: string; label: string }[] = [
  { value: "KYC", label: "Verified before funds move" },
  { value: "5", label: "Referral levels tracked" },
  { value: "100%", label: "Fees disclosed upfront" },
  { value: "Live", label: "Dashboard, not statements" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* HERO — asymmetric split, organic-cut visual on the right */}
      <Section className="!pb-0 !pt-6 lg:!pt-10">
        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-7">
            <Reveal>
              <span className="inline-flex items-center gap-2 rounded-full border border-brand/25 bg-accent px-3.5 py-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-accent-foreground">
                <span aria-hidden className="size-1.5 rounded-full bg-brand" />
                Our Story
              </span>
            </Reveal>
            <Reveal delay={0.05}>
              <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.04] tracking-[-0.035em] text-foreground md:text-5xl lg:text-6xl">
                Built for investors
                <span className="block text-gradient">who read the fine print.</span>
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
                ORVANTA Financial was built on a simple premise: independent
                investors deserve the same transparency and security standards as
                institutional platforms — a KYC-verified account, published tier
                terms, and a dashboard that tells you exactly where your capital
                stands.
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <SheenButton href="/register" size="md">
                  Open an account
                  <IconArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </SheenButton>
                <Link
                  href="/platform"
                  className="text-sm font-semibold text-foreground underline decoration-border underline-offset-4 transition-colors hover:text-brand hover:decoration-brand"
                >
                  See the platform
                </Link>
              </div>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-8 text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-brand">
                Growing Wealth. Building Futures.
              </p>
            </Reveal>
          </div>

          {/* Organic-shaped visual — a navy panel with a bitten corner, echoing
              the reference layout without borrowing anyone's stock imagery. */}
          <div className="lg:col-span-5">
            <Reveal delay={0.12} y={30}>
              <div
                className="surface-navy relative aspect-4/5 overflow-hidden p-8 sm:p-10"
                style={{
                  clipPath:
                    "polygon(0% 0%, 78% 0%, 78% 18%, 100% 18%, 100% 100%, 0% 100%)",
                }}
              >
                <span
                  aria-hidden
                  className="bg-ticker pointer-events-none absolute inset-0 opacity-30"
                />
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-brand/12 blur-3xl"
                />

                <div className="relative flex h-full flex-col justify-between">
                  <IconShieldCheck className="size-10 text-brand" stroke={1.5} />
                  <div>
                    <p className="font-display text-2xl font-semibold leading-snug text-white">
                      Verification first.
                      <span className="block text-gold-400">Always.</span>
                    </p>
                    <p className="mt-4 text-sm leading-relaxed text-white/60">
                      No account moves funds until identity checks clear — the
                      baseline every other feature is built on top of.
                    </p>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>

        {/* Fact strip — sits directly under the hero, seamless like Home's */}
        <Reveal delay={0.25}>
          <dl className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-border bg-border sm:grid-cols-4">
            {facts.map((f) => (
              <div key={f.label} className="bg-card p-5 text-center sm:p-6">
                <dt className="sr-only">{f.label}</dt>
                <dd className="font-display text-2xl font-semibold tracking-tight text-brand sm:text-3xl">
                  {f.value}
                </dd>
                <p className="mt-1.5 text-[0.6875rem] font-medium leading-snug text-muted-foreground">
                  {f.label}
                </p>
              </div>
            ))}
          </dl>
        </Reveal>
      </Section>

      {/* WHAT WE'RE BUILDING */}
      <Section>
        <Reveal>
          <div className="grid gap-10 rounded-xl border border-border bg-card p-8 shadow-card lg:grid-cols-12 lg:p-12">
            <div className="lg:col-span-5">
              <span aria-hidden className="gold-rule block w-14" />
              <h2 className="mt-5 font-display text-3xl font-semibold leading-snug tracking-[-0.03em] text-foreground md:text-4xl">
                What we&apos;re building
              </h2>
            </div>
            <div className="grid gap-6 text-sm leading-relaxed text-muted-foreground sm:grid-cols-2 lg:col-span-7">
              <p>
                ORVANTA Financial is a KYC-verified Index investing platform. Investors
                deposit into a wallet, choose from tiered investment plans with clearly
                published minimums, maximums and maturity periods, and track performance
                from a real-time dashboard.
              </p>
              <p>
                We built the wallet, the tier system, and the referral program around one
                idea: an investor should never have to guess. Terms are disclosed upfront,
                fees are published, and every transaction is logged and visible in your
                account history.
              </p>
            </div>
          </div>
        </Reveal>
      </Section>

      {/* PRINCIPLES */}
      <FeatureGrid
        eyebrow="Core Principles"
        title={
          <>
            What guides <span className="text-gradient">how we build.</span>
          </>
        }
        description="These aren&apos;t slogans — they&apos;re the standard every feature on the platform is measured against."
        items={principles}
        columns={3}
        numbered
      />

      {/* TIMELINE — the onboarding sequence, framed as a process rather than
          a history the company doesn't have yet. */}
      <Section>
        <div className="mx-auto max-w-3xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-brand/25 bg-accent px-3.5 py-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-accent-foreground">
            <IconClock className="size-3.5 text-brand" stroke={2} />
            How Accounts Are Built
          </span>
          <h2 className="mt-5 font-display text-3xl font-semibold tracking-[-0.03em] text-foreground md:text-[2.75rem] md:leading-[1.1]">
            The same process,{" "}
            <span className="text-gradient">every single time.</span>
          </h2>
        </div>

        <div className="relative mx-auto mt-14 max-w-2xl">
          {/* Connecting spine */}
          <span
            aria-hidden
            className="absolute left-[15px] top-2 bottom-2 w-px bg-border sm:left-1/2 sm:-translate-x-1/2"
          />
          <ol className="space-y-8">
            {[
              { title: "Identity verified", desc: "KYC clears before any deposit is accepted." },
              { title: "Wallet funded", desc: "Crypto or bank transfer, tracked as one balance." },
              { title: "Tier published", desc: "Minimum, maximum and maturity shown before you commit." },
              { title: "Position tracked", desc: "Live in your dashboard, from day one." },
            ].map((step, i) => (
              <Reveal key={step.title} delay={i * 0.08}>
                <li className="relative flex items-start gap-5 pl-10 sm:pl-0">
                  <span
                    className={
                      "absolute left-0 top-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-brand text-[0.75rem] font-bold text-brand-foreground ring-4 ring-background sm:relative sm:left-auto"
                    }
                  >
                    {i + 1}
                  </span>
                  <div className="rounded-xl border border-border bg-card p-4 shadow-card sm:flex-1">
                    <p className="font-display text-[0.9375rem] font-semibold text-foreground">
                      {step.title}
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">{step.desc}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </Section>

      {/* PULL QUOTE */}
      <StatementSection
        icon={IconSparkles}
        lead="We publish what other platforms bury in fine print —"
        accent="that&apos;s the whole philosophy."
        body="Transparent terms, verified accounts, and a dashboard that tells the truth about your capital — measured against the same standard on every feature we ship."
      />

      {/* WHY CHOOSE ORVANTA */}
      <Section>
        <Reveal>
          <div className="grid items-center gap-10 rounded-xl border border-border bg-card p-8 shadow-card lg:grid-cols-2 md:p-12">
            <div className="space-y-5">
              <span className="inline-flex items-center gap-2 rounded-full border border-brand/25 bg-accent px-3.5 py-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-accent-foreground">
                Why Choose ORVANTA
              </span>
              <h2 className="font-display text-3xl font-semibold tracking-[-0.03em] text-foreground md:text-4xl">
                Built for investors who read the fine print.
              </h2>
              <p className="text-sm leading-relaxed text-muted-foreground md:text-base">
                Because we published it in plain view instead. If you want a platform
                where verification is real, terms are disclosed, and your dashboard tells
                the truth about your account, that&apos;s what we built.
              </p>
              <Link
                href="/platform"
                className="group inline-flex items-center gap-2 text-sm font-semibold text-brand"
              >
                See how the platform works
                <IconArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>

            <ul className="space-y-4">
              {whyUs.map((w) => (
                <li
                  key={w.title}
                  className="flex items-start gap-4 rounded-xl border border-border bg-surface-2/60 p-4 transition-colors hover:border-brand/35"
                >
                  <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-accent text-brand ring-1 ring-brand/15">
                    <w.icon className="size-[18px]" stroke={1.75} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{w.title}</p>
                    <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      {w.desc}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </Reveal>
      </Section>

      {/* CTA */}
      <Section className="!pt-6">
        <Reveal>
          <CTASection
            eyebrow="Open an account"
            title={
              <>
                Ready to invest with{" "}
                <span className="text-gold-400">full visibility</span>?
              </>
            }
            description="Complete verification, fund your wallet, and track every tier, balance and transaction from one dashboard."
          />
        </Reveal>
      </Section>
    </div>
  );
}
