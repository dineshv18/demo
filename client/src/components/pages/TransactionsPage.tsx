"use client";

import { useState, useEffect, useCallback } from "react";
import {
  IconLoader2, IconAlertCircle, IconArrowDownLeft, IconArrowUpRight,
  IconChartLine, IconChevronLeft, IconChevronRight, IconReceipt2,
  IconClock, IconCheck, IconX, IconBan, IconGift,
} from "@tabler/icons-react";
import { walletAPI, type TransactionEvent } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type FilterKey = "ALL" | "DEPOSIT" | "WITHDRAWAL" | "INDEX" | "BONUS";

const FILTERS: { key: FilterKey; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "DEPOSIT", label: "Deposits" },
  { key: "WITHDRAWAL", label: "Withdrawals" },
  { key: "INDEX", label: "Index" },
  { key: "BONUS", label: "Bonus" },
];

const TYPE_META: Record<TransactionEvent["type"], { label: string; icon: typeof IconArrowDownLeft; color: string; bg: string }> = {
  DEPOSIT: { label: "Wallet Deposit", icon: IconArrowDownLeft, color: "text-emerald-600", bg: "bg-emerald-500/10" },
  WITHDRAWAL: { label: "Wallet Withdrawal", icon: IconArrowUpRight, color: "text-red-500", bg: "bg-red-500/10" },
  INDEX_INVEST: { label: "Index Investment", icon: IconChartLine, color: "text-brand", bg: "bg-brand/10" },
  INDEX_WITHDRAW: { label: "Index Payout", icon: IconChartLine, color: "text-teal-500", bg: "bg-teal-500/10" },
  BONUS_CREDIT: { label: "Bonus Credited", icon: IconGift, color: "text-amber-500", bg: "bg-amber-500/10" },
  BONUS_WITHDRAWAL: { label: "Bonus Withdrawal", icon: IconArrowUpRight, color: "text-red-500", bg: "bg-red-500/10" },
  BONUS_TRANSFER: { label: "Bonus to Wallet", icon: IconArrowDownLeft, color: "text-emerald-600", bg: "bg-emerald-500/10" },
};

const STATUS_META: Record<TransactionEvent["status"], { label: string; color: string; bg: string; icon: typeof IconClock }> = {
  PENDING: { label: "Pending", color: "text-amber-600", bg: "bg-amber-100", icon: IconClock },
  COMPLETED: { label: "Completed", color: "text-emerald-600", bg: "bg-emerald-100", icon: IconCheck },
  FAILED: { label: "Failed", color: "text-red-600", bg: "bg-red-100", icon: IconX },
  CANCELLED: { label: "Cancelled", color: "text-gray-600", bg: "bg-gray-100", icon: IconBan },
};

function StatusBadge({ status }: { status: TransactionEvent["status"] }) {
  const s = STATUS_META[status];
  const Icon = s.icon;
  return (
    <Badge variant="outline" className={`gap-1 border-transparent font-semibold ${s.color} ${s.bg}`}>
      <Icon size={10} /> {s.label}
    </Badge>
  );
}

function formatDateTime(d: string) {
  return new Date(d).toLocaleString("en-US", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function RowSkeleton() {
  return (
    <div className="flex items-center gap-3 p-4 animate-pulse">
      <div className="h-10 w-10 rounded-full bg-muted shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-40 bg-muted rounded" />
        <div className="h-3 w-28 bg-muted rounded" />
      </div>
      <div className="h-5 w-20 bg-muted rounded-full" />
    </div>
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
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">Transactions</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Every deposit, withdrawal, and Index investment in one place.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="inline-flex rounded-xl border border-border p-1 bg-card overflow-x-auto max-w-full">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => changeFilter(f.key)}
            className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all min-h-9 ${
              filter === f.key ? "bg-brand/10 text-brand" : "text-muted-foreground hover:bg-accent"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <IconAlertCircle className="h-4 w-4 shrink-0" /> {error}
          <Button variant="link" size="sm" onClick={() => fetchPage(page, filter)} className="ml-auto h-auto p-0 text-xs font-semibold text-destructive shrink-0">Retry</Button>
        </div>
      )}

      {/* List */}
      <Card className="p-0 gap-0 overflow-hidden">
        {loading ? (
          <div className="divide-y divide-border">
            {Array.from({ length: 8 }).map((_, i) => <RowSkeleton key={i} />)}
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-muted mb-4">
              <IconReceipt2 className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-medium text-foreground">No transactions found</p>
            <p className="text-xs text-muted-foreground mt-1">
              {filter === "ALL" ? "Your activity will show up here." : "Try a different filter or page."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {transactions.map((tx) => {
              const meta = TYPE_META[tx.type];
              const Icon = meta.icon;
              const isCredit = tx.type === "DEPOSIT" || tx.type === "INDEX_WITHDRAW" || tx.type === "BONUS_CREDIT" || tx.type === "BONUS_TRANSFER";
              return (
                <div key={tx.id} className="flex items-center gap-3 p-4 hover:bg-accent/40 transition-colors">
                  <div className={`grid h-10 w-10 place-items-center rounded-full shrink-0 ${meta.bg}`}>
                    <Icon className={`h-5 w-5 ${meta.color}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {tx.description || meta.label}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">{formatDateTime(tx.date)}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-semibold ${isCredit ? "text-emerald-600" : "text-foreground"}`}>
                      {tx.amount === null ? "—" : `${isCredit ? "+" : "−"}$${tx.amount.toFixed(2)}`}
                    </p>
                    <div className="mt-1">
                      <StatusBadge status={tx.status} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Pagination */}
      {!loading && total > 0 && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            Page {page} of {totalPages} · {total} total
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(page - 1)}
              disabled={page === 1}
              className="gap-1"
            >
              <IconChevronLeft className="h-3.5 w-3.5" /> Prev
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => goToPage(page + 1)}
              disabled={page === totalPages}
              className="gap-1"
            >
              Next <IconChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {loading && (
        <div className="flex items-center justify-center py-2">
          <IconLoader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
      )}
    </div>
  );
}
