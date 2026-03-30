"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewTemplatePage() {
  const router = useRouter();
  const [name, setName] = useState(""); const [subject, setSubject] = useState(""); const [body, setBody] = useState(""); const [category, setCategory] = useState("");
  const [aiDescription, setAiDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false); const [isGenerating, setIsGenerating] = useState(false); const [error, setError] = useState("");

  async function handleAiGenerate() {
    if (!aiDescription.trim()) { setError("Please enter a description for AI generation"); return; }
    setIsGenerating(true); setError("");
    try { const res = await fetch("/api/templates/generate", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ description: aiDescription.trim(), category: category || undefined }) }); if (!res.ok) throw new Error("Failed"); const t = await res.json(); setName(t.name); setSubject(t.subject); setBody(t.body); setCategory(t.category || ""); }
    catch { setError("Failed to generate template."); } finally { setIsGenerating(false); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !subject.trim() || !body.trim()) { setError("Name, subject, and body are required"); return; }
    setIsSubmitting(true); setError("");
    try { const res = await fetch("/api/templates", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: name.trim(), subject: subject.trim(), body: body.trim(), category: category.trim() || null }) }); if (!res.ok) throw new Error("Failed"); const t = await res.json(); router.push(`/templates/${t.id}`); }
    catch { setError("Failed to create template."); } finally { setIsSubmitting(false); }
  }

  return (
    <div>
      <div className="mb-8"><h1 className="text-2xl font-bold text-white">New Template</h1><p className="text-slate-400 mt-1">Create a reusable email template</p></div>
      {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-6 space-y-4">
              <div><label className="block text-sm font-medium text-slate-400 mb-1.5">Template Name *</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Welcome Email" className="w-full px-4 py-2.5 bg-[#0f172a] border border-[#334155] rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <div><label className="block text-sm font-medium text-slate-400 mb-1.5">Category</label><input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g., onboarding, marketing" className="w-full px-4 py-2.5 bg-[#0f172a] border border-[#334155] rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <div><label className="block text-sm font-medium text-slate-400 mb-1.5">Subject *</label><input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Email subject line..." className="w-full px-4 py-2.5 bg-[#0f172a] border border-[#334155] rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
              <div><label className="block text-sm font-medium text-slate-400 mb-1.5">Body *</label><textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Write your email template body here..." rows={12} className="w-full px-4 py-2.5 bg-[#0f172a] border border-[#334155] rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" /></div>
            </div>
            <div className="flex items-center gap-4">
              <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors">{isSubmitting ? "Creating..." : "Create Template"}</button>
              <button type="button" onClick={() => router.push("/templates")} className="px-6 py-2.5 bg-[#334155] hover:bg-[#475569] text-slate-300 font-medium rounded-lg transition-colors">Cancel</button>
            </div>
          </form>
        </div>
        <div className="space-y-6">
          <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>AI Generate</h3>
            <textarea value={aiDescription} onChange={(e) => setAiDescription(e.target.value)} placeholder="Describe the template you want..." rows={3} className="w-full px-3 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-3" />
            <button type="button" onClick={handleAiGenerate} disabled={isGenerating} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">{isGenerating ? "Generating..." : "Generate with AI"}</button>
          </div>
          <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-3">Variables</h3>
            <p className="text-xs text-slate-400 mb-3">Use these placeholders in your template.</p>
            <div className="space-y-2">{[{ var: "{{name}}", desc: "Contact's full name" }, { var: "{{company}}", desc: "Company name" }, { var: "{{email}}", desc: "Contact's email" }].map((v) => (<div key={v.var} className="flex items-center gap-2 text-sm"><code className="px-2 py-0.5 bg-[#334155] text-blue-400 rounded text-xs font-mono">{v.var}</code><span className="text-slate-500 text-xs">{v.desc}</span></div>))}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
