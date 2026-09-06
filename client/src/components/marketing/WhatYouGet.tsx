"use client";

import Link from "next/link";
import { IconArrowRight, IconCheck, IconShieldCheck, IconX } from "@tabler/icons-react";

import { Reveal, Section } from "@/components/site/primitives";
import { SheenButton } from "@/components/marketing/SheenButton";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------------ *
 * "What You Get" — a side-by-side stance rather than a feature matrix.
 *
 * The left card states what ORVANTA commits to; the right states the friction
 * this is built to avoid. Both columns describe structural choices, not
 * performance claims, and the right-hand side deliberately describes generic
 * industry patterns rather than naming or accusing any competitor.
 * ------------------------------------------------------------------ */

const commitments = [
  "Identity verified before a single dollar moves",
  "Tier minimums, maximums and maturity published upfront",
  "Wallet balance kept separate from allocated funds",
  "Every fee disclosed before you commit",
  "Role-based admin controls with an audit trail",
  "Support desk with tracked, referenced tickets",
];

const frictions = [
  "Funds accepted before identity checks complete",
  "Terms only revealed once you're mid-commitment",
  "Deposits and allocations pooled into one opaque balance",
  "Fees discovered on the statement, not before",
  "Shared admin logins with no traceability",
  "Support that disappears into an unmonitored inbox",
];

export function WhatYouGet({ id }: { id?: string }) {
  return (
    <Section id={id}>
      {/* Heading */}
      <div className="mx-auto max-w-3xl text-center">
        <Reveal>
          <span className="inline-flex items-center gap-2 rounded-full border border-brand/25 bg-card px-3.5 py-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-accent-foreground shadow-xs">
            <IconShieldCheck className="size-3.5 text-brand" stroke={2} />
            What You Get
          </span>
        </Reveal>
        <Reveal delay={0.05}>
          <h2 className="mt-6 font-display text-3xl font-semibold tracking-[-0.03em] text-foreground md:text-[2.75rem] md:leading-[1.1]">
            Built differently,{" "}
            <span className="text-gradient">on purpose.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg">
            The structural choices that separate a disciplined platform from an
            average one — and the friction they exist to remove.
          </p>
        </Reveal>
      </div>

      {/* Two stances */}
      <div className="mt-14 grid gap-5 lg:grid-cols-2 lg:gap-6">
        {/* ORVANTA */}
        <Reveal>
          <article className="relative flex h-full flex-col overflow-hidden rounded-xl border border-brand/30 bg-card shadow-lifted">
            {/* Gold hairline marks this as the recommended side */}
            <span
              aria-hidden
              className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-brand to-transparent"
            />
            <span
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-20 size-52 rounded-full bg-brand/8 blur-3xl"
            />

            <header className="relative border-b border-border p-6 sm:p-7">
              <div className="flex flex-wrap items-center gap-3">
                <h3 className="font-display text-xl font-semibold tracking-tight text-foreground">
                  ORVANTA
                </h3>
                <span className="rounded-full bg-brand px-2.5 py-1 text-[0.625rem] font-bold uppercase tracking-[0.12em] text-brand-foreground">
                  How we operate
                </span>
              </div>
              <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                Commitments that are enforced by the product, not promised in
                marketing copy.
              </p>
            </header>

            <ul className="relative flex-1 space-y-1 p-4 sm:p-5">
              {commitments.map((c) => (
                <li
                  key={c}
                  className="flex items-start gap-3 rounded-lg px-2.5 py-2.5 transition-colors hover:bg-accent/50"
                >
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-md bg-brand text-brand-foreground">
                    <IconCheck className="size-3.5" stroke={3} />
                  </span>
                  <span className="text-[0.875rem] leading-snug text-foreground">{c}</span>
                </li>
              ))}
            </ul>

            <footer className="relative p-4 pt-0 sm:p-5 sm:pt-0">
              <SheenButton href="/register" size="md" className="w-full">
                Open an account
                <IconArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </SheenButton>
            </footer>
          </article>
        </Reveal>

        {/* The usual friction */}
        <Reveal delay={0.08}>
          <article
            className={cn(
              "flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface-2/50 shadow-card"
            )}
          >
            <header className="border-b border-border p-6 sm:p-7">
              <h3 className="font-display text-xl font-semibold tracking-tight text-muted-foreground">
                The usual friction
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                Patterns investors commonly run into elsewhere — the reasons each
                choice on the left exists.
              </p>
            </header>

            <ul className="flex-1 space-y-1 p-4 sm:p-5">
              {frictions.map((f) => (
                <li key={f} className="flex items-start gap-3 px-2.5 py-2.5">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-md bg-muted text-muted-foreground/70">
                    <IconX className="size-3.5" stroke={3} />
                  </span>
                  <span className="text-[0.875rem] leading-snug text-muted-foreground">
                    {f}
                  </span>
                </li>
              ))}
            </ul>

            <footer className="p-4 pt-0 sm:p-5 sm:pt-0">
              <Link
                href="/platform"
                className="group inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-border bg-card text-sm font-semibold text-foreground transition-colors hover:border-brand/45 hover:bg-accent hover:text-brand"
              >
                See how we handle it
                <IconArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </footer>
          </article>
        </Reveal>
      </div>
    </Section>
  );
}
