"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * The ORVANTA logo lockup.
 *
 * Two artwork files exist: one drawn for light grounds and one for dark. Rather
 * than swap on the `dark` class alone (which is wrong inside the always-navy
 * sidebar and the navy auth panel), callers state the ground they are sitting
 * on via `on`.
 */
export function BrandMark({
  on = "auto",
  className,
  priority,
  alt = "ORVANTA Financial",
}: {
  on?: "auto" | "light" | "dark";
  className?: string;
  priority?: boolean;
  alt?: string;
}) {
  const size = 160;

  if (on === "dark") {
    return (
      <Image
        src="/dark-Photoroom.png"
        alt={alt}
        width={size}
        height={size}
        priority={priority}
        className={cn("h-10 w-auto", className)}
      />
    );
  }

  if (on === "light") {
    return (
      <Image
        src="/WhiteBlack-Photoroom.png"
        alt={alt}
        width={size}
        height={size}
        priority={priority}
        className={cn("h-10 w-auto", className)}
      />
    );
  }

  // Follows the active theme.
  return (
    <>
      <Image
        src="/WhiteBlack-Photoroom.png"
        alt={alt}
        width={size}
        height={size}
        priority={priority}
        className={cn("h-10 w-auto dark:hidden", className)}
      />
      <Image
        src="/dark-Photoroom.png"
        alt=""
        aria-hidden
        width={size}
        height={size}
        priority={priority}
        className={cn("hidden h-10 w-auto dark:block", className)}
      />
    </>
  );
}

/**
 * Compact monogram for tight spaces (collapsed sidebar, avatars, favicradle).
 * Drawn rather than cropped from the logo so it stays crisp at small sizes.
 */
export function BrandMonogram({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={cn(
        "grid aspect-square size-9 shrink-0 place-items-center rounded-xl",
        "bg-navy-800 text-brand ring-1 ring-brand/30",
        "font-display text-[0.9375rem] font-semibold tracking-tight",
        className
      )}
    >
      O
    </span>
  );
}

/** Wordmark + tagline, for footers and auth panels. */
export function BrandLockup({
  on = "auto",
  className,
  showTagline = true,
}: {
  on?: "auto" | "light" | "dark";
  className?: string;
  showTagline?: boolean;
}) {
  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <BrandMark on={on} className="h-14 w-auto" />
      {showTagline && (
        <p
          className={cn(
            "text-eyebrow",
            on === "dark" && "text-white/55"
          )}
        >
          Growing Wealth. Building Futures.
        </p>
      )}
    </div>
  );
}
