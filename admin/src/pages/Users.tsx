/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useCallback } from "react";
import {
  IconUsers,
  IconSearch,
  IconCheck,
  IconX,
  IconLoader2,
  IconTrash,
} from "@tabler/icons-react";
import { usersAPI, type AdminUser } from "../services/api";

export default function Users() {
  const [users, setUsers] = useState<(AdminUser & { wallet?: { currency: string; balance: string } | null })[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [deleteModal, setDeleteModal] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState(false);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await usersAPI.getAll({ limit: 100, search: search || undefined });
      setUsers(data.users || []);
    } catch (err: any) {
      showToast("error", err.message || "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const toggleActive = async (id: string) => {
    setUpdating(id);
    try {
      const data = await usersAPI.toggleActive(id);
      setUsers((prev) => prev.map((u) => u.id === id ? { ...u, isActive: data.user.isActive } : u));
      showToast("success", `User ${data.user.isActive ? "activated" : "deactivated"}`);
    } catch (err: any) {
      showToast("error", err.message || "Failed to update user");
    } finally {
      setUpdating(null);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal) return;
    setDeleting(true);
    try {
      await usersAPI.delete(deleteModal.id);
      setUsers((prev) => prev.filter((u) => u.id !== deleteModal.id));
      showToast("success", `User ${deleteModal.email} deleted`);
      setDeleteModal(null);
    } catch (err: any) {
      showToast("error", err.message || "Failed to delete user");
    } finally {
      setDeleting(false);
    }
  };

  const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }) : "-";

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-[100] px-5 py-3 rounded-lg shadow-lg text-sm font-medium text-white ${toast.type === "success" ? "bg-emerald-600" : "bg-red-600"}`}>
          {toast.message}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Users</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Manage client users and toggle active status.</p>
      </div>

      <div className="relative">
        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input type="text" placeholder="Search by name or email..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500" />
      </div>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        {loading ? (
          <div className="p-6 text-center text-sm text-gray-500 flex items-center justify-center gap-2">
            <IconLoader2 className="h-4 w-4 animate-spin" /> Loading...
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-14 w-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
              <IconUsers className="h-7 w-7 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-white">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50">
                  <th className="text-left px-5 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">User</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Role</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Balance</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Status</th>
                  <th className="text-left px-5 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Joined</th>
                  <th className="text-right px-5 py-3 font-semibold text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {u.name?.charAt(0)?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{u.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                        {u.assignedRole?.displayName || u.role}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                        $ USD
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      {u.isActive ? (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400"><IconCheck size={12} /> Active</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-red-500"><IconX size={12} /> Inactive</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-xs text-gray-500 dark:text-gray-400">{fmtDate(u.createdAt)}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => toggleActive(u.id)} disabled={updating === u.id}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 disabled:opacity-50">
                          {updating === u.id ? <IconLoader2 className="h-3.5 w-3.5 animate-spin inline" /> : u.isActive ? "Deactivate" : "Activate"}
                        </button>
                        <button onClick={() => setDeleteModal(u)} disabled={u.role === "SUPER_ADMIN"}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-30 disabled:cursor-not-allowed">
                          <IconTrash className="h-3.5 w-3.5 inline" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => !deleting && setDeleteModal(null)} />
          <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4 mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete User</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Are you sure you want to permanently delete <strong>{deleteModal.email}</strong>? This action cannot be undone. All their data including wallet, transactions, and KYC will be removed.
            </p>
            <div className="flex gap-3 pt-2">
              <button onClick={handleDelete} disabled={deleting}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-colors">
                {deleting ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" /> : <IconTrash size={16} />}
                {deleting ? "Deleting..." : "Delete Permanently"}
              </button>
              <button onClick={() => setDeleteModal(null)} disabled={deleting}
                className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-800 rounded-xl text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-50 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}