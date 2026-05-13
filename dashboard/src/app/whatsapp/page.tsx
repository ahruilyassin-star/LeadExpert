'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  MessageSquare, CheckCircle, XCircle, Loader2, Send,
  Copy, ExternalLink, Phone, AlertTriangle, RefreshCw, Info,
} from 'lucide-react'
import { DEFAULT_TEMPLATE, DEFAULT_SIGNATURE, buildWhatsAppMessage } from '@/lib/utils'

interface WAStatus {
  connected: boolean
  status: string
  message: string
  qr?: string
  phone?: string
}

function WhatsAppPageContent() {
  const searchParams = useSearchParams()
  const leadId = searchParams.get('lead_id')
  const phone = searchParams.get('phone') || ''
  const name = searchParams.get('name') || ''
  const website = searchParams.get('website') || ''

  const [waStatus, setWaStatus] = useState<WAStatus | null>(null)
  const [statusLoading, setStatusLoading] = useState(true)
  const [template, setTemplate] = useState(DEFAULT_TEMPLATE)
  const [signature, setSignature] = useState(DEFAULT_SIGNATURE)
  const [customPhone, setCustomPhone] = useState(phone)
  const [sending, setSending] = useState(false)
  const [sendResult, setSendResult] = useState<{success: boolean; message: string; wa_link?: string} | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    checkStatus()
    // Load saved template from localStorage
    const saved = localStorage.getItem('wa_template')
    const savedSig = localStorage.getItem('wa_signature')
    if (saved) setTemplate(saved)
    if (savedSig) setSignature(savedSig)
  }, [])

  useEffect(() => {
    setCustomPhone(phone)
  }, [phone])

  async function checkStatus() {
    setStatusLoading(true)
    try {
      const res = await fetch('/api/whatsapp/status')
      const data = await res.json()
      setWaStatus(data)
    } catch {
      setWaStatus({ connected: false, status: 'error', message: 'Kan status niet ophalen' })
    } finally {
      setStatusLoading(false)
    }
  }

  function saveTemplate() {
    localStorage.setItem('wa_template', template)
    localStorage.setItem('wa_signature', signature)
    alert('Sjabloon opgeslagen!')
  }

  const previewMessage = buildWhatsAppMessage(
    template,
    {
      business_name: name || 'Voorbeeldbedrijf BV',
      website: website || 'www.voorbeeldbedrijf.be',
      issues: [
        { type: 'no_ssl', severity: 'critical', description: 'Geen HTTPS beveiliging', revenue_impact: 'Bezoekers verlaten de site' },
        { type: 'not_mobile', severity: 'critical', description: 'Niet mobielvriendelijk', revenue_impact: '60% van bezoekers haakt af' },
        { type: 'bad_seo', severity: 'high', description: 'Slechte SEO structuur', revenue_impact: 'Onzichtbaar in Google' },
      ],
    },
    signature
  )

  async function handleSend() {
    if (!customPhone) {
      alert('Vul een telefoonnummer in')
      return
    }

    setSending(true)
    setSendResult(null)

    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lead_id: leadId,
          phone: customPhone,
          message: previewMessage,
        }),
      })
      const data = await res.json()
      setSendResult({
        success: data.success,
        message: data.success ? 'Bericht succesvol verzonden!' : (data.message || 'Gebruik de WhatsApp link hieronder'),
        wa_link: data.wa_link,
      })
    } catch {
      setSendResult({ success: false, message: 'Verzenden mislukt', wa_link: undefined })
    } finally {
      setSending(false)
    }
  }

  function copyMessage() {
    navigator.clipboard.writeText(previewMessage)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">WhatsApp Berichten</h1>
        <p className="text-slate-500 mt-1">Stuur gepersonaliseerde berichten naar uw leads</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Status + Send form */}
        <div className="space-y-5">
          {/* WA Status card */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-slate-700 flex items-center gap-2">
                <MessageSquare size={16} className="text-green-600" />
                WhatsApp Status
              </h2>
              <button onClick={checkStatus} className="text-xs text-slate-400 hover:text-slate-600 flex items-center gap-1">
                <RefreshCw size={12} />
                Vernieuwen
              </button>
            </div>

            {statusLoading ? (
              <div className="flex items-center gap-2 text-slate-400 text-sm">
                <Loader2 size={14} className="animate-spin" />
                Status ophalen...
              </div>
            ) : waStatus ? (
              <div>
                <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium mb-2 ${
                  waStatus.connected
                    ? 'bg-green-50 text-green-700'
                    : 'bg-orange-50 text-orange-700'
                }`}>
                  {waStatus.connected
                    ? <CheckCircle size={16} />
                    : <XCircle size={16} />}
                  {waStatus.connected ? `Verbonden${waStatus.phone ? ` — ${waStatus.phone}` : ''}` : 'Niet verbonden'}
                </div>
                <p className="text-xs text-slate-500">{waStatus.message}</p>

                {!waStatus.connected && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs font-semibold text-blue-800 mb-1 flex items-center gap-1">
                      <Info size={12} />
                      WhatsApp Service instellen
                    </p>
                    <p className="text-xs text-blue-700">
                      Start de WhatsApp service lokaal of op een server. Zie de README voor instructies.
                      De service genereert een QR code die u eenmalig scant met uw telefoon.
                    </p>
                  </div>
                )}
              </div>
            ) : null}
          </div>

          {/* Send form */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
            <h2 className="font-semibold text-slate-700 mb-3 flex items-center gap-2">
              <Send size={16} className="text-blue-600" />
              Bericht verzenden
              {name && <span className="text-sm font-normal text-slate-400">naar {name}</span>}
            </h2>

            <div className="mb-3">
              <label className="block text-xs font-medium text-slate-600 mb-1.5 flex items-center gap-1">
                <Phone size={12} />
                Telefoonnummer (met landcode)
              </label>
              <input
                type="tel"
                value={customPhone}
                onChange={e => setCustomPhone(e.target.value)}
                placeholder="+32 472 12 34 56"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50"
              />
              <p className="text-xs text-slate-400 mt-1">Formaat: +32XXXXXXXXX of 0032XXXXXXXXX</p>
            </div>

            {sendResult && (
              <div className={`p-3 rounded-lg mb-3 text-sm ${
                sendResult.success ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'
              }`}>
                <div className="flex items-center gap-2 font-medium mb-1">
                  {sendResult.success ? <CheckCircle size={14} /> : <AlertTriangle size={14} />}
                  {sendResult.message}
                </div>
                {sendResult.wa_link && (
                  <a
                    href={sendResult.wa_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs underline mt-1"
                  >
                    <ExternalLink size={11} />
                    Open in WhatsApp Web
                  </a>
                )}
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={handleSend}
                disabled={sending || !customPhone}
                className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-2.5 rounded-lg text-sm font-medium"
              >
                {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                {sending ? 'Verzenden...' : 'Verstuur via WhatsApp'}
              </button>

              {customPhone && (
                <a
                  href={`https://wa.me/${customPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(previewMessage)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2.5 rounded-lg text-xs font-medium"
                >
                  <ExternalLink size={13} />
                  wa.me
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Right: Template editor + preview */}
        <div className="space-y-5">
          {/* Template editor */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
            <h2 className="font-semibold text-slate-700 mb-3">Berichtsjabloon</h2>
            <p className="text-xs text-slate-400 mb-2">
              Gebruik: <code className="bg-slate-100 px-1 rounded">{'{bedrijfsnaam}'}</code>,
              <code className="bg-slate-100 px-1 rounded">{'{website}'}</code>,
              <code className="bg-slate-100 px-1 rounded">{'{problemen}'}</code>,
              <code className="bg-slate-100 px-1 rounded">{'{verlies}'}</code>,
              <code className="bg-slate-100 px-1 rounded">{'{handtekening}'}</code>
            </p>
            <textarea
              value={template}
              onChange={e => setTemplate(e.target.value)}
              rows={10}
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-blue-400 resize-none"
            />
            <div className="mt-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Handtekening</label>
              <textarea
                value={signature}
                onChange={e => setSignature(e.target.value)}
                rows={4}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-blue-400 resize-none"
              />
            </div>
            <button
              onClick={saveTemplate}
              className="mt-2 text-xs bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg font-medium"
            >
              Sjabloon opslaan
            </button>
          </div>

          {/* Preview */}
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold text-slate-700">Voorbeeld Bericht</h2>
              <button
                onClick={copyMessage}
                className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 bg-slate-100 px-2 py-1 rounded"
              >
                <Copy size={12} />
                {copied ? 'Gekopieerd!' : 'Kopieer'}
              </button>
            </div>
            <div className="bg-[#e9f5ee] rounded-xl p-4 text-sm whitespace-pre-wrap leading-relaxed text-slate-800 border border-green-100 font-sans max-h-80 overflow-y-auto">
              {previewMessage}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function WhatsAppPage() {
  return (
    <Suspense fallback={<div className="text-center py-20"><Loader2 className="animate-spin mx-auto" /></div>}>
      <WhatsAppPageContent />
    </Suspense>
  )
}
