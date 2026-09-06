"use client";

import { Navbar } from "@/components/marketing/Navbar";
import { SiteBackground } from "@/components/marketing/Background";
import { Footer } from "@/components/marketing/Footer";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteBackground />
      <Navbar />
      {/* Offsets the fixed header: main bar (h-24) plus the lg-only utility strip */}
      <main className="min-h-screen pt-24 lg:pt-34">{children}</main>
      <Footer />
    </>
  );
}
