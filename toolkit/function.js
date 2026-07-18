import fs from 'fs'
import path from 'path'
import { config } from '../config.js'
import { getDatabase } from './database/DB.js'

// Check if user is owner
export const isOwner = (jid) => {
  const ownerId = config.owner + '@s.whatsapp.net'
  return jid === ownerId
}

// Check if group
export const isGroup = (jid) => {
  return jid.endsWith('@g.us')
}

// Check if admin in group
export const isAdmin = async (jid, sock) => {
  try {
    const groupMetadata = await sock.groupMetadata(jid)
    const botAdmin = groupMetadata.participants.find(p => p.id === sock.user.jid)?.admin
    return botAdmin === 'admin' || botAdmin === 'superadmin'
  } catch (error) {
    return false
  }
}

// Check if user is admin in group
export const isUserAdmin = async (jid, participant, sock) => {
  try {
    const groupMetadata = await sock.groupMetadata(jid)
    const user = groupMetadata.participants.find(p => p.id === participant)
    return user?.admin === 'admin' || user?.admin === 'superadmin'
  } catch (error) {
    return false
  }
}

// Get quoted message
export const getQuotedMessage = (msg) => {
  if (msg.quoted) return msg.quoted.message
  return null
}

// Send text message
export const sendText = async (jid, text, sock) => {
  return await sock.sendMessage(jid, { text })
}

// Send image
export const sendImage = async (jid, imageUrl, caption = '', sock) => {
  return await sock.sendMessage(jid, {
    image: { url: imageUrl },
    caption
  })
}

// Send audio
export const sendAudio = async (jid, audioPath, sock) => {
  const audio = fs.readFileSync(audioPath)
  return await sock.sendMessage(jid, {
    audio,
    mimetype: 'audio/mp4'
  })
}

// Send video
export const sendVideo = async (jid, videoPath, caption = '', sock) => {
  const video = fs.readFileSync(videoPath)
  return await sock.sendMessage(jid, {
    video,
    caption,
    mimetype: 'video/mp4'
  })
}

// Format uptime
export const formatUptime = (seconds) => {
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = Math.floor(seconds % 60)
  
  return `${days}d ${hours}h ${minutes}m ${secs}s`
}

// Get file size
export const getFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}
