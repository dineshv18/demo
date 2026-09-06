"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  IconAlertCircle, IconArrowDownLeft, IconArrowUpRight,
  IconBan, IconChartLine, IconCheck, IconChevronLeft, IconChevronRight,
  IconClock, IconGift, IconArrowsExchange, IconReceipt2, IconX,
  type IconProps,
} from "@tabler/icons-react";

import { walletAPI, type TransactionEvent } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageHeading, EmptyState } from "@/components/dashboard/SectionCard";
import { TableSkeleton } from "@/components/dashboard/Skeletons";
import { EASE_OUT } from "@/components/shared/motion";
import { formatMoney } from "@/components/dashboard/format";

type TablerIcon = React.ComponentType<IconProps>;
type FilterKey = "ALL" | "DEPOSIT" | "WITHDRAWAL" | "INDEX" | "BONUS";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "DEPOSIT", label: "Deposits" },
  { key: "WITHDRAWAL", label: "Withdrawals" },
  { key: "INDEX", label: "Index" },
  { key: "BONUS", label: "Bonus" },
];

const TYPE_META: Record<
  TransactionEvent["type"],
  { label: string; icon: TablerIcon; color: string; bg: string }
> = {
  DEPOSIT: { label: "Wallet Deposit", icon: IconArrowDownLeft, color: "text-success", bg: "bg-success-soft" },
  WITHDRAWAL: { label: "Wallet Withdrawal", icon: IconArrowUpRight, color: "text-brand", bg: "bg-accent" },
  INDEX_INVEST: { label: "Index Investment", icon: IconChartLine, color: "text-brand", bg: "bg-accent" },
  INDEX_WITHDRAW: { label: "Index Payout", icon: IconChartLine, color: "text-info", bg: "bg-info-soft" },
  BONUS_CREDIT: { label: "Bonus Credited", icon: IconGift, color: "text-success", bg: "bg-success-soft" },
  BONUS_WITHDRAWAL: { label: "Bonus Withdrawal", icon: IconArrowUpRight, color: "text-brand", bg: "bg-accent" },
  BONUS_TRANSFER: { label: "Bonus to Wallet", icon: IconArrowDownLeft, color: "text-success", bg: "bg-success-soft" },
  INTERNAL_TRANSFER_OUT: { label: "Sent to Another User", icon: IconArrowsExchange, color: "text-brand", bg: "bg-accent" },
  INTERNAL_TRANSFER_IN: { label: "Received from Another User", icon: IconArrowsExchange, color: "text-success", bg: "bg-success-soft" },
};

const STATUS_META: Record<
  TransactionEvent["status"],
  { label: string; className: string; icon: TablerIcon }
> = {
  PENDING: { label: "Pending", className: "bg-warning-soft text-warning", icon: IconClock },
  COMPLETED: { label: "Completed", className: "bg-success-soft text-success", icon: IconCheck },
  FAILED: { label: "Failed", className: "bg-danger-soft text-danger", icon: IconX },
  CANCELLED: { label: "Cancelled", className: "bg-muted text-muted-foreground", icon: IconBan },
};

function StatusBadge({ status }: { status: TransactionEvent["status"] }) {
  const s = STATUS_META[status];
  const Icon = s.icon;
  return (
    <Badge variant="outline" className={cn("gap-1 border-transparent", s.className)}>
      <Icon size={10} stroke={2.5} /> {s.label}
    </Badge>
  );
}

