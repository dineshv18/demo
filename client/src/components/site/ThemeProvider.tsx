"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

/**
 * Light/dark theming for the whole app.
 *
 * The choice is persisted by next-themes under the "theme" key and re-applied
 * before first paint by the bootstrap script in the root layout, so the palette
 * never flashes on reload.
 *
 * Note: an admin-assigned role may carry a `color` (see `assignedRole.color` in
 * AuthContext, which is left untouched and still available to any component
 * that wants it). It is deliberately NOT used to repaint the global brand
 * tokens any more — ORVANTA's navy-and-gold identity owns the product chrome,
 * and the stored role colours are hold-overs from the previous green theme, so
 * injecting them turned the sidebar, buttons and charts green for every signed-
 * in user.
 */
export function RoleThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem
      enableColorScheme
      storageKey="theme"
      disableTransitionOnChange={false}
    >
      {children}
    </NextThemesProvider>
  );
}
