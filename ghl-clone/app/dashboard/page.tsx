"use client";

import Header from "@/components/header";
import { contacts, deals, campaigns, revenueData } from "@/lib/mock-data";
import { formatCurrency } from "@/lib/utils";
import { Users, MessageSquare, TrendingUp, Euro, ArrowUp, ArrowDown, UserPlus, Mail, Zap } from "lucide-react";
import Link from "next/link";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from "recharts";

const wonDeals = deals.filter(d => d.stage === "Won");
const totalRevenue = wonDeals.reduce((s, d) => s + d.value, 0);
const activeDeals = deals.filter(d => !["Won", "Lost"].includes(d.stage)).length;

export default function Dashboard() {
  return (
    <div className="flex flex-col flex-1">
      <Header title="Dashboard" />
      <main className="p-6 space-y-6">

        {/* Stat cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Totaal Contacten", value: contacts.length, icon: Users, change: "+12%", up: true, color: "bg-blue-500" },
            { label: "Actieve Deals", value: activeDeals, icon: TrendingUp, change: "+5%", up: true, color: "bg-purple-500" },
            { label: "Gesprekken", value: 10, icon: MessageSquare, change: "+18%", up: true, color: "bg-green-500" },
            { label: "Omzet Deze Maand", value: formatCurrency(8900), icon: Euro, change: "+24%", up: true, color: "bg-[#00b4d8]" },
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
                  {stat.up ? <ArrowUp className="w-3 h-3 text-green-500" /> : <ArrowDown className="w-3 h-3 text-red-500" />}
                  <span className={`text-xs font-medium ${stat.up ? "text-green-600" : "text-red-600"}`}>{stat.change}</span>
                  <span className="text-xs text-gray-400">vs vorige maand</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue chart */}
          <div className="lg:col-span-2 bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Omzet per Maand</h2>
              <span className="text-xs bg-green-50 text-green-700 font-medium px-2.5 py-1 rounded-full">Laatste 7 maanden</span>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `€${v / 1000}k`} />
                <Tooltip formatter={(v) => [formatCurrency(v as number), "Omzet"]} />
                <Line type="monotone" dataKey="revenue" stroke="#00b4d8" strokeWidth={2.5} dot={{ r: 4, fill: "#00b4d8" }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Pipeline overview */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Pipeline Overzicht</h2>
              <Link href="/pipelines" className="text-xs text-[#00b4d8] hover:underline">Bekijk alles</Link>
            </div>
            <div className="space-y-3">
              {[
                { stage: "New Lead", count: deals.filter(d => d.stage === "New Lead").length, color: "bg-blue-400" },
                { stage: "Contacted", count: deals.filter(d => d.stage === "Contacted").length, color: "bg-yellow-400" },
                { stage: "Proposal Sent", count: deals.filter(d => d.stage === "Proposal Sent").length, color: "bg-orange-400" },
                { stage: "Negotiation", count: deals.filter(d => d.stage === "Negotiation").length, color: "bg-purple-400" },
                { stage: "Won", count: wonDeals.length, color: "bg-green-400" },
                { stage: "Lost", count: deals.filter(d => d.stage === "Lost").length, color: "bg-red-400" },
              ].map((item) => (
                <div key={item.stage} className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${item.color} flex-shrink-0`} />
                  <span className="text-sm text-gray-600 flex-1">{item.stage}</span>
                  <span className="text-sm font-semibold text-gray-900">{item.count}</span>
                  <div className="w-16 bg-gray-100 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full ${item.color}`} style={{ width: `${(item.count / deals.length) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">Totale pipeline waarde</p>
              <p className="text-lg font-bold text-gray-900">{formatCurrency(deals.reduce((s, d) => s + d.value, 0))}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent contacts */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Recente Contacten</h2>
              <Link href="/contacts" className="text-xs text-[#00b4d8] hover:underline">Bekijk alles</Link>
            </div>
            <div className="space-y-3">
              {contacts.slice(0, 6).map((c) => (
                <div key={c.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#1a1d24] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {c.name.split(" ").map(n => n[0]).join("").slice(0,2)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{c.name}</p>
                    <p className="text-xs text-gray-400 truncate">{c.email}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    c.stage === "Won" ? "bg-green-50 text-green-700" :
                    c.stage === "Lost" ? "bg-red-50 text-red-700" :
                    "bg-blue-50 text-blue-700"
                  }`}>
                    {c.stage}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions + campaigns */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <h2 className="font-semibold text-gray-900 mb-3">Snelle Acties</h2>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Contact Toevoegen", icon: UserPlus, href: "/contacts", color: "bg-blue-50 text-blue-600" },
                  { label: "Campagne Starten", icon: Mail, href: "/marketing/email", color: "bg-purple-50 text-purple-600" },
                  { label: "Workflow Maken", icon: Zap, href: "/automation", color: "bg-green-50 text-green-600" },
                ].map((action) => {
                  const Icon = action.icon;
                  return (
                    <Link key={action.label} href={action.href} className={`${action.color} rounded-lg p-3 flex flex-col items-center gap-2 hover:opacity-80 transition-opacity`}>
                      <Icon className="w-5 h-5" />
                      <span className="text-xs font-medium text-center leading-tight">{action.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>

            <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-gray-900">Recente Campagnes</h2>
                <Link href="/marketing/email" className="text-xs text-[#00b4d8] hover:underline">Bekijk alles</Link>
              </div>
              <div className="space-y-2">
                {campaigns.slice(0, 3).map((c) => (
                  <div key={c.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                    <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      c.status === "Sent" ? "bg-green-400" :
                      c.status === "Active" ? "bg-blue-400" :
                      c.status === "Scheduled" ? "bg-yellow-400" : "bg-gray-400"
                    }`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{c.name}</p>
                      <p className="text-xs text-gray-400">{c.sent > 0 ? `${c.sent} verzonden • ${c.openRate}% geopend` : c.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