function formatDateTime(d: string) {
  return new Date(d).toLocaleString("en-US", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

const CREDIT_TYPES = new Set<TransactionEvent["type"]>([
  "DEPOSIT",
  "INDEX_WITHDRAW",
  "BONUS_CREDIT",
  "BONUS_TRANSFER",
  "INTERNAL_TRANSFER_IN",
]);

/**
 * The fee breakdown the API attaches to Index events — shown verbatim so the
 * arithmetic on screen matches what the server recorded.
 */
function FeeNote({ tx }: { tx: TransactionEvent }) {
  const isIndex = tx.type === "INDEX_INVEST" || tx.type === "INDEX_WITHDRAW";
  if (!isIndex || !tx.feeAmount) return null;

  return (
    <p className="mt-1 text-[0.6875rem] text-muted-foreground">
      {formatMoney(tx.grossAmount ?? 0)} −{" "}
      <span className="text-warning">
        {formatMoney(tx.feeAmount)}{" "}
        {tx.type === "INDEX_INVEST" ? "maintenance fee" : "exit fee"}
      </span>{" "}
      = <span className="font-semibold text-foreground">
        {tx.netAmount != null ? formatMoney(tx.netAmount) : "—"}
      </span>
    </p>
  );
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<TransactionEvent[]>([]);
  const [filter, setFilter] = useState<FilterKey>("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const reduce = useReducedMotion();

  const limit = 30;

  const fetchPage = useCallback(async (p: number, f: FilterKey) => {
    setLoading(true);
    setError("");
    try {
      const res = await walletAPI.getTransactionHistory(p, limit, f === "ALL" ? undefined : f);
      setTransactions(res.transactions);
      setTotalPages(res.totalPages);
      setTotal(res.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchPage(page, filter); }, [page, filter, fetchPage]);

  const changeFilter = (f: FilterKey) => {
    setFilter(f);
    setPage(1);
  };

  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PageHeading
        eyebrow="Activity"
        title="Transactions"
        description="Every deposit, withdrawal, transfer and Index movement in one place."
      />

      {/* Filters */}
      <div
        role="tablist"
        aria-label="Filter transactions by type"
        className="no-x-overflow inline-flex max-w-full gap-1 overflow-x-auto rounded-xl border border-border bg-card p-1"
      >
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              role="tab"
              aria-selected={active}
              onClick={() => changeFilter(f.key)}
              className={cn(
                "relative min-h-9 whitespace-nowrap rounded-lg px-3 py-2 text-xs font-semibold transition-colors sm:px-4 sm:text-sm",
                active ? "text-brand" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {active &&
                (reduce ? (
                  <span className="absolute inset-0 rounded-lg bg-accent ring-1 ring-brand/20" />
                ) : (
                  <motion.span
                    layoutId="tx-filter"
                    transition={{ duration: 0.3, ease: EASE_OUT }}
                    className="absolute inset-0 rounded-lg bg-accent ring-1 ring-brand/20"
                  />
                ))}
              <span className="relative">{f.label}</span>
            </button>
          );
        })}
      </div>

      {error && (
        <div role="alert" className="flex items-center gap-3 rounded-xl border border-danger/25 bg-danger-soft px-4 py-3 text-sm text-danger">
          <IconAlertCircle className="size-4 shrink-0" /> {error}
          <Button
            variant="link"
            size="sm"
            onClick={() => fetchPage(page, filter)}
            className="ml-auto h-auto shrink-0 p-0 text-xs font-semibold text-danger"
          >
            Retry
          </Button>
        </div>
      )}

      {loading ? (
        <TableSkeleton rows={8} />
      ) : transactions.length === 0 ? (
        <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
          <EmptyState
            icon={IconReceipt2}
            title="No transactions found"
            description={
              filter === "ALL"
                ? "Your activity will show up here as soon as funds start moving."
                : "Try a different filter, or move to another page."
            }
          />
        </div>
      ) : (
        <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
          {/* Desktop: financial table */}
          <table className="hidden w-full text-sm md:table">
            <caption className="sr-only">Your transaction history</caption>
            <thead>
              <tr className="border-b border-border bg-surface-2/60 text-left">
                <th scope="col" className="px-6 py-3.5 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Transaction
                </th>
                <th scope="col" className="px-4 py-3.5 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Date
                </th>
                <th scope="col" className="px-4 py-3.5 text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Status
                </th>
                <th scope="col" className="px-6 py-3.5 text-right text-[0.6875rem] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
                  Amount
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {transactions.map((tx) => {
                const meta = TYPE_META[tx.type];
                const Icon = meta.icon;
                const isCredit = CREDIT_TYPES.has(tx.type);
                return (
                  <tr key={tx.id} className="transition-colors hover:bg-surface-2/50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className={cn("grid size-10 shrink-0 place-items-center rounded-lg", meta.bg)}>
                          <Icon className={cn("size-[18px]", meta.color)} stroke={1.75} />
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-semibold text-foreground">
                            {tx.description || meta.label}
                          </span>
                          <FeeNote tx={tx} />
                        </span>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-4 py-4 text-xs text-muted-foreground">
                      {formatDateTime(tx.date)}
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={tx.status} />
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={cn("text-money", isCredit ? "text-success" : "text-foreground")}>
                        {tx.amount === null
                          ? "—"
                          : `${isCredit ? "+" : "−"}${formatMoney(tx.amount)}`}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {/* Mobile: stacked cards */}
          <ul className="divide-y divide-border md:hidden">
            {transactions.map((tx) => {
              const meta = TYPE_META[tx.type];
              const Icon = meta.icon;
              const isCredit = CREDIT_TYPES.has(tx.type);
              return (
                <li key={tx.id} className="flex items-start gap-3 p-4">
                  <span className={cn("grid size-10 shrink-0 place-items-center rounded-lg", meta.bg)}>
                    <Icon className={cn("size-[18px]", meta.color)} stroke={1.75} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="min-w-0 truncate text-sm font-semibold text-foreground">
                        {tx.description || meta.label}
                      </p>
                      <span className={cn("text-money shrink-0 text-sm", isCredit ? "text-success" : "text-foreground")}>
                        {tx.amount === null
                          ? "—"
                          : `${isCredit ? "+" : "−"}${formatMoney(tx.amount)}`}
                      </span>
                    </div>
                    <FeeNote tx={tx} />
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <StatusBadge status={tx.status} />
                      <span className="shrink-0 text-[0.6875rem] text-muted-foreground">
                        {formatDateTime(tx.date)}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </section>
      )}

      {/* Pagination */}
      {!loading && total > 0 && (
        <nav
          aria-label="Transaction pages"
          className="flex flex-col items-center justify-between gap-3 sm:flex-row"
        >
          <p className="text-xs text-muted-foreground">
            Page <span className="font-semibold text-foreground">{page}</span> of {totalPages} ·{" "}
            <span className="font-semibold text-foreground">{total}</span> transactions
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(page - 1)}
              disabled={page === 1}
              className="gap-1"
            >
              <IconChevronLeft className="size-3.5" /> Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(page + 1)}
              disabled={page === totalPages}
              className="gap-1"
            >
              Next <IconChevronRight className="size-3.5" />
            </Button>
          </div>
        </nav>
      )}
    </div>
  );
}
