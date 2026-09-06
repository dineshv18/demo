import type { Metadata } from "next";
import DashboardLayout from "@/components/site/DashboardLayout";

/**
 * Server component so it can carry metadata. Every route under /dashboard is
 * behind authentication, so the whole subtree is marked `noindex` here (and
 * disallowed in robots.ts) — private account pages must never surface in
 * search results.
 */
export const metadata: Metadata = {
  title: "Dashboard — ORVANTA Financial",
  description: "Your ORVANTA Financial investment dashboard.",
  robots: { index: false, follow: false, nocache: true },
};

export default function DashboardLayoutWrapper({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
