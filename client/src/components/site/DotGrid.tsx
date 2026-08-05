"use client";

import { useEffect, useRef } from "react";

interface Dot {
    x: number;
    y: number;
    baseRadius: number;
    radius: number;
    opacity: number;
    baseOpacity: number;
}

export function DotGrid() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        let animationId: number;
        const mouse = { x: -1000, y: -1000 };
        const DOT_SPACING = 25;
        const INTERACTION_RADIUS = 150;

        const resize = () => {
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);
            canvas.style.width = `${rect.width}px`;
            canvas.style.height = `${rect.height}px`;
        };

        const createDots = (): Dot[] => {
            const rect = canvas.getBoundingClientRect();
            const cols = Math.ceil(rect.width / DOT_SPACING);
            const rows = Math.ceil(rect.height / DOT_SPACING);
            const dots: Dot[] = [];
            for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                    dots.push({
                        x: i * DOT_SPACING + DOT_SPACING / 2,
                        y: j * DOT_SPACING + DOT_SPACING / 2,
                        baseRadius: 1.2,
                        radius: 1.2,
                        opacity: 0.15,
                        baseOpacity: 0.15,
                    });
                }
            }
            return dots;
        };

        let dots = createDots();

        const draw = () => {
            const rect = canvas.getBoundingClientRect();
            ctx.clearRect(0, 0, rect.width, rect.height);

            const isDark = document.documentElement.classList.contains("dark");
            const r = isDark ? 255 : 30;
            const g = isDark ? 255 : 40;
            const b = isDark ? 255 : 60;

            for (const dot of dots) {
                const dx = mouse.x - dot.x;
                const dy = mouse.y - dot.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                const scale = Math.max(0, 1 - dist / INTERACTION_RADIUS);

                dot.radius += (dot.baseRadius + scale * 3.5 - dot.radius) * 0.12;
                dot.opacity += (dot.baseOpacity + scale * 0.6 - dot.opacity) * 0.12;

                ctx.beginPath();
                ctx.arc(dot.x, dot.y, dot.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${dot.opacity})`;
                ctx.fill();
            }

            animationId = requestAnimationFrame(draw);
        };

        const handleMouseMove = (e: MouseEvent) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        };

        const handleMouseLeave = () => {
            mouse.x = -1000;
            mouse.y = -1000;
        };

        const handleResize = () => {
            resize();
            dots = createDots();
        };

        resize();
        draw();

        window.addEventListener("resize", handleResize);
        canvas.addEventListener("mousemove", handleMouseMove);
        canvas.addEventListener("mouseleave", handleMouseLeave);

        return () => {
            cancelAnimationFrame(animationId);
            window.removeEventListener("resize", handleResize);
            canvas.removeEventListener("mousemove", handleMouseMove);
            canvas.removeEventListener("mouseleave", handleMouseLeave);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full"
            aria-hidden="true"
        />
    );
}
