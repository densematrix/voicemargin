import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { LanguageSwitcher } from '../../components/LanguageSwitcher'

describe('LanguageSwitcher', () => {
  it('renders the language button', () => {
    render(<LanguageSwitcher />)
    expect(screen.getByTestId('lang-button')).toBeInTheDocument()
  })

  it('shows dropdown when clicked', () => {
    render(<LanguageSwitcher />)
    const button = screen.getByTestId('lang-button')
    fireEvent.click(button)
    expect(screen.getByTestId('lang-dropdown')).toBeInTheDocument()
  })

  it('hides dropdown when clicked again', () => {
    render(<LanguageSwitcher />)
    const button = screen.getByTestId('lang-button')
    fireEvent.click(button)
    expect(screen.getByTestId('lang-dropdown')).toBeInTheDocument()
    fireEvent.click(button)
    expect(screen.queryByTestId('lang-dropdown')).not.toBeInTheDocument()
  })

  it('shows all 7 language options', () => {
    render(<LanguageSwitcher />)
    fireEvent.click(screen.getByTestId('lang-button'))
    
    expect(screen.getByTestId('lang-option-en')).toBeInTheDocument()
    expect(screen.getByTestId('lang-option-zh')).toBeInTheDocument()
    expect(screen.getByTestId('lang-option-ja')).toBeInTheDocument()
    expect(screen.getByTestId('lang-option-de')).toBeInTheDocument()
    expect(screen.getByTestId('lang-option-fr')).toBeInTheDocument()
    expect(screen.getByTestId('lang-option-ko')).toBeInTheDocument()
    expect(screen.getByTestId('lang-option-es')).toBeInTheDocument()
  })

  it('closes dropdown when language selected', () => {
    render(<LanguageSwitcher />)
    fireEvent.click(screen.getByTestId('lang-button'))
    fireEvent.click(screen.getByTestId('lang-option-zh'))
    expect(screen.queryByTestId('lang-dropdown')).not.toBeInTheDocument()
  })
})
