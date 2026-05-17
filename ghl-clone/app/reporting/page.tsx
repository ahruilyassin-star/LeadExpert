"use client";

import Header from "@/components/header";
import { revenueData, leadSources, campaigns } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import {
  TrendingUp, Users, BarChart2, DollarSign,
  Calendar, ChevronDown
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from "recharts";

const PIE_COLORS = ["#00b4d8", "#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#6b7280"];

const monthlyData = [
  { month: "Nov", revenue: 4200, contacts: 28 },
  { month: "Dec", revenue: 7800, contacts: 45 },
  { month: "Jan", revenue: 3400, contacts: 19 },
  { month: "Feb", revenue: 4100, contacts: 24 },
  { month: "Mrt", revenue: 5200, contacts: 31 },
  { month: "Apr", revenue: 6800, contacts: 38 },
  { month: "Mei", revenue: 8900, contacts: 52 },
];

export default function ReportingPage() {
  const totalRevenue = monthlyData.reduce((s, m) => s + m.revenue, 0);
  const totalContacts = monthlyData.reduce((s, m) => s + m.contacts, 0);
  const avgOrderValue = totalRevenue / totalContacts;

  return (
    <div className="flex flex-col flex-1">
      <Header title="Reporting" />
      <main className="p-6 space-y-6">
        {/* Date range header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Analytics Overview</h2>
            <p className="text-sm text-gray-500">Last 7 months performance</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors shadow-sm">
              <Calendar className="w-4 h-4" />
              Nov 2025 — May 2026
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
            <button className="px-4 py-2 bg-[#00b4d8] hover:bg-[#0096b7] text-white text-sm font-medium rounded-lg transition-colors">
              Export Report
            </button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Revenue", value: formatCurrency(totalRevenue), icon: DollarSign, change: "+24%", color: "bg-green-500", bg: "bg-green-50 text-green-600" },
            { label: "New Contacts", value: totalContacts, icon: Users, change: "+18%", color: "bg-blue-500", bg: "bg-blue-50 text-blue-600" },
            { label: "Conversion Rate", value: "12.4%", icon: TrendingUp, change: "+3.2%", color: "bg-purple-500", bg: "bg-purple-50 text-purple-600" },
            { label: "Avg Deal Size", value: formatCurrency(avgOrderValue), icon: BarChart2, change: "+8%", color: "bg-[#00b4d8]", bg: "bg-cyan-50 text-cyan-600" },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <div className={`w-9 h-9 ${stat.color} rounded-lg flex items-center justify-center`}>
                    <Icon className="w-4 h-4 text-white" />
                  </div>
                </div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-3 h-3 text-green-500" />
                  <span className="text-xs font-medium text-green-600">{stat.change}</span>
                  <span className="text-xs text-gray-400">vs prev period</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Bar Chart */}
          <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="font-semibold text-gray-900">Monthly Revenue</h3>
                <p className="text-xs text-gray-400 mt-0.5">Revenue trend over last 7 months</p>
              </div>
              <button className="flex items-center gap-1.5 text-xs text-gray-500 border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50">
                Revenue <ChevronDown className="w-3 h-3" />
              </button>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={monthlyData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => "€" + (v / 1000).toFixed(0) + "k"} />
                <Tooltip
                  formatter={(value) => [formatCurrency(value as number), "Revenue"]}
                  contentStyle={{ borderRadius: "8px", border: "1px solid #e5e7eb", fontSize: "12px" }}
                />
                <Bar dataKey="revenue" fill="#00b4d8" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie Chart */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="mb-5">
              <h3 className="font-semibold text-gray-900">Leads by Source</h3>
              <p className="text-xs text-gray-400 mt-0.5">Distribution of lead origins</p>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={leadSources}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {leadSources.map((_, index) => (
                    <Cell key={index} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value + "%", "Share"]} contentStyle={{ borderRadius: "8px", fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-2">
              {leadSources.map((source, i) => (
                <div key={source.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-xs text-gray-600">{source.name}</span>
                  </div>
                  <span className="text-xs font-semibold text-gray-900">{source.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Campaigns Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h3 className="font-semibold text-gray-900">Top Performing Campaigns</h3>
            <p className="text-xs text-gray-400 mt-0.5">Best campaigns by open rate</p>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50 bg-gray-50">
                <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Campaign</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Sent</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Opened</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-4 py-3">Open Rate</th>
                <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Click Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {campaigns
                .filter(c => c.sent > 0)
                .sort((a, b) => b.openRate - a.openRate)
                .map((camp) => (
                  <tr key={camp.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{camp.name}</p>
                        <p className="text-xs text-gray-400">{camp.date}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right text-sm text-gray-700">{camp.sent.toLocaleString()}</td>
                    <td className="px-4 py-3.5 text-right text-sm text-gray-700">{camp.opened.toLocaleString()}</td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-sm font-semibold text-gray-900">{camp.openRate}%</span>
                        <div className="w-20 bg-gray-100 rounded-full h-1.5">
                          <div className="h-1.5 bg-purple-400 rounded-full" style={{ width: `${Math.min(camp.openRate, 100)}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-sm font-semibold text-gray-900">{camp.clickRate}%</span>
                        <div className="w-20 bg-gray-100 rounded-full h-1.5">
                          <div className="h-1.5 bg-[#00b4d8] rounded-full" style={{ width: `${Math.min(camp.clickRate * 2, 100)}%` }} />
                        </div>
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
