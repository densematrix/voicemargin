import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { PaymentSuccessPage } from '../../pages/PaymentSuccessPage'

vi.mock('../../store/useTokenStore', () => ({
  useTokenStore: () => ({
    deviceId: 'test-device-123456',
    setTokenStatus: vi.fn(),
    getRemainingTokens: () => 10,
    isUnlimited: false,
  }),
}))

vi.mock('../../api/excuseApi', () => ({
  excuseApi: {
    getTokenStatus: vi.fn().mockResolvedValue({
      total_tokens: 10,
      used_tokens: 0,
      free_trial_used: true,
      is_unlimited: false,
    }),
  },
}))

const renderSuccessPage = () => {
  return render(
    <BrowserRouter>
      <PaymentSuccessPage />
    </BrowserRouter>
  )
}

describe('PaymentSuccessPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders the success page', () => {
    renderSuccessPage()
    expect(screen.getByTestId('success-page')).toBeInTheDocument()
  })

  it('renders success title', () => {
    renderSuccessPage()
    expect(screen.getByText('success.title')).toBeInTheDocument()
  })

  it('renders success message', () => {
    renderSuccessPage()
    expect(screen.getByText('success.message')).toBeInTheDocument()
  })

  it('renders back to home link', () => {
    renderSuccessPage()
    expect(screen.getByTestId('back-home')).toBeInTheDocument()
  })

  it('back to home link points to /', () => {
    renderSuccessPage()
    expect(screen.getByTestId('back-home')).toHaveAttribute('href', '/')
  })
})

describe('PaymentSuccessPage - Unlimited', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.doMock('../../store/useTokenStore', () => ({
      useTokenStore: () => ({
        deviceId: 'test-device-123456',
        setTokenStatus: vi.fn(),
        getRemainingTokens: () => 999999,
        isUnlimited: true,
      }),
    }))
  })

  it('renders success page for unlimited', () => {
    renderSuccessPage()
    expect(screen.getByTestId('success-page')).toBeInTheDocument()
  })
})
