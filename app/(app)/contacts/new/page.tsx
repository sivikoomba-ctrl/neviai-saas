"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NewContactPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", phone: "", company: "", notes: "", tags: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!form.name.trim() || !form.email.trim()) { setError("Name and email are required."); return; }
    setSubmitting(true);
    try {
      const tags = form.tags.trim() ? form.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name.trim(), email: form.email.trim(), phone: form.phone.trim() || null, company: form.company.trim() || null, notes: form.notes.trim() || null, tags }),
      });
      if (!res.ok) { const data = await res.json(); setError(data.error || "Failed to create contact."); return; }
      router.push("/contacts");
    } catch { setError("An unexpected error occurred."); } finally { setSubmitting(false); }
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-8">
        <Link href="/contacts" className="text-sm text-slate-400 hover:text-blue-400 flex items-center gap-1 mb-4">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back to Contacts
        </Link>
        <h1 className="text-2xl font-bold text-white">New Contact</h1>
        <p className="text-slate-400 mt-1">Add a new contact to your CRM</p>
      </div>
      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-lg mb-6 text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="bg-[#1e293b] rounded-xl border border-[#334155] p-6 space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div><label className="block text-sm font-medium text-slate-300 mb-1.5">Name *</label><input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="John Doe" required /></div>
          <div><label className="block text-sm font-medium text-slate-300 mb-1.5">Email *</label><input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="john@example.com" required /></div>
          <div><label className="block text-sm font-medium text-slate-300 mb-1.5">Phone</label><input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="+1 (555) 000-0000" /></div>
          <div><label className="block text-sm font-medium text-slate-300 mb-1.5">Company</label><input type="text" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="Acme Inc." /></div>
        </div>
        <div><label className="block text-sm font-medium text-slate-300 mb-1.5">Tags</label><input type="text" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" placeholder="vip, partner, enterprise (comma separated)" /></div>
        <div><label className="block text-sm font-medium text-slate-300 mb-1.5">Notes</label><textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={4} className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none" placeholder="Any notes about this contact..." /></div>
        <div className="flex items-center gap-3 pt-2">
          <button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors">{submitting ? "Creating..." : "Create Contact"}</button>
          <Link href="/contacts" className="text-slate-400 hover:text-slate-300 px-4 py-2.5 text-sm transition-colors">Cancel</Link>
        </div>
      </form>
    </div>
  );
}
