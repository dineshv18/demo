"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { driver, type DriveStep } from "driver.js";
import "driver.js/dist/driver.css";

const TOUR_SEEN_KEY = "orvanta_dashboard_tour_seen";

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
];

/**
 * One-time guided tour of the client Dashboard, shown after a user's first
 * login. Skips entirely if already seen (localStorage flag) or if this
 * isn't the Dashboard route (so it never fires mid-tour navigation issues
 * on other pages).
 */
export function DashboardTour() {
  const pathname = usePathname();

  useEffect(() => {
    if (pathname !== "/dashboard") return;
    if (typeof window === "undefined") return;
    if (localStorage.getItem(TOUR_SEEN_KEY)) return;

    // Give the dashboard's own data fetch + layout a moment to settle so
    // every data-tour target actually exists in the DOM before driver.js
    // tries to attach popovers to them.
    const timer = setTimeout(() => {
      const availableSteps = steps.filter((s) =>
        typeof s.element === "string" ? document.querySelector(s.element) : true
      );
      if (availableSteps.length === 0) return;

      const tour = driver({
        showProgress: true,
        allowClose: true,
        overlayColor: "rgba(16, 33, 29, 0.65)",
        popoverClass: "orvanta-driver-popover",
        steps: availableSteps,
        onDestroyed: () => {
          localStorage.setItem(TOUR_SEEN_KEY, "1");
        },
      });
      tour.drive();
    }, 900);

    return () => clearTimeout(timer);
  }, [pathname]);

  return null;
}
