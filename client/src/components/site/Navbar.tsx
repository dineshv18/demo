"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

const links = [
    { href: "/", label: "Home" },
    { href: "/platform", label: "Platform" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
] as const;

export function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [open, setOpen] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 50);
        onScroll();
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    useEffect(() => setOpen(false), [pathname]);

    return (
        <header className="fixed top-0 z-50 w-full px-2">
            <div className={cn(
                'mx-auto mt-2 max-w-7xl rounded-2xl px-6 transition-all duration-300 lg:px-8',
                'bg-background/80 backdrop-blur-lg border border-border/60',
                scrolled && 'shadow-md shadow-zinc-950/10'
            )}>
                <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-3.5">
                    <div className="flex w-full justify-between lg:w-auto">
                        <Link href="/" className="flex items-center gap-2.5 group">
                            <Image src="/WhiteBlack-Photoroom.png" alt="ORVANTA Financial" width={100} height={100} className="h-14 w-auto transition-all dark:hidden" priority />
                            <Image src="/dark-Photoroom.png" alt="ORVANTA Financial" width={100} height={100} className="h-14 w-auto transition-all hidden dark:block" priority />
                        </Link>

                        <button
                            aria-label={open ? "Close Menu" : "Open Menu"}
                            className="lg:hidden grid h-9 w-9 place-items-center rounded-lg border border-border/70 cursor-pointer"
                            onClick={() => setOpen((v) => !v)}
                        >
                            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                        </button>
                    </div>

                    {/* Centered navigation on desktop */}
                    <div className="absolute inset-x-0 mx-auto hidden w-fit lg:block">
                        <nav className="flex items-center gap-1">
                            {links.map((l) => {
                                const active = pathname === l.href;
                                return (
                                    <Link
                                        key={l.href}
                                        href={l.href}
                                        className={`relative px-3.5 py-2 text-sm font-medium rounded-lg transition-colors ${active ? "text-brand" : "text-muted-foreground hover:text-foreground"
                                            }`}
                                    >
                                        {l.label}
                                        {active && (
                                            <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full bg-brand" />
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Right elements */}
                    <div className="hidden lg:flex items-center gap-3">
                        <div className="hidden xl:flex items-center gap-2">
                            <div className="rounded-lg border border-border/60 bg-muted/50 px-3 py-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                                KYC-Verified Platform
                            </div>
                            <div className="rounded-lg border border-border/60 bg-muted/50 px-3 py-1.5 text-[11px] font-medium uppercase tracking-wide text-muted-foreground inline-flex items-center gap-1.5">
                                <span className="h-1.5 w-1.5 rounded-full bg-brand animate-pulse" /> Real-Time Tracking
                            </div>
                        </div>
                        <Link
                            href="/login"
                            className="inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium btn-glow btn-glow-hover"
                        >
                            Open Account
                        </Link>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {open && (
                <div className="lg:hidden mx-4 mt-2 glass rounded-2xl p-4 shadow-xl border border-border/60">
                    <div className="flex flex-col gap-1">
                        {links.map((l) => (
                            <Link key={l.href} href={l.href} className="block px-4 py-2.5 rounded-lg hover:bg-accent text-sm transition">
                                {l.label}
                            </Link>
                        ))}
                    </div>
                    <div className="flex items-center justify-between gap-2 p-2 pt-4 border-t border-border/40 mt-2">
                        <Link href="/login" className="px-4 py-2 text-center rounded-lg text-sm btn-glow flex-1">Open Account</Link>
                    </div>
                </div>
            )}
        </header>
    );
}
