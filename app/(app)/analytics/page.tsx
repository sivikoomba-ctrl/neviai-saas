"use client";

import { useEffect, useState } from "react";

interface DailyStat { date: string; sent: number; opened: number; }
interface Analytics { totalEmails: number; totalSent: number; totalOpened: number; totalBounced: number; totalDrafts: number; totalCampaigns: number; openRate: number; bounceRate: number; dailyStats: DailyStat[]; recentActivity: { id: string; contactName: string; subject: string; status: string; opened: boolean; sentAt: string | null; openedAt: string | null; createdAt: string; tone: string | null; campaign: { name: string } | null }[]; topRecipients: { name: string; email: string; sent: number; opened: number }[]; campaignStats: { id: string; name: string; status: string; totalEmails: number; sent: number; opened: number; openRate: number }[]; }

function timeAgo(dateStr: string): string { const diff = Date.now() - new Date(dateStr).getTime(); const mins = Math.floor(diff / 60000); if (mins < 1) return "just now"; if (mins < 60) return `${mins}m ago`; const hrs = Math.floor(mins / 60); if (hrs < 24) return `${hrs}h ago`; return `${Math.floor(hrs / 24)}d ago`; }

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetch("/api/analytics").then((r) => r.json()).then((d) => setAnalytics(d)).catch(console.error).finally(() => setLoading(false)); }, []);

  if (loading) return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!analytics) return <div className="text-center py-20"><p className="text-slate-400">Failed to load analytics</p></div>;

  const maxSent = Math.max(...analytics.dailyStats.map((d) => d.sent), 1);

  return (
    <div>
      <div className="mb-8"><h1 className="text-2xl font-bold text-white">Email Analytics</h1><p className="text-slate-400 mt-1">Track performance, opens, and engagement</p></div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {[{ label: "Total Emails", value: analytics.totalEmails, color: "text-violet-400", bg: "bg-violet-500/10" }, { label: "Sent", value: analytics.totalSent, color: "text-emerald-400", bg: "bg-emerald-500/10" }, { label: "Opened", value: analytics.totalOpened, color: "text-amber-400", bg: "bg-amber-500/10" }, { label: "Open Rate", value: `${analytics.openRate}%`, color: "text-blue-400", bg: "bg-blue-500/10" }, { label: "Bounced", value: analytics.totalBounced, color: "text-red-400", bg: "bg-red-500/10" }, { label: "Drafts", value: analytics.totalDrafts, color: "text-slate-400", bg: "bg-slate-500/10" }].map((s) => (
          <div key={s.label} className={`${s.bg} border border-[#334155] rounded-xl p-4`}><p className="text-xs text-slate-400">{s.label}</p><p className={`text-2xl font-bold ${s.color} mt-1`}>{s.value}</p></div>
        ))}
      </div>
      <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-6 mb-8">
        <h2 className="text-lg font-semibold text-white mb-2">Sent vs Opened (Last 14 Days)</h2>
        <p className="text-xs text-slate-500 mb-6"><span className="inline-block w-3 h-3 rounded-sm bg-blue-500 mr-1 align-middle"></span> Sent <span className="inline-block w-3 h-3 rounded-sm bg-amber-500 mr-1 ml-4 align-middle"></span> Opened</p>
        <div className="flex items-end gap-2 h-48">{analytics.dailyStats.map((day) => { const sentH = maxSent > 0 ? (day.sent / maxSent) * 100 : 0; const openedH = maxSent > 0 ? (day.opened / maxSent) * 100 : 0; const date = new Date(day.date + "T00:00:00"); return (
          <div key={day.date} className="flex-1 flex flex-col items-center gap-1"><span className="text-[10px] text-slate-500">{day.sent > 0 ? day.sent : ""}</span><div className="w-full flex gap-0.5 items-end" style={{ height: "140px" }}><div className="flex-1 bg-blue-600/60 rounded-t transition-all" style={{ height: `${Math.max(sentH, 2)}%` }} /><div className="flex-1 bg-amber-500/60 rounded-t transition-all" style={{ height: `${Math.max(openedH, 2)}%` }} /></div><p className="text-[10px] text-slate-400">{date.toLocaleDateString("en-US", { weekday: "narrow" })}</p><p className="text-[10px] text-slate-600">{date.getDate()}</p></div>
        ); })}</div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Recent Activity</h2>
          {analytics.recentActivity.length === 0 ? <p className="text-sm text-slate-500">No email activity yet</p> : (
            <div className="space-y-3 max-h-96 overflow-y-auto">{analytics.recentActivity.map((email) => (
              <div key={email.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-[#334155]/50 transition-colors">
                <div className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${email.opened ? "bg-amber-500/20" : email.status === "sent" ? "bg-emerald-500/20" : "bg-slate-500/20"}`}>
                  <svg className={`w-4 h-4 ${email.opened ? "text-amber-400" : email.status === "sent" ? "text-emerald-400" : "text-slate-400"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={email.opened ? "M15 12a3 3 0 11-6 0 3 3 0 016 0z" : "M5 13l4 4L19 7"} /></svg>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2"><p className="text-sm font-medium text-white truncate">{email.contactName}</p>{email.campaign && <span className="text-[10px] px-1.5 py-0.5 bg-blue-500/20 text-blue-400 rounded-full">{email.campaign.name}</span>}</div>
                  <p className="text-xs text-slate-400 truncate">{email.subject}</p>
                  <span className="text-[10px] text-slate-600">{timeAgo(email.openedAt || email.sentAt || email.createdAt)}</span>
                </div>
              </div>
            ))}</div>
          )}
        </div>
        <div className="space-y-8">
          <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Top Recipients</h2>
            {analytics.topRecipients.length === 0 ? <p className="text-sm text-slate-500">No emails sent yet</p> : (
              <div className="space-y-3">{analytics.topRecipients.map((r, idx) => (
                <div key={r.email} className="flex items-center gap-3"><span className="text-xs text-slate-600 w-4">{idx + 1}</span><div className="w-8 h-8 rounded-full bg-blue-600/30 flex items-center justify-center text-blue-300 text-xs font-bold flex-shrink-0">{r.name.charAt(0).toUpperCase()}</div><div className="flex-1 min-w-0"><p className="text-sm text-white truncate">{r.name}</p><p className="text-xs text-slate-500 truncate">{r.email}</p></div><div className="text-right flex-shrink-0"><p className="text-sm font-medium text-white">{r.sent} sent</p><p className="text-xs text-amber-400">{r.opened} opened</p></div></div>
              ))}</div>
            )}
          </div>
          <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Campaign Performance</h2>
            {analytics.campaignStats.length === 0 ? <p className="text-sm text-slate-500">No campaigns yet</p> : (
              <div className="space-y-4">{analytics.campaignStats.map((c) => (
                <div key={c.id} className="p-3 bg-[#334155]/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2"><p className="text-sm font-medium text-white">{c.name}</p><span className={`text-[10px] px-2 py-0.5 rounded-full ${c.status === "sent" ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-500/20 text-slate-400"}`}>{c.status}</span></div>
                  <div className="flex items-center gap-4 text-xs text-slate-400"><span>{c.totalEmails} emails</span><span>{c.sent} sent</span><span>{c.opened} opened</span><span className="text-amber-400">{c.openRate}% open rate</span></div>
                  <div className="w-full h-1.5 bg-[#475569] rounded-full mt-2 overflow-hidden"><div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${c.openRate}%` }} /></div>
                </div>
              ))}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
