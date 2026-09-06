import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register — ORVANTA Financial",
  description: "Create your ORVANTA Financial investment account.",
  robots: { index: false, follow: false, nocache: true },
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
