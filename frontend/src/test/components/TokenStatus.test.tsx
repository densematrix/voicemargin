import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TokenStatus } from '../../components/TokenStatus'
import { useTokenStore } from '../../store/useTokenStore'

// Mock the token store
vi.mock('../../store/useTokenStore', () => ({
  useTokenStore: vi.fn(),
}))

const mockUseTokenStore = useTokenStore as unknown as ReturnType<typeof vi.fn>

const renderTokenStatus = () => {
  return render(
    <BrowserRouter>
      <TokenStatus />
    </BrowserRouter>
  )
}

describe('TokenStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows free trial badge when not used', () => {
    mockUseTokenStore.mockReturnValue({
      freeTrialUsed: false,
      isUnlimited: false,
      canGenerate: () => true,
      getRemainingTokens: () => 0,
    })
    
    renderTokenStatus()
    expect(screen.getByText('generator.freeTrial')).toBeInTheDocument()
  })

  it('shows unlimited badge when unlimited', () => {
    mockUseTokenStore.mockReturnValue({
      freeTrialUsed: true,
      isUnlimited: true,
      canGenerate: () => true,
      getRemainingTokens: () => 999999,
    })
    
    renderTokenStatus()
    expect(screen.getByText('∞ Unlimited')).toBeInTheDocument()
  })

  it('shows no tokens warning when out of tokens', () => {
    mockUseTokenStore.mockReturnValue({
      freeTrialUsed: true,
      isUnlimited: false,
      canGenerate: () => false,
      getRemainingTokens: () => 0,
    })
    
    renderTokenStatus()
    expect(screen.getByText('generator.noTokens')).toBeInTheDocument()
  })

  it('shows buy more link when out of tokens', () => {
    mockUseTokenStore.mockReturnValue({
      freeTrialUsed: true,
      isUnlimited: false,
      canGenerate: () => false,
      getRemainingTokens: () => 0,
    })
    
    renderTokenStatus()
    expect(screen.getByText('generator.buyMore')).toBeInTheDocument()
  })

  it('shows remaining tokens when has tokens', () => {
    mockUseTokenStore.mockReturnValue({
      freeTrialUsed: true,
      isUnlimited: false,
      canGenerate: () => true,
      getRemainingTokens: () => 5,
    })
    
    renderTokenStatus()
    expect(screen.getByText('generator.tokensRemaining')).toBeInTheDocument()
  })
})
