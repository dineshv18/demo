"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { authAPI, walletAPI, kycAPI, type WalletData, type KycData } from "@/lib/api";
import {
  IconUser, IconMail, IconPhone, IconShieldCheck, IconShield,
  IconWallet, IconClock, IconLoader2, IconCheck, IconX,
  IconLock, IconAlertTriangle, IconTrash,
} from "@tabler/icons-react";

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [kyc, setKyc] = useState<KycData | null>(null);
  const [loading, setLoading] = useState(true);

  // Change password state
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Deactivate account state
  const [showDeactivate, setShowDeactivate] = useState(false);
  const [deactivateLoading, setDeactivateLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [walletRes, kycRes] = await Promise.allSettled([
          walletAPI.getWallet(),
          kycAPI.getStatus(),
        ]);
        if (walletRes.status === "fulfilled") setWallet(walletRes.value.wallet);
        if (kycRes.status === "fulfilled") setKyc(kycRes.value.kyc);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleChangePassword = async () => {
    setPasswordMsg(null);
    if (!currentPassword || !newPassword) {
      setPasswordMsg({ type: "error", text: "Please fill all fields" });
      return;
    }
    if (newPassword.length < 8) {
      setPasswordMsg({ type: "error", text: "New password must be at least 8 characters" });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "Passwords do not match" });
      return;
    }
    setPasswordLoading(true);
    try {
      await authAPI.changePassword(currentPassword, newPassword);
      setPasswordMsg({ type: "success", text: "Password changed successfully" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setShowChangePassword(false), 2000);
    } catch (err) {
      setPasswordMsg({ type: "error", text: err instanceof Error ? err.message : "Failed to change password" });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleDeactivate = async () => {
    setDeactivateLoading(true);
    try {
      await authAPI.deactivateAccount();
      logout();
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to deactivate account");
      setDeactivateLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <IconLoader2 className="h-8 w-8 animate-spin text-brand" />
      </div>
    );
  }

  const kycStatus = kyc?.status ?? "NOT_STARTED";
  const balance = wallet ? parseFloat(wallet.balance) : 0;
  const joinedDate = user?.createdAt ? new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }) : "—";

  const kycConfig: Record<string, { label: string; color: string; bg: string; icon: typeof IconCheck }> = {
    APPROVED: { label: "Verified", color: "text-emerald-500", bg: "bg-emerald-500/10", icon: IconCheck },
    PENDING: { label: "Under Review", color: "text-amber-500", bg: "bg-amber-500/10", icon: IconClock },
    REJECTED: { label: "Rejected", color: "text-red-500", bg: "bg-red-500/10", icon: IconX },
    NOT_STARTED: { label: "Not Started", color: "text-gray-500", bg: "bg-gray-500/10", icon: IconShield },
  };
  const kycCfg = kycConfig[kycStatus] || kycConfig.NOT_STARTED;
  const KycIcon = kycCfg.icon;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight">My Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your account settings and preferences</p>
      </div>

      {/* Profile Card */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-6">
        {/* Avatar + Basic Info */}
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center text-white text-xl font-bold shrink-0">
            {user?.name?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">{user?.name || "—"}</h2>
            <p className="text-sm text-muted-foreground">{user?.email || "—"}</p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-center gap-3 rounded-lg border border-border p-3">
            <div className="h-9 w-9 rounded-lg bg-blue-500/10 flex items-center justify-center">
              <IconMail className="h-4 w-4 text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm font-medium text-foreground">{user?.email || "—"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-border p-3">
            <div className="h-9 w-9 rounded-lg bg-green-500/10 flex items-center justify-center">
              <IconPhone className="h-4 w-4 text-green-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Phone</p>
              <p className="text-sm font-medium text-foreground">{kyc?.countryCode} {kyc?.phone || "—"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-border p-3">
            <div className="h-9 w-9 rounded-lg bg-purple-500/10 flex items-center justify-center">
              <IconWallet className="h-4 w-4 text-purple-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Balance</p>
              <p className="text-sm font-medium text-foreground">${balance.toFixed(2)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-border p-3">
            <div className="h-9 w-9 rounded-lg bg-gray-500/10 flex items-center justify-center">
              <IconClock className="h-4 w-4 text-gray-500" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Joined</p>
              <p className="text-sm font-medium text-foreground">{joinedDate}</p>
            </div>
          </div>
        </div>

        {/* KYC Status */}
        <div className="flex items-center justify-between rounded-lg border border-border p-4">
          <div className="flex items-center gap-3">
            <IconShieldCheck className="h-5 w-5 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium text-foreground">KYC Verification</p>
              <p className="text-xs text-muted-foreground">Identity verification status</p>
            </div>
          </div>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${kycCfg.bg} ${kycCfg.color}`}>
            <KycIcon className="h-3.5 w-3.5" />
            {kycCfg.label}
          </span>
        </div>
      </div>

      {/* Change Password */}
      <div className="rounded-xl border border-border bg-card p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <IconLock className="h-5 w-5 text-muted-foreground" />
            <div>
              <h3 className="text-sm font-semibold text-foreground">Change Password</h3>
              <p className="text-xs text-muted-foreground">Update your account password</p>
            </div>
          </div>
          <button
            onClick={() => setShowChangePassword(!showChangePassword)}
            className="text-xs text-brand hover:underline font-medium"
          >
            {showChangePassword ? "Cancel" : "Change"}
          </button>
        </div>

        {showChangePassword && (
          <div className="space-y-3 pt-2">
            {passwordMsg && (
              <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs ${passwordMsg.type === "success" ? "bg-emerald-500/10 text-emerald-500" : "bg-destructive/10 text-destructive"}`}>
                {passwordMsg.type === "success" ? <IconCheck className="h-3.5 w-3.5 shrink-0" /> : <IconAlertTriangle className="h-3.5 w-3.5 shrink-0" />}
                {passwordMsg.text}
              </div>
            )}
            <div>
              <label className="text-xs font-medium text-muted-foreground">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/50 transition-all"
                placeholder="Enter current password"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/50 transition-all"
                placeholder="Enter new password"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="mt-1 w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/50 transition-all"
                placeholder="Confirm new password"
              />
            </div>
            <button
              onClick={handleChangePassword}
              disabled={passwordLoading}
              className="w-full rounded-lg bg-brand py-2.5 text-sm font-semibold text-white hover:bg-brand/90 disabled:opacity-50 transition-colors"
            >
              {passwordLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <IconLoader2 className="h-4 w-4 animate-spin" /> Updating...
                </span>
              ) : (
                "Update Password"
              )}
            </button>
          </div>
        )}
      </div>

      {/* Deactivate Account */}
      <div className="rounded-xl border border-red-200 dark:border-red-900/50 bg-red-50/50 dark:bg-red-900/5 p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <IconTrash className="h-5 w-5 text-red-500" />
            <div>
              <h3 className="text-sm font-semibold text-red-600 dark:text-red-400">Delete My Account</h3>
              <p className="text-xs text-muted-foreground">Deactivate your account permanently</p>
            </div>
          </div>
          <button
            onClick={() => setShowDeactivate(true)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
          >
            Deactivate
          </button>
        </div>

        {showDeactivate && (
          <div className="space-y-3 pt-2 border-t border-red-200 dark:border-red-900/50">
            <div className="flex items-start gap-2 rounded-lg bg-red-500/10 px-3 py-2">
              <IconAlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
              <p className="text-xs text-red-600 dark:text-red-400">
                This will deactivate your account. You will be logged out and won&apos;t be able to access your account until it&apos;s reactivated by support.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleDeactivate}
                disabled={deactivateLoading}
                className="flex-1 rounded-lg bg-red-600 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition-colors"
              >
                {deactivateLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <IconLoader2 className="h-4 w-4 animate-spin" /> Deactivating...
                  </span>
                ) : (
                  "Yes, Deactivate My Account"
                )}
              </button>
              <button
                onClick={() => setShowDeactivate(false)}
                disabled={deactivateLoading}
                className="flex-1 rounded-lg border border-border py-2.5 text-sm font-medium hover:bg-accent transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
