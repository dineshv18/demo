/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import {
  IconPlus, IconEdit, IconTrash, IconCheck,
  IconChartLine, IconUser, IconCoin, IconPercentage, IconChartPie, IconUpload,
} from "@tabler/icons-react";
import { indexAPI, type IndexTier, type IndexPriceEntry, type IndexManager, type IndexSettings as IndexSettingsData, type FundAllocation, type FundAllocationDetail } from "../services/api";

type Tab = "tiers" | "prices" | "manager" | "allocations" | "fees";

export default function IndexSettings() {
  const [tab, setTab] = useState<Tab>("tiers");
  const [tiers, setTiers] = useState<IndexTier[]>([]);
  const [prices, setPrices] = useState<IndexPriceEntry[]>([]);
  const [manager, setManager] = useState<IndexManager | null>(null);
  const [allocations, setAllocations] = useState<FundAllocation[]>([]);
  const [feeSettings, setFeeSettings] = useState<IndexSettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [tiersRes, pricesRes, managerRes, allocationsRes, settingsRes] = await Promise.allSettled([
        indexAPI.getTiers(),
        indexAPI.getPrices(),
        indexAPI.getManager(),
        indexAPI.getFundAllocations(),
        indexAPI.getSettings(),
      ]);
      if (tiersRes.status === "fulfilled") setTiers(tiersRes.value.tiers);
      if (pricesRes.status === "fulfilled") setPrices(pricesRes.value.prices);
      if (managerRes.status === "fulfilled") setManager(managerRes.value.manager);
      if (allocationsRes.status === "fulfilled") setAllocations(allocationsRes.value.allocations);
      if (settingsRes.status === "fulfilled") setFeeSettings(settingsRes.value.settings);
    } catch (err: any) {
      showToast("error", err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] px-5 py-3 rounded-lg shadow-lg text-sm font-medium text-white ${toast.type === "success" ? "bg-emerald-600" : "bg-red-600"}`}>
          {toast.message}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Index Settings</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage investment tiers, price history, and index manager.</p>
      </div>

      {/* Tabs */}
      <div className="inline-flex flex-wrap rounded-xl border border-gray-200 dark:border-gray-800 p-1 bg-white dark:bg-gray-900">
        {(["tiers", "prices", "manager", "allocations", "fees"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${tab === t ? "bg-[#EAF7E8] text-[#00A94F]" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"}`}>
            {t === "tiers" && <IconCoin size={16} />}
            {t === "prices" && <IconChartLine size={16} />}
            {t === "manager" && <IconUser size={16} />}
            {t === "allocations" && <IconChartPie size={16} />}
            {t === "fees" && <IconPercentage size={16} />}
            {t === "tiers" ? "Investment Tiers" : t === "prices" ? "Price History" : t === "manager" ? "Index Manager" : t === "allocations" ? "Fund Allocation" : "Fees & Commission"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="text-center py-12 text-sm text-gray-500">Loading...</div>
      ) : (
        <>
          {tab === "tiers" && <TiersTab tiers={tiers} onRefresh={fetchAll} showToast={showToast} />}
          {tab === "prices" && <PricesTab prices={prices} onRefresh={fetchAll} showToast={showToast} />}
          {tab === "manager" && <ManagerTab manager={manager} onRefresh={fetchAll} showToast={showToast} />}
          {tab === "allocations" && <AllocationsTab allocations={allocations} onRefresh={fetchAll} showToast={showToast} />}
          {tab === "fees" && <FeesTab settings={feeSettings} onRefresh={fetchAll} showToast={showToast} />}
        </>
      )}
    </div>
  );
}

