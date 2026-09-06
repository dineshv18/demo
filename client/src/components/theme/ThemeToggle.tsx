"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { motion, useReducedMotion } from "framer-motion";
import { IconMoon, IconSun } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { EASE_OUT } from "@/components/shared/motion";

/**
 * Light/dark switch. The choice is persisted by next-themes under the "theme"
 * key and re-applied before first paint by the bootstrap script in the root
 * layout, so there is no flash on reload.
 *
 * `on` lets the control sit correctly on an always-navy surface (the sidebar,
 * the auth panel) regardless of the active theme.
 */
export function ThemeToggle({
  className,
  on = "auto",
}: {
  className?: string;
  on?: "auto" | "dark";
}) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  const base = cn(
    "relative grid size-9 shrink-0 place-items-center overflow-hidden rounded-lg border transition-colors",
    on === "dark"
      ? "border-white/12 text-white/70 hover:border-brand/45 hover:text-brand"
      : "border-border text-muted-foreground hover:border-brand/45 hover:bg-accent hover:text-brand",
    className
  );

  // Before hydration we cannot know the theme; render a stable, inert shell.
  if (!mounted) {
    return <span className={base} aria-hidden />;
  }

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={base}
      aria-label={isDark ? "Switch to light theme" : "Switch to dark theme"}
      title={isDark ? "Light theme" : "Dark theme"}
    >
      <motion.span
        key={isDark ? "moon" : "sun"}
        initial={reduce ? false : { opacity: 0, rotate: -70, scale: 0.6 }}
        animate={{ opacity: 1, rotate: 0, scale: 1 }}
        transition={{ duration: 0.32, ease: EASE_OUT }}
        className="grid place-items-center"
      >
        {isDark ? (
          <IconMoon className="size-[18px]" stroke={1.75} />
        ) : (
          <IconSun className="size-[18px]" stroke={1.75} />
        )}
      </motion.span>
    </button>
  );
}

/**
 * Segmented Light / Dark control for settings surfaces, where an explicit
 * two-state choice reads better than a single toggling button.
 */
export function ThemeSegmented({ className }: { className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const current = mounted ? (resolvedTheme === "dark" ? "dark" : "light") : "light";

  const options = [
    { value: "light" as const, label: "Light", icon: IconSun },
    { value: "dark" as const, label: "Dark", icon: IconMoon },
  ];

  return (
    <div
      role="radiogroup"
      aria-label="Colour theme"
      className={cn("inline-flex gap-1 rounded-xl border border-border bg-surface-2 p-1", className)}
    >
      {options.map((o) => {
        const active = current === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => setTheme(o.value)}
            className={cn(
              "relative inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-[0.8125rem] font-semibold transition-colors",
              active ? "text-brand" : "text-muted-foreground hover:text-foreground"
            )}
          >
            {active && (
              <motion.span
                layoutId="theme-seg"
                transition={{ duration: 0.3, ease: EASE_OUT }}
                className="absolute inset-0 rounded-lg bg-card shadow-xs ring-1 ring-brand/20"
              />
            )}
            <o.icon className="relative size-4" stroke={1.75} />
            <span className="relative">{o.label}</span>
          </button>
        );
      })}
    </div>
  );
}
