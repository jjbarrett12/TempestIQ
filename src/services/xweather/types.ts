export interface XweatherConfig {
  apiKey: string
  baseUrl?: string
}

export interface XweatherResponse<T> {
  data: T
  headers: {
    'x-cost-tokens'?: string
    'x-ratelimit-remaining'?: string
  }
}

export interface Alert {
  id: string
  type: string
  severity: string
  headline: string
  description: string
  area: {
    type: string
    coordinates: number[][]
  }
  effective: string
  expires: string
  status: string
  urgency: string
  certainty: string
}

export interface HailThreat {
  id: string
  latitude: number
  longitude: number
  probability: number // 0-1
  intensity: number // Expected hail size in inches
  startTime: string
  endTime: string
  radiusMiles: number
}

export interface StormThreat {
  id: string
  latitude: number
  longitude: number
  type: 'rotation' | 'hail' | 'wind' | 'lightning'
  severity: 'low' | 'moderate' | 'high' | 'extreme'
  startTime: string
  endTime: string
  geometry: {
    type: string
    coordinates: number[][]
  }
}
