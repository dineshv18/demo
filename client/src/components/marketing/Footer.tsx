"use client";


import Link from "next/link";
import {
  IconBrandGithub,
  IconBrandLinkedin,
  IconBrandX,
  IconBrandYoutube,
  IconEye,
  IconLock,
  IconClock,
  IconHeadset,
  IconMail,
  IconShieldCheck,
} from "@tabler/icons-react";

import { BrandMark } from "@/components/shared/BrandMark";

const socialIcons = [
  { Icon: IconBrandX, label: "X (Twitter)" },
  { Icon: IconBrandLinkedin, label: "LinkedIn" },
  { Icon: IconBrandYoutube, label: "YouTube" },
  { Icon: IconBrandGithub, label: "GitHub" },
];

// Only real, working routes — no placeholder Careers/Pricing/Press pages.
const cols = [
  { title: "Company", links: [["About", "/about"], ["Platform", "/platform"], ["Contact Us", "/contact"]] },
  { title: "Platform", links: [["Overview", "/platform"], ["Index Tiers", "/platform"], ["Referral Program", "/platform"], ["Web Dashboard", "/login"]] },
  { title: "Investing", links: [["Open an Account", "/register"], ["Wallet", "/login"], ["KYC Verification", "/login"], ["Track Performance", "/login"]] },
  { title: "Legal", links: [["Risk Disclosure", "/about"], ["Contact Support", "/contact"]] },
] as const;

const trustBadges = [
  { icon: IconShieldCheck, label: "KYC Verified" },
  { icon: IconLock, label: "Secure Platform" },
  { icon: IconEye, label: "Transparent Operations" },
];

/**
 * Only channels that actually exist. The email matches the one published on the
 * contact page; the other two point at the in-product support desk rather than
 * inventing a phone number or an office address.
 */
const contactLines = [
  {
    icon: IconMail,
    label: "support@orvantafinancial.com",
    href: "mailto:support@orvantafinancial.com",
  },
  { icon: IconHeadset, label: "Open a support ticket", href: "/login" },
  { icon: IconClock, label: "Replies in 2–3 working hours", href: null },
];

export function Footer() {


  return (
    <footer className="surface-navy relative mt-32 overflow-hidden">
      <span aria-hidden className="bg-ticker pointer-events-none absolute inset-0 opacity-25" />
      <span
        aria-hidden
        className="pointer-events-none absolute -left-40 top-0 size-[30rem] rounded-full bg-brand/8 blur-3xl"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute -right-40 bottom-0 size-[28rem] rounded-full bg-brand/6 blur-3xl"
      />
      <span aria-hidden className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-brand/60 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-5 pb-12 pt-20 lg:px-10">


        {/* ── Link grid ── */}
        <div className="grid gap-12 py-14 lg:grid-cols-12 lg:gap-10">
          {/* Brand */}
          <div className="lg:col-span-4">
            <Link href="/" className="inline-flex items-center" aria-label="ORVANTA Financial — home">
              <BrandMark on="dark" className="h-20 w-auto" />
            </Link>
            <p className="mt-6 max-w-sm text-sm leading-relaxed text-white/60">
              KYC-verified Index investing with transparency at the core. Real-time
              tracking and published tiers — built for investors who want to see exactly
              where their capital stands.
            </p>

            <ul className="mt-6 space-y-3">
              {contactLines.map((c) => (
                <li key={c.label} className="flex items-center gap-3 text-sm text-white/60">
                  <span className="grid size-8 shrink-0 place-items-center rounded-lg border border-white/10 text-brand">
                    <c.icon className="size-4" stroke={1.75} />
                  </span>
                  {c.href ? (
                    <a href={c.href} className="transition-colors hover:text-brand">
                      {c.label}
                    </a>
                  ) : (
                    <span>{c.label}</span>
                  )}
                </li>
              ))}
            </ul>

            <div className="mt-7 flex gap-2.5">
              {socialIcons.map(({ Icon, label }) => (
                <a
                  key={label}
                  href="#"
                  aria-label={label}
                  className="grid size-10 place-items-center rounded-xl border border-white/10 text-white/60 transition-colors hover:border-brand/45 hover:bg-brand/10 hover:text-brand"
                >
                  <Icon className="size-[18px]" stroke={1.75} />
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-4 lg:col-span-8">
            {cols.map((c) => (
              <nav key={c.title} aria-label={c.title}>
                <h2 className="text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-brand">
                  {c.title}
                </h2>
                <span aria-hidden className="mt-3 block h-px w-10 bg-brand/40" />
                <ul className="mt-5 space-y-3">
                  {c.links.map(([label, to]) => (
                    <li key={label}>
                      <Link
                        href={to}
                        className="group inline-flex items-center gap-1.5 text-sm text-white/60 transition-colors hover:text-brand"
                      >
                        <span
                          aria-hidden
                          className="h-px w-0 bg-brand transition-all duration-300 group-hover:w-3"
                        />
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        {/* ── Risk disclaimer ── */}
        <div className="rounded-2xl border border-white/8 bg-white/[0.02] p-6 text-xs leading-relaxed text-white/50">
          <strong className="text-white/80">Risk Disclaimer:</strong> Index investing
          involves risk of loss and is not suitable for all investors. Your capital is at
          risk, and returns are not guaranteed. Tier terms, minimums and maturity periods
          are published in your dashboard before you invest. Please ensure you understand
          the risks involved and seek independent advice if necessary. Past performance is
          not indicative of future results.
        </div>

        {/* ── Oversized wordmark ── */}
        <div className="mt-14 select-none" aria-hidden>
          <p className="bg-linear-to-b from-white/[0.13] to-transparent bg-clip-text text-center font-display text-[clamp(3rem,15vw,11rem)] font-semibold leading-none tracking-[-0.05em] text-transparent">
            ORVANTA
          </p>
          <p className="-mt-1 text-center text-[0.6875rem] font-semibold uppercase tracking-[0.45em] text-brand/50 sm:tracking-[0.7em]">
            Growing Wealth
          </p>
        </div>

        {/* ── Bottom bar ── */}
        <div className="mt-12 flex flex-col gap-6 border-t border-white/8 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="order-2 text-xs text-white/45 sm:order-1">
            &copy; {new Date().getFullYear()}{" "}
            <span className="font-semibold text-brand">ORVANTA Financial</span>. All rights
            reserved.
          </p>
          <ul className="order-1 flex flex-wrap items-center gap-x-6 gap-y-2 sm:order-2">
            {trustBadges.map((b) => (
              <li key={b.label} className="inline-flex items-center gap-2 text-xs text-white/55">
                <b.icon className="size-4 text-brand" stroke={1.75} /> {b.label}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
