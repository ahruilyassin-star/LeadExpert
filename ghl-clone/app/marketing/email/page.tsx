"use client";

import { useState } from "react";
import Header from "@/components/header";
import { campaigns } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import {
  Mail, Plus, Search, MoreHorizontal, Eye, MousePointer,
  Send, Clock, FileText, TrendingUp, Users, BarChart2
} from "lucide-react";

const statusColor = (status: string) => {
  if (status === "Sent") return "bg-green-100 text-green-700";
  if (status === "Active") return "bg-blue-100 text-blue-700";
  if (status === "Scheduled") return "bg-yellow-100 text-yellow-700";
  return "bg-gray-100 text-gray-500";
};

const statusIcon = (status: string) => {
  if (status === "Sent") return <Send className="w-3 h-3" />;
  if (status === "Active") return <TrendingUp className="w-3 h-3" />;
  if (status === "Scheduled") return <Clock className="w-3 h-3" />;
  return <FileText className="w-3 h-3" />;
};

export default function EmailCampaignsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All");

  const filters = ["All", "Sent", "Active", "Scheduled", "Draft"];

  const filtered = campaigns.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.subject.toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter === "All" || c.status === filter;
    return matchSearch && matchFilter;
  });

  const totalSent = campaigns.filter(c => c.status === "Sent" || c.status === "Active").reduce((s, c) => s + c.sent, 0);
  const avgOpenRate = campaigns.filter(c => c.sent > 0).reduce((s, c) => s + c.openRate, 0) / campaigns.filter(c => c.sent > 0).length;
  const avgClickRate = campaigns.filter(c => c.sent > 0).reduce((s, c) => s + c.clickRate, 0) / campaigns.filter(c => c.sent > 0).length;

  return (
    <div className="flex flex-col flex-1">
      <Header title="Email Campaigns" />
      <main className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Campaigns", value: campaigns.length, icon: Mail, color: "bg-blue-500", change: "+2 this month" },
            { label: "Emails Sent", value: totalSent.toLocaleString(), icon: Send, color: "bg-green-500", change: "+1,248 this month" },
            { label: "Avg. Open Rate", value: avgOpenRate.toFixed(1) + "%", icon: Eye, color: "bg-purple-500", change: "+3.2% vs last month" },
            { label: "Avg. Click Rate", value: avgClickRate.toFixed(1) + "%", icon: MousePointer, color: "bg-[#00b4d8]", change: "+1.8% vs last month" },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <div className={cn("w-9 h-9 rounded-lg flex items-center justify-center", stat.color)}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-green-600 mt-1">{stat.change}</p>
              </div>
            );
          })}
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search campaigns..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00b4d8]/30 focus:border-[#00b4d8] bg-white"
            />
          </div>

          <div className="flex bg-gray-100 rounded-lg p-1 gap-1">
            {filters.map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-medium transition-all",
                  filter === f ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
                )}
              >
                {f}
              </button>
            ))}
          </div>

          <button className="flex items-center gap-2 px-4 py-2 bg-[#00b4d8] hover:bg-[#0096b7] text-white text-sm font-medium rounded-lg ml-auto transition-colors">
            <Plus className="w-4 h-4" />
            New Campaign
          </button>
        </div>

        {/* Campaign Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Campaign</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Status</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Sent</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Open Rate</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Click Rate</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((campaign) => (
                <tr key={campaign.id} className="hover:bg-gray-50 transition-colors group">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Mail className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{campaign.name}</p>
                        <p className="text-xs text-gray-400 truncate max-w-xs">{campaign.subject}</p>
                        <p className="text-xs text-gray-400 mt-0.5">{campaign.date}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={cn("flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full w-fit", statusColor(campaign.status))}>
                      {statusIcon(campaign.status)}
                      {campaign.status}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Users className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">
                        {campaign.sent > 0 ? campaign.sent.toLocaleString() : "—"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-right">
                    {campaign.openRate > 0 ? (
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-sm font-semibold text-gray-900">{campaign.openRate}%</span>
                        <div className="w-16 bg-gray-100 rounded-full h-1.5">
                          <div className="h-1.5 bg-purple-400 rounded-full" style={{ width: `${Math.min(campaign.openRate, 100)}%` }} />
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-4 text-right">
                    {campaign.clickRate > 0 ? (
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-sm font-semibold text-gray-900">{campaign.clickRate}%</span>
                        <div className="w-16 bg-gray-100 rounded-full h-1.5">
                          <div className="h-1.5 bg-[#00b4d8] rounded-full" style={{ width: `${Math.min(campaign.clickRate * 3, 100)}%` }} />
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 hover:bg-gray-100 rounded-md text-gray-400 hover:text-gray-600">
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 hover:bg-gray-100 rounded-md text-gray-400 hover:text-gray-600">
                        <BarChart2 className="w-3.5 h-3.5" />
                      </button>
                      <button className="p-1.5 hover:bg-gray-100 rounded-md text-gray-400 hover:text-gray-600">
                        <MoreHorizontal className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
