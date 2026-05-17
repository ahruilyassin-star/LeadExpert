"use client";

import { useState } from "react";
import Header from "@/components/header";
import { workflows } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { Zap, Plus, Search, MoreHorizontal, Play, Pause, Users, Clock, ChevronRight } from "lucide-react";

const triggerColor = (trigger: string) => {
  if (trigger.includes("aangemaakt") || trigger.includes("Created")) return "bg-blue-100 text-blue-700";
  if (trigger.includes("verlaten") || trigger.includes("Cart")) return "bg-orange-100 text-orange-700";
  if (trigger.includes("geleverd") || trigger.includes("Purchase")) return "bg-green-100 text-green-700";
  if (trigger.includes("tag") || trigger.includes("Tag")) return "bg-purple-100 text-purple-700";
  if (trigger.includes("activiteit") || trigger.includes("inactief")) return "bg-red-100 text-red-700";
  if (trigger.includes("Verjaardag") || trigger.includes("Birthday")) return "bg-pink-100 text-pink-700";
  if (trigger.includes("Afspraak") || trigger.includes("Appointment")) return "bg-teal-100 text-teal-700";
  return "bg-gray-100 text-gray-700";
};

// Simple static workflow diagram
function WorkflowDiagram({ active }: { active: boolean }) {
  const nodes = [
    { label: "Trigger", color: active ? "#00b4d8" : "#94a3b8" },
    { label: "Wait", color: active ? "#8b5cf6" : "#94a3b8" },
    { label: "Send Email", color: active ? "#10b981" : "#94a3b8" },
    { label: "Check Condition", color: active ? "#f59e0b" : "#94a3b8" },
    { label: "Send SMS", color: active ? "#10b981" : "#94a3b8" },
  ];

  return (
    <div className="flex items-center gap-1 mt-3">
      {nodes.map((node, i) => (
        <div key={i} className="flex items-center gap-1">
          <div
            className="px-2.5 py-1 rounded-full text-white text-[10px] font-medium whitespace-nowrap"
            style={{ backgroundColor: node.color }}
          >
            {node.label}
          </div>
          {i < nodes.length - 1 && (
            <ChevronRight className="w-3 h-3 text-gray-300 flex-shrink-0" />
          )}
        </div>
      ))}
    </div>
  );
}

export default function AutomationPage() {
  const [search, setSearch] = useState("");
  const [workflowStates, setWorkflowStates] = useState<Record<string, boolean>>(
    Object.fromEntries(workflows.map(w => [w.id, w.active]))
  );

  const filtered = workflows.filter((w) =>
    w.name.toLowerCase().includes(search.toLowerCase()) ||
    w.trigger.toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = Object.values(workflowStates).filter(Boolean).length;
  const totalEnrolled = workflows.reduce((s, w) => s + w.enrolled, 0);

  const toggle = (id: string) => {
    setWorkflowStates(prev => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="flex flex-col flex-1">
      <Header title="Automation" />
      <main className="p-6 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: "Total Workflows", value: workflows.length, color: "bg-blue-500" },
            { label: "Active", value: activeCount, color: "bg-green-500" },
            { label: "Inactive", value: workflows.length - activeCount, color: "bg-gray-400" },
            { label: "Contacts Enrolled", value: totalEnrolled, color: "bg-purple-500" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3">
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", stat.color)}>
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search workflows..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00b4d8]/30 focus:border-[#00b4d8] bg-white"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#00b4d8] hover:bg-[#0096b7] text-white text-sm font-medium rounded-lg ml-auto transition-colors">
            <Plus className="w-4 h-4" />
            Create Workflow
          </button>
        </div>

        {/* Workflow List */}
        <div className="space-y-3">
          {filtered.map((workflow) => {
            const isActive = workflowStates[workflow.id];
            return (
              <div key={workflow.id} className={cn(
                "bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow p-5",
                isActive ? "border-gray-200" : "border-gray-100 opacity-75"
              )}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className={cn(
                      "w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0",
                      isActive ? "bg-[#00b4d8]/10" : "bg-gray-100"
                    )}>
                      <Zap className={cn("w-5 h-5", isActive ? "text-[#00b4d8]" : "text-gray-400")} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-gray-900">{workflow.name}</h3>
                        <span className={cn(
                          "text-[10px] font-medium px-2 py-0.5 rounded-full",
                          isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                        )}>
                          {isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mb-2">{workflow.description || "Automated workflow"}</p>

                      <div className="flex items-center gap-4">
                        <span className={cn("flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full", triggerColor(workflow.trigger))}>
                          <Zap className="w-2.5 h-2.5" />
                          {workflow.trigger}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Zap className="w-3 h-3 text-gray-400" />
                          {workflow.actions} actions
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Users className="w-3 h-3 text-gray-400" />
                          {workflow.enrolled} enrolled
                        </span>
                        <span className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="w-3 h-3 text-gray-400" />
                          Last run: {workflow.lastRun}
                        </span>
                      </div>

                      <WorkflowDiagram active={isActive} />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => toggle(workflow.id)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                        isActive
                          ? "bg-green-50 text-green-700 hover:bg-green-100"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      )}
                    >
                      {isActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                      {isActive ? "Active" : "Activate"}
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-gray-600 transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>
    </div>
  );
}
