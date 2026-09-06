"use client";

import * as React from "react";
import Link from "next/link";
import {
  IconArrowDownLeft,
  IconArrowUpRight,
  IconBriefcase,
  IconPlus,
  type IconProps,
} from "@tabler/icons-react";
import { Rise, Stagger } from "@/components/shared/motion";
import { cn } from "@/lib/utils";

type TablerIcon = React.ComponentType<IconProps>;

type Action = {
  label: string;
  hint: string;
  href: string;
  icon: TablerIcon;
};

/**
 * The four primary money movements. Every href targets a route/query the
 * existing pages already handle, so the click behaviour is unchanged.
 */
const ACTIONS: Action[] = [
  { label: "Add to Wallet", hint: "Move bonus into wallet", href: "/dashboard/wallet?action=bonus-add", icon: IconPlus },
  { label: "Withdraw", hint: "Request a payout", href: "/dashboard/wallet?action=withdraw", icon: IconArrowUpRight },
  { label: "Deposit", hint: "Fund your account", href: "/dashboard/wallet?action=deposit", icon: IconArrowDownLeft },
  { label: "My Portfolio", hint: "Review your Index", href: "/dashboard/index", icon: IconBriefcase },
];

export function QuickActions({ className }: { className?: string }) {
  return (
    <Stagger
      stagger={0.05}
      className={cn("grid grid-cols-2 gap-3 lg:grid-cols-4", className)}
    >
      {ACTIONS.map((action) => (
        <Rise key={action.href}>
          <Link
            href={action.href}
            className={cn(
              "group flex h-full flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-card",
              "transition-[transform,border-color,box-shadow] duration-300 ease-[cubic-bezier(.16,1,.3,1)]",
              "hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-lifted"
            )}
          >
            <span
              className={cn(
                "grid size-10 shrink-0 place-items-center rounded-xl bg-accent text-brand ring-1 ring-brand/15",
                "transition-colors group-hover:bg-brand group-hover:text-brand-foreground group-hover:ring-brand"
              )}
            >
              <action.icon className="size-5" stroke={1.75} />
            </span>
            <span className="min-w-0">
              <span className="block truncate text-[0.875rem] font-semibold text-foreground">
                {action.label}
              </span>
              <span className="mt-0.5 block truncate text-[0.6875rem] text-muted-foreground">
                {action.hint}
              </span>
            </span>
          </Link>
        </Rise>
      ))}
    </Stagger>
  );
}
