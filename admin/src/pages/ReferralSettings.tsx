/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import { IconSettings, IconCheck, IconLoader2, IconUsers, IconWallet } from "@tabler/icons-react";
import { referralAPI, type AdminReferral } from "../services/api";
import { Card, CardContent, CardHeader } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../components/ui/table";

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
      REGISTERED: "bg-amber-100 text-amber-700",
      KYC_DONE: "bg-[#F3F8EF] text-[#10211D]",
      DEPOSITED: "bg-[#EAF7E8] text-[#00A94F]",
      COMMISSION_PAID: "bg-[#EAF7E8] text-[#00A94F]",
    };
    return (
      <Badge className={cfg[status] || cfg.REGISTERED}>
        {status.replace("_", " ")}
      </Badge>
    );
  };

  const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <IconLoader2 className="h-6 w-6 animate-spin text-[#00A94F]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] px-5 py-3 rounded-xl shadow-lg text-sm font-medium text-white ${toast.type === "success" ? "bg-[#00A94F]" : "bg-red-600"}`}>
          {toast.message}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#10211D]">Referral Settings</h1>
        <p className="mt-1 text-sm text-[#68736E]">Configure referral commission rates and view all referrals.</p>
      </div>

      <Card className="rounded-2xl border border-[#DDE4DE] shadow-[0_8px_30px_rgba(16,33,29,0.05)]">
        <CardContent>
          <div className="flex items-center gap-3 mb-4">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#EAF7E8] shrink-0">
              <IconSettings className="h-5 w-5 text-[#00A94F]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#10211D]">Commission Rate</h2>
              <p className="text-sm text-[#68736E]">Percentage earned on each referred user&apos;s deposit</p>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <div className="flex-1 max-w-xs">
              <label className="text-xs font-medium text-[#68736E]">Rate (%)</label>
              <div className="relative mt-1">
                <Input
                  type="number"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  min="0"
                  max="100"
                  step="0.5"
                  className="pr-8 rounded-xl border-[#DDE4DE]"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-[#68736E]">%</span>
              </div>
            </div>
            <Button onClick={handleSave} disabled={saving} className="rounded-xl bg-[#10211D] hover:bg-[#10211D]/90 text-white">
              {saving ? <IconLoader2 className="h-4 w-4 animate-spin" /> : <IconCheck size={16} />}
              Save
            </Button>
          </div>
          <p className="text-xs text-[#68736E] mt-3">Default is 2%. When a referred user deposits $100, referrer earns $2.</p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Card className="rounded-2xl border border-[#DDE4DE] shadow-[0_8px_30px_rgba(16,33,29,0.05)]">
          <CardContent>
            <div className="flex items-center gap-2 mb-2">
              <IconUsers className="h-4 w-4 text-[#00A94F]" />
              <p className="text-xs text-[#68736E] uppercase tracking-wider">Total Referrals</p>
            </div>
            <p className="text-2xl font-bold text-[#10211D]">{total}</p>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-[#DDE4DE] shadow-[0_8px_30px_rgba(16,33,29,0.05)]">
          <CardContent>
            <div className="flex items-center gap-2 mb-2">
              <IconWallet className="h-4 w-4 text-[#00A94F]" />
              <p className="text-xs text-[#68736E] uppercase tracking-wider">Commission Paid</p>
            </div>
            <p className="text-2xl font-bold text-[#00A94F]">
              ${referrals.reduce((sum, r) => sum + r.commissions.reduce((cs, c) => cs + parseFloat(c.amount), 0), 0).toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden py-0 rounded-2xl border border-[#DDE4DE] shadow-[0_8px_30px_rgba(16,33,29,0.05)]">
        <CardHeader className="border-b border-[#DDE4DE] py-4">
          <h3 className="text-sm font-semibold text-[#10211D]">All Referrals</h3>
        </CardHeader>
        {referrals.length === 0 ? (
          <div className="p-8 text-center text-sm text-[#68736E]">No referrals yet</div>
        ) : (
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F3F8EF]">
                <TableHead>Referrer</TableHead>
                <TableHead>Referred User</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Commission</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {referrals.map((r) => (
                <TableRow key={r.id}>
                  <TableCell>
                    <p className="font-medium text-[#10211D]">{r.referrer.name}</p>
                    <p className="text-xs text-[#68736E]">{r.referrer.email}</p>
                  </TableCell>
                  <TableCell>
                    <p className="font-medium text-[#10211D]">{r.referred.name}</p>
                    <p className="text-xs text-[#68736E]">{r.referred.email}</p>
                  </TableCell>
                  <TableCell>{statusBadge(r.status)}</TableCell>
                  <TableCell className="text-xs text-[#68736E]">{fmtDate(r.registeredAt)}</TableCell>
                  <TableCell className="text-sm font-medium text-[#10211D]">
                    ${r.commissions.reduce((sum, c) => sum + parseFloat(c.amount), 0).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        )}
      </Card>
    </div>
  );
}
