"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Contact {
  id: string;
  name: string;
  email: string;
  company: string | null;
  createdAt: string;
}

interface Deal {
  id: string;
  title: string;
  value: number;
  stage: string;
  contact: { name: string };
  createdAt: string;
}

interface EmailAnalytics {
  totalEmails: number;
  totalSent: number;
  totalOpened: number;
  totalCampaigns: number;
  openRate: number;
}

export default function Dashboard() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [deals, setDeals] = useState<Deal[]>([]);
  const [emailStats, setEmailStats] = useState<EmailAnalytics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [contactsRes, dealsRes, analyticsRes] = await Promise.all([
          fetch("/api/contacts"),
          fetch("/api/deals"),
          fetch("/api/analytics"),
        ]);
        const contactsData = await contactsRes.json();
        const dealsData = await dealsRes.json();
        const analyticsData = await analyticsRes.json();

        setContacts(Array.isArray(contactsData) ? contactsData.slice(0, 5) : []);
        setDeals(Array.isArray(dealsData) ? dealsData.slice(0, 5) : []);
        setEmailStats(analyticsData);
      } catch (err) {
        console.error("Dashboard load error:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const totalContacts = contacts.length;
  const totalDeals = deals.length;
  const pipelineValue = deals.reduce((s, d) => s + (d.value || 0), 0);

  const statCards = [
    { label: "Total Contacts", value: totalContacts, color: "text-blue-400", bg: "bg-blue-500/10", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" },
    { label: "Total Deals", value: totalDeals, color: "text-green-400", bg: "bg-green-500/10", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
    { label: "Pipeline Value", value: `₹${pipelineValue.toLocaleString()}`, color: "text-yellow-400", bg: "bg-yellow-500/10", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
    { label: "Emails Sent", value: emailStats?.totalSent ?? 0, color: "text-violet-400", bg: "bg-violet-500/10", icon: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" },
    { label: "Open Rate", value: `${emailStats?.openRate ?? 0}%`, color: "text-amber-400", bg: "bg-amber-500/10", icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
    { label: "Campaigns", value: emailStats?.totalCampaigns ?? 0, color: "text-emerald-400", bg: "bg-emerald-500/10", icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" },
  ];

  const stageColors: Record<string, string> = {
    Lead: "bg-slate-500", Qualified: "bg-blue-500", Proposal: "bg-yellow-500",
    Negotiation: "bg-orange-500", Won: "bg-green-500", Lost: "bg-red-500",
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 mt-1">Overview of your CRM & Email pipeline</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {statCards.map((card) => (
          <div key={card.label} className="bg-[#1e293b] rounded-xl p-6 border border-[#334155] hover:border-[#475569] transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className={`${card.bg} p-3 rounded-lg`}>
                <svg className={`w-6 h-6 ${card.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold text-white">{card.value}</p>
            <p className="text-sm text-slate-400 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1e293b] rounded-xl border border-[#334155]">
          <div className="flex items-center justify-between p-6 border-b border-[#334155]">
            <h2 className="text-lg font-semibold text-white">Recent Contacts</h2>
            <Link href="/contacts" className="text-sm text-blue-400 hover:text-blue-300">View All</Link>
          </div>
          <div className="p-6">
            {contacts.length === 0 ? (
              <p className="text-slate-400 text-sm">No contacts yet.</p>
            ) : (
              <div className="space-y-4">
                {contacts.map((c) => (
                  <Link key={c.id} href={`/contacts/${c.id}`} className="flex items-center gap-4 p-3 rounded-lg hover:bg-[#334155] transition-colors">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{c.name}</p>
                      <p className="text-xs text-slate-400 truncate">{c.email}</p>
                    </div>
                    {c.company && (
                      <span className="text-xs text-slate-400 bg-[#0f172a] px-2 py-1 rounded">{c.company}</span>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="bg-[#1e293b] rounded-xl border border-[#334155]">
          <div className="flex items-center justify-between p-6 border-b border-[#334155]">
            <h2 className="text-lg font-semibold text-white">Recent Deals</h2>
            <Link href="/deals" className="text-sm text-blue-400 hover:text-blue-300">View All</Link>
          </div>
          <div className="p-6">
            {deals.length === 0 ? (
              <p className="text-slate-400 text-sm">No deals yet.</p>
            ) : (
              <div className="space-y-4">
                {deals.map((d) => (
                  <Link key={d.id} href={`/deals/${d.id}`} className="flex items-center gap-4 p-3 rounded-lg hover:bg-[#334155] transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{d.title}</p>
                      <p className="text-xs text-slate-400">{d.contact?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-green-400">₹{(d.value || 0).toLocaleString()}</p>
                      <span className={`inline-block text-xs text-white px-2 py-0.5 rounded-full ${stageColors[d.stage] || "bg-slate-500"}`}>
                        {d.stage}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
