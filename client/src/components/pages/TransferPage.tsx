"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import {
  IconLoader2, IconAlertCircle, IconLock, IconShieldCheck,
  IconSearch, IconUser, IconWallet, IconGift, IconArrowsExchange,
  IconClock, IconCheck, IconX, IconInfoCircle, IconRefresh,
} from "@tabler/icons-react";
import {
  walletAPI, kycAPI, transferAPI,
  type WalletData, type KycData, type TransferRecipient, type InternalTransfer,
} from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type SourceType = "WALLET" | "BONUS";

function statusBadge(status: InternalTransfer["status"]) {
  const cfg: Record<InternalTransfer["status"], { label: string; color: string; bg: string; icon: typeof IconClock }> = {
    PENDING: { label: "Pending Review", color: "text-amber-600", bg: "bg-amber-100", icon: IconClock },
    APPROVED: { label: "Completed", color: "text-emerald-600", bg: "bg-emerald-100", icon: IconCheck },
    REJECTED: { label: "Rejected", color: "text-red-600", bg: "bg-red-100", icon: IconX },
  };
  const s = cfg[status];
  const Icon = s.icon;
  return (
    <Badge variant="outline" className={`gap-1 border-transparent font-semibold ${s.color} ${s.bg}`}>
      <Icon size={10} /> {s.label}
    </Badge>
  );
}

