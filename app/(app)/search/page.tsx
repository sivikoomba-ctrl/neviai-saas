"use client";

import { useState } from "react";
import Link from "next/link";

interface SearchResult { type: "contact" | "deal"; id: string; title: string; subtitle: string; relevance: string; }

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setSearched(true);
    try { const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`); const data = await res.json(); setResults(data.results || []); }
    catch { setResults([]); } finally { setLoading(false); }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">AI Smart Search</h1>
      <form onSubmit={handleSearch} className="mb-8">
        <div className="flex gap-3">
          <div className="flex-1 relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search with natural language... e.g. 'high value deals that need follow-up'" className="w-full bg-[#1e293b] border border-[#334155] rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm" />
          </div>
          <button type="submit" disabled={loading || !query.trim()} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-sm font-medium transition-colors disabled:opacity-50">{loading ? "Searching..." : "Search"}</button>
        </div>
      </form>
      {loading && <div className="flex items-center justify-center h-32"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>}
      {!loading && searched && results.length === 0 && <div className="text-center py-12 text-slate-400"><p>No results found for &ldquo;{query}&rdquo;</p></div>}
      {!loading && results.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm text-slate-400 mb-4">{results.length} result{results.length !== 1 ? "s" : ""} found</p>
          {results.map((result, idx) => (
            <Link key={`${result.type}-${result.id}-${idx}`} href={result.type === "contact" ? `/contacts/${result.id}` : `/deals/${result.id}`} className="block bg-[#1e293b] border border-[#334155] rounded-xl p-4 hover:border-blue-500/50 transition-colors">
              <div className="flex items-start gap-3">
                <span className={`text-xs px-2 py-1 rounded-full font-medium ${result.type === "contact" ? "bg-blue-500/20 text-blue-400" : "bg-green-500/20 text-green-400"}`}>{result.type === "contact" ? "Contact" : "Deal"}</span>
                <div className="flex-1 min-w-0"><p className="font-medium text-white">{result.title}</p><p className="text-sm text-slate-400 mt-1">{result.subtitle}</p><p className="text-xs text-slate-500 mt-2 italic">{result.relevance}</p></div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
