import { useState, useEffect, useCallback, useMemo } from "react";
import {
  IconChartLine,
  IconSearch,
  IconAlertCircle,
  IconRefresh,
  IconClock,
  IconCheck,
  IconX,
  IconReceiptTax,
} from "@tabler/icons-react";
import { indexAPI, type IndexInvestmentRecord } from "../services/api";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../components/ui/table";

type StatusFilter = "ALL" | "ACTIVE" | "MATURED" | "CANCELLED";
const statusFilters: StatusFilter[] = ["ALL", "ACTIVE", "MATURED", "CANCELLED"];

function statusBadge(status: IndexInvestmentRecord["status"]) {
  const cfg: Record<IndexInvestmentRecord["status"], string> = {
    ACTIVE: "bg-[#EAF7E8] text-[#00A94F]",
    MATURED: "bg-[#F3F8EF] text-[#10211D]",
    CANCELLED: "bg-red-100 text-red-700",
  };
  return (
    <Badge className={`gap-1.5 rounded-full ${cfg[status]}`}>
      {status === "ACTIVE" && <IconClock size={12} />}
      {status === "MATURED" && <IconCheck size={12} />}
      {status === "CANCELLED" && <IconX size={12} />}
      {status === "CANCELLED" ? "Withdrawn Early" : status === "MATURED" ? "Withdrawn (Matured)" : "Active"}
    </Badge>
  );
}

const fmtDate = (d: string) =>
  new Date(d).toLocaleString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
const fmtMoney = (v: string | number) => `$${parseFloat(String(v)).toFixed(2)}`;

function InvestmentsSkeleton() {
  return (
    <div className="p-4 space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-full shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="h-6 w-20 rounded-full shrink-0" />
          <Skeleton className="h-3.5 w-16 shrink-0" />
        </div>
      ))}
    </div>
  );
}

