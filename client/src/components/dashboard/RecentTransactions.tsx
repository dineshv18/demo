"use client";

import * as React from "react";
import {
  IconArrowDownLeft,
  IconArrowsExchange,
  IconArrowUpRight,
  IconChartLine,
  IconGift,
  IconReceipt,
  IconSend,
  type IconProps,
} from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Rise, Stagger } from "@/components/shared/motion";
import { formatDateTime, formatMoney, statusTone, toneClasses } from "./format";
import { EmptyState, SectionCard } from "./SectionCard";

type TablerIcon = React.ComponentType<IconProps>;

/**
 * How each transaction type is presented: its icon, its human label, and
 * whether it adds to or removes from the user's balance. The `direction` here
 * is display only — it mirrors what the API already reports.
 */
const TYPE_META: Record<
  string,
  { label: string; icon: TablerIcon; direction: "in" | "out" | "neutral" }
> = {
  DEPOSIT: { label: "Deposit", icon: IconArrowDownLeft, direction: "in" },
  WITHDRAWAL: { label: "Withdrawal", icon: IconArrowUpRight, direction: "out" },
  BONUS_CREDIT: { label: "Bonus credit", icon: IconGift, direction: "in" },
  BONUS_WITHDRAWAL: { label: "Bonus withdrawal", icon: IconArrowUpRight, direction: "out" },
  BONUS_TRANSFER: { label: "Bonus to wallet", icon: IconArrowsExchange, direction: "neutral" },
  INTERNAL_TRANSFER_IN: { label: "Transfer received", icon: IconArrowDownLeft, direction: "in" },
  INTERNAL_TRANSFER_OUT: { label: "Transfer sent", icon: IconSend, direction: "out" },
  INDEX_INVEST: { label: "Index investment", icon: IconChartLine, direction: "out" },
  INDEX_WITHDRAW: { label: "Index withdrawal", icon: IconChartLine, direction: "in" },
};

export function transactionMeta(type: string) {
  return (
    TYPE_META[type] ?? {
      label: type.replace(/_/g, " ").toLowerCase(),
      icon: IconReceipt,
      direction: "neutral" as const,
    }
  );
}

export type TransactionRowData = {
  id: string;
  type: string;
  amount: number;
  status: string;
  date: string;
  description?: string | null;
};

/** One transaction line — shared by the dashboard list and the mobile feed. */
export function TransactionRow({
  tx,
  className,
}: {
  tx: TransactionRowData;
  className?: string;
}) {
  const meta = transactionMeta(tx.type);
  const status = statusTone(tx.status);
  const tone = toneClasses[status.tone];

  const dirClass =
    meta.direction === "in"
      ? "bg-success-soft text-success"
      : meta.direction === "out"
        ? "bg-accent text-brand"
        : "bg-muted text-muted-foreground";

  const sign = meta.direction === "in" ? "+" : meta.direction === "out" ? "−" : "";

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border border-transparent p-3 transition-colors",
        "hover:border-border hover:bg-surface-2/70",
        className
      )}
    >
      <span className={cn("grid size-10 shrink-0 place-items-center rounded-lg", dirClass)}>
        <meta.icon className="size-[18px]" stroke={1.75} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <p className="truncate text-[0.875rem] font-semibold capitalize text-foreground">
            {meta.label}
          </p>
          <Badge
            variant="outline"
            className={cn("border-transparent px-1.5 py-0", tone.bg, tone.text)}
          >
            {status.label}
          </Badge>
        </div>
        <p className="mt-0.5 truncate text-[0.6875rem] text-muted-foreground">
          {tx.description || formatDateTime(tx.date)}
        </p>
      </div>

      <p
        className={cn(
          "text-money shrink-0 text-sm",
          meta.direction === "in" ? "text-success" : "text-foreground"
        )}
      >
        {sign}
        {formatMoney(tx.amount)}
      </p>
    </div>
  );
}

export function RecentTransactions({
  transactions,
  className,
  viewAllHref = "/dashboard/transactions",
}: {
  transactions: TransactionRowData[];
  className?: string;
  viewAllHref?: string;
}) {
  return (
    <SectionCard
      title="Recent Transactions"
      icon={IconReceipt}
      actionHref={viewAllHref}
      className={className}
    >
      {transactions.length === 0 ? (
        <EmptyState
          icon={IconReceipt}
          title="No transactions yet"
          description="Your deposits, withdrawals and transfers will appear here."
        />
      ) : (
        <Stagger stagger={0.05} className="space-y-1">
          {transactions.map((tx) => (
            <Rise key={tx.id}>
              <TransactionRow tx={tx} />
            </Rise>
          ))}
        </Stagger>
      )}
    </SectionCard>
  );
}
