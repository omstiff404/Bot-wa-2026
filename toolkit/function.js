import axios from 'axios';
import { getDatabase, saveDatabase, addUser, getUser, addGroup, getGroup } from './database/db.js';

export function parseCommand(text, prefix = '.') {
  const regex = new RegExp(`^\\${prefix}([\\w-]+)(?:\\s+(.*))?$`, 'i');
  const match = text.match(regex);
  
  if (!match) return null;
  
  return {
    command: match[1].toLowerCase(),
    args: match[2] ? match[2].split(/\s+/) : [],
    fullArgs: match[2] || ''
  };
}

export function isOwner(jid, ownerList) {
  return ownerList.includes(jid);
}

export function isGroup(jid) {
  return jid.endsWith('@g.us');
}

export function getJid(jid) {
  return jid.split('@')[0];
}

// Deteksi nomor dengan berbagai format
export function normalizePhoneNumber(phone) {
  // Hapus karakter selain angka
  let cleaned = phone.replace(/\D/g, '');
  
  // Jika dimulai dengan 0, ganti dengan 62
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  }
  
  // Jika tidak dimulai dengan 62, tambahkan
  if (!cleaned.startsWith('62')) {
    cleaned = '62' + cleaned;
  }
  
  return cleaned;
}

// Cek apakah nomor adalah owner (jid, lid, atau nomor biasa)
export function isOwnerNumber(jid, ownerList) {
  const phoneNumber = getJid(jid);
  const normalizedPhone = normalizePhoneNumber(phoneNumber);
  
  return ownerList.some(owner => {
    const ownerPhone = getJid(owner);
    const normalizedOwner = normalizePhoneNumber(ownerPhone);
    
    return (
      jid === owner || // Perbandingan jid langsung
      phoneNumber === ownerPhone || // Perbandingan nomor biasa
      normalizedPhone === normalizedOwner // Perbandingan nomor yang dinormalisasi
    );
  });
}

// Cek apakah pengguna adalah admin grup
export async function isGroupAdmin(sock, groupId, jid) {
  try {
    const groupMetadata = await sock.groupMetadata(groupId);
    const admins = groupMetadata.participants
      .filter(p => p.admin)
      .map(p => p.id);
    
    return admins.includes(jid);
  } catch (error) {
    console.error('❌ Error checking admin:', error);
    return false;
  }
}

// Get semua admin di grup
export async function getGroupAdmins(sock, groupId) {
  try {
    const groupMetadata = await sock.groupMetadata(groupId);
    const admins = groupMetadata.participants
      .filter(p => p.admin)
      .map(p => p.id);
    
    return admins;
  } catch (error) {
    console.error('❌ Error getting admins:', error);
    return [];
  }
}

// Deteksi format nomor dan kembalikan informasi
export function detectNumberFormat(phone) {
  const cleaned = phone.replace(/\D/g, '');
  const formats = {
    jid: `${cleaned}@s.whatsapp.net`,
    lid: `${cleaned}@g.us`,
    number: phone,
    normalized: normalizePhoneNumber(phone)
  };
  
  return formats;
}

export async function sendText(sock, jid, text) {
  return await sock.sendMessage(jid, { text });
}

export async function sendImage(sock, jid, imagePath, caption = '') {
  return await sock.sendMessage(jid, {
    image: { url: imagePath },
    caption: caption
  });
}

export async function sendAudio(sock, jid, audioPath) {
  return await sock.sendMessage(jid, {
    audio: { url: audioPath },
    mimetype: 'audio/mpeg'
  });
}

export async function sendVideo(sock, jid, videoPath, caption = '') {
  return await sock.sendMessage(jid, {
    video: { url: videoPath },
    caption: caption,
    mimetype: 'video/mp4'
  });
}

export async function sendSticker(sock, jid, stickerPath) {
  return await sock.sendMessage(jid, {
    sticker: { url: stickerPath },
    packName: 'STIFF404 Bot',
    author: 'stiff404'
  });
}

export async function reply(sock, m, text) {
  return await sock.sendMessage(m.key.remoteJid, 
    { text: text },
    { quoted: m }
  );
}

export async function replyWithSticker(sock, m, stickerPath) {
  return await sock.sendMessage(m.key.remoteJid,
    {
      sticker: { url: stickerPath },
      packName: 'STIFF404 Bot',
      author: 'stiff404'
    },
    { quoted: m }
  );
}

export function formatNumber(num) {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export function getTime() {
  return new Date().toLocaleTimeString('id-ID', { 
    hour12: false, 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit' 
  });
}

export function getDate() {
  return new Date().toLocaleDateString('id-ID');
}

export async function fetchJson(url, options = {}) {
  try {
    const response = await axios.get(url, options);
    return response.data;
  } catch (error) {
    console.error('❌ Fetch error:', error.message);
    return null;
  }
}

export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
