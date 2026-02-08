import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useTokenStore } from '../store/useTokenStore'
import './TokenStatus.css'

export function TokenStatus() {
  const { t } = useTranslation()
  const { freeTrialUsed, isUnlimited, canGenerate, getRemainingTokens } = useTokenStore()

  const remaining = getRemainingTokens()
  const canGen = canGenerate()

  if (isUnlimited) {
    return (
      <div className="token-status unlimited" data-testid="token-status">
        <span className="token-badge">∞ Unlimited</span>
      </div>
    )
  }

  if (!freeTrialUsed) {
    return (
      <div className="token-status free-trial" data-testid="token-status">
        <span className="token-badge">{t('generator.freeTrial')}</span>
      </div>
    )
  }

  if (!canGen) {
    return (
      <div className="token-status no-tokens" data-testid="token-status">
        <span className="token-warning">{t('generator.noTokens')}</span>
        <Link to="/pricing" className="buy-link typewriter-key primary">
          {t('generator.buyMore')}
        </Link>
      </div>
    )
  }

  return (
    <div className="token-status" data-testid="token-status">
      <span className="token-count">
        {t('generator.tokensRemaining', { count: remaining })}
      </span>
    </div>
  )
}
