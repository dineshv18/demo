"use client";

import { IconShieldCheck } from "@tabler/icons-react";

import { Section, Reveal } from "../site/primitives";
import { PortfolioMockup } from "../site/PortfolioMockup";
import { Hero } from "@/components/marketing/Hero";
import { CTASection } from "@/components/marketing/CTASection";
import {
  FactStrip,
  SplitSection,
  StatementSection,
  StepGrid,
} from "@/components/marketing/sections";
import { BentoFeatures } from "@/components/marketing/BentoFeatures";
import { WhatYouGet } from "@/components/marketing/WhatYouGet";
import { onboardingSteps, structuralFacts } from "@/components/marketing/home-content";

const marqueeItems = [
  "KYC-Verified Onboarding",
  "Transparent Tiers",
  "Real-Time Dashboard",
  "5-Level Referrals",
  "Crypto & Bank Wallet",
  "Published Fee Structure",
  "Role-Based Admin Security",
  "Real Support Desk",
];

export default function Home() {
  return (
    <>
      <Hero />

      {/* TRUST BAR */}
      <div className="relative border-y border-border bg-card/40 backdrop-blur-sm">
        <div className="no-x-overflow mx-auto max-w-7xl px-5 py-6 lg:px-8">
          <div className="animate-marquee flex gap-14 whitespace-nowrap">
            {[0, 1].map((k) => (
              <div
                key={k}
                aria-hidden={k === 1}
                className="flex items-center gap-14 text-sm text-muted-foreground"
              >
                {marqueeItems.map((t) => (
                  <span
                    key={t}
                    className="inline-flex items-center gap-2.5 font-medium tracking-wide"
                  >
                    <span className="size-1 rounded-full bg-brand" />
                    {t}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* STRUCTURAL FACTS */}
      <FactStrip facts={structuralFacts} />

      {/* HOW IT WORKS */}
      <StepGrid
        id="how-it-works"
        eyebrow="How It Works"
        title={
          <>
            Four steps, <span className="text-gradient">no surprises.</span>
          </>
        }
        description="The whole path from signing up to tracking your first position — nothing hidden between the steps."
        steps={onboardingSteps}
      />

      {/* HOW IT&apos;S BUILT */}
      <BentoFeatures id="how-its-built" />

      {/* YOUR DASHBOARD */}
      <SplitSection
        id="your-dashboard"
        eyebrow="Your Dashboard"
        title={
          <>
            Wallet, Index, and <span className="text-gradient">bonus balance</span> —
            one screen.
          </>
        }
        description="No juggling statements or spreadsheets. Your available balance, active Index position, and referral earnings update together in real time, the moment you log in."
        cta={{ href: "/register", label: "Open Your Dashboard" }}
        visual={<PortfolioMockup />}
      />

      {/* WHAT YOU GET */}
      <WhatYouGet id="what-you-get" />

      {/* TRUST STATEMENT */}
      <StatementSection
        icon={IconShieldCheck}
        lead="Every account is identity-verified before a single dollar moves —"
        accent="that's the baseline, not a feature."
        body="Segregated wallet balances, role-based admin controls, and a fully auditable trail on every deposit, allocation and referral payout — the operational discipline serious capital requires, applied by default."
      />

      {/* CTA */}
      <Section>
        <Reveal>
          <CTASection
            title={
              <>
                Your ORVANTA account is{" "}
                <span className="text-gold-400">one step away</span>.
              </>
            }
            description="Complete verification, fund your wallet, and start investing with full visibility into every tier, balance, and transaction."
          />
        </Reveal>
      </Section>
    </>
  );
}
