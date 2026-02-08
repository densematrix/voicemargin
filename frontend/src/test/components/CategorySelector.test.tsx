import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { CategorySelector } from '../../components/CategorySelector'

describe('CategorySelector', () => {
  const mockOnSelect = vi.fn()

  beforeEach(() => {
    mockOnSelect.mockClear()
  })

  it('renders the selector', () => {
    render(<CategorySelector selected={null} onSelect={mockOnSelect} />)
    expect(screen.getByTestId('category-selector')).toBeInTheDocument()
  })

  it('renders title', () => {
    render(<CategorySelector selected={null} onSelect={mockOnSelect} />)
    expect(screen.getByText('categories.title')).toBeInTheDocument()
  })

  it('renders all 8 categories', () => {
    render(<CategorySelector selected={null} onSelect={mockOnSelect} />)
    
    expect(screen.getByTestId('category-late')).toBeInTheDocument()
    expect(screen.getByTestId('category-sick_leave')).toBeInTheDocument()
    expect(screen.getByTestId('category-decline')).toBeInTheDocument()
    expect(screen.getByTestId('category-forgot')).toBeInTheDocument()
    expect(screen.getByTestId('category-deadline')).toBeInTheDocument()
    expect(screen.getByTestId('category-meeting')).toBeInTheDocument()
    expect(screen.getByTestId('category-homework')).toBeInTheDocument()
    expect(screen.getByTestId('category-other')).toBeInTheDocument()
  })

  it('calls onSelect when category clicked', () => {
    render(<CategorySelector selected={null} onSelect={mockOnSelect} />)
    fireEvent.click(screen.getByTestId('category-late'))
    expect(mockOnSelect).toHaveBeenCalledWith('late')
  })

  it('shows selected state', () => {
    render(<CategorySelector selected="late" onSelect={mockOnSelect} />)
    const lateButton = screen.getByTestId('category-late')
    expect(lateButton).toHaveClass('selected')
  })

  it('does not show selected state for non-selected', () => {
    render(<CategorySelector selected="late" onSelect={mockOnSelect} />)
    const forgotButton = screen.getByTestId('category-forgot')
    expect(forgotButton).not.toHaveClass('selected')
  })
})
