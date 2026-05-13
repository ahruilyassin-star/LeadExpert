'use client'

import { useEffect, useState } from 'react'
import {
  Users, Globe, Phone, MapPin, ChevronDown, MessageSquare,
  ExternalLink, Search, Filter, Loader2, AlertCircle, Star,
} from 'lucide-react'
import Link from 'next/link'
import { Lead } from '@/types'
import { getScoreBg, getStatusBg, getStatusLabel, formatDate } from '@/lib/utils'

const STATUS_OPTIONS = ['all', 'new', 'contacted', 'responded', 'closed', 'not_interested']

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  useEffect(() => {
    loadLeads()
  }, [filterStatus])

  async function loadLeads() {
    setLoading(true)
    try {
      const res = await fetch(`/api/leads${filterStatus !== 'all' ? `?status=${filterStatus}` : ''}`)
      const data = await res.json()
      setLeads(data.leads || [])
    } catch {
      setLeads([])
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(id: string, status: string) {
    setUpdatingId(id)
    try {
      await fetch('/api/leads', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      setLeads(prev => prev.map(l => l.id === id ? { ...l, status: status as Lead['status'] } : l))
    } catch {
      alert('Update mislukt')
    } finally {
      setUpdatingId(null)
    }
  }

  const filtered = leads.filter(l =>
    !search || l.business_name.toLowerCase().includes(search.toLowerCase()) || l.city?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Leads Beheer</h1>
        <p className="text-slate-500 mt-1">Alle gevonden bedrijven en hun website analyse</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 mb-5 flex flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-[200px]">
          <Search size={16} className="text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Zoek op naam of stad..."
            className="flex-1 text-sm outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={14} className="text-slate-400" />
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-blue-400"
          >
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>{s === 'all' ? 'Alle statussen' : getStatusLabel(s)}</option>
            ))}
          </select>
        </div>
        <span className="text-sm text-slate-500 self-center">
          {filtered.length} lead{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {loading && (
        <div className="text-center py-20">
          <Loader2 className="animate-spin text-blue-500 mx-auto mb-3" size={32} />
          <p className="text-slate-500">Leads ophalen...</p>
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <div className="bg-white rounded-xl p-16 text-center shadow-sm border border-slate-100">
          <Users size={48} className="text-slate-200 mx-auto mb-4" />
          <h3 className="font-semibold text-slate-700 mb-2">Nog geen leads</h3>
          <p className="text-slate-400 text-sm mb-4">
            Ga naar <strong>Bedrijven Zoeken</strong> om leads te genereren
          </p>
          <Link href="/zoeken" className="inline-flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
            <Search size={14} />
            Zoek bedrijven
          </Link>
        </div>
      )}

      <div className="space-y-2">
        {filtered.map(lead => (
          <div key={lead.id} className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Lead header */}
            <div
              className="p-4 cursor-pointer hover:bg-slate-50 flex items-center gap-4"
              onClick={() => setExpanded(expanded === lead.id ? null : lead.id)}
            >
              {/* Score */}
              <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center flex-shrink-0 ${
                lead.website_score !== null ? getScoreBg(lead.website_score) : 'bg-slate-100 text-slate-500'
              }`}>
                <span className="text-xl font-black">{lead.website_score ?? '?'}</span>
                <span className="text-xs">/100</span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-slate-800 truncate">{lead.business_name}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getStatusBg(lead.status)}`}>
                    {getStatusLabel(lead.status)}
                  </span>
                </div>
                <div className="flex flex-wrap gap-3 text-xs text-slate-500">
                  {lead.city && <span className="flex items-center gap-1"><MapPin size={10} />{lead.city}</span>}
                  {lead.category && <span className="capitalize">{lead.category}</span>}
                  {lead.phone && <span className="flex items-center gap-1"><Phone size={10} />{lead.phone}</span>}
                  {lead.google_rating && (
                    <span className="flex items-center gap-1 text-amber-600">
                      <Star size={10} />{lead.google_rating}
                    </span>
                  )}
                  <span className="text-slate-300">{formatDate(lead.created_at)}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 flex-shrink-0" onClick={e => e.stopPropagation()}>
                {lead.phone && (
                  <Link
                    href={`/whatsapp?lead_id=${lead.id}&phone=${lead.phone}&name=${encodeURIComponent(lead.business_name)}`}
                    className="flex items-center gap-1 bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1.5 rounded-lg font-medium"
                  >
                    <MessageSquare size={12} />
                    WhatsApp
                  </Link>
                )}
                <ChevronDown
                  size={16}
                  className={`text-slate-400 transition-transform ${expanded === lead.id ? 'rotate-180' : ''}`}
                />
              </div>
            </div>

            {/* Expanded detail */}
            {expanded === lead.id && (
              <div className="border-t border-slate-100 p-4 bg-slate-50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Issues */}
                  <div>
                    <h4 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-1">
                      <AlertCircle size={14} className="text-orange-500" />
                      Website Problemen ({lead.issues?.length || 0})
                    </h4>
                    {lead.issues && lead.issues.length > 0 ? (
                      <div className="space-y-2">
                        {lead.issues.map((issue, i) => (
                          <div key={i} className={`text-xs p-2.5 rounded-lg ${
                            issue.severity === 'critical' ? 'bg-red-50 border border-red-100' :
                            issue.severity === 'high' ? 'bg-orange-50 border border-orange-100' :
                            'bg-yellow-50 border border-yellow-100'
                          }`}>
                            <p className="font-medium text-slate-700">{issue.description}</p>
                            <p className="text-slate-500 mt-0.5">💸 {issue.revenue_impact}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-slate-400">Geen problemen gedetecteerd</p>
                    )}
                  </div>

                  {/* Contact & Status */}
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-semibold text-slate-700 mb-2">Contactinfo</h4>
                      <div className="space-y-1 text-xs">
                        {lead.website && (
                          <a href={lead.website} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-600 hover:underline">
                            <Globe size={11} />{lead.website}
                            <ExternalLink size={10} />
                          </a>
                        )}
                        {!lead.website && <p className="text-red-500 flex items-center gap-1"><Globe size={11} />Geen website</p>}
                        {lead.phone && <p className="flex items-center gap-1 text-slate-600"><Phone size={11} />{lead.phone}</p>}
                        {lead.address && <p className="flex items-center gap-1 text-slate-600"><MapPin size={11} />{lead.address}</p>}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-slate-700 mb-2">Status wijzigen</h4>
                      <select
                        value={lead.status}
                        onChange={e => updateStatus(lead.id, e.target.value)}
                        disabled={updatingId === lead.id}
                        className="w-full text-xs border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none"
                      >
                        {STATUS_OPTIONS.filter(s => s !== 'all').map(s => (
                          <option key={s} value={s}>{getStatusLabel(s)}</option>
                        ))}
                      </select>
                    </div>

                    {lead.phone && (
                      <Link
                        href={`/whatsapp?lead_id=${lead.id}&phone=${lead.phone}&name=${encodeURIComponent(lead.business_name)}&website=${encodeURIComponent(lead.website || '')}`}
                        className="flex items-center justify-center gap-2 w-full bg-green-600 hover:bg-green-700 text-white text-xs py-2 rounded-lg font-medium"
                      >
                        <MessageSquare size={12} />
                        Stuur WhatsApp bericht
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
