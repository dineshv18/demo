import { useEffect, useRef, useState, type ReactNode } from "react";
import { motion, useInView } from "framer-motion";

export function Section({ children, className = "", id }: { children: ReactNode; className?: string; id?: string }) {
    return (
        <section id={id} className={`relative mx-auto max-w-7xl px-5 lg:px-8 py-12 lg:py-14 ${className}`}>
            {children}
        </section>
    );
}

export function Eyebrow({ children }: { children: ReactNode }) {
    return (
        <div className="inline-flex items-center gap-2 rounded-lg  glass px-3.5 py-1.5 text-xs font-medium tracking-wide uppercase text-foreground/80">
            <span className="h-1.5 w-1.5 rounded-lg  animate-pulse-glow" style={{ background: "var(--brand)" }} />
            {children}
        </div>
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
        <div className={`max-w-3xl ${align === "center" ? "mx-auto text-center" : ""}`}>
            {eyebrow && <div className="mb-5"><Eyebrow>{eyebrow}</Eyebrow></div>}
            <h2 className="font-display text-4xl md:text-5xl font-semibold tracking-tight">
                {title}
            </h2>
            {description && (
                <p className="mt-5 text-base md:text-lg text-muted-foreground leading-relaxed">
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
}: { to: number; suffix?: string; prefix?: string; duration?: number }) {
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, { once: true, margin: "-80px" });
    const [val, setVal] = useState(0);
    useEffect(() => {
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
    }, [inView, to, duration]);
    return <span ref={ref}>{prefix}{val.toLocaleString()}{suffix}</span>;
}

export function Reveal({ children, delay = 0, y = 20 }: { children: ReactNode; delay?: number; y?: number }) {
    return (
        <motion.div
            initial={{ opacity: 0, y }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
        >
            {children}
        </motion.div>
    );
}

export function GlassCard({ children, className = "" }: { children: ReactNode; className?: string }) {
    return (
        <div className={`relative glass rounded-lg p-6 card-tilt ${className}`}>
            <span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-lg opacity-0 hover:opacity-100 transition"
                style={{
                    background:
                        "linear-gradient(120deg, transparent, color-mix(in oklab, var(--brand) 12%, transparent), transparent)",
                }}
            />
            {children}
        </div>
    );
}
