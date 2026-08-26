/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback, useMemo } from "react";
import {
  IconArrowsExchange,
  IconAlertCircle,
  IconRefresh,
  IconClock,
  IconCheck,
  IconX,
  IconSettings,
} from "@tabler/icons-react";
import { transfersAPI, type InternalTransfer } from "../services/api";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../components/ui/table";

type StatusFilter = "ALL" | "PENDING" | "APPROVED" | "REJECTED";
const statusFilters: StatusFilter[] = ["ALL", "PENDING", "APPROVED", "REJECTED"];

function statusBadge(status: InternalTransfer["status"]) {
  const cfg: Record<InternalTransfer["status"], string> = {
    PENDING: "bg-amber-100 text-amber-700",
    APPROVED: "bg-[#EAF7E8] text-[#00A94F]",
    REJECTED: "bg-red-100 text-red-700",
  };
  return (
    <Badge className={`gap-1.5 rounded-full ${cfg[status]}`}>
      {status === "PENDING" && <IconClock size={12} />}
      {status === "APPROVED" && <IconCheck size={12} />}
      {status === "REJECTED" && <IconX size={12} />}
      {status === "PENDING" ? "Pending" : status === "APPROVED" ? "Completed" : "Rejected"}
    </Badge>
  );
}

const fmtDate = (d: string) =>
  new Date(d).toLocaleString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
const fmtMoney = (v: string | number) => `$${parseFloat(String(v)).toFixed(2)}`;

function TransfersSkeleton() {
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
        </div>
      ))}
    </div>
  );
}

