"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * Shared layout and reveal primitives for the public site.
 *
 * The API is unchanged (Section / Eyebrow / SectionTitle / Reveal / GlassCard /
 * AnimatedCounter) so every existing marketing page keeps working — only the
 * visual treatment moved to the navy/gold system.
 */

export function Section({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section
      id={id}
      className={cn("relative mx-auto max-w-7xl px-5 py-14 lg:px-8 lg:py-20", className)}
    >
      {children}
    </section>
  );
}

/** Small gold-accented label that sits above a heading. */
export function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-brand/25 bg-accent px-3.5 py-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-accent-foreground">
      <span aria-hidden className="size-1.5 rounded-full bg-brand" />
      {children}
    </span>
  );
}

export function SectionTitle({
  eyebrow,
  title,
  description,
  align = "center",
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  align?: "center" | "left";
}) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center")}>
      {eyebrow && (
        <div className="mb-5">
          <Eyebrow>{eyebrow}</Eyebrow>
        </div>
      )}
      <h2 className="font-display text-3xl font-semibold tracking-[-0.03em] text-foreground md:text-[2.75rem] md:leading-[1.1]">
        {title}
      </h2>
      {description && (
        <p className="mt-5 text-base leading-relaxed text-muted-foreground md:text-lg">
          {description}
        </p>
      )}
    </div>
  );
}

export function AnimatedCounter({
  to,
  suffix = "",
  prefix = "",
  duration = 1800,
}: {
  to: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  const reduce = useReducedMotion();
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (reduce) {
      setVal(to);
      return;
    }
    if (!inView) return;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(Math.round(to * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration, reduce]);

  return (
    <span ref={ref} className="tnum">
      {prefix}
      {val.toLocaleString()}
      {suffix}
    </span>
  );
}

export function Reveal({
  children,
  delay = 0,
  y = 20,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();

  if (reduce) return <div className={className}>{children}</div>;

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** Standard content card for the public site. */
export function GlassCard({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "card-tilt relative rounded-2xl border border-border bg-card p-6 shadow-card",
        className
      )}
    >
      {children}
    </div>
  );
}

/** Numbered feature card — "01 / Transparency" style blocks. */
export function NumberedCard({
  index,
  title,
  children,
  className,
}: {
  index: number;
  title: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "card-tilt group relative overflow-hidden rounded-2xl border border-border bg-card p-6 shadow-card",
        className
      )}
    >
      <span
        aria-hidden
        className="font-display text-[0.6875rem] font-semibold uppercase tracking-[0.2em] text-brand"
      >
        {String(index).padStart(2, "0")}
      </span>
      <h3 className="mt-3 font-display text-lg font-semibold tracking-tight text-foreground">
        {title}
      </h3>
      <p className="mt-2.5 text-sm leading-relaxed text-muted-foreground">{children}</p>
      <span
        aria-hidden
        className="absolute inset-x-6 bottom-0 h-px origin-left scale-x-0 bg-linear-to-r from-brand to-transparent transition-transform duration-500 group-hover:scale-x-100"
      />
    </div>
  );
}
