import { fortunes } from '../data/fortunes'
import type { Fortune } from '../types/fortune'

const encoder = new TextEncoder()

function bufferToUint(buffer: ArrayBuffer): bigint {
  const bytes = new Uint8Array(buffer)
  let result = 0n

  for (const byte of bytes.slice(0, 8)) {
    result = (result << 8n) + BigInt(byte)
  }

  return result
}

export function getDateKey(date = new Date()): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function getOrCreateDeviceId(): string {
  const storageKey = 'fate-draw-device-id-v1'
  const existing = window.localStorage.getItem(storageKey)

  if (existing) {
    return existing
  }

  const fallbackFingerprint = [
    navigator.userAgent,
    navigator.language,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
  ].join('|')

  const deviceId = `${crypto.randomUUID()}|${fallbackFingerprint}`
  window.localStorage.setItem(storageKey, deviceId)

  return deviceId
}

export async function resolveDailyFortune(dateKey: string, deviceId: string): Promise<Fortune> {
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(`${dateKey}|${deviceId}`))
  const value = bufferToUint(digest)
  const index = Number(value % BigInt(fortunes.length))

  return fortunes[index]
}
