import type { ExcuseCategory, UrgencyLevel, Excuse } from '../store/useExcuseStore'

const API_BASE = '/api'

export interface GenerateRequest {
  category: ExcuseCategory
  urgency: UrgencyLevel
  context: string
  language: string
  device_id: string
}

export interface GenerateResponse {
  excuses: Excuse[]
  category: ExcuseCategory
  urgency: UrgencyLevel
  tokens_remaining: number
}

export interface TokenStatus {
  device_id: string
  total_tokens: number
  used_tokens: number
  remaining_tokens: number
  free_trial_used: boolean
  is_unlimited: boolean
}

export interface CanGenerateResponse {
  can_generate: boolean
  free_trial_available: boolean
  tokens_remaining: number
  is_unlimited: boolean
}

export interface CheckoutRequest {
  product_type: 'pack_10' | 'pack_30' | 'unlimited'
  device_id: string
  success_url?: string
  cancel_url?: string
}

export interface CheckoutResponse {
  checkout_url: string
  session_id: string
}

export interface Product {
  id: string
  name: string
  tokens: number
  price: number
  currency: string
  description: string
  popular: boolean
}

export const excuseApi = {
  async generate(request: GenerateRequest): Promise<GenerateResponse> {
    const response = await fetch(`${API_BASE}/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.detail || 'Failed to generate excuses')
    }

    return response.json()
  },

  async getTokenStatus(deviceId: string): Promise<TokenStatus> {
    const response = await fetch(`${API_BASE}/tokens/${deviceId}`)

    if (!response.ok) {
      throw new Error('Failed to get token status')
    }

    return response.json()
  },

  async canGenerate(deviceId: string): Promise<CanGenerateResponse> {
    const response = await fetch(`${API_BASE}/tokens/${deviceId}/can-generate`)

    if (!response.ok) {
      throw new Error('Failed to check generation status')
    }

    return response.json()
  },

  async createCheckout(request: CheckoutRequest): Promise<CheckoutResponse> {
    const response = await fetch(`${API_BASE}/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.detail || 'Failed to create checkout')
    }

    return response.json()
  },

  async getProducts(): Promise<{ products: Product[] }> {
    const response = await fetch(`${API_BASE}/products`)

    if (!response.ok) {
      throw new Error('Failed to get products')
    }

    return response.json()
  },
}