export default function IndexInvestments() {
  const [investments, setInvestments] = useState<IndexInvestmentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<IndexInvestmentRecord | null>(null);

  const fetchInvestments = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await indexAPI.getInvestments();
      setInvestments(data.investments || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load investments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchInvestments(); }, [fetchInvestments]);

  const filtered = useMemo(() => {
    return investments.filter((inv) => {
      if (status !== "ALL" && inv.status !== status) return false;
      if (!search) return true;
      const t = search.toLowerCase();
      return (
        inv.user?.name?.toLowerCase().includes(t) ||
        inv.user?.email?.toLowerCase().includes(t) ||
        inv.tier?.label?.toLowerCase().includes(t)
      );
    });
  }, [investments, status, search]);

  // Fee/tax summary — invest-time maintenance fee vs. exit fee collected at withdrawal.
  const totals = useMemo(() => {
    let invested = 0;
    let maintenanceFees = 0;
    let exitFees = 0;
    let activeCount = 0;
    for (const inv of investments) {
      invested += parseFloat(inv.amount);
      maintenanceFees += parseFloat(inv.feeAmount);
      if (inv.withdrawalFee) exitFees += parseFloat(inv.withdrawalFee);
      if (inv.status === "ACTIVE") activeCount++;
    }
    return { invested, maintenanceFees, exitFees, activeCount };
  }, [investments]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#10211D]">Index Investments</h1>
          <p className="mt-1 text-sm text-[#68736E]">Every user&apos;s Index investment — tier, amount, status, and fees collected.</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchInvestments} disabled={loading} className="gap-2 rounded-xl border-[#DDE4DE]">
          <IconRefresh size={15} className={loading ? "animate-spin" : ""} /> Refresh
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <IconAlertCircle size={16} className="shrink-0" /> {error}
        </div>
      )}

      {/* Summary tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-4 rounded-2xl border-[#DDE4DE] shadow-[0_8px_30px_rgba(16,33,29,0.05)]">
          <p className="text-xs text-[#68736E] uppercase tracking-wider">Total Invested</p>
          {loading ? <Skeleton className="h-7 w-24 mt-1.5" /> : (
            <p className="text-2xl font-bold text-[#10211D] mt-1">{fmtMoney(totals.invested)}</p>
          )}
        </Card>
        <Card className="p-4 rounded-2xl border-[#DDE4DE] shadow-[0_8px_30px_rgba(16,33,29,0.05)]">
          <p className="text-xs text-[#68736E] uppercase tracking-wider">Active Investments</p>
          {loading ? <Skeleton className="h-7 w-14 mt-1.5" /> : (
            <p className="text-2xl font-bold text-[#00A94F] mt-1">{totals.activeCount}</p>
          )}
        </Card>
        <Card className="p-4 rounded-2xl border-[#DDE4DE] shadow-[0_8px_30px_rgba(16,33,29,0.05)]">
          <p className="text-xs text-[#68736E] uppercase tracking-wider flex items-center gap-1">
            <IconReceiptTax size={13} /> Maintenance Fees
          </p>
          {loading ? <Skeleton className="h-7 w-20 mt-1.5" /> : (
            <p className="text-2xl font-bold text-amber-600 mt-1">{fmtMoney(totals.maintenanceFees)}</p>
          )}
        </Card>
        <Card className="p-4 rounded-2xl border-[#DDE4DE] shadow-[0_8px_30px_rgba(16,33,29,0.05)]">
          <p className="text-xs text-[#68736E] uppercase tracking-wider flex items-center gap-1">
            <IconReceiptTax size={13} /> Exit Fees Collected
          </p>
          {loading ? <Skeleton className="h-7 w-20 mt-1.5" /> : (
            <p className="text-2xl font-bold text-amber-600 mt-1">{fmtMoney(totals.exitFees)}</p>
          )}
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="inline-flex rounded-xl border border-[#DDE4DE] p-1 bg-white self-start">
          {statusFilters.map((s) => (
            <button key={s} onClick={() => setStatus(s)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${status === s ? "bg-[#EAF7E8] text-[#00A94F]" : "text-[#68736E] hover:bg-[#F3F8EF]"}`}>
              {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#89938E]" />
          <Input type="text" placeholder="Search by investor name, email, or tier..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 rounded-xl border-[#DDE4DE]" />
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-hidden py-0 rounded-2xl border-[#DDE4DE] shadow-[0_8px_30px_rgba(16,33,29,0.05)]">
        {loading ? (
          <InvestmentsSkeleton />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-14 w-14 rounded-full bg-[#F3F8EF] flex items-center justify-center mb-4">
              <IconChartLine className="h-7 w-7 text-[#89938E]" />
            </div>
            <p className="text-sm font-medium text-[#10211D]">No investments found</p>
            <p className="text-xs text-[#89938E] mt-1">
              {search || status !== "ALL" ? "Try a different search or filter." : "No one has invested in the Index yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#F3F8EF]">
                  <TableHead className="text-[#68736E]">Investor</TableHead>
                  <TableHead className="text-[#68736E]">Tier</TableHead>
                  <TableHead className="text-[#68736E]">Amount</TableHead>
                  <TableHead className="text-[#68736E]">Maint. Fee</TableHead>
                  <TableHead className="text-[#68736E]">Status</TableHead>
                  <TableHead className="text-[#68736E]">Invested</TableHead>
                  <TableHead className="text-[#68736E]">Matures</TableHead>
                  <TableHead className="text-right text-[#68736E]">Exit Fee</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((inv) => (
                  <TableRow
                    key={inv.id}
                    onClick={() => setSelected(inv)}
                    className="cursor-pointer border-[#DDE4DE]"
                  >
                    <TableCell>
                      <p className="font-medium text-[#10211D]">{inv.user?.name || "Unknown"}</p>
                      <p className="text-xs text-[#89938E]">{inv.user?.email || "-"}</p>
                    </TableCell>
                    <TableCell className="text-sm text-[#10211D]">{inv.tier?.label || "-"}</TableCell>
                    <TableCell className="font-medium text-[#10211D]">{fmtMoney(inv.amount)}</TableCell>
                    <TableCell className="text-xs text-amber-600">{fmtMoney(inv.feeAmount)}</TableCell>
                    <TableCell>{statusBadge(inv.status)}</TableCell>
                    <TableCell className="text-xs text-[#68736E]">{fmtDate(inv.activatedAt)}</TableCell>
                    <TableCell className="text-xs text-[#68736E]">{inv.maturesAt ? fmtDate(inv.maturesAt) : "-"}</TableCell>
                    <TableCell className="text-right text-xs text-amber-600">
                      {inv.withdrawalFee ? fmtMoney(inv.withdrawalFee) : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </Card>

      {/* Detail Panel */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelected(null)} />
          <div className="relative w-full max-w-lg bg-white shadow-2xl overflow-y-auto">
            <div className="sticky top-0 z-10 bg-white border-b border-[#DDE4DE] px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#10211D]">Investment Details</h2>
              {statusBadge(selected.status)}
            </div>

            <div className="p-6 space-y-6">
              <section>
                <h3 className="text-xs font-semibold text-[#89938E] uppercase tracking-wider mb-3">Investor</h3>
                <div className="bg-[#F3F8EF] rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-[#68736E]">Name</span><span className="font-medium text-[#10211D]">{selected.user?.name || "-"}</span></div>
                  <div className="flex justify-between"><span className="text-[#68736E]">Email</span><span className="font-medium text-[#10211D] break-all text-right">{selected.user?.email || "-"}</span></div>
                </div>
              </section>

              <section>
                <h3 className="text-xs font-semibold text-[#89938E] uppercase tracking-wider mb-3">Investment</h3>
                <div className="bg-[#F3F8EF] rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-[#68736E]">Tier</span><span className="font-medium text-[#10211D]">{selected.tier?.label}</span></div>
                  <div className="flex justify-between"><span className="text-[#68736E]">Gross Amount</span><span className="font-bold text-[#10211D]">{fmtMoney(selected.amount)}</span></div>
                  <div className="flex justify-between"><span className="text-[#68736E]">Maintenance Fee</span><span className="text-amber-600">− {fmtMoney(selected.feeAmount)}</span></div>
                  <div className="flex justify-between"><span className="text-[#68736E]">Net Invested</span><span className="font-bold text-[#00A94F]">{fmtMoney(selected.netAmount)}</span></div>
                  <div className="flex justify-between"><span className="text-[#68736E]">Duration</span><span className="text-[#10211D]">{selected.tier?.durationMonths} months</span></div>
                  <div className="flex justify-between"><span className="text-[#68736E]">Activated</span><span className="text-[#10211D] text-right">{fmtDate(selected.activatedAt)}</span></div>
                  {selected.maturesAt && (
                    <div className="flex justify-between"><span className="text-[#68736E]">Matures</span><span className="text-[#10211D] text-right">{fmtDate(selected.maturesAt)}</span></div>
                  )}
                </div>
              </section>

              {selected.withdrawnAt && (
                <section>
                  <h3 className="text-xs font-semibold text-[#89938E] uppercase tracking-wider mb-3">Withdrawal</h3>
                  <div className="bg-[#EAF7E8] rounded-xl p-4 space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-[#68736E]">Withdrawn</span><span className="text-[#10211D] text-right">{fmtDate(selected.withdrawnAt)}</span></div>
                    <div className="flex justify-between"><span className="text-[#68736E]">Exit Fee ({selected.status === "MATURED" ? "maturity" : "early"})</span><span className="text-amber-600">− {fmtMoney(selected.withdrawalFee || 0)}</span></div>
                    <div className="flex justify-between"><span className="text-[#68736E]">Payout to Wallet</span><span className="font-bold text-[#00A94F]">{fmtMoney(selected.payoutAmount || 0)}</span></div>
                  </div>
                </section>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
