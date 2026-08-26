import { useState, useEffect, useCallback } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  IconLayoutDashboard,
  IconUsers,
  IconSettings,
  IconLogout,
  IconShield,
  IconUserCircle,
  IconActivity,
  IconFile,
  IconUserCheck,
  IconWallet,
  IconHeadset,
  IconChartLine,
  IconArrowsLeftRight,
} from "@tabler/icons-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "../components/ui/sidebar";
import { Separator } from "../components/ui/separator";
import ProfileMenu from "../components/ProfileMenu";

const allNavItems = [
  { slug: "dashboard", to: "/dashboard", label: "Dashboard", icon: IconLayoutDashboard },
  { slug: "admins", to: "/dashboard/admins", label: "Admins", icon: IconUserCircle },
  { slug: "roles", to: "/dashboard/roles", label: "Roles", icon: IconShield },
  { slug: "pages", to: "/dashboard/pages", label: "Pages", icon: IconFile },
  { slug: "users", to: "/dashboard/users", label: "Users", icon: IconUsers },
  { slug: "kyc", to: "/dashboard/kyc", label: "KYC Verification", icon: IconUserCheck },
  { slug: "payments", to: "/dashboard/payments", label: "Payment Requests", icon: IconWallet },
  { slug: "index-settings", to: "/dashboard/index-settings", label: "Index Settings", icon: IconChartLine },
  { slug: "index-investments", to: "/dashboard/index-investments", label: "Index Investments", icon: IconChartLine },
  { slug: "internal-transfers", to: "/dashboard/internal-transfers", label: "Internal Transaction", icon: IconArrowsLeftRight },
  { slug: "support", to: "/dashboard/support", label: "Support Team", icon: IconHeadset },
  { slug: "support-tickets", to: "/dashboard/support-tickets", label: "Support Tickets", icon: IconHeadset },
  { slug: "platform-wallet", to: "/dashboard/platform-wallet", label: "Platform Wallet", icon: IconWallet },
  { slug: "activity", to: "/dashboard/activity", label: "Activity Logs", icon: IconActivity },
  { slug: "referrals", to: "/dashboard/referrals", label: "Referral Settings", icon: IconUsers },
  { slug: "settings", to: "/dashboard/settings", label: "Settings", icon: IconSettings },
];

function AppSidebar({ pendingCounts }: { pendingCounts: { kyc: number; payments: number; supportTickets: number } }) {
  const { user, logout, canView } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { setOpenMobile } = useSidebar();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  // Filter nav items by RBAC — jo pages role ko assign hain wahi dikhenge
  const navItems = allNavItems.filter((item) => canView(item.slug));

  return (
    <Sidebar collapsible="icon">
      {/* Logo */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <NavLink to="/dashboard" onClick={() => setOpenMobile(false)}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-[#10211D] text-white font-bold text-sm shadow-lg shadow-[#10211D]/25">
                  O
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-bold tracking-tight">ORVANTA</span>
                  <span className="truncate text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                    Admin Panel
                  </span>
                </div>
              </NavLink>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Nav */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const pendingCount = item.slug === "kyc" ? pendingCounts.kyc
                  : item.slug === "payments" ? pendingCounts.payments
                  : item.slug === "support-tickets" ? pendingCounts.supportTickets : 0;
                return (
                <SidebarMenuItem key={item.to}>
                  <SidebarMenuButton
                    asChild
                    isActive={location.pathname === item.to}
                    tooltip={item.label}
                    className="h-9 data-[active=true]:bg-[#EAF7E8] data-[active=true]:text-[#00A94F] data-[active=true]:font-semibold dark:data-[active=true]:bg-[#00A94F]/10 dark:data-[active=true]:text-[#00A94F]"
                  >
                    <NavLink to={item.to} onClick={() => setOpenMobile(false)}>
                      <item.icon />
                      <span>{item.label}</span>
                      {pendingCount > 0 && (
                        <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-[10px] font-bold text-white">
                          {pendingCount > 99 ? "99+" : pendingCount}
                        </span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
            {navItems.length === 0 && (
              <p className="px-2 py-1 text-xs text-muted-foreground">No pages assigned to your role</p>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* User + Logout */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-3 rounded-md px-2 py-2 group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:px-0">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#10211D] text-white text-xs font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || "A"}
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight min-w-0 group-data-[collapsible=icon]:hidden">
                <span className="truncate font-semibold">{user?.name}</span>
                <span className="truncate text-xs text-muted-foreground">{user?.email}</span>
              </div>
            </div>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              tooltip="Sign Out"
              className="h-9 text-red-600 hover:text-red-600 dark:text-red-400 dark:hover:text-red-400"
            >
              <IconLogout />
              <span>Sign Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

export default function AdminLayout() {
  const location = useLocation();
  const currentNav = allNavItems.find((item) => item.to === location.pathname);
  const [pendingCounts, setPendingCounts] = useState({ kyc: 0, payments: 0, supportTickets: 0 });

  const fetchPendingCounts = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const headers: Record<string, string> = {};
      if (token) headers.Authorization = `Bearer ${token}`;
      const base = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

      const [kycRes, payRes, supportRes] = await Promise.allSettled([
        fetch(`${base}/admin/kyc?status=PENDING&limit=1`, { headers, credentials: "include" }).then(r => r.json()),
        fetch(`${base}/admin/payments?status=PENDING&limit=1`, { headers, credentials: "include" }).then(r => r.json()),
        fetch(`${base}/admin/support-tickets?status=OPEN&limit=1`, { headers, credentials: "include" }).then(r => r.json()),
      ]);

      const kyc = kycRes.status === "fulfilled" ? (kycRes.value?.counts?.pending ?? 0) : 0;
      const payments = payRes.status === "fulfilled"
        ? ((payRes.value?.counts?.pendingDeposits ?? 0) + (payRes.value?.counts?.pendingWithdrawals ?? 0))
        : 0;
      const supportTickets = supportRes.status === "fulfilled" ? (supportRes.value?.counts?.open ?? 0) : 0;
      setPendingCounts({ kyc, payments, supportTickets });
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    fetchPendingCounts();
    const interval = setInterval(fetchPendingCounts, 60000);
    return () => clearInterval(interval);
  }, [fetchPendingCounts]);

  return (
    <SidebarProvider className="h-svh overflow-hidden">
      <AppSidebar pendingCounts={pendingCounts} />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-[#DDE4DE] bg-card px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-6" />
          <h1 className="text-sm font-semibold tracking-tight truncate">
            {currentNav?.label || "Dashboard"}
          </h1>
          <div className="flex-1" />
          <ProfileMenu />
        </header>
        <div className="flex-1 overflow-y-auto bg-[#F7F8F4] p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
