"use client";

import { Navbar } from "@/components/marketing/Navbar";
import { SiteBackground } from "@/components/marketing/Background";
import { Footer } from "@/components/marketing/Footer";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    // `site-classic` scopes the warm-ivory, ornate-border treatment to the
    // public marketing pages only (Home/About/Platform/Contact) — dashboard
    // and auth screens are outside this route group and keep the plain
    // navy/gold tokens untouched.
    <div className="site-classic">
      <SiteBackground />
      <Navbar />
      {/* Offsets the fixed header: main bar (h-24) plus the lg-only utility strip */}
      <main className="min-h-screen pt-24 lg:pt-34">{children}</main>
      <Footer />
    </div>
  );
}
