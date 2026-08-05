import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  IconUsers, IconShield, IconMail, IconChartBar,
  IconUserCheck, IconWallet, IconAlertTriangle, IconArrowRight,
} from "@tabler/icons-react";

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
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Welcome back, {user?.name}. Here&apos;s your admin overview.
        </p>
      </div>

      {/* Pending Alerts */}
      {(pendingKyc > 0 || pendingPayments > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {pendingKyc > 0 && (
            <button
              onClick={() => navigate("/dashboard/kyc")}
              className="flex items-center gap-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 hover:bg-amber-500/10 transition-colors text-left group"
            >
              <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                <IconUserCheck className="h-6 w-6 text-amber-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-amber-600 dark:text-amber-400">Pending KYC</p>
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-500 px-1.5 text-[10px] font-bold text-white">
                    {pendingKyc}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{pendingKyc} verification{pendingKyc !== 1 ? "s" : ""} awaiting review</p>
              </div>
              <IconArrowRight className="h-4 w-4 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          )}

          {pendingPayments > 0 && (
            <button
              onClick={() => navigate("/dashboard/payments")}
              className="flex items-center gap-4 rounded-2xl border border-blue-500/30 bg-blue-500/5 p-4 hover:bg-blue-500/10 transition-colors text-left group"
            >
              <div className="h-12 w-12 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                <IconWallet className="h-6 w-6 text-blue-500" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-blue-600 dark:text-blue-400">Pending Payments</p>
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-500 px-1.5 text-[10px] font-bold text-white">
                    {pendingPayments}
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{pendingPayments} payment{pendingPayments !== 1 ? "s" : ""} awaiting processing</p>
              </div>
              <IconArrowRight className="h-4 w-4 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
          )}
        </div>
      )}

      {/* No Pending Notice */}
      {pendingKyc === 0 && pendingPayments === 0 && (
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-4">
          <IconShield className="h-5 w-5 text-emerald-500 shrink-0" />
          <p className="text-sm font-medium text-emerald-600 dark:text-emerald-400">All caught up — no pending requests</p>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center">
              <IconUsers className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Total Users</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{totalUsers !== null ? totalUsers : "--"}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center">
              <IconShield className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Your Role</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{user?.role}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center">
              <IconMail className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Email</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white truncate max-w-[140px]">{user?.email}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
              <IconChartBar className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Status</p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {user?.isVerified ? "Verified" : "Pending"}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Info */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <IconUsers className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Name</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.name}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <IconMail className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <IconShield className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Role</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
            <IconChartBar className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Verification</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.isVerified ? "Verified" : "Pending"}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
