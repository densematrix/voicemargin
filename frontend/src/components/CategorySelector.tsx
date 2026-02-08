import { useTranslation } from 'react-i18next'
import type { ExcuseCategory } from '../store/useExcuseStore'
import './CategorySelector.css'

const categories: { id: ExcuseCategory; icon: string }[] = [
  { id: 'late', icon: '⏰' },
  { id: 'sick_leave', icon: '🤒' },
  { id: 'decline', icon: '🙅' },
  { id: 'forgot', icon: '🤔' },
  { id: 'deadline', icon: '📅' },
  { id: 'meeting', icon: '📋' },
  { id: 'homework', icon: '📚' },
  { id: 'other', icon: '💭' },
]

interface CategorySelectorProps {
  selected: ExcuseCategory | null
  onSelect: (category: ExcuseCategory) => void
}

export function CategorySelector({ selected, onSelect }: CategorySelectorProps) {
  const { t } = useTranslation()

  return (
    <div className="category-selector" data-testid="category-selector">
      <h3 className="category-title">{t('categories.title')}</h3>
      <div className="category-grid">
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={`category-btn ${selected === cat.id ? 'selected' : ''}`}
            onClick={() => onSelect(cat.id)}
            data-testid={`category-${cat.id}`}
          >
            <span className="category-icon">{cat.icon}</span>
            <span className="category-label">{t(`categories.${cat.id}`)}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
