"use client";

import { useState, useEffect } from "react";

interface CrmContact { id: string; name: string; email: string; company: string | null; }
interface ComposedEmail { id: string; subject: string; body: string; contactName: string; contactEmail: string; tone: string; status: string; }

const tones = [
  { value: "professional", label: "Professional", desc: "Clear and business-appropriate" },
  { value: "friendly", label: "Friendly", desc: "Warm and approachable" },
  { value: "formal", label: "Formal", desc: "Highly structured and respectful" },
  { value: "casual", label: "Casual", desc: "Relaxed and conversational" },
];

export default function ComposePage() {
  const [crmContacts, setCrmContacts] = useState<CrmContact[]>([]);
  const [crmLoading, setCrmLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedContact, setSelectedContact] = useState<CrmContact | null>(null);
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [prompt, setPrompt] = useState("");
  const [tone, setTone] = useState("professional");
  const [composedEmail, setComposedEmail] = useState<ComposedEmail | null>(null);
  const [editSubject, setEditSubject] = useState("");
  const [editBody, setEditBody] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/contacts")
      .then((res) => res.json())
      .then((data) => setCrmContacts(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setCrmLoading(false));
  }, []);

  const filteredContacts = crmContacts.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.company && c.company.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  function selectContact(contact: CrmContact) { setSelectedContact(contact); setContactName(contact.name); setContactEmail(contact.email); setSearchQuery(""); setShowDropdown(false); }
  function clearSelectedContact() { setSelectedContact(null); setContactName(""); setContactEmail(""); }

  async function handleCompose() {
    if (!contactName || !contactEmail || !prompt) { setError("Please fill in all required fields"); return; }
    setError(""); setIsComposing(true); setSent(false);
    try {
      const res = await fetch("/api/emails/compose", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt, tone, contactId: selectedContact?.id || undefined, contactName, contactEmail }) });
      if (!res.ok) throw new Error("Failed to compose email");
      const email = await res.json();
      setComposedEmail(email); setEditSubject(email.subject); setEditBody(email.body);
    } catch { setError("Failed to compose email. Please try again."); } finally { setIsComposing(false); }
  }

  async function handleSend() {
    if (!composedEmail) return;
    setIsSending(true); setError("");
    try { const res = await fetch(`/api/emails/${composedEmail.id}/send`, { method: "POST" }); if (!res.ok) throw new Error("Failed to send email"); setSent(true); }
    catch { setError("Failed to send email. Please try again."); } finally { setIsSending(false); }
  }

  function handleReset() { setSelectedContact(null); setContactName(""); setContactEmail(""); setPrompt(""); setTone("professional"); setComposedEmail(null); setEditSubject(""); setEditBody(""); setSent(false); setError(""); setSearchQuery(""); }

  return (
    <div>
      <div className="mb-8"><h1 className="text-2xl font-bold text-white">Compose Email</h1><p className="text-slate-400 mt-1">Use AI to draft the perfect email</p></div>
      {error && <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>}
      {sent && <div className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 text-sm flex items-center justify-between"><span>Email sent successfully!</span><button onClick={handleReset} className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-sm rounded-lg transition-colors">Compose Another</button></div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-6">
            <div className="flex items-center justify-between mb-4"><h2 className="text-lg font-semibold text-white">Recipient</h2><span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full">{crmLoading ? "Loading..." : `${crmContacts.length} contacts`}</span></div>
            {selectedContact ? (
              <div className="flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">{selectedContact.name.charAt(0).toUpperCase()}</div>
                <div className="flex-1 min-w-0"><p className="text-sm font-medium text-white">{selectedContact.name}</p><p className="text-xs text-slate-400">{selectedContact.email}{selectedContact.company ? ` - ${selectedContact.company}` : ""}</p></div>
                <button onClick={clearSelectedContact} className="text-slate-400 hover:text-red-400 p-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  <input type="text" value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setShowDropdown(true); }} onFocus={() => setShowDropdown(true)} placeholder="Search contacts..." className="w-full pl-10 pr-4 py-2.5 bg-[#0f172a] border border-[#334155] rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                </div>
                {showDropdown && !crmLoading && filteredContacts.length > 0 && (
                  <div className="max-h-48 overflow-y-auto bg-[#0f172a] border border-[#334155] rounded-lg divide-y divide-[#334155]">
                    {filteredContacts.map((c) => (
                      <button key={c.id} onClick={() => selectContact(c)} className="w-full flex items-center gap-3 p-3 text-left hover:bg-[#334155] transition-colors">
                        <div className="w-8 h-8 rounded-full bg-blue-600/50 flex items-center justify-center text-blue-300 text-xs font-bold">{c.name.charAt(0).toUpperCase()}</div>
                        <div className="min-w-0"><p className="text-sm text-white truncate">{c.name}</p><p className="text-xs text-slate-400 truncate">{c.email}</p></div>
                      </button>
                    ))}
                  </div>
                )}
                <div className="pt-2 border-t border-[#334155]"><p className="text-xs text-slate-500 mb-2">Or enter manually:</p>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Contact name" className="px-3 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                    <input type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} placeholder="Email address" className="px-3 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" />
                  </div>
                </div>
              </div>
            )}
          </div>
          <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-6"><h2 className="text-lg font-semibold text-white mb-4">Email Prompt</h2><textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} placeholder="What should the email say?" rows={4} className="w-full px-4 py-2.5 bg-[#0f172a] border border-[#334155] rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" /></div>
          <div className="bg-[#1e293b] border border-[#334155] rounded-xl p-6"><h2 className="text-lg font-semibold text-white mb-4">Tone</h2>
            <div className="grid grid-cols-2 gap-3">{tones.map((t) => (<button key={t.value} onClick={() => setTone(t.value)} className={`p-3 rounded-lg border text-left transition-all ${tone === t.value ? "border-blue-500 bg-blue-500/10 text-blue-400" : "border-[#334155] bg-[#0f172a] text-slate-400 hover:border-[#475569]"}`}><p className="text-sm font-medium">{t.label}</p><p className="text-xs mt-0.5 opacity-70">{t.desc}</p></button>))}</div>
          </div>
          <button onClick={handleCompose} disabled={isComposing || sent} className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2">
            {isComposing ? (<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />AI is composing...</>) : (<><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>AI Compose</>)}
          </button>
        </div>
        <div>
          <div className="bg-[#1e293b] border border-[#334155] rounded-xl overflow-hidden sticky top-8">
            <div className="p-6 border-b border-[#334155]"><h2 className="text-lg font-semibold text-white">Email Preview</h2></div>
            {composedEmail ? (
              <div className="p-6 space-y-4">
                <div><label className="block text-xs font-medium text-slate-500 mb-1">TO</label><p className="text-sm text-slate-300">{composedEmail.contactName} &lt;{composedEmail.contactEmail}&gt;</p></div>
                <div><label className="block text-xs font-medium text-slate-500 mb-1">SUBJECT</label><input type="text" value={editSubject} onChange={(e) => setEditSubject(e.target.value)} className="w-full px-3 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" /></div>
                <div><label className="block text-xs font-medium text-slate-500 mb-1">BODY</label><textarea value={editBody} onChange={(e) => setEditBody(e.target.value)} rows={12} className="w-full px-3 py-2 bg-[#0f172a] border border-[#334155] rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" /></div>
                <div className="flex items-center gap-2 pt-2">
                  <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${sent ? "bg-emerald-500/20 text-emerald-400" : "bg-amber-500/20 text-amber-400"}`}>{sent ? "sent" : composedEmail.status}</span>
                  <span className="px-2.5 py-1 text-xs font-medium rounded-full bg-blue-500/20 text-blue-400">{composedEmail.tone}</span>
                </div>
                {!sent && <button onClick={handleSend} disabled={isSending} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2">{isSending ? (<><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Sending...</>) : (<><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>Send Email</>)}</button>}
              </div>
            ) : (
              <div className="p-12 text-center"><p className="text-slate-500">Fill in the form and click &quot;AI Compose&quot; to generate your email</p></div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