function TiersTab({ tiers, onRefresh, showToast }: { tiers: IndexTier[]; onRefresh: () => Promise<void>; showToast: (t: "success" | "error", m: string) => void }) {
  const [editTier, setEditTier] = useState<IndexTier | null>(null);
  const [newTier, setNewTier] = useState(false);
  const [form, setForm] = useState({
    minAmount: "", maxAmount: "", label: "", tagline: "", imageUrl: "", durationMonths: "18",
    weeklyReturn: "", monthlyReturn: "", halfYearlyReturn: "",
    maintenanceFeePercent: "5", exitFeePercent: "2", earlyExitFeePercent: "17",
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const resetForm = () => setForm({
    minAmount: "", maxAmount: "", label: "", tagline: "", imageUrl: "", durationMonths: "18",
    weeklyReturn: "", monthlyReturn: "", halfYearlyReturn: "",
    maintenanceFeePercent: "5", exitFeePercent: "2", earlyExitFeePercent: "17",
  });

  const handleImageSelect = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const res = await indexAPI.uploadTierImage(file);
      setForm((f) => ({ ...f, imageUrl: res.imageUrl }));
    } catch (err: any) {
      showToast("error", err.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const openEdit = (tier: IndexTier) => {
    setEditTier(tier);
    setForm({
      minAmount: tier.minAmount,
      maxAmount: tier.maxAmount,
      label: tier.label,
      tagline: tier.tagline || "",
      imageUrl: tier.imageUrl || "",
      durationMonths: String(tier.durationMonths ?? 18),
      weeklyReturn: tier.weeklyReturn,
      monthlyReturn: tier.monthlyReturn,
      halfYearlyReturn: tier.halfYearlyReturn,
      maintenanceFeePercent: tier.maintenanceFeePercent ?? "5",
      exitFeePercent: tier.exitFeePercent ?? "2",
      earlyExitFeePercent: tier.earlyExitFeePercent ?? "17",
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editTier) {
        await indexAPI.updateTier(editTier.id, {
          minAmount: form.minAmount,
          maxAmount: form.maxAmount,
          label: form.label,
          tagline: form.tagline || null,
          imageUrl: form.imageUrl || null,
          durationMonths: parseInt(form.durationMonths || "18"),
          weeklyReturn: form.weeklyReturn,
          monthlyReturn: form.monthlyReturn,
          halfYearlyReturn: form.halfYearlyReturn,
          maintenanceFeePercent: form.maintenanceFeePercent,
          exitFeePercent: form.exitFeePercent,
          earlyExitFeePercent: form.earlyExitFeePercent,
        });
        showToast("success", "Tier updated");
      } else {
        await indexAPI.createTier({
          minAmount: parseFloat(form.minAmount),
          maxAmount: parseFloat(form.maxAmount),
          label: form.label,
          tagline: form.tagline || undefined,
          imageUrl: form.imageUrl || undefined,
          durationMonths: parseInt(form.durationMonths || "18"),
          weeklyReturn: parseFloat(form.weeklyReturn || "0"),
          monthlyReturn: parseFloat(form.monthlyReturn || "0"),
          halfYearlyReturn: parseFloat(form.halfYearlyReturn || "0"),
          maintenanceFeePercent: parseFloat(form.maintenanceFeePercent || "5"),
          exitFeePercent: parseFloat(form.exitFeePercent || "2"),
          earlyExitFeePercent: parseFloat(form.earlyExitFeePercent || "17"),
        });
        showToast("success", "Tier created");
      }
      setEditTier(null);
      setNewTier(false);
      resetForm();
      await onRefresh();
    } catch (err: any) {
      showToast("error", err.message || "Failed to save tier");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this tier?")) return;
    try {
      await indexAPI.deleteTier(id);
      showToast("success", "Tier deleted");
      await onRefresh();
    } catch (err: any) {
      showToast("error", err.message || "Failed to delete");
    }
  };

  const handleToggleActive = async (tier: IndexTier) => {
    try {
      await indexAPI.updateTier(tier.id, { isActive: !tier.isActive });
      showToast("success", tier.isActive ? "Tier deactivated" : "Tier activated");
      await onRefresh();
    } catch (err: any) {
      showToast("error", err.message || "Failed to update");
    }
  };

  const isEditing = editTier || newTier;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">{tiers.length} tiers configured</p>
        <button onClick={() => { setNewTier(true); setEditTier(null); resetForm(); }}
          className="flex items-center gap-2 px-4 py-2 bg-[#10211D] hover:bg-[#10211D]/90 text-white rounded-xl text-sm font-semibold transition-colors">
          <IconPlus size={16} /> Add Tier
        </button>
      </div>

      {isEditing && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{editTier ? "Edit Tier" : "New Tier"}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Label *</label>
              <input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })}
                placeholder="e.g. $100 - $500"
                className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00A94F]/40" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Min Amount *</label>
                <input type="number" value={form.minAmount} onChange={(e) => setForm({ ...form, minAmount: e.target.value })}
                  placeholder="100"
                  className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00A94F]/40" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Max Amount *</label>
                <input type="number" value={form.maxAmount} onChange={(e) => setForm({ ...form, maxAmount: e.target.value })}
                  placeholder="500"
                  className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00A94F]/40" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Tagline</label>
              <input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                placeholder="e.g. New Beginner, Ideal for entry investors"
                className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00A94F]/40" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Tier image</label>
              <div className="mt-1 flex items-center gap-3">
                {form.imageUrl && (
                  <img src={form.imageUrl} alt="" className="h-14 w-14 rounded-lg object-cover border border-gray-200 dark:border-gray-800" />
                )}
                <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-600 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
                  {uploading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" /> : <IconUpload size={16} />}
                  {form.imageUrl ? "Replace image" : "Upload image"}
                  <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" disabled={uploading}
                    onChange={(e) => handleImageSelect(e.target.files?.[0])} />
                </label>
                {form.imageUrl && (
                  <button type="button" onClick={() => setForm((f) => ({ ...f, imageUrl: "" }))}
                    className="text-xs text-red-500 hover:underline">Remove</button>
                )}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Duration (months)</label>
              <input type="number" min="1" value={form.durationMonths} onChange={(e) => setForm({ ...form, durationMonths: e.target.value })}
                placeholder="18"
                className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00A94F]/40" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Weekly Return (%)</label>
              <input type="number" step="0.01" value={form.weeklyReturn} onChange={(e) => setForm({ ...form, weeklyReturn: e.target.value })}
                placeholder="0.50"
                className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00A94F]/40" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Monthly Return (%)</label>
              <input type="number" step="0.01" value={form.monthlyReturn} onChange={(e) => setForm({ ...form, monthlyReturn: e.target.value })}
                placeholder="2.00"
                className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00A94F]/40" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">6-Month Return (%)</label>
              <input type="number" step="0.01" value={form.halfYearlyReturn} onChange={(e) => setForm({ ...form, halfYearlyReturn: e.target.value })}
                placeholder="12.00"
                className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00A94F]/40" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Maintenance Fee (%)</label>
              <input type="number" step="0.01" value={form.maintenanceFeePercent} onChange={(e) => setForm({ ...form, maintenanceFeePercent: e.target.value })}
                placeholder="5"
                className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00A94F]/40" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Exit Fee (%, after maturity)</label>
              <input type="number" step="0.01" value={form.exitFeePercent} onChange={(e) => setForm({ ...form, exitFeePercent: e.target.value })}
                placeholder="2"
                className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00A94F]/40" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Early Exit Fee (%, before maturity)</label>
              <input type="number" step="0.01" value={form.earlyExitFeePercent} onChange={(e) => setForm({ ...form, earlyExitFeePercent: e.target.value })}
                placeholder="17"
                className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00A94F]/40" />
            </div>
          </div>

          {/* Live example — shows how these numbers translate for an actual investor */}
          {(() => {
            const exampleAmount = parseFloat(form.minAmount) > 0 ? parseFloat(form.minAmount) : 100;
            const monthlyPct = parseFloat(form.monthlyReturn) || 0;
            const maintFeePct = parseFloat(form.maintenanceFeePercent) || 0;
            const exitFeePct = parseFloat(form.exitFeePercent) || 0;
            const earlyFeePct = parseFloat(form.earlyExitFeePercent) || 0;
            const durationMonths = parseInt(form.durationMonths) || 18;

            const maintFee = (exampleAmount * maintFeePct) / 100;
            const netInvested = exampleAmount - maintFee;
            const grownValue = netInvested * (1 + monthlyPct / 100);
            const grownAtMaturity = netInvested * Math.pow(1 + monthlyPct / 100, durationMonths);
            const exitFeeAtMaturity = (grownAtMaturity * exitFeePct) / 100;
            const payoutAtMaturity = grownAtMaturity - exitFeeAtMaturity;
            const earlyFeeNow = (netInvested * earlyFeePct) / 100;
            const payoutIfWithdrawnNow = netInvested - earlyFeeNow;

            const today = new Date();
            const maturityDate = new Date(today);
            maturityDate.setMonth(maturityDate.getMonth() + durationMonths);
            const fmt = (n: number) => `$${n.toFixed(2)}`;
            const fmtDate = (d: Date) => d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

            return (
              <div className="rounded-xl border border-[#00A94F]/25 bg-[#EAF7E8]/40 p-4 space-y-2.5">
                <p className="text-xs font-semibold text-[#00A94F] uppercase tracking-wider">
                  Live example — what an investor sees with these numbers
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  Say a user invests <strong>{fmt(exampleAmount)}</strong> in this tier today ({fmtDate(today)}).
                </p>
                <ul className="text-sm text-gray-700 dark:text-gray-300 space-y-1.5 pl-1">
                  <li>
                    A <strong>{maintFeePct.toFixed(2)}%</strong> maintenance fee is taken immediately:{" "}
                    {fmt(exampleAmount)} − {fmt(maintFee)} fee = <strong>{fmt(netInvested)}</strong> actually invested.
                  </li>
                  <li>
                    Their client-side chart shows this growing at <strong>{monthlyPct.toFixed(2)}% per month</strong> — after
                    1 month it&apos;s roughly <strong>{fmt(grownValue)}</strong>, and it keeps compounding until it matures.
                  </li>
                  <li>
                    The plan matures in <strong>{durationMonths} months</strong> (on {fmtDate(maturityDate)}). If they wait
                    until then and withdraw, the projected value is about <strong>{fmt(grownAtMaturity)}</strong>, minus a{" "}
                    <strong>{exitFeePct.toFixed(2)}%</strong> exit fee ({fmt(exitFeeAtMaturity)}) ={" "}
                    <strong className="text-[#00A94F]">{fmt(payoutAtMaturity)}</strong> paid to their wallet.
                  </li>
                  <li>
                    If they withdraw <em>before</em> maturity instead, a higher <strong>{earlyFeePct.toFixed(2)}%</strong> early-exit
                    fee applies — right now that would be {fmt(netInvested)} − {fmt(earlyFeeNow)} fee ={" "}
                    <strong>{fmt(payoutIfWithdrawnNow)}</strong>.
                  </li>
                </ul>
                <p className="text-xs text-gray-500 dark:text-gray-400 pt-1 border-t border-[#00A94F]/15">
                  This updates live as you edit the fields above — use it to sanity-check the numbers before saving.
                </p>
              </div>
            );
          })()}

          <div className="flex gap-3 justify-end">
            <button onClick={() => { setEditTier(null); setNewTier(false); resetForm(); }}
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-sm font-medium text-gray-600 dark:text-gray-400">Cancel</button>
            <button onClick={handleSave} disabled={saving || !form.label || !form.minAmount || !form.maxAmount}
              className="px-4 py-2.5 rounded-xl bg-[#10211D] hover:bg-[#10211D]/90 disabled:opacity-50 text-white text-sm font-semibold flex items-center gap-2">
              {saving ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <IconCheck size={16} />}
              {editTier ? "Update" : "Create"}
            </button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <th className="text-left px-5 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Tier</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Duration</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">1W Return</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">1M Return</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">6M Return</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Fees</th>
                <th className="text-center px-5 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Status</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {tiers.map((tier) => (
                <tr key={tier.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-5 py-4 font-medium text-gray-900 dark:text-white">
                    <div className="flex items-center gap-3">
                      {tier.imageUrl && (
                        <img src={tier.imageUrl} alt="" className="h-10 w-10 shrink-0 rounded-lg object-cover border border-gray-200 dark:border-gray-800" />
                      )}
                      <div>
                        {tier.label}
                        {tier.tagline && (
                          <div className="mt-0.5 text-xs font-normal text-gray-500 dark:text-gray-400">{tier.tagline}</div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-right text-gray-600 dark:text-gray-400">{tier.durationMonths} months</td>
                  <td className="px-5 py-4 text-right text-emerald-600 dark:text-emerald-400 font-medium">{parseFloat(tier.weeklyReturn).toFixed(2)}%</td>
                  <td className="px-5 py-4 text-right text-emerald-600 dark:text-emerald-400 font-medium">{parseFloat(tier.monthlyReturn).toFixed(2)}%</td>
                  <td className="px-5 py-4 text-right text-emerald-600 dark:text-emerald-400 font-medium">{parseFloat(tier.halfYearlyReturn).toFixed(2)}%</td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex flex-col items-end gap-0.5 text-xs">
                      <span className="text-gray-600 dark:text-gray-400">Maint: <span className="font-medium text-gray-900 dark:text-white">{parseFloat(tier.maintenanceFeePercent ?? "0").toFixed(2)}%</span></span>
                      <span className="text-gray-600 dark:text-gray-400">Exit: <span className="font-medium text-gray-900 dark:text-white">{parseFloat(tier.exitFeePercent ?? "0").toFixed(2)}%</span></span>
                      <span className="text-gray-600 dark:text-gray-400">Early: <span className="font-medium text-gray-900 dark:text-white">{parseFloat(tier.earlyExitFeePercent ?? "0").toFixed(2)}%</span></span>
                    </div>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <button onClick={() => handleToggleActive(tier)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${tier.isActive ? "bg-[#EAF7E8] text-[#00A94F]" : "bg-[#F3F8EF] text-[#89938E]"}`}>
                      {tier.isActive ? "Active" : "Inactive"}
                    </button>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(tier)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"><IconEdit size={16} /></button>
                      <button onClick={() => handleDelete(tier.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"><IconTrash size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {tiers.length === 0 && (
                <tr><td colSpan={8} className="px-5 py-12 text-center text-gray-500">No tiers configured yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function PricesTab({ prices, onRefresh, showToast }: { prices: IndexPriceEntry[]; onRefresh: () => Promise<void>; showToast: (t: "success" | "error", m: string) => void }) {
  const [newPrice, setNewPrice] = useState(false);
  const [form, setForm] = useState({ price: "", changePercent: "", changeAmount: "", dateLabel: "" });
  const [saving, setSaving] = useState(false);

  const resetForm = () => setForm({ price: "", changePercent: "", changeAmount: "", dateLabel: "" });

  const handleCreate = async () => {
    if (!form.price) return;
    setSaving(true);
    try {
      await indexAPI.createPrice({
        price: parseFloat(form.price),
        changePercent: parseFloat(form.changePercent || "0"),
        changeAmount: parseFloat(form.changeAmount || "0"),
        dateLabel: form.dateLabel || undefined,
      });
      showToast("success", "Price entry created");
      setNewPrice(false);
      resetForm();
      await onRefresh();
    } catch (err: any) {
      showToast("error", err.message || "Failed to create");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this price entry?")) return;
    try {
      await indexAPI.deletePrice(id);
      showToast("success", "Price entry deleted");
      await onRefresh();
    } catch (err: any) {
      showToast("error", err.message || "Failed to delete");
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">{prices.length} price entries</p>
        <button onClick={() => setNewPrice(true)}
          className="flex items-center gap-2 px-4 py-2 bg-[#10211D] hover:bg-[#10211D]/90 text-white rounded-xl text-sm font-semibold transition-colors">
          <IconPlus size={16} /> Add Price
        </button>
      </div>

      {newPrice && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">New Price Entry</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-gray-500">Price *</label>
              <input type="number" step="0.000001" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })}
                placeholder="0.02" className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00A94F]/40" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Date Label</label>
              <input value={form.dateLabel} onChange={(e) => setForm({ ...form, dateLabel: e.target.value })}
                placeholder="e.g. 04 Aug" className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00A94F]/40" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Change %</label>
              <input type="number" step="0.01" value={form.changePercent} onChange={(e) => setForm({ ...form, changePercent: e.target.value })}
                placeholder="2.56" className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00A94F]/40" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Change Amount</label>
              <input type="number" step="0.000001" value={form.changeAmount} onChange={(e) => setForm({ ...form, changeAmount: e.target.value })}
                placeholder="0.0005" className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00A94F]/40" />
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => { setNewPrice(false); resetForm(); }}
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-sm font-medium text-gray-600 dark:text-gray-400">Cancel</button>
            <button onClick={handleCreate} disabled={saving || !form.price}
              className="px-4 py-2.5 rounded-xl bg-[#10211D] hover:bg-[#10211D]/90 disabled:opacity-50 text-white text-sm font-semibold flex items-center gap-2">
              {saving ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <IconCheck size={16} />}
              Create
            </button>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                <th className="text-left px-5 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Date</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Price</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Change</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {prices.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-5 py-4 font-medium text-gray-900 dark:text-white">{p.dateLabel || new Date(p.recordedAt).toLocaleDateString()}</td>
                  <td className="px-5 py-4 text-right font-medium text-gray-900 dark:text-white">${parseFloat(p.price).toFixed(4)}</td>
                  <td className="px-5 py-4 text-right">
                    <span className={`font-medium ${parseFloat(p.changePercent) >= 0 ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"}`}>
                      {parseFloat(p.changePercent) >= 0 ? "+" : ""}{parseFloat(p.changePercent).toFixed(2)}%
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <button onClick={() => handleDelete(p.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"><IconTrash size={16} /></button>
                  </td>
                </tr>
              ))}
              {prices.length === 0 && (
                <tr><td colSpan={4} className="px-5 py-12 text-center text-gray-500">No price entries yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AllocationsTab({ allocations, onRefresh, showToast }: { allocations: FundAllocation[]; onRefresh: () => Promise<void>; showToast: (t: "success" | "error", m: string) => void }) {
  const [editId, setEditId] = useState<string | null>(null);
  const [newRow, setNewRow] = useState(false);
  const [form, setForm] = useState({ label: "", percent: "", description: "", detailsText: "", imageUrl: "" });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const resetForm = () => setForm({ label: "", percent: "", description: "", detailsText: "", imageUrl: "" });

  const handleImageSelect = async (file: File | undefined) => {
    if (!file) return;
    setUploading(true);
    try {
      const res = await indexAPI.uploadFundAllocationImage(file);
      setForm((f) => ({ ...f, imageUrl: res.imageUrl }));
    } catch (err: any) {
      showToast("error", err.message || "Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  // Sub-items are edited as plain "Label — 10" lines, one per row, and parsed
  // into the { label, percent }[] JSON the API expects.
  const parseDetails = (text: string): FundAllocationDetail[] | undefined => {
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) return undefined;
    const details: FundAllocationDetail[] = [];
    for (const line of lines) {
      const m = line.match(/^(.+?)\s*[—-]\s*([\d.]+)%?$/);
      if (m) details.push({ label: m[1].trim(), percent: parseFloat(m[2]) });
    }
    return details.length > 0 ? details : undefined;
  };

  const detailsToText = (details: FundAllocationDetail[] | null) =>
    (details || []).map((d) => `${d.label} — ${d.percent}`).join("\n");

  const totalPercent = allocations.filter((a) => a.isActive).reduce((sum, a) => sum + parseFloat(a.percent), 0);

  const startEdit = (a: FundAllocation) => {
    setEditId(a.id);
    setNewRow(false);
    setForm({ label: a.label, percent: a.percent, description: a.description || "", detailsText: detailsToText(a.details), imageUrl: a.imageUrl || "" });
  };

  const handleCreate = async () => {
    if (!form.label || !form.percent) return;
    setSaving(true);
    try {
      await indexAPI.createFundAllocation({
        label: form.label,
        percent: parseFloat(form.percent),
        description: form.description || undefined,
        details: parseDetails(form.detailsText),
        sortOrder: allocations.length,
        imageUrl: form.imageUrl || undefined,
      });
      showToast("success", "Allocation created");
      setNewRow(false);
      resetForm();
      await onRefresh();
    } catch (err: any) {
      showToast("error", err.message || "Failed to create");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (id: string) => {
    setSaving(true);
    try {
      await indexAPI.updateFundAllocation(id, {
        label: form.label,
        percent: parseFloat(form.percent),
        description: form.description || undefined,
        details: parseDetails(form.detailsText),
        imageUrl: form.imageUrl || undefined,
      });
      showToast("success", "Allocation updated");
      setEditId(null);
      resetForm();
      await onRefresh();
    } catch (err: any) {
      showToast("error", err.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleActive = async (a: FundAllocation) => {
    try {
      await indexAPI.updateFundAllocation(a.id, { isActive: !a.isActive });
      showToast("success", a.isActive ? "Allocation hidden" : "Allocation shown");
      await onRefresh();
    } catch (err: any) {
      showToast("error", err.message || "Failed to update");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this allocation category?")) return;
    try {
      await indexAPI.deleteFundAllocation(id);
      showToast("success", "Allocation deleted");
      await onRefresh();
    } catch (err: any) {
      showToast("error", err.message || "Failed to delete");
    }
  };

  const FormFields = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label className="text-xs font-medium text-gray-500">Category label *</label>
        <input value={form.label} onChange={(e) => setForm({ ...form, label: e.target.value })}
          placeholder="e.g. Forex" className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00A94F]/40" />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500">Allocation % *</label>
        <input type="number" step="0.01" value={form.percent} onChange={(e) => setForm({ ...form, percent: e.target.value })}
          placeholder="35" className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00A94F]/40" />
      </div>
      <div className="sm:col-span-2">
        <label className="text-xs font-medium text-gray-500">Description</label>
        <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
          placeholder="e.g. Major currency pairs (EUR/USD, GBP/USD, USD/JPY etc.)" className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00A94F]/40" />
      </div>
      <div className="sm:col-span-2">
        <label className="text-xs font-medium text-gray-500">Sub-items (one per line, e.g. &quot;EUR/USD — 10&quot;)</label>
        <textarea value={form.detailsText} onChange={(e) => setForm({ ...form, detailsText: e.target.value })}
          rows={4} placeholder={"EUR/USD — 10\nGBP/USD — 8\nUSD/JPY — 5"}
          className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00A94F]/40 font-mono" />
      </div>
      <div className="sm:col-span-2">
        <label className="text-xs font-medium text-gray-500">Category image</label>
        <div className="mt-1 flex items-center gap-3">
          {form.imageUrl && (
            <img src={form.imageUrl} alt="" className="h-14 w-14 rounded-lg object-cover border border-gray-200 dark:border-gray-800" />
          )}
          <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-600 dark:text-gray-400 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800">
            {uploading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" /> : <IconUpload size={16} />}
            {form.imageUrl ? "Replace image" : "Upload image"}
            <input type="file" accept="image/png,image/jpeg,image/webp" className="hidden" disabled={uploading}
              onChange={(e) => handleImageSelect(e.target.files?.[0])} />
          </label>
          {form.imageUrl && (
            <button type="button" onClick={() => setForm((f) => ({ ...f, imageUrl: "" }))}
              className="text-xs text-red-500 hover:underline">Remove</button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {allocations.length} categories — active total: <span className={totalPercent === 100 ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-amber-600 dark:text-amber-400 font-semibold"}>{totalPercent.toFixed(2)}%</span>
        </p>
        <button onClick={() => { setNewRow(true); setEditId(null); resetForm(); }}
          className="flex items-center gap-2 px-4 py-2 bg-[#10211D] hover:bg-[#10211D]/90 text-white rounded-xl text-sm font-semibold transition-colors">
          <IconPlus size={16} /> Add Category
        </button>
      </div>

      {totalPercent !== 100 && allocations.length > 0 && (
        <p className="text-xs text-amber-600 dark:text-amber-400">Active categories should add up to 100% — this is what the client dashboard will display as-is.</p>
      )}

      {newRow && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">New Allocation Category</h3>
          <FormFields />
          <div className="flex gap-3 justify-end">
            <button onClick={() => { setNewRow(false); resetForm(); }}
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-sm font-medium text-gray-600 dark:text-gray-400">Cancel</button>
            <button onClick={handleCreate} disabled={saving || !form.label || !form.percent}
              className="px-4 py-2.5 rounded-xl bg-[#10211D] hover:bg-[#10211D]/90 disabled:opacity-50 text-white text-sm font-semibold flex items-center gap-2">
              {saving ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <IconCheck size={16} />}
              Create
            </button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {allocations.map((a) => (
          <div key={a.id} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5">
            {editId === a.id ? (
              <div className="space-y-4">
                <FormFields />
                <div className="flex gap-3 justify-end">
                  <button onClick={() => { setEditId(null); resetForm(); }}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-sm font-medium text-gray-600 dark:text-gray-400">Cancel</button>
                  <button onClick={() => handleUpdate(a.id)} disabled={saving}
                    className="px-4 py-2.5 rounded-xl bg-[#10211D] hover:bg-[#10211D]/90 disabled:opacity-50 text-white text-sm font-semibold flex items-center gap-2">
                    {saving ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <IconCheck size={16} />}
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  {a.imageUrl && (
                    <img src={a.imageUrl} alt="" className="h-12 w-12 shrink-0 rounded-lg object-cover border border-gray-200 dark:border-gray-800" />
                  )}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-semibold text-gray-900 dark:text-white">{a.label}</p>
                      <span className="text-sm font-bold text-[#00A94F]">{parseFloat(a.percent).toFixed(2)}%</span>
                      {!a.isActive && <span className="text-[10px] uppercase tracking-wide font-semibold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500">Hidden</span>}
                    </div>
                    {a.description && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{a.description}</p>}
                    {a.details && a.details.length > 0 && (
                      <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
                        {a.details.map((d) => (
                          <li key={d.label}>{d.label} — {d.percent}%</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button onClick={() => handleToggleActive(a)} title={a.isActive ? "Hide from dashboard" : "Show on dashboard"}
                    className="px-2.5 py-1.5 rounded-lg text-xs font-medium border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800">
                    {a.isActive ? "Hide" : "Show"}
                  </button>
                  <button onClick={() => startEdit(a)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-400"><IconEdit size={16} /></button>
                  <button onClick={() => handleDelete(a.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-500"><IconTrash size={16} /></button>
                </div>
              </div>
            )}
          </div>
        ))}
        {allocations.length === 0 && !newRow && (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-12 text-center text-sm text-gray-500">
            No allocation categories yet — add one to show fund diversification on the client dashboard.
          </div>
        )}
      </div>
    </div>
  );
}

function ManagerTab({ manager, onRefresh, showToast }: { manager: IndexManager | null; onRefresh: () => Promise<void>; showToast: (t: "success" | "error", m: string) => void }) {
  const [form, setForm] = useState({ name: "", title: "", bio: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (manager) {
      setForm({ name: manager.name, title: manager.title, bio: manager.bio || "" });
    }
  }, [manager]);

  const handleSave = async () => {
    if (!form.name || !form.title) return;
    setSaving(true);
    try {
      await indexAPI.upsertManager({ name: form.name, title: form.title, bio: form.bio || undefined });
      showToast("success", "Manager updated");
      await onRefresh();
    } catch (err: any) {
      showToast("error", err.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-4 max-w-xl">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Index Manager</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400">The index manager is displayed on the client Index page.</p>
      <div>
        <label className="text-xs font-medium text-gray-500">Name *</label>
        <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="e.g. Orla Steenbakkers"
          className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00A94F]/40" />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500">Title *</label>
        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="e.g. Index Manager"
          className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00A94F]/40" />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500">Bio</label>
        <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}
          placeholder="Brief bio of the index manager..."
          rows={3}
          className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00A94F]/40 resize-none" />
      </div>
      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving || !form.name || !form.title}
          className="px-6 py-2.5 rounded-xl bg-[#10211D] hover:bg-[#10211D]/90 disabled:opacity-50 text-white text-sm font-semibold flex items-center gap-2">
          {saving ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <IconCheck size={16} />}
          {manager ? "Update" : "Save"}
        </button>
      </div>
    </div>
  );
}

function FeesTab({ settings, onRefresh, showToast }: { settings: IndexSettingsData | null; onRefresh: () => Promise<void>; showToast: (t: "success" | "error", m: string) => void }) {
  const [form, setForm] = useState({
    maintenanceFeePercent: "5",
    level1Percent: "2",
    level2Percent: "0.5",
    level3Percent: "0.5",
    level4Percent: "0.5",
    level5Percent: "0.5",
    earlyWithdrawalPercent: "17",
    maturityWithdrawalFee: "2",
    referralTierLevel1MinInvestment: "200",
    referralTierLevel123MinInvestment: "1000",
    referralTierLevel12345MinInvestment: "2000",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (settings) {
      setForm({
        maintenanceFeePercent: settings.maintenanceFeePercent,
        level1Percent: settings.level1Percent,
        level2Percent: settings.level2Percent,
        level3Percent: settings.level3Percent,
        level4Percent: settings.level4Percent,
        level5Percent: settings.level5Percent,
        earlyWithdrawalPercent: settings.earlyWithdrawalPercent ?? "17",
        maturityWithdrawalFee: settings.maturityWithdrawalFee ?? "2",
        referralTierLevel1MinInvestment: settings.referralTierLevel1MinInvestment ?? "200",
        referralTierLevel123MinInvestment: settings.referralTierLevel123MinInvestment ?? "1000",
        referralTierLevel12345MinInvestment: settings.referralTierLevel12345MinInvestment ?? "2000",
      });
    }
  }, [settings]);

  const levelTotal = ["level1Percent", "level2Percent", "level3Percent", "level4Percent", "level5Percent"]
    .reduce((sum, k) => sum + (parseFloat(form[k as keyof typeof form]) || 0), 0);
  const feeTotal = parseFloat(form.maintenanceFeePercent) || 0;
  const platformShare = feeTotal - levelTotal;

  const handleSave = async () => {
    setSaving(true);
    try {
      await indexAPI.updateSettings({
        maintenanceFeePercent: parseFloat(form.maintenanceFeePercent),
        level1Percent: parseFloat(form.level1Percent),
        level2Percent: parseFloat(form.level2Percent),
        level3Percent: parseFloat(form.level3Percent),
        level4Percent: parseFloat(form.level4Percent),
        level5Percent: parseFloat(form.level5Percent),
        earlyWithdrawalPercent: parseFloat(form.earlyWithdrawalPercent),
        maturityWithdrawalFee: parseFloat(form.maturityWithdrawalFee),
        referralTierLevel1MinInvestment: parseFloat(form.referralTierLevel1MinInvestment),
        referralTierLevel123MinInvestment: parseFloat(form.referralTierLevel123MinInvestment),
        referralTierLevel12345MinInvestment: parseFloat(form.referralTierLevel12345MinInvestment),
      });
      showToast("success", "Fee settings updated");
      await onRefresh();
    } catch (err: any) {
      showToast("error", err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const fields: { key: keyof typeof form; label: string }[] = [
    { key: "maintenanceFeePercent", label: "Maintenance Fee (% of investment)" },
    { key: "level1Percent", label: "Level 1 (direct referrer)" },
    { key: "level2Percent", label: "Level 2" },
    { key: "level3Percent", label: "Level 3" },
    { key: "level4Percent", label: "Level 4" },
    { key: "level5Percent", label: "Level 5" },
  ];

  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6 space-y-4 max-w-xl">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Index Investment Fees & Commission</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          When a user invests in the Index, this maintenance fee is deducted from their amount. It is then
          split across up to 5 levels of their referral chain. Whatever the fee doesn't cover goes to the platform —
          this is never shown to users.
        </p>
      </div>

      {fields.map((f) => (
        <div key={f.key}>
          <label className="text-xs font-medium text-gray-500 dark:text-gray-400">{f.label}</label>
          <div className="relative mt-1">
            <input type="number" step="0.01" min="0" value={form[f.key]}
              onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
              className="w-full px-4 py-2.5 pr-8 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00A94F]/40" />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">%</span>
          </div>
        </div>
      ))}

      <div className={`rounded-xl border p-4 text-sm ${platformShare < 0 ? "border-red-300 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300" : "border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400"}`}>
        <div className="flex justify-between"><span>Total fee</span><span className="font-semibold">{feeTotal.toFixed(2)}%</span></div>
        <div className="flex justify-between"><span>Paid to referral levels</span><span className="font-semibold">{levelTotal.toFixed(2)}%</span></div>
        <div className="flex justify-between mt-1 pt-1 border-t border-gray-200 dark:border-gray-700">
          <span>Platform share (remainder)</span>
          <span className="font-semibold">{platformShare.toFixed(2)}%</span>
        </div>
        {platformShare < 0 && (
          <p className="mt-2 text-xs">Level percentages exceed the total fee — reduce them or raise the fee.</p>
        )}
      </div>

      <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Withdrawal Fees</h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          Applied when a user withdraws their index investment back to their wallet.
        </p>
      </div>

      <div>
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Early Withdrawal Fee (% of investment)</label>
        <div className="relative mt-1">
          <input type="number" step="0.01" min="0" value={form.earlyWithdrawalPercent}
            onChange={(e) => setForm({ ...form, earlyWithdrawalPercent: e.target.value })}
            className="w-full px-4 py-2.5 pr-8 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00A94F]/40" />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">%</span>
        </div>
        <p className="text-[11px] text-gray-400 mt-1">Charged if a user withdraws before their plan's duration is complete.</p>
      </div>

      <div>
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Maturity Withdrawal Fee ($)</label>
        <div className="relative mt-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">$</span>
          <input type="number" step="0.01" min="0" value={form.maturityWithdrawalFee}
            onChange={(e) => setForm({ ...form, maturityWithdrawalFee: e.target.value })}
            className="w-full pl-7 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00A94F]/40" />
        </div>
        <p className="text-[11px] text-gray-400 mt-1">Flat fee charged if a user withdraws after their plan has fully matured.</p>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-800 pt-4">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">5-Level Referral Income Qualification</h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          How many referral levels a user can earn commission from depends on how much they have personally
          invested in the Index. Below the first threshold they earn nothing; each threshold unlocks more levels.
        </p>
      </div>

      <div>
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Level 1 unlocks at (min. self investment)</label>
        <div className="relative mt-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">$</span>
          <input type="number" step="1" min="0" value={form.referralTierLevel1MinInvestment}
            onChange={(e) => setForm({ ...form, referralTierLevel1MinInvestment: e.target.value })}
            className="w-full pl-7 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00A94F]/40" />
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Levels 1-3 unlock at (min. self investment)</label>
        <div className="relative mt-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">$</span>
          <input type="number" step="1" min="0" value={form.referralTierLevel123MinInvestment}
            onChange={(e) => setForm({ ...form, referralTierLevel123MinInvestment: e.target.value })}
            className="w-full pl-7 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00A94F]/40" />
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-gray-500 dark:text-gray-400">All 5 levels unlock at (min. self investment)</label>
        <div className="relative mt-1">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">$</span>
          <input type="number" step="1" min="0" value={form.referralTierLevel12345MinInvestment}
            onChange={(e) => setForm({ ...form, referralTierLevel12345MinInvestment: e.target.value })}
            className="w-full pl-7 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#00A94F]/40" />
        </div>
        <p className="text-[11px] text-gray-400 mt-1">
          Thresholds are cumulative and based on a user's total ACTIVE + MATURED Index investment.
        </p>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving}
          className="px-6 py-2.5 rounded-xl bg-[#10211D] hover:bg-[#10211D]/90 disabled:opacity-50 text-white text-sm font-semibold flex items-center gap-2">
          {saving ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <IconCheck size={16} />}
          Save
        </button>
      </div>
    </div>
  );
}
