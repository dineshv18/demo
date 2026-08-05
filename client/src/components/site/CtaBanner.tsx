"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { Reveal, Section } from "./primitives";

export function CtaBanner() {
    return (
        <Section className="!py-16">
            <Reveal>
                <div className="relative overflow-hidden rounded-[32px] p-8 md:p-14 bg-gradient-to-r from-amber-600 via-amber-600 to-amber-700 text-white shadow-2xl border border-amber-500/20">
                    {/* Ambient Glows */}
                    <div aria-hidden className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-white/5 blur-3xl pointer-events-none" />
                    <div aria-hidden className="absolute -left-20 -bottom-20 w-80 h-80 rounded-full bg-amber-500/20 blur-3xl pointer-events-none" />

                    <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8 z-10">
                        <div className="space-y-4 max-w-xl text-left">
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full text-xs font-semibold border border-white/10 select-none">
                                <Sparkles size={14} className="text-amber-200 animate-pulse" />
                                <span>Instant Setup</span>
                            </div>
                            
                            {/* Title */}
                            <h3 className="font-display text-3xl md:text-4xl font-extrabold tracking-tight leading-tight text-white">
                                Ready to start trading?
                            </h3>
                            
                            {/* Description */}
                            <p className="text-sm text-amber-100/80 leading-relaxed">
                                Open an account in minutes. Fund it when you&apos;re ready. Trade with discipline.
                            </p>
                        </div>

                        {/* Action block */}
                        <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-6 shrink-0">
                            {/* Buttons */}
                            <div className="flex flex-wrap gap-3">
                                <Link 
                                    href="/#accounts" 
                                    className="inline-flex items-center gap-2 rounded-lg bg-white text-amber-600 hover:bg-amber-50 px-6 py-3.5 text-sm font-bold transition duration-200 shadow-lg shadow-black/10"
                                >
                                    Open Live Account <ArrowRight className="h-4 w-4" />
                                </Link>
                                <Link 
                                    href="/contact" 
                                    className="inline-flex items-center gap-2 rounded-lg border border-white/30 hover:border-white/60 hover:bg-white/5 px-6 py-3.5 text-sm font-semibold text-white transition duration-200"
                                >
                                    Talk to our team
                                </Link>
                            </div>

                            {/* Overlapping Avatars */}
                            <div className="flex items-center gap-3">
                                <div className="flex -space-x-2 select-none">
                                    {[
                                        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=64&h=64&q=80",
                                        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=64&h=64&q=80",
                                        "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=64&h=64&q=80",
                                        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=64&h=64&q=80"
                                    ].map((src, idx) => (
                                        <img 
                                            key={idx} 
                                            src={src} 
                                            alt="User avatar" 
                                            className="h-7 w-7 rounded-full border border-amber-600 object-cover" 
                                        />
                                    ))}
                                </div>
                                <span className="text-xs text-amber-100/90 font-medium">5/5 (220,000+ Active Clients)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </Reveal>
        </Section>
    );
}
