"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  tags: string | string[];
  createdAt: string;
  deals: { id: string }[];
  _count: { interactions: number };
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadContacts();
  }, []);

  async function loadContacts(q?: string) {
    setLoading(true);
    try {
      const url = q ? `/api/contacts?q=${encodeURIComponent(q)}` : "/api/contacts";
      const res = await fetch(url);
      const data = await res.json();
      setContacts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load contacts:", err);
    } finally {
      setLoading(false);
    }
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    loadContacts(search);
  }

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete contact "${name}"? This will also delete their deals and interactions.`)) return;
    try {
      await fetch(`/api/contacts/${id}`, { method: "DELETE" });
      setContacts((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      console.error("Failed to delete contact:", err);
    }
  }

  function parseTags(tags: string | string[] | null): string[] {
    if (!tags) return [];
    if (Array.isArray(tags)) return tags;
    try { return JSON.parse(tags); } catch { return []; }
  }

  const tagColors = [
    "bg-blue-500/20 text-blue-300",
    "bg-green-500/20 text-green-300",
    "bg-purple-500/20 text-purple-300",
    "bg-yellow-500/20 text-yellow-300",
    "bg-pink-500/20 text-pink-300",
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Contacts</h1>
          <p className="text-slate-400 mt-1">{contacts.length} total contacts</p>
        </div>
        <Link
          href="/contacts/new"
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Contact
        </Link>
      </div>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search contacts by name, email, or company..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#1e293b] border border-[#334155] rounded-lg pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>
          <button type="submit" className="bg-[#334155] hover:bg-[#475569] text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors">
            Search
          </button>
          {search && (
            <button type="button" onClick={() => { setSearch(""); loadContacts(); }} className="bg-[#334155] hover:bg-[#475569] text-slate-300 px-4 py-2.5 rounded-lg text-sm transition-colors">
              Clear
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      ) : contacts.length === 0 ? (
        <div className="bg-[#1e293b] rounded-xl border border-[#334155] p-12 text-center">
          <p className="text-slate-400">No contacts found.</p>
          <Link href="/contacts/new" className="text-blue-400 hover:text-blue-300 text-sm mt-2 inline-block">Create your first contact</Link>
        </div>
      ) : (
        <div className="bg-[#1e293b] rounded-xl border border-[#334155] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#334155]">
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Name</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Email</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Company</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Tags</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Deals</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {contacts.map((contact) => (
                <tr key={contact.id} className="border-b border-[#334155]/50 hover:bg-[#334155]/30 transition-colors">
                  <td className="px-6 py-4">
                    <Link href={`/contacts/${contact.id}`} className="flex items-center gap-3 group">
                      <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {contact.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-white group-hover:text-blue-400 transition-colors">{contact.name}</span>
                    </Link>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300">{contact.email}</td>
                  <td className="px-6 py-4 text-sm text-slate-300">{contact.company || "-"}</td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {parseTags(contact.tags).map((tag, i) => (
                        <span key={tag} className={`text-xs px-2 py-0.5 rounded-full ${tagColors[i % tagColors.length]}`}>{tag}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-300">{contact.deals?.length ?? 0}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link href={`/contacts/${contact.id}`} className="text-slate-400 hover:text-blue-400 transition-colors p-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                      </Link>
                      <button onClick={() => handleDelete(contact.id, contact.name)} className="text-slate-400 hover:text-red-400 transition-colors p-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
