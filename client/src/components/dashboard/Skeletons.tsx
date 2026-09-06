"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * Loading states that mirror the shape of the real content, so the page settles
 * into place instead of jumping. Used wherever an API call is in flight.
 */

export function StatCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-4 shadow-card sm:p-5",
        className
      )}
    >
      <Skeleton className="size-10 rounded-xl" />
      <Skeleton className="mt-4 h-3 w-24" />
      <Skeleton className="mt-2.5 h-8 w-32" />
      <Skeleton className="mt-2 h-3 w-20" />
    </div>
  );
}

export function StatGridSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }, (_, i) => (
        <StatCardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ChartSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-4 shadow-card sm:p-6",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-8 w-40" />
        </div>
        <Skeleton className="h-9 w-40 rounded-lg" />
      </div>
      {/* Suggests a chart silhouette rather than a flat block */}
      <div className="mt-6 flex h-48 items-end gap-2" aria-hidden>
        {[42, 58, 36, 72, 54, 84, 66, 92, 74, 60, 88, 70].map((h, i) => (
          <Skeleton key={i} className="flex-1 rounded-md" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 6, className }: { rows?: number; className?: string }) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border bg-card shadow-card",
        className
      )}
    >
      <div className="hairline-b flex items-center gap-4 px-4 py-3.5 sm:px-6">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="ml-auto h-3 w-16" />
      </div>
      <div className="divide-y divide-border">
        {Array.from({ length: rows }, (_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3.5 sm:px-6">
            <Skeleton className="size-10 shrink-0 rounded-full" />
            <div className="min-w-0 flex-1 space-y-2">
              <Skeleton className="h-3.5 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="h-4 w-20 shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function ListSkeleton({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-xl border border-border p-3">
          <Skeleton className="size-10 shrink-0 rounded-full" />
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-4 w-16 shrink-0" />
        </div>
      ))}
    </div>
  );
}

export function PanelSkeleton({ lines = 4, className }: { lines?: number; className?: string }) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-card p-4 shadow-card sm:p-6",
        className
      )}
    >
      <Skeleton className="h-4 w-32" />
      <div className="mt-5 space-y-3.5">
        {Array.from({ length: lines }, (_, i) => (
          <div key={i} className="flex items-center justify-between gap-4">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-3.5 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** Full-page shell shown while a dashboard route's first fetch resolves. */
export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-64" />
      </div>
      <StatGridSkeleton />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 sm:gap-6">
        <ChartSkeleton className="lg:col-span-2" />
        <PanelSkeleton lines={5} />
      </div>
      <TableSkeleton rows={5} />
    </div>
  );
}
