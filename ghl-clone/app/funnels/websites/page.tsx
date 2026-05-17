import Header from "@/components/header";
import { Globe, Plus } from "lucide-react";

export default function WebsitesPage() {
  return (
    <div className="flex flex-col flex-1">
      <Header title="Websites" />
      <main className="p-6">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-12 text-center">
          <Globe className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-gray-900">Website Builder</h2>
          <p className="text-gray-400 text-sm mt-1 mb-5">Maak professionele websites zonder code</p>
          <button className="inline-flex items-center gap-2 bg-[#00b4d8] text-white text-sm font-medium px-5 py-2.5 rounded-lg hover:bg-[#0096b7]">
            <Plus className="w-4 h-4" /> Nieuwe Website
          </button>
        </div>
      </main>
    </div>
  );
}
