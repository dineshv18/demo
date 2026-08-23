"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  IconLoader2, IconAlertCircle, IconCheck, IconHeadset,
  IconClock, IconCircleCheck, IconCircleX, IconProgress,
  IconUpload, IconX, IconPhoto,
} from "@tabler/icons-react";
import { supportAPI, type SupportCategory, type SupportTicket } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CATEGORIES: { value: SupportCategory; label: string }[] = [
  { value: "TECHNICAL", label: "Technical" },
  { value: "BILLING", label: "Billing / Payment" },
  { value: "KYC", label: "KYC" },
  { value: "ACCOUNT", label: "Account" },
  { value: "OTHER", label: "Other" },
];

const STATUS_META: Record<SupportTicket["status"], { label: string; color: string; bg: string; icon: typeof IconClock }> = {
  OPEN: { label: "Open", color: "text-amber-600", bg: "bg-amber-100", icon: IconClock },
  IN_PROGRESS: { label: "In Progress", color: "text-teal-600", bg: "bg-teal-100", icon: IconProgress },
  RESOLVED: { label: "Resolved", color: "text-emerald-600", bg: "bg-emerald-100", icon: IconCircleCheck },
  CLOSED: { label: "Closed", color: "text-gray-600", bg: "bg-gray-100", icon: IconCircleX },
};

const MAX_SCREENSHOTS = 3;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

function StatusBadge({ status }: { status: SupportTicket["status"] }) {
  const s = STATUS_META[status];
  const Icon = s.icon;
  return (
    <Badge variant="outline" className={`gap-1 border-transparent font-semibold ${s.color} ${s.bg}`}>
      <Icon size={10} /> {s.label}
    </Badge>
  );
}

interface ScreenshotFile {
  file: File;
  preview: string;
}

export default function SupportPage() {
  const [category, setCategory] = useState<SupportCategory>("TECHNICAL");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [screenshots, setScreenshots] = useState<ScreenshotFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // Revoke object URLs on unmount / when replaced to avoid leaking memory.
  useEffect(() => {
    return () => { screenshots.forEach((s) => URL.revokeObjectURL(s.preview)); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addFiles = (fileList: FileList | File[]) => {
    const incoming = Array.from(fileList);
    const room = MAX_SCREENSHOTS - screenshots.length;
    if (room <= 0) {
      setError(`You can attach up to ${MAX_SCREENSHOTS} screenshots`);
      return;
    }
    const accepted: ScreenshotFile[] = [];
    for (const file of incoming) {
      if (accepted.length >= room) break;
      if (!file.type.startsWith("image/")) {
        setError("Only image files are allowed");
        continue;
      }
      if (file.size > MAX_FILE_SIZE) {
        setError("Each screenshot must be under 5MB");
        continue;
      }
      accepted.push({ file, preview: URL.createObjectURL(file) });
    }
    if (accepted.length > 0) {
      setError("");
      setScreenshots((prev) => [...prev, ...accepted]);
    }
  };

  const removeScreenshot = (index: number) => {
    setScreenshots((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files);
  };

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
        screenshots: screenshots.map((s) => s.file),
      });
      setSuccess(res.message);
      setSubject("");
      setMessage("");
      setCategory("TECHNICAL");
      screenshots.forEach((s) => URL.revokeObjectURL(s.preview));
      setScreenshots([]);
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
      <Card className="p-5 sm:p-6 gap-4">
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

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Category *</Label>
          <Select value={category} onValueChange={(v) => setCategory(v as SupportCategory)}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Subject *</Label>
          <Input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Briefly describe your issue"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Message *</Label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Explain your issue in detail..."
            rows={5}
            className="resize-none"
          />
        </div>

        <div>
          <Label className="text-xs font-medium text-muted-foreground">
            Screenshots (optional, up to {MAX_SCREENSHOTS})
          </Label>

          {screenshots.length > 0 && (
            <div className="mt-2 grid grid-cols-3 gap-2">
              {screenshots.map((s, i) => (
                <div key={i} className="relative group rounded-lg overflow-hidden border border-border aspect-square">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={s.preview} alt={`Screenshot ${i + 1}`} className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeScreenshot(i)}
                    className="absolute top-1 right-1 grid h-5 w-5 place-items-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                  >
                    <IconX className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {screenshots.length < MAX_SCREENSHOTS && (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleDrop}
              className={`mt-2 flex flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed px-4 py-6 text-center cursor-pointer transition-colors ${
                dragActive ? "border-brand bg-brand/5" : "border-border hover:border-brand/40 hover:bg-accent/40"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ""; }}
              />
              {screenshots.length === 0 ? (
                <IconUpload className="h-5 w-5 text-muted-foreground/60" />
              ) : (
                <IconPhoto className="h-5 w-5 text-muted-foreground/60" />
              )}
              <p className="text-xs text-muted-foreground">
                <span className="font-medium text-brand">Click to upload</span> or drag and drop
              </p>
              <p className="text-[10px] text-muted-foreground/70">
                PNG, JPG, WEBP up to 5MB — {MAX_SCREENSHOTS - screenshots.length} more allowed
              </p>
            </div>
          )}
        </div>

        <Button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full gap-2 btn-glow btn-glow-hover"
        >
          {submitting ? (
            <>
              <IconLoader2 className="h-4 w-4 animate-spin" /> Submitting...
            </>
          ) : (
            "Submit Request"
          )}
        </Button>

        <p className="text-[11px] text-muted-foreground text-center">
          Our team will get in touch within 2-3 working hours on business days.
        </p>
      </Card>

      {/* My Requests */}
      <Card className="overflow-hidden p-0 gap-0">
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
                {t.screenshotUrls?.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    {t.screenshotUrls.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block h-12 w-12 rounded-lg overflow-hidden border border-border hover:border-brand/40 transition-colors">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={`Screenshot ${i + 1}`} className="h-full w-full object-cover" />
                      </a>
                    ))}
                  </div>
                )}
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
      </Card>
    </div>
  );
}
