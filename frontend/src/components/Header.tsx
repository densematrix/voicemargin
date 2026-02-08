import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import { LanguageSwitcher } from './LanguageSwitcher'
import './Header.css'

export function Header() {
  const { t } = useTranslation()
  const location = useLocation()

  return (
    <header className="header" data-testid="header">
      <div className="container header-content">
        <Link to="/" className="logo">
          <span className="logo-icon">⌨️</span>
          <span className="logo-text">{t('app.title')}</span>
        </Link>

        <nav className="nav">
          <Link
            to="/"
            className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}
            data-testid="nav-home"
          >
            {t('nav.home')}
          </Link>
          <Link
            to="/pricing"
            className={`nav-link ${location.pathname === '/pricing' ? 'active' : ''}`}
            data-testid="nav-pricing"
          >
            {t('nav.pricing')}
          </Link>
          <LanguageSwitcher />
        </nav>
      </div>
    </header>
  )
}
