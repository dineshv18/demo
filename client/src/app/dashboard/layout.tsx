"use client";

import DashboardLayout from "@/components/site/DashboardLayout";

export default function DashboardLayoutWrapper({ children }: { children: React.ReactNode }) {
  return <DashboardLayout>{children}</DashboardLayout>;
}
