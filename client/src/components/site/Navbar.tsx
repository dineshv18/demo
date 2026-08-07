"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import { ThemeToggleButton } from "./ThemeToggle";
import { cn } from "@/lib/utils";

const links = [
    { href: "/", label: "Home" },
    { href: "/platform", label: "Platform" },
    { href: "/about", label: "About" },
    { href: "/blog", label: "Blog" },
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
                'mx-auto mt-2 max-w-7xl px-6 transition-all duration-300 lg:px-12',
                scrolled && 'bg-background/50 max-w-4xl rounded-2xl border backdrop-blur-lg lg:px-6 shadow-md border-border/60 shadow-zinc-950/15'
            )}>
                <div className="relative flex flex-wrap items-center justify-between gap-6 py-3 lg:gap-0 lg:py-4">
                    <div className="flex w-full justify-between lg:w-auto">
                        <Link href="/" className="flex items-center gap-2.5 group">
                            <Image src="/WhiteBlack-Photoroom.png" alt="ORVANTA Financial" width={100} height={100} className="h-16 w-auto transition-all dark:hidden" priority />
                            <Image src="/dark-Photoroom.png" alt="ORVANTA Financial" width={100} height={100} className="h-16 w-auto transition-all hidden dark:block" priority />
                        </Link>

                        <button
                            aria-label={open ? "Close Menu" : "Open Menu"}
                            className="lg:hidden grid h-9 w-9 place-items-center rounded-full border border-border/70 cursor-pointer"
                            onClick={() => setOpen((v) => !v)}
                        >
                            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
                        </button>
                    </div>

                    {/* Centered navigation on desktop */}
                    <div className={cn(
                        "absolute inset-x-0 mx-auto hidden w-fit lg:block transition-all",
                        scrolled && "static translate-x-0"
                    )}>
                        <nav className="flex items-center gap-1">
                            {links.map((l) => {
                                const active = pathname === l.href;
                                return (
                                    <Link
                                        key={l.href}
                                        href={l.href}
                                        className={`relative px-3.5 py-2 text-sm rounded-full transition-colors ${active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                                            }`}
                                    >
                                        {l.label}
                                        {active && (
                                            <span className="absolute inset-x-3 -bottom-0.5 h-0.5 rounded-full"
                                                style={{ background: "linear-gradient(90deg, var(--brand-2), var(--brand))" }} />
                                        )}
                                    </Link>
                                );
                            })}
                        </nav>
                    </div>

                    {/* Right elements */}
                    <div className="hidden lg:flex items-center gap-2">
                        <ThemeToggleButton
                            variant="rectangle"
                            start="bottom-up"
                            className="h-9 w-9"
                        />

                        <Link
                            href="/login"
                            className={cn(
                                "inline-flex items-center rounded-full px-4 py-2 text-sm font-medium btn-glow btn-glow-hover",
                                scrolled && "lg:hidden"
                            )}
                        >
                            Open Account
                        </Link>
                        <Link
                            href="/login"
                            className={cn(
                                "items-center rounded-full px-4 py-2 text-sm font-medium btn-glow btn-glow-hover",
                                scrolled ? "inline-flex animate-fade-in" : "hidden"
                            )}
                        >
                            Get Started
                        </Link>
                    </div>
                </div>
            </div>

            {/* Mobile menu */}
            {open && (
                <div className="lg:hidden mx-4 mt-2 glass rounded-3xl p-4 shadow-xl border border-border/60">
                    <div className="flex flex-col gap-1">
                        {links.map((l) => (
                            <Link key={l.href} href={l.href} className="block px-4 py-2.5 rounded-2xl hover:bg-accent text-sm transition">
                                {l.label}
                            </Link>
                        ))}
                    </div>
                    <div className="flex items-center justify-between gap-2 p-2 pt-4 border-t border-border/40 mt-2">
                        <ThemeToggleButton
                            variant="rectangle"
                            start="bottom-up"
                            className="h-9 w-9"
                        />
                        <div className="flex gap-2 flex-1 justify-end">

                            <Link href="/login" className="px-4 py-2 text-center rounded-full text-sm btn-glow flex-1">Open Account</Link>
                        </div>
                    </div>
                </div>
            )}
        </header>
    );
}
