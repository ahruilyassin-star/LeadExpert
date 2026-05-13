import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function getLeads(status?: string) {
  let query = supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false })

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export async function getLead(id: string) {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function updateLeadStatus(id: string, status: string) {
  const { error } = await supabase
    .from('leads')
    .update({ status })
    .eq('id', id)
  if (error) throw error
}

export async function insertLead(lead: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('leads')
    .insert(lead)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function getMessages() {
  const { data, error } = await supabase
    .from('whatsapp_messages')
    .select('*, leads(business_name)')
    .order('sent_at', { ascending: false })
  if (error) throw error
  return data
}

export async function insertMessage(message: Record<string, unknown>) {
  const { error } = await supabase
    .from('whatsapp_messages')
    .insert(message)
  if (error) throw error
}

export async function getStats() {
  const { data: leads } = await supabase.from('leads').select('status')
  const { data: messages } = await supabase.from('whatsapp_messages').select('id').eq('status', 'sent')

  const total = leads?.length || 0
  const newLeads = leads?.filter(l => l.status === 'new').length || 0
  const contacted = leads?.filter(l => l.status === 'contacted').length || 0
  const responded = leads?.filter(l => l.status === 'responded').length || 0

  return {
    total_leads: total,
    new_leads: newLeads,
    contacted,
    responded,
    conversion_rate: total > 0 ? Math.round((responded / total) * 100) : 0,
    messages_sent: messages?.length || 0,
  }
}

export async function getWhatsAppSettings() {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('key', 'whatsapp_template')
    .single()
  if (error) return null
  return data
}

export async function saveWhatsAppTemplate(template: string, signature: string) {
  await supabase
    .from('settings')
    .upsert({ key: 'whatsapp_template', value: template })
  await supabase
    .from('settings')
    .upsert({ key: 'whatsapp_signature', value: signature })
}
