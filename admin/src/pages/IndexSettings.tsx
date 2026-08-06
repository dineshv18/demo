/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import {
  IconPlus, IconEdit, IconTrash, IconCheck,
  IconChartLine, IconUser, IconCoin,
} from "@tabler/icons-react";
import { indexAPI, type IndexTier, type IndexPriceEntry, type IndexManager } from "../services/api";

type Tab = "tiers" | "prices" | "manager";

export default function IndexSettings() {
  const [tab, setTab] = useState<Tab>("tiers");
  const [tiers, setTiers] = useState<IndexTier[]>([]);
  const [prices, setPrices] = useState<IndexPriceEntry[]>([]);
  const [manager, setManager] = useState<IndexManager | null>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [tiersRes, pricesRes, managerRes] = await Promise.allSettled([
        indexAPI.getTiers(),
        indexAPI.getPrices(),
        indexAPI.getManager(),
      ]);
      if (tiersRes.status === "fulfilled") setTiers(tiersRes.value.tiers);
      if (pricesRes.status === "fulfilled") setPrices(pricesRes.value.prices);
      if (managerRes.status === "fulfilled") setManager(managerRes.value.manager);
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
      <div className="inline-flex rounded-xl border border-gray-200 dark:border-gray-800 p-1 bg-white dark:bg-gray-900">
        {(["tiers", "prices", "manager"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${tab === t ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"}`}>
            {t === "tiers" && <IconCoin size={16} />}
            {t === "prices" && <IconChartLine size={16} />}
            {t === "manager" && <IconUser size={16} />}
            {t === "tiers" ? "Investment Tiers" : t === "prices" ? "Price History" : "Index Manager"}
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
        </>
      )}
    </div>
  );
}

function TiersTab({ tiers, onRefresh, showToast }: { tiers: IndexTier[]; onRefresh: () => Promise<void>; showToast: (t: "success" | "error", m: string) => void }) {
  const [editTier, setEditTier] = useState<IndexTier | null>(null);
  const [newTier, setNewTier] = useState(false);
  const [form, setForm] = useState({ minAmount: "", maxAmount: "", label: "", weeklyReturn: "", monthlyReturn: "", halfYearlyReturn: "" });
  const [saving, setSaving] = useState(false);

  const resetForm = () => setForm({ minAmount: "", maxAmount: "", label: "", weeklyReturn: "", monthlyReturn: "", halfYearlyReturn: "" });

  const openEdit = (tier: IndexTier) => {
    setEditTier(tier);
    setForm({
      minAmount: tier.minAmount,
      maxAmount: tier.maxAmount,
      label: tier.label,
      weeklyReturn: tier.weeklyReturn,
      monthlyReturn: tier.monthlyReturn,
      halfYearlyReturn: tier.halfYearlyReturn,
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
          weeklyReturn: form.weeklyReturn,
          monthlyReturn: form.monthlyReturn,
          halfYearlyReturn: form.halfYearlyReturn,
        });
        showToast("success", "Tier updated");
      } else {
        await indexAPI.createTier({
          minAmount: parseFloat(form.minAmount),
          maxAmount: parseFloat(form.maxAmount),
          label: form.label,
          weeklyReturn: parseFloat(form.weeklyReturn || "0"),
          monthlyReturn: parseFloat(form.monthlyReturn || "0"),
          halfYearlyReturn: parseFloat(form.halfYearlyReturn || "0"),
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
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-semibold transition-colors">
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
                className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Min Amount *</label>
                <input type="number" value={form.minAmount} onChange={(e) => setForm({ ...form, minAmount: e.target.value })}
                  placeholder="100"
                  className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
              </div>
              <div>
                <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Max Amount *</label>
                <input type="number" value={form.maxAmount} onChange={(e) => setForm({ ...form, maxAmount: e.target.value })}
                  placeholder="500"
                  className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
              </div>
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Weekly Return (%)</label>
              <input type="number" step="0.01" value={form.weeklyReturn} onChange={(e) => setForm({ ...form, weeklyReturn: e.target.value })}
                placeholder="0.50"
                className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Monthly Return (%)</label>
              <input type="number" step="0.01" value={form.monthlyReturn} onChange={(e) => setForm({ ...form, monthlyReturn: e.target.value })}
                placeholder="2.00"
                className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400">6-Month Return (%)</label>
              <input type="number" step="0.01" value={form.halfYearlyReturn} onChange={(e) => setForm({ ...form, halfYearlyReturn: e.target.value })}
                placeholder="12.00"
                className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => { setEditTier(null); setNewTier(false); resetForm(); }}
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-sm font-medium text-gray-600 dark:text-gray-400">Cancel</button>
            <button onClick={handleSave} disabled={saving || !form.label || !form.minAmount || !form.maxAmount}
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-sm font-semibold flex items-center gap-2">
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
                <th className="text-right px-5 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">1W Return</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">1M Return</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">6M Return</th>
                <th className="text-center px-5 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Status</th>
                <th className="text-right px-5 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {tiers.map((tier) => (
                <tr key={tier.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-5 py-4 font-medium text-gray-900 dark:text-white">{tier.label}</td>
                  <td className="px-5 py-4 text-right text-emerald-600 dark:text-emerald-400 font-medium">{parseFloat(tier.weeklyReturn).toFixed(2)}%</td>
                  <td className="px-5 py-4 text-right text-emerald-600 dark:text-emerald-400 font-medium">{parseFloat(tier.monthlyReturn).toFixed(2)}%</td>
                  <td className="px-5 py-4 text-right text-emerald-600 dark:text-emerald-400 font-medium">{parseFloat(tier.halfYearlyReturn).toFixed(2)}%</td>
                  <td className="px-5 py-4 text-center">
                    <button onClick={() => handleToggleActive(tier)}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${tier.isActive ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300" : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"}`}>
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
                <tr><td colSpan={6} className="px-5 py-12 text-center text-gray-500">No tiers configured yet.</td></tr>
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
          className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-sm font-semibold transition-colors">
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
                placeholder="0.02" className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Date Label</label>
              <input value={form.dateLabel} onChange={(e) => setForm({ ...form, dateLabel: e.target.value })}
                placeholder="e.g. 04 Aug" className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Change %</label>
              <input type="number" step="0.01" value={form.changePercent} onChange={(e) => setForm({ ...form, changePercent: e.target.value })}
                placeholder="2.56" className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
            </div>
            <div>
              <label className="text-xs font-medium text-gray-500">Change Amount</label>
              <input type="number" step="0.000001" value={form.changeAmount} onChange={(e) => setForm({ ...form, changeAmount: e.target.value })}
                placeholder="0.0005" className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button onClick={() => { setNewPrice(false); resetForm(); }}
              className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-sm font-medium text-gray-600 dark:text-gray-400">Cancel</button>
            <button onClick={handleCreate} disabled={saving || !form.price}
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-sm font-semibold flex items-center gap-2">
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
          className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500">Title *</label>
        <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
          placeholder="e.g. Index Manager"
          className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50" />
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500">Bio</label>
        <textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })}
          placeholder="Brief bio of the index manager..."
          rows={3}
          className="mt-1 w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none" />
      </div>
      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving || !form.name || !form.title}
          className="px-6 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white text-sm font-semibold flex items-center gap-2">
          {saving ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <IconCheck size={16} />}
          {manager ? "Update" : "Save"}
        </button>
      </div>
    </div>
  );
}
