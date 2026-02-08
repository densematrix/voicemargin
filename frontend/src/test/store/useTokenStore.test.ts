import { describe, it, expect, beforeEach } from 'vitest'
import { useTokenStore } from '../../store/useTokenStore'

describe('useTokenStore', () => {
  beforeEach(() => {
    useTokenStore.setState({
      deviceId: null,
      totalTokens: 0,
      usedTokens: 0,
      freeTrialUsed: false,
      isUnlimited: false,
    })
  })

  it('has correct initial state', () => {
    const state = useTokenStore.getState()
    expect(state.deviceId).toBeNull()
    expect(state.totalTokens).toBe(0)
    expect(state.usedTokens).toBe(0)
    expect(state.freeTrialUsed).toBe(false)
    expect(state.isUnlimited).toBe(false)
  })

  it('setDeviceId updates deviceId', () => {
    useTokenStore.getState().setDeviceId('test-device-123')
    expect(useTokenStore.getState().deviceId).toBe('test-device-123')
  })

  it('setTokenStatus updates token fields', () => {
    useTokenStore.getState().setTokenStatus({
      total_tokens: 10,
      used_tokens: 3,
      free_trial_used: true,
      is_unlimited: false,
    })
    
    const state = useTokenStore.getState()
    expect(state.totalTokens).toBe(10)
    expect(state.usedTokens).toBe(3)
    expect(state.freeTrialUsed).toBe(true)
    expect(state.isUnlimited).toBe(false)
  })

  describe('canGenerate', () => {
    it('returns true when unlimited', () => {
      useTokenStore.setState({ isUnlimited: true, freeTrialUsed: true, totalTokens: 0, usedTokens: 0 })
      expect(useTokenStore.getState().canGenerate()).toBe(true)
    })

    it('returns true when free trial not used', () => {
      useTokenStore.setState({ isUnlimited: false, freeTrialUsed: false, totalTokens: 0, usedTokens: 0 })
      expect(useTokenStore.getState().canGenerate()).toBe(true)
    })

    it('returns true when has remaining tokens', () => {
      useTokenStore.setState({ isUnlimited: false, freeTrialUsed: true, totalTokens: 10, usedTokens: 5 })
      expect(useTokenStore.getState().canGenerate()).toBe(true)
    })

    it('returns false when no tokens and free trial used', () => {
      useTokenStore.setState({ isUnlimited: false, freeTrialUsed: true, totalTokens: 5, usedTokens: 5 })
      expect(useTokenStore.getState().canGenerate()).toBe(false)
    })
  })

  describe('getRemainingTokens', () => {
    it('returns high number when unlimited', () => {
      useTokenStore.setState({ isUnlimited: true })
      expect(useTokenStore.getState().getRemainingTokens()).toBe(999999)
    })

    it('returns correct remaining when not unlimited', () => {
      useTokenStore.setState({ isUnlimited: false, totalTokens: 10, usedTokens: 3 })
      expect(useTokenStore.getState().getRemainingTokens()).toBe(7)
    })

    it('returns 0 when all tokens used', () => {
      useTokenStore.setState({ isUnlimited: false, totalTokens: 5, usedTokens: 5 })
      expect(useTokenStore.getState().getRemainingTokens()).toBe(0)
    })
  })
})
