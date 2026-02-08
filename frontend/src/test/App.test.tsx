import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, it, expect, vi } from 'vitest'
import App from '../App'

// Mock all dependencies
vi.mock('../store/useExcuseStore', () => ({
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

vi.mock('../store/useTokenStore', () => ({
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

vi.mock('../api/excuseApi', () => ({
  excuseApi: {
    getTokenStatus: vi.fn().mockResolvedValue({}),
    getProducts: vi.fn().mockResolvedValue({ products: [] }),
  },
}))

vi.mock('../api/fingerprint', () => ({
  getDeviceFingerprint: vi.fn().mockResolvedValue('test-device-123456'),
}))

describe('App', () => {
  it('renders home page by default', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    )
    expect(screen.getByTestId('home-page')).toBeInTheDocument()
  })

  it('renders pricing page', () => {
    render(
      <MemoryRouter initialEntries={['/pricing']}>
        <App />
      </MemoryRouter>
    )
    expect(screen.getByTestId('pricing-page')).toBeInTheDocument()
  })

  it('renders success page', () => {
    render(
      <MemoryRouter initialEntries={['/payment/success']}>
        <App />
      </MemoryRouter>
    )
    expect(screen.getByTestId('success-page')).toBeInTheDocument()
  })

  it('renders header on all pages', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    )
    expect(screen.getByTestId('header')).toBeInTheDocument()
  })

  it('renders footer on all pages', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    )
    expect(screen.getByTestId('footer')).toBeInTheDocument()
  })
})
