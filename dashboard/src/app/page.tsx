'use client'

import { useEffect, useState } from 'react'
import { Users, MessageSquare, TrendingUp, Star, Search, ArrowRight, CheckCircle } from 'lucide-react'
import Link from 'next/link'

interface Stats {
  total_leads: number
  new_leads: number
  contacted: number
  responded: number
  messages_sent: number
  conversion_rate: number
  avg_website_score: number
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
  sub,
}: {
  label: string
  value: string | number
  icon: React.ElementType
  color: string
  sub?: string
}) {
  return (
    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm text-slate-500 font-medium">{label}</span>
        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={18} className="text-white" />
        </div>
      </div>
      <p className="text-3xl font-bold text-slate-800">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/stats')
      .then(r => r.json())
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false))
  }, [])

  const s = stats || {
    total_leads: 0, new_leads: 0, contacted: 0,
    responded: 0, messages_sent: 0, conversion_rate: 0, avg_website_score: 0,
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800">Dashboard Overzicht</h1>
        <p className="text-slate-500 mt-1">Welkom bij uw automatisch lead generatie systeem</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          label="Totaal Leads"
          value={loading ? '...' : s.total_leads}
          icon={Users}
          color="bg-blue-500"
          sub={`${s.new_leads} nieuw`}
        />
        <StatCard
          label="Gecontacteerd"
          value={loading ? '...' : s.contacted}
          icon={MessageSquare}
          color="bg-green-500"
          sub={`${s.messages_sent} berichten`}
        />
        <StatCard
          label="Gereageerd"
          value={loading ? '...' : s.responded}
          icon={CheckCircle}
          color="bg-purple-500"
          sub="potentiële klanten"
        />
        <StatCard
          label="Conversiegraad"
          value={loading ? '...' : `${s.conversion_rate}%`}
          icon={TrendingUp}
          color="bg-orange-500"
          sub="leads → klanten"
        />
      </div>

      {/* Two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* How it works */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Star size={18} className="text-yellow-500" />
            Hoe het systeem werkt
          </h2>
          <div className="space-y-4">
            {[
              { step: '1', title: 'Zoek bedrijven', desc: 'Zoek op categorie en stad — het systeem vindt bedrijven met slechte websites', color: 'bg-blue-500' },
              { step: '2', title: 'Analyseer websites', desc: 'Automatische analyse: snelheid, SEO, SSL, mobiel, contactformulier', color: 'bg-orange-500' },
              { step: '3', title: 'Sla leads op', desc: 'Voeg veelbelovende leads toe aan uw database met alle bevindingen', color: 'bg-purple-500' },
              { step: '4', title: 'Stuur WhatsApp', desc: 'Personaliseer en verstuur het bericht via uw eigen WhatsApp nummer', color: 'bg-green-500' },
            ].map(({ step, title, desc, color }) => (
              <div key={step} className="flex gap-3">
                <div className={`w-7 h-7 rounded-full ${color} text-white text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5`}>
                  {step}
                </div>
                <div>
                  <p className="font-semibold text-sm text-slate-700">{title}</p>
                  <p className="text-xs text-slate-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick actions */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
          <h2 className="font-bold text-slate-800 mb-4">Snelle Acties</h2>
          <div className="space-y-3">
            <Link href="/zoeken" className="flex items-center justify-between p-4 bg-blue-50 hover:bg-blue-100 rounded-lg group">
              <div className="flex items-center gap-3">
                <Search size={20} className="text-blue-600" />
                <div>
                  <p className="font-semibold text-sm text-blue-800">Nieuwe bedrijven zoeken</p>
                  <p className="text-xs text-blue-600">Zoek op stad & sector</p>
                </div>
              </div>
              <ArrowRight size={16} className="text-blue-500 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link href="/leads" className="flex items-center justify-between p-4 bg-purple-50 hover:bg-purple-100 rounded-lg group">
              <div className="flex items-center gap-3">
                <Users size={20} className="text-purple-600" />
                <div>
                  <p className="font-semibold text-sm text-purple-800">Bekijk alle leads</p>
                  <p className="text-xs text-purple-600">{s.new_leads} nieuwe leads wachten</p>
                </div>
              </div>
              <ArrowRight size={16} className="text-purple-500 group-hover:translate-x-1 transition-transform" />
            </Link>

            <Link href="/whatsapp" className="flex items-center justify-between p-4 bg-green-50 hover:bg-green-100 rounded-lg group">
              <div className="flex items-center gap-3">
                <MessageSquare size={20} className="text-green-600" />
                <div>
                  <p className="font-semibold text-sm text-green-800">WhatsApp instellen</p>
                  <p className="text-xs text-green-600">Koppel uw WhatsApp nummer</p>
                </div>
              </div>
              <ArrowRight size={16} className="text-green-500 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>

      {/* Average score */}
      {!loading && s.total_leads > 0 && (
        <div className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-lg">Gemiddelde Website Score van Leads</h3>
              <p className="text-slate-300 text-sm mt-1">Hoe lager de score, hoe meer kansen voor uw diensten</p>
            </div>
            <div className="text-center">
              <div className="text-5xl font-black text-orange-400">{s.avg_website_score}</div>
              <div className="text-slate-400 text-xs">/ 100</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
