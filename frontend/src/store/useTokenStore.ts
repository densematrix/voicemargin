import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface TokenState {
  deviceId: string | null
  totalTokens: number
  usedTokens: number
  freeTrialUsed: boolean
  isUnlimited: boolean
  setDeviceId: (id: string) => void
  setTokenStatus: (status: {
    total_tokens: number
    used_tokens: number
    free_trial_used: boolean
    is_unlimited: boolean
  }) => void
  canGenerate: () => boolean
  getRemainingTokens: () => number
}

export const useTokenStore = create<TokenState>()(
  persist(
    (set, get) => ({
      deviceId: null,
      totalTokens: 0,
      usedTokens: 0,
      freeTrialUsed: false,
      isUnlimited: false,

      setDeviceId: (id: string) => set({ deviceId: id }),

      setTokenStatus: (status) =>
        set({
          totalTokens: status.total_tokens,
          usedTokens: status.used_tokens,
          freeTrialUsed: status.free_trial_used,
          isUnlimited: status.is_unlimited,
        }),

      canGenerate: () => {
        const state = get()
        if (state.isUnlimited) return true
        if (!state.freeTrialUsed) return true
        return state.totalTokens - state.usedTokens > 0
      },

      getRemainingTokens: () => {
        const state = get()
        if (state.isUnlimited) return 999999
        return state.totalTokens - state.usedTokens
      },
    }),
    {
      name: 'excuse-token-storage',
      partialize: (state) => ({ deviceId: state.deviceId }),
    }
  )
)
