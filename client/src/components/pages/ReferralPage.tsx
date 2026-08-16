"use client";

import { useState, useEffect, useCallback } from "react";
import {
  IconCopy, IconUsers, IconCheck, IconWallet,
  IconShare, IconLink, IconUserPlus, IconTrophy, IconRefresh,
  IconLoader2, IconAlertCircle, IconChevronRight, IconChevronDown, IconShield,
  IconGift, IconCurrencyDollar, IconInfoCircle,
} from "@tabler/icons-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import {
  referralAPI, indexAPI,
  type Referral, type ReferralStats, type ReferralDashboardStats,
  type HierarchyItem, type ReferralEarningsBreakdown,
} from "@/lib/api";

type Tab = "referrals" | "leadership" | "howItWorks";

// Validated categorical palette (dataviz skill, default order, brand violet leading) —
// passes CVD + normal-vision floors for a 6-slot legend at scripts/validate_palette.js.
const LEVEL_COLORS = ["#4a3aa7", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#2a78d6"];

function statusBadge(status: string) {
  const cfg: Record<string, { label: string; color: string; bg: string }> = {
    REGISTERED: { label: "Registered", color: "text-amber-600", bg: "bg-amber-100" },
    KYC_DONE: { label: "KYC Done", color: "text-blue-600", bg: "bg-blue-100" },
    DEPOSITED: { label: "Deposited", color: "text-emerald-600", bg: "bg-emerald-100" },
    COMMISSION_PAID: { label: "Commission Paid", color: "text-emerald-600", bg: "bg-emerald-100" },
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

// Recursive tree node — one card per referral, nesting its own subReferrals
// indented underneath. Collapsed by default past level 1 so a deep 5-level
// chain doesn't dump hundreds of rows on screen at once.
function HierarchyNode({ item }: { item: HierarchyItem }) {
  const [expanded, setExpanded] = useState(item.level === 1);
  const hasChildren = !!item.subReferrals && item.subReferrals.length > 0;

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <button
        onClick={() => hasChildren && setExpanded((v) => !v)}
        className={`w-full flex items-center gap-3 px-4 py-3 bg-accent/30 text-left ${hasChildren ? "cursor-pointer hover:bg-accent/50" : "cursor-default"} transition-colors`}
      >
        {hasChildren ? (
          expanded ? <IconChevronDown className="h-4 w-4 text-muted-foreground shrink-0" /> : <IconChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <span className="w-4 shrink-0" />
        )}
        <div className="grid h-9 w-9 place-items-center rounded-full bg-brand/10 text-brand font-bold text-xs shrink-0">
          {item.referred.name?.charAt(0)?.toUpperCase() || "?"}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">{item.referred.name}</p>
          <p className="text-xs text-muted-foreground truncate">{item.referred.email}</p>
        </div>
        <span className="text-[10px] font-semibold text-muted-foreground bg-muted px-1.5 py-0.5 rounded shrink-0">L{item.level}</span>
        {statusBadge(item.status)}
      </button>
      {hasChildren && expanded && (
        <div className="pl-6 sm:pl-8 pr-2 py-2 space-y-2 bg-background/40 border-t border-border">
          {item.subReferrals!.map((sub) => (
            <HierarchyNode key={sub.id} item={sub} />
          ))}
        </div>
      )}
    </div>
  );
}

function LineTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 shadow-xl">
      <p className="text-[11px] text-muted-foreground mb-1">{label}</p>
      <p className="text-sm font-bold text-foreground">${Number(payload[0].value).toFixed(2)}</p>
    </div>
  );
}

function DonutTooltip({ active, payload }: { active?: boolean; payload?: Array<{ name: string; value: number; payload: { percent: string } }> }) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-2 shadow-xl">
      <p className="text-[11px] text-muted-foreground mb-1">{p.name}</p>
      <p className="text-sm font-bold text-foreground">${Number(p.value).toFixed(2)} ({p.payload.percent}%)</p>
    </div>
  );
}

