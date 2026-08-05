/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from "react";
import {
  IconUserCheck,
  IconClock,
  IconCheck,
  IconX,
  IconEye,
  IconChevronLeft,
  IconFile,
  IconSearch,
} from "@tabler/icons-react";
import { kycAPI, type KycSubmission, type KycListResponse } from "../services/api";

type FilterStatus = "ALL" | "PENDING" | "APPROVED" | "REJECTED";

const statusConfig: Record<FilterStatus, { label: string; color: string; bg: string }> = {
  ALL: { label: "All", color: "text-gray-600", bg: "bg-gray-100 dark:bg-gray-800" },
  PENDING: { label: "Pending", color: "text-amber-600", bg: "bg-amber-100 dark:bg-amber-900/30" },
  APPROVED: { label: "Approved", color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
  REJECTED: { label: "Rejected", color: "text-red-600", bg: "bg-red-100 dark:bg-red-900/30" },
};

const filterTabs: FilterStatus[] = ["ALL", "PENDING", "APPROVED", "REJECTED"];

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status as FilterStatus] || statusConfig.ALL;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.color}`}>
      {status === "PENDING" && <IconClock size={12} />}
      {status === "APPROVED" && <IconCheck size={12} />}
      {status === "REJECTED" && <IconX size={12} />}
      {status}
    </span>
  );
}

export default function KycVerification() {
  const [submissions, setSubmissions] = useState<KycSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterStatus>("ALL");
  const [counts, setCounts] = useState({ pending: 0, approved: 0, rejected: 0, total: 0 });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selected, setSelected] = useState<KycSubmission | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [rejectModal, setRejectModal] = useState<KycSubmission | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchSubmissions = useCallback(async () => {
    setLoading(true);
    try {
      const params: any = { page: page.toString(), limit: "10" };
      if (filter !== "ALL") params.status = filter;
      const data: KycListResponse = await kycAPI.getAll(params);
      setSubmissions(data.submissions || []);
      setCounts(data.counts || { pending: 0, approved: 0, rejected: 0, total: 0 });
      setTotalPages(Math.ceil((data.total || 0) / 10));
    } catch (err: any) {
      showToast("error", err.message || "Failed to load KYC submissions");
    } finally {
      setLoading(false);
    }
  }, [filter, page]);

  useEffect(() => {
    fetchSubmissions();
  }, [fetchSubmissions]);

  useEffect(() => {
    setPage(1);
  }, [filter]);

  const handleApprove = async (id: string) => {
    if (!confirm("Are you sure you want to approve this KYC submission?")) return;
    setActionLoading(true);
    try {
      await kycAPI.approve(id);
      showToast("success", "KYC submission approved successfully");
      setSelected(null);
      fetchSubmissions();
    } catch (err: any) {
      showToast("error", err.message || "Failed to approve");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!rejectModal || !rejectReason.trim()) return;
    setActionLoading(true);
    try {
      await kycAPI.reject(rejectModal.id, rejectReason.trim());
      showToast("success", "KYC submission rejected");
      setRejectModal(null);
      setRejectReason("");
      setSelected(null);
      fetchSubmissions();
    } catch (err: any) {
      showToast("error", err.message || "Failed to reject");
    } finally {
      setActionLoading(false);
    }
  };

  const openDetail = async (id: string) => {
    setDetailLoading(true);
    setSelected(null);
    try {
      const data = await kycAPI.getDetail(id);
      setSelected(data.submission);
    } catch (err: any) {
      showToast("error", err.message || "Failed to load details");
    } finally {
      setDetailLoading(false);
    }
  };

  const filteredSubmissions = submissions.filter((s) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      s.fullName?.toLowerCase().includes(term) ||
      s.email?.toLowerCase().includes(term) ||
      s.user?.name?.toLowerCase().includes(term)
    );
  });

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  const formatDateTime = (d: string) =>
    new Date(d).toLocaleString("en-US", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-[100] px-5 py-3 rounded-lg shadow-lg text-sm font-medium text-white transition-all animate-in slide-in-from-top-2 ${
            toast.type === "success" ? "bg-emerald-600" : "bg-red-600"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">KYC Verification</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Review and manage user identity verification submissions
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Sidebar - Filters */}
        <div className="w-full lg:w-64 shrink-0">
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-4 space-y-2">
            <p className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider px-3 mb-3">
              Filter by Status
            </p>
            {filterTabs.map((tab) => {
              const cfg = statusConfig[tab];
              const count =
                tab === "ALL" ? counts.total :
                tab === "PENDING" ? counts.pending :
                tab === "APPROVED" ? counts.approved :
                counts.rejected;
              return (
                <button
                  key={tab}
                  onClick={() => setFilter(tab)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    filter === tab
                      ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    {tab === "ALL" && <IconFile size={16} />}
                    {tab === "PENDING" && <IconClock size={16} />}
                    {tab === "APPROVED" && <IconCheck size={16} />}
                    {tab === "REJECTED" && <IconX size={16} />}
                    {cfg.label}
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      filter === tab
                        ? "bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300"
                        : "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500"
              />
            </div>
          </div>

          {/* Table */}
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
            ) : filteredSubmissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="h-14 w-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
                  <IconUserCheck className="h-7 w-7 text-gray-400" />
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">No KYC submissions found</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {filter === "ALL" ? "No submissions yet" : `No ${filter.toLowerCase()} submissions`}
                </p>
              </div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                    <th className="text-left px-5 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">User</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Email</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Submitted</th>
                    <th className="text-left px-5 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Status</th>
                    <th className="text-right px-5 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                  {filteredSubmissions.map((sub) => (
                    <tr
                      key={sub.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer"
                      onClick={() => openDetail(sub.id)}
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {sub.fullName?.charAt(0)?.toUpperCase() || sub.user?.name?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{sub.fullName || sub.user?.name || "Unknown"}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{sub.user?.role || "User"}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-gray-600 dark:text-gray-400">{sub.email || sub.user?.email || "-"}</td>
                      <td className="px-5 py-4 text-gray-500 dark:text-gray-400 text-xs">{formatDate(sub.createdAt)}</td>
                      <td className="px-5 py-4"><StatusBadge status={sub.status} /></td>
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

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200 dark:border-gray-800">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Slide-in Panel */}
      {(selected || detailLoading) && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40" onClick={() => !actionLoading && setSelected(null)} />
          <div className="relative w-full max-w-xl bg-white dark:bg-gray-900 shadow-2xl overflow-y-auto animate-in slide-in-from-right">
            {detailLoading ? (
              <div className="p-6 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-6 w-6 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                  <div className="h-5 w-40 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                </div>
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="space-y-2 animate-pulse">
                    <div className="h-3 w-24 bg-gray-200 dark:bg-gray-800 rounded" />
                    <div className="h-4 w-full bg-gray-200 dark:bg-gray-800 rounded" />
                  </div>
                ))}
              </div>
            ) : selected ? (
              <>
                {/* Panel Header */}
                <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelected(null)}
                      className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors"
                    >
                      <IconChevronLeft size={18} />
                    </button>
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">KYC Details</h2>
                  </div>
                  <StatusBadge status={selected.status} />
                </div>

                <div className="p-6 space-y-6">
                  {/* User Info */}
                  <section>
                    <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">User Information</h3>
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-3">
                      <InfoRow label="Name" value={selected.user?.name || selected.fullName || "-"} />
                      <InfoRow label="Email" value={selected.user?.email || selected.email || "-"} />
                      <InfoRow label="Role" value={selected.user?.role || "-"} />
                    </div>
                  </section>

                  {/* KYC Info */}
                  <section>
                    <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">KYC Information</h3>
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-3">
                      <InfoRow label="Full Name" value={selected.fullName || "-"} />
                      <InfoRow
                        label="Phone"
                        value={
                          selected.phone
                            ? `${selected.phone.countryCode} ${selected.phone.number}`
                            : "-"
                        }
                      />
                      <InfoRow label="Gender" value={selected.gender || "-"} />
                      <InfoRow
                        label="Date of Birth"
                        value={
                          selected.dateOfBirth
                            ? `${formatDate(selected.dateOfBirth)}${selected.age ? ` (Age: ${selected.age})` : ""}`
                            : "-"
                        }
                      />
                      <InfoRow label="Country" value={selected.country || "-"} />
                      <InfoRow label="Government ID Type" value={selected.governmentIdType || "-"} />
                    </div>
                  </section>

                  {/* Document Preview */}
                  {selected.documentUrl && (
                    <section>
                      <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Document</h3>
                      <a
                        href={selected.documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-dashed border-gray-300 dark:border-gray-700 hover:border-amber-400 transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-amber-50 dark:bg-amber-500/10 flex items-center justify-center">
                            <IconFile className="h-5 w-5 text-amber-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-amber-600 transition-colors">
                              View Document
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{selected.governmentIdType}</p>
                          </div>
                        </div>
                      </a>
                    </section>
                  )}

                  {/* Submission Meta */}
                  <section>
                    <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Submission Info</h3>
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-3">
                      <InfoRow label="Submitted" value={formatDateTime(selected.createdAt)} />
                      {selected.reviewedAt && (
                        <InfoRow label="Reviewed" value={formatDateTime(selected.reviewedAt)} />
                      )}
                      {selected.reviewedBy && (
                        <InfoRow label="Reviewed By" value={selected.reviewedBy} />
                      )}
                    </div>
                  </section>

                  {/* Rejection Reason */}
                  {selected.status === "REJECTED" && selected.rejectionReason && (
                    <section>
                      <h3 className="text-xs font-semibold text-red-500 uppercase tracking-wider mb-3">Rejection Reason</h3>
                      <div className="bg-red-50 dark:bg-red-900/10 rounded-xl p-4 border border-red-200 dark:border-red-800">
                        <p className="text-sm text-red-700 dark:text-red-400">{selected.rejectionReason}</p>
                      </div>
                    </section>
                  )}

                  {/* Actions */}
                  {selected.status === "PENDING" && (
                    <section className="flex gap-3 pt-2">
                      <button
                        onClick={() => handleApprove(selected.id)}
                        disabled={actionLoading}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors"
                      >
                        {actionLoading ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : (
                          <IconCheck size={16} />
                        )}
                        Approve
                      </button>
                      <button
                        onClick={() => {
                          setRejectModal(selected);
                          setRejectReason("");
                        }}
                        disabled={actionLoading}
                        className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors"
                      >
                        <IconX size={16} />
                        Reject
                      </button>
                    </section>
                  )}

                  {selected.status === "APPROVED" && (
                    <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-200 dark:border-emerald-800">
                      <IconCheck className="h-5 w-5 text-emerald-600" />
                      <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                        This KYC submission has been approved
                      </span>
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => !actionLoading && setRejectModal(null)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Reject KYC Submission</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Please provide a reason for rejecting this submission. This will be shown to the user.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Enter rejection reason..."
              rows={4}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 resize-none"
            />
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setRejectModal(null);
                  setRejectReason("");
                }}
                disabled={actionLoading}
                className="px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading || !rejectReason.trim()}
                className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors flex items-center gap-2"
              >
                {actionLoading ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <IconX size={16} />
                )}
                Reject Submission
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs text-gray-500 dark:text-gray-400 shrink-0">{label}</span>
      <span className="text-sm font-medium text-gray-900 dark:text-white text-right">{value}</span>
    </div>
  );
}
