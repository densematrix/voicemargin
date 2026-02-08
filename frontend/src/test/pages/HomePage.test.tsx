import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { HomePage } from '../../pages/HomePage'

// Mock the stores
vi.mock('../../store/useExcuseStore', () => ({
  useExcuseStore: () => ({
    category: null,
    urgency: 'normal',
    context: '',
    excuses: [],
    isLoading: false,
    error: null,
    setCategory: vi.fn(),
    setUrgency: vi.fn(),
    setContext: vi.fn(),
    setExcuses: vi.fn(),
    setLoading: vi.fn(),
    setError: vi.fn(),
  }),
}))

vi.mock('../../store/useTokenStore', () => ({
  useTokenStore: () => ({
    deviceId: 'test-device-123456',
    setDeviceId: vi.fn(),
    setTokenStatus: vi.fn(),
    canGenerate: () => true,
    freeTrialUsed: false,
    isUnlimited: false,
    getRemainingTokens: () => 0,
  }),
}))

vi.mock('../../api/excuseApi', () => ({
  excuseApi: {
    getTokenStatus: vi.fn().mockResolvedValue({
      total_tokens: 0,
      used_tokens: 0,
      free_trial_used: false,
      is_unlimited: false,
    }),
    generate: vi.fn().mockResolvedValue({
      excuses: [{ text: 'Test', tone: 'test', tip: 'test' }],
      tokens_remaining: 0,
    }),
  },
}))

vi.mock('../../api/fingerprint', () => ({
  getDeviceFingerprint: vi.fn().mockResolvedValue('test-device-123456'),
}))

const renderHomePage = () => {
  return render(
    <BrowserRouter>
      <HomePage />
    </BrowserRouter>
  )
}

describe('HomePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the home page', () => {
    renderHomePage()
    expect(screen.getByTestId('home-page')).toBeInTheDocument()
  })

  it('renders hero section', () => {
    renderHomePage()
    expect(screen.getByText('app.title')).toBeInTheDocument()
    expect(screen.getByText('app.tagline')).toBeInTheDocument()
    expect(screen.getByText('app.description')).toBeInTheDocument()
  })

  it('renders category selector', () => {
    renderHomePage()
    expect(screen.getByTestId('category-selector')).toBeInTheDocument()
  })

  it('renders urgency selector', () => {
    renderHomePage()
    expect(screen.getByTestId('urgency-selector')).toBeInTheDocument()
  })

  it('renders context input', () => {
    renderHomePage()
    expect(screen.getByTestId('context-input')).toBeInTheDocument()
  })

  it('renders generate button', () => {
    renderHomePage()
    expect(screen.getByTestId('generate-btn')).toBeInTheDocument()
  })

  it('renders token status', () => {
    renderHomePage()
    expect(screen.getByTestId('token-status')).toBeInTheDocument()
  })

  it('generate button is disabled when no category selected', () => {
    renderHomePage()
    expect(screen.getByTestId('generate-btn')).toBeDisabled()
  })
})
