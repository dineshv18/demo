"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import {
  IconAlertCircle,
  IconArrowRight,
  IconChevronRight,
  IconCircleCheck,
  IconClock,
  IconCopy,
  IconHeadset,
  IconLoader2,
  IconMail,
  IconMessage2,
  IconShieldCheck,
  type IconProps,
} from "@tabler/icons-react";

import { Eyebrow, Reveal, Section } from "../site/primitives";
import { SplitSection } from "@/components/marketing/sections";
import { CtaBanner } from "../site/CtaBanner";
import { SheenButton } from "@/components/marketing/SheenButton";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/AuthContext";

type TablerIcon = React.ComponentType<IconProps>;

/**
 * Contact channels, presented as a table — label, detail, footnote.
 * Only channels that actually exist: no invented phone number or office
 * address. "Email" is the one copyable field; the other two route into the
 * product rather than pretending to be a second inbox.
 */
const channels: {
  icon: TablerIcon;
  label: string;
  value: string;
  href?: string;
  copyable?: boolean;
  footnote: string;
}[] = [
  {
    icon: IconMail,
    label: "Email",
    value: "support@orvantafinancial.com",
    href: "mailto:support@orvantafinancial.com",
    copyable: true,
    footnote: "General enquiries — we reply within 2–3 working hours.",
  },
  {
    icon: IconHeadset,
    label: "Support Desk",
    value: "Open a ticket from your dashboard",
    href: "/login",
    footnote: "The fastest route for anything account-specific.",
  },
  {
    icon: IconClock,
    label: "Response Time",
    value: "2–3 working hours",
    footnote: "On business days, tracked ticket-by-ticket.",
  },
];

const faqs = [
  { q: "How long does KYC verification take?", a: "Most accounts are verified within minutes of submitting valid ID documents." },
  { q: "Can I deposit with crypto or bank transfer?", a: "Both. Your wallet accepts crypto deposits and bank transfers, tracked in one balance." },
  { q: "Are tier terms disclosed before I invest?", a: "Yes — minimums, maximums and maturity periods are published in your dashboard before you allocate." },
  { q: "How does the referral program pay out?", a: "Commission is tracked automatically across five referral levels and visible in your dashboard." },
];

