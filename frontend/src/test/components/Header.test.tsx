import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { describe, it, expect } from 'vitest'
import { Header } from '../../components/Header'

const renderHeader = () => {
  return render(
    <BrowserRouter>
      <Header />
    </BrowserRouter>
  )
}

describe('Header', () => {
  it('renders the header', () => {
    renderHeader()
    expect(screen.getByTestId('header')).toBeInTheDocument()
  })

  it('renders the logo', () => {
    renderHeader()
    expect(screen.getByText('app.title')).toBeInTheDocument()
  })

  it('renders navigation links', () => {
    renderHeader()
    expect(screen.getByTestId('nav-home')).toBeInTheDocument()
    expect(screen.getByTestId('nav-pricing')).toBeInTheDocument()
  })

  it('renders language switcher', () => {
    renderHeader()
    expect(screen.getByTestId('lang-switcher')).toBeInTheDocument()
  })

  it('home link points to /', () => {
    renderHeader()
    const homeLink = screen.getByTestId('nav-home')
    expect(homeLink).toHaveAttribute('href', '/')
  })

  it('pricing link points to /pricing', () => {
    renderHeader()
    const pricingLink = screen.getByTestId('nav-pricing')
    expect(pricingLink).toHaveAttribute('href', '/pricing')
  })
})
