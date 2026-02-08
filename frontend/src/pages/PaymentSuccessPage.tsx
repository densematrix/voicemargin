import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useTokenStore } from '../store/useTokenStore'
import { excuseApi } from '../api/excuseApi'
import './PaymentSuccessPage.css'

export function PaymentSuccessPage() {
  const { t } = useTranslation()
  const { deviceId, setTokenStatus, getRemainingTokens, isUnlimited } = useTokenStore()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStatus = async () => {
      if (deviceId) {
        try {
          const status = await excuseApi.getTokenStatus(deviceId)
          setTokenStatus(status)
        } catch (err) {
          console.error('Failed to fetch token status:', err)
        }
      }
      setLoading(false)
    }
    fetchStatus()
  }, [deviceId, setTokenStatus])

  const remaining = getRemainingTokens()

  return (
    <div className="success-page container" data-testid="success-page">
      <motion.div
        className="success-content paper-card"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="success-icon">✓</div>
        <h1 className="success-title">{t('success.title')}</h1>
        <p className="success-message">{t('success.message')}</p>

        {!loading && (
          <div className="success-details">
            {isUnlimited ? (
              <p className="tokens-info unlimited">{t('success.unlimitedActivated')}</p>
            ) : (
              <p className="tokens-info">
                {t('success.tokensAdded', { count: remaining })}
              </p>
            )}
          </div>
        )}

        <Link to="/" className="home-btn typewriter-key primary" data-testid="back-home">
          {t('success.backToHome')}
        </Link>
      </motion.div>
    </div>
  )
}
