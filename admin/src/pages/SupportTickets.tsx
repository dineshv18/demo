/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import {
  IconHeadset, IconClock, IconCheck, IconX, IconEye, IconChevronLeft,
  IconSearch, IconProgress, IconCircleCheck, IconPhone, IconMail,
} from "@tabler/icons-react";
import { supportTicketsAPI, type SupportTicket, type SupportTicketStatus, type SupportCategory } from "../services/api";

type FilterStatus = "ALL" | SupportTicketStatus;

const statusConfig: Record<SupportTicketStatus, { label: string; color: string; bg: string; icon: any }> = {
  OPEN: { label: "Open", color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/30", icon: IconClock },
  IN_PROGRESS: { label: "In Progress", color: "text-blue-600", bg: "bg-blue-100 dark:bg-blue-900/30", icon: IconProgress },
  RESOLVED: { label: "Resolved", color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/30", icon: IconCircleCheck },
  CLOSED: { label: "Closed", color: "text-gray-600", bg: "bg-gray-100 dark:bg-gray-800", icon: IconX },
};

const CATEGORY_LABELS: Record<SupportCategory, string> = {
  TECHNICAL: "Technical",
  BILLING: "Billing / Payment",
  KYC: "KYC",
  ACCOUNT: "Account",
  OTHER: "Other",
};

const filterTabs: FilterStatus[] = ["ALL", "OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"];

function StatusBadge({ status }: { status: SupportTicketStatus }) {
  const cfg = statusConfig[status];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
      <Icon size={12} /> {cfg.label}
    </span>
  );
}

export default function SupportTickets() {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>("ALL");
  const [counts, setCounts] = useState({ open: 0, inProgress: 0 });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState<SupportTicket | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [adminNote, setAdminNote] = useState("");

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page: page.toString(), limit: "10" };
      if (filter !== "ALL") params.status = filter;
      const data = await supportTicketsAPI.getAll(params);
      setTickets(data.tickets || []);
      setCounts(data.counts || { open: 0, inProgress: 0 });
      setTotalPages(Math.ceil((data.total || 0) / 10) || 1);
    } catch (err: any) {
      showToast("error", err.message || "Failed to load support tickets");
    } finally {
      setLoading(false);
    }
  }, [filter, page]);

  useEffect(() => { fetchTickets(); }, [fetchTickets]);
  useEffect(() => { setPage(1); }, [filter]);

  const openDetail = async (id: string) => {
    setDetailLoading(true);
    setSelected(null);
    try {
      const data = await supportTicketsAPI.getDetail(id);
      setSelected(data.ticket);
      setAdminNote(data.ticket.adminNote || "");
    } catch (err: any) {
      showToast("error", err.message || "Failed to load ticket details");
    } finally {
      setDetailLoading(false);
    }
  };

  const updateTicket = async (status?: SupportTicketStatus) => {
    if (!selected) return;
    setActionLoading(true);
    try {
      const data = await supportTicketsAPI.update(selected.id, { status, adminNote });
      setSelected(data.ticket);
      showToast("success", status ? `Ticket marked as ${statusConfig[status].label}` : "Note saved");
      fetchTickets();
    } catch (err: any) {
      showToast("error", err.message || "Failed to update ticket");
    } finally {
      setActionLoading(false);
    }
  };

  const filteredTickets = tickets.filter((t) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      t.subject?.toLowerCase().includes(term) ||
      t.user?.name?.toLowerCase().includes(term) ||
      t.user?.email?.toLowerCase().includes(term)
    );
  });

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
  const formatDateTime = (d: string) =>
    new Date(d).toLocaleString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] px-5 py-3 rounded-lg shadow-lg text-sm font-medium text-white transition-all ${toast.type === "success" ? "bg-emerald-600" : "bg-red-600"}`}>
          {toast.message}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Support Tickets</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Requests submitted by users from the client dashboard.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Open</p>
          <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-1">{counts.open}</p>
        </div>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">In Progress</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{counts.inProgress}</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-56 shrink-0">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 space-y-2">
            <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-3 mb-3">
              Filter by Status
            </p>
            {filterTabs.map((tab) => (
              <button key={tab} onClick={() => setFilter(tab)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  filter === tab ? "bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400" : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}>
                {tab === "ALL" ? "All" : statusConfig[tab].label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 min-w-0">
          <div className="mb-4">
            <div className="relative">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input type="text" placeholder="Search by subject, name, or email..." value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500" />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            {loading ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-800">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="p-4 flex items-center gap-4 animate-pulse">
                    <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-800" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-48 bg-gray-200 dark:bg-gray-800 rounded" />
                      <div className="h-3 w-32 bg-gray-200 dark:bg-gray-800 rounded" />
                    </div>
                    <div className="h-6 w-20 bg-gray-200 dark:bg-gray-800 rounded-full" />
                  </div>
                ))}
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="h-14 w-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                  <IconHeadset className="h-7 w-7 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">No support tickets found</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {filter === "ALL" ? "No requests yet" : `No ${statusConfig[filter as SupportTicketStatus]?.label.toLowerCase()} tickets`}
                </p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                    <th className="text-left px-5 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">User</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Subject</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Category</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Submitted</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Status</th>
                    <th className="text-right px-5 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {filteredTickets.map((t) => (
                    <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer" onClick={() => openDetail(t.id)}>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {t.user?.name?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{t.user?.name || "Unknown"}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{t.user?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-700 dark:text-gray-300 max-w-[220px] truncate">{t.subject}</td>
                      <td className="px-5 py-4 text-gray-600 dark:text-gray-400 text-xs">{CATEGORY_LABELS[t.category]}</td>
                      <td className="px-5 py-4 text-gray-500 dark:text-gray-400 text-xs">{formatDate(t.createdAt)}</td>
                      <td className="px-5 py-4"><StatusBadge status={t.status} /></td>
                      <td className="px-5 py-4 text-right">
                        <button className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors">
                          <IconEye size={16} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200 dark:border-gray-800">
                <p className="text-xs text-gray-500 dark:text-gray-400">Page {page} of {totalPages}</p>
                <div className="flex gap-2">
                  <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed">
                    Previous
                  </button>
                  <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed">
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Panel */}
      {(selected || detailLoading) && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => !actionLoading && setSelected(null)} />
          <div className="relative w-full max-w-xl bg-white dark:bg-gray-900 shadow-2xl overflow-y-auto">
            {detailLoading ? (
              <div className="p-6 space-y-4">
                <div className="h-6 w-40 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
              </div>
            ) : selected ? (
              <>
                <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500"><IconChevronLeft size={18} /></button>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Ticket Details</h2>
                  </div>
                  <StatusBadge status={selected.status} />
                </div>

                <div className="p-6 space-y-6">
                  <section>
                    <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">User</h3>
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-2 text-sm">
                      <div className="flex justify-between"><span className="text-gray-500">Name</span><span className="font-medium text-gray-900 dark:text-white">{selected.user?.name || "-"}</span></div>
                      <div className="flex justify-between items-center"><span className="text-gray-500 flex items-center gap-1"><IconMail size={12} /> Email</span><span className="font-medium text-gray-900 dark:text-white text-right break-all">{selected.user?.email || "-"}</span></div>
                      <div className="flex justify-between items-center"><span className="text-gray-500 flex items-center gap-1"><IconPhone size={12} /> Phone</span><span className="font-medium text-gray-900 dark:text-white">{selected.phone || "Not provided"}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">User ID</span><span className="font-mono text-xs text-gray-900 dark:text-white">{selected.userId}</span></div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Request</h3>
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-2">
                      <div className="flex justify-between text-sm"><span className="text-gray-500">Category</span><span className="font-medium text-gray-900 dark:text-white">{CATEGORY_LABELS[selected.category]}</span></div>
                      <div className="flex justify-between text-sm"><span className="text-gray-500">Submitted</span><span className="text-gray-900 dark:text-white">{formatDateTime(selected.createdAt)}</span></div>
                      <div className="pt-2">
                        <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{selected.subject}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">{selected.message}</p>
                      </div>
                    </div>
                  </section>

                  <section>
                    <label className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Response / Internal Note</label>
                    <textarea value={adminNote} onChange={(e) => setAdminNote(e.target.value)} placeholder="Add a note visible to the user..." rows={3}
                      className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none" />
                    <button onClick={() => updateTicket()} disabled={actionLoading}
                      className="mt-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50">
                      Save Note
                    </button>
                  </section>

                  <section className="flex flex-wrap gap-2 pt-2">
                    {selected.status !== "IN_PROGRESS" && (
                      <button onClick={() => updateTicket("IN_PROGRESS")} disabled={actionLoading}
                        className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors">
                        <IconProgress size={16} /> Mark In Progress
                      </button>
                    )}
                    {selected.status !== "RESOLVED" && (
                      <button onClick={() => updateTicket("RESOLVED")} disabled={actionLoading}
                        className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors">
                        <IconCheck size={16} /> Mark Resolved
                      </button>
                    )}
                    {selected.status !== "CLOSED" && (
                      <button onClick={() => updateTicket("CLOSED")} disabled={actionLoading}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gray-600 hover:bg-gray-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors">
                        <IconX size={16} /> Close
                      </button>
                    )}
                  </section>
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