export default function InternalTransfers() {
  const [transfers, setTransfers] = useState<InternalTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [selected, setSelected] = useState<InternalTransfer | null>(null);
  const [rejectModal, setRejectModal] = useState<InternalTransfer | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [feePercent, setFeePercent] = useState("0");
  const [feeSaving, setFeeSaving] = useState(false);
  const [showFeeSettings, setShowFeeSettings] = useState(false);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchTransfers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await transfersAPI.getAll(status !== "ALL" ? { status } : undefined);
      setTransfers(data.transfers || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load transfers");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => { fetchTransfers(); }, [fetchTransfers]);

  useEffect(() => {
    transfersAPI.getSettings().then((res) => setFeePercent(res.settings.feePercent)).catch(() => {});
  }, []);

  const counts = useMemo(() => {
    let pending = 0, approved = 0, rejected = 0;
    for (const t of transfers) {
      if (t.status === "PENDING") pending++;
      else if (t.status === "APPROVED") approved++;
      else rejected++;
    }
    return { pending, approved, rejected };
  }, [transfers]);

  const handleApprove = async (id: string) => {
    if (!confirm("Approve this transfer? Funds will be released to the recipient.")) return;
    setActionLoading(true);
    try {
      await transfersAPI.approve(id);
      showToast("success", "Transfer approved — funds released to the recipient");
      setSelected(null);
      fetchTransfers();
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Failed to approve");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    setActionLoading(true);
    try {
      await transfersAPI.reject(rejectModal.id, rejectReason.trim() || "Rejected by admin");
      showToast("success", "Transfer rejected — funds returned to the sender");
      setRejectModal(null);
      setRejectReason("");
      setSelected(null);
      fetchTransfers();
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Failed to reject");
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveFee = async () => {
    const val = parseFloat(feePercent);
    if (isNaN(val) || val < 0 || val > 100) {
      showToast("error", "Fee must be between 0 and 100");
      return;
    }
    setFeeSaving(true);
    try {
      await transfersAPI.updateSettings(val);
      showToast("success", "Transfer fee updated");
      setShowFeeSettings(false);
    } catch (err) {
      showToast("error", err instanceof Error ? err.message : "Failed to update fee");
    } finally {
      setFeeSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] px-5 py-3 rounded-lg shadow-lg text-sm font-medium text-white ${toast.type === "success" ? "bg-emerald-600" : "bg-red-600"}`}>
          {toast.message}
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#10211D]">Internal Transaction</h1>
          <p className="mt-1 text-sm text-[#68736E]">User-to-user wallet transfers — review and approve or reject each request.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowFeeSettings((v) => !v)} className="gap-2 rounded-xl border-[#DDE4DE]">
            <IconSettings size={15} /> Transaction Fee
          </Button>
          <Button variant="outline" size="sm" onClick={fetchTransfers} disabled={loading} className="gap-2 rounded-xl border-[#DDE4DE]">
            <IconRefresh size={15} className={loading ? "animate-spin" : ""} /> Refresh
          </Button>
        </div>
      </div>

      {showFeeSettings && (
        <Card className="p-4 rounded-2xl border-[#DDE4DE] shadow-[0_8px_30px_rgba(16,33,29,0.05)]">
          <p className="text-sm font-semibold text-[#10211D] mb-1">Internal Transaction Fee</p>
          <p className="text-xs text-[#68736E] mb-3">
            Percentage taken from every internal transfer at approval time. Set to 0 to charge nothing.
          </p>
          <div className="flex items-center gap-3">
            <div className="relative w-32">
              <input
                type="number"
                min={0}
                max={100}
                step={0.01}
                value={feePercent}
                onChange={(e) => setFeePercent(e.target.value)}
                className="w-full rounded-xl border border-[#DDE4DE] px-3 py-2 pr-7 text-sm focus:outline-none focus:ring-2 focus:ring-[#00A94F]/30"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#89938E]">%</span>
            </div>
            <Button onClick={handleSaveFee} disabled={feeSaving} size="sm" className="bg-[#10211D] hover:bg-[#10211D]/90 text-white rounded-xl">
              {feeSaving ? "Saving..." : "Save"}
            </Button>
          </div>
        </Card>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <IconAlertCircle size={16} className="shrink-0" /> {error}
        </div>
      )}

      {/* Summary tiles */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="p-4 rounded-2xl border-[#DDE4DE] shadow-[0_8px_30px_rgba(16,33,29,0.05)]">
          <p className="text-xs text-[#68736E] uppercase tracking-wider">Pending Review</p>
          {loading ? <Skeleton className="h-7 w-10 mt-1.5" /> : (
            <p className="text-2xl font-bold text-amber-600 mt-1">{counts.pending}</p>
          )}
        </Card>
        <Card className="p-4 rounded-2xl border-[#DDE4DE] shadow-[0_8px_30px_rgba(16,33,29,0.05)]">
          <p className="text-xs text-[#68736E] uppercase tracking-wider">Completed</p>
          {loading ? <Skeleton className="h-7 w-10 mt-1.5" /> : (
            <p className="text-2xl font-bold text-[#00A94F] mt-1">{counts.approved}</p>
          )}
        </Card>
        <Card className="p-4 rounded-2xl border-[#DDE4DE] shadow-[0_8px_30px_rgba(16,33,29,0.05)]">
          <p className="text-xs text-[#68736E] uppercase tracking-wider">Rejected</p>
          {loading ? <Skeleton className="h-7 w-10 mt-1.5" /> : (
            <p className="text-2xl font-bold text-red-600 mt-1">{counts.rejected}</p>
          )}
        </Card>
      </div>

      {/* Filters */}
      <div className="inline-flex rounded-xl border border-[#DDE4DE] p-1 bg-white self-start">
        {statusFilters.map((s) => (
          <button key={s} onClick={() => setStatus(s)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${status === s ? "bg-[#EAF7E8] text-[#00A94F]" : "text-[#68736E] hover:bg-[#F3F8EF]"}`}>
            {s === "ALL" ? "All" : s.charAt(0) + s.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* Table */}
      <Card className="overflow-hidden py-0 rounded-2xl border-[#DDE4DE] shadow-[0_8px_30px_rgba(16,33,29,0.05)]">
        {loading ? (
          <TransfersSkeleton />
        ) : transfers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-14 w-14 rounded-full bg-[#F3F8EF] flex items-center justify-center mb-4">
              <IconArrowsExchange className="h-7 w-7 text-[#89938E]" />
            </div>
            <p className="text-sm font-medium text-[#10211D]">No transfers found</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden sm:block overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F3F8EF]">
                    <TableHead className="text-[#68736E]">Sender</TableHead>
                    <TableHead className="text-[#68736E]">Receiver</TableHead>
                    <TableHead className="text-[#68736E]">Source</TableHead>
                    <TableHead className="text-[#68736E]">Amount</TableHead>
                    <TableHead className="text-[#68736E]">Fee</TableHead>
                    <TableHead className="text-[#68736E]">Status</TableHead>
                    <TableHead className="text-[#68736E]">Requested</TableHead>
                    <TableHead className="text-right text-[#68736E]">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transfers.map((t) => (
                    <TableRow key={t.id} onClick={() => setSelected(t)} className="cursor-pointer border-[#DDE4DE]">
                      <TableCell>
                        <p className="font-medium text-[#10211D]">{t.sender?.name || "Unknown"}</p>
                        <p className="text-xs text-[#89938E]">{t.sender?.email || "-"}</p>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium text-[#10211D]">{t.receiver?.name || "Unknown"}</p>
                        <p className="text-xs text-[#89938E]">{t.receiver?.email || "-"}</p>
                      </TableCell>
                      <TableCell className="text-sm text-[#68736E]">{t.sourceType === "BONUS" ? "Bonus" : "Wallet"}</TableCell>
                      <TableCell className="font-medium text-[#10211D]">{fmtMoney(t.amount)}</TableCell>
                      <TableCell className="text-xs text-amber-600">{parseFloat(t.feeAmount) > 0 ? fmtMoney(t.feeAmount) : "-"}</TableCell>
                      <TableCell>{statusBadge(t.status)}</TableCell>
                      <TableCell className="text-xs text-[#68736E]">{fmtDate(t.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        {t.status === "PENDING" ? (
                          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                            <Button size="sm" onClick={() => handleApprove(t.id)} disabled={actionLoading} className="bg-[#00A94F] hover:bg-[#00A94F]/90 text-white rounded-lg h-8 px-3">
                              Approve
                            </Button>
                            <Button size="sm" variant="destructive" onClick={() => { setRejectModal(t); setRejectReason(""); }} disabled={actionLoading} className="rounded-lg h-8 px-3">
                              Reject
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-[#89938E]">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Mobile cards */}
            <div className="sm:hidden divide-y divide-[#DDE4DE]">
              {transfers.map((t) => (
                <div key={t.id} onClick={() => setSelected(t)} className="w-full text-left p-4 active:bg-[#F3F8EF] transition-colors">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-[#10211D] truncate">{t.sender?.name || "Unknown"} → {t.receiver?.name || "Unknown"}</p>
                      <p className="text-xs text-[#89938E] truncate">{t.sourceType === "BONUS" ? "Bonus" : "Wallet"} · {fmtDate(t.createdAt)}</p>
                    </div>
                    {statusBadge(t.status)}
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs">
                    <span className="text-[#89938E]">Amount</span>
                    <span className="font-medium text-[#10211D]">{fmtMoney(t.amount)}</span>
                  </div>
                  {t.status === "PENDING" && (
                    <div className="flex items-center gap-2 mt-3" onClick={(e) => e.stopPropagation()}>
                      <Button size="sm" onClick={() => handleApprove(t.id)} disabled={actionLoading} className="flex-1 bg-[#00A94F] hover:bg-[#00A94F]/90 text-white rounded-lg h-8">
                        Approve
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => { setRejectModal(t); setRejectReason(""); }} disabled={actionLoading} className="flex-1 rounded-lg h-8">
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      {/* Detail Panel */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => setSelected(null)} />
          <div className="relative w-full max-w-lg bg-white shadow-2xl overflow-y-auto">
            <div className="sticky top-0 z-10 bg-white border-b border-[#DDE4DE] px-6 py-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[#10211D]">Transfer Details</h2>
              {statusBadge(selected.status)}
            </div>

            <div className="p-6 space-y-6">
              <section>
                <h3 className="text-xs font-semibold text-[#89938E] uppercase tracking-wider mb-3">Sender</h3>
                <div className="bg-[#F3F8EF] rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-[#68736E]">Name</span><span className="font-medium text-[#10211D]">{selected.sender?.name || "-"}</span></div>
                  <div className="flex justify-between"><span className="text-[#68736E]">Email</span><span className="font-medium text-[#10211D] break-all text-right">{selected.sender?.email || "-"}</span></div>
                  <div className="flex justify-between"><span className="text-[#68736E]">Sent from</span><span className="font-medium text-[#10211D]">{selected.sourceType === "BONUS" ? "Bonus Balance" : "Wallet"}</span></div>
                </div>
              </section>

              <section>
                <h3 className="text-xs font-semibold text-[#89938E] uppercase tracking-wider mb-3">Receiver</h3>
                <div className="bg-[#F3F8EF] rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-[#68736E]">Name</span><span className="font-medium text-[#10211D]">{selected.receiver?.name || "-"}</span></div>
                  <div className="flex justify-between"><span className="text-[#68736E]">Email</span><span className="font-medium text-[#10211D] break-all text-right">{selected.receiver?.email || "-"}</span></div>
                </div>
              </section>

              <section>
                <h3 className="text-xs font-semibold text-[#89938E] uppercase tracking-wider mb-3">Amount</h3>
                <div className="bg-[#F3F8EF] rounded-xl p-4 space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-[#68736E]">Requested</span><span className="font-bold text-[#10211D]">{fmtMoney(selected.amount)}</span></div>
                  {parseFloat(selected.feeAmount) > 0 && (
                    <div className="flex justify-between"><span className="text-[#68736E]">Fee ({parseFloat(selected.feePercent).toFixed(2)}%)</span><span className="text-amber-600">− {fmtMoney(selected.feeAmount)}</span></div>
                  )}
                  <div className="flex justify-between"><span className="text-[#68736E]">Receiver gets</span><span className="font-bold text-[#00A94F]">{fmtMoney(selected.netAmount)}</span></div>
                  <div className="flex justify-between"><span className="text-[#68736E]">Requested</span><span className="text-[#10211D] text-right">{fmtDate(selected.createdAt)}</span></div>
                  {selected.processedAt && (
                    <div className="flex justify-between"><span className="text-[#68736E]">Processed</span><span className="text-[#10211D] text-right">{fmtDate(selected.processedAt)}</span></div>
                  )}
                  {selected.note && (
                    <div className="pt-2 border-t border-[#DDE4DE]"><span className="text-[#68736E]">Note: </span><span className="text-[#10211D]">{selected.note}</span></div>
                  )}
                  {selected.rejectReason && (
                    <div className="pt-2 border-t border-[#DDE4DE]"><span className="text-[#68736E]">Reject reason: </span><span className="text-red-600">{selected.rejectReason}</span></div>
                  )}
                </div>
              </section>

              {selected.status === "PENDING" && (
                <section className="flex gap-3 pt-2">
                  <Button onClick={() => handleApprove(selected.id)} disabled={actionLoading} className="flex-1 bg-[#00A94F] hover:bg-[#00A94F]/90 text-white rounded-xl">
                    {actionLoading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <IconCheck size={16} />}
                    Approve
                  </Button>
                  <Button variant="destructive" onClick={() => { setRejectModal(selected); setRejectReason(""); }} disabled={actionLoading} className="flex-1 rounded-xl">
                    <IconX size={16} /> Reject
                  </Button>
                </section>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => !actionLoading && setRejectModal(null)} />
          <Card className="relative w-full max-w-md shadow-2xl">
            <div className="px-6 py-6 space-y-4">
              <h3 className="text-lg font-semibold">Reject Transfer</h3>
              <p className="text-sm text-muted-foreground">Provide a reason. The sender&apos;s funds will be returned in full.</p>
              <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="e.g. Suspicious activity / recipient details incorrect..." rows={4}
                className="w-full px-4 py-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none" />
              <div className="flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setRejectModal(null)} disabled={actionLoading}>Cancel</Button>
                <Button variant="destructive" onClick={handleReject} disabled={actionLoading}>
                  {actionLoading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <IconX size={16} />} Reject
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
