import FingerprintJS from '@fingerprintjs/fingerprintjs'

let cachedFingerprint: string | null = null

export async function getDeviceFingerprint(): Promise<string> {
  if (cachedFingerprint) {
    return cachedFingerprint
  }

  try {
    const fp = await FingerprintJS.load()
    const result = await fp.get()
    cachedFingerprint = result.visitorId
    return cachedFingerprint
  } catch (error) {
    // Fallback to a random ID if fingerprinting fails
    const fallbackId = `fallback_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
    cachedFingerprint = fallbackId
    return fallbackId
  }
}

export function clearFingerprint(): void {
  cachedFingerprint = null
}

// Alias for consistency
export const getDeviceId = getDeviceFingerprint
