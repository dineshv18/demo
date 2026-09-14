"use client";

import { Navbar } from "@/components/marketing/Navbar";
import { SiteBackground } from "@/components/marketing/Background";
import { Footer } from "@/components/marketing/Footer";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    // `site-classic` scopes the classic white/purple treatment to the four
    // public marketing pages while preserving their shared structure.
    <div className="site-classic min-h-screen bg-background text-foreground">
      <SiteBackground />
      <Navbar />
      <main className="min-h-screen pt-24">{children}</main>
      <Footer />
    </div>
  );
}
