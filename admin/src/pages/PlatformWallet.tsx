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
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../components/ui/table";

type Tab = "ledger" | "withdrawals";

function statusBadge(status: PlatformWithdrawalRecord["status"]) {
  const cfg: Record<PlatformWithdrawalRecord["status"], { label: string; color: string; bg: string; icon: any }> = {
    PENDING: { label: "Pending", color: "text-amber-700", bg: "bg-amber-100", icon: IconClock },
    COMPLETED: { label: "Completed", color: "text-[#00A94F]", bg: "bg-[#EAF7E8]", icon: IconCheck },
    REJECTED: { label: "Rejected", color: "text-red-700", bg: "bg-red-100", icon: IconX },
  };
  const s = cfg[status];
  const Icon = s.icon;
  return (
    <Badge className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${s.bg} ${s.color}`}>
      <Icon size={12} /> {s.label}
    </Badge>
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
    return <div className="p-6 text-center text-sm text-[#68736E]">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] px-5 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${toast.type === "success" ? "bg-[#00A94F]" : "bg-red-600"}`}>
          {toast.message}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-[#10211D]">Platform Wallet</h1>
        <p className="mt-1 text-sm text-[#68736E]">
          Accumulated maintenance-fee share from Index investments where the referral chain didn't cover all levels.
        </p>
      </div>

      {/* Balance Card */}
      <Card className="rounded-2xl border border-[#DDE4DE] p-6 shadow-[0_8px_30px_rgba(16,33,29,0.05)]">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-xl bg-[#EAF7E8]">
              <IconWallet className="h-7 w-7 text-[#00A94F]" />
            </div>
            <div>
              <p className="text-sm text-[#68736E]">Platform Balance</p>
              <p className="text-3xl font-bold text-[#10211D] mt-0.5">${balance.toFixed(2)}</p>
            </div>
          </div>
          <Button
            onClick={() => setShowWithdrawForm((v) => !v)}
            disabled={balance <= 0 || !!pendingWithdrawal}
            title={pendingWithdrawal ? "A withdrawal request is already pending" : balance <= 0 ? "No balance" : undefined}
            className="px-5 py-2.5 rounded-xl bg-[#10211D] hover:bg-[#10211D]/90 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold"
          >
            {showWithdrawForm ? "Cancel" : "Request Withdrawal"}
          </Button>
        </div>

        {pendingWithdrawal && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
            A withdrawal of <strong>${parseFloat(pendingWithdrawal.amount).toFixed(2)}</strong> to <strong>{pendingWithdrawal.destination}</strong> is pending review.
          </div>
        )}

        {showWithdrawForm && (
          <div className="mt-4 rounded-xl border border-[#DDE4DE] p-4 space-y-3">
            <div>
              <label className="text-xs font-medium text-[#68736E]">Amount ($) *</label>
              <Input type="number" step="0.01" min="0" max={balance} value={amount} onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="mt-1 rounded-xl border-[#DDE4DE] bg-[#F3F8EF] text-sm text-[#10211D] focus-visible:ring-[#00A94F]/50" />
            </div>
            <div>
              <label className="text-xs font-medium text-[#68736E]">Destination (bank / UPI details) *</label>
              <Input type="text" value={destination} onChange={(e) => setDestination(e.target.value)}
                placeholder="e.g. bank account or UPI ID"
                className="mt-1 rounded-xl border-[#DDE4DE] bg-[#F3F8EF] text-sm text-[#10211D] focus-visible:ring-[#00A94F]/50" />
            </div>
            <div>
              <label className="text-xs font-medium text-[#68736E]">Note (optional)</label>
              <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2}
                className="mt-1 w-full px-4 py-2.5 rounded-xl border border-[#DDE4DE] bg-[#F3F8EF] text-sm text-[#10211D] focus:outline-none focus:ring-2 focus:ring-[#00A94F]/50 resize-none" />
            </div>
            <Button onClick={handleRequestWithdrawal} disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-[#10211D] hover:bg-[#10211D]/90 disabled:opacity-50 text-white text-sm font-semibold">
              {submitting ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        )}
      </Card>

      {/* Tabs */}
      <div className="inline-flex rounded-xl border border-[#DDE4DE] p-1 bg-white">
        {(["ledger", "withdrawals"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${tab === t ? "bg-[#EAF7E8] text-[#00A94F]" : "text-[#68736E] hover:bg-[#F3F8EF]"}`}>
            {t === "ledger" && <IconCoin size={16} />}
            {t === "withdrawals" && <IconArrowUpRight size={16} />}
            {t === "ledger" ? "Ledger" : "Withdrawal Requests"}
          </button>
        ))}
      </div>

      {tab === "ledger" && (
        <Card className="rounded-2xl border border-[#DDE4DE] overflow-hidden shadow-[0_8px_30px_rgba(16,33,29,0.05)] py-0">
          {ledger.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <IconCoin className="h-8 w-8 text-[#89938E] mb-2" />
              <p className="text-sm font-medium text-[#10211D]">No ledger entries yet</p>
              <p className="text-xs text-[#68736E] mt-1">Fee credits appear here when a referral chain doesn't cover all levels.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F3F8EF]">
                    <TableHead>Type</TableHead>
                    <TableHead>Investor</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ledger.map((e) => (
                    <TableRow key={e.id}>
                      <TableCell>
                        <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${e.type === "FEE_CREDIT" ? "text-[#00A94F]" : "text-red-600"}`}>
                          {e.type === "FEE_CREDIT" ? <IconArrowDownLeft size={14} /> : <IconArrowUpRight size={14} />}
                          {e.type === "FEE_CREDIT" ? "Fee Credit" : "Withdrawal"}
                        </span>
                      </TableCell>
                      <TableCell>
                        {e.investor ? (
                          <div>
                            <p className="text-[#10211D] font-medium text-xs">{e.investor.name}</p>
                            <p className="text-[#68736E] text-[11px]">{e.investor.email}</p>
                          </div>
                        ) : (
                          <span className="text-[#89938E] text-xs">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-[#68736E] text-xs max-w-[240px] truncate">{e.description || "-"}</TableCell>
                      <TableCell className={`text-right font-semibold ${e.type === "FEE_CREDIT" ? "text-[#00A94F]" : "text-red-600"}`}>
                        {e.type === "FEE_CREDIT" ? "+" : "-"}${parseFloat(e.amount).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right text-[#68736E] text-xs">{fmtDate(e.createdAt)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      )}

      {tab === "withdrawals" && (
        <Card className="rounded-2xl border border-[#DDE4DE] overflow-hidden shadow-[0_8px_30px_rgba(16,33,29,0.05)] py-0">
          {withdrawals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <IconArrowUpRight className="h-8 w-8 text-[#89938E] mb-2" />
              <p className="text-sm font-medium text-[#10211D]">No withdrawal requests yet</p>
            </div>
          ) : (
            <div className="divide-y divide-[#DDE4DE]">
              {withdrawals.map((w) => (
                <div key={w.id} className="p-5 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-[#10211D]">${parseFloat(w.amount).toFixed(2)}</p>
                      {statusBadge(w.status)}
                    </div>
                    <p className="text-xs text-[#68736E] mt-1">To: {w.destination}</p>
                    <p className="text-xs text-[#68736E]">Requested by {w.requester?.name || "-"} on {fmtDate(w.createdAt)}</p>
                    {w.processedAt && (
                      <p className="text-xs text-[#68736E]">Processed by {w.processor?.name || "-"} on {fmtDate(w.processedAt)}</p>
                    )}
                    {w.note && <p className="text-xs text-[#68736E] mt-1 italic">Note: {w.note}</p>}
                  </div>
                  {w.status === "PENDING" && (
                    <div className="flex gap-2 shrink-0">
                      <Button onClick={() => handleProcess(w.id, "approve")} disabled={processingId === w.id}
                        className="px-4 py-2 rounded-xl bg-[#00A94F] hover:bg-[#00A94F]/90 disabled:opacity-50 text-white text-xs font-semibold">
                        Approve
                      </Button>
                      <Button onClick={() => handleProcess(w.id, "reject")} disabled={processingId === w.id}
                        className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-semibold">
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
