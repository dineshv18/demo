/**
 * Presentation helpers shared across the dashboard.
 *
 * These format values only — every number passed in comes from the API. Nothing
 * here invents, rounds up, or substitutes a figure.
 */

export const CURRENCY_SYMBOL = "$";

/** "$1,240.50" — grouped, two decimals, tabular-friendly. */
export function formatMoney(value: number, symbol = CURRENCY_SYMBOL): string {
  const safe = Number.isFinite(value) ? value : 0;
  return `${symbol}${safe.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Compact form for chart axes, where space is tight: "$1.2k".
 *
 * Small values keep their decimals — the Index price can sit well under a
 * dollar, and rounding those to "$0" would make every axis tick identical.
 */
export function formatMoneyCompact(value: number, symbol = CURRENCY_SYMBOL): string {
  const safe = Number.isFinite(value) ? value : 0;
  const abs = Math.abs(safe);
  if (abs >= 1_000_000) return `${symbol}${(safe / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${symbol}${(safe / 1_000).toFixed(1)}k`;
  if (abs >= 100) return `${symbol}${safe.toFixed(0)}`;
  if (abs >= 1) return `${symbol}${safe.toFixed(2)}`;
  if (abs === 0) return `${symbol}0`;
  // Sub-dollar: show enough places that neighbouring ticks stay distinct.
  return `${symbol}${safe.toFixed(4)}`;
}

export function parseAmount(value: string | number | null | undefined): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const n = parseFloat(value ?? "0");
  return Number.isFinite(n) ? n : 0;
}

export const formatDay = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric" });

export const formatDateTime = (d: string) =>
  new Date(d).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export const formatLongDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

export type StatusTone = "success" | "warning" | "danger" | "info" | "muted";

/** Maps an API transaction status onto a label and a semantic tone. */
export function statusTone(status: string): { label: string; tone: StatusTone } {
  switch (status) {
    case "COMPLETED":
    case "APPROVED":
    case "ACTIVE":
      return { label: status === "ACTIVE" ? "Active" : status === "APPROVED" ? "Approved" : "Completed", tone: "success" };
    case "PENDING":
    case "PROCESSING":
      return { label: "Processing", tone: "warning" };
    case "FAILED":
    case "REJECTED":
    case "CANCELLED":
      return {
        label: status === "REJECTED" ? "Rejected" : status === "CANCELLED" ? "Cancelled" : "Failed",
        tone: "danger",
      };
    default:
      return { label: prettyLabel(status), tone: "muted" };
  }
}

/** "NOT_STARTED" -> "Not started" */
export function prettyLabel(value: string): string {
  if (!value) return "—";
  const lower = value.replace(/_/g, " ").toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

/** Tailwind classes for a semantic tone, valid in both themes. */
export const toneClasses: Record<StatusTone, { text: string; bg: string; ring: string }> = {
  success: { text: "text-success", bg: "bg-success-soft", ring: "ring-success/20" },
  warning: { text: "text-warning", bg: "bg-warning-soft", ring: "ring-warning/20" },
  danger: { text: "text-danger", bg: "bg-danger-soft", ring: "ring-danger/20" },
  info: { text: "text-info", bg: "bg-info-soft", ring: "ring-info/20" },
  muted: { text: "text-muted-foreground", bg: "bg-muted", ring: "ring-border" },
};
