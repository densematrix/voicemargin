import { useEffect, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { CategorySelector } from '../components/CategorySelector'
import { UrgencySelector } from '../components/UrgencySelector'
import { GenerateButton } from '../components/GenerateButton'
import { ExcuseCard } from '../components/ExcuseCard'
import { TokenStatus } from '../components/TokenStatus'
import { useExcuseStore } from '../store/useExcuseStore'
import { useTokenStore } from '../store/useTokenStore'
import { excuseApi } from '../api/excuseApi'
import { getDeviceFingerprint } from '../api/fingerprint'
import './HomePage.css'

export function HomePage() {
  const { t, i18n } = useTranslation()
  const {
    category,
    urgency,
    context,
    excuses,
    isLoading,
    error,
    setCategory,
    setUrgency,
    setContext,
    setExcuses,
    setLoading,
    setError,
  } = useExcuseStore()

  const { deviceId, setDeviceId, setTokenStatus, canGenerate } = useTokenStore()

  // Initialize device fingerprint
  useEffect(() => {
    const initFingerprint = async () => {
      if (!deviceId) {
        const fp = await getDeviceFingerprint()
        setDeviceId(fp)
      }
    }
    initFingerprint()
  }, [deviceId, setDeviceId])

  // Fetch token status on mount
  useEffect(() => {
    const fetchTokenStatus = async () => {
      if (deviceId) {
        try {
          const status = await excuseApi.getTokenStatus(deviceId)
          setTokenStatus(status)
        } catch (err) {
          // Ignore errors - new device will have default status
        }
      }
    }
    fetchTokenStatus()
  }, [deviceId, setTokenStatus])

  const handleGenerate = useCallback(async () => {
    if (!category || !deviceId) return
    if (!canGenerate()) {
      setError(t('errors.noTokens'))
      return
    }

    setLoading(true)
    try {
      const response = await excuseApi.generate({
        category,
        urgency,
        context,
        language: i18n.language,
        device_id: deviceId,
      })
      setExcuses(response.excuses, response.tokens_remaining)

      // Refresh token status
      const status = await excuseApi.getTokenStatus(deviceId)
      setTokenStatus(status)
    } catch (err) {
      const message = err instanceof Error ? err.message : t('errors.generic')
      setError(message)
    }
  }, [category, urgency, context, deviceId, i18n.language, canGenerate, setLoading, setExcuses, setError, setTokenStatus, t])

  return (
    <div className="home-page container" data-testid="home-page">
      <motion.div
        className="hero"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="hero-title">{t('app.title')}</h1>
        <p className="hero-tagline">{t('app.tagline')}</p>
        <p className="hero-description">{t('app.description')}</p>
      </motion.div>

      <div className="generator-section paper-card">
        <TokenStatus />
        <CategorySelector selected={category} onSelect={setCategory} />
        <UrgencySelector selected={urgency} onSelect={setUrgency} />

        <div className="context-input">
          <textarea
            className="context-textarea"
            placeholder={t('generator.contextPlaceholder')}
            value={context}
            onChange={(e) => setContext(e.target.value)}
            maxLength={500}
            data-testid="context-input"
          />
        </div>

        <GenerateButton
          onClick={handleGenerate}
          disabled={!category || !canGenerate()}
          isLoading={isLoading}
        />

        {error && (
          <div className="error-message" data-testid="error-message">
            {error}
          </div>
        )}
      </div>

      {excuses.length > 0 && (
        <motion.div
          className="results-section"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          data-testid="results-section"
        >
          <h2 className="results-title">Your Excuses</h2>
          {excuses.map((excuse, index) => (
            <ExcuseCard key={index} excuse={excuse} index={index} />
          ))}
        </motion.div>
      )}
    </div>
  )
}
