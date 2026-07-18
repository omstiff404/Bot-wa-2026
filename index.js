import { makeWASocket, useMultiFileAuthState, DisconnectReason } from '@whiskeysockets/baileys'
import qrcode from 'qrcode-terminal'
import { config } from './config.js'
import { handler } from './toolkit/handler.js'
import { loadDatabase } from './toolkit/database/DB.js'
import pino from 'pino'

const logger = pino({ level: 'silent' })

const startBot = async () => {
  try {
    // Load database
    await loadDatabase()
    console.log('[DATABASE] Database berhasil dimuat')

    // Setup auth state
    const { state, saveCreds } = await useMultiFileAuthState('auth_info_baileys')

    const sock = makeWASocket({
      auth: state,
      logger: logger,
      printQRInTerminal: true,
      generateHighQualityLinkPreview: true,
      browser: ['Ubuntu', 'Chrome', '120.0.0.0'],
      syncFullHistory: false,
      markOnlineOnConnect: true,
    })

    // Handle connection updates
    sock.ev.on('connection.update', async (update) => {
      const { connection, lastDisconnect, qr } = update

      if (qr) {
        console.clear()
        console.log('\\n📱 SCAN QR CODE DENGAN WHATSAPP:',
          '\\n> Buka WhatsApp > Ketuk Menu > Perangkat Tertaut > Tautkan Perangkat\\n')
        qrcode.generate(qr, { small: true })
      }

      if (connection === 'open') {
        console.clear()
        const jid = sock.user.id.split(':')[0]
        console.log(`✅ Bot Berhasil Terhubung! Nomor: ${jid}`)
        console.log(`🚀 Bot Siap Menerima Pesan...\\n`)
      }

      if (connection === 'close') {
        let reason = new Disconnect(lastDisconnect?.error)?.reason
        if (reason === DisconnectReason.loggedOut) {
          console.log('❌ Sesi Logout, Hapus folder auth_info_baileys')
          process.exit(0)
        } else if (reason === DisconnectReason.connectionClosed) {
          console.log('⚠️  Koneksi Tertutup, Menghubungkan Kembali...')
          startBot()
        } else if (reason === DisconnectReason.connectionLost) {
          console.log('⚠️  Koneksi Hilang, Menghubungkan Kembali...')
          startBot()
        } else if (reason === DisconnectReason.connectionReplaced) {
          console.log('⚠️  Koneksi Diganti Device Lain')
          process.exit(0)
        } else if (reason === DisconnectReason.timedOut) {
          console.log('⚠️  Timeout, Menghubungkan Kembali...')
          startBot()
        } else if (reason === DisconnectReason.badSession) {
          console.log('❌ Session Rusak, Hapus folder auth_info_baileys')
          process.exit(0)
        } else if (reason === DisconnectReason.multiDeviceNotSupported) {
          console.log('❌ Multi Device Tidak Didukung')
          process.exit(0)
        }
      }
    })

    // Handle messages
    sock.ev.on('messages.upsert', async (m) => {
      await handler(m, sock)
    })

    // Save credentials when updated
    sock.ev.on('creds.update', saveCreds)

  } catch (error) {
    console.error('❌ Error:', error)
    setTimeout(startBot, 5000)
  }
}

startBot()
