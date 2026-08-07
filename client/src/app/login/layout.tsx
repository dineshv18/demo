import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Login — ORVANTA Financial",
  description: "Sign in to your ORVANTA Financial trading account.",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
