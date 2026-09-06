"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { IconArrowRight, type IconProps } from "@tabler/icons-react";

import { Reveal, Section, SectionTitle } from "@/components/site/primitives";
import { cn } from "@/lib/utils";

type TablerIcon = React.ComponentType<IconProps>;

/* ------------------------------------------------------------------ *
 * Shared building blocks for the public marketing pages.
 *
 * Home, About, Platform and Contact all draw from these so a change to
 * spacing, radius or hover behaviour lands everywhere at once, instead of
 * being re-typed per page. Each block takes its content as props — none of
 * them hardcode copy.
 * ------------------------------------------------------------------ */

/** Gold-accented icon chip. The one place the brand colour is allowed to fill. */
export function IconChip({
  icon: Icon,
  size = "md",
  className,
}: {
  icon: TablerIcon;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const box = { sm: "size-9", md: "size-11", lg: "size-14" }[size];
  const glyph = { sm: "size-4", md: "size-5", lg: "size-7" }[size];

  return (
    <span
      className={cn(
        "grid shrink-0 place-items-center rounded-lg bg-accent text-brand ring-1 ring-brand/15",
        "transition-colors duration-300 group-hover:bg-brand group-hover:text-brand-foreground group-hover:ring-brand",
        box,
        className
      )}
    >
      <Icon className={glyph} stroke={1.75} />
    </span>
  );
}

export type FeatureItem = {
  icon: TablerIcon;
  title: string;
  desc: string;
  /** Optional secondary note rendered in a sunken box under the description. */
  note?: string;
  href?: string;
};

/**
 * One card in a feature grid. Numbered when `index` is supplied, with a gold
 * underline that draws in on hover.
 */
export function FeatureCard({
  item,
  index,
  className,
}: {
  item: FeatureItem;
  index?: number;
  className?: string;
}) {
  const body = (
    <>
      <div className="flex items-start justify-between gap-3">
        <IconChip icon={item.icon} />
        {index !== undefined && (
          <span
            aria-hidden
            className="font-display text-[0.6875rem] font-semibold tracking-[0.2em] text-brand/40"
          >
            {String(index).padStart(2, "0")}
          </span>
        )}
      </div>

      <h3 className="mt-5 font-display text-lg font-semibold tracking-tight text-foreground">
        {item.title}
      </h3>
      <p className="mt-2.5 flex-1 text-sm leading-relaxed text-muted-foreground">
        {item.desc}
      </p>

      {item.note && (
        <p className="mt-4 rounded-lg border border-border bg-surface-2/70 p-3.5 text-xs leading-relaxed text-muted-foreground">
          {item.note}
        </p>
      )}

      <span
        aria-hidden
        className="absolute inset-x-6 bottom-0 h-px origin-left scale-x-0 bg-linear-to-r from-brand to-transparent transition-transform duration-500 group-hover:scale-x-100"
      />
    </>
  );

  const shell = cn(
    "group relative flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card p-6 shadow-card",
    "transition-[transform,border-color,box-shadow] duration-300 ease-[cubic-bezier(.16,1,.3,1)]",
    "hover:-translate-y-0.5 hover:border-brand/35 hover:shadow-lifted",
    className
  );

  if (item.href) {
    return (
      <Link href={item.href} className={shell}>
        {body}
      </Link>
    );
  }

  return <div className={shell}>{body}</div>;
}

/**
 * A titled grid of feature cards — the workhorse section on every public page.
 * `columns` controls the widest breakpoint; it always stacks to one on phones.
 */
export function FeatureGrid({
  eyebrow,
  title,
  description,
  items,
  columns = 3,
  numbered = false,
  align = "center",
  id,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  items: FeatureItem[];
  columns?: 2 | 3 | 4;
  numbered?: boolean;
  align?: "center" | "left";
  id?: string;
}) {
  const cols = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 lg:grid-cols-4",
  }[columns];

  return (
    <Section id={id}>
      <SectionTitle
        eyebrow={eyebrow}
        title={title}
        description={description}
        align={align}
      />
      <div className={cn("mt-14 grid grid-cols-1 gap-5 sm:gap-6", cols)}>
        {items.map((item, i) => (
          <Reveal key={item.title} delay={i * 0.05}>
            <FeatureCard item={item} index={numbered ? i + 1 : undefined} />
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/**
 * Numbered process steps with connector rules between them on wide screens.
 * Used for "How It Works" and any other ordered walkthrough.
 */
export function StepGrid({
  eyebrow,
  title,
  description,
  steps,
  id,
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  steps: { icon: TablerIcon; title: string; desc: string }[];
  id?: string;
}) {
  return (
    <Section id={id}>
      <SectionTitle eyebrow={eyebrow} title={title} description={description} />

      <ol className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4">
        {steps.map((s, i) => (
          <Reveal key={s.title} delay={i * 0.07}>
            <li className="group relative flex h-full flex-col rounded-xl border border-border bg-card p-6 shadow-card transition-[transform,border-color] duration-300 hover:-translate-y-0.5 hover:border-brand/35">
              {i < steps.length - 1 && (
                <span
                  aria-hidden
                  className="absolute -right-3 top-11 hidden h-px w-6 bg-border lg:block"
                />
              )}
              <div className="flex items-center justify-between">
                <IconChip icon={s.icon} />
                <span
                  aria-hidden
                  className="font-display text-[0.6875rem] font-semibold tracking-[0.2em] text-brand/40"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <h3 className="mt-5 font-display text-lg font-semibold tracking-tight text-foreground">
                {s.title}
              </h3>
              <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">
                {s.desc}
              </p>
            </li>
          </Reveal>
        ))}
      </ol>
    </Section>
  );
}

/**
 * Two-column split: copy on one side, any visual on the other. Reversible, so
 * consecutive uses can alternate without duplicating the markup.
 */
export function SplitSection({
  eyebrow,
  title,
  description,
  cta,
  visual,
  reversed = false,
  id,
}: {
  eyebrow?: string;
  title: ReactNode;
  description: string;
  cta?: { href: string; label: string };
  visual: ReactNode;
  reversed?: boolean;
  id?: string;
}) {
  return (
    <Section id={id}>
      <div
        className={cn(
          "grid items-center gap-10 lg:grid-cols-2 lg:gap-14",
          reversed && "lg:[&>*:first-child]:order-2"
        )}
      >
        <Reveal>
          <div>
            {eyebrow && (
              <span className="inline-flex items-center gap-2 rounded-full border border-brand/25 bg-accent px-3.5 py-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-accent-foreground">
                <span aria-hidden className="size-1.5 rounded-full bg-brand" />
                {eyebrow}
              </span>
            )}
            <h2 className="mt-5 font-display text-3xl font-semibold leading-tight tracking-[-0.03em] text-foreground md:text-4xl">
              {title}
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground">
              {description}
            </p>
            {cta && (
              <Link
                href={cta.href}
                className="btn-glow btn-glow-hover group mt-8 inline-flex items-center gap-2 rounded-xl px-7 py-3.5 text-sm font-semibold"
              >
                {cta.label}
                <IconArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            )}
          </div>
        </Reveal>

        <Reveal delay={0.1} y={30}>
          {visual}
        </Reveal>
      </div>
    </Section>
  );
}

/**
 * Full-bleed navy statement panel — the page's emphatic moment.
 * Deliberately the only place a large dark block appears mid-page.
 */
export function StatementSection({
  icon: Icon,
  lead,
  accent,
  body,
  id,
}: {
  icon: TablerIcon;
  lead: string;
  /** Gold-highlighted tail of the sentence. */
  accent: string;
  body?: string;
  id?: string;
}) {
  return (
    <Section id={id}>
      <Reveal>
        <div className="surface-navy relative overflow-hidden rounded-2xl p-10 text-center md:p-16">
          <span aria-hidden className="bg-ticker pointer-events-none absolute inset-0 opacity-25" />
          <span
            aria-hidden
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-brand/50 to-transparent"
          />
          <div className="relative mx-auto max-w-3xl">
            <Icon className="mx-auto mb-6 size-9 text-brand" stroke={1.5} />
            <p className="font-display text-2xl font-semibold leading-snug tracking-[-0.025em] text-white md:text-[2.5rem] md:leading-[1.15]">
              {lead} <span className="text-gold-400">{accent}</span>
            </p>
            {body && (
              <p className="mx-auto mt-6 max-w-xl text-sm leading-relaxed text-white/60">
                {body}
              </p>
            )}
          </div>
        </div>
      </Reveal>
    </Section>
  );
}

/**
 * Seamless fact strip. Values are short labels, never invented metrics —
 * callers pass structural facts the product actually enforces.
 */
export function FactStrip({
  facts,
}: {
  facts: { icon: TablerIcon; value: string; label: string; detail: string }[];
}) {
  return (
    <div className="relative border-y border-border bg-card/50">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-px overflow-hidden bg-border sm:grid-cols-2 lg:grid-cols-4">
        {facts.map((f, i) => (
          <Reveal key={f.label} delay={i * 0.06} className="bg-background">
            <div className="group h-full bg-card/50 p-6 transition-colors hover:bg-accent/40 lg:p-8">
              <IconChip icon={f.icon} size="sm" />
              <p className="mt-5 font-display text-2xl font-semibold tracking-tight text-foreground">
                {f.value}
              </p>
              <p className="mt-0.5 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-brand">
                {f.label}
              </p>
              <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground">
                {f.detail}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
