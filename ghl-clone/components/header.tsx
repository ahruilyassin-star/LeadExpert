"use client";

import { Bell, Search, ChevronDown, Plus } from "lucide-react";

export default function Header({ title }: { title: string }) {
  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center px-6 gap-4 sticky top-0 z-20">
      <h1 className="text-gray-900 font-semibold text-lg flex-shrink-0">{title}</h1>

      <div className="flex-1 max-w-md mx-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Zoeken..."
            className="w-full pl-9 pr-4 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#00b4d8]/30 focus:border-[#00b4d8]"
          />
        </div>
      </div>

      <div className="ml-auto flex items-center gap-3">
        {/* Sub-account selector */}
        <button className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 border border-gray-200 rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors">
          <div className="w-5 h-5 rounded bg-[#00b4d8] flex items-center justify-center text-white text-[9px] font-bold">LO</div>
          <span className="hidden sm:block">Little Oummah</span>
          <ChevronDown className="w-3 h-3" />
        </button>

        {/* Notification */}
        <button className="relative w-9 h-9 flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors">
          <Bell className="w-4 h-4 text-gray-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        {/* New button */}
        <button className="flex items-center gap-1.5 bg-[#00b4d8] hover:bg-[#0096b7] text-white text-sm font-medium px-3 py-1.5 rounded-lg transition-colors">
          <Plus className="w-4 h-4" />
          <span className="hidden sm:block">Nieuw</span>
        </button>

        {/* Avatar */}
        <button className="flex items-center gap-2 hover:bg-gray-100 rounded-lg px-2 py-1.5 transition-colors">
          <div className="w-7 h-7 rounded-full bg-[#1a1d24] flex items-center justify-center text-white text-xs font-bold">LO</div>
          <ChevronDown className="w-3 h-3 text-gray-400" />
        </button>
      </div>
    </header>
  );
}
