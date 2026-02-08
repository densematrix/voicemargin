import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { ExcuseCard } from '../../components/ExcuseCard'

const mockExcuse = {
  text: 'My dog ate my homework',
  tone: 'apologetic',
  tip: 'Look sincere',
}

describe('ExcuseCard', () => {
  it('renders the card', () => {
    render(<ExcuseCard excuse={mockExcuse} index={0} />)
    expect(screen.getByTestId('excuse-card-0')).toBeInTheDocument()
  })

  it('displays excuse text', () => {
    render(<ExcuseCard excuse={mockExcuse} index={0} />)
    expect(screen.getByText('My dog ate my homework')).toBeInTheDocument()
  })

  it('displays tone', () => {
    render(<ExcuseCard excuse={mockExcuse} index={0} />)
    expect(screen.getByText('apologetic')).toBeInTheDocument()
  })

  it('displays tip', () => {
    render(<ExcuseCard excuse={mockExcuse} index={0} />)
    expect(screen.getByText('Look sincere')).toBeInTheDocument()
  })

  it('displays correct number', () => {
    render(<ExcuseCard excuse={mockExcuse} index={2} />)
    expect(screen.getByText('#3')).toBeInTheDocument()
  })

  it('has copy button', () => {
    render(<ExcuseCard excuse={mockExcuse} index={0} />)
    expect(screen.getByTestId('copy-btn')).toBeInTheDocument()
  })

  it('copies text when copy button clicked', async () => {
    render(<ExcuseCard excuse={mockExcuse} index={0} />)
    fireEvent.click(screen.getByTestId('copy-btn'))
    
    await waitFor(() => {
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith('My dog ate my homework')
    })
  })

  it('shows copied state after copying', async () => {
    render(<ExcuseCard excuse={mockExcuse} index={0} />)
    fireEvent.click(screen.getByTestId('copy-btn'))
    
    await waitFor(() => {
      expect(screen.getByText('generator.copied')).toBeInTheDocument()
    })
  })

  it('handles empty tip', () => {
    const excuseNoTip = { ...mockExcuse, tip: '' }
    render(<ExcuseCard excuse={excuseNoTip} index={0} />)
    expect(screen.queryByText('excuse.tip')).not.toBeInTheDocument()
  })
})
