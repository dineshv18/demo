"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  IconLoader2, IconAlertCircle, IconShieldCheck,
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
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeading } from "@/components/dashboard/SectionCard";
import { KycLockedState } from "@/components/dashboard/LockedState";
import { ListSkeleton, PanelSkeleton } from "@/components/dashboard/Skeletons";

type SourceType = "WALLET" | "BONUS";

function statusBadge(status: InternalTransfer["status"]) {
  const cfg: Record<InternalTransfer["status"], { label: string; color: string; bg: string; icon: typeof IconClock }> = {
    PENDING: { label: "Pending Review", color: "text-warning", bg: "bg-warning", icon: IconClock },
    APPROVED: { label: "Completed", color: "text-success", bg: "bg-success", icon: IconCheck },
    REJECTED: { label: "Rejected", color: "text-danger", bg: "bg-danger", icon: IconX },
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
      <div className="mx-auto max-w-3xl space-y-5">
        <div className="space-y-2">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-8 w-56" />
        </div>
        <PanelSkeleton lines={5} />
        <ListSkeleton rows={3} />
      </div>
    );
  }

  if (!kycApproved) {
    return (
      <div className="mx-auto max-w-3xl space-y-5 sm:space-y-6">
        <PageHeading
          eyebrow="Move funds"
          title="Internal Transfer"
          description="Send funds directly to another ORVANTA user's wallet."
        />
        <KycLockedState
          status={kyc?.status ?? "NOT_STARTED"}
          title="Transfers Locked for Now"
          description="Verify your identity (KYC) to send funds to another verified user. Both you and the recipient need approved KYC."
          pendingDescription="Your verification is being reviewed. Transfers unlock automatically once it's approved."
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <PageHeading eyebrow="Move funds" title="Internal Transfer" />
        <div role="alert" className="flex items-center gap-3 rounded-xl border border-danger/25 bg-danger-soft px-4 py-3 text-sm text-danger">
          <IconAlertCircle className="size-4 shrink-0" /> {error}
        </div>
        <Button variant="outline" onClick={fetchData} className="gap-2">Retry</Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5 pb-8 sm:space-y-6">
      <PageHeading
        eyebrow="Move funds"
        title="Internal Transfer"
        description="Send funds to another ORVANTA user — reviewed and completed within 12–24 working hours."
      />

      {/* Send form */}
      <Card className="gap-0 p-4 sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-accent text-brand ring-1 ring-brand/15">
            <IconArrowsExchange className="size-[18px]" stroke={1.75} />
          </span>
          <h2 className="text-section">New Transfer</h2>
        </div>

        {sendError && (
          <div className="flex items-center gap-2 rounded-lg border border-danger/25 bg-danger-soft px-3 py-2 text-xs text-destructive mb-3">
            <IconAlertCircle className="h-3.5 w-3.5 shrink-0" /> {sendError}
          </div>
        )}
        {sendSuccess && (
          <div className="flex items-center gap-2 rounded-lg border border-success/25 bg-success-soft px-3 py-2 text-xs text-success mb-3">
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
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand/10 text-brand font-bold text-xs">
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
                          <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground font-bold text-xs">
                            {u.name?.charAt(0)?.toUpperCase() || <IconUser className="h-4 w-4" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{u.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                          </div>
                          {!u.kycApproved && (
                            <span className="text-[10px] text-warning shrink-0">Not KYC-verified</span>
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
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-info-soft">
                  <IconWallet className="h-4 w-4 text-info" />
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
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-warning-soft">
                  <IconGift className="h-4 w-4 text-warning" />
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
            <div className="grid h-16 w-16 place-items-center rounded-lg bg-muted mb-4">
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
                  <div className={`grid h-10 w-10 place-items-center rounded-lg shrink-0 ${t.senderId === kyc?.userId ? "bg-danger-soft" : "bg-success-soft"}`}>
                    <IconArrowsExchange className={`h-5 w-5 ${t.senderId === kyc?.userId ? "text-danger" : "text-success"}`} />
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
                    <p className={`text-sm font-semibold ${t.senderId === kyc?.userId ? "text-foreground" : "text-success"}`}>
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
