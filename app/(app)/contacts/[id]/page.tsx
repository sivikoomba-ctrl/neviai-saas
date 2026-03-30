"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Interaction {
  id: string;
  type: string;
  subject: string | null;
  body: string | null;
  createdAt: string;
}

interface Deal {
  id: string;
  title: string;
  value: number;
  stage: string;
  createdAt: string;
}

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  notes: string | null;
  tags: string | string[] | null;
  aiSummary: string | null;
  createdAt: string;
  updatedAt: string;
  deals: Deal[];
  interactions: Interaction[];
}

export default function ContactDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ name: "", email: "", phone: "", company: "", notes: "", tags: "" });
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [interactionForm, setInteractionForm] = useState({ type: "email", subject: "", body: "" });
  const [showInteractionForm, setShowInteractionForm] = useState(false);

  useEffect(() => { loadContact(); }, [id]);

  async function loadContact() {
    try {
      const res = await fetch(`/api/contacts/${id}`);
      if (!res.ok) { router.push("/contacts"); return; }
      const data = await res.json();
      setContact(data);
      const tags = Array.isArray(data.tags) ? data.tags.join(", ") : (data.tags ? JSON.parse(data.tags).join(", ") : "");
      setEditForm({ name: data.name, email: data.email, phone: data.phone || "", company: data.company || "", notes: data.notes || "", tags });
    } catch { router.push("/contacts"); } finally { setLoading(false); }
  }

  async function handleEdit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const tags = editForm.tags.trim() ? editForm.tags.split(",").map((t) => t.trim()).filter(Boolean) : [];
      const res = await fetch(`/api/contacts/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editForm.name, email: editForm.email, phone: editForm.phone || null, company: editForm.company || null, notes: editForm.notes || null, tags }),
      });
      if (res.ok) { setEditing(false); loadContact(); }
    } catch (err) { console.error("Update failed:", err); }
  }

  async function generateSummary() {
    setSummaryLoading(true);
    try { const res = await fetch(`/api/contacts/${id}/summary`, { method: "POST" }); if (res.ok) loadContact(); }
    catch (err) { console.error("Summary generation failed:", err); }
    finally { setSummaryLoading(false); }
  }

  async function addInteraction(e: React.FormEvent) {
    e.preventDefault();
    try {
      const res = await fetch(`/api/contacts/${id}/interactions`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(interactionForm) });
      if (res.ok) { setInteractionForm({ type: "email", subject: "", body: "" }); setShowInteractionForm(false); loadContact(); }
    } catch (err) { console.error("Interaction creation failed:", err); }
  }

  async function handleDelete() {
    if (!confirm(`Delete contact "${contact?.name}"?`)) return;
    await fetch(`/api/contacts/${id}`, { method: "DELETE" });
    router.push("/contacts");
  }

  function parseTags(tags: string | string[] | null): string[] {
    if (!tags) return [];
    if (Array.isArray(tags)) return tags;
    try { return JSON.parse(tags); } catch { return []; }
  }

  const stageColors: Record<string, string> = { Lead: "bg-slate-500", Qualified: "bg-blue-500", Proposal: "bg-yellow-500", Negotiation: "bg-orange-500", Won: "bg-green-500", Lost: "bg-red-500" };
  const typeIcons: Record<string, string> = {
    email: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
    call: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z",
    meeting: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
    note: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>;
  if (!contact) return null;

  return (
    <div>
      <Link href="/contacts" className="text-sm text-slate-400 hover:text-blue-400 flex items-center gap-1 mb-6">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to Contacts
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-6">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-blue-600 flex items-center justify-center text-white text-xl font-bold">{contact.name.charAt(0).toUpperCase()}</div>
                <div><h1 className="text-xl font-bold text-white">{contact.name}</h1><p className="text-slate-400">{contact.email}</p></div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setEditing(!editing)} className="text-slate-400 hover:text-blue-400 p-2 rounded-lg hover:bg-[#334155] transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                </button>
                <button onClick={handleDelete} className="text-slate-400 hover:text-red-400 p-2 rounded-lg hover:bg-[#334155] transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                </button>
              </div>
            </div>
            {editing ? (
              <form onSubmit={handleEdit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {[{ label: "Name", key: "name" }, { label: "Email", key: "email" }, { label: "Phone", key: "phone" }, { label: "Company", key: "company" }].map((f) => (
                    <div key={f.key}><label className="block text-xs text-slate-400 mb-1">{f.label}</label><input value={editForm[f.key as keyof typeof editForm]} onChange={(e) => setEditForm({ ...editForm, [f.key]: e.target.value })} className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" /></div>
                  ))}
                </div>
                <div><label className="block text-xs text-slate-400 mb-1">Tags (comma separated)</label><input value={editForm.tags} onChange={(e) => setEditForm({ ...editForm, tags: e.target.value })} className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" /></div>
                <div><label className="block text-xs text-slate-400 mb-1">Notes</label><textarea value={editForm.notes} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} rows={3} className="w-full bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 resize-none" /></div>
                <div className="flex gap-2">
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Save</button>
                  <button type="button" onClick={() => setEditing(false)} className="text-slate-400 hover:text-slate-300 px-4 py-2 text-sm">Cancel</button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-2 gap-4 text-sm">
                {contact.phone && <div><span className="text-slate-400">Phone:</span> <span className="text-white ml-2">{contact.phone}</span></div>}
                {contact.company && <div><span className="text-slate-400">Company:</span> <span className="text-white ml-2">{contact.company}</span></div>}
                <div><span className="text-slate-400">Created:</span> <span className="text-white ml-2">{new Date(contact.createdAt).toLocaleDateString()}</span></div>
                <div><span className="text-slate-400">Updated:</span> <span className="text-white ml-2">{new Date(contact.updatedAt).toLocaleDateString()}</span></div>
                {parseTags(contact.tags).length > 0 && (
                  <div className="col-span-2"><span className="text-slate-400">Tags:</span><div className="flex flex-wrap gap-1 mt-1">{parseTags(contact.tags).map((tag) => (<span key={tag} className="bg-blue-500/20 text-blue-300 text-xs px-2 py-0.5 rounded-full">{tag}</span>))}</div></div>
                )}
                {contact.notes && <div className="col-span-2"><span className="text-slate-400">Notes:</span><p className="text-white mt-1">{contact.notes}</p></div>}
              </div>
            )}
          </div>

          <div className="bg-[#1e293b] rounded-xl border border-[#334155]">
            <div className="p-6 border-b border-[#334155] flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Deals ({contact.deals.length})</h2>
              <Link href={`/deals/new?contactId=${id}`} className="text-sm text-blue-400 hover:text-blue-300">+ New Deal</Link>
            </div>
            <div className="p-6">
              {contact.deals.length === 0 ? <p className="text-slate-400 text-sm">No deals associated.</p> : (
                <div className="space-y-3">{contact.deals.map((deal) => (
                  <Link key={deal.id} href={`/deals/${deal.id}`} className="flex items-center justify-between p-3 rounded-lg hover:bg-[#334155] transition-colors">
                    <div><p className="text-sm font-medium text-white">{deal.title}</p><p className="text-xs text-slate-400">{new Date(deal.createdAt).toLocaleDateString()}</p></div>
                    <div className="text-right"><p className="text-sm font-semibold text-green-400">₹{deal.value.toLocaleString('en-IN')}</p><span className={`text-xs text-white px-2 py-0.5 rounded-full ${stageColors[deal.stage] || "bg-slate-500"}`}>{deal.stage}</span></div>
                  </Link>
                ))}</div>
              )}
            </div>
          </div>

          <div className="bg-[#1e293b] rounded-xl border border-[#334155]">
            <div className="p-6 border-b border-[#334155] flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Interactions ({contact.interactions.length})</h2>
              <button onClick={() => setShowInteractionForm(!showInteractionForm)} className="text-sm text-blue-400 hover:text-blue-300">{showInteractionForm ? "Cancel" : "+ Log Interaction"}</button>
            </div>
            <div className="p-6">
              {showInteractionForm && (
                <form onSubmit={addInteraction} className="mb-6 space-y-3 p-4 bg-[#0f172a] rounded-lg border border-[#334155]">
                  <div className="grid grid-cols-2 gap-3">
                    <div><label className="block text-xs text-slate-400 mb-1">Type</label>
                      <select value={interactionForm.type} onChange={(e) => setInteractionForm({ ...interactionForm, type: e.target.value })} className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500">
                        <option value="email">Email</option><option value="call">Call</option><option value="meeting">Meeting</option><option value="note">Note</option>
                      </select>
                    </div>
                    <div><label className="block text-xs text-slate-400 mb-1">Subject</label><input value={interactionForm.subject} onChange={(e) => setInteractionForm({ ...interactionForm, subject: e.target.value })} className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500" placeholder="Subject" /></div>
                  </div>
                  <div><label className="block text-xs text-slate-400 mb-1">Details</label><textarea value={interactionForm.body} onChange={(e) => setInteractionForm({ ...interactionForm, body: e.target.value })} rows={3} className="w-full bg-[#1e293b] border border-[#334155] rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 resize-none" placeholder="Interaction details..." /></div>
                  <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">Log Interaction</button>
                </form>
              )}
              {contact.interactions.length === 0 ? <p className="text-slate-400 text-sm">No interactions recorded.</p> : (
                <div className="space-y-3">{contact.interactions.map((interaction) => (
                  <div key={interaction.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#334155]/50 transition-colors">
                    <div className="p-2 bg-[#0f172a] rounded-lg shrink-0"><svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={typeIcons[interaction.type] || typeIcons.note} /></svg></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2"><span className="text-xs font-medium text-blue-400 uppercase">{interaction.type}</span><span className="text-xs text-slate-500">{new Date(interaction.createdAt).toLocaleString('en-IN')}</span></div>
                      {interaction.subject && <p className="text-sm font-medium text-white mt-0.5">{interaction.subject}</p>}
                      {interaction.body && <p className="text-sm text-slate-300 mt-1">{interaction.body}</p>}
                    </div>
                  </div>
                ))}</div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-6">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              <h3 className="text-sm font-semibold text-white">AI Summary</h3>
            </div>
            {contact.aiSummary ? <p className="text-sm text-slate-300 leading-relaxed">{contact.aiSummary}</p> : <p className="text-sm text-slate-500">No AI summary generated yet.</p>}
            <button onClick={generateSummary} disabled={summaryLoading} className="mt-4 w-full bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 border border-blue-500/30">
              {summaryLoading ? "Generating..." : contact.aiSummary ? "Regenerate Summary" : "Generate Summary"}
            </button>
          </div>
          <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-6">
            <h3 className="text-sm font-semibold text-white mb-3">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm"><span className="text-slate-400">Total Deals</span><span className="text-white font-medium">{contact.deals.length}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-400">Pipeline Value</span><span className="text-green-400 font-medium">₹{contact.deals.reduce((s, d) => s + d.value, 0).toLocaleString('en-IN')}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-400">Interactions</span><span className="text-white font-medium">{contact.interactions.length}</span></div>
              <div className="flex justify-between text-sm"><span className="text-slate-400">Won Deals</span><span className="text-white font-medium">{contact.deals.filter((d) => d.stage === "Won").length}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
