import { describe, it, expect, vi, beforeEach } from 'vitest'
import { getDeviceFingerprint, clearFingerprint } from '../../api/fingerprint'

vi.mock('@fingerprintjs/fingerprintjs', () => ({
  default: {
    load: vi.fn().mockResolvedValue({
      get: vi.fn().mockResolvedValue({
        visitorId: 'mock-fingerprint-123',
      }),
    }),
  },
}))

describe('fingerprint', () => {
  beforeEach(() => {
    clearFingerprint()
  })

  describe('getDeviceFingerprint', () => {
    it('returns fingerprint', async () => {
      const fp = await getDeviceFingerprint()
      expect(fp).toBe('mock-fingerprint-123')
    })

    it('caches fingerprint', async () => {
      const fp1 = await getDeviceFingerprint()
      const fp2 = await getDeviceFingerprint()
      expect(fp1).toBe(fp2)
    })
  })

  describe('clearFingerprint', () => {
    it('clears cached fingerprint', async () => {
      await getDeviceFingerprint()
      clearFingerprint()
      // After clear, should fetch again
      const fp = await getDeviceFingerprint()
      expect(fp).toBe('mock-fingerprint-123')
    })
  })
})
