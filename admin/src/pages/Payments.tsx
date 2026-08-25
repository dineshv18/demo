/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from "react";
import {
  IconWallet,
  IconClock,
  IconCheck,
  IconX,
  IconArrowDownLeft,
  IconArrowUpRight,
  IconChevronLeft,
  IconFile,
  IconEye,
  IconSearch,
} from "@tabler/icons-react";
import { paymentsAPI, type PaymentRequest, type PaymentStatus } from "../services/api";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Skeleton } from "../components/ui/skeleton";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../components/ui/table";

function PaymentsSkeleton() {
  return (
    <div className="p-4 space-y-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3.5 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="h-3.5 w-16 shrink-0" />
          <Skeleton className="h-3.5 w-20 shrink-0" />
          <Skeleton className="h-6 w-20 rounded-full shrink-0" />
          <Skeleton className="h-3.5 w-24 shrink-0" />
        </div>
      ))}
    </div>
  );
}

type Tab = "ALL" | "DEPOSIT" | "WITHDRAWAL";
type StatusFilter = "ALL" | "PENDING" | "COMPLETED" | "FAILED";

const tabs: Tab[] = ["ALL", "DEPOSIT", "WITHDRAWAL"];
const statusFilters: StatusFilter[] = ["ALL", "PENDING", "COMPLETED", "FAILED"];

function typeLabel(type: string) {
  if (type === "DEPOSIT") return "Deposit";
  if (type === "BONUS_WITHDRAWAL") return "Bonus Withdrawal";
  return "Withdrawal";
}

function statusBadge(status: PaymentStatus) {
  const cfg: Record<PaymentStatus, string> = {
    PENDING: "bg-amber-100 text-amber-700",
    COMPLETED: "bg-[#EAF7E8] text-[#00A94F]",
    FAILED: "bg-red-100 text-red-700",
    CANCELLED: "bg-[#F3F8EF] text-[#68736E]",
  };
  return (
    <Badge className={`gap-1.5 rounded-full ${cfg[status]}`}>
      {status === "PENDING" && <IconClock size={12} />}
      {status === "COMPLETED" && <IconCheck size={12} />}
      {status === "FAILED" && <IconX size={12} />}
      {status}
    </Badge>
  );
}

