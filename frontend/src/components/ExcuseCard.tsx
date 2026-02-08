import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import type { Excuse } from '../store/useExcuseStore'
import './ExcuseCard.css'

interface ExcuseCardProps {
  excuse: Excuse
  index: number
}

export function ExcuseCard({ excuse, index }: ExcuseCardProps) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(excuse.text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <motion.div
      className="excuse-card paper-card"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15, duration: 0.3 }}
      data-testid={`excuse-card-${index}`}
    >
      <div className="excuse-number">#{index + 1}</div>
      <p className="excuse-text" data-testid="excuse-text">{excuse.text}</p>
      
      <div className="excuse-meta">
        <span className="excuse-tone">
          <strong>{t('excuse.tone')}:</strong> {excuse.tone}
        </span>
        {excuse.tip && (
          <span className="excuse-tip">
            <strong>{t('excuse.tip')}:</strong> {excuse.tip}
          </span>
        )}
      </div>

      <button
        className="copy-btn typewriter-key"
        onClick={handleCopy}
        data-testid="copy-btn"
      >
        {copied ? t('generator.copied') : t('generator.copy')}
      </button>
    </motion.div>
  )
}
