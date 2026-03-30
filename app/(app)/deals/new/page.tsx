"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

interface Contact { id: string; name: string; email: string; company: string | null; }
const STAGES = ["Lead", "Qualified", "Proposal", "Negotiation", "Won", "Lost"];

export default function NewDealPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedContactId = searchParams.get("contactId") || "";
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [form, setForm] = useState({ title: "", value: "", stage: "Lead", contactId: preselectedContactId });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetch("/api/contacts").then((r) => r.json()).then((d) => setContacts(Array.isArray(d) ? d : [])).catch(console.error); }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.title.trim() || !form.value || !form.contactId) { setError("Title, value, and contact are required."); return; }
    const val = parseFloat(form.value);
    if (isNaN(val) || val < 0) { setError("Value must be a valid positive number."); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/deals", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title: form.title.trim(), value: val, stage: form.stage, contactId: form.contactId }) });
      if (!res.ok) { const data = await res.json(); setError(data.error || "Failed to create deal."); return; }
      router.push("/deals");
    } catch { setError("An unexpected error occurred."); } finally { setSubmitting(false); }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <Link href="/deals" className="text-sm text-slate-400 hover:text-blue-400 flex items-center gap-1 mb-4"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>Back to Deals</Link>
        <h1 className="text-2xl font-bold text-white">New Deal</h1>
        <p className="text-slate-400 mt-1">Add a new deal to your pipeline</p>
      </div>
      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="bg-[#1e293b] rounded-xl border border-[#334155] p-6 space-y-5">
        <div><label className="block text-sm font-medium text-slate-300 mb-1.5">Deal Title *</label><input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="Enterprise SaaS License" required /></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div><label className="block text-sm font-medium text-slate-300 mb-1.5">Value ($) *</label><input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="25000" min="0" step="0.01" required /></div>
          <div><label className="block text-sm font-medium text-slate-300 mb-1.5">Stage</label><select value={form.stage} onChange={(e) => setForm({ ...form, stage: e.target.value })} className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">{STAGES.map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
        </div>
        <div><label className="block text-sm font-medium text-slate-300 mb-1.5">Contact *</label><select value={form.contactId} onChange={(e) => setForm({ ...form, contactId: e.target.value })} className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" required><option value="">Select a contact...</option>{contacts.map((c) => <option key={c.id} value={c.id}>{c.name} ({c.email}){c.company ? ` - ${c.company}` : ""}</option>)}</select></div>
        <div className="flex items-center gap-3 pt-2">
          <button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors">{submitting ? "Creating..." : "Create Deal"}</button>
          <Link href="/deals" className="text-slate-400 hover:text-slate-300 px-4 py-2.5 text-sm transition-colors">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
