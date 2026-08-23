/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useMemo, useCallback } from "react";
import { IconFilter, IconCalendar } from "@tabler/icons-react";
import { env } from "../config/env";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../components/ui/table";

const API = env.API_URL;

const actionLabels: Record<string, string> = {
  login: "Login", register: "Register", logout: "Logout",
  create_role: "Created Role", update_role: "Updated Role", delete_role: "Deleted Role",
  assign_pages: "Assigned Pages", create_page: "Created Page", update_page: "Updated Page",
  delete_page: "Deleted Page", create_admin: "Created Admin", update_admin: "Updated Admin",
  delete_admin: "Deleted Admin", deactivate_admin: "Deactivated Admin", activate_admin: "Activated Admin",
  send_otp: "Sent OTP", verify_otp: "Verified OTP", forgot_password: "Forgot Password",
  reset_password: "Reset Password",
  KYC_APPROVED: "Approved KYC", KYC_REJECTED: "Rejected KYC",
  PAYMENT_APPROVED: "Approved Deposit", WITHDRAWAL_APPROVED: "Approved Withdrawal", PAYMENT_REJECTED: "Rejected Payment",
  SUPPORT_TICKET_UPDATED: "Updated Support Ticket",
  PLATFORM_WITHDRAWAL_REQUESTED: "Requested Platform Withdrawal",
  PLATFORM_WITHDRAWAL_APPROVED: "Approved Platform Withdrawal",
  PLATFORM_WITHDRAWAL_REJECTED: "Rejected Platform Withdrawal",
};

const actionColors: Record<string, string> = {
  login: "text-[#00A94F] bg-[#EAF7E8]", register: "text-sky-700 bg-sky-100",
  logout: "text-[#68736E] bg-[#F3F8EF]", create_role: "text-[#10211D] bg-[#F3F8EF]",
  update_role: "text-orange-700 bg-orange-100", delete_role: "text-red-700 bg-red-100",
  assign_pages: "text-cyan-700 bg-cyan-100", create_admin: "text-[#10211D] bg-[#EAF7E8]",
  update_admin: "text-amber-700 bg-amber-100", delete_admin: "text-red-700 bg-red-100",
  deactivate_admin: "text-red-700 bg-red-100", activate_admin: "text-[#00A94F] bg-[#EAF7E8]",
  KYC_APPROVED: "text-[#00A94F] bg-[#EAF7E8]", KYC_REJECTED: "text-red-700 bg-red-100",
  PAYMENT_APPROVED: "text-[#00A94F] bg-[#EAF7E8]", WITHDRAWAL_APPROVED: "text-sky-700 bg-sky-100",
  PAYMENT_REJECTED: "text-red-700 bg-red-100",
  SUPPORT_TICKET_UPDATED: "text-cyan-700 bg-cyan-100",
  PLATFORM_WITHDRAWAL_REQUESTED: "text-amber-700 bg-amber-100",
  PLATFORM_WITHDRAWAL_APPROVED: "text-[#00A94F] bg-[#EAF7E8]",
  PLATFORM_WITHDRAWAL_REJECTED: "text-red-700 bg-red-100",
};

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

export default function ActivityPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ action: "", userId: "", startDate: "", endDate: "" });
  const [page, setPage] = useState(1);

  const headers = useMemo(() => {
    const h: Record<string, string> = { "Content-Type": "application/json" };
    const token = localStorage.getItem("token");
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }, []);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: "20" });
      if (filters.action) params.append("action", filters.action);
      if (filters.userId) params.append("userId", filters.userId);
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);
      const res = await fetch(`${API}/activity?${params}`, { headers, credentials: "include" });
      const data = await res.json();
      setLogs(data.logs || []);
      setPagination(data.pagination || { page: 1, limit: 20, total: 0, pages: 0 });
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [page, filters, headers]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch(`${API}/activity/stats`, { headers, credentials: "include" });
      const data = await res.json();
      setStats(data);
    } catch {
      // stats fetch failed
    }
  }, [headers]);

  useEffect(() => { fetchStats(); }, [fetchStats]);
  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#10211D]">Activity Logs</h1>
        <p className="text-[#68736E] text-sm">Monitor all admin and system actions</p>
      </div>

      {stats && (
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: "Today", value: stats.stats?.today || 0, color: "text-[#10211D]" },
            { label: "This Week", value: stats.stats?.thisWeek || 0, color: "text-[#00A94F]" },
            { label: "This Month", value: stats.stats?.thisMonth || 0, color: "text-[#10211D]" },
          ].map((s) => (
            <Card key={s.label} className="rounded-2xl border border-[#DDE4DE] shadow-[0_8px_30px_rgba(16,33,29,0.05)]">
              <CardContent>
                <p className="text-sm text-[#68736E]">{s.label}</p>
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-3 items-center">
        <IconFilter size={16} className="text-[#68736E]" />
        <select value={filters.action} onChange={(e) => { setFilters({ ...filters, action: e.target.value }); setPage(1); }}
          className="px-3 py-1.5 border border-[#DDE4DE] rounded-xl bg-white text-sm text-[#10211D]">
          <option value="">All actions</option>
          {Object.entries(actionLabels).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <div className="flex items-center gap-2">
          <IconCalendar size={14} className="text-[#68736E]" />
          <input type="date" value={filters.startDate} onChange={(e) => { setFilters({ ...filters, startDate: e.target.value }); setPage(1); }}
            className="px-3 py-1.5 border border-[#DDE4DE] rounded-xl bg-white text-sm text-[#10211D]" />
          <span className="text-[#68736E] text-sm">to</span>
          <input type="date" value={filters.endDate} onChange={(e) => { setFilters({ ...filters, endDate: e.target.value }); setPage(1); }}
            className="px-3 py-1.5 border border-[#DDE4DE] rounded-xl bg-white text-sm text-[#10211D]" />
        </div>
      </div>

      <Card className="overflow-hidden py-0 rounded-2xl border border-[#DDE4DE] shadow-[0_8px_30px_rgba(16,33,29,0.05)]">
        {loading ? (
          <div className="flex items-center justify-center h-32"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#00A94F]" /></div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-[#68736E] text-sm">No activity logs found</div>
        ) : (
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F3F8EF]">
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Page</TableHead>
                <TableHead>IP</TableHead>
                <TableHead>Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <div className="font-medium text-[#10211D]">{log.user?.name}</div>
                    <div className="text-xs text-[#68736E]">{log.user?.email}</div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`rounded-full ${actionColors[log.action] || "text-[#68736E] bg-[#F3F8EF]"}`}>
                      {actionLabels[log.action] || log.action}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[#68736E]">{log.page ? log.page.split("-").map((w: string) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") : "-"}</TableCell>
                  <TableCell className="text-[#68736E] text-xs font-mono">{log.ip || "-"}</TableCell>
                  <TableCell className="text-[#68736E] text-xs">{formatTime(log.createdAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        )}
      </Card>

      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-[#68736E]">Showing {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}</p>
          <div className="flex gap-1">
            <Button variant="outline" size="sm" className="rounded-xl border-[#DDE4DE] text-[#10211D]" onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}>Prev</Button>
            <Button variant="outline" size="sm" className="rounded-xl border-[#DDE4DE] text-[#10211D]" onClick={() => setPage(Math.min(pagination.pages, page + 1))} disabled={page === pagination.pages}>Next</Button>
          </div>
        </div>
      )}
    </div>
  );
}
