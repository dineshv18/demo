/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import {
  IconCoin, IconArrowDownLeft, IconArrowUpRight, IconClock, IconCheck, IconX,
  IconWallet,
} from "@tabler/icons-react";
import {
  platformWalletAPI,
  type PlatformWalletData, type PlatformLedgerEntry, type PlatformWithdrawalRecord,
} from "../services/api";

type Tab = "ledger" | "withdrawals";

function statusBadge(status: PlatformWithdrawalRecord["status"]) {
  const cfg: Record<PlatformWithdrawalRecord["status"], { label: string; color: string; bg: string; icon: any }> = {
    PENDING: { label: "Pending", color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/30", icon: IconClock },
    COMPLETED: { label: "Completed", color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/30", icon: IconCheck },
    REJECTED: { label: "Rejected", color: "text-red-600", bg: "bg-red-100 dark:bg-red-900/30", icon: IconX },
  };
  const s = cfg[status];
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.color}`}>
      <Icon size={12} /> {s.label}
    </span>
  );
}

export default function PlatformWallet() {
  const [wallet, setWallet] = useState<PlatformWalletData | null>(null);
  const [pendingWithdrawal, setPendingWithdrawal] = useState<PlatformWithdrawalRecord | null>(null);
  const [ledger, setLedger] = useState<PlatformLedgerEntry[]>([]);
  const [withdrawals, setWithdrawals] = useState<PlatformWithdrawalRecord[]>([]);
  const [tab, setTab] = useState<Tab>("ledger");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [amount, setAmount] = useState("");
  const [destination, setDestination] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [processingId, setProcessingId] = useState<string | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [walletRes, ledgerRes, withdrawalsRes] = await Promise.allSettled([
        platformWalletAPI.get(),
        platformWalletAPI.getLedger({ limit: 20 }),
        platformWalletAPI.getWithdrawals({ limit: 20 }),
      ]);
      if (walletRes.status === "fulfilled") {
        setWallet(walletRes.value.wallet);
        setPendingWithdrawal(walletRes.value.pendingWithdrawal);
      }
      if (ledgerRes.status === "fulfilled") setLedger(ledgerRes.value.entries);
      if (withdrawalsRes.status === "fulfilled") setWithdrawals(withdrawalsRes.value.withdrawals);
    } catch (err: any) {
      showToast("error", err.message || "Failed to load platform wallet");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleRequestWithdrawal = async () => {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) { showToast("error", "Enter a valid amount"); return; }
    if (!destination.trim()) { showToast("error", "Destination is required"); return; }
    setSubmitting(true);
    try {
      await platformWalletAPI.requestWithdrawal({ amount: amt, destination: destination.trim(), note: note.trim() || undefined });
      showToast("success", "Withdrawal request created");
      setShowWithdrawForm(false);
      setAmount("");
      setDestination("");
      setNote("");
      await fetchAll();
    } catch (err: any) {
      showToast("error", err.message || "Failed to create withdrawal request");
    } finally {
      setSubmitting(false);
    }
  };

  const handleProcess = async (id: string, action: "approve" | "reject") => {
    setProcessingId(id);
    try {
      await platformWalletAPI.processWithdrawal(id, action);
      showToast("success", `Withdrawal ${action === "approve" ? "approved" : "rejected"}`);
      await fetchAll();
    } catch (err: any) {
      showToast("error", err.message || "Failed to process withdrawal");
    } finally {
      setProcessingId(null);
    }
  };

  const fmtDate = (d: string) => new Date(d).toLocaleString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
  const balance = wallet ? parseFloat(wallet.balance) : 0;

  if (loading) {
    return <div className="p-6 text-center text-sm text-gray-500">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] px-5 py-3 rounded-lg shadow-lg text-sm font-medium text-white ${toast.type === "success" ? "bg-emerald-600" : "bg-red-600"}`}>
          {toast.message}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Platform Wallet</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Accumulated maintenance-fee share from Index investments where the referral chain didn't cover all levels.
        </p>
      </div>

      {/* Balance Card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-xl bg-violet-500/10">
              <IconWallet className="h-7 w-7 text-violet-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Platform Balance</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-0.5">${balance.toFixed(2)}</p>
            </div>
          </div>
          <button
            onClick={() => setShowWithdrawForm((v) => !v)}
            disabled={balance <= 0 || !!pendingWithdrawal}
            title={pendingWithdrawal ? "A withdrawal request is already pending" : balance <= 0 ? "No balance" : undefined}
            className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold"
          >
            {showWithdrawForm ? "Cancel" : "Request Withdrawal"}
          </button>
        </div>

        {pendingWithdrawal && (
          <div className="mt-4 rounded-xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10 p-4 text-sm text-amber-700 dark:text-amber-300">
            A withdrawal of <strong>${parseFloat(pendingWithdrawal.amount).toFixed(2)}</strong> to <strong>{pendingWithdrawal.destination}</strong> is pending review.
          </div>
        )}

        {showWithdrawForm && (
          <div className="mt-4 rounded-xl border border-gray-200 dark:border-gray-800 p-4 space-y-3">
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Amount ($) *</label>
              <input type="number" step="0.01" min="0" max={balance} value={amount} onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Destination (bank / UPI details) *</label>
              <input type="text" value={destination} onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. bank account or UPI ID"
                className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Note (optional)</label>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2}
                className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none" />
            </div>
            <button onClick={handleRequestWithdrawal} disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 disabled:opacity-50 text-white text-sm font-semibold">
              {submitting ? "Submitting..." : "Submit Request"}
            </button>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="inline-flex rounded-xl border border-gray-200 dark:border-gray-800 p-1 bg-white dark:bg-gray-900">
        {(["ledger", "withdrawals"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${tab === t ? "bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"}`}>
            {t === "ledger" && <IconCoin size={16} />}
            {t === "withdrawals" && <IconArrowUpRight size={16} />}
            {t === "ledger" ? "Ledger" : "Withdrawal Requests"}
          </button>
        ))}
      </div>

      {tab === "ledger" && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          {ledger.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <IconCoin className="h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm font-medium text-gray-900 dark:text-white">No ledger entries yet</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Fee credits appear here when a referral chain doesn't cover all levels.</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  <th className="text-left px-5 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Type</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Investor</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Description</th>
                  <th className="text-right px-5 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Amount</th>
                  <th className="text-right px-5 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {ledger.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-5 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${e.type === "FEE_CREDIT" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                        {e.type === "FEE_CREDIT" ? <IconArrowDownLeft size={14} /> : <IconArrowUpRight size={14} />}
                        {e.type === "FEE_CREDIT" ? "Fee Credit" : "Withdrawal"}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {e.investor ? (
                        <div>
                          <p className="text-gray-900 dark:text-white font-medium text-xs">{e.investor.name}</p>
                          <p className="text-gray-500 dark:text-gray-400 text-[11px]">{e.investor.email}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-gray-600 dark:text-gray-400 text-xs max-w-[240px] truncate">{e.description || "-"}</td>
                    <td className={`px-5 py-4 text-right font-semibold ${e.type === "FEE_CREDIT" ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                      {e.type === "FEE_CREDIT" ? "+" : "-"}${parseFloat(e.amount).toFixed(2)}
                    </td>
                    <td className="px-5 py-4 text-right text-gray-500 dark:text-gray-400 text-xs">{fmtDate(e.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === "withdrawals" && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          {withdrawals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <IconArrowUpRight className="h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm font-medium text-gray-900 dark:text-white">No withdrawal requests yet</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-gray-800">
              {withdrawals.map((w) => (
                <div key={w.id} className="p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900 dark:text-white">${parseFloat(w.amount).toFixed(2)}</p>
                      {statusBadge(w.status)}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">To: {w.destination}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Requested by {w.requester?.name || "-"} on {fmtDate(w.createdAt)}</p>
                    {w.processedAt && (
                      <p className="text-xs text-gray-500 dark:text-gray-400">Processed by {w.processor?.name || "-"} on {fmtDate(w.processedAt)}</p>
                    )}
                    {w.note && <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 italic">Note: {w.note}</p>}
                  </div>
                  {w.status === "PENDING" && (
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => handleProcess(w.id, "approve")} disabled={processingId === w.id}
                        className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-semibold">
                        Approve
                      </button>
                      <button onClick={() => handleProcess(w.id, "reject")} disabled={processingId === w.id}
                        className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-semibold">
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
