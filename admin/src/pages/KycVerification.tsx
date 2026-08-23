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
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../components/ui/table";

type FilterStatus = "ALL" | "PENDING" | "APPROVED" | "REJECTED";

const statusConfig: Record<FilterStatus, { label: string; color: string; bg: string }> = {
  ALL: { label: "All", color: "text-[#68736E]", bg: "bg-[#F3F8EF]" },
  PENDING: { label: "Pending", color: "text-amber-700", bg: "bg-amber-100" },
  APPROVED: { label: "Approved", color: "text-[#00A94F]", bg: "bg-[#EAF7E8]" },
  REJECTED: { label: "Rejected", color: "text-red-700", bg: "bg-red-100" },
};

const filterTabs: FilterStatus[] = ["ALL", "PENDING", "APPROVED", "REJECTED"];

function StatusBadge({ status }: { status: string }) {
  const cfg = statusConfig[status as FilterStatus] || statusConfig.ALL;
  return (
    <Badge className={`gap-1.5 rounded-full ${cfg.bg} ${cfg.color}`}>
      {status === "PENDING" && <IconClock size={12} />}
      {status === "APPROVED" && <IconCheck size={12} />}
      {status === "REJECTED" && <IconX size={12} />}
      {status}
    </Badge>
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
        <h1 className="text-2xl font-bold tracking-tight text-[#10211D]">KYC Verification</h1>
        <p className="mt-1 text-sm text-[#68736E]">
          Review and manage user identity verification submissions
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Sidebar - Filters */}
        <div className="w-full lg:w-64 shrink-0">
          <Card className="p-4 space-y-2">
            <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 mb-3">
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
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    filter === tab
                      ? "bg-[#EAF7E8] text-[#00A94F]"
                      : "text-[#68736E] hover:bg-[#F3F8EF]"
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
                        ? "bg-[#00A94F]/15 text-[#00A94F]"
                        : "bg-[#F3F8EF] text-[#89938E]"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </Card>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Search */}
          <div className="mb-4">
            <div className="relative">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Table */}
          <Card className="overflow-hidden py-0">
            {loading ? (
              <div className="divide-y">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="p-4 flex items-center gap-4 animate-pulse">
                    <div className="h-10 w-10 rounded-full bg-muted" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-48 bg-muted rounded" />
                      <div className="h-3 w-32 bg-muted rounded" />
                    </div>
                    <div className="h-6 w-20 bg-muted rounded-full" />
                  </div>
                ))}
              </div>
            ) : filteredSubmissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mb-4">
                  <IconUserCheck className="h-7 w-7 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">No KYC submissions found</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {filter === "ALL" ? "No submissions yet" : `No ${filter.toLowerCase()} submissions`}
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSubmissions.map((sub) => (
                    <TableRow
                      key={sub.id}
                      className="cursor-pointer"
                      onClick={() => openDetail(sub.id)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-9 w-9 rounded-full bg-[#10211D] flex items-center justify-center text-white text-xs font-bold shrink-0">
                            {sub.fullName?.charAt(0)?.toUpperCase() || sub.user?.name?.charAt(0)?.toUpperCase() || "?"}
                          </div>
                          <div>
                            <p className="font-medium">{sub.fullName || sub.user?.name || "Unknown"}</p>
                            <p className="text-xs text-muted-foreground">{sub.user?.role || "User"}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{sub.email || sub.user?.email || "-"}</TableCell>
                      <TableCell className="text-muted-foreground text-xs">{formatDate(sub.createdAt)}</TableCell>
                      <TableCell><StatusBadge status={sub.status} /></TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <IconEye size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

            {/* Pagination */}
            {!loading && totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t">
                <p className="text-xs text-muted-foreground">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
                    Next
                  </Button>
                </div>
              </div>
            )}
          </Card>
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
                      <InfoRow label="Address Proof Type" value={selected.addressProofType || "-"} />
                    </div>
                  </section>

                  {/* Document Preview */}
                  {selected.documentUrl && (
                    <section>
                      <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Government ID (Front)</h3>
                      <a
                        href={selected.documentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-dashed border-gray-300 dark:border-gray-700 hover:border-[#00A94F] transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-[#EAF7E8] flex items-center justify-center">
                            <IconFile className="h-5 w-5 text-[#00A94F]" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-[#00A94F] transition-colors">
                              View Front
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{selected.governmentIdType} — Front Side</p>
                          </div>
                        </div>
                      </a>
                    </section>
                  )}
                  {selected.documentUrlBack && (
                    <section>
                      <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Government ID (Back)</h3>
                      <a
                        href={selected.documentUrlBack}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-dashed border-gray-300 dark:border-gray-700 hover:border-[#00A94F] transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-[#EAF7E8] flex items-center justify-center">
                            <IconFile className="h-5 w-5 text-[#00A94F]" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-[#00A94F] transition-colors">
                              View Back
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{selected.governmentIdType} — Back Side</p>
                          </div>
                        </div>
                      </a>
                    </section>
                  )}
                  {selected.addressDocUrl && (
                    <section>
                      <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Address Proof (Front)</h3>
                      <a
                        href={selected.addressDocUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-dashed border-gray-300 dark:border-gray-700 hover:border-[#00A94F] transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-[#EAF7E8] flex items-center justify-center">
                            <IconFile className="h-5 w-5 text-[#00A94F]" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-[#00A94F] transition-colors">
                              View Front
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{selected.addressProofType} — Front Side</p>
                          </div>
                        </div>
                      </a>
                    </section>
                  )}
                  {selected.addressDocUrlBack && (
                    <section>
                      <h3 className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Address Proof (Back)</h3>
                      <a
                        href={selected.addressDocUrlBack}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 border border-dashed border-gray-300 dark:border-gray-700 hover:border-[#00A94F] transition-colors group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-[#EAF7E8] flex items-center justify-center">
                            <IconFile className="h-5 w-5 text-[#00A94F]" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-[#00A94F] transition-colors">
                              View Back
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{selected.addressProofType} — Back Side</p>
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
                      <Button
                        onClick={() => handleApprove(selected.id)}
                        disabled={actionLoading}
                        className="flex-1 bg-[#00A94F] hover:bg-[#00A94F]/90 text-white rounded-xl"
                      >
                        {actionLoading ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        ) : (
                          <IconCheck size={16} />
                        )}
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          setRejectModal(selected);
                          setRejectReason("");
                        }}
                        disabled={actionLoading}
                        className="flex-1"
                      >
                        <IconX size={16} />
                        Reject
                      </Button>
                    </section>
                  )}

                  {selected.status === "APPROVED" && (
                    <div className="flex items-center gap-2 px-4 py-3 bg-[#EAF7E8] rounded-xl border border-[#00A94F]/30">
                      <IconCheck className="h-5 w-5 text-[#00A94F]" />
                      <span className="text-sm font-medium text-[#00A94F]">
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50" onClick={() => !actionLoading && setRejectModal(null)} />
          <Card className="relative w-full max-w-md shadow-2xl">
            <div className="px-6 py-6 space-y-4">
              <h3 className="text-lg font-semibold">Reject KYC Submission</h3>
              <p className="text-sm text-muted-foreground">
                Please provide a reason for rejecting this submission. This will be shown to the user.
              </p>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Enter rejection reason..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border bg-background text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500 resize-none"
              />
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setRejectModal(null);
                    setRejectReason("");
                  }}
                  disabled={actionLoading}
                >
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleReject}
                  disabled={actionLoading || !rejectReason.trim()}
                >
                  {actionLoading ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <IconX size={16} />
                  )}
                  Reject Submission
                </Button>
              </div>
            </div>
          </Card>
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
