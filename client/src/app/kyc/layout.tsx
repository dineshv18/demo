import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "KYC Verification — ORVANTA Financial",
  description: "Complete your identity verification.",
  robots: { index: false, follow: false, nocache: true },
};

export default function KycLayout({ children }: { children: React.ReactNode }) {
  return children;
}
