"use client";

/**
 * Ambient page background for the public site.
 *
 * Deliberately quiet: a faint grid that fades out toward the middle of the
 * viewport, and two low-opacity gold washes in the corners. The previous
 * mouse-tracking glow and floating particles read as crypto-landing-page, so
 * they are gone — the ground should sit behind the content, not compete.
 */
export function SiteBackground() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <div className="bg-grid absolute inset-0 opacity-70 dark:opacity-40" />

      {/* Fades the grid out behind the content column */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(1100px 720px at 50% -8%, transparent 0%, var(--background) 78%)",
        }}
      />

      <div
        className="absolute -left-40 -top-40 size-[520px] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in oklab, var(--brand) 6%, transparent), transparent)",
        }}
      />
      <div
        className="absolute -bottom-48 -right-40 size-[560px] rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, color-mix(in oklab, var(--brand) 5%, transparent), transparent)",
        }}
      />

      <div className="bg-noise absolute inset-0 opacity-[0.035] mix-blend-overlay" />
    </div>
  );
}
