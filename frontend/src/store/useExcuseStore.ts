import { create } from 'zustand'

export interface Excuse {
  text: string
  tone: string
  tip: string
}

export type ExcuseCategory =
  | 'late'
  | 'sick_leave'
  | 'decline'
  | 'forgot'
  | 'deadline'
  | 'meeting'
  | 'homework'
  | 'other'

export type UrgencyLevel = 'normal' | 'urgent' | 'extreme'

interface ExcuseState {
  category: ExcuseCategory | null
  urgency: UrgencyLevel
  context: string
  excuses: Excuse[]
  isLoading: boolean
  error: string | null
  tokensRemaining: number
  setCategory: (category: ExcuseCategory) => void
  setUrgency: (urgency: UrgencyLevel) => void
  setContext: (context: string) => void
  setExcuses: (excuses: Excuse[], tokensRemaining: number) => void
  setLoading: (isLoading: boolean) => void
  setError: (error: string | null) => void
  reset: () => void
}

export const useExcuseStore = create<ExcuseState>((set) => ({
  category: null,
  urgency: 'normal',
  context: '',
  excuses: [],
  isLoading: false,
  error: null,
  tokensRemaining: -1,

  setCategory: (category) => set({ category, excuses: [], error: null }),
  setUrgency: (urgency) => set({ urgency }),
  setContext: (context) => set({ context }),
  setExcuses: (excuses, tokensRemaining) =>
    set({ excuses, tokensRemaining, isLoading: false, error: null }),
  setLoading: (isLoading) => set({ isLoading, error: null }),
  setError: (error) => set({ error, isLoading: false }),
  reset: () =>
    set({
      category: null,
      urgency: 'normal',
      context: '',
      excuses: [],
      isLoading: false,
      error: null,
    }),
}))
