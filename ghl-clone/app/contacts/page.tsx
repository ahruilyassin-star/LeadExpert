"use client";

import { useState } from "react";
import Header from "@/components/header";
import { contacts } from "@/lib/mock-data";
import { cn, getInitials, getAvatarColor } from "@/lib/utils";
import {
  Search, Plus, Filter, ChevronLeft, ChevronRight,
  Mail, Phone, MoreHorizontal, Edit, Trash2, X, Tag
} from "lucide-react";

type FilterType = "all" | "lead" | "customer" | "unsubscribed";

export default function ContactsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterType>("all");
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [newContact, setNewContact] = useState({
    name: "", email: "", phone: "", tags: "", source: ""
  });

  const perPage = 10;

  const filtered = contacts.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.email.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search);
    const matchesFilter =
      filter === "all" ||
      (filter === "lead" && (c.tags.some(t => ["Lead", "Hot", "Warm", "Cold"].includes(t)))) ||
      (filter === "customer" && c.tags.includes("Customer")) ||
      (filter === "unsubscribed" && c.tags.includes("Unsubscribed"));
    return matchesSearch && matchesFilter;
  });

  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  const stageColor = (stage: string) => {
    if (stage === "Won") return "bg-green-100 text-green-700";
    if (stage === "Lost") return "bg-red-100 text-red-700";
    if (stage === "Negotiation") return "bg-purple-100 text-purple-700";
    if (stage === "Proposal Sent") return "bg-orange-100 text-orange-700";
    if (stage === "Contacted") return "bg-yellow-100 text-yellow-700";
    return "bg-blue-100 text-blue-700";
  };

  const tagColor = (tag: string) => {
    if (tag === "Customer") return "bg-green-50 text-green-700 border border-green-200";
    if (tag === "VIP") return "bg-purple-50 text-purple-700 border border-purple-200";
    if (tag === "Hot") return "bg-red-50 text-red-700 border border-red-200";
    if (tag === "Warm") return "bg-orange-50 text-orange-700 border border-orange-200";
    if (tag === "Cold") return "bg-blue-50 text-blue-700 border border-blue-200";
    if (tag === "Unsubscribed") return "bg-gray-100 text-gray-500 border border-gray-200";
    return "bg-gray-50 text-gray-600 border border-gray-200";
  };

  return (
    <div className="flex flex-col flex-1">
      <Header title="Contacts" />
      <main className="p-6 space-y-5">
        {/* Stats row */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Contacts", value: contacts.length, color: "text-blue-600" },
            { label: "Leads", value: contacts.filter(c => c.tags.some(t => ["Lead","Hot","Warm","Cold"].includes(t))).length, color: "text-orange-600" },
            { label: "Customers", value: contacts.filter(c => c.tags.includes("Customer")).length, color: "text-green-600" },
            { label: "Unsubscribed", value: contacts.filter(c => c.tags.includes("Unsubscribed")).length, color: "text-red-600" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
              <p className="text-xs text-gray-500 mb-1">{stat.label}</p>
              <p className={cn("text-2xl font-bold", stat.color)}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search by name, email, or phone..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00b4d8]/30 focus:border-[#00b4d8] bg-white"
            />
          </div>

          <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
            {(["all", "lead", "customer", "unsubscribed"] as FilterType[]).map((f) => (
              <button
                key={f}
                onClick={() => { setFilter(f); setPage(1); }}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-medium capitalize transition-all",
                  filter === f ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                )}
              >
                {f === "all" ? `All (${contacts.length})` : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>

          <button className="flex items-center gap-2 px-3 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 bg-white">
            <Filter className="w-4 h-4" />
            Filters
          </button>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#00b4d8] hover:bg-[#0096b7] text-white text-sm font-medium rounded-lg ml-auto transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Contact
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Contact</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Phone</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Tags</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Pipeline Stage</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Source</th>
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Last Activity</th>
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {paginated.map((contact) => (
                  <tr key={contact.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0",
                          getAvatarColor(contact.name)
                        )}>
                          {getInitials(contact.name)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{contact.name}</p>
                          <p className="text-xs text-gray-400 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {contact.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm text-gray-600 flex items-center gap-1">
                        <Phone className="w-3 h-3 text-gray-400" />
                        {contact.phone}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex flex-wrap gap-1">
                        {contact.tags.slice(0, 2).map((tag) => (
                          <span key={tag} className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-0.5", tagColor(tag))}>
                            <Tag className="w-2.5 h-2.5" />
                            {tag}
                          </span>
                        ))}
                        {contact.tags.length > 2 && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">+{contact.tags.length - 2}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={cn("text-xs px-2.5 py-1 rounded-full font-medium", stageColor(contact.stage))}>
                        {contact.stage}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm text-gray-500">{contact.source}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm text-gray-500">{contact.lastActivity}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-1.5 hover:bg-gray-100 rounded-md text-gray-400 hover:text-gray-600 transition-colors">
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1.5 hover:bg-gray-100 rounded-md text-gray-400 hover:text-red-500 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <button className="p-1.5 hover:bg-gray-100 rounded-md text-gray-400 hover:text-gray-600 transition-colors">
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100 bg-gray-50">
            <p className="text-xs text-gray-500">
              Showing {Math.min((page - 1) * perPage + 1, filtered.length)}–{Math.min(page * perPage, filtered.length)} of {filtered.length} contacts
            </p>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-md hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed text-gray-500 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className={cn(
                    "w-7 h-7 text-xs rounded-md font-medium transition-colors",
                    page === p ? "bg-[#00b4d8] text-white" : "hover:bg-gray-200 text-gray-600"
                  )}
                >
                  {p}
                </button>
              ))}
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || totalPages === 0}
                className="p-1.5 rounded-md hover:bg-gray-200 disabled:opacity-40 disabled:cursor-not-allowed text-gray-500 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Add Contact Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">Add New Contact</h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    value={newContact.name}
                    onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                    placeholder="John Smith"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00b4d8]/30 focus:border-[#00b4d8]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">Phone</label>
                  <input
                    type="tel"
                    value={newContact.phone}
                    onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00b4d8]/30 focus:border-[#00b4d8]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Email Address *</label>
                <input
                  type="email"
                  value={newContact.email}
                  onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                  placeholder="john@example.com"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00b4d8]/30 focus:border-[#00b4d8]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Tags</label>
                <input
                  type="text"
                  value={newContact.tags}
                  onChange={(e) => setNewContact({ ...newContact, tags: e.target.value })}
                  placeholder="Lead, Hot, VIP (comma separated)"
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00b4d8]/30 focus:border-[#00b4d8]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Source</label>
                <select
                  value={newContact.source}
                  onChange={(e) => setNewContact({ ...newContact, source: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00b4d8]/30 focus:border-[#00b4d8] bg-white"
                >
                  <option value="">Select source...</option>
                  <option>Website</option>
                  <option>Facebook</option>
                  <option>Instagram</option>
                  <option>Google Ads</option>
                  <option>Referral</option>
                  <option>Cold Outreach</option>
                  <option>Webinar</option>
                  <option>Trade Show</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg hover:bg-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowModal(false)}
                className="px-5 py-2 text-sm font-medium bg-[#00b4d8] hover:bg-[#0096b7] text-white rounded-lg transition-colors"
              >
                Create Contact
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
