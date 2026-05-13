const express = require('express')
const cors = require('cors')
const { createConnection } = require('./whatsapp')

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

let waClient = null
let connectionState = 'disconnected' // disconnected | connecting | qr_ready | connected
let qrCode = null
let connectedPhone = null

// Initialize WhatsApp on startup
async function init() {
  console.log('🚀 WhatsApp Lead Generator Service starting...')
  await connectWhatsApp()
}

async function connectWhatsApp() {
  connectionState = 'connecting'
  qrCode = null

  try {
    waClient = await createConnection({
      onQR: (qr) => {
        connectionState = 'qr_ready'
        qrCode = qr
        console.log('\n📱 Scan de QR code met uw WhatsApp:')
        console.log('   WhatsApp → Menu (⋮) → Gekoppelde apparaten → + Apparaat koppelen\n')
        // Print QR in terminal
        try {
          require('qrcode-terminal').generate(qr, { small: true })
        } catch {}
      },
      onConnected: (phone) => {
        connectionState = 'connected'
        connectedPhone = phone
        qrCode = null
        console.log(`\n✅ WhatsApp verbonden! Nummer: ${phone}`)
        console.log(`📡 Service actief op http://localhost:${PORT}\n`)
      },
      onDisconnected: () => {
        connectionState = 'disconnected'
        connectedPhone = null
        console.log('⚠️  WhatsApp verbinding verbroken. Herverbinden...')
        setTimeout(connectWhatsApp, 5000)
      },
    })
  } catch (err) {
    console.error('❌ Verbinding mislukt:', err.message)
    connectionState = 'disconnected'
    setTimeout(connectWhatsApp, 10000)
  }
}

// ── REST API ──────────────────────────────────────────────

// Health check + status
app.get('/status', (req, res) => {
  res.json({
    connected: connectionState === 'connected',
    status: connectionState,
    phone: connectedPhone,
    message: getStatusMessage(),
    qr_available: !!qrCode,
  })
})

// Get QR code as data URI (for dashboard display)
app.get('/qr', async (req, res) => {
  if (!qrCode) {
    return res.json({ qr: null, message: 'Geen QR code beschikbaar' })
  }
  try {
    const QRCode = require('qrcode')
    const dataUri = await QRCode.toDataURL(qrCode, { width: 300, margin: 2 })
    res.json({ qr: dataUri, message: 'Scan met WhatsApp' })
  } catch {
    res.json({ qr: null, message: 'QR generatie mislukt' })
  }
})

// Send a WhatsApp message
app.post('/send', async (req, res) => {
  const { phone, message } = req.body

  if (!phone || !message) {
    return res.status(400).json({ success: false, error: 'phone en message zijn verplicht' })
  }

  if (connectionState !== 'connected' || !waClient) {
    return res.status(503).json({
      success: false,
      error: 'WhatsApp niet verbonden',
      status: connectionState,
    })
  }

  try {
    // Normalize phone: remove spaces/dashes, ensure it has country code
    const normalized = normalizePhone(phone)
    if (!normalized) {
      return res.status(400).json({ success: false, error: 'Ongeldig telefoonnummer' })
    }

    await waClient.sendMessage(`${normalized}@s.whatsapp.net`, { text: message })

    console.log(`✉️  Bericht gestuurd naar ${normalized}`)
    res.json({ success: true, phone: normalized })
  } catch (err) {
    console.error('Send error:', err.message)
    res.status(500).json({ success: false, error: err.message })
  }
})

// Reconnect manually
app.post('/reconnect', async (req, res) => {
  if (waClient) {
    try { await waClient.logout() } catch {}
  }
  connectionState = 'connecting'
  connectWhatsApp()
  res.json({ message: 'Herverbinden gestart...' })
})

// ── Helpers ───────────────────────────────────────────────

function normalizePhone(phone) {
  // Strip everything except digits and leading +
  let cleaned = phone.replace(/[\s\-().]/g, '')

  // Remove leading zeros and replace with Belgian country code if needed
  if (cleaned.startsWith('00')) cleaned = '+' + cleaned.slice(2)
  if (cleaned.startsWith('0') && !cleaned.startsWith('00')) cleaned = '+32' + cleaned.slice(1)
  if (!cleaned.startsWith('+')) cleaned = '+' + cleaned

  // Remove the + for Baileys (it uses just the number)
  cleaned = cleaned.replace('+', '')

  // Validate: should be 8-15 digits
  if (!/^\d{8,15}$/.test(cleaned)) return null

  return cleaned
}

function getStatusMessage() {
  switch (connectionState) {
    case 'connected': return `Verbonden met WhatsApp${connectedPhone ? ` (${connectedPhone})` : ''}`
    case 'qr_ready': return 'Scan de QR code met uw WhatsApp om te verbinden'
    case 'connecting': return 'Verbinding wordt gemaakt...'
    default: return 'WhatsApp service is offline of niet geconfigureerd'
  }
}

// ── Start server ──────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`\n══════════════════════════════════════════`)
  console.log(`  WhatsApp Lead Generator Service`)
  console.log(`  http://localhost:${PORT}`)
  console.log(`══════════════════════════════════════════\n`)
  init()
})