export default function ReferralPage() {
  const [code, setCode] = useState("");
  const [link, setLink] = useState("");
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [stats, setStats] = useState<ReferralStats>({ total: 0, registered: 0, kycDone: 0, deposited: 0, totalCommission: 0 });
  const [dashStats, setDashStats] = useState<ReferralDashboardStats | null>(null);
  const [hierarchy, setHierarchy] = useState<HierarchyItem[]>([]);
  const [earnings, setEarnings] = useState<ReferralEarningsBreakdown | null>(null);
  const [levelRates, setLevelRates] = useState<number[]>([]);
  const [tab, setTab] = useState<Tab>("howItWorks");
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const commissionRate = dashStats?.commissionRate || 2;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [codeRes, refsRes, hierRes, statsRes, earnRes, indexRes] = await Promise.allSettled([
        referralAPI.getMyCode(),
        referralAPI.getMyReferrals(),
        referralAPI.getHierarchy(),
        referralAPI.getMyStats(),
        referralAPI.getEarningsBreakdown(),
        indexAPI.getData(),
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
      if (earnRes.status === "fulfilled") setEarnings(earnRes.value);
      if (indexRes.status === "fulfilled") setLevelRates(indexRes.value.referralLevels || []);

      const allFailed = [codeRes, refsRes, hierRes, statsRes].every((r) => r.status === "rejected");
      if (allFailed) {
        setError("Unable to load referral data. Please check your connection and try again.");
      }
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

  const byLevel = earnings?.byLevel || [0, 0, 0, 0, 0, 0];
  const totalEarned = earnings?.totalEarned || stats.totalCommission;
  const donutData = byLevel
    .map((amount, i) => ({
      name: `Level ${i + 1}`,
      value: amount,
      percent: totalEarned > 0 ? ((amount / totalEarned) * 100).toFixed(1) : "0.0",
      color: LEVEL_COLORS[i],
    }))
    .filter((d) => d.value > 0);
  const hasEarnings = donutData.length > 0;

  const monthlyTotals = earnings?.monthlyTotals || [];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold tracking-tight">Referral Overview</h1>
          <p className="text-muted-foreground text-sm mt-1">Invite your friends, grow your network and earn exciting rewards.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2">
            <span className="text-xs text-muted-foreground hidden sm:inline">Share your referral link</span>
            <code className="text-xs font-medium text-foreground truncate max-w-[160px] sm:max-w-[220px]">{link}</code>
            <button onClick={copyLink} className="text-brand hover:text-brand-2 transition-colors shrink-0">
              <IconCopy className="h-4 w-4" />
            </button>
          </div>
          <button onClick={fetchData} className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-accent transition-colors shrink-0">
            <IconRefresh className="h-4 w-4" />
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          <IconAlertCircle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {/* Stat Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-full bg-brand/10 shrink-0">
              <IconUsers className="h-5 w-5 text-brand" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Total Referrals</p>
              <p className="text-xl sm:text-2xl font-bold text-foreground">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-full bg-emerald-500/10 shrink-0">
              <IconCurrencyDollar className="h-5 w-5 text-emerald-500" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Total Referral Earnings</p>
              <p className="text-xl sm:text-2xl font-bold text-foreground">${totalEarned.toFixed(2)}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-full bg-blue-500/10 shrink-0">
              <IconShield className="h-5 w-5 text-blue-500" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">KYC Done</p>
              <p className="text-xl sm:text-2xl font-bold text-foreground">{stats.kycDone}</p>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-full bg-amber-500/10 shrink-0">
              <IconWallet className="h-5 w-5 text-amber-500" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Deposited</p>
              <p className="text-xl sm:text-2xl font-bold text-foreground">{stats.deposited}</p>
            </div>
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

      {/* Earnings Chart + Level Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Earnings Over Time */}
        <div className="lg:col-span-3 rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-foreground">Referral Earnings Over Time</h3>
            <span className="text-xs text-muted-foreground">Last 6 Months</span>
          </div>
          {monthlyTotals.some((m) => m.amount > 0) ? (
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTotals} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="label" fontSize={11} tickLine={false} axisLine={false} tick={{ fill: "var(--muted-foreground)" }} />
                  <YAxis fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} tick={{ fill: "var(--muted-foreground)" }} width={48} />
                  <Tooltip content={<LineTooltip />} />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="var(--brand)"
                    strokeWidth={2}
                    dot={{ r: 4, fill: "var(--brand)", strokeWidth: 2, stroke: "var(--card)" }}
                    activeDot={{ r: 5, fill: "var(--brand)", strokeWidth: 2, stroke: "var(--card)" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[240px] flex flex-col items-center justify-center text-center">
              <IconTrophy className="h-8 w-8 text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">No earnings yet — invite friends to start earning</p>
            </div>
          )}
        </div>

        {/* Earnings by Level Donut */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-1.5 mb-4">
            <h3 className="text-base font-bold text-foreground">Earnings by Level</h3>
            <IconInfoCircle className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          {hasEarnings ? (
            <div className="h-[220px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={donutData}
                    dataKey="value"
                    nameKey="name"
                    innerRadius="60%"
                    outerRadius="85%"
                    paddingAngle={2}
                    stroke="var(--card)"
                    strokeWidth={2}
                  >
                    {donutData.map((d) => (
                      <Cell key={d.name} fill={d.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<DonutTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Total</p>
                <p className="text-lg font-bold text-foreground">${totalEarned.toFixed(0)}</p>
              </div>
            </div>
          ) : (
            <div className="h-[220px] flex flex-col items-center justify-center text-center">
              <IconTrophy className="h-8 w-8 text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">No level earnings yet</p>
            </div>
          )}
          {hasEarnings && (
            <div className="mt-3 space-y-1.5">
              {donutData.map((d) => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2 text-muted-foreground">
                    <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: d.color }} />
                    {d.name}
                  </span>
                  <span className="font-medium text-foreground">${d.value.toFixed(2)} ({d.percent}%)</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Referral Level Commission Table */}
      {levelRates.length > 0 && (
        <div className="rounded-2xl border border-border bg-card p-5 overflow-hidden">
          <h3 className="text-base font-bold text-foreground mb-4">Referral Level Commission</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="py-2 pr-4 font-medium text-xs uppercase tracking-wider">Level</th>
                  <th className="py-2 pr-4 font-medium text-xs uppercase tracking-wider">Commission %</th>
                  <th className="py-2 font-medium text-xs uppercase tracking-wider text-right">Earnings</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {levelRates.map((rate, i) => (
                  <tr key={i}>
                    <td className="py-3 pr-4 font-medium text-foreground">Level {i + 1}</td>
                    <td className="py-3 pr-4">
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold"
                        style={{ backgroundColor: `${LEVEL_COLORS[i]}1a`, color: LEVEL_COLORS[i] }}
                      >
                        {rate.toFixed(2)}%
                      </span>
                    </td>
                    <td className="py-3 text-right font-medium text-foreground">${(byLevel[i] || 0).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-muted-foreground mt-3">
            Applies to the maintenance fee taken when a referral invests in the Index. Levels 2–5 pay the ancestor referrers in your chain.
          </p>
        </div>
      )}

      {/* Tabs */}
      <div className="inline-flex rounded-xl border border-border p-1 bg-card">
        <button onClick={() => setTab("howItWorks")} className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${tab === "howItWorks" ? "bg-brand/10 text-brand" : "text-muted-foreground hover:bg-accent"}`}>
          <IconGift className="h-4 w-4 inline mr-1" />How It Works
        </button>
        <button onClick={() => setTab("referrals")} className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${tab === "referrals" ? "bg-brand/10 text-brand" : "text-muted-foreground hover:bg-accent"}`}>
          <IconUsers className="h-4 w-4 inline mr-1" />Recent Referrals ({stats.total})
        </button>
        <button onClick={() => setTab("leadership")} className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${tab === "leadership" ? "bg-brand/10 text-brand" : "text-muted-foreground hover:bg-accent"}`}>
          <IconTrophy className="h-4 w-4 inline mr-1" />Leadership
        </button>
      </div>

      {/* How It Works Tab */}
      {tab === "howItWorks" && (
        <div className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="text-lg font-bold text-foreground mb-5">How Referral Earnings Work</h3>
            <div className="space-y-6">
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

              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-emerald-500/10 text-emerald-500 font-bold text-sm shrink-0">3</div>
                  <div className="w-px flex-1 bg-border mt-2" />
                </div>
                <div className="pb-6">
                  <p className="font-semibold text-foreground">They Deposit or Invest</p>
                  <p className="text-sm text-muted-foreground mt-1">When your referral deposits funds or invests in the Index, commission is automatically calculated across up to 5 levels of your network.</p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-amber-500/10 text-amber-500 font-bold text-sm shrink-0">4</div>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Get Paid Instantly!</p>
                  <p className="text-sm text-muted-foreground mt-1">Your share is automatically credited to your wallet — no waiting, no manual claims.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-border bg-card p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">Earnings Calculator</h3>
            <p className="text-sm text-muted-foreground mb-4">See how much you can earn with {commissionRate}% commission on a deposit:</p>
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

      {/* Recent Referrals Tab */}
      {tab === "referrals" && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          {referrals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <div className="grid h-16 w-16 place-items-center rounded-full bg-muted mb-4">
                <IconUserPlus className="h-8 w-8 text-muted-foreground/40" />
              </div>
              <p className="text-sm font-medium text-foreground">No referrals yet</p>
              <p className="text-xs text-muted-foreground mt-1 text-center">Share your referral link to start earning</p>
            </div>
          ) : (
            <>
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
            <div className="space-y-3">
              {hierarchy.map((item) => (
                <HierarchyNode key={item.id} item={item} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
