import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Login — ORVANTA Financial",
  description: "Sign in to your ORVANTA Financial investment account.",
  // Authentication entry point: keep it out of search results.
  robots: { index: false, follow: false, nocache: true },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
