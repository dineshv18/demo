import {
  IconChartLine,
  IconCircleCheck,
  IconCoin,
  IconFileText,
  IconLayersIntersect,
  IconShieldCheck,
  IconStack2,
  IconUsers,
  IconWallet,
  type IconProps,
} from "@tabler/icons-react";

type TablerIcon = React.ComponentType<IconProps>;

/**
 * Copy for the public pages, kept beside the shared section components so the
 * same lists can be reused across Home, About and Platform without being
 * retyped. Nothing here is a performance figure or a user count — only things
 * the platform actually enforces.
 */

export const structuralFacts: {
  icon: TablerIcon;
  value: string;
  label: string;
  detail: string;
}[] = [
  {
    icon: IconShieldCheck,
    value: "KYC",
    label: "Verified accounts",
    detail: "Identity checks clear before any account can move funds.",
  },
  {
    icon: IconStack2,
    value: "Published",
    label: "Tier terms",
    detail: "Minimums, maximums and maturity shown before you commit.",
  },
  {
    icon: IconCoin,
    value: "5 levels",
    label: "Referral depth",
    detail: "Commission tracked automatically across your network.",
  },
  {
    icon: IconFileText,
    value: "Full",
    label: "Transaction history",
    detail: "Every deposit, allocation and payout logged and visible.",
  },
];

/** The onboarding sequence the product actually enforces, in order. */
export const onboardingSteps: { icon: TablerIcon; title: string; desc: string }[] = [
  {
    icon: IconShieldCheck,
    title: "Verify your identity",
    desc: "Complete KYC once. Until it clears, no funds move — that gate protects you as much as the platform.",
  },
  {
    icon: IconWallet,
    title: "Fund your wallet",
    desc: "Deposit by crypto or bank transfer. Your wallet balance stays separate from anything you've allocated.",
  },
  {
    icon: IconStack2,
    title: "Choose an Index tier",
    desc: "Each tier publishes its minimum, maximum and maturity period in your dashboard before you commit.",
  },
  {
    icon: IconChartLine,
    title: "Track it in real time",
    desc: "Watch your position, wallet and referral commission update together from a single dashboard.",
  },
];

/** The four things that structurally define the platform. */
export const capabilities: { icon: TablerIcon; title: string; desc: string }[] = [
  {
    icon: IconShieldCheck,
    title: "KYC-verified onboarding",
    desc: "No account moves funds — deposit, invest, or withdraw — until identity verification clears. Every user on the platform has been checked.",
  },
  {
    icon: IconWallet,
    title: "Wallet-first deposits",
    desc: "Fund by crypto or bank transfer into a wallet balance that's kept separate from what you've allocated into the Index. You decide when it moves.",
  },
  {
    icon: IconStack2,
    title: "Published Index tiers",
    desc: "Every tier states its minimum, maximum and maturity period up front, in your dashboard, before you commit a dollar.",
  },
  {
    icon: IconUsers,
    title: "5-level referral program",
    desc: "Bring verified investors onto the platform and earn commission across five referral levels — structure disclosed, not hidden in fine print.",
  },
  {
    icon: IconLayersIntersect,
    title: "Transparent fee structure",
    desc: "Every fee applied to your account is published and visible before you commit — nothing deducted without disclosure.",
  },
  {
    icon: IconCircleCheck,
    title: "Auditable transaction trail",
    desc: "Deposits, allocations and referral payouts are all recorded, timestamped and visible in your own account history.",
  },
];
