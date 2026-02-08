import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { UrgencySelector } from '../../components/UrgencySelector'

describe('UrgencySelector', () => {
  const mockOnSelect = vi.fn()

  beforeEach(() => {
    mockOnSelect.mockClear()
  })

  it('renders the selector', () => {
    render(<UrgencySelector selected="normal" onSelect={mockOnSelect} />)
    expect(screen.getByTestId('urgency-selector')).toBeInTheDocument()
  })

  it('renders title', () => {
    render(<UrgencySelector selected="normal" onSelect={mockOnSelect} />)
    expect(screen.getByText('urgency.title')).toBeInTheDocument()
  })

  it('renders all 3 urgency levels', () => {
    render(<UrgencySelector selected="normal" onSelect={mockOnSelect} />)
    
    expect(screen.getByTestId('urgency-normal')).toBeInTheDocument()
    expect(screen.getByTestId('urgency-urgent')).toBeInTheDocument()
    expect(screen.getByTestId('urgency-extreme')).toBeInTheDocument()
  })

  it('calls onSelect when level clicked', () => {
    render(<UrgencySelector selected="normal" onSelect={mockOnSelect} />)
    fireEvent.click(screen.getByTestId('urgency-urgent'))
    expect(mockOnSelect).toHaveBeenCalledWith('urgent')
  })

  it('shows selected state', () => {
    render(<UrgencySelector selected="urgent" onSelect={mockOnSelect} />)
    const urgentButton = screen.getByTestId('urgency-urgent')
    expect(urgentButton).toHaveClass('selected')
  })

  it('does not show selected state for non-selected', () => {
    render(<UrgencySelector selected="normal" onSelect={mockOnSelect} />)
    const urgentButton = screen.getByTestId('urgency-urgent')
    expect(urgentButton).not.toHaveClass('selected')
  })
})
