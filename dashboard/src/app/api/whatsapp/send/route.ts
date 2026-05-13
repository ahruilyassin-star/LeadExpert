import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const { lead_id, phone, message } = await request.json()

    if (!phone || !message) {
      return NextResponse.json({ error: 'Telefoon en bericht zijn verplicht' }, { status: 400 })
    }

    const waServiceUrl = process.env.WHATSAPP_SERVICE_URL

    if (!waServiceUrl) {
      // Store as pending if WhatsApp service not configured
      await supabase.from('whatsapp_messages').insert({
        lead_id,
        phone,
        message,
        status: 'pending',
        sent_at: new Date().toISOString(),
      })

      return NextResponse.json({
        success: false,
        status: 'pending',
        message: 'WhatsApp service niet geconfigureerd. Bericht opgeslagen als wachtend.',
        wa_link: `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`,
      })
    }

    // Send via WhatsApp service
    try {
      const response = await fetch(`${waServiceUrl}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, message }),
      })

      const result = await response.json()

      const status = result.success ? 'sent' : 'failed'

      await supabase.from('whatsapp_messages').insert({
        lead_id,
        phone,
        message,
        status,
        sent_at: new Date().toISOString(),
      })

      if (status === 'sent' && lead_id) {
        await supabase
          .from('leads')
          .update({ status: 'contacted', whatsapp_sent_at: new Date().toISOString() })
          .eq('id', lead_id)
      }

      return NextResponse.json({
        success: result.success,
        status,
        wa_link: `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`,
      })
    } catch {
      await supabase.from('whatsapp_messages').insert({
        lead_id,
        phone,
        message,
        status: 'failed',
        sent_at: new Date().toISOString(),
      })

      return NextResponse.json({
        success: false,
        status: 'failed',
        wa_link: `https://wa.me/${phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`,
      })
    }
  } catch (error) {
    console.error('WhatsApp send error:', error)
    return NextResponse.json({ error: 'Verzenden mislukt' }, { status: 500 })
  }
}
