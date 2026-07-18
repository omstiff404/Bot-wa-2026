import { config } from '../config.js'
import { isOwner, isGroup } from './function.js'
import { addUser, addGroup } from './database/DB.js'
import { menu } from '../command/main/menu.js'
import { owner } from '../command/owner/owner.js'
import { admin } from '../command/group/admin.js'

export const handler = async (m, sock) => {
  try {
    const message = m.messages[0]
    if (!message) return
    
    const jid = message.key.remoteJid
    const sender = message.key.participant || message.key.remoteJid
    const text = message.message?.conversation || message.message?.extendedTextMessage?.text || ''
    const args = text.trim().split(' ')
    const command = args[0]?.toLowerCase()
    
    // Auto add user & group
    addUser(sender)
    if (isGroup(jid)) {
      addGroup(jid, (await sock.groupMetadata(jid)).subject)
    }
    
    // Ignore if not using prefix
    if (!command.startsWith(config.prefix)) return
    
    const cmd = command.slice(config.prefix.length)
    const cmdArgs = args.slice(1)
    
    console.log(`[${new Date().toLocaleTimeString()}] ${cmd} from ${sender}`)
    
    // Command routing
    if (cmd === 'menu') {
      return await menu(jid, sender, sock)
    }
    
    if (isOwner(sender)) {
      if (cmd === 'owner') {
        return await owner(jid, cmdArgs, sock)
      }
    }
    
    if (isGroup(jid)) {
      if (cmd === 'admin') {
        return await admin(jid, sender, cmdArgs, sock)
      }
    }
    
  } catch (error) {
    console.error('❌ Handler Error:', error)
  }
}
