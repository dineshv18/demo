/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useMemo, useCallback } from "react";
import { IconPlus, IconUserCheck, IconUserX, IconTrash, IconEdit } from "@tabler/icons-react";
import { env } from "../config/env";

const API = env.API_URL;

export default function AdminsPage() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", email: "", password: "", assignedRoleId: "" });
  const [error, setError] = useState("");

  const headers = useMemo(() => {
    const h: Record<string, string> = { "Content-Type": "application/json" };
    const token = localStorage.getItem("token");
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }, []);

  const fetchAdmins = useCallback(async () => {
    try {
      const res = await fetch(`${API}/admins`, { headers, credentials: "include" });
      const data = await res.json();
      setAdmins(data.admins || []);
    } catch {
      setError("Failed to load admins");
    } finally {
      setLoading(false);
    }
  }, [headers]);

  const fetchRoles = useCallback(async () => {
    try {
      const res = await fetch(`${API}/roles`, { headers, credentials: "include" });
      const data = await res.json();
      setRoles(data.roles || []);
    } catch {
      // roles fetch failed silently
    }
  }, [headers]);

  useEffect(() => {
    fetchAdmins();
    fetchRoles();
  }, [fetchAdmins, fetchRoles]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const body: any = { ...form };
      if (editing) delete body.password;
      const method = editing ? "PUT" : "POST";
      const url = editing ? `${API}/admins/${editing.id}` : `${API}/admins`;
      const res = await fetch(url, { method, headers, credentials: "include", body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setShowModal(false);
      setEditing(null);
      setForm({ name: "", email: "", password: "", assignedRoleId: "" });
      fetchAdmins();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function toggleActive(admin: any) {
    const action = admin.isActive ? "deactivate" : "activate";
    try {
      const res = await fetch(`${API}/admins/${admin.id}/${action}`, { method: "POST", headers, credentials: "include" });
      if (!res.ok) throw new Error((await res.json()).message);
      fetchAdmins();
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this admin?")) return;
    try {
      const res = await fetch(`${API}/admins/${id}`, { method: "DELETE", headers, credentials: "include" });
      if (!res.ok) throw new Error((await res.json()).message);
      fetchAdmins();
    } catch (err: any) {
      alert(err.message);
    }
  }

  function openEdit(admin: any) {
    setEditing(admin);
    setForm({ name: admin.name, email: admin.email, password: "", assignedRoleId: admin.assignedRoleId || "" });
    setShowModal(true);
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admins</h1>
          <p className="text-muted-foreground text-sm">Manage admin accounts and role assignments</p>
        </div>
        <button onClick={() => { setEditing(null); setForm({ name: "", email: "", password: "", assignedRoleId: "" }); setShowModal(true); }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90">
          <IconPlus size={16} /> Add Admin
        </button>
      </div>

      {error && <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-md text-sm">{error}</div>}

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3 font-medium">Name</th>
              <th className="text-left p-3 font-medium">Email</th>
              <th className="text-left p-3 font-medium">Role</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="text-left p-3 font-medium">Last Login</th>
              <th className="text-right p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {admins.map((admin: any) => (
              <tr key={admin.id} className="border-t hover:bg-muted/30">
                <td className="p-3 font-medium">{admin.name}</td>
                <td className="p-3 text-muted-foreground">{admin.email}</td>
                <td className="p-3">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium" style={{ backgroundColor: admin.assignedRole?.color + "20", color: admin.assignedRole?.color }}>
                    {admin.assignedRole?.displayName || admin.role}
                  </span>
                </td>
                <td className="p-3">
                  <span className={`inline-flex items-center gap-1 text-xs ${admin.isActive ? "text-green-600" : "text-destructive"}`}>
                    {admin.isActive ? <IconUserCheck size={12} /> : <IconUserX size={12} />}
                    {admin.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="p-3 text-muted-foreground text-xs">
                  {admin.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleDateString() : "Never"}
                </td>
                <td className="p-3 text-right">
                  <div className="flex gap-1 justify-end">
                    <button onClick={() => openEdit(admin)} className="p-1 rounded hover:bg-muted"><IconEdit size={14} /></button>
                    <button onClick={() => toggleActive(admin)} className="p-1 rounded hover:bg-muted" title={admin.isActive ? "Deactivate" : "Activate"}>
                      {admin.isActive ? <IconUserX size={14} /> : <IconUserCheck size={14} />}
                    </button>
                    <button onClick={() => handleDelete(admin.id)} className="p-1 rounded hover:bg-destructive/10 text-destructive"><IconTrash size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border rounded-lg p-6 w-full max-w-md space-y-4">
            <h2 className="text-lg font-semibold">{editing ? "Edit Admin" : "Create Admin"}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-sm font-medium">Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-md bg-background text-sm" />
              </div>
              <div>
                <label className="text-sm font-medium">Email</label>
                <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-md bg-background text-sm" />
              </div>
              {!editing && (
                <div>
                  <label className="text-sm font-medium">Password</label>
                  <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border rounded-md bg-background text-sm" />
                </div>
              )}
              <div>
                <label className="text-sm font-medium">Assigned Role</label>
                <select value={form.assignedRoleId} onChange={(e) => setForm({ ...form, assignedRoleId: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-md bg-background text-sm">
                  <option value="">No role</option>
                  {roles.map((r: any) => (
                    <option key={r.id} value={r.id}>{r.displayName}</option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 justify-end">
                <button type="button" onClick={() => { setShowModal(false); setEditing(null); }} className="px-4 py-2 border rounded-md text-sm hover:bg-muted">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90">{editing ? "Update" : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
