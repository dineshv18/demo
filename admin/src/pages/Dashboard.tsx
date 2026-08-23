import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  IconUsers, IconShield, IconMail, IconChartBar,
  IconUserCheck, IconWallet, IconArrowRight,
} from "@tabler/icons-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pendingKyc, setPendingKyc] = useState(0);
  const [pendingPayments, setPendingPayments] = useState(0);
  const [totalUsers, setTotalUsers] = useState<number | null>(null);

  const fetchCounts = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const base = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

      const [kycRes, payRes, usersRes] = await Promise.allSettled([
        fetch(`${base}/admin/kyc?status=PENDING&limit=1`, { headers, credentials: "include" }).then(r => r.json()),
        fetch(`${base}/admin/payments?status=PENDING&limit=1`, { headers, credentials: "include" }).then(r => r.json()),
        fetch(`${base}/users?limit=1`, { headers, credentials: "include" }).then(r => r.json()),
      ]);

      if (kycRes.status === "fulfilled") setPendingKyc(kycRes.value?.counts?.pending ?? 0);
      if (payRes.status === "fulfilled") {
        const c = payRes.value?.counts;
        setPendingPayments((c?.pendingDeposits ?? 0) + (c?.pendingWithdrawals ?? 0));
      }
      if (usersRes.status === "fulfilled") setTotalUsers(usersRes.value?.pagination?.total ?? 0);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    fetchCounts();
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, [fetchCounts]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#10211D]">Dashboard</h1>
        <p className="mt-1 text-sm text-[#68736E]">
          Welcome back, {user?.name}. Here&apos;s your admin overview.
        </p>
      </div>

      {/* Pending Alerts */}
      {(pendingKyc > 0 || pendingPayments > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {pendingKyc > 0 && (
            <button
              onClick={() => navigate("/dashboard/kyc")}
              className="flex items-center gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 hover:bg-amber-100/70 transition-colors text-left group shadow-[0_8px_30px_rgba(16,33,29,0.05)]"
            >
              <div className="h-12 w-12 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
                <IconUserCheck className="h-6 w-6 text-amber-600" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-amber-700">Pending KYC</p>
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 text-[10px] font-bold text-white">
                    {pendingKyc}
                  </span>
                </div>
                <p className="text-xs text-[#68736E] mt-0.5">{pendingKyc} verification{pendingKyc !== 1 ? "s" : ""} awaiting review</p>
              </div>
              <IconArrowRight className="h-4 w-4 text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          )}

          {pendingPayments > 0 && (
            <button
              onClick={() => navigate("/dashboard/payments")}
              className="flex items-center gap-4 rounded-2xl border border-[#DDE4DE] bg-[#F3F8EF] p-4 hover:bg-[#EAF7E8] transition-colors text-left group shadow-[0_8px_30px_rgba(16,33,29,0.05)]"
            >
              <div className="h-12 w-12 rounded-xl bg-[#EAF7E8] flex items-center justify-center shrink-0">
                <IconWallet className="h-6 w-6 text-[#00A94F]" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-[#10211D]">Pending Payments</p>
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#00A94F] px-1.5 text-[10px] font-bold text-white">
                    {pendingPayments}
                  </span>
                </div>
                <p className="text-xs text-[#68736E] mt-0.5">{pendingPayments} payment{pendingPayments !== 1 ? "s" : ""} awaiting processing</p>
              </div>
              <IconArrowRight className="h-4 w-4 text-[#00A94F] opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          )}
        </div>
      )}

      {/* No Pending Notice */}
      {pendingKyc === 0 && pendingPayments === 0 && (
        <div className="flex items-center gap-3 rounded-2xl border border-[#DDE4DE] bg-[#F3F8EF] p-4 shadow-[0_8px_30px_rgba(16,33,29,0.05)]">
          <IconShield className="h-5 w-5 text-[#00A94F] shrink-0" />
          <p className="text-sm font-medium text-[#10211D]">All caught up — no pending requests</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="rounded-2xl border-[#DDE4DE] shadow-[0_8px_30px_rgba(16,33,29,0.05)] hover:shadow-[0_8px_30px_rgba(16,33,29,0.09)] transition-shadow">
          <CardContent className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#EAF7E8] flex items-center justify-center shrink-0">
              <IconUsers className="h-5 w-5 text-[#00A94F]" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-[#68736E]">Total Users</p>
              <p className="text-xl font-bold text-[#10211D]">{totalUsers !== null ? totalUsers : "--"}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-[#DDE4DE] shadow-[0_8px_30px_rgba(16,33,29,0.05)] hover:shadow-[0_8px_30px_rgba(16,33,29,0.09)] transition-shadow">
          <CardContent className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#EAF7E8] flex items-center justify-center shrink-0">
              <IconShield className="h-5 w-5 text-[#00A94F]" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-[#68736E]">Your Role</p>
              <p className="text-xl font-bold text-[#10211D]">{user?.role}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-[#DDE4DE] shadow-[0_8px_30px_rgba(16,33,29,0.05)] hover:shadow-[0_8px_30px_rgba(16,33,29,0.09)] transition-shadow">
          <CardContent className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-[#F3F8EF] flex items-center justify-center shrink-0">
              <IconMail className="h-5 w-5 text-[#10211D]" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-[#68736E]">Email</p>
              <p className="text-sm font-bold text-[#10211D] truncate">{user?.email}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-2xl border-[#DDE4DE] shadow-[0_8px_30px_rgba(16,33,29,0.05)] hover:shadow-[0_8px_30px_rgba(16,33,29,0.09)] transition-shadow">
          <CardContent className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
              <IconChartBar className="h-5 w-5 text-amber-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-[#68736E]">Status</p>
              <Badge variant={user?.isVerified ? "default" : "outline"} className={user?.isVerified ? "rounded-full bg-[#00A94F] text-white border-transparent" : "rounded-full border-amber-300 text-amber-700 bg-amber-50"}>
                {user?.isVerified ? "Verified" : "Pending"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Info */}
      <Card className="rounded-2xl border-[#DDE4DE] shadow-[0_8px_30px_rgba(16,33,29,0.05)]">
        <CardHeader>
          <CardTitle className="text-lg text-[#10211D]">Account Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F7F8F4]">
              <IconUsers className="h-4 w-4 text-[#68736E] shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-[#89938E]">Name</p>
                <p className="text-sm font-medium text-[#10211D] truncate">{user?.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F7F8F4]">
              <IconMail className="h-4 w-4 text-[#68736E] shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-[#89938E]">Email</p>
                <p className="text-sm font-medium text-[#10211D] truncate">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F7F8F4]">
              <IconShield className="h-4 w-4 text-[#68736E] shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-[#89938E]">Role</p>
                <p className="text-sm font-medium text-[#10211D] truncate">{user?.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#F7F8F4]">
              <IconChartBar className="h-4 w-4 text-[#68736E] shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-[#89938E]">Verification</p>
                <p className="text-sm font-medium text-[#10211D] truncate">{user?.isVerified ? "Verified" : "Pending"}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
