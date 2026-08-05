import { Mail, ArrowRight } from "lucide-react";
import { Reveal, Section } from "./primitives";


export function Newsletter() {
    return (
        <Section className="!py-16">
            <Reveal>
                <div className="relative overflow-hidden rounded-lg glass-strong p-8 md:p-14">
                    <div aria-hidden className="absolute -top-20 -right-20 h-72 w-72 rounded-lg  blur-3xl"
                        style={{ background: "radial-gradient(closest-side, color-mix(in oklab, var(--brand) 45%, transparent), transparent)" }} />
                    <div className="relative grid gap-8 md:grid-cols-[1.2fr,1fr] items-center">
                        <div>
                            <div className="inline-flex items-center gap-2 rounded-lg  glass px-3 py-1 text-xs uppercase tracking-wide">
                                <Mail className="h-3.5 w-3.5" /> Weekly market intelligence
                            </div>
                            <h3 className="mt-4 font-display text-3xl md:text-4xl font-semibold tracking-tight">
                                Institutional insights, <span className="text-gradient">delivered Monday</span>.
                            </h3>
                            <p className="mt-3 text-muted-foreground max-w-lg">
                                FX and crypto macro briefings, key economic events, and desk commentary
                                curated by our analysts. No spam, unsubscribe anytime.
                            </p>
                        </div>
                        <form onSubmit={(e) => e.preventDefault()} className="flex flex-col sm:flex-row gap-3">
                            <input
                                type="email"
                                required
                                placeholder="you@company.com"
                                className="flex-1 rounded-lg  border border-border/70 bg-background/60 px-5 py-3 text-sm outline-none focus:border-primary transition"
                            />
                            <button className="inline-flex items-center justify-center gap-2 rounded-lg  px-6 py-3 text-sm font-medium btn-glow btn-glow-hover">
                                Subscribe <ArrowRight className="h-4 w-4" />
                            </button>
                        </form>
                    </div>
                </div>
            </Reveal>
        </Section>
    );
}
