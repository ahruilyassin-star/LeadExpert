"use client";

import { useState } from "react";
import Header from "@/components/header";
import { deals, PIPELINE_STAGES } from "@/lib/mock-data";
import { cn, getInitials, getAvatarColor, formatCurrency } from "@/lib/utils";
import { ChevronDown, Plus, MoreHorizontal, Clock } from "lucide-react";

const stageColors: Record<string, { bg: string; border: string; text: string; header: string }> = {
  "New Lead":      { bg: "bg-blue-50",   border: "border-blue-200",   text: "text-blue-700",   header: "bg-blue-500" },
  "Contacted":     { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-700", header: "bg-yellow-500" },
  "Proposal Sent": { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700", header: "bg-orange-500" },
  "Negotiation":   { bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700", header: "bg-purple-500" },
  "Won":           { bg: "bg-green-50",  border: "border-green-200",  text: "text-green-700",  header: "bg-green-500" },
  "Lost":          { bg: "bg-red-50",    border: "border-red-200",    text: "text-red-700",    header: "bg-red-500" },
};

const pipelines = ["Sales Pipeline", "Onboarding Pipeline", "Partner Pipeline"];

export default function PipelinesPage() {
  const [selectedPipeline, setSelectedPipeline] = useState("Sales Pipeline");
  const [showPipelineMenu, setShowPipelineMenu] = useState(false);

  const dealsByStage = PIPELINE_STAGES.reduce((acc, stage) => {
    acc[stage] = deals.filter(d => d.stage === stage);
    return acc;
  }, {} as Record<string, typeof deals>);

  const totalPipelineValue = deals
    .filter(d => !["Won", "Lost"].includes(d.stage))
    .reduce((s, d) => s + d.value, 0);

  const wonValue = deals.filter(d => d.stage === "Won").reduce((s, d) => s + d.value, 0);

  return (
    <div className="flex flex-col flex-1">
      <Header title="Pipelines" />
      <main className="p-6 space-y-5 overflow-hidden">
        {/* Top Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <button
                onClick={() => setShowPipelineMenu(!showPipelineMenu)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm"
              >
                {selectedPipeline}
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
              {showPipelineMenu && (
                <div className="absolute top-full mt-1 left-0 bg-white border border-gray-200 rounded-xl shadow-lg z-10 min-w-[200px] py-1">
                  {pipelines.map(p => (
                    <button
                      key={p}
                      onClick={() => { setSelectedPipeline(p); setShowPipelineMenu(false); }}
                      className={cn("w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors",
                        p === selectedPipeline ? "text-[#00b4d8] font-medium" : "text-gray-700"
                      )}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <p className="text-xs text-gray-500">Pipeline Value</p>
                <p className="text-sm font-bold text-gray-900">{formatCurrency(totalPipelineValue)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Won</p>
                <p className="text-sm font-bold text-green-600">{formatCurrency(wonValue)}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Total Deals</p>
                <p className="text-sm font-bold text-gray-900">{deals.length}</p>
              </div>
            </div>
            <button className="flex items-center gap-2 px-3 py-2 bg-[#00b4d8] hover:bg-[#0096b7] text-white text-sm font-medium rounded-lg transition-colors">
              <Plus className="w-4 h-4" />
              Add Deal
            </button>
          </div>
        </div>

        {/* Kanban Board */}
        <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: "calc(100vh - 220px)" }}>
          {PIPELINE_STAGES.map((stage) => {
            const stageDeals = dealsByStage[stage] || [];
            const stageValue = stageDeals.reduce((s, d) => s + d.value, 0);
            const colors = stageColors[stage];

            return (
              <div key={stage} className="flex-shrink-0 w-64 flex flex-col">
                {/* Column Header */}
                <div className={cn("rounded-t-xl p-3 flex items-center justify-between", colors.header)}>
                  <div>
                    <p className="text-sm font-semibold text-white">{stage}</p>
                    <p className="text-xs text-white/80">{formatCurrency(stageValue)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-white/25 text-white text-xs font-bold px-2 py-0.5 rounded-full">{stageDeals.length}</span>
                    <button className="text-white/70 hover:text-white">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Deal Cards */}
                <div className={cn("flex-1 rounded-b-xl border p-2 space-y-2 bg-gray-50/80", colors.border)} style={{ minHeight: "400px" }}>
                  {stageDeals.map((deal) => (
                    <div key={deal.id} className="bg-white rounded-xl p-3.5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0",
                            getAvatarColor(deal.contact)
                          )}>
                            {deal.avatar}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{deal.contact}</p>
                            <p className="text-[10px] text-gray-400 truncate">{deal.email}</p>
                          </div>
                        </div>
                        <button className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 transition-opacity">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-base font-bold text-gray-900">{formatCurrency(deal.value)}</span>
                        <span className={cn("flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full", colors.bg, colors.text)}>
                          <Clock className="w-2.5 h-2.5" />
                          {deal.days}d
                        </span>
                      </div>
                    </div>
                  ))}

                  <button className="w-full text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1 py-2 justify-center hover:bg-gray-100 rounded-lg transition-colors">
                    <Plus className="w-3 h-3" /> Add Deal
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
