"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Deal {
  id: string;
  title: string;
  value: number;
  stage: string;
  aiScore: number | null;
  aiAdvice: string | null;
  contactId: string;
  contact: { id: string; name: string; email: string; phone: string | null; company: string | null };
  createdAt: string;
  updatedAt: string;
}

const STAGES = ["Lead", "Qualified", "Proposal", "Negotiation", "Won", "Lost"];
const stageColors: Record<string, string> = { Lead: "bg-slate-500", Qualified: "bg-blue-500", Proposal: "bg-yellow-500", Negotiation: "bg-orange-500", Won: "bg-green-500", Lost: "bg-red-500" };

export default function DealDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [deal, setDeal] = useState<Deal | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ title: "", value: "", stage: "" });
  const [scoreLoading, setScoreLoading] = useState(false);

  useEffect(() => { loadDeal(); }, [id]);

  async function loadDeal() {
    try { const res = await fetch(`/api/deals/${id}`); if (!res.ok) { router.push("/deals"); return; } const data = await res.json(); setDeal(data); setEditForm({ title: data.title, value: String(data.value), stage: data.stage }); }
    catch { router.push("/deals"); } finally { setLoading(false); }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    try { const res = await fetch(`/api/deals/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: editForm.title, value: parseFloat(editForm.value), stage: editForm.stage }) }); if (res.ok) { setEditing(false); loadDeal(); } }
    catch (err) { console.error("Update failed:", err); }
  }

  async function scoreDeal() {
    setScoreLoading(true);
    try { const res = await fetch(`/api/deals/${id}/score`, { method: "POST" }); if (res.ok) loadDeal(); }
    catch (err) { console.error("Score failed:", err); } finally { setScoreLoading(false); }
  }

  async function handleDelete() {
    if (!confirm(`Delete deal "${deal?.title}"?`)) return;
    await fetch(`/api/deals/${id}`, { method: "DELETE" });
    router.push("/deals");
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>;
  if (!deal) return null;

  const scoreColor = deal.aiScore !== null ? (deal.aiScore >= 75 ? "text-green-400" : deal.aiScore >= 50 ? "text-yellow-400" : "text-red-400") : "text-slate-400";

  return (
    <div>
      <Link href="/deals" className="text-sm text-slate-400 hover:text-blue-400 flex items-center gap-1 mb-6">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to Deals
      </Link>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-6">
            <div className="flex items-start justify-between mb-6">
              <div>
                <div className="flex items-center gap-3 mb-2"><h1 className="text-xl font-bold text-white">{deal.title}</h1><span className={`text-xs text-white px-3 py-1 rounded-full ${stageColors[deal.stage] || "bg-slate-500"}`}>{deal.stage}</span></div>
                <p className="text-2xl font-bold text-green-400">${(deal.value || 0).toLocaleString()}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditing(!editing)} className="text-slate-400 hover:text-blue-400 p-2 rounded-lg hover:bg-[#334155] transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                <button onClick={handleDelete} className="text-slate-400 hover:text-red-400 p-2 rounded-lg hover:bg-[#334155] transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
              </div>
            </div>
            {editing ? (
              <form onSubmit={handleEdit} className="space-y-4">
                <div><label className="block text-xs text-slate-400 mb-1">Title</label><input value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><label className="block text-xs text-slate-400 mb-1">Value ($)</label><input type="number" value={editForm.value} onChange={(e) => setEditForm({ ...editForm, value: e.target.value })} className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" /></div>
                  <div><label className="block text-xs text-slate-400 mb-1">Stage</label><select value={editForm.stage} onChange={(e) => setEditForm({ ...editForm, stage: e.target.value })} className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500">{STAGES.map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
                </div>
                <div className="flex gap-2"><button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Save</button><button type="button" onClick={() => setEditing(false)} className="text-slate-400 hover:text-slate-300 px-4 py-2 text-sm">Cancel</button></div>
              </form>
            ) : (
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-slate-400">Created:</span> <span className="text-white ml-2">{new Date(deal.createdAt).toLocaleDateString()}</span></div>
                <div><span className="text-slate-400">Updated:</span> <span className="text-white ml-2">{new Date(deal.updatedAt).toLocaleDateString()}</span></div>
              </div>
            )}
          </div>
          <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Associated Contact</h2>
            <Link href={`/contacts/${deal.contact.id}`} className="flex items-center gap-4 p-4 rounded-lg hover:bg-[#334155] transition-colors border border-[#334155]">
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white text-lg font-bold">{deal.contact.name.charAt(0).toUpperCase()}</div>
              <div><p className="font-medium text-white">{deal.contact.name}</p><p className="text-sm text-slate-400">{deal.contact.email}</p>{deal.contact.company && <p className="text-xs text-slate-500">{deal.contact.company}</p>}</div>
            </Link>
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-6">
            <div className="flex items-center gap-2 mb-4"><svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg><h3 className="text-sm font-semibold text-white">AI Deal Score</h3></div>
            {deal.aiScore !== null ? (
              <div>
                <div className="flex items-center gap-4 mb-4"><div className={`text-4xl font-bold ${scoreColor}`}>{deal.aiScore}</div><div className="text-sm text-slate-400">/100</div></div>
                <div className="w-full bg-[#0f172a] rounded-full h-2 mb-4"><div className={`h-2 rounded-full transition-all ${deal.aiScore >= 75 ? "bg-green-500" : deal.aiScore >= 50 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${deal.aiScore}%` }}></div></div>
                {deal.aiAdvice && <div className="bg-[#0f172a] rounded-lg p-3 border border-[#334155]"><p className="text-xs text-slate-400 mb-1">AI Advice</p><p className="text-sm text-slate-300">{deal.aiAdvice}</p></div>}
              </div>
            ) : <p className="text-sm text-slate-500">No AI score generated yet.</p>}
            <button onClick={scoreDeal} disabled={scoreLoading} className="mt-4 w-full bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 border border-blue-500/30">{scoreLoading ? "Scoring..." : deal.aiScore !== null ? "Re-score Deal" : "Score Deal"}</button>
          </div>
          <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-6">
            <h3 className="text-sm font-semibold text-white mb-4">Stage Progress</h3>
            <div className="space-y-2">
              {STAGES.filter((s) => s !== "Lost").map((stage) => {
                const isActive = stage === deal.stage;
                const stageIndex = STAGES.indexOf(stage);
                const dealIndex = STAGES.indexOf(deal.stage);
                const isPast = deal.stage !== "Lost" && stageIndex < dealIndex;
                return (<div key={stage} className="flex items-center gap-3"><div className={`w-3 h-3 rounded-full ${isActive ? "bg-blue-500 ring-2 ring-blue-500/30" : isPast ? "bg-green-500" : "bg-[#334155]"}`} /><span className={`text-sm ${isActive ? "text-white font-medium" : isPast ? "text-green-400" : "text-slate-500"}`}>{stage}</span></div>);
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
