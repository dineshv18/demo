"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  IconArrowsExchange,
  IconChartLine,
  IconChevronUp,
  IconGift,
  IconLayoutDashboard,
  IconLogout,
  IconHelpCircle,
  IconSend,
  IconShield,
  IconUser,
  IconWallet,
  type IconProps,
} from "@tabler/icons-react";

import { useAuth } from "@/lib/AuthContext";
import { cn } from "@/lib/utils";
import { BrandMark, BrandMonogram } from "@/components/shared/BrandMark";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
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

type TablerIcon = React.ComponentType<IconProps>;

export type NavItem = {
  slug: string;
  to: string;
  label: string;
  icon: TablerIcon;
  group: "main" | "other";
  alwaysVisible?: boolean;
};

/**
 * Navigation model. Unchanged from the previous shell — same slugs, same routes,
 * same RBAC opt-outs — so `canView` filtering and the guided tour keep working.
 */
export const allNavItems: NavItem[] = [
  { slug: "dashboard", to: "/dashboard", label: "Dashboard", icon: IconLayoutDashboard, group: "main", alwaysVisible: true },
  { slug: "wallet", to: "/dashboard/wallet", label: "My Wallet", icon: IconWallet, group: "main", alwaysVisible: true },
  { slug: "index", to: "/dashboard/index", label: "Index", icon: IconChartLine, group: "main", alwaysVisible: true },
  { slug: "transfer", to: "/dashboard/transfer", label: "Internal Transfer", icon: IconSend, group: "main", alwaysVisible: true },
  { slug: "transactions", to: "/dashboard/transactions", label: "Transactions", icon: IconArrowsExchange, group: "main", alwaysVisible: true },
  { slug: "kyc", to: "/dashboard/kyc", label: "KYC Verification", icon: IconShield, group: "other", alwaysVisible: true },
  { slug: "profile", to: "/dashboard/profile", label: "My Profile", icon: IconUser, group: "other", alwaysVisible: true },
  { slug: "support", to: "/dashboard/support", label: "Support", icon: IconHelpCircle, group: "other", alwaysVisible: true },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user, logout, canView, assignedRole } = useAuth();
  const { setOpenMobile } = useSidebar();
  const reduce = useReducedMotion();

  const handleLogout = async () => {
    await logout();
    window.location.href = "/login";
  };

  const visibleNavItems = allNavItems.filter((item) => item.alwaysVisible || canView(item.slug));
  const mainNav = visibleNavItems.filter((i) => i.group === "main");
  const otherNav = visibleNavItems.filter((i) => i.group === "other");

  const renderNavItem = (item: NavItem) => {
    const active = pathname === item.to;

    return (
      <SidebarMenuItem key={item.slug}>
        <SidebarMenuButton
          asChild
          isActive={active}
          tooltip={item.label}
          className={cn(
            "group/nav relative h-10 rounded-lg px-3 font-medium",
            "text-sidebar-foreground/75 transition-colors duration-200",
            "hover:bg-white/[0.05] hover:text-white",
            // The primitive's own active styles would fight ours — neutralise them.
            "data-[active=true]:bg-transparent data-[active=true]:text-white data-[active=true]:font-semibold"
          )}
        >
          <Link href={item.to} onClick={() => setOpenMobile(false)} data-tour={`nav-${item.slug}`}>
            {/* Active treatment: a gold-tinted navy surface with a gold rail */}
            {active &&
              (reduce ? (
                <span
                  aria-hidden
                  className="absolute inset-0 rounded-lg bg-brand/12 ring-1 ring-inset ring-brand/25"
                />
              ) : (
                <motion.span
                  layoutId="sidebar-active"
                  aria-hidden
                  transition={{ type: "spring", stiffness: 420, damping: 38 }}
                  className="absolute inset-0 rounded-lg bg-brand/12 ring-1 ring-inset ring-brand/25"
                />
              ))}
            {active && (
              <span
                aria-hidden
                className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-brand"
              />
            )}

            <item.icon
              className={cn(
                "relative size-[18px] shrink-0 transition-colors",
                active ? "text-brand" : "text-sidebar-foreground/60 group-hover/nav:text-white"
              )}
              stroke={1.75}
            />
            <span className="relative truncate">{item.label}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="px-3 py-4">
        <Link
          href="/dashboard"
          onClick={() => setOpenMobile(false)}
          className="flex items-center gap-2.5 rounded-xl outline-none"
          aria-label="ORVANTA Financial — dashboard home"
        >
          <BrandMonogram className="group-data-[collapsible=icon]:size-8" />
          <span className="grid flex-1 leading-tight group-data-[collapsible=icon]:hidden">
            <span className="font-display text-[0.9375rem] font-semibold tracking-tight text-white">
              ORVANTA
            </span>
            <span className="text-[0.625rem] font-semibold uppercase tracking-[0.2em] text-brand">
              Financial
            </span>
          </span>
        </Link>
        {/* Hairline of gold under the mark — the one flourish up here */}
        <span aria-hidden className="mt-3 block h-px bg-linear-to-r from-brand/40 via-brand/10 to-transparent group-data-[collapsible=icon]:hidden" />
      </SidebarHeader>

      {/* `sidebar-scroll` keeps the overflow usable without a heavy scrollbar track */}
      <SidebarContent className="sidebar-scroll px-2">
        {mainNav.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="px-3 text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-sidebar-foreground/40">
              Main menu
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">{mainNav.map(renderNavItem)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {otherNav.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel className="px-3 text-[0.625rem] font-semibold uppercase tracking-[0.16em] text-sidebar-foreground/40">
              Other
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">{otherNav.map(renderNavItem)}</SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {visibleNavItems.length === 0 && (
          <SidebarGroup>
            <SidebarGroupContent>
              <p className="px-3 text-sm text-sidebar-foreground/60">No pages assigned</p>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      {/*
        Invite & Earn — referral entry point, kept reachable from every page.
        The descriptive line is dropped on short viewports so the nav above it
        never has to scroll just to fit this promo.
      */}
      <div className="px-3 pb-3 group-data-[collapsible=icon]:hidden">
        <Link
          href="/dashboard/referral"
          onClick={() => setOpenMobile(false)}
          data-tour="nav-referral"
          className={cn(
            "group/promo relative block overflow-hidden rounded-xl p-3.5",
            "border border-brand/25 bg-linear-to-b from-brand/12 to-transparent",
            "transition-colors hover:border-brand/45"
          )}
        >
          <span aria-hidden className="bg-ticker pointer-events-none absolute inset-0 opacity-40" />
          <div className="relative flex items-center gap-2.5">
            <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-brand/15 text-brand">
              <IconGift className="size-4" stroke={1.75} />
            </span>
            <span className="text-[0.8125rem] font-semibold text-white">Invite &amp; Earn</span>
          </div>
          <p className="relative mt-2 hidden text-[0.6875rem] leading-relaxed text-sidebar-foreground/65 min-[900px]:[@media(min-height:820px)]:block">
            Earn commission across five referral levels.
          </p>
          <span className="relative mt-2.5 flex h-9 items-center justify-center rounded-lg bg-brand text-xs font-semibold text-brand-foreground transition-transform group-hover/promo:scale-[1.015]">
            Refer now
          </span>
        </Link>
      </div>

      <SidebarFooter className="border-t border-sidebar-border p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="rounded-lg text-sidebar-foreground/80 hover:bg-white/[0.05] hover:text-white data-[state=open]:bg-white/[0.06] data-[state=open]:text-white"
                >
                  <span className="grid aspect-square size-8 shrink-0 place-items-center rounded-lg bg-brand/15 text-xs font-bold text-brand ring-1 ring-brand/25">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                  <span className="grid flex-1 text-left leading-tight">
                    <span className="truncate text-[0.8125rem] font-semibold text-white">
                      {user?.name}
                    </span>
                    <span className="truncate text-[0.6875rem] text-sidebar-foreground/55">
                      {assignedRole?.displayName || user?.role}
                    </span>
                  </span>
                  <IconChevronUp className="ml-auto size-4 shrink-0 opacity-60" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-xl"
                side="top"
                align="end"
                sideOffset={8}
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold leading-none">{user?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user?.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    window.location.href = "/dashboard/profile";
                  }}
                  className="cursor-pointer gap-2"
                >
                  <IconUser className="size-4" />
                  My Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer gap-2 text-danger focus:bg-danger-soft focus:text-danger"
                >
                  <IconLogout className="size-4" />
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

/** Full ORVANTA lockup, shown in the mobile drawer where there is room for it. */
export function SidebarBrandFull() {
  return <BrandMark on="dark" className="h-9 w-auto" />;
}
