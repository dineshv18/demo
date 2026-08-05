/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useMemo, useCallback } from "react";
import { IconPlus, IconTrash, IconEdit, IconFile, IconRefresh } from "@tabler/icons-react";
import { env } from "../config/env";

const API = env.API_URL;

const categoryColors: Record<string, string> = {
  main: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  management: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
  finance: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  content: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  analytics: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400",
  system: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
  general: "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400",
};

export default function PagesPage() {
  const [pages, setPages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ slug: "", name: "", description: "", icon: "", category: "general" });
  const [error, setError] = useState("");

  const headers = useMemo(() => {
    const h: Record<string, string> = { "Content-Type": "application/json" };
    const token = localStorage.getItem("token");
    if (token) h.Authorization = `Bearer ${token}`;
    return h;
  }, []);

  const fetchPages = useCallback(async () => {
    try {
      const res = await fetch(`${API}/pages`, { headers, credentials: "include" });
      const data = await res.json();
      setPages(data.pages || []);
    } catch {
      setError("Failed to load pages");
    } finally {
      setLoading(false);
    }
  }, [headers]);

  useEffect(() => { fetchPages(); }, [fetchPages]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    try {
      const method = editing ? "PUT" : "POST";
      const url = editing ? `${API}/pages/${editing.id}` : `${API}/pages`;
      const res = await fetch(url, { method, headers, credentials: "include", body: JSON.stringify(form) });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setShowModal(false);
      setEditing(null);
      setForm({ slug: "", name: "", description: "", icon: "", category: "general" });
      fetchPages();
    } catch (err: any) {
      setError(err.message);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this page?")) return;
    try {
      const res = await fetch(`${API}/pages/${id}`, { method: "DELETE", headers, credentials: "include" });
      if (!res.ok) throw new Error((await res.json()).message);
      fetchPages();
    } catch (err: any) {
      alert(err.message);
    }
  }

  async function handleSeed() {
    if (!confirm("Seed default pages? Existing pages won't be duplicated.")) return;
    try {
      const res = await fetch(`${API}/pages/seed`, { method: "POST", headers, credentials: "include" });
      if (!res.ok) throw new Error((await res.json()).message);
      fetchPages();
    } catch (err: any) {
      alert(err.message);
    }
  }

  function openEdit(page: any) {
    setEditing(page);
    setForm({ slug: page.slug, name: page.name, description: page.description || "", icon: page.icon || "", category: page.category });
    setShowModal(true);
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Pages</h1>
          <p className="text-muted-foreground text-sm">Manage pages that can be assigned to roles</p>
        </div>
        <div className="flex gap-2">
          <button onClick={handleSeed}
            className="flex items-center gap-2 px-4 py-2 border rounded-md text-sm font-medium hover:bg-muted">
            <IconRefresh size={16} /> Seed Defaults
          </button>
          <button onClick={() => { setEditing(null); setForm({ slug: "", name: "", description: "", icon: "", category: "general" }); setShowModal(true); }}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90">
            <IconPlus size={16} /> Add Page
          </button>
        </div>
      </div>

      {error && <div className="bg-destructive/10 text-destructive px-4 py-2 rounded-md text-sm">{error}</div>}

      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
        {pages.map((page: any) => (
          <div key={page.id} className="border rounded-lg p-4 bg-card space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <IconFile size={16} className="text-muted-foreground" />
                <h3 className="font-semibold text-sm">{page.name}</h3>
              </div>
              <div className="flex gap-1">
                <button onClick={() => openEdit(page)} className="p-1 rounded hover:bg-muted"><IconEdit size={14} /></button>
                <button onClick={() => handleDelete(page.id)} className="p-1 rounded hover:bg-destructive/10 text-destructive"><IconTrash size={14} /></button>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-xs px-2 py-0.5 rounded ${categoryColors[page.category] || categoryColors.general}`}>
                {page.category}
              </span>
              <span className="text-xs text-muted-foreground font-mono">/{page.slug}</span>
            </div>
            {page.description && <p className="text-xs text-muted-foreground">{page.description}</p>}
            {page.roles?.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {page.roles.map((r: any) => (
                  <span key={r.role.id} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">
                    {r.role.displayName}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card border rounded-lg p-6 w-full max-w-md space-y-4">
            <h2 className="text-lg font-semibold">{editing ? "Edit Page" : "Create Page"}</h2>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-sm font-medium">Slug</label>
                <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} disabled={!!editing}
                  className="w-full mt-1 px-3 py-2 border rounded-md bg-background text-sm disabled:opacity-50 font-mono" placeholder="e.g. dashboard" />
              </div>
              <div>
                <label className="text-sm font-medium">Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-md bg-background text-sm" placeholder="e.g. Dashboard" />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border rounded-md bg-background text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Icon</label>
                  <input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border rounded-md bg-background text-sm font-mono" placeholder="IconLayoutDashboard" />
                </div>
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border rounded-md bg-background text-sm">
                    <option value="main">Main</option>
                    <option value="management">Management</option>
                    <option value="finance">Finance</option>
                    <option value="content">Content</option>
                    <option value="analytics">Analytics</option>
                    <option value="system">System</option>
                    <option value="general">General</option>
                  </select>
                </div>
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
