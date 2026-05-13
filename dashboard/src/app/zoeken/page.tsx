'use client'

import { useState } from 'react'
import { Search, MapPin, Tag, Plus, ExternalLink, Globe, Phone, Star, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { ScrapedBusiness, WebsiteAnalysis } from '@/types'
import { BUSINESS_CATEGORIES, BELGIAN_CITIES, getScoreBg } from '@/lib/utils'

interface BusinessWithAnalysis extends ScrapedBusiness {
  analysis?: WebsiteAnalysis
  analyzing?: boolean
  saved?: boolean
}

export default function ZoekenPage() {
  const [city, setCity] = useState('')
  const [category, setCategory] = useState('')
  const [maxResults, setMaxResults] = useState(10)
  const [loading, setLoading] = useState(false)
  const [businesses, setBusinesses] = useState<BusinessWithAnalysis[]>([])
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState('')
  const [savingIds, setSavingIds] = useState<Set<number>>(new Set())

  async function handleSearch() {
    if (!city.trim() || !category.trim()) {
      setError('Vul stad en categorie in')
      return
    }
    setError('')
    setLoading(true)
    setSearched(true)

    try {
      const res = await fetch('/api/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city, category, max_results: maxResults }),
      })
      const data = await res.json()
      setBusinesses((data.businesses || []).map((b: ScrapedBusiness) => ({ ...b })))

      // Auto-analyze each business website
      analyzeAll(data.businesses || [])
    } catch {
      setError('Zoeken mislukt. Probeer opnieuw.')
    } finally {
      setLoading(false)
    }
  }

  async function analyzeAll(bizList: ScrapedBusiness[]) {
    setBusinesses(bizList.map(b => ({ ...b, analyzing: true })))

    const analyzed = await Promise.all(
      bizList.map(async (biz) => {
        try {
          const res = await fetch('/api/analyze', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: biz.website, business_name: biz.name }),
          })
          const analysis = await res.json()
          return { ...biz, analysis, analyzing: false }
        } catch {
          return { ...biz, analyzing: false }
        }
      })
    )

    setBusinesses(analyzed)
  }

  async function saveLead(biz: BusinessWithAnalysis, index: number) {
    setSavingIds(prev => new Set(prev).add(index))

    try {
      await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          business_name: biz.name,
          phone: biz.phone,
          website: biz.website,
          category: biz.category,
          city: city,
          address: biz.address,
          google_rating: biz.rating,
          review_count: biz.reviews,
          website_score: biz.analysis?.score ?? null,
          issues: biz.analysis?.issues ?? [],
        }),
      })

      setBusinesses(prev =>
        prev.map((b, i) => i === index ? { ...b, saved: true } : b)
      )
    } catch {
      alert('Opslaan mislukt')
    } finally {
      setSavingIds(prev => { const s = new Set(prev); s.delete(index); return s })
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Bedrijven Zoeken</h1>
        <p className="text-slate-500 mt-1">Zoek bedrijven met slechte websites — automatisch geanalyseerd</p>
      </div>

      {/* Search form */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              <MapPin size={14} className="inline mr-1" />
              Stad
            </label>
            <input
              type="text"
              value={city}
              onChange={e => setCity(e.target.value)}
              placeholder="bijv. Antwerpen"
              list="cities"
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
            />
            <datalist id="cities">
              {BELGIAN_CITIES.map(c => <option key={c} value={c} />)}
            </datalist>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              <Tag size={14} className="inline mr-1" />
              Categorie / Sector
            </label>
            <input
              type="text"
              value={category}
              onChange={e => setCategory(e.target.value)}
              placeholder="bijv. restaurant"
              list="categories"
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
            />
            <datalist id="categories">
              {BUSINESS_CATEGORIES.map(c => <option key={c} value={c} />)}
            </datalist>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Max. resultaten
            </label>
            <select
              value={maxResults}
              onChange={e => setMaxResults(Number(e.target.value))}
              className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
            >
              {[5, 10, 20, 30].map(n => (
                <option key={n} value={n}>{n} bedrijven</option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <p className="text-red-600 text-sm mb-3 flex items-center gap-1">
            <AlertTriangle size={14} />
            {error}
          </p>
        )}

        <button
          onClick={handleSearch}
          disabled={loading}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-6 py-2.5 rounded-lg text-sm font-medium"
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
          {loading ? 'Zoeken...' : 'Zoek Bedrijven'}
        </button>
      </div>

      {/* Results */}
      {searched && businesses.length === 0 && !loading && (
        <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-slate-100">
          <Search size={40} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500">Geen bedrijven gevonden. Probeer een andere stad of categorie.</p>
        </div>
      )}

      {businesses.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold text-slate-700">
              {businesses.length} bedrijven gevonden
            </h2>
            <span className="text-xs text-slate-400">Automatische website analyse loopt...</span>
          </div>

          <div className="space-y-3">
            {businesses.map((biz, i) => (
              <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-800 truncate">{biz.name}</h3>
                      {biz.rating && (
                        <span className="flex items-center gap-0.5 text-xs text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                          <Star size={11} />
                          {biz.rating} ({biz.reviews})
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-3 text-xs text-slate-500 mb-3">
                      {biz.address && (
                        <span className="flex items-center gap-1">
                          <MapPin size={11} />
                          {biz.address.split(',').slice(0, 2).join(',')}
                        </span>
                      )}
                      {biz.phone && (
                        <span className="flex items-center gap-1">
                          <Phone size={11} />
                          {biz.phone}
                        </span>
                      )}
                      {biz.website ? (
                        <a
                          href={biz.website.startsWith('http') ? biz.website : `https://${biz.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:underline"
                        >
                          <Globe size={11} />
                          {biz.website.replace(/^https?:\/\//, '').split('/')[0]}
                          <ExternalLink size={10} />
                        </a>
                      ) : (
                        <span className="flex items-center gap-1 text-red-500 font-medium">
                          <Globe size={11} />
                          Geen website!
                        </span>
                      )}
                    </div>

                    {/* Analysis results */}
                    {biz.analyzing && (
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        <Loader2 size={12} className="animate-spin" />
                        Website wordt geanalyseerd...
                      </div>
                    )}

                    {biz.analysis && !biz.analyzing && (
                      <div>
                        <div className="flex flex-wrap gap-1.5 mb-2">
                          {biz.analysis.issues.slice(0, 4).map((issue, j) => (
                            <span
                              key={j}
                              className={`text-xs px-2 py-0.5 rounded-full ${
                                issue.severity === 'critical' ? 'bg-red-100 text-red-700' :
                                issue.severity === 'high' ? 'bg-orange-100 text-orange-700' :
                                'bg-yellow-100 text-yellow-700'
                              }`}
                            >
                              {issue.severity === 'critical' ? '🔴' : issue.severity === 'high' ? '🟠' : '🟡'}
                              {' '}{issue.description}
                            </span>
                          ))}
                          {biz.analysis.issues.length > 4 && (
                            <span className="text-xs text-slate-400">+{biz.analysis.issues.length - 4} meer</span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Score + Save button */}
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    {biz.analysis && !biz.analyzing && (
                      <div className={`text-center px-3 py-1.5 rounded-lg ${getScoreBg(biz.analysis.score)}`}>
                        <div className="text-2xl font-black">{biz.analysis.score}</div>
                        <div className="text-xs font-medium">/ 100</div>
                      </div>
                    )}

                    {biz.saved ? (
                      <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                        <CheckCircle2 size={14} />
                        Opgeslagen
                      </span>
                    ) : (
                      <button
                        onClick={() => saveLead(biz, i)}
                        disabled={savingIds.has(i) || biz.analyzing}
                        className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs px-3 py-1.5 rounded-lg font-medium"
                      >
                        {savingIds.has(i) ? <Loader2 size={12} className="animate-spin" /> : <Plus size={12} />}
                        Voeg toe als lead
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