export default function Payments() {
  const [payments, setPayments] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("ALL");
  const [status, setStatus] = useState<StatusFilter>("ALL");
  const [counts, setCounts] = useState({ pendingDeposits: 0, pendingWithdrawals: 0, completed: 0, rejected: 0, total: 0 });
  const [selected, setSelected] = useState<PaymentRequest | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [rejectModal, setRejectModal] = useState<PaymentRequest | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params: Record<string, string> = {};
      if (tab !== "ALL") params.type = tab;
      if (status !== "ALL") params.status = status;
      const data = await paymentsAPI.getAll(params);
      setPayments(data.payments || []);
      setCounts(data.counts ?? { pendingDeposits: 0, pendingWithdrawals: 0, completed: 0, rejected: 0, total: 0 });
    } catch (err: any) {
      setError(err.message || "Failed to load payments");
    } finally {
      setLoading(false);
    }
  }, [tab, status]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  const openDetail = async (id: string) => {
    setDetailLoading(true);
    setSelected(null);
    try {
      const data = await paymentsAPI.getDetail(id);
      setSelected(data.payment);
    } catch (err: any) {
      showToast("error", err.message || "Failed to load details");
    } finally {
      setDetailLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    if (!confirm("Approve this payment? The user's wallet will be updated.")) return;
    setActionLoading(true);
    try {
      await paymentsAPI.approve(id);
      showToast("success", "Payment approved — wallet updated");
      setSelected(null);
      fetchPayments();
    } catch (err: any) {
      showToast("error", err.message || "Failed to approve");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    setActionLoading(true);
    try {
      await paymentsAPI.reject(rejectModal.id, rejectReason.trim() || "Payment could not be verified");
      showToast("success", "Payment rejected");
      setRejectModal(null);
      setRejectReason("");
      setSelected(null);
      fetchPayments();
    } catch (err: any) {
      showToast("error", err.message || "Failed to reject");
    } finally {
      setActionLoading(false);
    }
  };

  const filtered = payments.filter((p) => {
    if (!search) return true;
    const t = search.toLowerCase();
    return (
      p.user?.name?.toLowerCase().includes(t) ||
      p.user?.email?.toLowerCase().includes(t) ||
      p.transactionId?.toLowerCase().includes(t) ||
      p.upiId?.toLowerCase().includes(t)
    );
  });

  const fmtDate = (d: string) => new Date(d).toLocaleString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  const fmtAmt = (p: PaymentRequest) => `$ ${parseFloat(p.amount).toFixed(2)}`;

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] px-5 py-3 rounded-lg shadow-lg text-sm font-medium text-white ${toast.type === "success" ? "bg-emerald-600" : "bg-red-600"}`}>
          {toast.message}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#10211D]">Payment Requests</h1>
        <p className="mt-1 text-sm text-[#68736E]">Review deposit & withdrawal requests. Verify payment screenshots before approving.</p>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <IconX size={16} className="shrink-0" /> {error}
          <button onClick={fetchPayments} className="ml-auto text-xs font-semibold underline shrink-0">Retry</button>
        </div>
      )}

      {/* Counts */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Card className="p-4 rounded-2xl border-[#DDE4DE] shadow-[0_8px_30px_rgba(16,33,29,0.05)]">
          <p className="text-xs text-[#68736E] uppercase tracking-wider">Pending Deposits</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{counts.pendingDeposits}</p>
        </Card>
        <Card className="p-4 rounded-2xl border-[#DDE4DE] shadow-[0_8px_30px_rgba(16,33,29,0.05)]">
          <p className="text-xs text-[#68736E] uppercase tracking-wider">Pending Withdrawals</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{counts.pendingWithdrawals}</p>
        </Card>
        <Card className="p-4 rounded-2xl border-[#DDE4DE] shadow-[0_8px_30px_rgba(16,33,29,0.05)]">
          <p className="text-xs text-[#68736E] uppercase tracking-wider">Completed</p>
          <p className="text-2xl font-bold text-[#00A94F] mt-1">{counts.completed}</p>
        </Card>
        <Card className="p-4 rounded-2xl border-[#DDE4DE] shadow-[0_8px_30px_rgba(16,33,29,0.05)]">
          <p className="text-xs text-[#68736E] uppercase tracking-wider">Rejected</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{counts.rejected}</p>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="inline-flex rounded-xl border border-[#DDE4DE] p-1 bg-white self-start">
          {tabs.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? "bg-[#EAF7E8] text-[#00A94F]" : "text-[#68736E] hover:bg-[#F3F8EF]"}`}>
              {t === "ALL" ? "All" : t === "DEPOSIT" ? "Deposits" : "Withdrawals"}
            </button>
          ))}
        </div>
        <div className="inline-flex rounded-xl border border-[#DDE4DE] p-1 bg-white self-start">
          {statusFilters.map((s) => (
            <button key={s} onClick={() => setStatus(s)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${status === s ? "bg-[#F3F8EF] text-[#10211D]" : "text-[#89938E] hover:bg-[#F3F8EF]/60"}`}>
              {s === "ALL" ? "All Status" : s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#89938E]" />
        <Input type="text" placeholder="Search by name, email, transaction ID, UPI..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 rounded-xl border-[#DDE4DE]" />
      </div>

      {/* Table */}
      <Card className="overflow-hidden py-0 rounded-2xl border-[#DDE4DE] shadow-[0_8px_30px_rgba(16,33,29,0.05)]">
        {loading ? (
          <PaymentsSkeleton />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-14 w-14 rounded-full bg-[#F3F8EF] flex items-center justify-center mb-4">
              <IconWallet className="h-7 w-7 text-[#89938E]" />
            </div>
            <p className="text-sm font-medium text-[#10211D]">No payment requests</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F3F8EF]">
                <TableHead className="text-[#68736E]">User</TableHead>
                <TableHead className="text-[#68736E]">Type</TableHead>
                <TableHead className="text-[#68736E]">Amount</TableHead>
                <TableHead className="text-[#68736E]">Reference</TableHead>
                <TableHead className="text-[#68736E]">Status</TableHead>
                <TableHead className="text-[#68736E]">Date</TableHead>
                <TableHead className="text-right text-[#68736E]">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((p) => (
                <TableRow key={p.id} onClick={() => openDetail(p.id)} className="cursor-pointer border-[#DDE4DE]">
                  <TableCell>
                    <p className="font-medium text-[#10211D]">{p.user?.name || "Unknown"}</p>
                    <p className="text-xs text-[#89938E]">{p.user?.email || "-"}</p>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${p.type === "DEPOSIT" ? "text-[#00A94F]" : "text-amber-600"}`}>
                      {p.type === "DEPOSIT" ? <IconArrowDownLeft size={14} /> : <IconArrowUpRight size={14} />}
                      {typeLabel(p.type)}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium text-[#10211D]">{fmtAmt(p)}</TableCell>
                  <TableCell className="text-xs text-[#68736E]">
                    {p.type === "DEPOSIT" ? (p.transactionId || "-") : (p.upiId || "-")}
                  </TableCell>
                  <TableCell>{statusBadge(p.status)}</TableCell>
                  <TableCell className="text-xs text-[#68736E]">{fmtDate(p.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-[#68736E] hover:bg-[#F3F8EF]"><IconEye size={16} /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        )}
      </Card>

      {/* Detail Panel */}
      {(selected || detailLoading) && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => !actionLoading && setSelected(null)} />
          <div className="relative w-full max-w-xl bg-white dark:bg-gray-900 shadow-2xl overflow-y-auto">
            {detailLoading ? (
              <div className="p-6 space-y-4">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-24 w-full rounded-xl" />
                <Skeleton className="h-32 w-full rounded-xl" />
              </div>
            ) : selected ? (
              <>
                <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"><IconChevronLeft size={18} /></button>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {selected.type === "DEPOSIT" ? "Deposit Request" : "Withdrawal Request"}
                    </h2>
                  </div>
                  {statusBadge(selected.status)}
                </div>

                <div className="p-6 space-y-6">
                  <section>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">User</h3>
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-gray-500">Name</span><span className="font-medium text-gray-900 dark:text-white">{selected.user?.name || "-"}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Email</span><span className="font-medium text-gray-900 dark:text-white break-all text-right">{selected.user?.email || "-"}</span></div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Request Details</h3>
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-gray-500">Amount</span><span className="font-bold text-gray-900 dark:text-white">{fmtAmt(selected)}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Type</span><span className="font-medium text-gray-900 dark:text-white">{typeLabel(selected.type)}</span></div>
                      {selected.type === "DEPOSIT" ? (
                        <div className="flex justify-between"><span className="text-gray-500">Transaction ID / UTR</span><span className="font-mono text-xs text-gray-900 dark:text-white text-right">{selected.transactionId || "-"}</span></div>
                      ) : (
                        <div className="flex justify-between"><span className="text-gray-500">User UPI ID</span><span className="font-mono text-xs text-gray-900 dark:text-white text-right">{selected.upiId || "-"}</span></div>
                      )}
                      <div className="flex justify-between"><span className="text-gray-500">Submitted</span><span className="text-gray-900 dark:text-white text-right">{fmtDate(selected.createdAt)}</span></div>
                      {selected.processedAt && <div className="flex justify-between"><span className="text-gray-500">Processed</span><span className="text-gray-900 dark:text-white text-right">{fmtDate(selected.processedAt)}</span></div>}
                    </div>
                  </section>

                  {/* Screenshot for deposits */}
                  {selected.type === "DEPOSIT" && selected.screenshotUrl && (
                    <section>
                      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Payment Screenshot</h3>
                      <a href={selected.screenshotUrl} target="_blank" rel="noopener noreferrer" className="block rounded-xl overflow-hidden border border-[#DDE4DE] hover:border-[#00A94F] transition-colors group">
                        <img src={selected.screenshotUrl} alt="Payment proof" className="w-full object-contain max-h-80 bg-[#F3F8EF]" />
                        <div className="px-4 py-2 text-xs text-[#68736E] flex items-center gap-1 group-hover:text-[#00A94F]">
                          <IconEye size={14} /> Click to open full size
                        </div>
                      </a>
                    </section>
                  )}

                  {/* withdrawal note */}
                  {(selected.type === "WITHDRAWAL" || selected.type === "BONUS_WITHDRAWAL") && (
                    <div className="rounded-xl border border-[#00A94F]/30 bg-[#EAF7E8] p-4 text-sm text-[#10211D]">
                      Send <strong>{fmtAmt(selected)}</strong> to the user&apos;s UPI: <strong className="font-mono">{selected.upiId}</strong>. Then approve to deduct from their {selected.type === "BONUS_WITHDRAWAL" ? "bonus" : "wallet"} balance.
                    </div>
                  )}

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

                  {selected.status !== "PENDING" && (
                    <div className="flex items-center gap-2 px-4 py-3 bg-gray-50 dark:bg-gray-800/50 rounded-xl text-sm text-gray-600 dark:text-gray-400">
                      <IconFile size={16} /> This request has been {selected.status.toLowerCase()}.
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => !actionLoading && setRejectModal(null)} />
          <Card className="relative w-full max-w-md shadow-2xl">
            <div className="px-6 py-6 space-y-4">
              <h3 className="text-lg font-semibold">Reject {typeLabel(rejectModal.type)}</h3>
              <p className="text-sm text-muted-foreground">Provide a reason. The user will be informed.</p>
              <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="e.g. Payment not received / screenshot unclear..." rows={4}
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