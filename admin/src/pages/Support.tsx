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
  IconEye,
  IconSearch,
  IconMessageCircle,
} from "@tabler/icons-react";
import { paymentsAPI, type PaymentRequest, type PaymentStatus } from "../services/api";

type Tab = "PENDING" | "ALL";
const tabs: Tab[] = ["PENDING", "ALL"];

function statusBadge(status: PaymentStatus) {
  const cfg: Record<PaymentStatus, string> = {
    PENDING: "bg-amber-100 text-amber-700",
    COMPLETED: "bg-[#EAF7E8] text-[#00A94F]",
    FAILED: "bg-red-100 text-red-700",
    CANCELLED: "bg-[#F3F8EF] text-[#68736E]",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg[status]}`}>
      {status === "PENDING" && <IconClock size={12} />}
      {status === "COMPLETED" && <IconCheck size={12} />}
      {status === "FAILED" && <IconX size={12} />}
      {status}
    </span>
  );
}

export default function Support() {
  const [payments, setPayments] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("PENDING");
  const [selected, setSelected] = useState<PaymentRequest | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [rejectModal, setRejectModal] = useState<PaymentRequest | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [search, setSearch] = useState("");
  const [note, setNote] = useState("");

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (tab === "PENDING") params.status = "PENDING";
      const data = await paymentsAPI.getAll(params);
      setPayments(data.payments || []);
    } catch (err: any) {
      showToast("error", err.message || "Failed to load payments");
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => { fetchPayments(); }, [fetchPayments]);

  const openDetail = async (id: string) => {
    setDetailLoading(true);
    setSelected(null);
    setNote("");
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
    setActionLoading(true);
    try {
      await paymentsAPI.approve(id);
      showToast("success", "Payment approved — wallet updated successfully");
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
        <div className={`fixed top-4 right-4 z-[100] px-5 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${toast.type === "success" ? "bg-[#00A94F]" : "bg-red-600"}`}>
          {toast.message}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-[#10211D]">Payment Support</h1>
        <p className="mt-1 text-sm text-[#68736E]">Review and verify user payments. Check screenshots and transaction IDs before approving.</p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl border border-[#DDE4DE] shadow-[0_8px_30px_rgba(16,33,29,0.05)] p-4">
          <p className="text-xs text-[#68736E] uppercase tracking-wider">Pending Review</p>
          <p className="text-2xl font-bold text-amber-600 mt-1">{payments.filter(p => p.status === "PENDING").length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#DDE4DE] shadow-[0_8px_30px_rgba(16,33,29,0.05)] p-4">
          <p className="text-xs text-[#68736E] uppercase tracking-wider">Deposits</p>
          <p className="text-2xl font-bold text-[#00A94F] mt-1">{payments.filter(p => p.type === "DEPOSIT" && p.status === "PENDING").length}</p>
        </div>
        <div className="bg-white rounded-2xl border border-[#DDE4DE] shadow-[0_8px_30px_rgba(16,33,29,0.05)] p-4">
          <p className="text-xs text-[#68736E] uppercase tracking-wider">Withdrawals</p>
          <p className="text-2xl font-bold text-[#10211D] mt-1">{payments.filter(p => p.type === "WITHDRAWAL" && p.status === "PENDING").length}</p>
        </div>
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="inline-flex rounded-xl border border-[#DDE4DE] p-1 bg-white self-start">
          {tabs.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === t ? "bg-[#EAF7E8] text-[#00A94F]" : "text-[#68736E] hover:bg-[#F3F8EF]"}`}>
              {t === "PENDING" ? "Pending Review" : "All Payments"}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-sm">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#89938E]" />
          <input type="text" placeholder="Search by name, email, transaction ID..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#DDE4DE] bg-white text-sm text-[#10211D] placeholder-[#89938E] focus:outline-none focus:ring-2 focus:ring-[#00A94F]/50 focus:border-[#00A94F]" />
        </div>
      </div>

      {/* Payment List */}
      <div className="bg-white rounded-2xl border border-[#DDE4DE] shadow-[0_8px_30px_rgba(16,33,29,0.05)] overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-sm text-[#68736E] flex items-center justify-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#00A94F] border-t-transparent" /> Loading...
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-14 w-14 rounded-full bg-[#F3F8EF] flex items-center justify-center mb-4">
              <IconWallet className="h-7 w-7 text-[#89938E]" />
            </div>
            <p className="text-sm font-medium text-[#10211D]">
              {tab === "PENDING" ? "No pending payments to review" : "No payment requests"}
            </p>
            <p className="text-xs text-[#68736E] mt-1">
              {tab === "PENDING" ? "All caught up!" : "Payment requests will appear here"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#DDE4DE]">
            {filtered.map((p) => (
              <div key={p.id} onClick={() => openDetail(p.id)}
                className="flex items-center gap-4 px-5 py-4 hover:bg-[#F3F8EF] transition-colors cursor-pointer">
                <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                  p.type === "DEPOSIT" ? "bg-[#EAF7E8]" : "bg-[#F3F8EF]"
                }`}>
                  {p.type === "DEPOSIT"
                    ? <IconArrowDownLeft className="h-5 w-5 text-[#00A94F]" />
                    : <IconArrowUpRight className="h-5 w-5 text-[#10211D]" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-[#10211D] text-sm">{p.user?.name || "Unknown"}</p>
                    <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${
                      p.type === "DEPOSIT" ? "bg-[#EAF7E8] text-[#00A94F]" : "bg-[#F3F8EF] text-[#10211D]"
                    }`}>
                      {p.type === "DEPOSIT" ? "Deposit" : "Withdrawal"}
                    </span>
                  </div>
                  <p className="text-xs text-[#68736E] truncate">
                    {p.type === "DEPOSIT" ? `UTR: ${p.transactionId || "—"}` : `UPI: ${p.upiId || "—"}`}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-semibold text-[#10211D]">{fmtAmt(p)}</p>
                  <p className="text-xs text-[#68736E]">{fmtDate(p.createdAt)}</p>
                </div>
                <div className="shrink-0">
                  {statusBadge(p.status)}
                </div>
                <IconEye className="h-4 w-4 text-[#89938E] shrink-0" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Panel */}
      {(selected || detailLoading) && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => !actionLoading && setSelected(null)} />
          <div className="relative w-full max-w-lg bg-white shadow-2xl overflow-y-auto">
            {detailLoading ? (
              <div className="p-6 text-sm text-[#68736E] flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#00A94F] border-t-transparent" /> Loading details...
              </div>
            ) : selected ? (
              <>
                <div className="sticky top-0 z-10 bg-white border-b border-[#DDE4DE] px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-[#F3F8EF] text-[#68736E]"><IconChevronLeft size={18} /></button>
                    <h2 className="text-lg font-semibold text-[#10211D]">
                      {selected.type === "DEPOSIT" ? "Deposit Verification" : "Withdrawal Request"}
                    </h2>
                  </div>
                  {statusBadge(selected.status)}
                </div>

                <div className="p-6 space-y-5">
                  {/* User Info */}
                  <section>
                    <h3 className="text-xs font-semibold text-[#89938E] uppercase tracking-wider mb-2">User</h3>
                    <div className="bg-[#F3F8EF] rounded-xl p-4 text-sm">
                      <div className="flex justify-between mb-1"><span className="text-[#68736E]">Name</span><span className="font-medium text-[#10211D]">{selected.user?.name || "-"}</span></div>
                      <div className="flex justify-between"><span className="text-[#68736E]">Email</span><span className="font-medium text-[#10211D] text-right break-all">{selected.user?.email || "-"}</span></div>
                    </div>
                  </section>

                  {/* Payment Details */}
                  <section>
                    <h3 className="text-xs font-semibold text-[#89938E] uppercase tracking-wider mb-2">Payment Details</h3>
                    <div className="bg-[#F3F8EF] rounded-xl p-4 text-sm space-y-2">
                      <div className="flex justify-between"><span className="text-[#68736E]">Amount</span><span className="font-bold text-[#10211D] text-lg">{fmtAmt(selected)}</span></div>
                      <div className="flex justify-between"><span className="text-[#68736E]">Type</span><span className="font-medium text-[#10211D]">{selected.type === "DEPOSIT" ? "Deposit" : "Withdrawal"}</span></div>
                      {selected.type === "DEPOSIT" ? (
                        <div className="flex justify-between"><span className="text-[#68736E]">Transaction ID / UTR</span><span className="font-mono text-xs text-[#10211D] text-right">{selected.transactionId || "-"}</span></div>
                      ) : (
                        <div className="flex justify-between"><span className="text-[#68736E]">User UPI ID</span><span className="font-mono text-xs text-[#10211D] text-right">{selected.upiId || "-"}</span></div>
                      )}
                      <div className="flex justify-between"><span className="text-[#68736E]">Submitted</span><span className="text-[#10211D] text-right">{fmtDate(selected.createdAt)}</span></div>
                      {selected.processedAt && <div className="flex justify-between"><span className="text-[#68736E]">Processed</span><span className="text-[#10211D] text-right">{fmtDate(selected.processedAt)}</span></div>}
                    </div>
                  </section>

                  {/* Screenshot for deposits */}
                  {selected.type === "DEPOSIT" && selected.screenshotUrl && (
                    <section>
                      <h3 className="text-xs font-semibold text-[#89938E] uppercase tracking-wider mb-2">Payment Screenshot</h3>
                      <a href={selected.screenshotUrl} target="_blank" rel="noopener noreferrer" className="block rounded-xl overflow-hidden border border-[#DDE4DE] hover:border-[#00A94F] transition-colors group">
                        <img src={selected.screenshotUrl} alt="Payment proof" className="w-full object-contain max-h-80 bg-[#F3F8EF]" />
                        <div className="px-4 py-2 text-xs text-[#68736E] flex items-center gap-1 group-hover:text-[#00A94F]">
                          <IconEye size={14} /> Click to open full size
                        </div>
                      </a>
                    </section>
                  )}

                  {/* Withdrawal note */}
                  {selected.type === "WITHDRAWAL" && (
                    <div className="rounded-xl border border-[#DDE4DE] bg-[#F3F8EF] p-4 text-sm text-[#10211D]">
                      Send <strong>{fmtAmt(selected)}</strong> to the user&apos;s UPI: <strong className="font-mono">{selected.upiId}</strong>. Then approve to deduct from their wallet.
                    </div>
                  )}

                  {/* Verification Checklist for Deposits */}
                  {selected.type === "DEPOSIT" && selected.status === "PENDING" && (
                    <section className="rounded-xl border border-[#DDE4DE] bg-[#EAF7E8] p-4">
                      <h3 className="text-xs font-semibold text-[#10211D] uppercase tracking-wider mb-2">Verification Checklist</h3>
                      <ul className="text-sm text-[#10211D] space-y-1.5">
                        <li className="flex items-start gap-2">
                          <IconCheck size={14} className="mt-0.5 shrink-0 text-[#00A94F]" />
                          Check screenshot matches the UPI ID / amount
                        </li>
                        <li className="flex items-start gap-2">
                          <IconCheck size={14} className="mt-0.5 shrink-0 text-[#00A94F]" />
                          Verify Transaction ID / UTR is valid
                        </li>
                        <li className="flex items-start gap-2">
                          <IconCheck size={14} className="mt-0.5 shrink-0 text-[#00A94F]" />
                          Confirm amount matches what user requested
                        </li>
                      </ul>
                    </section>
                  )}

                  {/* Internal Note */}
                  {selected.status === "PENDING" && (
                    <section>
                      <label className="text-xs font-semibold text-[#89938E] uppercase tracking-wider">Internal Note (optional)</label>
                      <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Add a note for the record..." rows={2}
                        className="mt-1 w-full px-3 py-2 rounded-lg border border-[#DDE4DE] bg-[#F3F8EF] text-sm text-[#10211D] focus:outline-none focus:ring-2 focus:ring-[#00A94F]/50 resize-none" />
                    </section>
                  )}

                  {/* Actions */}
                  {selected.status === "PENDING" && (
                    <section className="flex gap-3 pt-2">
                      <button onClick={() => handleApprove(selected.id)} disabled={actionLoading}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-[#00A94F] hover:bg-[#00A94F]/90 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors">
                        {actionLoading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <IconCheck size={16} />}
                        Approve & Credit Wallet
                      </button>
                      <button onClick={() => { setRejectModal(selected); setRejectReason(""); }} disabled={actionLoading}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors">
                        <IconX size={16} /> Reject
                      </button>
                    </section>
                  )}

                  {selected.status !== "PENDING" && (
                    <div className="flex items-center gap-2 px-4 py-3 bg-[#F3F8EF] rounded-xl text-sm text-[#68736E]">
                      <IconMessageCircle size={16} /> This request has been {selected.status.toLowerCase()}.
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => !actionLoading && setRejectModal(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 mx-4">
            <h3 className="text-lg font-semibold text-[#10211D]">
              Reject {rejectModal.type === "DEPOSIT" ? "Deposit" : "Withdrawal"}
            </h3>
            <p className="text-sm text-[#68736E]">Provide a reason. The user will be notified.</p>
            <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="e.g. Payment not received / screenshot unclear / UTR invalid..." rows={4}
              className="w-full px-4 py-3 rounded-xl border border-[#DDE4DE] bg-[#F3F8EF] text-sm text-[#10211D] focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none" />
            <div className="flex gap-3 justify-end">
              <button onClick={() => setRejectModal(null)} disabled={actionLoading} className="px-4 py-2.5 rounded-xl border border-[#DDE4DE] text-sm font-medium text-[#68736E]">Cancel</button>
              <button onClick={handleReject} disabled={actionLoading}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-semibold flex items-center gap-2">
                {actionLoading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <IconX size={16} />} Reject
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
