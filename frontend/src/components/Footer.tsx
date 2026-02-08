import { useTranslation } from 'react-i18next'
import './Footer.css'

export function Footer() {
  const { t } = useTranslation()

  return (
    <footer className="footer" data-testid="footer">
      <div className="container footer-content">
        <p className="footer-tagline">{t('footer.tagline')}</p>
        <p className="footer-powered">{t('footer.powered')}</p>
        <p className="footer-disclaimer">{t('footer.disclaimer')}</p>
      </div>
    </footer>
  )
}
