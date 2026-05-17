"use client";

import Header from "@/components/header";
import { funnels } from "@/lib/mock-data";
import { cn, formatCurrency } from "@/lib/utils";
import {
  Plus, TrendingUp, Users, MousePointer, BarChart2,
  MoreHorizontal, Eye, Edit, Play, Pause, Globe
} from "lucide-react";

const statusColor = (status: string) => {
  if (status === "Active") return "bg-green-100 text-green-700";
  if (status === "Paused") return "bg-yellow-100 text-yellow-700";
  return "bg-gray-100 text-gray-500";
};

// Fake funnel preview thumbnails
function FunnelPreview({ name, status }: { name: string; status: string }) {
  const colors = ["from-blue-400 to-blue-600", "from-purple-400 to-purple-600",
    "from-green-400 to-green-600", "from-orange-400 to-orange-600",
    "from-pink-400 to-pink-600", "from-teal-400 to-teal-600"];
  const hash = name.split("").reduce((s, c) => s + c.charCodeAt(0), 0);
  const color = colors[hash % colors.length];

  return (
    <div className={cn("w-full h-32 rounded-t-xl bg-gradient-to-br relative overflow-hidden", color)}>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 opacity-30">
        <div className="w-24 h-3 bg-white rounded-full" />
        <div className="w-16 h-2 bg-white rounded-full" />
        <div className="w-20 h-6 bg-white rounded-full mt-2" />
      </div>
      {status === "Draft" && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <span className="text-white text-xs font-medium bg-black/50 px-3 py-1 rounded-full">Draft</span>
        </div>
      )}
      {status === "Paused" && (
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
          <span className="text-white text-xs font-medium bg-black/40 px-3 py-1 rounded-full">Paused</span>
        </div>
      )}
      <div className="absolute top-2 right-2">
        <Globe className="w-4 h-4 text-white/70" />
      </div>
    </div>
  );
}

export default function FunnelsPage() {
  const totalVisits = funnels.reduce((s, f) => s + f.visits, 0);
  const totalOptIns = funnels.reduce((s, f) => s + f.optIns, 0);
  const totalConversions = funnels.reduce((s, f) => s + f.conversions, 0);

  return (
    <div className="flex flex-col flex-1">
      <Header title="Funnels" />
      <main className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total Funnels", value: funnels.length, icon: TrendingUp, color: "bg-blue-500", suffix: "" },
            { label: "Total Visits", value: totalVisits.toLocaleString(), icon: Eye, color: "bg-purple-500", suffix: "" },
            { label: "Total Opt-ins", value: totalOptIns.toLocaleString(), icon: Users, color: "bg-green-500", suffix: "" },
            { label: "Total Conversions", value: totalConversions.toLocaleString(), icon: MousePointer, color: "bg-[#00b4d8]", suffix: "" },
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
              </div>
            );
          })}
        </div>

        {/* Toolbar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-base font-semibold text-gray-900">All Funnels</h2>
            <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full font-medium">{funnels.length}</span>
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#00b4d8] hover:bg-[#0096b7] text-white text-sm font-medium rounded-lg transition-colors">
            <Plus className="w-4 h-4" />
            Create Funnel
          </button>
        </div>

        {/* Funnels Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {funnels.map((funnel) => (
            <div key={funnel.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow group">
              <FunnelPreview name={funnel.name} status={funnel.status} />

              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 leading-tight">{funnel.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={cn("text-[10px] px-2 py-0.5 rounded-full font-medium", statusColor(funnel.status))}>
                        {funnel.status}
                      </span>
                      <span className="text-[10px] text-gray-400">{funnel.pages} pages</span>
                    </div>
                  </div>
                  <button className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded-lg text-gray-400 transition-opacity">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[
                    { label: "Visits", value: funnel.visits.toLocaleString(), icon: Eye },
                    { label: "Opt-ins", value: funnel.optIns.toLocaleString(), icon: Users },
                    { label: "Conv. Rate", value: funnel.convRate > 0 ? funnel.convRate + "%" : "—", icon: BarChart2 },
                  ].map((stat) => {
                    const Icon = stat.icon;
                    return (
                      <div key={stat.label} className="text-center">
                        <p className="text-base font-bold text-gray-900">{stat.value}</p>
                        <p className="text-[10px] text-gray-400 flex items-center justify-center gap-0.5">
                          <Icon className="w-2.5 h-2.5" /> {stat.label}
                        </p>
                      </div>
                    );
                  })}
                </div>

                {funnel.convRate > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-[10px] text-gray-400 mb-1">
                      <span>Conversion rate</span>
                      <span>{funnel.convRate}%</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5">
                      <div
                        className="h-1.5 bg-[#00b4d8] rounded-full"
                        style={{ width: `${Math.min(funnel.convRate * 4, 100)}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                  <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium">
                    <Edit className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg transition-colors font-medium">
                    <BarChart2 className="w-3.5 h-3.5" /> Stats
                  </button>
                  <button className={cn(
                    "flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs rounded-lg transition-colors font-medium",
                    funnel.status === "Active" ? "text-yellow-600 hover:bg-yellow-50" : "text-green-600 hover:bg-green-50"
                  )}>
                    {funnel.status === "Active"
                      ? <><Pause className="w-3.5 h-3.5" /> Pause</>
                      : <><Play className="w-3.5 h-3.5" /> Activate</>
                    }
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
