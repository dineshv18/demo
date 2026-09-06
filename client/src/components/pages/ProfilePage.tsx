"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/lib/AuthContext";
import { authAPI, walletAPI, kycAPI, type WalletData, type KycData } from "@/lib/api";
import {
  IconMail, IconPhone, IconShieldCheck, IconShield,
  IconWallet, IconClock, IconLoader2, IconCheck, IconX,
  IconLock, IconAlertTriangle, IconTrash, IconArrowLeft,
  IconEye, IconEyeOff, IconPalette,
} from "@tabler/icons-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeading } from "@/components/dashboard/SectionCard";
import { PanelSkeleton } from "@/components/dashboard/Skeletons";
import { ThemeSegmented } from "@/components/theme/ThemeToggle";

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
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

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
      setTimeout(() => { setShowChangePassword(false); setPasswordMsg(null); }, 2000);
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
      <div className="mx-auto max-w-2xl space-y-5"><PanelSkeleton lines={3} /><PanelSkeleton lines={4} /><PanelSkeleton lines={3} /></div>
    );
  }

  const kycStatus = kyc?.status ?? "NOT_STARTED";
  const balance = wallet ? parseFloat(wallet.balance) : 0;
  const joinedDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
    : "—";

  const kycConfig: Record<string, { label: string; color: string; bg: string; icon: typeof IconCheck }> = {
    APPROVED: { label: "Verified", color: "text-success", bg: "bg-success-soft", icon: IconCheck },
    PENDING: { label: "Under Review", color: "text-warning", bg: "bg-warning-soft", icon: IconClock },
    REJECTED: { label: "Rejected", color: "text-danger", bg: "bg-danger-soft", icon: IconX },
    NOT_STARTED: { label: "Not Started", color: "text-muted-foreground", bg: "bg-muted", icon: IconShield },
  };
  const kycCfg = kycConfig[kycStatus] || kycConfig.NOT_STARTED;
  const KycIcon = kycCfg.icon;

  return (
    <div className="mx-auto w-full max-w-2xl space-y-5 px-4 sm:px-0 pb-10">
      {/* Back to Dashboard */}
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors">
        <IconArrowLeft className="h-3.5 w-3.5" /> Back to Dashboard
      </Link>

      <PageHeading
        eyebrow="Settings"
        title="My Profile"
        description="Manage your account details, security and appearance."
      />

      {/* Appearance */}
      <Card className="gap-4 p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            <IconPalette className="h-5 w-5 shrink-0 text-muted-foreground" />
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-foreground">Appearance</h3>
              <p className="text-xs text-muted-foreground">
                Choose how ORVANTA looks on this device. Your choice is remembered.
              </p>
            </div>
          </div>
          <ThemeSegmented />
        </div>
      </Card>

      {/* Profile Card */}
      <Card className="p-4 sm:p-6 gap-5">
        {/* Avatar + Name */}
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-full bg-navy-800 ring-1 ring-brand/30 flex items-center justify-center text-lg font-bold text-brand shrink-0 shadow-sm sm:text-xl">
            {user?.name?.charAt(0)?.toUpperCase() || "?"}
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-foreground truncate">{user?.name || "—"}</h2>
            <p className="text-sm text-muted-foreground truncate">{user?.email || "—"}</p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center gap-3 rounded-lg border border-border p-3">
            <div className="h-9 w-9 rounded-lg bg-info-soft flex items-center justify-center shrink-0">
              <IconMail className="h-4 w-4 text-info" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Email</p>
              <p className="text-sm font-medium text-foreground truncate">{user?.email || "—"}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-border p-3">
            <div className="h-9 w-9 rounded-lg bg-success-soft flex items-center justify-center shrink-0">
              <IconPhone className="h-4 w-4 text-success" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Phone</p>
              <p className="text-sm font-medium text-foreground truncate">
                {kyc?.phone ? `${kyc.countryCode || ""} ${kyc.phone}` : "—"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-border p-3">
            <div className="h-9 w-9 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
              <IconWallet className="h-4 w-4 text-brand" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Balance</p>
              <p className="text-sm font-medium text-foreground">${balance.toFixed(2)}</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-border p-3">
            <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
              <IconClock className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground">Joined</p>
              <p className="text-sm font-medium text-foreground">{joinedDate}</p>
            </div>
          </div>
        </div>

        {/* KYC Status */}
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border p-4">
          <div className="flex items-center gap-3 min-w-0">
            <IconShieldCheck className="h-5 w-5 text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">KYC Verification</p>
              <p className="text-xs text-muted-foreground">Identity verification status</p>
            </div>
          </div>
          <Badge variant="outline" className={`gap-1.5 border-transparent px-3 py-1 font-semibold whitespace-nowrap ${kycCfg.bg} ${kycCfg.color}`}>
            <KycIcon className="h-3.5 w-3.5" />
            {kycCfg.label}
          </Badge>
        </div>
      </Card>

      {/* Change Password */}
      <Card className="p-4 sm:p-6 gap-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <IconLock className="h-5 w-5 text-muted-foreground shrink-0" />
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-foreground">Change Password</h3>
              <p className="text-xs text-muted-foreground">Update your account password</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setShowChangePassword(!showChangePassword); setPasswordMsg(null); }}
            className="text-xs text-brand hover:text-brand font-medium shrink-0"
          >
            {showChangePassword ? "Cancel" : "Change"}
          </Button>
        </div>

        {showChangePassword && (
          <div className="space-y-3 pt-2 border-t border-border">
            {passwordMsg && (
              <div className={`flex items-center gap-2 rounded-lg px-3 py-2 text-xs ${passwordMsg.type === "success" ? "bg-success-soft text-success" : "bg-danger-soft text-danger"}`}>
                {passwordMsg.type === "success" ? <IconCheck className="h-3.5 w-3.5 shrink-0" /> : <IconAlertTriangle className="h-3.5 w-3.5 shrink-0" />}
                {passwordMsg.text}
              </div>
            )}
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-1">Current Password</Label>
              <div className="relative">
                <Input
                  type={showCurrentPw ? "text" : "password"}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="pr-10"
                  placeholder="Enter current password"
                />
                <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showCurrentPw ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-1">New Password</Label>
              <div className="relative">
                <Input
                  type={showNewPw ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="pr-10"
                  placeholder="Min 8 characters"
                />
                <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showNewPw ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <Label className="text-xs font-medium text-muted-foreground mb-1">Confirm New Password</Label>
              <div className="relative">
                <Input
                  type={showConfirmPw ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="pr-10"
                  placeholder="Re-enter new password"
                />
                <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showConfirmPw ? <IconEyeOff className="h-4 w-4" /> : <IconEye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <Button
              onClick={handleChangePassword}
              disabled={passwordLoading}
              className="w-full gap-2"
            >
              {passwordLoading ? (
                <>
                  <IconLoader2 className="h-4 w-4 animate-spin" /> Updating...
                </>
              ) : (
                "Update Password"
              )}
            </Button>
          </div>
        )}
      </Card>

      {/* Deactivate Account */}
      <Card className="gap-4 border-danger/25 bg-danger-soft/40 p-4 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <IconTrash className="h-5 w-5 text-danger shrink-0" />
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-danger">Delete My Account</h3>
              <p className="text-xs text-muted-foreground">Deactivate your account</p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDeactivate(true)}
            className="shrink-0 border-danger/30 text-danger hover:bg-danger-soft"
          >
            Deactivate
          </Button>
        </div>

        {showDeactivate && (
          <div className="space-y-3 border-t border-danger/20 pt-3">
            <div className="flex items-start gap-2 rounded-lg bg-danger-soft px-3 py-2.5">
              <IconAlertTriangle className="h-4 w-4 text-danger shrink-0 mt-0.5" />
              <p className="text-xs text-danger leading-relaxed">
                This will deactivate your account. You will be logged out and won&apos;t be able to access your account until it&apos;s reactivated by support.
              </p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={handleDeactivate}
                disabled={deactivateLoading}
                className="flex-1 gap-2 bg-destructive text-white hover:brightness-110"
              >
                {deactivateLoading ? (
                  <>
                    <IconLoader2 className="h-4 w-4 animate-spin" /> Deactivating...
                  </>
                ) : (
                  "Yes, Deactivate"
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDeactivate(false)}
                disabled={deactivateLoading}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
