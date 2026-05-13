import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getSupabase() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    let query = supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false })

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json({ leads: data || [] })
  } catch (error) {
    console.error('GET leads error:', error)
    return NextResponse.json({ error: 'Ophalen mislukt' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await request.json()

    const lead = {
      business_name: body.business_name,
      phone: body.phone || null,
      website: body.website || null,
      category: body.category,
      city: body.city,
      address: body.address || null,
      google_rating: body.google_rating || null,
      review_count: body.review_count || null,
      website_score: body.website_score || null,
      issues: body.issues || [],
      status: 'new',
      notes: null,
      whatsapp_sent_at: null,
    }

    const { data, error } = await supabase
      .from('leads')
      .insert(lead)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ lead: data })
  } catch (error) {
    console.error('POST lead error:', error)
    return NextResponse.json({ error: 'Opslaan mislukt' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = getSupabase()
    const body = await request.json()
    const { id, ...updates } = body

    if (!id) {
      return NextResponse.json({ error: 'ID verplicht' }, { status: 400 })
    }

    const { error } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('PATCH lead error:', error)
    return NextResponse.json({ error: 'Update mislukt' }, { status: 500 })
  }
}
