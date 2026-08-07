"use client";

import { useState, useEffect, useCallback } from "react";
import {
  IconCopy, IconUsers, IconCheck, IconWallet,
  IconShare, IconLink, IconUserPlus, IconTrophy, IconRefresh,
  IconLoader2, IconAlertCircle, IconChevronRight, IconShield,
  IconGift, IconUser, IconCurrencyDollar, IconCashRegister,
} from "@tabler/icons-react";
import { referralAPI, type Referral, type ReferralStats, type ReferralDashboardStats, type HierarchyItem } from "@/lib/api";

type Tab = "referrals" | "leadership" | "howItWorks";

function statusBadge(status: string) {
  const cfg: Record<string, { label: string; color: string; bg: string }> = {
    REGISTERED: { label: "Registered", color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-100 dark:bg-amber-900/30" },
    KYC_DONE: { label: "KYC Done", color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-100 dark:bg-blue-900/30" },
    DEPOSITED: { label: "Deposited", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
    COMMISSION_PAID: { label: "Commission Paid", color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
  };
  const s = cfg[status] || cfg.REGISTERED;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${s.color} ${s.bg}`}>
      {status === "COMMISSION_PAID" && <IconCheck size={10} />}
      {status === "KYC_DONE" && <IconShield size={10} />}
      {s.label}
    </span>
  );
}

export default function ReferralPage() {
  const [code, setCode] = useState("");
  const [link, setLink] = useState("");
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [stats, setStats] = useState<ReferralStats>({ total: 0, registered: 0, kycDone: 0, deposited: 0, totalCommission: 0 });
  const [dashStats, setDashStats] = useState<ReferralDashboardStats | null>(null);
  const [hierarchy, setHierarchy] = useState<HierarchyItem[]>([]);
  const [tab, setTab] = useState<Tab>("howItWorks");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const commissionRate = dashStats?.commissionRate || 2;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [codeRes, refsRes, hierRes, statsRes] = await Promise.allSettled([
        referralAPI.getMyCode(),
        referralAPI.getMyReferrals(),
        referralAPI.getHierarchy(),
        referralAPI.getMyStats(),
      ]);
      if (codeRes.status === "fulfilled") {
        setCode(codeRes.value.code);
        setLink(codeRes.value.link);
      }
      if (refsRes.status === "fulfilled") {
        setReferrals(refsRes.value.referrals);
        setStats(refsRes.value.stats);
      }
      if (hierRes.status === "fulfilled") setHierarchy(hierRes.value.hierarchy);
      if (statsRes.status === "fulfilled") setDashStats(statsRes.value.stats);
    } catch {
      setError("Failed to load referral data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const copyCode = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    const text = `Join ORVANTA Financial using my referral link and start trading!\n\n${link}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <IconLoader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Referral Program</h1>
          <p className="text-muted-foreground text-sm mt-1">Invite friends and earn {commissionRate}% on their deposits</p>
        </div>
        <button onClick={fetchData} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-accent transition-colors self-start">
          <IconRefresh className="h-4 w-4" /> Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <IconAlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {/* Commission Rate Banner */}
      <div className="rounded-2xl border border-brand/20 bg-gradient-to-r from-brand/5 to-brand/10 p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand/20">
              <IconCashRegister className="h-6 w-6 text-brand" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Your Commission Rate</p>
              <p className="text-3xl font-bold text-brand">{commissionRate}%</p>
            </div>
          </div>
          <div className="sm:ml-auto text-left sm:text-right">
            <p className="text-xs text-muted-foreground">Example: Refer someone who deposits $100</p>
            <p className="text-lg font-bold text-emerald-500">You earn ${(100 * commissionRate / 100).toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* Referral Code Card */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <div className="flex flex-col gap-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-1">Your Referral Code</p>
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-mono text-xl sm:text-2xl font-bold tracking-widest text-brand">{code}</span>
              <button onClick={copyCode} className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent transition-colors">
                <IconCopy className="h-3.5 w-3.5" /> {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={copyLink} className="flex items-center gap-2 rounded-lg btn-glow btn-glow-hover px-4 py-2.5 text-sm font-semibold text-white transition-all">
              <IconLink className="h-4 w-4" /> Copy Link
            </button>
            <button onClick={shareWhatsApp} className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium hover:bg-accent transition-colors">
              <IconShare className="h-4 w-4" /> Share WhatsApp
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-brand/10"><IconUsers className="h-4 w-4 text-brand" /></div>
            <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">Total</p>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-foreground">{stats.total}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-blue-500/10"><IconShield className="h-4 w-4 text-blue-500" /></div>
            <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">KYC Done</p>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-foreground">{stats.kycDone}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-500/10"><IconCheck className="h-4 w-4 text-emerald-500" /></div>
            <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">Deposited</p>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-foreground">{stats.deposited}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-amber-500/10"><IconWallet className="h-4 w-4 text-amber-500" /></div>
            <p className="text-[10px] sm:text-xs text-muted-foreground uppercase tracking-wider">Earned</p>
          </div>
          <p className="text-xl sm:text-2xl font-bold text-amber-500">${stats.totalCommission.toFixed(2)}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="inline-flex rounded-xl border border-border p-1 bg-card">
        <button onClick={() => setTab("howItWorks")} className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${tab === "howItWorks" ? "bg-brand/10 text-brand" : "text-muted-foreground hover:bg-accent"}`}>
          <IconGift className="h-4 w-4 inline mr-1" />How It Works
        </button>
        <button onClick={() => setTab("referrals")} className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${tab === "referrals" ? "bg-brand/10 text-brand" : "text-muted-foreground hover:bg-accent"}`}>
          <IconUsers className="h-4 w-4 inline mr-1" />My Referrals ({stats.total})
        </button>
        <button onClick={() => setTab("leadership")} className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${tab === "leadership" ? "bg-brand/10 text-brand" : "text-muted-foreground hover:bg-accent"}`}>
          <IconTrophy className="h-4 w-4 inline mr-1" />Leadership
        </button>
      </div>

      {/* How It Works Tab */}
      {tab === "howItWorks" && (
        <div className="space-y-4">
          {/* Steps */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="text-lg font-bold text-foreground mb-5">How Referral Earnings Work</h3>
            <div className="space-y-6">
              {/* Step 1 */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-brand/10 text-brand font-bold text-sm shrink-0">1</div>
                  <div className="w-px flex-1 bg-border mt-2" />
                </div>
                <div className="pb-6">
                  <p className="font-semibold text-foreground">Share Your Referral Link</p>
                  <p className="text-sm text-muted-foreground mt-1">Copy your unique referral code or link and share it with friends. They must register using your link.</p>
                  <div className="mt-2 flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                    <IconLink className="h-4 w-4 text-brand shrink-0" />
                    <code className="text-xs text-muted-foreground truncate">{link}</code>
                  </div>
                </div>
              </div>

              {/* Step 2 */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-blue-500/10 text-blue-500 font-bold text-sm shrink-0">2</div>
                  <div className="w-px flex-1 bg-border mt-2" />
                </div>
                <div className="pb-6">
                  <p className="font-semibold text-foreground">They Complete KYC</p>
                  <p className="text-sm text-muted-foreground mt-1">Your referred friend needs to complete their KYC verification. You&apos;ll see their status update in real-time.</p>
                </div>
              </div>

              {/* Step 3 */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-emerald-500/10 text-emerald-500 font-bold text-sm shrink-0">3</div>
                  <div className="w-px flex-1 bg-border mt-2" />
                </div>
                <div className="pb-6">
                  <p className="font-semibold text-foreground">They Make a Deposit</p>
                  <p className="text-sm text-muted-foreground mt-1">When your referral makes their first deposit, the commission is automatically calculated.</p>
                </div>
              </div>

              {/* Step 4 */}
              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-amber-500/10 text-amber-500 font-bold text-sm shrink-0">4</div>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Get Paid Instantly!</p>
                  <p className="text-sm text-muted-foreground mt-1">{commissionRate}% of their deposit is automatically credited to your wallet.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Earnings Calculator */}
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">Earnings Calculator</h3>
            <p className="text-sm text-muted-foreground mb-4">See how much you can earn with {commissionRate}% commission:</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { deposit: 50, earning: 50 * commissionRate / 100 },
                { deposit: 100, earning: 100 * commissionRate / 100 },
                { deposit: 500, earning: 500 * commissionRate / 100 },
              ].map((item) => (
                <div key={item.deposit} className="rounded-xl border border-border p-4 text-center hover:border-brand/30 transition-colors">
                  <p className="text-xs text-muted-foreground">Friend deposits</p>
                  <p className="text-xl font-bold text-foreground mt-1">${item.deposit}</p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <IconCurrencyDollar className="h-4 w-4 text-emerald-500" />
                    <span className="text-lg font-bold text-emerald-500">You earn ${item.earning.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tips */}
          <div className="rounded-2xl border border-brand/20 bg-brand/5 p-6">
            <h3 className="text-lg font-bold text-foreground mb-3">Pro Tips</h3>
            <ul className="space-y-2">
              {[
                "Share your link on social media, WhatsApp groups, or directly with friends.",
                "The more friends you refer, the more you earn — there's no limit!",
                "Track all your referrals and earnings right here in real-time.",
                "Your referred users will also get full access to all platform features.",
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <IconCheck className="h-4 w-4 text-brand shrink-0 mt-0.5" />
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* My Referrals Tab */}
      {tab === "referrals" && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          {referrals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-muted mb-4">
                <IconUserPlus className="h-8 w-8 text-muted-foreground/40" />
              </div>
              <p className="text-sm font-medium text-foreground">No referrals yet</p>
              <p className="text-xs text-muted-foreground mt-1 text-center">Share your referral link to start earning {commissionRate}% commission</p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border text-left text-muted-foreground">
                      <th className="px-5 py-3 font-medium text-xs uppercase tracking-wider">User</th>
                      <th className="px-5 py-3 font-medium text-xs uppercase tracking-wider">Status</th>
                      <th className="px-5 py-3 font-medium text-xs uppercase tracking-wider">Joined</th>
                      <th className="px-5 py-3 font-medium text-xs uppercase tracking-wider">Commission</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {referrals.map((r) => (
                      <tr key={r.id} className="hover:bg-accent/50 transition-colors">
                        <td className="px-5 py-4">
                          <p className="font-medium text-foreground">{r.referred.name}</p>
                          <p className="text-xs text-muted-foreground">{r.referred.email}</p>
                        </td>
                        <td className="px-5 py-4">{statusBadge(r.status)}</td>
                        <td className="px-5 py-4 text-xs text-muted-foreground">{formatDate(r.registeredAt)}</td>
                        <td className="px-5 py-4 text-sm font-medium text-foreground">
                          ${r.commissions.reduce((sum, c) => sum + parseFloat(c.amount), 0).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="sm:hidden divide-y divide-border">
                {referrals.map((r) => (
                  <div key={r.id} className="p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-foreground">{r.referred.name}</p>
                        <p className="text-xs text-muted-foreground">{r.referred.email}</p>
                      </div>
                      {statusBadge(r.status)}
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Joined: {formatDate(r.registeredAt)}</span>
                      <span className="font-medium text-foreground">
                        Earned: ${r.commissions.reduce((sum, c) => sum + parseFloat(c.amount), 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Leadership Tab */}
      {tab === "leadership" && (
        <div className="rounded-2xl border border-border bg-card p-4 sm:p-6">
          {hierarchy.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-muted mb-4">
                <IconTrophy className="h-8 w-8 text-muted-foreground/40" />
              </div>
              <p className="text-sm font-medium text-foreground">No referrals yet</p>
              <p className="text-xs text-muted-foreground mt-1">Your leadership tree will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {hierarchy.map((item) => (
                <div key={item.id} className="border border-border rounded-xl overflow-hidden">
                  <div className="flex items-center gap-3 px-4 py-3 bg-accent/30">
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-brand/10 text-brand font-bold text-sm shrink-0">
                      {item.referred.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">{item.referred.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{item.referred.email}</p>
                    </div>
                    {statusBadge(item.status)}
                  </div>
                  {item.subReferrals && item.subReferrals.length > 0 && (
                    <div className="divide-y divide-border">
                      {item.subReferrals.map((sub) => (
                        <div key={sub.id} className="flex items-center gap-3 px-4 py-3 sm:pl-12">
                          <IconChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                          <div className="grid h-8 w-8 place-items-center rounded-full bg-muted text-muted-foreground text-xs font-bold shrink-0">
                            {sub.referred.name?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">{sub.referred.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{sub.referred.email}</p>
                          </div>
                          {statusBadge(sub.status)}
                        </div>
                      ))}
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
