/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useMemo, useCallback } from "react";
import { IconFilter, IconCalendar } from "@tabler/icons-react";
import { env } from "../config/env";

const API = env.API_URL;

const actionLabels: Record<string, string> = {
  login: "Login", register: "Register", logout: "Logout",
  create_role: "Created Role", update_role: "Updated Role", delete_role: "Deleted Role",
  assign_pages: "Assigned Pages", create_page: "Created Page", update_page: "Updated Page",
  delete_page: "Deleted Page", create_admin: "Created Admin", update_admin: "Updated Admin",
  delete_admin: "Deleted Admin", deactivate_admin: "Deactivated Admin", activate_admin: "Activated Admin",
  send_otp: "Sent OTP", verify_otp: "Verified OTP", forgot_password: "Forgot Password",
  reset_password: "Reset Password",
};

const actionColors: Record<string, string> = {
  login: "text-green-600 bg-green-600/10", register: "text-blue-600 bg-blue-600/10",
  logout: "text-muted-foreground bg-muted", create_role: "text-purple-600 bg-purple-600/10",
  update_role: "text-orange-600 bg-orange-600/10", delete_role: "text-red-600 bg-red-600/10",
  assign_pages: "text-cyan-600 bg-cyan-600/10", create_admin: "text-indigo-600 bg-indigo-600/10",
  update_admin: "text-amber-600 bg-amber-600/10", delete_admin: "text-red-600 bg-red-600/10",
  deactivate_admin: "text-red-600 bg-red-600/10", activate_admin: "text-green-600 bg-green-600/10",
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
        <h1 className="text-2xl font-bold">Activity Logs</h1>
        <p className="text-muted-foreground text-sm">Monitor all admin and system actions</p>
      </div>

      {stats && (
        <div className="grid gap-4 md:grid-cols-3">
          {[
            { label: "Today", value: stats.stats?.today || 0, color: "text-blue-600" },
            { label: "This Week", value: stats.stats?.thisWeek || 0, color: "text-purple-600" },
            { label: "This Month", value: stats.stats?.thisMonth || 0, color: "text-green-600" },
          ].map((s) => (
            <div key={s.label} className="border rounded-lg p-4 bg-card">
              <p className="text-sm text-muted-foreground">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-3 items-center">
        <IconFilter size={16} className="text-muted-foreground" />
        <select value={filters.action} onChange={(e) => { setFilters({ ...filters, action: e.target.value }); setPage(1); }}
          className="px-3 py-1.5 border rounded-md bg-background text-sm">
          <option value="">All actions</option>
          {Object.entries(actionLabels).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <div className="flex items-center gap-2">
          <IconCalendar size={14} className="text-muted-foreground" />
          <input type="date" value={filters.startDate} onChange={(e) => { setFilters({ ...filters, startDate: e.target.value }); setPage(1); }}
            className="px-3 py-1.5 border rounded-md bg-background text-sm" />
          <span className="text-muted-foreground text-sm">to</span>
          <input type="date" value={filters.endDate} onChange={(e) => { setFilters({ ...filters, endDate: e.target.value }); setPage(1); }}
            className="px-3 py-1.5 border rounded-md bg-background text-sm" />
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-32"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" /></div>
        ) : logs.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">No activity logs found</div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="text-left p-3 font-medium">User</th>
                <th className="text-left p-3 font-medium">Action</th>
                <th className="text-left p-3 font-medium">Page</th>
                <th className="text-left p-3 font-medium">IP</th>
                <th className="text-left p-3 font-medium">Time</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-t hover:bg-muted/30">
                  <td className="p-3">
                    <div className="font-medium">{log.user?.name}</div>
                    <div className="text-xs text-muted-foreground">{log.user?.email}</div>
                  </td>
                  <td className="p-3">
                    <span className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${actionColors[log.action] || "text-muted-foreground bg-muted"}`}>
                      {actionLabels[log.action] || log.action}
                    </span>
                  </td>
                  <td className="p-3 text-muted-foreground capitalize">{log.page || "-"}</td>
                  <td className="p-3 text-muted-foreground text-xs font-mono">{log.ip || "-"}</td>
                  <td className="p-3 text-muted-foreground text-xs">{formatTime(log.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pagination.pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Showing {((pagination.page - 1) * pagination.limit) + 1}–{Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total}</p>
          <div className="flex gap-1">
            <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1}
              className="px-3 py-1 border rounded text-sm disabled:opacity-50 hover:bg-muted">Prev</button>
            <button onClick={() => setPage(Math.min(pagination.pages, page + 1))} disabled={page === pagination.pages}
              className="px-3 py-1 border rounded text-sm disabled:opacity-50 hover:bg-muted">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
