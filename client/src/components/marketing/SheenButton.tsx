"use client";

import type { ReactNode } from "react";
import Link from "next/link";

import { cn } from "@/lib/utils";

/**
 * The primary "Get Started" call to action.
 *
 * A gold face with several rotating light sweeps blended over it, plus a slow
 * breathing highlight — the same layered idea as the reference button, but
 * rebuilt on the project's own CSS (there is no styled-components here) and
 * restricted to the gold palette so blending never drifts off-brand. Radius
 * follows the house scale rather than a pill.
 *
 * Renders an anchor when given `href`, otherwise a real `<button>`.
 */
type SheenButtonProps = {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
};

const sizes = {
  sm: "h-10 px-5 text-sm",
  md: "h-12 px-7 text-[0.9375rem]",
  lg: "h-14 px-8 text-base",
};

export function SheenButton({
  children,
  href,
  onClick,
  type = "button",
  size = "md",
  disabled = false,
  className,
  ...rest
}: SheenButtonProps) {
  const shell = cn(
    "orv-sheen group",
    sizes[size],
    disabled && "pointer-events-none opacity-50 saturate-50",
    className
  );

  const inner = (
    <>
      {/* Decorative layers — order matters, the label is painted last */}
      <span aria-hidden className="orv-sheen__layer" />
      <span aria-hidden className="orv-sheen__layer" />
      <span aria-hidden className="orv-sheen__layer" />
      <span aria-hidden className="orv-sheen__light" />
      <span className="orv-sheen__label">{children}</span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={shell} {...rest}>
        {inner}
      </Link>
    );
  }

  return (
    <button type={type} onClick={onClick} disabled={disabled} className={shell} {...rest}>
      {inner}
    </button>
  );
}