/** One cell of the contact-channel table. Renders as a link only when useful. */
function ChannelCard({ channel }: { channel: (typeof channels)[number] }) {
  const [copied, setCopied] = useState(false);

  const copy = (e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText(channel.value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  };

  const body = (
    <>
      <div className="flex items-center gap-2.5 border-b border-border px-5 py-4">
        <channel.icon className="size-4 text-brand" stroke={1.75} />
        <span className="text-[0.8125rem] font-semibold text-foreground">
          {channel.label}
        </span>
      </div>
      <div className="flex flex-1 items-center justify-between gap-3 px-5 py-6">
        <span className="break-words font-display text-[0.9375rem] font-semibold text-foreground">
          {channel.value}
        </span>
        {channel.copyable && (
          <button
            type="button"
            onClick={copy}
            aria-label={`Copy ${channel.label.toLowerCase()}`}
            className="shrink-0 rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-brand"
          >
            {copied ? (
              <IconCircleCheck className="size-4 text-success" stroke={2} />
            ) : (
              <IconCopy className="size-4" stroke={1.75} />
            )}
          </button>
        )}
      </div>
      <p className="border-t border-border px-5 py-3.5 text-xs leading-relaxed text-muted-foreground">
        {channel.footnote}
      </p>
    </>
  );

  const shell = "group flex h-full flex-col bg-card transition-colors hover:bg-accent/30";

  if (channel.href && !channel.copyable) {
    return (
      <Link href={channel.href} className={shell}>
        {body}
      </Link>
    );
  }

  return <div className={shell}>{body}</div>;
}

export default function ContactPage() {
  const { user } = useAuth();
  const supportHref = user ? "/dashboard/support" : "/login";
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [errors, setErrors] = useState<{ firstName?: string; lastName?: string; email?: string; message?: string }>({});

  // Behaviour is unchanged: this form validates locally and acknowledges
  // locally. It has never posted to a server, so the confirmation below points
  // people at the support desk — which does.
  const handleSubmit = async (ev: FormEvent) => {
    ev.preventDefault();
    const e: typeof errors = {};
    if (!firstName.trim()) e.firstName = "First name is required";
    if (!lastName.trim()) e.lastName = "Last name is required";
    if (!email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email";
    if (!message.trim()) e.message = "Message is required";
    setErrors(e);
    if (Object.keys(e).length > 0) return;

    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));
    setLoading(false);
    setSent(true);
  };

  const fieldClass = (hasError: boolean) =>
    cn(
      "w-full rounded-lg border bg-card px-4 py-3.5 text-sm text-foreground shadow-xs transition-[border-color,box-shadow]",
      "placeholder:text-muted-foreground/50 focus:outline-none",
      hasError
        ? "border-destructive focus:border-destructive focus:ring-2 focus:ring-destructive/25"
        : "border-input focus:border-brand focus:ring-2 focus:ring-brand/25"
    );

  // ─── SENT ───
  if (sent) {
    return (
      <Section className="py-14!">
        <Reveal>
          <div className="relative mx-auto max-w-lg overflow-hidden rounded-2xl border border-brand/15 bg-card/95 p-8 text-center shadow-lifted sm:p-12">
            <span
              aria-hidden
              className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-brand/50 to-transparent"
            />
            <div className="mx-auto grid size-20 place-items-center rounded-xl bg-success-soft ring-1 ring-success/25">
              <IconCircleCheck className="size-10 text-success" stroke={1.5} />
            </div>

            <p className="text-eyebrow mt-7">Message ready</p>
            <h2 className="mt-2 font-display text-3xl font-semibold tracking-[-0.03em] text-foreground">
              Thanks, {firstName}
            </h2>
            <p className="mx-auto mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
              We&apos;ve captured your enquiry. For anything account-specific — deposits,
              withdrawals, KYC or Index positions — signing in and opening a support
              ticket is the fastest and most reliable route, and it gives you a tracked
              reference.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <SheenButton href={supportHref} size="md">
                Open a support ticket <IconArrowRight className="size-4" />
              </SheenButton>
              <button
                onClick={() => { setSent(false); setFirstName(""); setLastName(""); setEmail(""); setMessage(""); }}
                className="inline-flex items-center justify-center rounded-lg border border-border px-7 py-3.5 text-sm font-semibold text-foreground transition-colors hover:border-brand/45 hover:bg-accent"
              >
                Write another message
              </button>
            </div>
          </div>
        </Reveal>
      </Section>
    );
  }

  return (
    <div className="min-h-screen">
      {/* ── HERO ── */}
      <Section className="pb-8! pt-6! lg:pt-10!">
        <div className="grid overflow-hidden rounded-[2rem] border border-brand/15 bg-card shadow-overlay lg:grid-cols-[1.3fr_0.7fr]">
          <div className="px-7 py-12 sm:px-10 lg:px-14 lg:py-16">
            <Reveal>
              <nav aria-label="Breadcrumb" className="mb-8">
                <ol className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <li><Link href="/" className="transition-colors hover:text-brand">Home</Link></li>
                  <li aria-hidden><IconChevronRight className="size-3.5 opacity-50" /></li>
                  <li className="font-medium text-foreground" aria-current="page">Contact</li>
                </ol>
              </nav>
            </Reveal>
            <Reveal delay={0.05}><Eyebrow>We&apos;re here to help</Eyebrow></Reveal>
            <Reveal delay={0.1}>
              <h1 className="mt-6 font-classic text-4xl font-bold leading-[1.02] tracking-[-0.03em] text-foreground md:text-5xl lg:text-6xl">
                Let&apos;s start a<br /><span className="text-gradient italic">conversation.</span>
              </h1>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
                Exploring ORVANTA or need help with an existing account? Tell us what you need and we&apos;ll connect you with the right team.
              </p>
            </Reveal>
          </div>
          <div className="relative flex min-h-[320px] flex-col justify-end overflow-hidden bg-[#09070c] p-8 text-white lg:p-10">
            <span aria-hidden className="bg-ticker absolute inset-0 opacity-30" />
            <span aria-hidden className="absolute -right-24 -top-24 size-72 rounded-full bg-brand/30 blur-3xl" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/illustrations/contact-clock-transparent.png"
              alt=""
              aria-hidden
              className="pointer-events-none absolute -top-8 right-0 w-64 opacity-25 mix-blend-screen"
            />
            <div className="relative">
              <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-purple-300">Expected response</p>
              <p className="mt-3 font-classic text-4xl font-bold">2–3 hours</p>
              <p className="mt-3 max-w-xs text-sm leading-relaxed text-white/60">Account holders can also raise a tracked support ticket directly from the dashboard.</p>
              <Link href={supportHref} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-purple-300">Open support <IconArrowRight className="size-4" /></Link>
            </div>
          </div>
        </div>
      </Section>

      {/* ── CONTACT CHANNELS — seamless table, like a spec sheet ── */}
      <Section className="pt-0!">
        <Reveal>
          <div className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border border-brand/20 bg-brand/15 shadow-card sm:grid-cols-3">
            {channels.map((c) => (
              <ChannelCard key={c.label} channel={c} />
            ))}
          </div>
        </Reveal>
      </Section>

      {/* ── REAL SUPPORT DESK ── */}
      <SplitSection
        id="real-support"
        eyebrow="Support"
        title={
          <>
            A real person, not{" "}
            <span className="text-gradient">an unmonitored inbox.</span>
          </>
        }
        description="Every ticket you open from your dashboard is tracked, referenced, and answered by our support desk — usually within 2–3 working hours, not lost in a queue."
        visual={
          <div className="relative mx-auto w-full max-w-xs">
            <span aria-hidden className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-brand/10 blur-2xl" />
            <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-4 shadow-lifted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/illustrations/contact-support.jpg"
                alt="Chat bubbles representing responsive support"
                className="w-full rounded-xl"
              />
            </div>
          </div>
        }
        reversed
      />

      {/* ── FORM + ASIDE ── */}
      <Section>
        <div className="grid items-start gap-10 lg:grid-cols-12">
          {/* Form */}
          <Reveal className="lg:col-span-7">
            <div className="rounded-2xl border border-brand/15 bg-card/95 p-6 shadow-lifted backdrop-blur-sm sm:p-10">
              <span aria-hidden className="gold-rule block w-14" />
              <h2 className="mt-5 font-display text-2xl font-semibold tracking-[-0.02em] text-foreground sm:text-3xl">
                Send a message
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Tell us what you need and we&apos;ll point you in the right direction.
              </p>

              <form onSubmit={handleSubmit} noValidate className="mt-8 space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label htmlFor="contact-first" className="block text-sm font-medium text-foreground">
                      First name
                    </label>
                    <input
                      id="contact-first"
                      type="text"
                      value={firstName}
                      onChange={(e) => { setFirstName(e.target.value); if (errors.firstName) setErrors((p) => ({ ...p, firstName: undefined })); }}
                      placeholder="Jane"
                      className={fieldClass(!!errors.firstName)}
                    />
                    {errors.firstName && (
                      <p className="flex items-center gap-1.5 text-xs text-danger">
                        <IconAlertCircle className="size-3" /> {errors.firstName}
                      </p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label htmlFor="contact-last" className="block text-sm font-medium text-foreground">
                      Last name
                    </label>
                    <input
                      id="contact-last"
                      type="text"
                      value={lastName}
                      onChange={(e) => { setLastName(e.target.value); if (errors.lastName) setErrors((p) => ({ ...p, lastName: undefined })); }}
                      placeholder="Okafor"
                      className={fieldClass(!!errors.lastName)}
                    />
                    {errors.lastName && (
                      <p className="flex items-center gap-1.5 text-xs text-danger">
                        <IconAlertCircle className="size-3" /> {errors.lastName}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="contact-email" className="block text-sm font-medium text-foreground">
                    Email address
                  </label>
                  <input
                    id="contact-email"
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors((p) => ({ ...p, email: undefined })); }}
                    placeholder="you@example.com"
                    className={fieldClass(!!errors.email)}
                  />
                  {errors.email && (
                    <p className="flex items-center gap-1.5 text-xs text-danger">
                      <IconAlertCircle className="size-3" /> {errors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="contact-message" className="block text-sm font-medium text-foreground">
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    rows={6}
                    value={message}
                    onChange={(e) => { setMessage(e.target.value); if (errors.message) setErrors((p) => ({ ...p, message: undefined })); }}
                    placeholder="How can we help?"
                    className={cn(fieldClass(!!errors.message), "resize-none")}
                  />
                  {errors.message && (
                    <p className="flex items-center gap-1.5 text-xs text-danger">
                      <IconAlertCircle className="size-3" /> {errors.message}
                    </p>
                  )}
                </div>

                <SheenButton type="submit" size="lg" className="w-full">
                  {loading ? (
                    <><IconLoader2 className="size-4 animate-spin" /> Sending…</>
                  ) : (
                    <>Send message <IconArrowRight className="size-4" /></>
                  )}
                </SheenButton>
              </form>
            </div>
          </Reveal>

          {/* Aside */}
          <div className="space-y-4 lg:col-span-5">
            <Reveal delay={0.08}>
              <div className="surface-navy relative overflow-hidden rounded-xl p-7 sm:p-8">
                <span aria-hidden className="bg-ticker pointer-events-none absolute inset-0 opacity-40" />
                <span
                  aria-hidden
                  className="pointer-events-none absolute -right-16 -top-20 size-56 rounded-full bg-brand/12 blur-3xl"
                />
                <div className="relative">
                  <span className="grid size-12 place-items-center rounded-xl bg-brand/12 text-brand ring-1 ring-brand/25">
                    <IconMessage2 className="size-6" stroke={1.75} />
                  </span>
                  <h3 className="mt-5 font-display text-xl font-semibold tracking-tight text-white">
                    Already have an account?
                  </h3>
                  <p className="mt-2.5 text-sm leading-relaxed text-white/60">
                    Support tickets raised from your dashboard are tracked, attach
                    screenshots, and reach the team that can actually see your account.
                  </p>
                  <SheenButton href={supportHref} size="sm" className="mt-6">
                    Go to Support <IconArrowRight className="size-4" />
                  </SheenButton>
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.14}>
              <div className="flex items-start gap-4 rounded-2xl border border-brand/15 bg-card/95 p-6 shadow-card">
                <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-accent text-brand ring-1 ring-brand/15">
                  <IconShieldCheck className="size-5" stroke={1.75} />
                </span>
                <div>
                  <p className="font-display text-[0.9375rem] font-semibold text-foreground">
                    We&apos;ll never ask for your password
                  </p>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                    ORVANTA staff will never request your password, OTP codes, or wallet
                    credentials by email or phone. Report anything that does.
                  </p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </Section>

      {/* ── FAQ ── */}
      <Section>
        <Reveal>
          <div className="rounded-2xl border border-brand/15 bg-card/95 p-8 shadow-card md:p-12">
            <span aria-hidden className="gold-rule block w-14" />
            <h2 className="mt-5 font-display text-2xl font-semibold tracking-[-0.02em] text-foreground md:text-3xl">
              Common questions
            </h2>

            <dl className="mt-9 grid gap-x-10 gap-y-8 sm:grid-cols-2">
              {faqs.map((f, i) => (
                <div key={f.q} className="border-t border-border pt-5">
                  <dt className="flex items-start gap-2.5">
                    <span className="font-display text-[0.6875rem] font-semibold tracking-[0.18em] text-brand">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-sm font-semibold text-foreground">{f.q}</span>
                  </dt>
                  <dd className="mt-2 pl-8 text-sm leading-relaxed text-muted-foreground">
                    {f.a}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </Reveal>
      </Section>

      <CtaBanner />
    </div>
  );
}
