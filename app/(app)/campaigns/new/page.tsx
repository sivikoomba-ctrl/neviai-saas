"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

interface Template { id: string; name: string; subject: string; category: string | null; }

export default function NewCampaignPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [templateId, setTemplateId] = useState("");
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => { fetch("/api/templates").then((r) => r.json()).then((d) => setTemplates(Array.isArray(d) ? d : [])).catch(console.error); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) { setError("Campaign name is required"); return; }
    setIsSubmitting(true); setError("");
    try {
      const res = await fetch("/api/campaigns", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: name.trim(), description: description.trim() || null, templateId: templateId || null }) });
      if (!res.ok) throw new Error("Failed");
      const campaign = await res.json();
      router.push(`/campaigns/${campaign.id}`);
    } catch { setError("Failed to create campaign."); } finally { setIsSubmitting(false); }
  }

  return (
    <div>
      <div className="mb-8"><h1 className="text-2xl font-bold text-white">New Campaign</h1><p className="text-slate-400 mt-1">Create a new email campaign</p></div>
      <div className="max-w-2xl">
        {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-6 space-y-4">
            <div><label className="block text-sm font-medium text-slate-400 mb-1.5">Campaign Name *</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Q1 Product Launch" className="w-full px-4 py-2.5 bg-[#0f172a] border border-[#334155] rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
            <div><label className="block text-sm font-medium text-slate-400 mb-1.5">Description</label><textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description..." rows={3} className="w-full px-4 py-2.5 bg-[#0f172a] border border-[#334155] rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" /></div>
            <div><label className="block text-sm font-medium text-slate-400 mb-1.5">Template (Optional)</label><select value={templateId} onChange={(e) => setTemplateId(e.target.value)} className="w-full px-4 py-2.5 bg-[#0f172a] border border-[#334155] rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"><option value="">Select a template...</option>{templates.map((t) => <option key={t.id} value={t.id}>{t.name} {t.category ? `(${t.category})` : ""}</option>)}</select></div>
          </div>
          <div className="flex items-center gap-4">
            <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors">{isSubmitting ? "Creating..." : "Create Campaign"}</button>
            <button type="button" onClick={() => router.push("/campaigns")} className="px-6 py-2.5 bg-[#334155] hover:bg-[#475569] text-slate-300 font-medium rounded-lg transition-colors">Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}
