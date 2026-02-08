import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { Footer } from '../../components/Footer'

describe('Footer', () => {
  it('renders the footer', () => {
    render(<Footer />)
    expect(screen.getByTestId('footer')).toBeInTheDocument()
  })

  it('renders tagline', () => {
    render(<Footer />)
    expect(screen.getByText('footer.tagline')).toBeInTheDocument()
  })

  it('renders powered text', () => {
    render(<Footer />)
    expect(screen.getByText('footer.powered')).toBeInTheDocument()
  })

  it('renders disclaimer', () => {
    render(<Footer />)
    expect(screen.getByText('footer.disclaimer')).toBeInTheDocument()
  })
})
