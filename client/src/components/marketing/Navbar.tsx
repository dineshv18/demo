"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { IconArrowUpRight, IconLayoutDashboard, IconMenu2, IconX } from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import { BrandMark } from "@/components/shared/BrandMark";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { EASE_OUT } from "@/components/shared/motion";
import { useAuth } from "@/lib/AuthContext";

const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/platform", label: "Platform" },
  { href: "/contact", label: "Contact" },
] as const;

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const { user } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
      <div className={cn(
        "mx-auto flex h-17 max-w-7xl items-center rounded-2xl border px-3 transition-all duration-300 sm:px-4",
        scrolled
          ? "border-brand/15 bg-card/92 shadow-overlay backdrop-blur-2xl"
          : "border-border/80 bg-card/75 shadow-card backdrop-blur-xl"
      )}>
        <Link href="/" className="flex shrink-0 items-center" aria-label="ORVANTA Financial — home">
          <BrandMark priority className="h-11 w-auto sm:h-12" />
        </Link>

        <nav aria-label="Main navigation" className="mx-auto hidden lg:block">
          <ul className="flex items-center rounded-xl border border-border/80 bg-surface-2/70 p-1">
            {links.map((link) => {
              const active = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link href={link.href} aria-current={active ? "page" : undefined} className={cn(
                    "relative block rounded-lg px-4 py-2 text-sm font-semibold transition-colors",
                    active ? "text-brand" : "text-muted-foreground hover:text-foreground"
                  )}>
                    {active && <motion.span layoutId="public-nav-active" transition={{ type: "spring", stiffness: 420, damping: 36 }} className="absolute inset-0 rounded-lg bg-card shadow-sm ring-1 ring-brand/15" />}
                    <span className="relative">{link.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2 lg:ml-0">
          <ThemeToggle className="size-10 rounded-xl" />
          {user ? (
            <Link href="/dashboard" className="hidden h-11 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-brand-foreground shadow-sm transition-transform hover:-translate-y-0.5 sm:flex">
              <IconLayoutDashboard className="size-4" /> Dashboard
            </Link>
          ) : (
            <>
              <Link href="/login" className="hidden px-3 text-sm font-semibold text-foreground hover:text-brand sm:block">Sign in</Link>
              <Link href="/register" className="hidden h-11 items-center gap-2 rounded-xl bg-brand px-5 text-sm font-semibold text-brand-foreground shadow-sm transition-transform hover:-translate-y-0.5 sm:flex">
                Open account <IconArrowUpRight className="size-4" />
              </Link>
            </>
          )}
          <button type="button" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen((value) => !value)} className="grid size-10 place-items-center rounded-xl border border-border bg-card text-foreground lg:hidden">
            {open ? <IconX className="size-5" /> : <IconMenu2 className="size-5" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.button type="button" aria-label="Close navigation" className="fixed inset-0 -z-10 bg-black/55 backdrop-blur-sm lg:hidden" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
            <motion.nav aria-label="Mobile navigation" initial={reduce ? false : { opacity: 0, y: -12, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -12, scale: 0.98 }} transition={{ duration: 0.25, ease: EASE_OUT }} className="mx-auto mt-3 max-w-7xl overflow-hidden rounded-2xl border border-brand/15 bg-card p-3 shadow-overlay lg:hidden">
              <ul className="grid gap-1 sm:grid-cols-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className={cn("flex items-center justify-between rounded-xl px-4 py-3.5 text-sm font-semibold", pathname === link.href ? "bg-accent text-brand" : "text-foreground hover:bg-surface-2")}>
                      {link.label}<IconArrowUpRight className="size-4 opacity-55" />
                    </Link>
                  </li>
                ))}
              </ul>
              <div className="mt-3 grid grid-cols-2 gap-2 border-t border-border pt-3">
                {user ? (
                  <Link href="/dashboard" className="col-span-2 flex h-12 items-center justify-center rounded-xl bg-brand text-sm font-semibold text-brand-foreground">Dashboard</Link>
                ) : (
                  <>
                    <Link href="/login" className="flex h-12 items-center justify-center rounded-xl border border-border text-sm font-semibold">Sign in</Link>
                    <Link href="/register" className="flex h-12 items-center justify-center rounded-xl bg-brand text-sm font-semibold text-brand-foreground">Open account</Link>
                  </>
                )}
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
