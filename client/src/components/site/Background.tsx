import { useEffect, useRef } from "react";

export function SiteBackground() {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const onMove = (e: MouseEvent) => {
            el.style.setProperty("--mx", `${e.clientX}px`);
            el.style.setProperty("--my", `${e.clientY}px`);
        };
        window.addEventListener("mousemove", onMove);
        return () => window.removeEventListener("mousemove", onMove);
    }, []);

    return (
        <div
            ref={ref}
            aria-hidden
            className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
            style={{ ["--mx" as string]: "50%", ["--my" as string]: "20%" }}
        >
            {/* base grid */}
            <div className="absolute inset-0 bg-grid opacity-60 dark:opacity-40" />
            {/* dots */}
            <div className="absolute inset-0 bg-dots opacity-30 dark:opacity-25" />
            {/* radial fade mask over the grid */}
            <div
                className="absolute inset-0"
                style={{
                    background:
                        "radial-gradient(1200px 800px at 50% -10%, transparent 0%, var(--background) 80%)",
                }}
            />
            {/* mouse follow glow */}
            <div
                className="absolute inset-0 transition-[background] duration-300"
                style={{
                    background:
                        "radial-gradient(600px 400px at var(--mx) var(--my), color-mix(in oklab, var(--brand) 22%, transparent), transparent 70%)",
                }}
            />
            {/* corner glows */}
            <div className="absolute -top-40 -left-40 h-[560px] w-[560px] rounded-lg  blur-3xl opacity-60 animate-pulse-glow"
                style={{ background: "radial-gradient(closest-side, color-mix(in oklab, var(--brand) 45%, transparent), transparent)" }} />
            <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-lg  blur-3xl opacity-50 animate-pulse-glow"
                style={{ background: "radial-gradient(closest-side, color-mix(in oklab, var(--brand-2) 40%, transparent), transparent)" }} />
            {/* floating particles */}
            {Array.from({ length: 14 }).map((_, i) => (
                <span
                    key={i}
                    className="absolute block rounded-lg  animate-float-slow"
                    style={{
                        left: `${(i * 73) % 100}%`,
                        top: `${(i * 47) % 100}%`,
                        width: `${4 + (i % 4) * 2}px`,
                        height: `${4 + (i % 4) * 2}px`,
                        background: "color-mix(in oklab, var(--brand) 70%, transparent)",
                        filter: "blur(1px)",
                        opacity: 0.5,
                        animationDelay: `${i * 0.6}s`,
                    }}
                />
            ))}
            {/* noise */}
            <div className="absolute inset-0 bg-noise opacity-[0.06] mix-blend-overlay" />
        </div>
    );
}
