import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const [leadsResult, messagesResult] = await Promise.all([
      supabase.from('leads').select('status, website_score'),
      supabase.from('whatsapp_messages').select('id, status'),
    ])

    const leads = leadsResult.data || []
    const messages = messagesResult.data || []

    const total = leads.length
    const newLeads = leads.filter(l => l.status === 'new').length
    const contacted = leads.filter(l => l.status === 'contacted').length
    const responded = leads.filter(l => l.status === 'responded').length
    const closed = leads.filter(l => l.status === 'closed').length
    const avgScore = leads.length > 0
      ? Math.round(leads.reduce((sum, l) => sum + (l.website_score || 0), 0) / leads.length)
      : 0

    return NextResponse.json({
      total_leads: total,
      new_leads: newLeads,
      contacted,
      responded,
      closed,
      avg_website_score: avgScore,
      messages_sent: messages.filter(m => m.status === 'sent').length,
      conversion_rate: total > 0 ? Math.round((responded / total) * 100) : 0,
    })
  } catch (error) {
    console.error('Stats error:', error)
    return NextResponse.json({
      total_leads: 0, new_leads: 0, contacted: 0,
      responded: 0, closed: 0, avg_website_score: 0,
      messages_sent: 0, conversion_rate: 0,
    })
  }
}
