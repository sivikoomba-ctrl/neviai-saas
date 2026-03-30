"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Campaign { id: string; name: string; description: string | null; status: string; emails: { id: string; status: string; opened: boolean }[]; createdAt: string; }

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetch("/api/campaigns").then((r) => r.json()).then((d) => setCampaigns(Array.isArray(d) ? d : [])).catch(console.error).finally(() => setLoading(false)); }, []);

  if (loading) return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-2xl font-bold text-white">Campaigns</h1><p className="text-slate-400 mt-1">Manage your email campaigns</p></div>
        <Link href="/campaigns/new" className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>New Campaign</Link>
      </div>
      {campaigns.length === 0 ? (
        <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-12 text-center"><p className="text-slate-400 mb-4">No campaigns yet</p><Link href="/campaigns/new" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">Create Your First Campaign</Link></div>
      ) : (
        <div className="bg-[#1e293b] border border-[#334155] rounded-xl overflow-hidden">
          <table className="w-full"><thead><tr className="border-b border-[#334155]"><th className="text-left px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Name</th><th className="text-left px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th><th className="text-left px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Emails</th><th className="text-left px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Sent / Opened</th><th className="text-left px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Created</th><th className="text-right px-6 py-4 text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th></tr></thead>
          <tbody className="divide-y divide-[#334155]">{campaigns.map((c) => { const sentCount = c.emails.filter((e) => e.status === "sent").length; const openedCount = c.emails.filter((e) => e.opened).length; return (
            <tr key={c.id} className="hover:bg-[#334155]/30 transition-colors"><td className="px-6 py-4"><Link href={`/campaigns/${c.id}`} className="text-sm font-medium text-white hover:text-blue-400 transition-colors">{c.name}</Link>{c.description && <p className="text-xs text-slate-500 mt-0.5 truncate max-w-xs">{c.description}</p>}</td><td className="px-6 py-4"><span className={`px-2.5 py-1 text-xs font-medium rounded-full ${c.status === "sent" ? "bg-emerald-500/20 text-emerald-400" : c.status === "active" ? "bg-blue-500/20 text-blue-400" : "bg-amber-500/20 text-amber-400"}`}>{c.status}</span></td><td className="px-6 py-4 text-sm text-slate-300">{c.emails.length}</td><td className="px-6 py-4 text-sm text-slate-300">{sentCount} / {openedCount}</td><td className="px-6 py-4 text-sm text-slate-400">{new Date(c.createdAt).toLocaleDateString()}</td><td className="px-6 py-4 text-right"><Link href={`/campaigns/${c.id}`} className="text-sm text-blue-400 hover:text-blue-300 transition-colors">View</Link></td></tr>
          ); })}</tbody></table>
        </div>
      )}
    </div>
  );
}
