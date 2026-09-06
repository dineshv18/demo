"use client";

import { Reveal, Section } from "./primitives";
import { CTASection } from "@/components/marketing/CTASection";

/**
 * Shared closing banner for public pages. Now a thin wrapper over the
 * marketing CTA so every page ends on the same navy/gold panel.
 */
export function CtaBanner() {
  return (
    <Section className="!py-16">
      <Reveal>
        <CTASection
          eyebrow="Instant setup"
          title="Ready to start investing?"
          description="Create your ORVANTA account, complete verification, and choose the Index tier that fits your goals — with every term published upfront."
          primary={{ href: "/register", label: "Get Started" }}
          secondary={{ href: "/platform", label: "Explore Platform" }}
        />
      </Reveal>
    </Section>
  );
}
