-- Lead Generator Dashboard — Initial Schema
-- Kopieer en plak dit in Supabase SQL Editor

-- Leads tabel
create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  business_name text not null,
  phone text,
  website text,
  category text,
  city text,
  address text,
  google_rating numeric(3,1),
  review_count integer,
  website_score integer,
  issues jsonb default '[]'::jsonb,
  status text default 'new' check (status in ('new','contacted','responded','closed','not_interested')),
  notes text,
  whatsapp_sent_at timestamptz,
  created_at timestamptz default now()
);

-- WhatsApp berichten tabel
create table if not exists whatsapp_messages (
  id uuid primary key default gen_random_uuid(),
  lead_id uuid references leads(id) on delete set null,
  phone text not null,
  message text not null,
  status text default 'pending' check (status in ('pending','sent','failed')),
  sent_at timestamptz default now()
);

-- Instellingen tabel
create table if not exists settings (
  key text primary key,
  value text not null
);

-- Standaard instellingen
insert into settings (key, value) values
  ('whatsapp_template', 'Goeiedag {bedrijfsnaam} 👋

Ik analyseerde {website} en ontdekte enkele verbeterpunten:

{problemen}

Hierdoor verliest u mogelijk klanten:
{verlies}

Met ons Webdesign + SEO pakket lossen we dit snel op.

Interesse in een gratis analyse? Antwoord gewoon op dit bericht!

{handtekening}'),
  ('whatsapp_signature', 'Met vriendelijke groeten,
[Uw naam]
📱 [Uw telefoon]')
on conflict (key) do nothing;

-- Row Level Security — open policies (pas aan voor productie)
alter table leads enable row level security;
alter table whatsapp_messages enable row level security;
alter table settings enable row level security;

create policy "Allow all on leads" on leads for all using (true) with check (true);
create policy "Allow all on messages" on whatsapp_messages for all using (true) with check (true);
create policy "Allow all on settings" on settings for all using (true) with check (true);

-- Index voor snellere queries
create index if not exists leads_status_idx on leads(status);
create index if not exists leads_created_at_idx on leads(created_at desc);
create index if not exists messages_lead_id_idx on whatsapp_messages(lead_id);
