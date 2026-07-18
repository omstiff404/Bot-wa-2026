import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.join(__dirname, 'DB.json')

let db = {}

// Load database dari file
export const loadDatabase = async () => {
  try {
    if (fs.existsSync(dbPath)) {
      const data = fs.readFileSync(dbPath, 'utf-8')
      db = JSON.parse(data)
      console.log('✅ Database loaded successfully')
    } else {
      // Create default database
      db = {
        users: [],
        groups: [],
        settings: {
          antilink: true,
          antispam: true,
          autoreply: true
        },
        statistics: {
          messages: 0,
          commands: 0
        }
      }
      saveDatabase()
    }
  } catch (error) {
    console.error('❌ Error loading database:', error)
  }
}

// Save database ke file
export const saveDatabase = () => {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2))
  } catch (error) {
    console.error('❌ Error saving database:', error)
  }
}

// Get database
export const getDatabase = () => db

// Update database
export const updateDatabase = (key, value) => {
  db[key] = value
  saveDatabase()
}

// Add user
export const addUser = (jid) => {
  if (!db.users.find(u => u.jid === jid)) {
    db.users.push({
      jid,
      createdAt: new Date().toISOString(),
      stats: { messages: 0, commands: 0 }
    })
    saveDatabase()
  }
}

// Add group
export const addGroup = (jid, name) => {
  if (!db.groups.find(g => g.jid === jid)) {
    db.groups.push({
      jid,
      name,
      createdAt: new Date().toISOString(),
      settings: { antilink: true, antispam: true }
    })
    saveDatabase()
  }
}
