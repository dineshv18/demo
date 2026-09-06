import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password — ORVANTA Financial",
  description: "Reset your ORVANTA Financial password.",
  robots: { index: false, follow: false, nocache: true },
};

export default function ForgotLayout({ children }: { children: React.ReactNode }) {
  return children;
}
