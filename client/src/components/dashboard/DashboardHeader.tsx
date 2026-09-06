"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  IconBell,
  IconChevronRight,
  IconInfoCircle,
  IconLogout,
  IconSearch,
  IconUser,
} from "@tabler/icons-react";

import { useAuth } from "@/lib/AuthContext";
import { cn } from "@/lib/utils";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { EASE_OUT } from "@/components/shared/motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { allNavItems } from "./DashboardSidebar";

/**
 * Everything the search palette can jump to. It navigates between existing
 * routes only — it is a way around the product, not a data search.
 */
const searchTargets = [
  ...allNavItems.map((n) => ({ label: n.label, href: n.to, hint: "Page" })),
  { label: "Invite & Earn", href: "/dashboard/referral", hint: "Page" },
  { label: "Deposit funds", href: "/dashboard/wallet?action=deposit", hint: "Action" },
  { label: "Withdraw funds", href: "/dashboard/wallet?action=withdraw", hint: "Action" },
  { label: "Move bonus to wallet", href: "/dashboard/wallet?action=bonus-add", hint: "Action" },
];

function useCurrentPage() {
  const pathname = usePathname();
  const match = allNavItems.find((n) => n.to === pathname);
  if (match) return match.label;
  if (pathname?.startsWith("/dashboard/referral")) return "Referrals";
  if (pathname?.startsWith("/dashboard/analytics")) return "Analytics";
  return "Dashboard";
}

