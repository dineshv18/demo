"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  IconPlus, IconMinus, IconLoader2, IconAlertCircle,
  IconCheck, IconArrowUpRight, IconArrowDownLeft, IconClock,
  IconRefresh, IconLock, IconShieldCheck, IconUpload, IconCreditCard,
  IconCopy, IconGift, IconArrowRight,
} from "@tabler/icons-react";
import { walletAPI, kycAPI, type WalletData, type TransactionData, type KycData, type UsdPaymentInfo } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const currencySymbol = () => "$";

export default function WalletPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [usdPayment, setUsdPayment] = useState<UsdPaymentInfo | null>(null);
  const [currencyLocked, setCurrencyLocked] = useState(false);
  const [pendingRequest, setPendingRequest] = useState<TransactionData | null>(null);
  const [pendingBonusRequest, setPendingBonusRequest] = useState<TransactionData | null>(null);
  const [transactions, setTransactions] = useState<TransactionData[]>([]);
  const [kyc, setKyc] = useState<KycData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [depositOpen, setDepositOpen] = useState(false);
  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [depositStep, setDepositStep] = useState<"qr" | "details">("qr");
  const [depositAmount, setDepositAmount] = useState("");
  const [transactionId, setTransactionId] = useState("");
  const [screenshot, setScreenshot] = useState<File | null>(null);
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null);
  const [depositLoading, setDepositLoading] = useState(false);
  const [depositError, setDepositError] = useState("");
  const [depositSuccess, setDepositSuccess] = useState(false);

  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawUpiId, setWithdrawUpiId] = useState("");
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [withdrawError, setWithdrawError] = useState("");
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [withdrawSource, setWithdrawSource] = useState<"wallet" | "bonus">("wallet");

  const [transferOpen, setTransferOpen] = useState(false);
  const [transferAmount, setTransferAmount] = useState("");
  const [transferLoading, setTransferLoading] = useState(false);
  const [transferError, setTransferError] = useState("");
  const [transferSuccess, setTransferSuccess] = useState(false);

  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [walletRes, txRes, kycRes] = await Promise.allSettled([
        walletAPI.getWallet(),
        walletAPI.getTransactions(),
        kycAPI.getStatus(),
      ]);
      if (walletRes.status === "fulfilled") {
        setWallet(walletRes.value.wallet);
        setUsdPayment(walletRes.value.usdPayment || null);
        setPendingRequest(walletRes.value.pendingRequest);
        setPendingBonusRequest(walletRes.value.pendingBonusRequest);
        setCurrencyLocked(walletRes.value.currencyLocked);
      }
      if (txRes.status === "fulfilled") setTransactions(txRes.value.transactions);
      if (kycRes.status === "fulfilled") setKyc(kycRes.value.kyc);
    } catch {
      setError("Failed to load wallet data");
    } finally {
      setLoading(false);
    }
  };

  const kycApproved = kyc?.status === "APPROVED";
  const balance = wallet ? parseFloat(wallet.balance) : 0;
  const bonusBalance = wallet ? parseFloat(wallet.bonusBalance) : 0;
  const frozen = wallet ? parseFloat(wallet.frozen) : 0;
  const sym = currencySymbol();
  const hasPending = !!pendingRequest;

  const handleScreenshot = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      setDepositError("Screenshot must be under 5MB");
      return;
    }
    setScreenshot(file);
    setDepositError("");
    const reader = new FileReader();
    reader.onload = (e) => setScreenshotPreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleDepositSubmit = async () => {
    const amt = parseFloat(depositAmount);
    if (!amt || amt <= 0) {
      setDepositError("Enter a valid amount");
      return;
    }
    if (!transactionId.trim()) {
      setDepositError("Transaction ID / UTR is required");
      return;
    }
    if (!screenshot) {
      setDepositError("Payment screenshot is required");
      return;
    }
    setDepositLoading(true);
    setDepositError("");
    try {
      await walletAPI.deposit(amt, transactionId.trim(), screenshot);
      setDepositSuccess(true);
      setDepositAmount("");
      setTransactionId("");
      setScreenshot(null);
      setScreenshotPreview(null);
      await fetchData();
    } catch (err) {
      setDepositError(err instanceof Error ? err.message : "Deposit failed");
    } finally {
      setDepositLoading(false);
    }
  };

  const handleWithdraw = async () => {
    const amt = parseFloat(withdrawAmount);
    const sourceBalance = withdrawSource === "bonus" ? bonusBalance : balance;
    if (!amt || amt <= 0) { setWithdrawError("Enter a valid amount"); return; }
    if (amt > sourceBalance) { setWithdrawError(`Insufficient ${withdrawSource === "bonus" ? "bonus" : ""} balance`); return; }
    if (!withdrawUpiId.trim()) { setWithdrawError("UPI ID is required"); return; }
    setWithdrawLoading(true);
    setWithdrawError("");
    try {
      if (withdrawSource === "bonus") {
        await walletAPI.requestBonusWithdrawal(amt, withdrawUpiId.trim());
      } else {
        await walletAPI.withdraw(amt, withdrawUpiId.trim());
      }
      setWithdrawSuccess(true);
      setWithdrawAmount("");
      setWithdrawUpiId("");
      await fetchData();
    } catch (err) {
      setWithdrawError(err instanceof Error ? err.message : "Withdrawal failed");
    } finally {
      setWithdrawLoading(false);
    }
  };

  const handleTransfer = async () => {
    const amt = parseFloat(transferAmount);
    if (!amt || amt <= 0) { setTransferError("Enter a valid amount"); return; }
    if (amt > bonusBalance) { setTransferError("Insufficient bonus balance"); return; }
    setTransferLoading(true);
    setTransferError("");
    try {
      await walletAPI.transferBonusToWallet(amt);
      setTransferSuccess(true);
      setTransferAmount("");
      await fetchData();
    } catch (err) {
      setTransferError(err instanceof Error ? err.message : "Transfer failed");
    } finally {
      setTransferLoading(false);
    }
  };

  const openDeposit = () => {
    setDepositOpen(true);
    setDepositStep("qr");
    setTransactionId("");
    setScreenshot(null);
    setScreenshotPreview(null);
    setDepositError("");
    setDepositSuccess(false);
  };

  const openWithdraw = (source: "wallet" | "bonus" = "wallet") => {
    setWithdrawOpen(true);
    setWithdrawSource(source);
    setWithdrawAmount("");
    setWithdrawUpiId("");
    setWithdrawError("");
    setWithdrawSuccess(false);
  };

  const openTransfer = () => {
    setTransferOpen(true);
    setTransferAmount("");
    setTransferError("");
    setTransferSuccess(false);
  };

  const closeTransfer = () => {
    setTransferOpen(false);
    setTransferAmount("");
    setTransferError("");
    setTransferSuccess(false);
  };

  // Deep-link support — e.g. the Dashboard's Bonus card links here with
  // ?action=bonus-add / ?action=bonus-withdraw to jump straight into the
  // right modal instead of duplicating this flow's logic on the dashboard.
  useEffect(() => {
    if (loading) return;
    const action = searchParams.get("action");
    if (!action) return;
    if (action === "bonus-add") openTransfer();
    else if (action === "bonus-withdraw") openWithdraw("bonus");
    router.replace(pathname);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const closeDeposit = () => {
    setDepositOpen(false);
    setDepositStep("qr");
    setDepositAmount("");
    setTransactionId("");
    setScreenshot(null);
    setScreenshotPreview(null);
    setDepositError("");
    setDepositSuccess(false);
  };

  const closeWithdraw = () => {
    setWithdrawOpen(false);
    setWithdrawAmount("");
    setWithdrawUpiId("");
    setWithdrawError("");
    setWithdrawSuccess(false);
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  const statusColor = (s: string) => {
    if (s === "COMPLETED") return "text-emerald-500";
    if (s === "PENDING") return "text-amber-500";
    if (s === "FAILED") return "text-destructive";
    return "text-muted-foreground";
  };

  if (loading) {
    return (<div className="flex min-h-[60vh] items-center justify-center"><IconLoader2 className="h-8 w-8 animate-spin text-brand" /></div>);
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Wallet</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your funds and transactions</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Currency Badge */}
          {wallet?.currency && (
            <Badge variant="outline" className="gap-1.5 px-3 py-1.5 text-xs font-bold border-teal-500/30 bg-teal-500/10 text-teal-500">
              $ USD
              {currencyLocked && <IconLock className="h-3 w-3 opacity-50" />}
            </Badge>
          )}
          <Button variant="outline" size="sm" onClick={fetchData} className="gap-2">
            <IconRefresh className="h-4 w-4" /> Refresh
          </Button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <IconAlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {!kycApproved ? (
        <>
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-3">
            <div className="flex items-start sm:items-center gap-3 flex-1">
              <IconAlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5 sm:mt-0" />
              <div>
                <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Complete KYC verification to deposit and withdraw funds</p>
                <p className="text-xs text-amber-600/70 dark:text-amber-400/70 mt-0.5">Your identity needs to be verified before you can access wallet features.</p>
              </div>
            </div>
            <Link href="/dashboard/kyc" className="shrink-0 self-start sm:self-auto">
              <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white">
                {kyc?.status === "PENDING" ? "Check KYC Status" : "Complete KYC"}
              </Button>
            </Link>
          </div>

          <Card className="px-6 py-16 text-center gap-0">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-muted mb-4">
              <IconLock className="h-8 w-8 text-muted-foreground" />
            </div>
            <h2 className="font-display text-xl font-semibold">Wallet Locked</h2>
            <p className="text-sm text-muted-foreground mt-2 max-w-sm mx-auto leading-relaxed">
              {kyc?.status === "PENDING"
                ? "Your KYC is under review. Wallet access will be unlocked within 12-24 working hours once approved."
                : "Complete your KYC verification to view your balance, add funds, and make withdrawals."}
            </p>
            {kyc?.status === "PENDING" && (
              <div className="mt-4 inline-flex items-center gap-2 rounded-lg border border-amber-500/30 bg-amber-500/5 px-4 py-2 text-xs font-medium text-amber-600 dark:text-amber-400 mx-auto">
                <IconClock className="h-4 w-4" /> KYC Under Review — 12-24 working hours
              </div>
            )}
          </Card>
        </>
      ) : (
        <>
          <div className="flex items-center gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-4 py-3">
            <IconShieldCheck className="h-5 w-5 text-emerald-500 shrink-0" />
            <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">KYC verified — full wallet access enabled</p>
          </div>

          {/* Pending Request Banner */}
          {hasPending && (
            <Card className="border-amber-500/30 bg-amber-500/5 p-4 gap-0">
              <div className="flex items-start gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-full bg-amber-500/10 shrink-0">
                  <IconClock className="h-5 w-5 text-amber-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                    {pendingRequest?.type === "DEPOSIT" ? "Deposit" : "Withdrawal"} Request Pending
                  </p>
                  <p className="text-xs text-amber-600/70 dark:text-amber-400/70 mt-1">
                    {pendingRequest?.type === "DEPOSIT"
                      ? "Your payment is being verified. Please wait 12-24 working hours. Do not make another payment until this is processed."
                      : `Your withdrawal of ${sym}${parseFloat(pendingRequest?.amount || "0").toFixed(2)} is being processed. You will receive funds within 12-24 working hours.`}
                  </p>
                  <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Amount: <span className="font-medium text-foreground">{sym}{parseFloat(pendingRequest?.amount || "0").toFixed(2)}</span></span>
                    <span>Submitted: <span className="font-medium text-foreground">{pendingRequest?.createdAt ? formatDate(pendingRequest.createdAt) : "—"}</span></span>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Balance Card */}
          <Card className="p-6 sm:p-8 gap-0">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Total Balance</p>
                <p className="font-display text-4xl font-bold tracking-tight">
                  <span className="text-gradient">{sym}{balance.toFixed(2)}</span>
                </p>
                {frozen > 0 && (
                  <div className="flex items-center gap-1.5 mt-2 text-sm text-muted-foreground">
                    <IconMinus className="h-4 w-4" /> {sym}{frozen.toFixed(2)} frozen
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-1">{wallet?.currency || "USD"}</p>
              </div>
              <div className="flex gap-3">
                <Button onClick={openDeposit} disabled={hasPending}
                  className="gap-2 btn-glow btn-glow-hover"
                  title={hasPending ? "You have a pending request" : undefined}>
                  <IconPlus className="h-4 w-4" /> Add Funds
                </Button>
                <Button variant="outline" onClick={() => openWithdraw("wallet")} disabled={balance <= 0 || hasPending}
                  title={balance <= 0 ? "No balance" : hasPending ? "You have a pending request" : undefined}
                  className="gap-2">
                  <IconMinus className="h-4 w-4" /> Withdraw
                </Button>
              </div>
            </div>
          </Card>

          {/* Bonus Card */}
          <Card className="border-amber-500/20 bg-gradient-to-br from-amber-500/5 to-transparent p-6 sm:p-8 gap-0">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <IconGift className="h-4 w-4 text-amber-500" />
                  <p className="text-sm font-medium text-muted-foreground">Bonus Balance</p>
                </div>
                <p className="font-display text-3xl font-bold tracking-tight text-amber-600 dark:text-amber-400">
                  {sym}{bonusBalance.toFixed(2)}
                </p>
                <p className="text-xs text-muted-foreground mt-1">Earned from your referral commissions</p>
              </div>
              <div className="flex gap-3">
                <Button onClick={openTransfer} disabled={bonusBalance <= 0}
                  title={bonusBalance <= 0 ? "No bonus balance" : undefined}
                  className="gap-2 bg-amber-600 hover:bg-amber-700 text-white">
                  <IconArrowRight className="h-4 w-4" /> Add to Wallet
                </Button>
                <Button variant="outline" onClick={() => openWithdraw("bonus")} disabled={bonusBalance <= 0 || !!pendingBonusRequest}
                  title={bonusBalance <= 0 ? "No bonus balance" : pendingBonusRequest ? "You have a pending bonus withdrawal" : undefined}
                  className="gap-2 border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10">
                  <IconMinus className="h-4 w-4" /> Withdraw
                </Button>
              </div>
            </div>
            {pendingBonusRequest && (
              <div className="mt-4 flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400">
                <IconClock className="h-3.5 w-3.5" />
                Bonus withdrawal of {sym}{parseFloat(pendingBonusRequest.amount).toFixed(2)} is under review.
              </div>
            )}
          </Card>

          {/* Transaction History */}
          <Card className="overflow-hidden p-0 gap-0">
            <div className="px-6 py-4 border-b border-border">
              <h2 className="font-display text-lg font-semibold">Transaction History</h2>
            </div>
            {transactions.length === 0 ? (
              <div className="px-6 py-12 text-center">
                <IconCreditCard className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No transactions yet</p>
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden sm:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Type</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Reference</TableHead>
                        <TableHead className="text-right">Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.map((tx) => {
                        const isCredit = tx.type === "DEPOSIT" || tx.type === "BONUS_CREDIT" || tx.type === "BONUS_TRANSFER";
                        const txLabel = tx.type === "DEPOSIT" ? "Deposit"
                          : tx.type === "WITHDRAWAL" ? "Withdrawal"
                          : tx.type === "BONUS_CREDIT" ? "Bonus Credited"
                          : tx.type === "BONUS_WITHDRAWAL" ? "Bonus Withdrawal"
                          : "Bonus → Wallet";
                        return (
                        <TableRow key={tx.id}>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              {isCredit ? (
                                <div className="grid h-8 w-8 place-items-center rounded-full bg-emerald-500/10"><IconArrowDownLeft className="h-4 w-4 text-emerald-500" /></div>
                              ) : (
                                <div className="grid h-8 w-8 place-items-center rounded-full bg-amber-500/10"><IconArrowUpRight className="h-4 w-4 text-amber-500" /></div>
                              )}
                              <span className="font-medium">{txLabel}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className={`font-medium ${isCredit ? "text-emerald-500" : "text-foreground"}`}>
                              {isCredit ? "+" : "-"}{sym}{parseFloat(tx.amount).toFixed(2)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className={`gap-1 border-transparent text-xs font-medium ${statusColor(tx.status)}`}>
                              {tx.status === "PENDING" && <IconClock className="h-3 w-3" />}
                              {tx.status === "COMPLETED" && <IconCheck className="h-3 w-3" />}
                              {tx.status === "PENDING" ? "PROCESSING" : tx.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-muted-foreground text-xs">
                            {tx.type === "DEPOSIT" ? (tx.transactionId || "—") : (tx.upiId || "—")}
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">{formatDate(tx.createdAt)}</TableCell>
                        </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile card list */}
                <div className="sm:hidden divide-y divide-border">
                  {transactions.map((tx) => {
                    const isCredit = tx.type === "DEPOSIT" || tx.type === "BONUS_CREDIT" || tx.type === "BONUS_TRANSFER";
                    const txLabel = tx.type === "DEPOSIT" ? "Deposit"
                      : tx.type === "WITHDRAWAL" ? "Withdrawal"
                      : tx.type === "BONUS_CREDIT" ? "Bonus Credited"
                      : tx.type === "BONUS_WITHDRAWAL" ? "Bonus Withdrawal"
                      : "Bonus → Wallet";
                    return (
                      <div key={tx.id} className="p-4 flex items-center gap-3">
                        {isCredit ? (
                          <div className="grid h-9 w-9 place-items-center rounded-full bg-emerald-500/10 shrink-0"><IconArrowDownLeft className="h-4 w-4 text-emerald-500" /></div>
                        ) : (
                          <div className="grid h-9 w-9 place-items-center rounded-full bg-amber-500/10 shrink-0"><IconArrowUpRight className="h-4 w-4 text-amber-500" /></div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-sm font-semibold truncate">{txLabel}</p>
                            <span className={`text-sm font-bold shrink-0 ${isCredit ? "text-emerald-500" : "text-foreground"}`}>
                              {isCredit ? "+" : "-"}{sym}{parseFloat(tx.amount).toFixed(2)}
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-2 mt-1">
                            <Badge variant="outline" className={`gap-1 border-transparent text-[10px] px-1.5 py-0.5 ${statusColor(tx.status)}`}>
                              {tx.status === "PENDING" && <IconClock className="h-2.5 w-2.5" />}
                              {tx.status === "COMPLETED" && <IconCheck className="h-2.5 w-2.5" />}
                              {tx.status === "PENDING" ? "PROCESSING" : tx.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">{formatDate(tx.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </Card>
        </>
      )}

      {/* Deposit Modal - QR Code Flow */}
      <Dialog open={depositOpen} onOpenChange={(o) => { if (!o) closeDeposit(); }}>
        <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add Funds</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {depositSuccess ? (
              <div className="text-center py-6 space-y-3">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/20">
                  <IconCheck className="h-8 w-8 text-emerald-500" />
                </div>
                <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Payment Request Submitted!</p>
                <p className="text-xs text-muted-foreground">Your payment is now being processed. It will be verified within 12-24 working hours. Do not make another payment until this is processed.</p>
                <Button onClick={closeDeposit} className="w-full">Done</Button>
              </div>
            ) : depositStep === "qr" ? (
              <>
                <p className="text-sm text-muted-foreground text-center">Make a bank transfer to the details below</p>

                {/* USD Bank Details */}
                <div className="rounded-lg border border-border bg-accent/50 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Bank Name</span>
                    <span className="text-sm font-semibold text-foreground">{usdPayment?.bankName || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Account Name</span>
                    <span className="text-sm font-semibold text-foreground">{usdPayment?.accountName || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Account Number</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono font-semibold text-foreground">{usdPayment?.accountNumber || "—"}</span>
                      <button onClick={() => { navigator.clipboard.writeText(usdPayment?.accountNumber || ""); setCopied(true); setTimeout(() => setCopied(false), 2000); }} className="flex items-center gap-1 text-xs text-brand hover:underline">
                        <IconCopy className="h-3.5 w-3.5" /> {copied ? "Copied!" : "Copy"}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Routing Number</span>
                    <span className="text-sm font-mono font-semibold text-foreground">{usdPayment?.routingNumber || "—"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">SWIFT Code</span>
                    <span className="text-sm font-mono font-semibold text-foreground">{usdPayment?.swiftCode || "—"}</span>
                  </div>
                </div>

                <p className="text-xs text-amber-600 dark:text-amber-400 text-center">
                  After payment, click &quot;I&apos;ve Paid&quot; to submit your transaction details
                </p>

                <div className="flex gap-3">
                  <Button variant="outline" onClick={closeDeposit} className="flex-1">Cancel</Button>
                  <Button onClick={() => setDepositStep("details")} className="flex-1 btn-glow btn-glow-hover">
                    I&apos;ve Paid — Next
                  </Button>
                </div>
              </>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">Enter your transaction details to verify payment</p>

                {depositError && (
                  <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                    <IconAlertCircle className="h-3.5 w-3.5 shrink-0" /> {depositError}
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground mb-1">Amount (USD) *</Label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 font-medium">{sym}</span>
                      <Input
                        type="number"
                        value={depositAmount}
                        onChange={(e) => setDepositAmount(e.target.value)}
                        placeholder="0.00"
                        min="1"
                        step="0.01"
                        className="pl-8"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground mb-1">Transaction ID / UTR *</Label>
                    <Input
                      type="text"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      placeholder="Enter 12-digit UTR / Transaction ID"
                    />
                  </div>

                  <div>
                    <Label className="text-xs font-medium text-muted-foreground mb-1">Payment Screenshot *</Label>
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className={`mt-1 relative flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 cursor-pointer transition-all ${
                        screenshot
                          ? "border-emerald-500/50 bg-emerald-500/5"
                          : "border-border hover:border-brand/50 hover:bg-accent/50"
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          if (e.target.files?.[0]) handleScreenshot(e.target.files[0]);
                        }}
                      />
                      {screenshot ? (
                        <>
                          {screenshotPreview && (
                            <img src={screenshotPreview} alt="Preview" className="max-h-24 rounded-lg object-contain mb-2" />
                          )}
                          <p className="text-sm font-medium text-center break-all px-2">{screenshot.name}</p>
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); setScreenshot(null); setScreenshotPreview(null); }}
                            className="mt-1 text-xs text-destructive hover:underline"
                          >
                            Remove
                          </button>
                        </>
                      ) : (
                        <>
                          <IconUpload className="h-8 w-8 text-muted-foreground/40 mb-1" />
                          <p className="text-xs text-muted-foreground text-center">
                            Tap to upload payment screenshot
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button variant="outline" onClick={() => setDepositStep("qr")} className="flex-1">Back</Button>
                  <Button onClick={handleDepositSubmit} disabled={depositLoading}
                    className="flex-1 gap-2 btn-glow btn-glow-hover">
                    {depositLoading ? <><IconLoader2 className="h-4 w-4 animate-spin" /> Submitting...</> : "Submit for Verification"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Withdraw Modal */}
      <Dialog open={withdrawOpen} onOpenChange={(o) => { if (!o) closeWithdraw(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{withdrawSource === "bonus" ? "Withdraw Bonus" : "Withdraw Funds"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {withdrawSuccess ? (
              <div className="text-center py-6 space-y-3">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/20">
                  <IconCheck className="h-8 w-8 text-emerald-500" />
                </div>
                <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Withdrawal Request Submitted!</p>
                <p className="text-xs text-muted-foreground">Your withdrawal is being processed. Funds will be sent to your bank account within 12-24 working hours.</p>
                <Button onClick={closeWithdraw} className="w-full">Done</Button>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Available {withdrawSource === "bonus" ? "bonus " : ""}balance:{" "}
                  <span className="font-medium text-foreground">
                    {sym}{(withdrawSource === "bonus" ? bonusBalance : balance).toFixed(2)}
                  </span>
                </p>
                {withdrawError && (
                  <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                    <IconAlertCircle className="h-3.5 w-3.5 shrink-0" /> {withdrawError}
                  </div>
                )}
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground mb-1">Amount *</Label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 font-medium">{sym}</span>
                      <Input type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} placeholder="0.00" min="0" max={withdrawSource === "bonus" ? bonusBalance : balance} step="0.01"
                        className="pl-8" />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground mb-1">Your UPI ID (where you&apos;ll receive funds) *</Label>
                    <Input type="text" value={withdrawUpiId} onChange={(e) => setWithdrawUpiId(e.target.value)} placeholder="yourname@upi" />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={closeWithdraw} className="flex-1">Cancel</Button>
                  <Button onClick={handleWithdraw} disabled={withdrawLoading}
                    className="flex-1 gap-2 btn-glow btn-glow-hover">
                    {withdrawLoading ? <><IconLoader2 className="h-4 w-4 animate-spin" /> Processing...</> : "Submit Withdrawal"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Transfer Bonus to Wallet Modal */}
      <Dialog open={transferOpen} onOpenChange={(o) => { if (!o) closeTransfer(); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Bonus to Wallet</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {transferSuccess ? (
              <div className="text-center py-6 space-y-3">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-500/10 ring-1 ring-emerald-500/20">
                  <IconCheck className="h-8 w-8 text-emerald-500" />
                </div>
                <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">Bonus Added to Wallet!</p>
                <p className="text-xs text-muted-foreground">The amount is now available in your main wallet balance.</p>
                <Button onClick={closeTransfer} className="w-full">Done</Button>
              </div>
            ) : (
              <>
                <p className="text-sm text-muted-foreground">
                  Available bonus balance: <span className="font-medium text-foreground">{sym}{bonusBalance.toFixed(2)}</span>
                </p>
                {transferError && (
                  <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
                    <IconAlertCircle className="h-3.5 w-3.5 shrink-0" /> {transferError}
                  </div>
                )}
                <div>
                  <Label className="text-xs font-medium text-muted-foreground mb-1">Amount *</Label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/60 font-medium">{sym}</span>
                    <Input type="number" value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)} placeholder="0.00" min="0" max={bonusBalance} step="0.01"
                      className="pl-8" />
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={closeTransfer} className="flex-1">Cancel</Button>
                  <Button onClick={handleTransfer} disabled={transferLoading}
                    className="flex-1 gap-2 bg-amber-600 hover:bg-amber-700 text-white">
                    {transferLoading ? <><IconLoader2 className="h-4 w-4 animate-spin" /> Processing...</> : "Add to Wallet"}
                  </Button>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
