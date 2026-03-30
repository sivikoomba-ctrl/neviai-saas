"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Template { id: string; name: string; subject: string; body: string; category: string | null; variables: string | string[] | null; isAiGenerated: boolean; createdAt: string; }

export default function TemplateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [template, setTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(""); const [subject, setSubject] = useState(""); const [body, setBody] = useState(""); const [category, setCategory] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(""); const [success, setSuccess] = useState("");

  useEffect(() => { fetch(`/api/templates/${id}`).then((r) => r.json()).then((d) => { setTemplate(d); setName(d.name); setSubject(d.subject); setBody(d.body); setCategory(d.category || ""); }).catch(console.error).finally(() => setLoading(false)); }, [id]);

  async function handleSave() {
    if (!name.trim() || !subject.trim() || !body.trim()) { setError("Name, subject, and body are required"); return; }
    setIsSaving(true); setError(""); setSuccess("");
    try { const res = await fetch(`/api/templates/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: name.trim(), subject: subject.trim(), body: body.trim(), category: category.trim() || null }) }); if (!res.ok) throw new Error("Failed"); const updated = await res.json(); setTemplate(updated); setEditing(false); setSuccess("Template updated!"); }
    catch { setError("Failed to update template"); } finally { setIsSaving(false); }
  }

  async function handleDelete() { if (!confirm("Delete this template?")) return; try { await fetch(`/api/templates/${id}`, { method: "DELETE" }); router.push("/templates"); } catch { setError("Failed to delete template"); } }

  function parseVariables(v: string | string[] | null): string[] { if (!v) return []; if (Array.isArray(v)) return v; return v.split(",").map((s) => s.trim()).filter(Boolean); }

  if (loading) return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!template) return <div className="text-center py-20"><p className="text-slate-400">Template not found</p><Link href="/templates" className="text-blue-400 hover:text-blue-300 mt-2 inline-block">Back to Templates</Link></div>;

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-3">
          <Link href="/templates" className="text-slate-400 hover:text-white transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></Link>
          <div><h1 className="text-2xl font-bold text-white">{template.name}</h1><div className="flex items-center gap-2 mt-1">{template.category && <span className="px-2 py-0.5 text-xs font-medium rounded bg-[#334155] text-slate-400">{template.category}</span>}{template.isAiGenerated && <span className="px-2 py-0.5 text-xs font-medium rounded bg-blue-500/20 text-blue-400">AI Generated</span>}</div></div>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setEditing(!editing)} className="px-4 py-2.5 bg-[#334155] hover:bg-[#475569] text-white text-sm font-medium rounded-lg transition-colors">{editing ? "Cancel Edit" : "Edit"}</button>
          <button onClick={handleDelete} className="px-4 py-2.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-sm font-medium rounded-lg transition-colors">Delete</button>
        </div>
      </div>
      {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>}
      {success && <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm">{success}</div>}
      {editing ? (
        <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-6 space-y-4">
          <div><label className="block text-sm font-medium text-slate-400 mb-1.5">Name</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full px-4 py-2.5 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <div><label className="block text-sm font-medium text-slate-400 mb-1.5">Category</label><input type="text" value={category} onChange={(e) => setCategory(e.target.value)} className="w-full px-4 py-2.5 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <div><label className="block text-sm font-medium text-slate-400 mb-1.5">Subject</label><input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full px-4 py-2.5 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
          <div><label className="block text-sm font-medium text-slate-400 mb-1.5">Body</label><textarea value={body} onChange={(e) => setBody(e.target.value)} rows={14} className="w-full px-4 py-2.5 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" /></div>
          <button onClick={handleSave} disabled={isSaving} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors">{isSaving ? "Saving..." : "Save Changes"}</button>
        </div>
      ) : (
        <div className="bg-[#1e293b] border border-[#334155] rounded-xl overflow-hidden">
          <div className="p-6 border-b border-[#334155]"><p className="text-xs font-medium text-slate-500 mb-1">SUBJECT</p><p className="text-lg text-white">{template.subject}</p></div>
          <div className="p-6"><p className="text-xs font-medium text-slate-500 mb-2">BODY</p><pre className="text-sm text-slate-300 whitespace-pre-wrap font-sans leading-relaxed">{template.body}</pre></div>
          {template.variables && parseVariables(template.variables).length > 0 && (
            <div className="p-6 border-t border-[#334155]"><p className="text-xs font-medium text-slate-500 mb-2">VARIABLES</p><div className="flex gap-2 flex-wrap">{parseVariables(template.variables).map((v) => <code key={v} className="px-2 py-0.5 bg-[#334155] text-blue-400 rounded text-xs font-mono">{v}</code>)}</div></div>
          )}
        </div>
      )}
    </div>
  );
}
