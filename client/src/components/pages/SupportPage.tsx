"use client";

import { useState, useEffect, useCallback } from "react";
import {
  IconLoader2, IconAlertCircle, IconCheck, IconHeadset,
  IconClock, IconCircleCheck, IconCircleX, IconProgress,
} from "@tabler/icons-react";
import { supportAPI, type SupportCategory, type SupportTicket } from "@/lib/api";

const CATEGORIES: { value: SupportCategory; label: string }[] = [
  { value: "TECHNICAL", label: "Technical" },
  { value: "BILLING", label: "Billing / Payment" },
  { value: "KYC", label: "KYC" },
  { value: "ACCOUNT", label: "Account" },
  { value: "OTHER", label: "Other" },
];

const STATUS_META: Record<SupportTicket["status"], { label: string; color: string; bg: string; icon: typeof IconClock }> = {
  OPEN: { label: "Open", color: "text-amber-600", bg: "bg-amber-100", icon: IconClock },
  IN_PROGRESS: { label: "In Progress", color: "text-blue-600", bg: "bg-blue-100", icon: IconProgress },
  RESOLVED: { label: "Resolved", color: "text-emerald-600", bg: "bg-emerald-100", icon: IconCircleCheck },
  CLOSED: { label: "Closed", color: "text-gray-600", bg: "bg-gray-100", icon: IconCircleX },
};

function StatusBadge({ status }: { status: SupportTicket["status"] }) {
  const s = STATUS_META[status];
  const Icon = s.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${s.color} ${s.bg}`}>
      <Icon size={10} /> {s.label}
    </span>
  );
}

export default function SupportPage() {
  const [category, setCategory] = useState<SupportCategory>("TECHNICAL");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);

  const fetchTickets = useCallback(async () => {
    setLoadingTickets(true);
    try {
      const res = await supportAPI.getMyTickets();
      setTickets(res.tickets);
    } catch {
      // silent — ticket history is secondary to the form
    } finally {
      setLoadingTickets(false);
    }
  }, []);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);

  const handleSubmit = async () => {
    if (!subject.trim()) { setError("Please enter a subject"); return; }
    if (!message.trim()) { setError("Please describe your issue"); return; }
    setSubmitting(true);
    setError("");
    setSuccess("");
    try {
      const res = await supportAPI.createTicket({
        category,
        subject: subject.trim(),
        message: message.trim(),
        phone: phone.trim() || undefined,
      });
      setSuccess(res.message);
      setSubject("");
      setMessage("");
      setPhone("");
      setCategory("TECHNICAL");
      await fetchTickets();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to submit request");
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleString("en-US", {
    year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight flex items-center gap-2">
          <IconHeadset className="h-6 w-6 text-brand" /> Support
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Have an issue or question? Send us the details and our team will get back to you within 2-3 working hours.
        </p>
      </div>

      {/* Submit Form */}
      <div className="rounded-2xl border border-border bg-card p-5 sm:p-6 space-y-4">
        {error && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive">
            <IconAlertCircle className="h-3.5 w-3.5 shrink-0" /> {error}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-600 dark:text-emerald-400">
            <IconCheck className="h-3.5 w-3.5 shrink-0" /> {success}
          </div>
        )}

        <div>
          <label className="text-xs font-medium text-muted-foreground">Category *</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as SupportCategory)}
            className="mt-1 w-full rounded-lg border border-border px-4 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/50 transition-all"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground">Subject *</label>
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Briefly describe your issue"
            className="mt-1 w-full rounded-lg border border-border px-4 py-2.5 text-sm placeholder:text-muted-foreground/40 bg-background focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/50 transition-all"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground">Message *</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Explain your issue in detail..."
            rows={5}
            className="mt-1 w-full rounded-lg border border-border px-4 py-2.5 text-sm placeholder:text-muted-foreground/40 bg-background focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/50 transition-all resize-none"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-muted-foreground">Phone Number (optional)</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Add a number if you'd prefer a call back"
            className="mt-1 w-full rounded-lg border border-border px-4 py-2.5 text-sm placeholder:text-muted-foreground/40 bg-background focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/50 transition-all"
          />
          <p className="text-[11px] text-muted-foreground mt-1">
            If provided, our team may contact you directly on this number.
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full rounded-lg btn-glow btn-glow-hover px-5 py-2.5 text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <span className="flex items-center justify-center gap-2">
              <IconLoader2 className="h-4 w-4 animate-spin" /> Submitting...
            </span>
          ) : (
            "Submit Request"
          )}
        </button>

        <p className="text-[11px] text-muted-foreground text-center">
          Our team will get in touch within 2-3 working hours on business days.
        </p>
      </div>

      {/* My Requests */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-5 sm:px-6 py-4 border-b border-border">
          <h2 className="text-base font-semibold text-foreground">My Requests</h2>
        </div>
        {loadingTickets ? (
          <div className="flex items-center justify-center py-10">
            <IconLoader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : tickets.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center px-4">
            <IconHeadset className="h-8 w-8 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">No support requests yet</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {tickets.map((t) => (
              <div key={t.id} className="p-4 sm:p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground truncate">{t.subject}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {CATEGORIES.find((c) => c.value === t.category)?.label || t.category} · {formatDate(t.createdAt)}
                    </p>
                  </div>
                  <StatusBadge status={t.status} />
                </div>
                <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{t.message}</p>
                {t.adminNote && (
                  <div className="mt-2 rounded-lg bg-brand/5 border border-brand/20 px-3 py-2">
                    <p className="text-[11px] font-medium text-brand mb-0.5">Response from support</p>
                    <p className="text-xs text-foreground">{t.adminNote}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
