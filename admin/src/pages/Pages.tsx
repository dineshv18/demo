/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
import { useState, useEffect, useMemo, useCallback } from "react";
import { IconPlus, IconTrash, IconEdit, IconFile, IconRefresh } from "@tabler/icons-react";
import * as TablerIcons from "@tabler/icons-react";

function PageIcon({ name, className }: { name?: string; className?: string }) {
  const Icon = (name && (TablerIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[name]) || IconFile;
  return <Icon className={className} />;
}
import { env } from "../config/env";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

const API = env.API_URL;

const categoryColors: Record<string, string> = {
  main: "bg-[#EAF7E8] text-[#10211D]",
  management: "bg-[#F3F8EF] text-[#10211D]",
  finance: "bg-[#EAF7E8] text-[#00A94F]",
  content: "bg-amber-100 text-amber-700",
  analytics: "bg-[#F3F8EF] text-[#68736E]",
  system: "bg-[#F3F8EF] text-[#68736E]",
  general: "bg-[#F3F8EF] text-[#68736E]",
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
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A94F]" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#10211D]">Pages</h1>
          <p className="text-[#68736E] text-sm">Manage pages that can be assigned to roles</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="rounded-xl border-[#DDE4DE] text-[#10211D]" onClick={handleSeed}>
            <IconRefresh size={16} /> Seed Defaults
          </Button>
          <Button className="rounded-xl bg-[#10211D] hover:bg-[#10211D]/90 text-white" onClick={() => { setEditing(null); setForm({ slug: "", name: "", description: "", icon: "", category: "general" }); setShowModal(true); }}>
            <IconPlus size={16} /> Add Page
          </Button>
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-600 px-4 py-2 rounded-xl text-sm border border-red-200">{error}</div>}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {pages.map((page: any) => (
          <Card key={page.id} className="rounded-2xl border-[#DDE4DE] shadow-[0_8px_30px_rgba(16,33,29,0.05)]">
            <CardContent className="space-y-3 p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <PageIcon name={page.icon} className="h-4 w-4 text-[#68736E] shrink-0" />
                  <h3 className="font-semibold text-sm truncate text-[#10211D]">{page.name}</h3>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-[#68736E] hover:bg-[#F3F8EF]" onClick={() => openEdit(page)}><IconEdit size={14} /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50" onClick={() => handleDelete(page.id)}><IconTrash size={14} /></Button>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={`rounded-full ${categoryColors[page.category] || categoryColors.general}`}>
                  {page.category}
                </Badge>
                <span className="text-xs text-[#89938E] font-mono">/{page.slug}</span>
              </div>
              {page.description && <p className="text-xs text-[#68736E]">{page.description}</p>}
              {page.roles?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {page.roles.map((r: any) => (
                    <Badge key={r.role.id} variant="secondary" className="text-[10px] rounded-full bg-[#F3F8EF] text-[#68736E]">
                      {r.role.displayName}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md rounded-2xl border-[#DDE4DE]">
            <CardContent className="space-y-4 p-6">
              <h2 className="text-lg font-semibold text-[#10211D]">{editing ? "Edit Page" : "Create Page"}</h2>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-[#10211D]">Slug</label>
                  <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} disabled={!!editing}
                    className="mt-1 font-mono rounded-xl border-[#DDE4DE]" placeholder="e.g. dashboard" />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#10211D]">Name</label>
                  <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="mt-1 rounded-xl border-[#DDE4DE]" placeholder="e.g. Dashboard" />
                </div>
                <div>
                  <label className="text-sm font-medium text-[#10211D]">Description</label>
                  <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="mt-1 rounded-xl border-[#DDE4DE]" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-[#10211D]">Icon</label>
                    <Input value={form.icon} onChange={(e) => setForm({ ...form, icon: e.target.value })}
                      className="mt-1 font-mono rounded-xl border-[#DDE4DE]" placeholder="IconLayoutDashboard" />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-[#10211D]">Category</label>
                    <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}
                      className="w-full mt-1 px-3 py-2 border border-[#DDE4DE] rounded-xl bg-white text-sm text-[#10211D] focus:outline-none focus:ring-2 focus:ring-[#00A94F]/40">
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
                  <Button type="button" variant="outline" className="rounded-xl border-[#DDE4DE] text-[#10211D]" onClick={() => { setShowModal(false); setEditing(null); }}>Cancel</Button>
                  <Button type="submit" className="rounded-xl bg-[#10211D] hover:bg-[#10211D]/90 text-white">{editing ? "Update" : "Create"}</Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
