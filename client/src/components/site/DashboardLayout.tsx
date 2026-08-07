"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useAuth } from "@/lib/AuthContext";
import {
  IconLayoutDashboard,
  IconWallet,
  IconChartLine,
  IconExchange,
  IconSettings,
  IconLogout,
  IconChevronUp,
  IconNews,
  IconSpeakerphone,
  IconShield,
  IconSun,
  IconMoon,
  IconUserPlus,
  IconUser,
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
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { ThemeToggleButton } from "./ThemeToggle";

// All possible nav items — filtered by RBAC
const allNavItems = [
  { slug: "dashboard", to: "/dashboard", label: "Dashboard", icon: IconLayoutDashboard, group: "main" },
  { slug: "wallet", to: "/dashboard/wallet", label: "My Wallet", icon: IconWallet, group: "main" },
  { slug: "index", to: "/dashboard/index", label: "Index", icon: IconChartLine, group: "main" },
  { slug: "trading", to: "/dashboard/trading", label: "Live Trading", icon: IconChartLine, group: "main" },
  { slug: "exchange", to: "/dashboard/exchange", label: "Exchange", icon: IconExchange, group: "main" },
  { slug: "referral", to: "/dashboard/referral", label: "Referrals", icon: IconUserPlus, group: "main" },
  { slug: "kyc", to: "/dashboard/kyc", label: "KYC Verification", icon: IconShield, group: "other" },
  { slug: "news", to: "/dashboard/news", label: "News", icon: IconNews, group: "other" },
  { slug: "blog", to: "/dashboard/blog", label: "Blog", icon: IconSpeakerphone, group: "other" },
  { slug: "settings", to: "/dashboard/settings", label: "Settings", icon: IconSettings, group: "other" },
  { slug: "profile", to: "/dashboard/profile", label: "My Profile", icon: IconUser, group: "other" },
];

type NavItem = (typeof allNavItems)[number];

function AppSidebar() {
  const pathname = usePathname();
  const { user, logout, canView, assignedRole, roleColor } = useAuth();
  const { theme, setTheme } = useTheme();
  const { setOpenMobile } = useSidebar();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const handleLogout = async () => {
    await logout();
    window.location.href = "/login";
  };

  // Filter nav items by RBAC
  const visibleNavItems = allNavItems.filter((item) => canView(item.slug));
  const mainNav = visibleNavItems.filter((item) => item.group === "main");
  const otherNav = visibleNavItems.filter((item) => item.group === "other");

  const renderNavItem = (item: NavItem) => (
    <SidebarMenuItem key={item.slug}>
      <SidebarMenuButton
        asChild
        isActive={pathname === item.to}
        tooltip={item.label}
        className="h-9 data-[active=true]:bg-brand/10 data-[active=true]:text-brand data-[active=true]:font-semibold"
      >
        <Link href={item.to} onClick={() => setOpenMobile(false)}>
          <item.icon />
          <span>{item.label}</span>
        </Link>
      </SidebarMenuButton>
    </SidebarMenuItem>
  );

  return (
    <Sidebar collapsible="icon">
      {/* Logo */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/dashboard" onClick={() => setOpenMobile(false)}>
                <div
                  className="flex aspect-square size-8 items-center justify-center rounded-lg text-white font-bold text-sm shadow-lg"
                  style={{ background: `linear-gradient(135deg, ${roleColor}, ${roleColor}dd)` }}
                >
                  O
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-bold tracking-tight">Ovantra</span>
                  <span className="truncate text-[10px] font-medium uppercase tracking-wider" style={{ color: roleColor }}>
                    Financial
                  </span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Nav */}
      <SidebarContent>
        {mainNav.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Main Menu</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>{mainNav.map(renderNavItem)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {otherNav.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Other</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>{otherNav.map(renderNavItem)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {visibleNavItems.length === 0 && (
          <SidebarGroup>
            <SidebarGroupContent>
              <p className="px-2 text-sm text-muted-foreground">No pages assigned</p>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/* User */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <div
                    className="flex aspect-square size-8 items-center justify-center rounded-full text-white text-xs font-bold"
                    style={{ background: `linear-gradient(135deg, ${roleColor}, ${roleColor}bb)` }}
                  >
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{user?.name}</span>
                    <span className="truncate text-xs text-muted-foreground">
                      {assignedRole?.displayName || user?.role}
                    </span>
                  </div>
                  <IconChevronUp className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                side="top"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="cursor-pointer gap-2"
                >
                  {mounted ? (
                    theme === "dark" ? <IconSun className="h-4 w-4 text-amber-400" /> : <IconMoon className="h-4 w-4 text-blue-400" />
                  ) : (
                    <IconMoon className="h-4 w-4" />
                  )}
                  <span>{mounted ? (theme === "dark" ? "Light Mode" : "Dark Mode") : "Dark Mode"}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => { window.location.href = "/dashboard/profile"; }}
                  className="cursor-pointer gap-2"
                >
                  <IconUser className="h-4 w-4" />
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-red-500 focus:text-red-500 focus:bg-red-500/10"
                >
                  <IconLogout className="h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading } = useAuth();
  const currentNav = allNavItems.find((item) => item.to === pathname);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-svh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-brand border-t-transparent" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <SidebarProvider className="h-svh overflow-hidden">
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 shrink-0 items-center gap-2 border-b bg-card px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-6" />
          <h1 className="text-sm font-semibold tracking-tight truncate">
            {currentNav?.label || "Dashboard"}
          </h1>
          <div className="flex-1" />
          <ThemeToggleButton className="!h-8 !w-8" />
        </header>
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );
}
