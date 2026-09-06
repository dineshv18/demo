import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password — ORVANTA Financial",
  description: "Choose a new password for your ORVANTA Financial account.",
  // Carries a single-use token in the query string — must never be indexed.
  robots: { index: false, follow: false, nocache: true },
};

export default function ResetLayout({ children }: { children: React.ReactNode }) {
  return children;
}
