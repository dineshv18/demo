"use client";

import Link from "next/link";
import { IconClock, IconShield, IconShieldCheck, IconX } from "@tabler/icons-react";
import { FadeIn } from "@/components/shared/motion";
import { cn } from "@/lib/utils";

type Tone = "warning" | "info" | "danger";

const TONE: Record<Tone, { border: string; wash: string; chip: string }> = {
  warning: { border: "border-warning/30", wash: "bg-warning-soft", chip: "bg-warning/15 text-warning" },
  info: { border: "border-info/30", wash: "bg-info-soft", chip: "bg-info/15 text-info" },
  danger: { border: "border-danger/30", wash: "bg-danger-soft", chip: "bg-danger/15 text-danger" },
};

/**
 * Verification prompt shown above the dashboard. Purely presentational — the
 * status string comes straight from the KYC API and drives which message shows.
 */
export function KycBanner({ status }: { status: string }) {
  if (status === "APPROVED") return null;

  const config = (() => {
    if (status === "PENDING") {
      return {
        tone: "info" as Tone,
        icon: IconClock,
        title: "KYC under review",
        body: "Your identity verification is being reviewed. This usually takes 12–24 working hours.",
        cta: null,
      };
    }
    if (status === "REJECTED") {
      return {
        tone: "danger" as Tone,
        icon: IconX,
        title: "KYC verification was rejected",
        body: "Please review the feedback and resubmit your documents to restore deposits and withdrawals.",
        cta: { href: "/dashboard/kyc", label: "Resubmit KYC" },
      };
    }
    return {
      tone: "warning" as Tone,
      icon: IconShield,
      title: "Complete your KYC verification",
      body: "Verification is required before you can deposit or withdraw funds.",
      cta: { href: "/dashboard/kyc", label: "Complete KYC" },
    };
  })();

  const t = TONE[config.tone];
  const Icon = config.icon;

  return (
    <FadeIn>
      <div
        role="status"
        className={cn(
          "flex flex-col gap-3 rounded-2xl border p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5",
          t.border,
          t.wash
        )}
      >
        <span className={cn("grid size-10 shrink-0 place-items-center rounded-xl", t.chip)}>
          <Icon className="size-5" stroke={1.75} />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="text-[0.9375rem] font-semibold text-foreground">{config.title}</h2>
          <p className="mt-0.5 text-[0.8125rem] text-muted-foreground">{config.body}</p>
        </div>
        {config.cta && (
          <Link
            href={config.cta.href}
            className="btn-glow btn-glow-hover inline-flex h-10 shrink-0 items-center justify-center rounded-lg px-5 text-sm font-semibold"
          >
            {config.cta.label}
          </Link>
        )}
      </div>
    </FadeIn>
  );
}

/** Small verification pill for profile summaries. */
export function KycStatusPill({ status }: { status: string }) {
  const map: Record<string, { label: string; className: string; icon: typeof IconShield }> = {
    APPROVED: { label: "Verified", className: "bg-success-soft text-success", icon: IconShieldCheck },
    PENDING: { label: "Under review", className: "bg-warning-soft text-warning", icon: IconClock },
    REJECTED: { label: "Rejected", className: "bg-danger-soft text-danger", icon: IconX },
  };
  const cfg = map[status] ?? {
    label: "Not started",
    className: "bg-muted text-muted-foreground",
    icon: IconShield,
  };
  const Icon = cfg.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.6875rem] font-semibold",
        cfg.className
      )}
    >
      <Icon className="size-3.5" stroke={2} />
      {cfg.label}
    </span>
  );
}
