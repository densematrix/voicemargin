import { useTranslation } from 'react-i18next'
import type { UrgencyLevel } from '../store/useExcuseStore'
import './UrgencySelector.css'

const urgencyLevels: { id: UrgencyLevel; icon: string }[] = [
  { id: 'normal', icon: '😊' },
  { id: 'urgent', icon: '😰' },
  { id: 'extreme', icon: '🤯' },
]

interface UrgencySelectorProps {
  selected: UrgencyLevel
  onSelect: (urgency: UrgencyLevel) => void
}

export function UrgencySelector({ selected, onSelect }: UrgencySelectorProps) {
  const { t } = useTranslation()

  return (
    <div className="urgency-selector" data-testid="urgency-selector">
      <h3 className="urgency-title">{t('urgency.title')}</h3>
      <div className="urgency-options">
        {urgencyLevels.map((level) => (
          <button
            key={level.id}
            className={`urgency-btn ${selected === level.id ? 'selected' : ''}`}
            onClick={() => onSelect(level.id)}
            data-testid={`urgency-${level.id}`}
          >
            <span className="urgency-icon">{level.icon}</span>
            <span className="urgency-label">{t(`urgency.${level.id}`)}</span>
            <span className="urgency-desc">{t(`urgency.${level.id}Desc`)}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
