/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useMemo, useCallback } from "react";
import { IconPlus, IconUsers, IconSettings, IconTrash, IconEdit, IconCheck, IconEye, IconPencil, IconX } from "@tabler/icons-react";
import { env } from "../config/env";

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
          <h1 className="text-2xl font-bold">Roles</h1>
          <p className="text-muted-foreground text-sm">Manage roles, assign pages and permissions</p>
        </div>
        <button onClick={() => { setEditingRole(null); setForm({ name: "", displayName: "", description: "", color: "#6366f1", theme: "default" }); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90">
          <IconPlus size={16} /> Add Role
        </button>
      </div>

      {error && <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-md text-sm">{error}</div>}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {roles.map((role: any) => (
          <div key={role.id} className="border rounded-lg p-4 space-y-3 bg-card">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: role.color }} />
                <h3 className="font-semibold">{role.displayName}</h3>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(role)} className="p-1 rounded hover:bg-muted" title="Edit"><IconEdit size={14} /></button>
                {!role.isSystem && (
                  <button onClick={() => handleDelete(role.id)} className="p-1 rounded hover:bg-destructive/10 text-destructive" title="Delete"><IconTrash size={14} /></button>
                )}
              </div>
            </div>
            {role.description && <p className="text-sm text-muted-foreground">{role.description}</p>}
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><IconUsers size={12} /> {role._count?.users || 0} users</span>
              <span className="flex items-center gap-1"><IconSettings size={12} /> {role.pages?.length || 0} pages</span>
            </div>
            {role.isSystem && <span className="text-xs bg-muted px-2 py-0.5 rounded">System</span>}

            {/* Assigned pages preview */}
            {role.pages && role.pages.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {role.pages.slice(0, 5).map((rp: any) => (
                  <span key={rp.page.id} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                    {rp.page.name}
                  </span>
                ))}
                {role.pages.length > 5 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                    +{role.pages.length - 5} more
                  </span>
                )}
              </div>
            )}

            {/* Assign Pages button */}
            <button onClick={() => openPageAssignment(role)}
              className="w-full flex items-center justify-center gap-2 px-3 py-1.5 border rounded-md text-xs font-medium hover:bg-muted transition-colors">
              <IconSettings size={12} /> Assign Pages
            </button>
          </div>
        ))}
      </div>

      {/* Create/Edit Role Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border rounded-lg p-6 w-full max-w-md space-y-4">
            <h2 className="text-lg font-semibold">{editingRole ? "Edit Role" : "Create Role"}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-sm font-medium">Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} disabled={!!editingRole}
                  className="w-full mt-1 px-3 py-2 border rounded-md bg-background text-sm disabled:opacity-50" placeholder="e.g. manager" />
              </div>
              <div>
                <label className="text-sm font-medium">Display Name</label>
                <input value={form.displayName} onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-md bg-background text-sm" placeholder="e.g. Manager" />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-md bg-background text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Color</label>
                  <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })}
                    className="w-full mt-1 h-10 border rounded-md cursor-pointer" />
                </div>
                <div>
                  <label className="text-sm font-medium">Theme</label>
                  <select value={form.theme} onChange={(e) => setForm({ ...form, theme: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border rounded-md bg-background text-sm">
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
                <button type="button" onClick={() => { setShowModal(false); setEditingRole(null); }} className="px-4 py-2 border rounded-md text-sm hover:bg-muted">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90">{editingRole ? "Update" : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Page Assignment Modal */}
      {showPageModal && selectedRole && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border rounded-lg p-6 w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">Assign Pages — {selectedRole.displayName}</h2>
                <p className="text-sm text-muted-foreground">Toggle permissions for each page</p>
              </div>
              <button onClick={() => { setShowPageModal(false); setSelectedRole(null); }} className="p-1 rounded hover:bg-muted">
                <IconX size={18} />
              </button>
            </div>

            <div className="flex gap-2 mb-4">
              <button onClick={selectAllPages} className="px-3 py-1 border rounded text-xs hover:bg-muted">Select All</button>
              <button onClick={deselectAllPages} className="px-3 py-1 border rounded text-xs hover:bg-muted">Deselect All</button>
            </div>

            <div className="flex-1 overflow-y-auto border rounded-lg">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 sticky top-0">
                  <tr>
                    <th className="text-left p-3 font-medium">Page</th>
                    <th className="text-center p-3 font-medium w-16"><IconEye size={14} className="mx-auto" /></th>
                    <th className="text-center p-3 font-medium w-16"><IconPlus size={14} className="mx-auto" /></th>
                    <th className="text-center p-3 font-medium w-16"><IconPencil size={14} className="mx-auto" /></th>
                    <th className="text-center p-3 font-medium w-16"><IconTrash size={14} className="mx-auto" /></th>
                  </tr>
                </thead>
                <tbody>
                  {allPages.map((page: any) => {
                    const perms = pagePermissions[page.id] || { canView: false, canCreate: false, canEdit: false, canDelete: false };
                    return (
                      <tr key={page.id} className="border-t hover:bg-muted/30">
                        <td className="p-3">
                          <div className="font-medium">{page.name}</div>
                          <div className="text-xs text-muted-foreground font-mono">/{page.slug}</div>
                        </td>
                        {(["canView", "canCreate", "canEdit", "canDelete"] as const).map((perm) => (
                          <td key={perm} className="p-3 text-center">
                            <button
                              onClick={() => togglePagePermission(page.id, perm)}
                              className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${
                                perms[perm]
                                  ? "bg-primary border-primary text-primary-foreground"
                                  : "border-muted-foreground/30 hover:border-muted-foreground/60"
                              }`}
                            >
                              {perms[perm] && <IconCheck size={12} />}
                            </button>
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex gap-2 justify-end mt-4">
              <button onClick={() => { setShowPageModal(false); setSelectedRole(null); }} className="px-4 py-2 border rounded-md text-sm hover:bg-muted">Cancel</button>
              <button onClick={savePageAssignment} className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90">Save Assignment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
