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
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../components/ui/table";

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
        <div className={`fixed top-4 right-4 z-[100] px-5 py-3 rounded-xl shadow-[0_8px_30px_rgba(16,33,29,0.15)] text-sm font-medium text-white ${toast.type === "success" ? "bg-[#00A94F]" : "bg-red-600"}`}>
          {toast.message}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#10211D]">Users</h1>
        <p className="mt-1 text-sm text-[#68736E]">Manage client users and toggle active status.</p>
      </div>

      <div className="relative">
        <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#89938E]" />
        <Input type="text" placeholder="Search by name or email..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 rounded-xl border-[#DDE4DE] focus-visible:ring-[#00A94F]" />
      </div>

      <Card className="overflow-hidden py-0 rounded-2xl border-[#DDE4DE] shadow-[0_8px_30px_rgba(16,33,29,0.05)]">
        {loading ? (
          <div className="p-6 text-center text-sm text-[#68736E] flex items-center justify-center gap-2">
            <IconLoader2 className="h-4 w-4 animate-spin" /> Loading...
          </div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="h-14 w-14 rounded-full bg-[#F3F8EF] flex items-center justify-center mb-4">
              <IconUsers className="h-7 w-7 text-[#68736E]" />
            </div>
            <p className="text-sm font-medium text-[#10211D]">No users found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#F7F8F4] hover:bg-[#F7F8F4]">
                <TableHead className="text-[#68736E]">User</TableHead>
                <TableHead className="text-[#68736E]">Role</TableHead>
                <TableHead className="text-[#68736E]">Balance</TableHead>
                <TableHead className="text-[#68736E]">Status</TableHead>
                <TableHead className="text-[#68736E]">Joined</TableHead>
                <TableHead className="text-right text-[#68736E]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id} className="border-[#DDE4DE]">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-[#10211D] flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {u.name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-[#10211D] whitespace-nowrap">{u.name}</p>
                        <p className="text-xs text-[#68736E] whitespace-nowrap">{u.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="rounded-full bg-[#F3F8EF] text-[#10211D] border-transparent">
                      {u.assignedRole?.displayName || u.role}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="rounded-full text-[#10211D] border-[#DDE4DE] bg-[#F7F8F4]">
                      $ USD
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {u.isActive ? (
                      <Badge className="rounded-full bg-[#EAF7E8] text-[#00A94F] border-transparent"><IconCheck size={12} /> Active</Badge>
                    ) : (
                      <Badge variant="destructive" className="rounded-full"><IconX size={12} /> Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-xs text-[#68736E]">{fmtDate(u.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => toggleActive(u.id)} disabled={updating === u.id}
                        className="rounded-xl border-[#DDE4DE] text-[#10211D]">
                        {updating === u.id ? <IconLoader2 className="h-3.5 w-3.5 animate-spin" /> : u.isActive ? "Deactivate" : "Activate"}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setDeleteModal(u)} disabled={u.role === "SUPER_ADMIN"}
                        className="rounded-xl border-red-200 text-red-600 hover:bg-red-50">
                        <IconTrash className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        )}
      </Card>

      {/* Delete Confirmation Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => !deleting && setDeleteModal(null)} />
          <Card className="relative w-full max-w-md mx-4 rounded-2xl border-[#DDE4DE] shadow-2xl">
            <CardContent className="space-y-4">
              <h3 className="text-lg font-semibold text-[#10211D]">Delete User</h3>
              <p className="text-sm text-[#68736E]">
                Are you sure you want to permanently delete <strong className="text-[#10211D]">{deleteModal.email}</strong>? This action cannot be undone. All their data including wallet, transactions, and KYC will be removed.
              </p>
              <div className="flex gap-3 pt-2">
                <Button onClick={handleDelete} disabled={deleting} variant="destructive" className="flex-1 rounded-xl">
                  {deleting ? <IconLoader2 className="h-4 w-4 animate-spin" /> : <IconTrash size={16} />}
                  {deleting ? "Deleting..." : "Delete Permanently"}
                </Button>
                <Button onClick={() => setDeleteModal(null)} disabled={deleting} variant="outline" className="flex-1 rounded-xl border-[#DDE4DE] text-[#10211D]">
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}