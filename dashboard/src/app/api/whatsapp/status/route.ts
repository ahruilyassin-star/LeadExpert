import { NextResponse } from 'next/server'

export async function GET() {
  const waServiceUrl = process.env.WHATSAPP_SERVICE_URL

  if (!waServiceUrl) {
    return NextResponse.json({
      connected: false,
      status: 'not_configured',
      message: 'WhatsApp service URL niet ingesteld in .env',
    })
  }

  try {
    const response = await fetch(`${waServiceUrl}/status`, {
      next: { revalidate: 0 },
    })
    const data = await response.json()
    return NextResponse.json(data)
  } catch {
    return NextResponse.json({
      connected: false,
      status: 'offline',
      message: 'WhatsApp service is offline',
    })
  }
}
