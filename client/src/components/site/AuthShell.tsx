"use client";

import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";

const HIGHLIGHTS = [
  { value: "128+", label: "Assets Tracked" },
  { value: "24/7", label: "Market Access" },
  { value: "5-Level", label: "Referral Rewards" },
];

export function AuthBrandPanel({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: ReactNode;
  description: string;
}) {
  return (
    <div className="relative hidden lg:flex lg:w-[52%] overflow-hidden rounded-r-[1.75rem]">
      {/* Base gradient — dark green, consistent with the app's --brand tokens */}
      <div className="absolute inset-0 bg-[#10211D]" />

      {/* Soft glow field */}
      <div className="absolute inset-0 opacity-70">
        <svg viewBox="0 0 800 700" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
          <defs>
            <radialGradient id="authGlow1" cx="30%" cy="20%" r="60%">
              <stop offset="0%" stopColor="#00B956" stopOpacity="0.30" />
              <stop offset="100%" stopColor="#00B956" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="authGlow2" cx="80%" cy="75%" r="55%">
              <stop offset="0%" stopColor="#00A94F" stopOpacity="0.22" />
              <stop offset="100%" stopColor="#00A94F" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="800" height="700" fill="url(#authGlow1)" />
          <rect width="800" height="700" fill="url(#authGlow2)" />
          <circle cx="620" cy="180" r="180" fill="none" stroke="rgba(0,185,86,0.14)" strokeWidth="1" />
          <circle cx="620" cy="180" r="260" fill="none" stroke="rgba(0,185,86,0.08)" strokeWidth="1" />
          <circle cx="150" cy="560" r="140" fill="none" stroke="rgba(0,185,86,0.10)" strokeWidth="1" />
        </svg>
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />

      <div className="relative z-10 flex flex-col justify-between p-12 xl:p-14 text-white w-full">
        <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-3.5 py-1.5 text-xs font-medium tracking-wide uppercase w-fit border border-white/10">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          {eyebrow}
        </div>

        <div>
          <h1 className="font-display text-4xl xl:text-5xl font-normal tracking-tight leading-[1.1] mb-5">
            {title}
          </h1>
          <p className="text-white/60 text-base max-w-sm leading-relaxed">
            {description}
          </p>

          <div className="mt-10 grid grid-cols-3 gap-6 max-w-md border-t border-white/10 pt-6">
            {HIGHLIGHTS.map((h) => (
              <div key={h.label}>
                <p className="font-display text-xl font-bold text-white">{h.value}</p>
                <p className="text-[11px] text-white/45 mt-0.5 uppercase tracking-wide">{h.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AuthLogo() {
  return (
    <div className="flex justify-center">
      <Link href="/" className="flex items-center gap-3">
        <Image src="/WhiteBlack-Photoroom.png" alt="ORVANTA" width={44} height={44} className="h-10 w-auto dark:hidden" />
        <Image src="/dark-Photoroom.png" alt="ORVANTA" width={44} height={44} className="h-10 w-auto hidden dark:block" />
        <span className="font-display text-xl font-bold tracking-tight">
          ORVANTA <span className="text-gradient">Financial</span>
        </span>
      </Link>
    </div>
  );
}

export default function AuthShell({
  brandEyebrow,
  brandTitle,
  brandDescription,
  children,
}: {
  brandEyebrow: string;
  brandTitle: ReactNode;
  brandDescription: string;
  children: ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen w-full bg-background">
      <AuthBrandPanel eyebrow={brandEyebrow} title={brandTitle} description={brandDescription} />
      <div className="flex flex-1 items-center justify-center px-6 py-12 lg:px-14 xl:px-20">
        <div className="w-full max-w-md">
          {children}
        </div>
      </div>
    </div>
  );
}
