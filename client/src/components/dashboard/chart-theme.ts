"use client";

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

/**
 * Recharts takes literal colour strings, not CSS variables, so the chart palette
 * has to be resolved in JS. These values mirror the navy/gold tokens in
 * globals.css and are re-read whenever the theme flips.
 */
export type ChartTheme = {
  grid: string;
  axis: string;
  stroke: string;
  fillFrom: string;
  fillTo: string;
  tooltipBg: string;
  tooltipBorder: string;
  tooltipText: string;
  positive: string;
  negative: string;
  /** Ring colour for a donut with nothing in it — visible, but clearly inert. */
  emptyRing: string;
  /** Categorical series, ordered by prominence. Used for level breakdowns. */
  series: string[];
};

const LIGHT: ChartTheme = {
  grid: "rgba(7, 20, 38, 0.07)",
  axis: "rgba(94, 107, 125, 0.9)",
  stroke: "#C9A227",
  fillFrom: "rgba(201, 162, 39, 0.28)",
  fillTo: "rgba(201, 162, 39, 0)",
  tooltipBg: "#FFFFFF",
  tooltipBorder: "#E7E4DB",
  tooltipText: "#071426",
  positive: "#1E8C60",
  negative: "#C4453C",
  emptyRing: "#E1DDD2",
  series: ["#C9A227", "#0B1B32", "#1D3E66", "#A8861B", "#5E6B7D"],
};

const DARK: ChartTheme = {
  grid: "rgba(255, 255, 255, 0.07)",
  axis: "rgba(147, 165, 188, 0.9)",
  stroke: "#D8B44A",
  fillFrom: "rgba(216, 180, 74, 0.30)",
  fillTo: "rgba(216, 180, 74, 0)",
  tooltipBg: "#0D213B",
  tooltipBorder: "rgba(255, 255, 255, 0.12)",
  tooltipText: "#ECF1F7",
  positive: "#3FC08B",
  negative: "#E06A60",
  emptyRing: "rgba(255, 255, 255, 0.13)",
  series: ["#D8B44A", "#6BA3E0", "#3FC08B", "#E5C766", "#93A5BC"],
};

/**
 * Returns the chart palette plus a `mounted` flag. Charts must not render until
 * mounted, otherwise the server pass and the client pass disagree on the theme.
 */
export function useChartTheme(): { theme: ChartTheme; mounted: boolean } {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return {
    theme: resolvedTheme === "dark" ? DARK : LIGHT,
    mounted,
  };
}

/** Shared tooltip chrome so every chart in the product looks the same. */
export function tooltipStyles(theme: ChartTheme) {
  return {
    contentStyle: {
      background: theme.tooltipBg,
      border: `1px solid ${theme.tooltipBorder}`,
      borderRadius: "0.875rem",
      boxShadow: "0 18px 44px -20px rgba(7,20,38,0.35)",
      fontSize: 12,
      color: theme.tooltipText,
      padding: "10px 12px",
    } as const,
    labelStyle: {
      color: theme.axis,
      fontSize: 11,
      fontWeight: 600,
      letterSpacing: "0.04em",
      textTransform: "uppercase",
      marginBottom: 4,
    } as const,
    itemStyle: { color: theme.tooltipText, fontWeight: 600 } as const,
    cursor: { stroke: theme.stroke, strokeWidth: 1, strokeOpacity: 0.35 },
  };
}
