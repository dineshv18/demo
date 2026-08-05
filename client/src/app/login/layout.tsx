import type { Metadata } from "next";
import "../globals.css";

export const metadata: Metadata = {
  title: "Login — Ovantra Financial",
  description: "Sign in to your Ovantra Financial trading account.",
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return children;
}
