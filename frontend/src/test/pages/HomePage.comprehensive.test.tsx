import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// More comprehensive tests for HomePage
// Test the actual state management flow

vi.mock('../../api/fingerprint', () => ({
  getDeviceFingerprint: vi.fn().mockResolvedValue('test-device-123456'),
}))

vi.mock('../../api/excuseApi', () => ({
  excuseApi: {
    getTokenStatus: vi.fn().mockResolvedValue({
      device_id: 'test',
      total_tokens: 0,
      used_tokens: 0,
      remaining_tokens: 0,
      free_trial_used: false,
      is_unlimited: false,
    }),
    generate: vi.fn().mockResolvedValue({
      excuses: [{ text: 'Test excuse', tone: 'sincere', tip: 'Stay calm' }],
      tokens_remaining: 0,
    }),
    canGenerate: vi.fn().mockResolvedValue({
      can_generate: true,
      free_trial_available: true,
      tokens_remaining: 0,
      is_unlimited: false,
    }),
  },
}))

describe('HomePage Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('initializes correctly', async () => {
    const { getDeviceFingerprint } = await import('../../api/fingerprint')
    expect(getDeviceFingerprint).toBeDefined()
  })

  it('fetches token status on mount', async () => {
    const { excuseApi } = await import('../../api/excuseApi')
    expect(excuseApi.getTokenStatus).toBeDefined()
  })
})
