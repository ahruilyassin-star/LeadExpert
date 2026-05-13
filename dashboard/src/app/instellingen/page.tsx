'use client'

import { useState } from 'react'
import { Settings, Save, CheckCircle, Info, Server, Database } from 'lucide-react'

export default function InstellingenPage() {
  const [saved, setSaved] = useState(false)

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Instellingen</h1>
        <p className="text-slate-500 mt-1">Configuratie en setup instructies</p>
      </div>

      {/* Setup guide */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100 mb-5">
        <h2 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Info size={18} className="text-blue-500" />
          Setup Gids — Eerste Keer Installeren
        </h2>

        <div className="space-y-4">
          {[
            {
              step: '1',
              title: 'Supabase Database instellen',
              icon: Database,
              color: 'bg-green-500',
              content: (
                <div className="text-xs text-slate-600 space-y-2">
                  <p>1. Ga naar <strong>supabase.com</strong> → maak gratis account aan</p>
                  <p>2. Maak een nieuw project aan</p>
                  <p>3. Ga naar <strong>SQL Editor</strong> en voer de migratie uit:</p>
                  <pre className="bg-slate-800 text-green-400 p-3 rounded-lg mt-2 overflow-x-auto leading-relaxed">{`-- Kopieer en plak dit in Supabase SQL Editor:

create table leads (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  phone text,
  website text,
  category text,
  city text,
  address text,
  google_rating numeric,
  review_count integer,
  website_score integer,
  issues jsonb default '[]',
  status text default 'new',
  notes text,
  whatsapp_sent_at timestamptz,
  created_at timestamptz default now()
);

create table whatsapp_messages (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id),
  phone text not null,
  message text not null,
  status text default 'pending',
  sent_at timestamptz default now()
);

create table settings (
  key text primary key,
  value text
);

-- Enable Row Level Security (open voor nu)
alter table leads enable row level security;
alter table whatsapp_messages enable row level security;
alter table settings enable row level security;

create policy "Allow all" on leads for all using (true);
create policy "Allow all" on whatsapp_messages for all using (true);
create policy "Allow all" on settings for all using (true);`}</pre>
                  <p className="mt-2">4. Kopieer de <strong>Project URL</strong> en <strong>Anon Key</strong> uit Settings → API</p>
                  <p>5. Zet deze in het <code className="bg-slate-100 px-1 rounded">.env.local</code> bestand van het dashboard</p>
                </div>
              ),
            },
            {
              step: '2',
              title: 'Dashboard .env.local bestand',
              icon: Settings,
              color: 'bg-blue-500',
              content: (
                <div className="text-xs text-slate-600">
                  <p className="mb-2">Maak <code className="bg-slate-100 px-1 rounded">dashboard/.env.local</code> aan met:</p>
                  <pre className="bg-slate-800 text-green-400 p-3 rounded-lg overflow-x-auto leading-relaxed">{`NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_KEY=eyJhbGci...
WHATSAPP_SERVICE_URL=http://localhost:3001
# Optioneel: gratis PageSpeed API versnelt analyse
# PAGESPEED_API_KEY=AIza...`}</pre>
                </div>
              ),
            },
            {
              step: '3',
              title: 'WhatsApp Service starten',
              icon: Server,
              color: 'bg-orange-500',
              content: (
                <div className="text-xs text-slate-600 space-y-2">
                  <p>De WhatsApp service draait als aparte server. Start hem zo:</p>
                  <pre className="bg-slate-800 text-green-400 p-3 rounded-lg overflow-x-auto leading-relaxed">{`# In een nieuwe terminal:
cd whatsapp-service
npm install
npm start

# De service start op http://localhost:3001
# Scan de QR code met uw WhatsApp telefoon
# Eenmalig — daarna onthoudt het systeem de sessie`}</pre>
                  <p className="mt-1">📱 Open WhatsApp → Menu (⋮) → <strong>Gekoppelde apparaten</strong> → QR code scannen</p>
                </div>
              ),
            },
            {
              step: '4',
              title: 'Dashboard online zetten (Vercel)',
              icon: Server,
              color: 'bg-purple-500',
              content: (
                <div className="text-xs text-slate-600 space-y-2">
                  <p>1. Push de code naar GitHub (is al gedaan)</p>
                  <p>2. Ga naar <strong>vercel.com</strong> → importeer de GitHub repo</p>
                  <p>3. Stel de <strong>Root Directory</strong> in op: <code className="bg-slate-100 px-1 rounded">dashboard</code></p>
                  <p>4. Voeg alle environment variabelen toe in Vercel Settings</p>
                  <p>5. Deploy → uw dashboard is altijd online! ✅</p>
                  <p className="mt-2 text-amber-700 bg-amber-50 p-2 rounded">
                    ⚠️ De WhatsApp service moet op een VPS of Railway draaien voor productie (niet serverless).
                    Gratis opties: Railway.app, Render.com, of een kleine €5/maand VPS.
                  </p>
                </div>
              ),
            },
          ].map(({ step, title, icon: Icon, color, content }) => (
            <div key={step} className="border border-slate-100 rounded-lg overflow-hidden">
              <div className={`flex items-center gap-3 p-3 bg-slate-50`}>
                <div className={`w-7 h-7 rounded-full ${color} text-white text-xs font-bold flex items-center justify-center flex-shrink-0`}>
                  {step}
                </div>
                <div className="flex items-center gap-2">
                  <Icon size={15} className="text-slate-600" />
                  <h3 className="font-semibold text-sm text-slate-700">{title}</h3>
                </div>
              </div>
              <div className="p-4">{content}</div>
            </div>
          ))}
        </div>
      </div>

      <button
        onClick={handleSave}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium"
      >
        {saved ? <CheckCircle size={16} /> : <Save size={16} />}
        {saved ? 'Opgeslagen!' : 'Instellingen opslaan'}
      </button>
    </div>
  )
}
