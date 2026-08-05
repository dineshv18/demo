"use client";

import { Navbar } from "@/components/site/Navbar";
import { SiteBackground } from "@/components/site/Background";
import { Footer } from "@/components/site/Footer";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteBackground />
      <Navbar />
      <main className="min-h-screen">{children}</main>
      <Footer />
    </>
  );
}
