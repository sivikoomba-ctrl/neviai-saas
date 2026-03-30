"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Template { id: string; name: string; subject: string; body: string; category: string | null; isAiGenerated: boolean; createdAt: string; }

export default function TemplatesPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetch("/api/templates").then((r) => r.json()).then((d) => setTemplates(Array.isArray(d) ? d : [])).catch(console.error).finally(() => setLoading(false)); }, []);

  if (loading) return <div className="flex items-center justify-center h-96"><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-2xl font-bold text-white">Templates</h1><p className="text-slate-400 mt-1">Manage your email templates</p></div>
        <Link href="/templates/new" className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>New Template</Link>
      </div>
      {templates.length === 0 ? (
        <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-12 text-center"><p className="text-slate-400 mb-4">No templates yet</p><Link href="/templates/new" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors">Create Your First Template</Link></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{templates.map((t) => (
          <Link key={t.id} href={`/templates/${t.id}`} className="bg-[#1e293b] border border-[#334155] rounded-xl p-6 hover:border-blue-500/50 transition-all duration-200 group">
            <div className="flex items-start justify-between mb-3"><div className="flex items-center gap-2">{t.category && <span className="px-2 py-0.5 text-xs font-medium rounded bg-[#334155] text-slate-400">{t.category}</span>}{t.isAiGenerated && <span className="px-2 py-0.5 text-xs font-medium rounded bg-blue-500/20 text-blue-400">AI</span>}</div></div>
            <h3 className="text-lg font-semibold text-white group-hover:text-blue-400 transition-colors mb-1">{t.name}</h3>
            <p className="text-sm text-slate-400 mb-3 truncate">{t.subject}</p>
            <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">{t.body.slice(0, 150)}...</p>
            <p className="text-xs text-slate-600 mt-4">{new Date(t.createdAt).toLocaleDateString()}</p>
          </Link>
        ))}</div>
      )}
    </div>
  );
}
