import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard — ORVANTA Financial",
  description: "Your trading dashboard",
};

export default function DashboardMetadata({ children }: { children: React.ReactNode }) {
  return children;
}
