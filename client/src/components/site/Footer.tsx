"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Lock, Eye, ArrowRight, Mail } from "lucide-react";

const XIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

const LinkedInIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
);

const YouTubeIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
);

const GitHubIcon = ({ className }: { className?: string }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
);

const socialIcons = [
    { Icon: XIcon, label: "X (Twitter)" },
    { Icon: LinkedInIcon, label: "LinkedIn" },
    { Icon: YouTubeIcon, label: "YouTube" },
    { Icon: GitHubIcon, label: "GitHub" },
];

// Only real, working routes — no placeholder Careers/Pricing/Press pages.
const cols = [
    { title: "Company", links: [["About", "/about"], ["Platform", "/platform"], ["Contact Us", "/contact"]] },
    { title: "Platform", links: [["Overview", "/platform"], ["Index Tiers", "/platform"], ["Referral Program", "/platform"], ["Web Dashboard", "/login"]] },
    { title: "Investing", links: [["Open an Account", "/register"], ["Wallet", "/login"], ["KYC Verification", "/login"], ["Track Performance", "/login"]] },
    { title: "Legal", links: [["Risk Disclosure", "/about"], ["Contact Support", "/contact"]] },
] as const;

const trustBadges = [
    { icon: ShieldCheck, label: "KYC Verified" },
    { icon: Lock, label: "Secure Platform" },
    { icon: Eye, label: "Transparent Operations" },
];

export function Footer() {
    const [email, setEmail] = useState("");
    const [submitted, setSubmitted] = useState(false);

    const handleSubscribe = (e: FormEvent) => {
        e.preventDefault();
        if (!email.trim()) return;
        setSubmitted(true);
        setEmail("");
    };

    return (
        <footer className="relative mt-32">
            <div className="absolute inset-x-0 -top-40 h-40 pointer-events-none"
                style={{ background: "radial-gradient(600px 200px at 50% 100%, color-mix(in oklab, var(--brand) 18%, transparent), transparent)" }} />
            <div className="relative border-t border-border/60 bg-card/40">
                <div className="mx-auto max-w-7xl px-5 lg:px-8 pt-14 pb-10">
                    {/* Outer bordered container matching the site's comparison-card language */}
                    <div className="rounded-2xl border border-border/50 bg-background/60 p-6 sm:p-8 lg:p-10">
                        <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
                            {/* Brand column */}
                            <div className="lg:col-span-3">
                                <Link href="/" className="flex items-center gap-2.5">
                                    <Image src="/WhiteBlack-Photoroom.png" alt="ORVANTA Financial" width={100} height={100} className="h-16 w-auto dark:hidden" />
                                    <Image src="/dark-Photoroom.png" alt="ORVANTA Financial" width={100} height={100} className="h-16 w-auto hidden dark:block" />
                                </Link>
                                <p className="mt-4 text-sm text-muted-foreground max-w-xs leading-relaxed">
                                    KYC-verified Index investing with transparency at the core. Real-time
                                    tracking, published tiers — built for investors who want to see exactly
                                    where their capital stands.
                                </p>
                                <div className="mt-6 flex gap-2">
                                    {socialIcons.map(({ Icon, label }, i) => (
                                        <a key={i} href="#" aria-label={label} className="grid h-9 w-9 place-items-center rounded-lg border border-border/70 hover:bg-accent hover:text-brand transition">
                                            <Icon className="h-4 w-4" />
                                        </a>
                                    ))}
                                </div>
                            </div>

                            {/* Link columns */}
                            <div className="lg:col-span-6 grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
                                {cols.map((c) => (
                                    <div key={c.title}>
                                        <div className="text-sm font-semibold text-foreground pb-2 border-b-2 border-brand/70 inline-block">
                                            {c.title}
                                        </div>
                                        <ul className="mt-4 space-y-2.5">
                                            {c.links.map(([label, to]) => (
                                                <li key={label}>
                                                    <Link href={to} className="text-sm text-muted-foreground hover:text-brand transition-colors">{label}</Link>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>

                            {/* Security First card */}
                            <div className="lg:col-span-3">
                                <div className="rounded-2xl border border-brand/30 bg-brand/[0.04] p-5 h-full">
                                    <div className="grid h-10 w-10 place-items-center rounded-full bg-brand/15 text-brand">
                                        <ShieldCheck className="h-5 w-5" />
                                    </div>
                                    <p className="mt-3 text-sm font-semibold text-brand">Security First</p>
                                    <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                                        KYC-verified accounts, segregated wallet balances, and a fully
                                        auditable trail on every transaction.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Newsletter row */}
                        <div className="mt-10 rounded-2xl border border-border/50 bg-card/60 p-5 sm:p-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3">
                                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand/10 text-brand">
                                    <Mail className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-foreground">Stay updated with ORVANTA</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">Platform updates and important account notices, straight to your inbox.</p>
                                </div>
                            </div>
                            {submitted ? (
                                <p className="text-sm font-medium text-brand shrink-0">Thanks — you&apos;re on the list.</p>
                            ) : (
                                <form onSubmit={handleSubscribe} className="flex gap-2 shrink-0">
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email"
                                        className="w-full sm:w-56 rounded-lg border border-border bg-background px-4 py-2.5 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/50 transition"
                                    />
                                    <button
                                        type="submit"
                                        className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium btn-glow btn-glow-hover shrink-0"
                                    >
                                        Subscribe <ArrowRight className="h-3.5 w-3.5" />
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>

                    {/* Risk disclaimer */}
                    <div className="mt-8 rounded-lg glass p-5 text-xs text-muted-foreground leading-relaxed">
                        <strong className="text-foreground">Risk Disclaimer:</strong> Index investing
                        involves risk of loss and is not suitable for all investors. Your capital is at risk,
                        and returns are not guaranteed. Tier terms, minimums and maturity periods are
                        published in your dashboard before you invest. Please ensure you understand the
                        risks involved and seek independent advice if necessary. Past performance is not
                        indicative of future results.
                    </div>

                    {/* Bottom bar */}
                    <div className="mt-8 flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-xs text-muted-foreground order-2 sm:order-1">
                            &copy; {new Date().getFullYear()} <span className="text-brand font-medium">ORVANTA Financial</span>. All rights reserved.
                        </div>
                        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 order-1 sm:order-2">
                            {trustBadges.map((b) => (
                                <span key={b.label} className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                                    <b.icon className="h-3.5 w-3.5 text-brand" /> {b.label}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}
