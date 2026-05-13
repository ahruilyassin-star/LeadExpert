const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  makeCacheableSignalKeyStore,
} = require('@whiskeysockets/baileys')
const pino = require('pino')
const path = require('path')

const SESSION_DIR = path.join(__dirname, '..', 'sessions')

/**
 * Creates a WhatsApp connection using Baileys.
 * Session is persisted in ./sessions so the QR is only scanned once.
 *
 * @param {{ onQR, onConnected, onDisconnected }} callbacks
 * @returns WhatsApp socket with sendMessage()
 */
async function createConnection({ onQR, onConnected, onDisconnected }) {
  const { version } = await fetchLatestBaileysVersion()
  const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR)

  const logger = pino({ level: 'silent' })

  const sock = makeWASocket({
    version,
    auth: {
      creds: state.creds,
      keys: makeCacheableSignalKeyStore(state.keys, logger),
    },
    logger,
    printQRInTerminal: false, // we handle QR ourselves
    browser: ['Lead Generator', 'Chrome', '120.0'],
    generateHighQualityLinkPreview: false,
    syncFullHistory: false,
  })

  // Save credentials whenever they update
  sock.ev.on('creds.update', saveCreds)

  // Handle connection state changes
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect, qr } = update

    if (qr) {
      onQR(qr)
    }

    if (connection === 'open') {
      const phone = sock.user?.id?.split(':')[0] || sock.user?.id || 'onbekend'
      onConnected(phone)
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut

      if (statusCode === DisconnectReason.loggedOut) {
        console.log('📵 Uitgelogd uit WhatsApp. Verwijder de sessions map en herstart.')
      } else {
        console.log(`🔄 Verbinding verbroken (code ${statusCode}). Herverbinden: ${shouldReconnect}`)
        if (shouldReconnect) onDisconnected()
      }
    }
  })

  return sock
}

module.exports = { createConnection }