export default function TransferPage() {
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [kyc, setKyc] = useState<KycData | null>(null);
  const [myTransfers, setMyTransfers] = useState<InternalTransfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<TransferRecipient[]>([]);
  const [searching, setSearching] = useState(false);
  const [recipient, setRecipient] = useState<TransferRecipient | null>(null);

  const [sourceType, setSourceType] = useState<SourceType>("WALLET");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [sendLoading, setSendLoading] = useState(false);
  const [sendError, setSendError] = useState("");
  const [sendSuccess, setSendSuccess] = useState("");

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [walletRes, kycRes, transfersRes] = await Promise.allSettled([
        walletAPI.getWallet(),
        kycAPI.getStatus(),
        transferAPI.getMyTransfers(),
      ]);
      if (walletRes.status === "fulfilled") setWallet(walletRes.value.wallet);
      if (kycRes.status === "fulfilled") setKyc(kycRes.value.kyc);
      if (transfersRes.status === "fulfilled") setMyTransfers(transfersRes.value.transfers);
    } catch {
      setError("Failed to load transfer data");
    } finally {
      setLoading(false);
    }
  }, []);

  const [refreshing, setRefreshing] = useState(false);
  const refreshTransfers = useCallback(async () => {
    setRefreshing(true);
    try {
      const transfersRes = await transferAPI.getMyTransfers();
      setMyTransfers(transfersRes.transfers);
    } catch {
      // silent — this is a background refresh, not the initial load
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Transfer approval happens on the admin side, so poll for status changes
  // (e.g. Pending Review -> Completed) while this page stays open.
  useEffect(() => {
    const interval = setInterval(refreshTransfers, 20000);
    return () => clearInterval(interval);
  }, [refreshTransfers]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await transferAPI.searchRecipients(query.trim());
        setResults(res.users);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 350);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query]);

  const selectRecipient = (u: TransferRecipient) => {
    setRecipient(u);
    setQuery("");
    setResults([]);
    setSendError("");
    setSendSuccess("");
  };

  const handleSend = async () => {
    const amt = parseFloat(amount);
    if (!recipient) {
      setSendError("Please select who you're sending to");
      return;
    }
    if (!amount || isNaN(amt) || amt <= 0) {
      setSendError("Enter a valid amount");
      return;
    }
    setSendLoading(true);
    setSendError("");
    setSendSuccess("");
    try {
      const res = await transferAPI.create({
        receiverId: recipient.id,
        sourceType,
        amount: amt,
        note: note.trim() || undefined,
      });
      setSendSuccess(res.message);
      setRecipient(null);
      setAmount("");
      setNote("");
      await fetchData();
    } catch (err) {
      setSendError(err instanceof Error ? err.message : "Transfer request failed");
    } finally {
      setSendLoading(false);
    }
  };

  const kycApproved = kyc?.status === "APPROVED";
  const balance = wallet ? parseFloat(wallet.balance) : 0;
  const bonusBalance = wallet ? parseFloat(wallet.bonusBalance) : 0;
  const sourceBalance = sourceType === "BONUS" ? bonusBalance : balance;

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <IconLoader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  if (!kycApproved) {
    return (
      <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6">
        <div>
          <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight">Internal Transfer</h1>
          <p className="text-muted-foreground text-xs sm:text-sm mt-1">Transfer funds directly to another ORVANTA user&apos;s wallet.</p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3">
          <div className="flex items-start sm:items-center gap-3 flex-1">
            <IconAlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <p className="text-sm font-medium text-amber-600 dark:text-amber-400">One quick step first: verify your identity</p>
              <p className="text-xs text-amber-600/70 dark:text-amber-400/70 mt-0.5">Both you and the recipient need approved KYC before sending or receiving an internal transfer.</p>
            </div>
          </div>
          <Button asChild size="sm" className="shrink-0 self-start sm:self-auto bg-amber-500 hover:bg-amber-600">
            <Link href="/dashboard/kyc">{kyc?.status === "PENDING" ? "Check KYC Status" : "Complete KYC"}</Link>
          </Button>
        </div>
        <Card className="px-6 py-16 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-muted mb-4">
            <IconLock className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="font-display text-xl font-semibold">Transfers Locked for Now</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto leading-relaxed">
            Verify your identity (KYC) to send funds to another verified user.
          </p>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <IconAlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
        <Button variant="outline" onClick={fetchData} className="gap-2">Retry</Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4 sm:space-y-6 pb-8">
      <div>
        <h1 className="font-display text-xl sm:text-2xl font-bold tracking-tight">Internal Transfer</h1>
        <p className="text-muted-foreground text-xs sm:text-sm mt-1">Transfer funds directly to another ORVANTA user — reviewed and completed within 12-24 working hours.</p>
      </div>

      {/* Send form */}
      <Card className="p-4 sm:p-6 gap-0">
        <h2 className="font-display text-base sm:text-lg font-semibold mb-4">New Transfer</h2>

        {sendError && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive mb-3">
            <IconAlertCircle className="h-3.5 w-3.5 shrink-0" /> {sendError}
          </div>
        )}
        {sendSuccess && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-600 dark:text-emerald-400 mb-3">
            <IconShieldCheck className="h-3.5 w-3.5 shrink-0" /> {sendSuccess}
          </div>
        )}

        <div className="space-y-4">
          {/* Recipient search */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Send to</label>
            {recipient ? (
              <div className="flex items-center justify-between gap-3 rounded-xl border border-brand/30 bg-brand/5 px-3.5 py-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand/10 text-brand font-bold text-xs">
                    {recipient.name?.charAt(0)?.toUpperCase() || "?"}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{recipient.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{recipient.email}</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={() => setRecipient(null)}>Change</Button>
              </div>
            ) : (
              <div className="relative">
                <div className="relative">
                  <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search by name, email, or phone"
                    className="pl-9"
                  />
                </div>
                {query.trim().length >= 2 && (
                  <div className="mt-2 rounded-xl border border-border bg-card divide-y divide-border overflow-hidden">
                    {searching ? (
                      <div className="flex items-center gap-2 px-3.5 py-3 text-xs text-muted-foreground">
                        <IconLoader2 className="h-3.5 w-3.5 animate-spin" /> Searching...
                      </div>
                    ) : results.length > 0 ? (
                      results.map((u) => (
                        <button
                          key={u.id}
                          type="button"
                          onClick={() => selectRecipient(u)}
                          className="w-full flex items-center gap-3 px-3.5 py-2.5 text-left hover:bg-accent transition-colors"
                        >
                          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground font-bold text-xs">
                            {u.name?.charAt(0)?.toUpperCase() || <IconUser className="h-4 w-4" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{u.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                          </div>
                          {!u.kycApproved && (
                            <span className="text-[10px] text-amber-600 shrink-0">Not KYC-verified</span>
                          )}
                        </button>
                      ))
                    ) : (
                      <div className="px-3.5 py-3 text-xs text-muted-foreground">No matching users found.</div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Source: wallet or bonus */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Send from</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSourceType("WALLET")}
                className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-3 text-left transition-colors ${sourceType === "WALLET" ? "border-brand bg-brand/5" : "border-border hover:bg-accent"}`}
              >
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-teal-500/10">
                  <IconWallet className="h-4 w-4 text-teal-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground">Wallet</p>
                  <p className="text-[11px] text-muted-foreground">${balance.toFixed(2)} available</p>
                </div>
              </button>
              <button
                type="button"
                onClick={() => setSourceType("BONUS")}
                className={`flex items-center gap-2.5 rounded-xl border px-3.5 py-3 text-left transition-colors ${sourceType === "BONUS" ? "border-brand bg-brand/5" : "border-border hover:bg-accent"}`}
              >
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-amber-500/10">
                  <IconGift className="h-4 w-4 text-amber-500" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground">Bonus</p>
                  <p className="text-[11px] text-muted-foreground">${bonusBalance.toFixed(2)} available</p>
                </div>
              </button>
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Amount to send"
                className="pl-7"
              />
            </div>
          </div>

          {/* Note (optional) */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Note (optional)</label>
            <Input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What's this for?"
              maxLength={140}
            />
          </div>

          <Button
            onClick={handleSend}
            disabled={sendLoading || !recipient || sourceBalance <= 0}
            className="w-full btn-glow btn-glow-hover gap-2"
          >
            {sendLoading ? (
              <>
                <IconLoader2 className="h-4 w-4 animate-spin" /> Submitting...
              </>
            ) : (
              <>
                <IconArrowsExchange className="h-4 w-4" /> Send Transfer Request
              </>
            )}
          </Button>

          <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/20 px-3.5 py-3">
            <IconInfoCircle className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              The amount is deducted from your balance right away and held until an admin reviews and completes the
              transfer (usually within 12-24 working hours). If it&apos;s rejected, your funds are returned in full.
            </p>
          </div>
        </div>
      </Card>

      {/* History */}
      <Card className="p-0 gap-0 overflow-hidden">
        <div className="p-4 sm:p-6 pb-0 flex items-center justify-between gap-2">
          <h2 className="font-display text-base sm:text-lg font-semibold">Your Transfers</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={refreshTransfers}
            disabled={refreshing}
            className="gap-1.5 text-muted-foreground hover:text-foreground"
          >
            <IconRefresh className={`size-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
        {myTransfers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-muted mb-4">
              <IconArrowsExchange className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <p className="text-sm font-medium text-foreground">No transfers yet</p>
            <p className="text-xs text-muted-foreground mt-1">Sent and received transfers will show up here.</p>
          </div>
        ) : (
          <div className="divide-y divide-border mt-4">
            {myTransfers.map((t) => {
              return (
                <div key={t.id} className="flex items-center gap-3 p-4">
                  <div className={`grid h-10 w-10 place-items-center rounded-full shrink-0 ${t.senderId === kyc?.userId ? "bg-red-500/10" : "bg-emerald-500/10"}`}>
                    <IconArrowsExchange className={`h-5 w-5 ${t.senderId === kyc?.userId ? "text-red-500" : "text-emerald-500"}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {t.senderId === kyc?.userId
                        ? `Sent to ${t.receiver?.name || "user"}`
                        : `Received from ${t.sender?.name || "user"}`}
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {new Date(t.createdAt).toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                      {t.status === "REJECTED" && t.rejectReason && ` · ${t.rejectReason}`}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-semibold ${t.senderId === kyc?.userId ? "text-foreground" : "text-emerald-600"}`}>
                      {t.senderId === kyc?.userId ? "−" : "+"}${parseFloat(t.senderId === kyc?.userId ? t.amount : t.netAmount).toFixed(2)}
                    </p>
                    <div className="mt-1">{statusBadge(t.status)}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
