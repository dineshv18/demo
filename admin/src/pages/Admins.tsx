/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useMemo, useCallback } from "react";
import { IconPlus, IconUserCheck, IconUserX, IconTrash, IconEdit } from "@tabler/icons-react";
import { env } from "../config/env";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "../components/ui/table";

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
          <h1 className="text-2xl font-bold text-[#10211D]">Admins</h1>
          <p className="text-[#68736E] text-sm">Manage admin accounts and role assignments</p>
        </div>
        <Button onClick={() => { setEditing(null); setForm({ name: "", email: "", password: "", assignedRoleId: "" }); setShowModal(true); }}
          className="rounded-xl bg-[#10211D] text-white hover:bg-[#10211D]/90">
          <IconPlus size={16} /> Add Admin
        </Button>
      </div>

      {error && <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-xl text-sm">{error}</div>}

      <Card className="overflow-hidden py-0 rounded-2xl border-[#DDE4DE] shadow-[0_8px_30px_rgba(16,33,29,0.05)]">
        <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#F7F8F4] hover:bg-[#F7F8F4]">
              <TableHead className="text-[#68736E]">Name</TableHead>
              <TableHead className="text-[#68736E]">Email</TableHead>
              <TableHead className="text-[#68736E]">Role</TableHead>
              <TableHead className="text-[#68736E]">Status</TableHead>
              <TableHead className="text-[#68736E]">Last Login</TableHead>
              <TableHead className="text-right text-[#68736E]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {admins.map((admin: any) => (
              <TableRow key={admin.id} className="border-[#DDE4DE]">
                <TableCell className="font-medium text-[#10211D]">{admin.name}</TableCell>
                <TableCell className="text-[#68736E]">{admin.email}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="rounded-full" style={{ backgroundColor: admin.assignedRole?.color + "20", color: admin.assignedRole?.color, borderColor: "transparent" }}>
                    {admin.assignedRole?.displayName || admin.role}
                  </Badge>
                </TableCell>
                <TableCell>
                  {admin.isActive ? (
                    <Badge className="rounded-full bg-[#EAF7E8] text-[#00A94F] border-transparent"><IconUserCheck size={12} /> Active</Badge>
                  ) : (
                    <Badge variant="destructive" className="rounded-full"><IconUserX size={12} /> Inactive</Badge>
                  )}
                </TableCell>
                <TableCell className="text-[#68736E] text-xs">
                  {admin.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleDateString() : "Never"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-1 justify-end">
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-[#10211D]" onClick={() => openEdit(admin)}><IconEdit size={14} /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-[#10211D]" onClick={() => toggleActive(admin)} title={admin.isActive ? "Deactivate" : "Activate"}>
                      {admin.isActive ? <IconUserX size={14} /> : <IconUserCheck size={14} />}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10" onClick={() => handleDelete(admin.id)}><IconTrash size={14} /></Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        </div>
      </Card>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md rounded-2xl border-[#DDE4DE]">
            <CardContent className="space-y-4">
              <h2 className="text-lg font-semibold text-[#10211D]">{editing ? "Edit Admin" : "Create Admin"}</h2>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-[#10211D]">Name</label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="mt-1 rounded-xl border-[#DDE4DE] focus-visible:ring-[#00A94F]" />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#10211D]">Email</label>
                  <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="mt-1 rounded-xl border-[#DDE4DE] focus-visible:ring-[#00A94F]" />
                </div>
                {!editing && (
                  <div>
                    <label className="text-sm font-medium text-[#10211D]">Password</label>
                    <Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="mt-1 rounded-xl border-[#DDE4DE] focus-visible:ring-[#00A94F]" />
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-[#10211D]">Assigned Role</label>
                  <select value={form.assignedRoleId} onChange={(e) => setForm({ ...form, assignedRoleId: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-[#DDE4DE] rounded-xl bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00A94F]">
                    <option value="">No role</option>
                    {roles.map((r: any) => (
                      <option key={r.id} value={r.id}>{r.displayName}</option>
                    ))}
                  </select>
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => { setShowModal(false); setEditing(null); }} className="rounded-xl border-[#DDE4DE] text-[#10211D]">Cancel</Button>
                  <Button type="submit" className="rounded-xl bg-[#10211D] text-white hover:bg-[#10211D]/90">{editing ? "Update" : "Create"}</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
