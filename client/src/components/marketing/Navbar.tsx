"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  IconArrowRight,
  IconChartLine,
  IconFileText,
  IconLayoutDashboard,
  IconMenu2,
  IconShieldCheck,
  IconX,
} from "@tabler/icons-react";

import { cn } from "@/lib/utils";
import { BrandMark } from "@/components/shared/BrandMark";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { EASE_OUT } from "@/components/shared/motion";
import { SheenButton } from "@/components/marketing/SheenButton";
import { useAuth } from "@/lib/AuthContext";

/** Public routes — unchanged. Plain links, no dropdowns. */
const links = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/platform", label: "Platform" },
  { href: "/contact", label: "Contact" },
] as const;

/** Structural facts, restated as a thin utility strip above the nav. */
const utilities = [
  { icon: IconShieldCheck, label: "KYC-Verified Platform" },
  { icon: IconChartLine, label: "Real-Time Performance Tracking" },
  { icon: IconFileText, label: "Published Tier Terms" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const { user } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  // Keep the page behind the mobile sheet from scrolling.
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {/* ── Utility strip: navy band that recedes once you start scrolling ── */}
      <div
        className={cn(
          "hidden overflow-hidden bg-navy-900 text-white/60 transition-[height,opacity] duration-300 lg:block",
          scrolled ? "h-0 opacity-0" : "h-10 opacity-100"
        )}
      >
        <div className="mx-auto flex h-10 max-w-7xl items-center justify-between px-6 lg:px-10">
          <ul className="flex items-center gap-7">
            {utilities.map((u) => (
              <li
                key={u.label}
                className="flex items-center gap-2 text-[0.6875rem] font-medium tracking-wide"
              >
                <u.icon className="size-3.5 text-brand" stroke={1.75} />
                {u.label}
              </li>
            ))}
          </ul>
          <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-brand">
            Growing Wealth. Building Futures.
          </p>
        </div>
      </div>

      {/* ── Main bar: full-width at rest, a floating pill once scrolled ── */}
      <div
        className={cn(
          "transition-all duration-300",
          scrolled ? "px-3 pt-3 sm:px-4" : "px-0 pt-0"
        )}
      >
        <div
          className={cn(
            "mx-auto flex items-center gap-6 transition-all duration-300",
            scrolled
              ? "h-16 max-w-6xl rounded-2xl border border-border bg-card/85 px-4 shadow-lifted backdrop-blur-xl sm:px-5"
              : "h-24 max-w-7xl border-b border-transparent bg-background/70 px-5 backdrop-blur-md lg:px-10"
          )}
        >
          <Link
            href="/"
            className="flex shrink-0 items-center"
            aria-label="ORVANTA Financial — home"
          >
            <BrandMark
              priority
              className={cn(
                "w-auto transition-all duration-300",
                scrolled ? "h-10" : "h-16"
              )}
            />
          </Link>

          {/* Desktop nav */}
          <nav aria-label="Main" className="mx-auto hidden lg:block">
            <ul className="flex items-center gap-1">
              {links.map((l) => {
                const active = pathname === l.href;
                return (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "relative block rounded-xl px-4 py-2.5 text-[0.9375rem] font-medium transition-colors",
                        active ? "text-brand" : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      {active &&
                        (reduce ? (
                          <span className="absolute inset-0 rounded-xl bg-accent ring-1 ring-brand/20" />
                        ) : (
                          <motion.span
                            layoutId="nav-pill"
                            transition={{ type: "spring", stiffness: 420, damping: 36 }}
                            className="absolute inset-0 rounded-xl bg-accent ring-1 ring-brand/20"
                          />
                        ))}
                      <span className="relative">{l.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          <div className="ml-auto flex items-center gap-2.5 lg:ml-0">
            <ThemeToggle className="size-10" />

            {user ? (
              <SheenButton href="/dashboard" size="sm" className="hidden sm:inline-flex">
                <IconLayoutDashboard className="size-4" stroke={1.75} />
                Dashboard
              </SheenButton>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden h-10 items-center rounded-xl border border-border px-5 text-sm font-semibold text-foreground transition-colors hover:border-brand/45 hover:bg-accent sm:inline-flex"
                >
                  Login
                </Link>
                <SheenButton href="/register" size="sm" className="hidden sm:inline-flex">
                  Get Started
                  <IconArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                </SheenButton>
              </>
            )}

            <button
              type="button"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
              className="grid size-10 place-items-center rounded-xl border border-border text-foreground transition-colors hover:border-brand/45 hover:bg-accent lg:hidden"
            >
              {open ? (
                <IconX className="size-5" stroke={1.75} />
              ) : (
                <IconMenu2 className="size-5" stroke={1.75} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Mobile sheet ── */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              className="fixed inset-0 -z-10 bg-navy-900/50 backdrop-blur-sm lg:hidden"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              aria-hidden
            />
            <motion.nav
              aria-label="Mobile"
              initial={reduce ? false : { opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.28, ease: EASE_OUT }}
              className="mx-3 mt-3 max-h-[75vh] overflow-y-auto rounded-2xl border border-border bg-card p-3 shadow-overlay lg:hidden"
            >
              <ul className="flex flex-col gap-1">
                {links.map((l) => {
                  const active = pathname === l.href;
                  return (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex items-center justify-between rounded-xl px-4 py-3.5 text-[0.9375rem] font-medium transition-colors",
                          active
                            ? "bg-accent text-brand ring-1 ring-brand/20"
                            : "text-foreground hover:bg-surface-2"
                        )}
                      >
                        {l.label}
                        <IconArrowRight
                          className={cn(
                            "size-4",
                            active ? "text-brand" : "text-muted-foreground/50"
                          )}
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>

              <div className="mt-3 border-t border-border pt-3">
                {user ? (
                  <SheenButton href="/dashboard" size="md" className="w-full">
                    <IconLayoutDashboard className="size-4" stroke={1.75} />
                    Dashboard
                  </SheenButton>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href="/login"
                      className="inline-flex h-12 items-center justify-center rounded-xl border border-border text-sm font-semibold text-foreground"
                    >
                      Login
                    </Link>
                    <SheenButton href="/register" size="md" className="w-full">
                      Get Started
                    </SheenButton>
                  </div>
                )}
              </div>

              <ul className="mt-3 flex flex-col gap-2 border-t border-border pt-3">
                {utilities.map((u) => (
                  <li
                    key={u.label}
                    className="flex items-center gap-2 text-[0.6875rem] font-medium text-muted-foreground"
                  >
                    <u.icon className="size-3.5 text-brand" stroke={1.75} />
                    {u.label}
                  </li>
                ))}
              </ul>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
