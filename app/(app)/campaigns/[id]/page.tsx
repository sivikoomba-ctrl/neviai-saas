"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";

interface Email { id: string; contactName: string; contactEmail: string; subject: string; status: string; opened: boolean; sentAt: string | null; createdAt: string; }
interface Campaign { id: string; name: string; description: string | null; status: string; emails: Email[]; createdAt: string; }

export default function CampaignDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => { fetch(`/api/campaigns/${id}`).then((r) => r.json()).then((d) => setCampaign(d)).catch(console.error).finally(() => setLoading(false)); }, [id]);

  async function handleSendCampaign() {
    setSending(true); setError(""); setSuccess("");
    try { const res = await fetch(`/api/campaigns/${id}/send`, { method: "POST" }); const data = await res.json(); if (!res.ok) throw new Error(data.error || "Failed"); setSuccess(`${data.sentCount} emails sent!`); const rr = await fetch(`/api/campaigns/${id}`); setCampaign(await rr.json()); }
    catch (err) { setError(err instanceof Error ? err.message : "Failed"); } finally { setSending(false); }
  }

  async function handleDelete() { if (!confirm("Delete this campaign?")) return; await fetch(`/api/campaigns/${id}`, { method: "DELETE" }); window.location.href = "/campaigns"; }

  if (loading) return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!campaign) return <div className="text-center py-20"><p className="text-slate-400">Campaign not found</p><Link href="/campaigns" className="text-blue-400 hover:text-blue-300 mt-2 inline-block">Back to Campaigns</Link></div>;

  const sentCount = campaign.emails.filter((e) => e.status === "sent").length;
  const openedCount = campaign.emails.filter((e) => e.opened).length;
  const draftCount = campaign.emails.filter((e) => e.status === "draft").length;

  return (
    <div>
      <div className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Link href="/campaigns" className="text-slate-400 hover:text-white transition-colors"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg></Link>
            <h1 className="text-2xl font-bold text-white">{campaign.name}</h1>
            <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${campaign.status === "sent" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>{campaign.status}</span>
          </div>
          {campaign.description && <p className="text-slate-400">{campaign.description}</p>}
        </div>
        <div className="flex items-center gap-3">
          {draftCount > 0 && <button onClick={handleSendCampaign} disabled={sending} className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-sm font-medium rounded-lg transition-colors">{sending ? "Sending..." : "Send Campaign"}</button>}
          <button onClick={handleDelete} className="px-4 py-2.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 text-sm font-medium rounded-lg transition-colors">Delete</button>
        </div>
      </div>
      {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>}
      {success && <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm">{success}</div>}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-5"><p className="text-sm text-slate-400">Total Emails</p><p className="text-2xl font-bold text-white mt-1">{campaign.emails.length}</p></div>
        <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-5"><p className="text-sm text-slate-400">Sent</p><p className="text-2xl font-bold text-emerald-400 mt-1">{sentCount}</p></div>
        <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-5"><p className="text-sm text-slate-400">Opens</p><p className="text-2xl font-bold text-amber-400 mt-1">{openedCount}</p></div>
      </div>
      <div className="bg-[#1e293b] border border-[#334155] rounded-xl overflow-hidden">
        <div className="p-6 border-b border-[#334155]"><h2 className="text-lg font-semibold text-white">Campaign Emails</h2></div>
        {campaign.emails.length === 0 ? <div className="p-12 text-center"><p className="text-slate-400">No emails in this campaign yet</p></div> : (
          <div className="divide-y divide-[#334155]">{campaign.emails.map((email) => (
            <div key={email.id} className="p-4 flex items-center justify-between hover:bg-[#334155]/30 transition-colors">
              <div className="flex items-center gap-4"><div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center"><span className="text-sm font-bold text-blue-400">{email.contactName.charAt(0).toUpperCase()}</span></div><div><p className="text-sm font-medium text-white">{email.contactName}</p><p className="text-xs text-slate-400">{email.subject}</p></div></div>
              <div className="flex items-center gap-3"><span className={`px-2.5 py-1 text-xs font-medium rounded-full ${email.status === "sent" ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>{email.status}</span>{email.opened && <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-500/20 text-blue-400">opened</span>}</div>
            </div>
          ))}</div>
        )}
      </div>
    </div>
  );
}
