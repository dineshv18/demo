/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useMemo, useCallback } from "react";
import { IconPlus, IconUsers, IconSettings, IconTrash, IconEdit, IconCheck, IconEye, IconPencil, IconX } from "@tabler/icons-react";
import { env } from "../config/env";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../components/ui/table";

const API = env.API_URL;

export default function RolesPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [allPages, setAllPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingRole, setEditingRole] = useState<any>(null);
  const [form, setForm] = useState({ name: "", displayName: "", description: "", color: "#6366f1", theme: "default" });
  const [error, setError] = useState("");

  // Page assignment state
  const [showPageModal, setShowPageModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [pagePermissions, setPagePermissions] = useState<Record<string, { canView: boolean; canCreate: boolean; canEdit: boolean; canDelete: boolean }>>({});

  const headers = useMemo(() => {
    const h: Record<string, string> = { "Content-Type": "application/json" };
    const token = localStorage.getItem("token");
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }, []);

  const fetchRoles = useCallback(async () => {
    try {
      const res = await fetch(`${API}/roles`, { headers, credentials: "include" });
      const data = await res.json();
      setRoles(data.roles || []);
    } catch {
      setError("Failed to load roles");
    } finally {
      setLoading(false);
    }
  }, [headers]);

  const fetchPages = useCallback(async () => {
    try {
      const res = await fetch(`${API}/pages`, { headers, credentials: "include" });
      const data = await res.json();
      setAllPages(data.pages || []);
    } catch {
      // pages fetch failed
    }
  }, [headers]);

  useEffect(() => { fetchRoles(); fetchPages(); }, [fetchRoles, fetchPages]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const method = editingRole ? "PUT" : "POST";
      const url = editingRole ? `${API}/roles/${editingRole.id}` : `${API}/roles`;
      const res = await fetch(url, { method, headers, credentials: "include", body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setShowModal(false);
      setEditingRole(null);
      setForm({ name: "", displayName: "", description: "", color: "#6366f1", theme: "default" });
      fetchRoles();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this role?")) return;
    try {
      const res = await fetch(`${API}/roles/${id}`, { method: "DELETE", headers, credentials: "include" });
      if (!res.ok) throw new Error((await res.json()).message);
      fetchRoles();
    } catch (err: any) {
      alert(err.message);
    }
  }

  function openEdit(role: any) {
    setEditingRole(role);
    setForm({ name: role.name, displayName: role.displayName, description: role.description || "", color: role.color, theme: role.theme });
    setShowModal(true);
  }

  function openPageAssignment(role: any) {
    setSelectedRole(role);
    const perms: Record<string, { canView: boolean; canCreate: boolean; canEdit: boolean; canDelete: boolean }> = {};
    for (const page of allPages) {
      const assigned = role.pages?.find((rp: any) => rp.page.id === page.id);
      perms[page.id] = assigned
        ? { canView: assigned.canView, canCreate: assigned.canCreate, canEdit: assigned.canEdit, canDelete: assigned.canDelete }
        : { canView: false, canCreate: false, canEdit: false, canDelete: false };
    }
    setPagePermissions(perms);
    setShowPageModal(true);
  }

  async function savePageAssignment() {
    if (!selectedRole) return;
    try {
      const pages = Object.entries(pagePermissions)
        .filter(([, p]) => p.canView || p.canCreate || p.canEdit || p.canDelete)
        .map(([pageId, p]) => ({ pageId, ...p }));

      const res = await fetch(`${API}/roles/${selectedRole.id}/pages`, {
        method: "POST", headers, credentials: "include",
        body: JSON.stringify({ pages }),
      });
      if (!res.ok) throw new Error((await res.json()).message);
      setShowPageModal(false);
      setSelectedRole(null);
      fetchRoles();
    } catch (err: any) {
      alert(err.message);
    }
  }

  function togglePagePermission(pageId: string, perm: "canView" | "canCreate" | "canEdit" | "canDelete") {
    setPagePermissions((prev) => ({
      ...prev,
      [pageId]: { ...prev[pageId], [perm]: !prev[pageId]?.[perm] },
    }));
  }

  function selectAllPages() {
    const updated: typeof pagePermissions = {};
    for (const page of allPages) {
      updated[page.id] = { canView: true, canCreate: true, canEdit: true, canDelete: true };
    }
    setPagePermissions(updated);
  }

  function deselectAllPages() {
    const updated: typeof pagePermissions = {};
    for (const page of allPages) {
      updated[page.id] = { canView: false, canCreate: false, canEdit: false, canDelete: false };
    }
    setPagePermissions(updated);
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#10211D]">Roles</h1>
          <p className="text-[#68736E] text-sm">Manage roles, assign pages and permissions</p>
        </div>
        <Button onClick={() => { setEditingRole(null); setForm({ name: "", displayName: "", description: "", color: "#6366f1", theme: "default" }); setShowModal(true); }}
          className="rounded-xl bg-[#10211D] text-white hover:bg-[#10211D]/90">
          <IconPlus size={16} /> Add Role
        </Button>
      </div>

      {error && <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-xl text-sm">{error}</div>}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {roles.map((role: any) => (
          <Card key={role.id} className="rounded-2xl border-[#DDE4DE] shadow-[0_8px_30px_rgba(16,33,29,0.05)]">
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: role.color }} />
                  <h3 className="font-semibold text-[#10211D] truncate">{role.displayName}</h3>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-[#10211D]" onClick={() => openEdit(role)} title="Edit"><IconEdit size={14} /></Button>
                  {!role.isSystem && (
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10" onClick={() => handleDelete(role.id)} title="Delete"><IconTrash size={14} /></Button>
                  )}
                </div>
              </div>
              {role.description && <p className="text-sm text-[#68736E]">{role.description}</p>}
              <div className="flex items-center gap-4 text-xs text-[#68736E]">
                <span className="flex items-center gap-1"><IconUsers size={12} /> {role._count?.users || 0} users</span>
                <span className="flex items-center gap-1"><IconSettings size={12} /> {role.pages?.length || 0} pages</span>
              </div>
              {role.isSystem && <Badge variant="secondary" className="rounded-full bg-[#F3F8EF] text-[#10211D] border-transparent">System</Badge>}

              {/* Assigned pages preview */}
              {role.pages && role.pages.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {role.pages.slice(0, 5).map((rp: any) => (
                    <Badge key={rp.page.id} variant="secondary" className="text-[10px] rounded-full bg-[#F3F8EF] text-[#10211D] border-transparent">
                      {rp.page.name}
                    </Badge>
                  ))}
                  {role.pages.length > 5 && (
                    <Badge variant="secondary" className="text-[10px] rounded-full bg-[#F3F8EF] text-[#10211D] border-transparent">
                      +{role.pages.length - 5} more
                    </Badge>
                  )}
                </div>
              )}

              {/* Assign Pages button */}
              <Button variant="outline" size="sm" className="w-full rounded-xl border-[#DDE4DE] text-[#10211D]" onClick={() => openPageAssignment(role)}>
                <IconSettings size={12} /> Assign Pages
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Create/Edit Role Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md rounded-2xl border-[#DDE4DE]">
            <CardContent className="space-y-4">
              <h2 className="text-lg font-semibold text-[#10211D]">{editingRole ? "Edit Role" : "Create Role"}</h2>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-[#10211D]">Name</label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} disabled={!!editingRole}
                    className="mt-1 rounded-xl border-[#DDE4DE] focus-visible:ring-[#00A94F]" placeholder="e.g. manager" />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#10211D]">Display Name</label>
                  <Input value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                    className="mt-1 rounded-xl border-[#DDE4DE] focus-visible:ring-[#00A94F]" placeholder="e.g. Manager" />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#10211D]">Description</label>
                  <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="mt-1 rounded-xl border-[#DDE4DE] focus-visible:ring-[#00A94F]" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-[#10211D]">Color</label>
                    <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })}
                      className="w-full mt-1 h-10 border border-[#DDE4DE] rounded-xl cursor-pointer" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#10211D]">Theme</label>
                    <select value={form.theme} onChange={(e) => setForm({ ...form, theme: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border border-[#DDE4DE] rounded-xl bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00A94F]">
                      <option value="default">Default</option>
                      <option value="dark">Dark</option>
                      <option value="light">Light</option>
                      <option value="ocean">Ocean</option>
                      <option value="forest">Forest</option>
                      <option value="sunset">Sunset</option>
                    </select>
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => { setShowModal(false); setEditingRole(null); }} className="rounded-xl border-[#DDE4DE] text-[#10211D]">Cancel</Button>
                  <Button type="submit" className="rounded-xl bg-[#10211D] text-white hover:bg-[#10211D]/90">{editingRole ? "Update" : "Create"}</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Page Assignment Modal */}
      {showPageModal && selectedRole && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden rounded-2xl border-[#DDE4DE]">
            <CardContent className="flex flex-col min-h-0 flex-1">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-[#10211D]">Assign Pages — {selectedRole.displayName}</h2>
                  <p className="text-sm text-[#68736E]">Toggle permissions for each page</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-[#10211D]" onClick={() => { setShowPageModal(false); setSelectedRole(null); }}>
                  <IconX size={18} />
                </Button>
              </div>

              <div className="flex gap-2 mb-4">
                <Button variant="outline" size="sm" onClick={selectAllPages} className="rounded-xl border-[#DDE4DE] text-[#10211D]">Select All</Button>
                <Button variant="outline" size="sm" onClick={deselectAllPages} className="rounded-xl border-[#DDE4DE] text-[#10211D]">Deselect All</Button>
              </div>

              <div className="flex-1 overflow-y-auto overflow-x-auto border border-[#DDE4DE] rounded-xl">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#F7F8F4] hover:bg-[#F7F8F4] sticky top-0">
                      <TableHead className="text-[#68736E]">Page</TableHead>
                      <TableHead className="text-center w-16 text-[#68736E]"><IconEye size={14} className="mx-auto" /></TableHead>
                      <TableHead className="text-center w-16 text-[#68736E]"><IconPlus size={14} className="mx-auto" /></TableHead>
                      <TableHead className="text-center w-16 text-[#68736E]"><IconPencil size={14} className="mx-auto" /></TableHead>
                      <TableHead className="text-center w-16 text-[#68736E]"><IconTrash size={14} className="mx-auto" /></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allPages.map((page: any) => {
                      const perms = pagePermissions[page.id] || { canView: false, canCreate: false, canEdit: false, canDelete: false };
                      return (
                        <TableRow key={page.id} className="border-[#DDE4DE]">
                          <TableCell>
                            <div className="font-medium text-[#10211D]">{page.name}</div>
                            <div className="text-xs text-[#68736E] font-mono">/{page.slug}</div>
                          </TableCell>
                          {(["canView", "canCreate", "canEdit", "canDelete"] as const).map((perm) => (
                            <TableCell key={perm} className="text-center">
                              <button
                                onClick={() => togglePagePermission(page.id, perm)}
                                className={`w-6 h-6 rounded-md border flex items-center justify-center transition-colors ${
                                  perms[perm]
                                    ? "bg-[#00A94F] border-[#00A94F] text-white"
                                    : "border-[#DDE4DE] hover:border-[#00A94F]/60"
                                }`}
                              >
                                {perms[perm] && <IconCheck size={12} />}
                              </button>
                            </TableCell>
                          ))}
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              <div className="flex gap-2 justify-end mt-4">
                <Button variant="outline" onClick={() => { setShowPageModal(false); setSelectedRole(null); }} className="rounded-xl border-[#DDE4DE] text-[#10211D]">Cancel</Button>
                <Button onClick={savePageAssignment} className="rounded-xl bg-[#10211D] text-white hover:bg-[#10211D]/90">Save Assignment</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
