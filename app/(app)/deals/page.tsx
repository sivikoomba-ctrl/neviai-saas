"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Deal {
  id: string;
  title: string;
  value: number;
  stage: string;
  aiScore: number | null;
  contact: { id: string; name: string; company: string | null };
  createdAt: string;
}

const STAGES = ["Lead", "Qualified", "Proposal", "Negotiation", "Won", "Lost"];

const stageColors: Record<string, { bg: string; border: string; header: string }> = {
  Lead: { bg: "bg-slate-500/5", border: "border-slate-500/30", header: "bg-slate-500" },
  Qualified: { bg: "bg-blue-500/5", border: "border-blue-500/30", header: "bg-blue-500" },
  Proposal: { bg: "bg-yellow-500/5", border: "border-yellow-500/30", header: "bg-yellow-500" },
  Negotiation: { bg: "bg-orange-500/5", border: "border-orange-500/30", header: "bg-orange-500" },
  Won: { bg: "bg-green-500/5", border: "border-green-500/30", header: "bg-green-500" },
  Lost: { bg: "bg-red-500/5", border: "border-red-500/30", header: "bg-red-500" },
};

export default function DealsPage() {
  const [deals, setDeals] = useState<Deal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/deals").then((res) => res.json()).then((data) => setDeals(Array.isArray(data) ? data : [])).catch(console.error).finally(() => setLoading(false));
  }, []);

  function dealsByStage(stage: string) { return deals.filter((d) => d.stage === stage); }
  function stageValue(stage: string) { return dealsByStage(stage).reduce((s, d) => s + Number(d.value || 0), 0); }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Deals Pipeline</h1>
          <p className="text-slate-400 mt-1">{deals.length} total deals &middot; ${deals.reduce((s, d) => s + Number(d.value || 0), 0).toLocaleString()} pipeline value</p>
        </div>
        <Link href="/deals/new" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          New Deal
        </Link>
      </div>
      <div className="flex gap-4 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const stageDeals = dealsByStage(stage);
          const colors = stageColors[stage];
          return (
            <div key={stage} className={`flex-shrink-0 w-72 rounded-xl border ${colors.border} ${colors.bg}`}>
              <div className={`${colors.header} rounded-t-xl px-4 py-3 flex items-center justify-between`}>
                <div className="flex items-center gap-2"><h3 className="text-sm font-bold text-white">{stage}</h3><span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">{stageDeals.length}</span></div>
                <span className="text-xs text-white/80">${stageValue(stage).toLocaleString()}</span>
              </div>
              <div className="p-3 space-y-3 min-h-[200px] max-h-[calc(100vh-300px)] overflow-y-auto">
                {stageDeals.length === 0 ? <p className="text-slate-500 text-xs text-center py-8">No deals</p> : stageDeals.map((deal) => (
                  <Link key={deal.id} href={`/deals/${deal.id}`} className="block bg-[#1e293b] rounded-lg p-4 border border-[#334155] hover:border-[#475569] transition-colors group">
                    <h4 className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors truncate">{deal.title}</h4>
                    <p className="text-xs text-slate-400 mt-1">{deal.contact?.name}</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-sm font-semibold text-green-400">${Number(deal.value || 0).toLocaleString()}</span>
                      {deal.aiScore !== null && (
                        <span className={`text-xs px-2 py-0.5 rounded-full ${deal.aiScore >= 75 ? "bg-green-500/20 text-green-300" : deal.aiScore >= 50 ? "bg-yellow-500/20 text-yellow-300" : "bg-red-500/20 text-red-300"}`}>Score: {deal.aiScore}</span>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
