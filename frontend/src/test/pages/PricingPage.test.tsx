import { render, screen, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PricingPage } from '../../pages/PricingPage'

vi.mock('../../store/useTokenStore', () => ({
  useTokenStore: () => ({
    deviceId: 'test-device-123456',
    setDeviceId: vi.fn(),
  }),
}))

vi.mock('../../api/excuseApi', () => ({
  excuseApi: {
    getProducts: vi.fn().mockResolvedValue({
      products: [
        { id: 'pack_10', name: '10 Pack', tokens: 10, price: 4.99, currency: 'USD', description: 'Test', popular: false },
        { id: 'pack_30', name: '30 Pack', tokens: 30, price: 9.99, currency: 'USD', description: 'Test', popular: true },
        { id: 'unlimited', name: 'Unlimited', tokens: -1, price: 14.99, currency: 'USD', description: 'Test', popular: false },
      ],
    }),
    createCheckout: vi.fn().mockResolvedValue({
      checkout_url: 'https://checkout.test',
      session_id: 'test-session',
    }),
  },
}))

vi.mock('../../api/fingerprint', () => ({
  getDeviceFingerprint: vi.fn().mockResolvedValue('test-device-123456'),
}))

const renderPricingPage = () => {
  return render(
    <BrowserRouter>
      <PricingPage />
    </BrowserRouter>
  )
}

describe('PricingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the pricing page', () => {
    renderPricingPage()
    expect(screen.getByTestId('pricing-page')).toBeInTheDocument()
  })

  it('renders title', () => {
    renderPricingPage()
    expect(screen.getByText('pricing.title')).toBeInTheDocument()
  })

  it('renders subtitle', () => {
    renderPricingPage()
    expect(screen.getByText('pricing.subtitle')).toBeInTheDocument()
  })

  it('renders loading state initially', () => {
    renderPricingPage()
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  it('renders product cards after loading', async () => {
    renderPricingPage()
    
    await waitFor(() => {
      expect(screen.getByTestId('pricing-card-pack_10')).toBeInTheDocument()
      expect(screen.getByTestId('pricing-card-pack_30')).toBeInTheDocument()
      expect(screen.getByTestId('pricing-card-unlimited')).toBeInTheDocument()
    })
  })

  it('renders secure notice', () => {
    renderPricingPage()
    expect(screen.getByText('pricing.secure')).toBeInTheDocument()
  })

  it('renders purchase buttons', async () => {
    renderPricingPage()
    
    await waitFor(() => {
      expect(screen.getByTestId('purchase-pack_10')).toBeInTheDocument()
      expect(screen.getByTestId('purchase-pack_30')).toBeInTheDocument()
      expect(screen.getByTestId('purchase-unlimited')).toBeInTheDocument()
    })
  })
})
