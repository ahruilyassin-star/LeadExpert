import Header from "@/components/header";
import { Share2, AtSign, MessageCircle, X, Plus, Calendar } from "lucide-react";

const posts = [
  { id: "1", platform: "Instagram", content: "✨ Ontdek onze nieuwe Arabische alfabet magneten! Perfect voor kleine leerlingen.", date: "2026-05-20 10:00", status: "Scheduled", image: true },
  { id: "2", platform: "Facebook", content: "🎁 Eid Mubarak! Bekijk onze speciale Eid collectie met 20% korting.", date: "2026-05-18 09:00", status: "Scheduled", image: true },
  { id: "3", platform: "Instagram", content: "📚 Tip: gebruik onze bouwblokken om motoriek te ontwikkelen!", date: "2026-05-15", status: "Published", image: false },
  { id: "4", platform: "Facebook", content: "Nieuwe collectie binnenkort beschikbaar. Schrijf je in voor early access!", date: "2026-05-12", status: "Published", image: true },
  { id: "5", platform: "Instagram", content: "Duurzaam speelgoed gemaakt van veilige materialen 🌿", date: "2026-05-10", status: "Published", image: true },
];

const PLATFORM_COLORS: Record<string, string> = {
  Instagram: "bg-pink-50 text-pink-700 border-pink-200",
  Facebook: "bg-indigo-50 text-indigo-700 border-indigo-200",
  Twitter: "bg-sky-50 text-sky-700 border-sky-200",
};

export default function SocialPlannerPage() {
  return (
    <div className="flex flex-col flex-1">
      <Header title="Social Planner" />
      <main className="p-6 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          {[
            { platform: "Instagram", icon: AtSign, followers: "2.4K", posts: 3 },
            { platform: "Facebook", icon: MessageCircle, followers: "1.8K", posts: 2 },
            { platform: "Twitter/X", icon: X, followers: "890", posts: 0 },
          ].map(({ platform, icon: Icon, followers, posts: p }) => (
            <div key={platform} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-2">
                <Icon className="w-5 h-5 text-gray-600" />
                <span className="font-semibold text-gray-900">{platform}</span>
              </div>
              <p className="text-2xl font-bold text-gray-900">{followers}</p>
              <p className="text-xs text-gray-400">volgers • {p} posts gepland</p>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Geplande Posts</h2>
            <button className="flex items-center gap-1.5 bg-[#00b4d8] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#0096b7]">
              <Plus className="w-4 h-4" /> Post Plannen
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {posts.map(post => (
              <div key={post.id} className="p-4 flex items-start gap-4 hover:bg-gray-50 transition-colors">
                <div className={`w-8 h-8 rounded-lg border flex items-center justify-center flex-shrink-0 ${PLATFORM_COLORS[post.platform] || "bg-gray-50 text-gray-600 border-gray-200"}`}>
                  {post.platform === "Instagram" ? <AtSign className="w-4 h-4" /> : <MessageCircle className="w-4 h-4" />}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-800">{post.content}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Calendar className="w-3 h-3 text-gray-400" />
                    <span className="text-xs text-gray-400">{post.date}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      post.status === "Published" ? "bg-green-50 text-green-700" : "bg-yellow-50 text-yellow-700"
                    }`}>{post.status}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
