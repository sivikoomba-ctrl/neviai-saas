"use client";

import { useEffect, useState } from "react";

interface OrgInfo { name: string; slug: string; plan: string; emailQuotaMonthly: number; aiQuotaMonthly: number; contactQuota: number; }
interface UsageInfo { emailsSent: number; aiCalls: number; }

export default function SettingsPage() {
  const [org, setOrg] = useState<OrgInfo | null>(null);
  const [usage, setUsage] = useState<UsageInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [orgName, setOrgName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/settings");
        if (res.ok) {
          const data = await res.json();
          setOrg(data.org);
          setUsage(data.usage);
          setOrgName(data.org.name);
        }
      } catch (err) {
        console.error("Failed to load settings:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleSaveName() {
    if (!orgName.trim() || orgName === org?.name) { setEditing(false); return; }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: orgName }),
      });
      const data = await res.json();
      if (res.ok) {
        setOrg((prev) => prev ? { ...prev, name: data.name } : prev);
        setEditing(false);
      } else {
        setError(data.error || `Save failed (${res.status})`);
      }
    } catch (err) {
      setError("Network error — could not reach server");
      console.error("Failed to save:", err);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>;

  const planColors: Record<string, string> = { free: "bg-slate-500/20 text-slate-400", pro: "bg-blue-500/20 text-blue-400", enterprise: "bg-violet-500/20 text-violet-400" };

  return (
    <div>
      <div className="mb-8"><h1 className="text-2xl font-bold text-white">Settings</h1><p className="text-slate-400 mt-1">Manage your organization and subscription</p></div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Organization</h2>
          {error && <div className="mb-4 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</div>}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-400">Name</span>
              {editing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={orgName}
                    onChange={(e) => setOrgName(e.target.value)}
                    className="bg-[#0f172a] border border-[#334155] rounded-lg px-3 py-1.5 text-sm text-white focus:outline-none focus:border-blue-500 w-48"
                    autoFocus
                    onKeyDown={(e) => { if (e.key === "Enter") handleSaveName(); if (e.key === "Escape") { setEditing(false); setOrgName(org?.name || ""); } }}
                  />
                  <button onClick={handleSaveName} disabled={saving} className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg disabled:opacity-50">{saving ? "..." : "Save"}</button>
                  <button onClick={() => { setEditing(false); setOrgName(org?.name || ""); }} className="text-xs text-slate-400 hover:text-white px-2 py-1.5">Cancel</button>
                </div>
              ) : (
                <button onClick={() => setEditing(true)} className="text-sm text-white font-medium hover:text-blue-400 transition-colors flex items-center gap-1.5">
                  {org?.name || "N/A"}
                  <svg className="w-3.5 h-3.5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                </button>
              )}
            </div>
            <div className="flex items-center justify-between"><span className="text-sm text-slate-400">Plan</span><span className={`text-xs px-2.5 py-1 rounded-full font-medium ${planColors[org?.plan || "free"]}`}>{org?.plan || "free"}</span></div>
            <div className="flex items-center justify-between"><span className="text-sm text-slate-400">Email Quota</span><span className="text-sm text-white">{org?.emailQuotaMonthly || 50}/month</span></div>
            <div className="flex items-center justify-between"><span className="text-sm text-slate-400">AI Quota</span><span className="text-sm text-white">{org?.aiQuotaMonthly || 20}/month</span></div>
            <div className="flex items-center justify-between"><span className="text-sm text-slate-400">Contact Limit</span><span className="text-sm text-white">{org?.contactQuota || 100}</span></div>
          </div>
        </div>

        <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Usage This Month</h2>
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2"><span className="text-sm text-slate-400">Emails Sent</span><span className="text-sm text-white">{usage?.emailsSent || 0} / {org?.emailQuotaMonthly || 50}</span></div>
              <div className="w-full h-2 bg-[#0f172a] rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${Math.min(((usage?.emailsSent || 0) / (org?.emailQuotaMonthly || 50)) * 100, 100)}%` }} /></div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2"><span className="text-sm text-slate-400">AI Calls</span><span className="text-sm text-white">{usage?.aiCalls || 0} / {org?.aiQuotaMonthly || 20}</span></div>
              <div className="w-full h-2 bg-[#0f172a] rounded-full overflow-hidden"><div className="h-full bg-violet-500 rounded-full transition-all" style={{ width: `${Math.min(((usage?.aiCalls || 0) / (org?.aiQuotaMonthly || 20)) * 100, 100)}%` }} /></div>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 bg-[#1e293b] rounded-xl border border-[#334155] p-6">
        <h2 className="text-lg font-semibold text-white mb-2">Upgrade Your Plan</h2>
        <p className="text-sm text-slate-400 mb-4">Get more emails, AI calls, and contacts with a Pro plan.</p>
        <form action="/api/stripe/checkout" method="POST">
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-colors">Upgrade to Pro</button>
        </form>
      </div>
    </div>
  );
}
