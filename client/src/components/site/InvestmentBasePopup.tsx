"use client";

import { useState, useEffect } from "react";
import {
  IconX, IconInfoCircle, IconTrendingUp, IconClock, IconStar,
} from "@tabler/icons-react";
import { indexAPI, type IndexTier } from "@/lib/api";

const TIER_COLORS = [
  "from-emerald-500 to-teal-400",
  "from-brand to-emerald-400",
  "from-amber-500 to-orange-400",
  "from-teal-500 to-emerald-300",
];

export function useInvestmentBasePopup() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem("orvanta_investment_base_seen");
    if (!seen) {
      const timer = setTimeout(() => setShow(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  const close = () => {
    setShow(false);
    localStorage.setItem("orvanta_investment_base_seen", "1");
  };

  return { show, close };
}

export default function InvestmentBasePopup({
  onClose,
  onSelectTier,
}: {
  onClose: () => void;
  onSelectTier?: (minAmount: number, tierId?: string) => void;
}) {
  const [visible, setVisible] = useState(false);
  const [tiers, setTiers] = useState<IndexTier[]>([]);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    indexAPI.getData().then((res) => setTiers(res.tiers || [])).catch(() => {});
  }, []);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center transition-all duration-500 ${visible ? "opacity-100" : "opacity-0"}`}
      onClick={onClose}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" />

      {/* Modal */}
      <div
        className={`relative w-full sm:max-w-xl max-h-[92vh] sm:max-h-[90vh] overflow-hidden transition-all duration-500 ease-out
          bg-gradient-to-b from-card via-card to-card/95
          sm:rounded-3xl rounded-t-3xl border border-border/50
          shadow-[0_-8px_40px_rgba(0,0,0,0.3)]
          ${visible ? "translate-y-0 sm:scale-100" : "translate-y-8 sm:translate-y-0 sm:scale-95"}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow accent top */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-brand to-transparent" />

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 h-9 w-9 rounded-full bg-muted/60 hover:bg-muted flex items-center justify-center transition-all hover:scale-110"
        >
          <IconX className="h-4 w-4" />
        </button>

        {/* Scrollable content */}
        <div className="overflow-y-auto max-h-[92vh] sm:max-h-[90vh] px-5 sm:px-8 pt-8 pb-6">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-brand/10 px-4 py-1.5 mb-4">
              <IconStar className="h-3.5 w-3.5 text-brand" />
              <span className="text-[11px] font-bold text-brand uppercase tracking-widest">ORVANTA Financial</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
              Investment<span className="text-gradient ml-2">Base</span>
            </h2>
            <div className="w-20 h-1 bg-gradient-to-r from-brand to-brand-2 mx-auto mt-4 rounded-full" />
          </div>

          {/* Tier Cards */}
          <div className="space-y-3 mb-6">
            {tiers.filter((t) => t.isActive).map((item, i) => {
              const color = TIER_COLORS[i % TIER_COLORS.length];
              return (
                <div
                  key={item.id}
                  onClick={() => onSelectTier?.(parseFloat(item.minAmount), item.id)}
                  role={onSelectTier ? "button" : undefined}
                  className={`group relative overflow-hidden rounded-2xl border border-border/60 bg-background/40 hover:bg-background/80 transition-all duration-300 ${onSelectTier ? "cursor-pointer" : ""}`}
                  style={{ animationDelay: `${i * 80}ms` }}
                >
                  {/* Left accent bar */}
                  <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${color}`} />

                  <div className="flex items-center gap-4 p-4 pl-5">
                    {/* Number badge */}
                    <div className={`flex-shrink-0 w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-white text-sm font-bold shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                      {i + 1}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="font-display text-sm sm:text-base font-bold tracking-wide text-foreground">{item.label}</p>
                        <span className="text-[11px] font-bold text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">
                          ${parseFloat(item.minAmount).toLocaleString()} - ${parseFloat(item.maxAmount).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-brand">
                          <IconTrendingUp className="h-3 w-3" /> {parseFloat(item.weeklyReturn).toFixed(2)}% / week
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <IconClock className="h-3 w-3" /> {item.durationMonths} months
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {tiers.filter((t) => t.isActive).length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-6">No investment tiers available right now.</p>
            )}
          </div>

          {/* Notes */}
          <div className="rounded-2xl border border-brand/10 bg-brand/5 p-5 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-6 w-6 rounded-md bg-brand/20 flex items-center justify-center">
                <IconInfoCircle className="h-3.5 w-3.5 text-brand" />
              </div>
              <span className="text-xs font-bold text-brand uppercase tracking-wider">Important Notes</span>
            </div>
            <ul className="space-y-2">
              {[
                "All returns are percentage per holding duration.",
                "Holding duration starts from the date of activation.",
                "TD (Trade Duration) conditions apply as mentioned.",
                "Please read all terms & conditions carefully.",
              ].map((note, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs text-muted-foreground leading-relaxed">
                  <span className="text-brand mt-0.5 flex-shrink-0">✦</span>
                  {note}
                </li>
              ))}
            </ul>
          </div>

          {/* Thank You + CTA */}
          <div className="text-center">
            <p className="font-display text-xl font-bold italic text-gradient mb-5">Thank You!</p>
            <button
              onClick={onClose}
              className="w-full sm:w-auto rounded-xl btn-glow btn-glow-hover px-10 py-3 text-sm font-semibold text-white transition-all"
            >
              Explore Investments
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
