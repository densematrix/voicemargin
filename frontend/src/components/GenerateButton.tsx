import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import './GenerateButton.css'

interface GenerateButtonProps {
  onClick: () => void
  disabled: boolean
  isLoading: boolean
}

export function GenerateButton({ onClick, disabled, isLoading }: GenerateButtonProps) {
  const { t } = useTranslation()

  return (
    <motion.button
      className={`generate-btn typewriter-key primary ${isLoading ? 'loading' : ''}`}
      onClick={onClick}
      disabled={disabled || isLoading}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      data-testid="generate-btn"
    >
      {isLoading ? (
        <span className="loading-text">
          {t('generator.generating')}
          <span className="typing-cursor">|</span>
        </span>
      ) : (
        t('generator.generate')
      )}
    </motion.button>
  )
}
