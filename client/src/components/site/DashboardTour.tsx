"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { driver, type DriveStep, type Driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useSidebar } from "@/components/ui/sidebar";

const TOUR_SEEN_KEY = "orvanta_dashboard_tour_seen";

// Sidebar nav items live inside a mobile Sheet that's closed by default —
// steps targeting them need the sheet opened first, or driver.js has
// nothing visible to highlight on small screens.
const SIDEBAR_STEP_SLUGS = new Set([
  "nav-wallet", "nav-index", "nav-transactions", "nav-kyc", "nav-support", "nav-referral",
]);

function slugFromElement(element: DriveStep["element"]): string | null {
  if (typeof element !== "string") return null;
  const match = element.match(/data-tour="([^"]+)"/);
  return match ? match[1] : null;
}

const steps: DriveStep[] = [
  {
    element: '[data-tour="nav-dashboard"]',
    popover: {
      title: "Welcome to ORVANTA",
      description: "This is your Dashboard — a quick overview of your account. Let's walk through the essentials in under a minute.",
      side: "right",
      align: "start",
    },
  },
  {
    element: '[data-tour="stat-wallet"]',
    popover: {
      title: "Your Wallet",
      description: "This is the money available to invest. Deposit funds here first — you invest and withdraw from this balance.",
      side: "bottom",
      align: "start",
    },
  },
  {
    element: '[data-tour="stat-index"]',
    popover: {
      title: "Your Index Investments",
      description: "Once you invest in a plan, its current value shows up here. You can hold several plans at once — each grows on its own.",
      side: "bottom",
      align: "start",
    },
  },
  {
    element: '[data-tour="stat-bonus"]',
    popover: {
      title: "Your Bonus Balance",
      description: "Referral earnings land here first, separate from your main wallet. Move it to your wallet or withdraw it directly using these buttons.",
      side: "bottom",
      align: "start",
    },
  },
  {
    element: '[data-tour="nav-wallet"]',
    popover: {
      title: "My Wallet",
      description: "Deposit funds (crypto or bank transfer) and withdraw here.",
      side: "right",
      align: "start",
    },
  },
  {
    element: '[data-tour="nav-index"]',
    popover: {
      title: "Index",
      description: "Browse investment plans, see their returns and duration, and invest from here.",
      side: "right",
      align: "start",
    },
  },
  {
    element: '[data-tour="nav-transactions"]',
    popover: {
      title: "Transactions",
      description: "Every deposit, withdrawal, and investment you've made — including fees — is logged here.",
      side: "right",
      align: "start",
    },
  },
  {
    element: '[data-tour="nav-kyc"]',
    popover: {
      title: "KYC Verification",
      description: "Verify your identity once — it unlocks investing and keeps your account secure.",
      side: "right",
      align: "start",
    },
  },
  {
    element: '[data-tour="nav-support"]',
    popover: {
      title: "Support",
      description: "Have a question or an issue? Submit a ticket here and our team will get back to you.",
      side: "right",
      align: "start",
    },
  },
  {
    element: '[data-tour="nav-referral"]',
    popover: {
      title: "Invite & Earn",
      description: "Share your referral link with friends. When they invest, you earn a commission across up to 5 levels — credited straight to your Bonus balance.",
      side: "right",
      align: "start",
    },
  },
];

/**
 * One-time guided tour of the client Dashboard, shown after a user's first
 * login. Skips entirely if already seen (localStorage flag) or if this
 * isn't the Dashboard route. Renders inside SidebarProvider so it can open
 * the mobile sidebar sheet before highlighting nav items that live inside
 * it, and close it again once the tour moves past them.
 */
export function DashboardTour() {
  const pathname = usePathname();
  const { isMobile, setOpenMobile } = useSidebar();

  useEffect(() => {
    if (pathname !== "/dashboard") return;
    if (typeof window === "undefined") return;
    if (localStorage.getItem(TOUR_SEEN_KEY)) return;

    let tourInstance: Driver | null = null;

    // Give the dashboard's own data fetch + layout a moment to settle so
    // every data-tour target actually exists in the DOM before driver.js
    // tries to attach popovers to them.
    const timer = setTimeout(() => {
      if (isMobile) setOpenMobile(true);

      // Re-check availability after the mobile sheet (if any) has had a
      // moment to mount its content.
      const checkTimer = setTimeout(() => {
        const availableSteps = steps.filter((s) =>
          typeof s.element === "string" ? document.querySelector(s.element) : true
        );
        if (availableSteps.length === 0) {
          if (isMobile) setOpenMobile(false);
          return;
        }

        tourInstance = driver({
          showProgress: true,
          allowClose: true,
          smoothScroll: true,
          stagePadding: 6,
          overlayColor: "rgba(8, 15, 13, 0.75)",
          popoverClass: "orvanta-driver-popover",
          steps: availableSteps,
          onHighlightStarted: (element, step) => {
            if (!isMobile) return;
            const slug = slugFromElement(step.element);
            if (slug && SIDEBAR_STEP_SLUGS.has(slug)) setOpenMobile(true);
          },
          onDestroyed: () => {
            localStorage.setItem(TOUR_SEEN_KEY, "1");
            if (isMobile) setOpenMobile(false);
          },
        });
        tourInstance.drive();
      }, isMobile ? 350 : 0);

      return () => clearTimeout(checkTimer);
    }, 900);

    return () => {
      clearTimeout(timer);
      tourInstance?.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return null;
}
