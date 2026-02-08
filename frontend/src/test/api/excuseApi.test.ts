import { describe, it, expect, vi, beforeEach } from 'vitest'
import { excuseApi } from '../../api/excuseApi'

// Mock fetch
global.fetch = vi.fn()

const mockFetch = global.fetch as ReturnType<typeof vi.fn>

describe('excuseApi', () => {
  beforeEach(() => {
    mockFetch.mockClear()
  })

  describe('generate', () => {
    it('sends correct request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          excuses: [{ text: 'Test', tone: 'test', tip: 'test' }],
          category: 'late',
          urgency: 'normal',
          tokens_remaining: 5,
        }),
      })

      await excuseApi.generate({
        category: 'late',
        urgency: 'normal',
        context: '',
        language: 'en',
        device_id: 'test-device',
      })

      expect(mockFetch).toHaveBeenCalledWith(
        '/api/generate',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      )
    })

    it('throws on error response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ detail: 'No tokens' }),
      })

      await expect(excuseApi.generate({
        category: 'late',
        urgency: 'normal',
        context: '',
        language: 'en',
        device_id: 'test-device',
      })).rejects.toThrow('No tokens')
    })
  })

  describe('getTokenStatus', () => {
    it('fetches token status', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          device_id: 'test',
          total_tokens: 10,
          used_tokens: 0,
          remaining_tokens: 10,
          free_trial_used: false,
          is_unlimited: false,
        }),
      })

      const result = await excuseApi.getTokenStatus('test-device')

      expect(mockFetch).toHaveBeenCalledWith('/api/tokens/test-device')
      expect(result.total_tokens).toBe(10)
    })

    it('throws on error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      })

      await expect(excuseApi.getTokenStatus('test')).rejects.toThrow()
    })
  })

  describe('canGenerate', () => {
    it('fetches can generate status', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          can_generate: true,
          free_trial_available: true,
          tokens_remaining: 0,
          is_unlimited: false,
        }),
      })

      const result = await excuseApi.canGenerate('test-device')

      expect(result.can_generate).toBe(true)
    })
  })

  describe('createCheckout', () => {
    it('creates checkout session', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          checkout_url: 'https://checkout.test',
          session_id: 'session-123',
        }),
      })

      const result = await excuseApi.createCheckout({
        product_type: 'pack_10',
        device_id: 'test-device',
      })

      expect(result.checkout_url).toBe('https://checkout.test')
    })

    it('throws on error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        json: () => Promise.resolve({ detail: 'Invalid product' }),
      })

      await expect(excuseApi.createCheckout({
        product_type: 'pack_10',
        device_id: 'test',
      })).rejects.toThrow('Invalid product')
    })
  })

  describe('getProducts', () => {
    it('fetches products', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          products: [
            { id: 'pack_10', name: '10 Pack', price: 4.99 },
          ],
        }),
      })

      const result = await excuseApi.getProducts()

      expect(result.products).toHaveLength(1)
      expect(result.products[0].id).toBe('pack_10')
    })

    it('throws on error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
      })

      await expect(excuseApi.getProducts()).rejects.toThrow()
    })
  })
})
