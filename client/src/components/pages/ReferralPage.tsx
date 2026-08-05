"use client";

import { useState, useEffect, useCallback } from "react";
import {
  IconCopy, IconUsers, IconCheck, IconClock, IconWallet,
  IconShare, IconLink, IconUserPlus, IconTrophy, IconRefresh,
  IconLoader2, IconAlertCircle, IconChevronRight, IconShield,
} from "@tabler/icons-react";
import { referralAPI, type Referral, type ReferralStats, type HierarchyItem } from "@/lib/api";

type Tab = "referrals" | "leadership";

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
  const [hierarchy, setHierarchy] = useState<HierarchyItem[]>([]);
  const [tab, setTab] = useState<Tab>("referrals");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [codeRes, refsRes, hierRes] = await Promise.allSettled([
        referralAPI.getMyCode(),
        referralAPI.getMyReferrals(),
        referralAPI.getHierarchy(),
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
    const text = `Join Ovantra Financial using my referral link and start trading!\n\n${link}`;
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Referral Program</h1>
          <p className="text-muted-foreground text-sm mt-1">Invite friends and earn commission on their deposits</p>
        </div>
        <button onClick={fetchData} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-accent transition-colors">
          <IconRefresh className="h-4 w-4" /> Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <IconAlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      <div className="rounded-2xl border border-border bg-card p-6">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground mb-1">Your Referral Code</p>
            <div className="flex items-center gap-3">
              <span className="font-mono text-2xl font-bold tracking-widest text-brand">{code}</span>
              <button onClick={copyCode} className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium hover:bg-accent transition-colors">
                <IconCopy className="h-3.5 w-3.5" /> {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={copyLink} className="flex items-center gap-2 rounded-lg btn-glow btn-glow-hover px-4 py-2.5 text-sm font-semibold text-white transition-all">
              <IconLink className="h-4 w-4" /> Copy Link
            </button>
            <button onClick={shareWhatsApp} className="flex items-center gap-2 rounded-lg border border-border px-4 py-2.5 text-sm font-medium hover:bg-accent transition-colors">
              <IconShare className="h-4 w-4" /> Share
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-brand/10"><IconUsers className="h-4 w-4 text-brand" /></div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Total Referrals</p>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.total}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-blue-500/10"><IconShield className="h-4 w-4 text-blue-500" /></div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">KYC Done</p>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.kycDone}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-500/10"><IconCheck className="h-4 w-4 text-emerald-500" /></div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Deposited</p>
          </div>
          <p className="text-2xl font-bold text-foreground">{stats.deposited}</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="grid h-8 w-8 place-items-center rounded-lg bg-amber-500/10"><IconWallet className="h-4 w-4 text-amber-500" /></div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider">Commission Earned</p>
          </div>
          <p className="text-2xl font-bold text-amber-500">${stats.totalCommission.toFixed(2)}</p>
        </div>
      </div>

      <div className="inline-flex rounded-xl border border-border p-1 bg-card">
        <button onClick={() => setTab("referrals")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === "referrals" ? "bg-brand/10 text-brand" : "text-muted-foreground hover:bg-accent"}`}>
          <IconUsers className="h-4 w-4 inline mr-1.5" />My Referrals
        </button>
        <button onClick={() => setTab("leadership")} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === "leadership" ? "bg-brand/10 text-brand" : "text-muted-foreground hover:bg-accent"}`}>
          <IconTrophy className="h-4 w-4 inline mr-1.5" />Leadership
        </button>
      </div>

      {tab === "referrals" && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          {referrals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-muted mb-4">
                <IconUserPlus className="h-8 w-8 text-muted-foreground/40" />
              </div>
              <p className="text-sm font-medium text-foreground">No referrals yet</p>
              <p className="text-xs text-muted-foreground mt-1">Share your referral link to start earning</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
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
          )}
        </div>
      )}

      {tab === "leadership" && (
        <div className="rounded-2xl border border-border bg-card p-6">
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
                    <div className="grid h-10 w-10 place-items-center rounded-full bg-brand/10 text-brand font-bold text-sm">
                      {item.referred.name?.charAt(0)?.toUpperCase() || "?"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">{item.referred.name}</p>
                      <p className="text-xs text-muted-foreground">{item.referred.email}</p>
                    </div>
                    {statusBadge(item.status)}
                  </div>
                  {item.subReferrals && item.subReferrals.length > 0 && (
                    <div className="divide-y divide-border">
                      {item.subReferrals.map((sub) => (
                        <div key={sub.id} className="flex items-center gap-3 px-4 py-3 pl-12">
                          <IconChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                          <div className="grid h-8 w-8 place-items-center rounded-full bg-muted text-muted-foreground text-xs font-bold">
                            {sub.referred.name?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground">{sub.referred.name}</p>
                            <p className="text-xs text-muted-foreground">{sub.referred.email}</p>
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
