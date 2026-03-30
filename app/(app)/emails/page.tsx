"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Email {
  id: string;
  contactName: string;
  contactEmail: string;
  subject: string;
  status: string;
  opened: boolean;
  sentAt: string | null;
  createdAt: string;
  campaign: { name: string } | null;
}

export default function EmailsPage() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/emails").then((res) => res.json()).then((data) => setEmails(Array.isArray(data) ? data : [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-2xl font-bold text-white">Emails</h1><p className="text-slate-400 mt-1">{emails.length} total emails</p></div>
        <Link href="/compose" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Compose New
        </Link>
      </div>
      {emails.length === 0 ? (
        <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-12 text-center">
          <p className="text-slate-400">No emails yet. Start by composing one!</p>
        </div>
      ) : (
        <div className="bg-[#1e293b] rounded-xl border border-[#334155] overflow-hidden divide-y divide-[#334155]">
          {emails.map((email) => (
            <div key={email.id} className="p-4 flex items-center justify-between hover:bg-[#334155]/30 transition-colors">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-blue-400">{email.contactName.charAt(0).toUpperCase()}</span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-white truncate">{email.contactName}</p>
                  <p className="text-xs text-slate-400 truncate">{email.subject}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0">
                {email.campaign && <span className="text-xs px-2 py-0.5 bg-violet-500/20 text-violet-400 rounded-full">{email.campaign.name}</span>}
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${email.status === "sent" ? "bg-emerald-500/20 text-emerald-400" : email.status === "bounced" ? "bg-red-500/20 text-red-400" : "bg-amber-500/20 text-amber-400"}`}>{email.status}</span>
                {email.opened && <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-500/20 text-blue-400">opened</span>}
                <span className="text-xs text-slate-500">{new Date(email.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
