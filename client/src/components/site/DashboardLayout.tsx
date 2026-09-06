"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/AuthContext";
import InvestmentBasePopup, { useInvestmentBasePopup } from "@/components/site/InvestmentBasePopup";
import { DashboardTour, triggerDashboardTour } from "@/components/site/DashboardTour";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { PageTransition } from "@/components/shared/motion";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { BrandMonogram } from "@/components/shared/BrandMark";

/** Branded hold while the session is being restored from the stored token. */
function AuthLoading() {
  return (
    <div className="flex h-svh flex-col items-center justify-center gap-4 bg-background">
      <BrandMonogram className="size-12 animate-pulse-glow rounded-2xl text-lg" />
      <div className="h-0.5 w-28 overflow-hidden rounded-full bg-muted">
        <span className="block h-full w-1/2 animate-marquee rounded-full bg-brand" />
      </div>
      <p className="text-eyebrow">Securing your session</p>
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading } = useAuth();
  const { show: showInvestmentPopup, close: closeInvestmentPopup } = useInvestmentBasePopup();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) return <AuthLoading />;

  if (!user) return null;

  return (
    <>
      <SidebarProvider className="h-svh overflow-hidden">
        <DashboardSidebar />
        <SidebarInset className="min-w-0">
          <DashboardHeader onStartTour={triggerDashboardTour} />
          <div className="no-x-overflow flex-1 overflow-y-auto bg-background">
            <PageTransition className="mx-auto w-full max-w-400 p-4 sm:p-6 lg:p-8">
              {children}
            </PageTransition>
          </div>
        </SidebarInset>
        <DashboardTour />
      </SidebarProvider>
      {showInvestmentPopup && <InvestmentBasePopup onClose={closeInvestmentPopup} />}
    </>
  );
}
