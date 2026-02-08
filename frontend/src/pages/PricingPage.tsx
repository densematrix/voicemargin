import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { motion } from 'framer-motion'
import { useTokenStore } from '../store/useTokenStore'
import { excuseApi } from '../api/excuseApi'
import type { Product } from '../api/excuseApi'
import { getDeviceFingerprint } from '../api/fingerprint'
import './PricingPage.css'

export function PricingPage() {
  const { t } = useTranslation()
  const { deviceId, setDeviceId } = useTokenStore()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
      // Ensure device ID
      if (!deviceId) {
        const fp = await getDeviceFingerprint()
        setDeviceId(fp)
      }

      // Fetch products
      try {
        const response = await excuseApi.getProducts()
        setProducts(response.products)
      } catch (err) {
        console.error('Failed to load products:', err)
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [deviceId, setDeviceId])

  const handlePurchase = async (productId: string) => {
    if (!deviceId) return

    setCheckoutLoading(productId)
    try {
      const response = await excuseApi.createCheckout({
        product_type: productId as 'pack_10' | 'pack_30' | 'unlimited',
        device_id: deviceId,
        success_url: `${window.location.origin}/payment/success`,
        cancel_url: `${window.location.origin}/pricing`,
      })
      window.location.href = response.checkout_url
    } catch (err) {
      console.error('Checkout failed:', err)
      setCheckoutLoading(null)
    }
  }

  const getProductTranslation = (productId: string) => {
    const key = productId === 'pack_10' ? 'pack10' : productId === 'pack_30' ? 'pack30' : 'unlimited'
    return {
      name: t(`pricing.${key}.name`),
      excuses: t(`pricing.${key}.excuses`),
      description: t(`pricing.${key}.description`),
      popular: key === 'pack30' ? t(`pricing.${key}.popular`) : null,
    }
  }

  return (
    <div className="pricing-page container" data-testid="pricing-page">
      <motion.div
        className="pricing-header"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="pricing-title">{t('pricing.title')}</h1>
        <p className="pricing-subtitle">{t('pricing.subtitle')}</p>
      </motion.div>

      {loading ? (
        <div className="loading-state">Loading...</div>
      ) : (
        <div className="pricing-grid">
          {products.map((product, index) => {
            const trans = getProductTranslation(product.id)
            return (
              <motion.div
                key={product.id}
                className={`pricing-card paper-card ${product.popular ? 'popular' : ''}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                data-testid={`pricing-card-${product.id}`}
              >
                {product.popular && (
                  <div className="popular-badge">{trans.popular}</div>
                )}
                <h3 className="product-name">{trans.name}</h3>
                <div className="product-excuses">{trans.excuses}</div>
                <div className="product-price">
                  <span className="price-currency">$</span>
                  <span className="price-amount">{product.price.toFixed(2)}</span>
                </div>
                <p className="product-description">{trans.description}</p>
                <button
                  className="purchase-btn typewriter-key primary"
                  onClick={() => handlePurchase(product.id)}
                  disabled={checkoutLoading !== null}
                  data-testid={`purchase-${product.id}`}
                >
                  {checkoutLoading === product.id ? '...' : t('pricing.buy')}
                </button>
              </motion.div>
            )
          })}
        </div>
      )}

      <p className="secure-notice">{t('pricing.secure')}</p>
    </div>
  )
}
