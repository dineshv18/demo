"use client";

import Link from "next/link";
import { IconAlertCircle, IconClock, IconLock } from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FadeIn } from "@/components/shared/motion";

/**
 * The KYC gate shared by Wallet, Index and Internal Transfer.
 *
 * Purely presentational: the caller still decides whether the feature is locked
 * from the KYC status the API returned, so the gating behaviour is unchanged —
 * this only gives the three pages one consistent way of saying so.
 */
export function KycLockedState({
  status,
  title,
  description,
  pendingDescription,
  className,
}: {
  /** Raw KYC status from the API. */
  status: string;
  title: string;
  description: string;
  /** Shown instead of `description` while verification is under review. */
  pendingDescription?: string;
  className?: string;
}) {
  const pending = status === "PENDING";
  const rejected = status === "REJECTED";

  return (
    <FadeIn className={cn("space-y-4", className)}>
      {/* Prompt */}
      <div
        className={cn(
          "flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:gap-4",
          pending ? "border-info/25 bg-info-soft" : "border-warning/25 bg-warning-soft"
        )}
      >
        <span
          className={cn(
            "grid size-10 shrink-0 place-items-center rounded-lg",
            pending ? "bg-info/15 text-info" : "bg-warning/15 text-warning"
          )}
        >
          {pending ? (
            <IconClock className="size-5" stroke={1.75} />
          ) : (
            <IconAlertCircle className="size-5" stroke={1.75} />
          )}
        </span>

        <div className="min-w-0 flex-1">
          <p className={cn("text-sm font-semibold", pending ? "text-info" : "text-warning")}>
            {pending
              ? "Verification under review"
              : rejected
                ? "Verification was rejected"
                : "One quick step first: verify your identity"}
          </p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {pending
              ? "This usually takes 12–24 working hours. We'll unlock everything as soon as it clears."
              : rejected
                ? "Review the feedback on your KYC submission and resubmit to unlock this page."
                : "It keeps your account and funds secure, and only takes a couple of minutes."}
          </p>
        </div>

        <Button asChild size="sm" className="shrink-0 self-start sm:self-auto">
          <Link href="/dashboard/kyc">
            {pending ? "Check KYC Status" : rejected ? "Resubmit KYC" : "Complete KYC"}
          </Link>
        </Button>
      </div>

      {/* Locked panel */}
      <section className="relative overflow-hidden rounded-xl border border-border bg-card px-6 py-14 text-center shadow-card sm:py-20">
        <span aria-hidden className="bg-grid pointer-events-none absolute inset-0 opacity-40" />

        <div className="relative mx-auto max-w-sm">
          <span className="mx-auto grid size-16 place-items-center rounded-xl bg-muted text-muted-foreground ring-1 ring-border">
            <IconLock className="size-8" stroke={1.5} />
          </span>
          <h2 className="mt-6 font-display text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {title}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            {pending && pendingDescription ? pendingDescription : description}
          </p>

          {pending && (
            <span className="mt-6 inline-flex items-center gap-2 rounded-full border border-info/25 bg-info-soft px-4 py-2 text-xs font-semibold text-info">
              <IconClock className="size-3.5" /> Under review — 12–24 working hours
            </span>
          )}
        </div>
      </section>
    </FadeIn>
  );
}