export function DashboardHeader({ onStartTour }: { onStartTour?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const title = useCurrentPage();
  const reduce = useReducedMotion();

  const [searchOpen, setSearchOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Cmd/Ctrl-K opens the jump-to palette.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
      if (e.key === "Escape") setSearchOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  React.useEffect(() => {
    if (searchOpen) inputRef.current?.focus();
    else setQuery("");
  }, [searchOpen]);

  React.useEffect(() => setSearchOpen(false), [pathname]);

  const results = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return searchTargets.slice(0, 6);
    return searchTargets.filter((t) => t.label.toLowerCase().includes(q)).slice(0, 8);
  }, [query]);

  const handleLogout = async () => {
    await logout();
    window.location.href = "/login";
  };

  const initial = user?.name?.charAt(0)?.toUpperCase() || "U";

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-2 border-b border-border bg-card/85 px-3 backdrop-blur-xl sm:px-5">
      <SidebarTrigger className="-ml-1 size-9 rounded-lg text-muted-foreground hover:bg-accent hover:text-brand" />

      <Separator orientation="vertical" className="mx-1 hidden h-6 sm:block" />

      {/* Breadcrumb — Dashboard › Current page */}
      <nav aria-label="Breadcrumb" className="min-w-0">
        <ol className="flex items-center gap-1.5 text-sm">
          {title !== "Dashboard" && (
            <>
              <li className="hidden sm:block">
                <Link
                  href="/dashboard"
                  className="text-muted-foreground transition-colors hover:text-brand"
                >
                  Dashboard
                </Link>
              </li>
              <li aria-hidden className="hidden sm:block">
                <IconChevronRight className="size-3.5 text-muted-foreground/50" />
              </li>
            </>
          )}
          <li className="min-w-0">
            <span
              aria-current="page"
              className="block truncate font-display text-[0.9375rem] font-semibold tracking-tight text-foreground"
            >
              {title}
            </span>
          </li>
        </ol>
      </nav>

      <div className="flex-1" />

      {/* Search — a compact trigger that expands into a palette */}
      <button
        type="button"
        onClick={() => setSearchOpen(true)}
        aria-label="Search pages and actions"
        className={cn(
          "group hidden items-center gap-2 rounded-lg border border-border bg-surface-2/70 px-3 text-sm text-muted-foreground",
          "h-9 transition-colors hover:border-brand/40 hover:text-foreground md:flex"
        )}
      >
        <IconSearch className="size-4" stroke={1.75} />
        <span className="hidden lg:inline">Search…</span>
        <kbd className="ml-4 hidden rounded border border-border bg-card px-1.5 py-0.5 font-sans text-[0.625rem] font-semibold text-muted-foreground lg:inline">
          ⌘K
        </kbd>
      </button>

      <button
        type="button"
        onClick={() => setSearchOpen(true)}
        aria-label="Search"
        className="grid size-9 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-brand/40 hover:bg-accent hover:text-brand md:hidden"
      >
        <IconSearch className="size-[18px]" stroke={1.75} />
      </button>

      {/* Notifications — routes to the pending-activity view */}
      <Link
        href="/dashboard/transactions"
        aria-label="Recent activity"
        title="Recent activity"
        className="grid size-9 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-brand/40 hover:bg-accent hover:text-brand"
      >
        <IconBell className="size-[18px]" stroke={1.75} />
      </Link>

      {onStartTour && (
        <button
          type="button"
          onClick={onStartTour}
          title="Take a tour of the dashboard"
          aria-label="Take a tour of the dashboard"
          className="hidden size-9 place-items-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-brand/40 hover:bg-accent hover:text-brand sm:grid"
        >
          <IconInfoCircle className="size-[18px]" stroke={1.75} />
        </button>
      )}

      <ThemeToggle />

      {/* Profile */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            className="ml-0.5 flex items-center gap-2 rounded-lg p-0.5 pr-1 transition-colors hover:bg-accent"
            aria-label="Account menu"
          >
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-navy-800 text-xs font-bold text-brand ring-1 ring-brand/25 dark:bg-white/10">
              {initial}
            </span>
            <span className="hidden max-w-28 truncate text-sm font-semibold text-foreground lg:inline">
              {user?.name?.split(" ")[0]}
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={8} className="w-60 rounded-xl">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="truncate text-sm font-semibold leading-none">{user?.name}</p>
              <p className="truncate text-xs leading-none text-muted-foreground">{user?.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => router.push("/dashboard/profile")} className="cursor-pointer gap-2">
            <IconUser className="size-4" /> My Profile
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={handleLogout}
            className="cursor-pointer gap-2 text-danger focus:bg-danger-soft focus:text-danger"
          >
            <IconLogout className="size-4" /> Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Jump-to palette */}
      <AnimatePresence>
        {searchOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-start justify-center p-4 pt-[12vh]"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
          >
            <div
              className="absolute inset-0 bg-navy-900/45 backdrop-blur-sm"
              onClick={() => setSearchOpen(false)}
              aria-hidden
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-label="Search pages and actions"
              initial={reduce ? false : { opacity: 0, y: -12, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.24, ease: EASE_OUT }}
              className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-card shadow-overlay"
            >
              <div className="flex items-center gap-3 border-b border-border px-4">
                <IconSearch className="size-[18px] shrink-0 text-muted-foreground" stroke={1.75} />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Jump to a page or action…"
                  aria-label="Search pages and actions"
                  className="h-14 w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground/60"
                />
                <kbd className="hidden shrink-0 rounded border border-border px-1.5 py-0.5 font-sans text-[0.625rem] font-semibold text-muted-foreground sm:inline">
                  ESC
                </kbd>
              </div>

              <ul className="max-h-80 overflow-y-auto p-2">
                {results.length === 0 && (
                  <li className="px-3 py-8 text-center text-sm text-muted-foreground">
                    Nothing matches “{query}”.
                  </li>
                )}
                {results.map((r) => (
                  <li key={r.href + r.label}>
                    <Link
                      href={r.href}
                      onClick={() => setSearchOpen(false)}
                      className="flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
                    >
                      <span className="truncate font-medium">{r.label}</span>
                      <span className="shrink-0 text-[0.6875rem] font-semibold uppercase tracking-wider text-muted-foreground">
                        {r.hint}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
