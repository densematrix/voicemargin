import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { GenerateButton } from '../../components/GenerateButton'

describe('GenerateButton', () => {
  const mockOnClick = vi.fn()

  beforeEach(() => {
    mockOnClick.mockClear()
  })

  it('renders the button', () => {
    render(<GenerateButton onClick={mockOnClick} disabled={false} isLoading={false} />)
    expect(screen.getByTestId('generate-btn')).toBeInTheDocument()
  })

  it('displays generate text when not loading', () => {
    render(<GenerateButton onClick={mockOnClick} disabled={false} isLoading={false} />)
    expect(screen.getByText('generator.generate')).toBeInTheDocument()
  })

  it('displays loading text when loading', () => {
    render(<GenerateButton onClick={mockOnClick} disabled={false} isLoading={true} />)
    expect(screen.getByText('generator.generating')).toBeInTheDocument()
  })

  it('calls onClick when clicked', () => {
    render(<GenerateButton onClick={mockOnClick} disabled={false} isLoading={false} />)
    fireEvent.click(screen.getByTestId('generate-btn'))
    expect(mockOnClick).toHaveBeenCalled()
  })

  it('is disabled when disabled prop is true', () => {
    render(<GenerateButton onClick={mockOnClick} disabled={true} isLoading={false} />)
    expect(screen.getByTestId('generate-btn')).toBeDisabled()
  })

  it('is disabled when loading', () => {
    render(<GenerateButton onClick={mockOnClick} disabled={false} isLoading={true} />)
    expect(screen.getByTestId('generate-btn')).toBeDisabled()
  })

  it('does not call onClick when disabled', () => {
    render(<GenerateButton onClick={mockOnClick} disabled={true} isLoading={false} />)
    fireEvent.click(screen.getByTestId('generate-btn'))
    expect(mockOnClick).not.toHaveBeenCalled()
  })
})
