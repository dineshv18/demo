"use client";

import * as React from "react";
import Link from "next/link";
import { IconArrowRight, type IconProps } from "@tabler/icons-react";
import { cn } from "@/lib/utils";

type TablerIcon = React.ComponentType<IconProps>;

/**
 * The standard panel used for every titled block on the dashboard: consistent
 * radius, hairline border, header rhythm and optional "view all" affordance.
 * Using this rather than bare <Card> is what keeps the pages feeling like one
 * product.
 */
export function SectionCard({
  title,
  description,
  icon: Icon,
  action,
  actionHref,
  actionLabel = "View all",
  padded = true,
  className,
  headerClassName,
  bodyClassName,
  children,
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  icon?: TablerIcon;
  /** Custom header control. Takes precedence over `actionHref`. */
  action?: React.ReactNode;
  actionHref?: string;
  actionLabel?: string;
  padded?: boolean;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}) {
  const hasHeader = Boolean(title || description || action || actionHref);

  return (
    <section
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-card",
        className
      )}
    >
      {hasHeader && (
        <header
          className={cn(
            "flex items-start justify-between gap-3 px-4 pt-4 sm:px-6 sm:pt-5",
            headerClassName
          )}
        >
          <div className="flex min-w-0 items-start gap-3">
            {Icon && (
              <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-accent text-brand ring-1 ring-brand/15">
                <Icon className="size-[18px]" stroke={1.75} />
              </span>
            )}
            <div className="min-w-0">
              {title && <h2 className="text-section truncate">{title}</h2>}
              {description && (
                <p className="mt-0.5 text-xs text-muted-foreground sm:text-[0.8125rem]">
                  {description}
                </p>
              )}
            </div>
          </div>

          {action ??
            (actionHref && (
              <Link
                href={actionHref}
                className="group inline-flex shrink-0 items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-brand transition-colors hover:bg-accent"
              >
                {actionLabel}
                <IconArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            ))}
        </header>
      )}

      <div
        className={cn(
          padded && "px-4 pb-4 sm:px-6 sm:pb-6",
          hasHeader && padded && "pt-4 sm:pt-5",
          !hasHeader && padded && "pt-4 sm:pt-6",
          bodyClassName
        )}
      >
        {children}
      </div>
    </section>
  );
}

/** Page title block, used at the top of every dashboard route. */
export function PageHeading({
  title,
  description,
  eyebrow,
  actions,
  className,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  eyebrow?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        className
      )}
    >
      <div className="min-w-0">
        {eyebrow && <p className="text-eyebrow mb-1.5">{eyebrow}</p>}
        <h1 className="text-page-title text-foreground">{title}</h1>
        {description && (
          <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

/** Consistent empty state so no panel ever renders as a blank box. */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
}: {
  icon?: TablerIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border bg-surface-2/50 px-6 py-10 text-center",
        className
      )}
    >
      {Icon && (
        <span className="grid size-11 place-items-center rounded-lg bg-muted text-muted-foreground">
          <Icon className="size-5" stroke={1.75} />
        </span>
      )}
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {description && (
          <p className="mx-auto mt-1 max-w-xs text-xs text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
