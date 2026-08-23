"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "@/lib/AuthContext";

function hexToHsl(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16) / 255;
  const g = parseInt(h.substring(2, 4), 16) / 255;
  const b = parseInt(h.substring(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const lightness = (max + min) / 2;
  let s = 0;
  let hue = 0;

  if (max !== min) {
    const d = max - min;
    s = lightness > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: hue = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: hue = ((b - r) / d + 2) / 6; break;
      case b: hue = ((r - g) / d + 4) / 6; break;
    }
  }

  return [Math.round(hue * 360), Math.round(s * 100), Math.round(lightness * 100)];
}

function applyBrandColor(hex: string) {
  const [h, s] = hexToHsl(hex);
  const root = document.documentElement;
  const c = Math.max(0.10, Math.min(0.18, s / 100 * 0.25));
  root.style.setProperty("--brand", `oklch(0.72 ${c} ${h})`);
  root.style.setProperty("--brand-2", `oklch(0.64 ${c * 1.1} ${h - 7})`);
  root.style.setProperty("--brand-glow", `oklch(0.80 ${c * 0.95} ${h + 5})`);
  root.style.setProperty("--ring", `oklch(0.72 ${c} ${h})`);
}

function RoleThemeInjector({ color }: { color: string }) {
  useEffect(() => {
    if (!color) return;
    applyBrandColor(color);
  }, [color]);

  return null;
}

export function RoleThemeProvider({ children }: { children: ReactNode }) {
  const { roleColor } = useAuth();

  // Apply default golden brand on mount (before API loads)
  useEffect(() => {
    if (!roleColor) {
      applyBrandColor("#00A94F");
    }
  }, [roleColor]);

  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      forcedTheme="light"
      enableSystem={false}
      disableTransitionOnChange={false}
    >
      <RoleThemeInjector color={roleColor} />
      {children}
    </NextThemesProvider>
  );
}
