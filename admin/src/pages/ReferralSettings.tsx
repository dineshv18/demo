/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import { IconSettings, IconCheck, IconLoader2, IconUsers, IconWallet } from "@tabler/icons-react";
import { referralAPI, type AdminReferral } from "../services/api";

export default function ReferralSettings() {
  const [rate, setRate] = useState("2");
  const [referrals, setReferrals] = useState<AdminReferral[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [settingsRes, referralsRes] = await Promise.allSettled([
        referralAPI.getSettings(),
        referralAPI.getAll({ limit: 50 }),
      ]);
      if (settingsRes.status === "fulfilled") {
        setRate(settingsRes.value.settings.commissionRate);
      }
      if (referralsRes.status === "fulfilled") {
        setReferrals(referralsRes.value.referrals);
        setTotal(referralsRes.value.total);
      }
    } catch {
      showToast("error", "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleSave = async () => {
    const numRate = parseFloat(rate);
    if (isNaN(numRate) || numRate < 0 || numRate > 100) {
      showToast("error", "Rate must be between 0 and 100");
      return;
    }
    setSaving(true);
    try {
      await referralAPI.updateSettings(numRate);
      showToast("success", "Commission rate updated");
      fetchData();
    } catch (err: any) {
      showToast("error", err.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  const statusBadge = (status: string) => {
    const cfg: Record<string, string> = {
      REGISTERED: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
      KYC_DONE: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
      DEPOSITED: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
      COMMISSION_PAID: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
    };
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${cfg[status] || cfg.REGISTERED}`}>
        {status.replace("_", " ")}
      </span>
    );
  };

  const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <IconLoader2 className="h-6 w-6 animate-spin text-violet-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] px-5 py-3 rounded-lg shadow-lg text-sm font-medium text-white ${toast.type === "success" ? "bg-emerald-600" : "bg-red-600"}`}>
          {toast.message}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Referral Settings</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Configure referral commission rates and view all referrals.</p>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-violet-500/10">
            <IconSettings className="h-5 w-5 text-violet-500" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Commission Rate</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Percentage earned on each referred user&apos;s deposit</p>
          </div>
        </div>
        <div className="flex items-end gap-4">
          <div className="flex-1 max-w-xs">
            <label className="text-xs font-medium text-gray-500 dark:text-gray-400">Rate (%)</label>
            <div className="relative mt-1">
              <input
                type="number"
                value={rate}
                onChange={(e) => setRate(e.target.value)}
                min="0"
                max="100"
                step="0.5"
                className="w-full rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">%</span>
            </div>
          </div>
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-violet-500 hover:bg-violet-600 disabled:opacity-50 text-white text-sm font-semibold transition-colors">
            {saving ? <IconLoader2 className="h-4 w-4 animate-spin" /> : <IconCheck size={16} />}
            Save
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-3">Default is 2%. When a referred user deposits $100, referrer earns $2.</p>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-2 mb-2">
            <IconUsers className="h-4 w-4 text-violet-500" />
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Referrals</p>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">{total}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
          <div className="flex items-center gap-2 mb-2">
            <IconWallet className="h-4 w-4 text-emerald-500" />
            <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Commission Paid</p>
          </div>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            ${referrals.reduce((sum, r) => sum + r.commissions.reduce((cs, c) => cs + parseFloat(c.amount), 0), 0).toFixed(2)}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">All Referrals</h3>
        </div>
        {referrals.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">No referrals yet</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Referrer</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Referred User</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Commission</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {referrals.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-900 dark:text-white">{r.referrer.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{r.referrer.email}</p>
                    </td>
                    <td className="px-5 py-4">
                      <p className="font-medium text-gray-900 dark:text-white">{r.referred.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{r.referred.email}</p>
                    </td>
                    <td className="px-5 py-4">{statusBadge(r.status)}</td>
                    <td className="px-5 py-4 text-xs text-gray-500 dark:text-gray-400">{fmtDate(r.registeredAt)}</td>
                    <td className="px-5 py-4 text-sm font-medium text-gray-900 dark:text-white">
                      ${r.commissions.reduce((sum, c) => sum + parseFloat(c.amount), 0).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
