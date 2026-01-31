import axios, { AxiosInstance, AxiosResponse } from 'axios'
import { XweatherConfig, XweatherResponse, Alert, HailThreat } from './types'

export class XweatherClient {
  private client: AxiosInstance
  private config: XweatherConfig

  constructor(config: XweatherConfig) {
    this.config = config
    this.client = axios.create({
      baseURL: config.baseUrl || 'https://api.xweather.com',
      headers: {
        'Authorization': `Bearer ${config.apiKey}`,
        'Accept': 'application/json',
      },
    })
  }

  private async request<T>(
    endpoint: string,
    params?: Record<string, any>
  ): Promise<XweatherResponse<T>> {
    const response: AxiosResponse<T> = await this.client.get(endpoint, { params })
    
    return {
      data: response.data,
      headers: {
        'x-cost-tokens': response.headers['x-cost-tokens'],
        'x-ratelimit-remaining': response.headers['x-ratelimit-remaining'],
      },
    }
  }

  /**
   * Fetch active alerts (tornado warnings, severe storm warnings, etc.)
   * @param params - Query parameters (country, state, etc.)
   */
  async getAlerts(params?: {
    country?: string
    state?: string
    alertType?: string
  }): Promise<XweatherResponse<{ alerts: Alert[] }>> {
    return this.request<{ alerts: Alert[] }>('/alerts', params)
  }

  /**
   * Fetch hail threats (nowcast 0-60 minutes ahead)
   * @param params - Query parameters (lat, lon, radius, etc.)
   */
  async getHailThreats(params: {
    latitude: number
    longitude: number
    radius?: number // miles
  }): Promise<XweatherResponse<{ threats: HailThreat[] }>> {
    return this.request<{ threats: HailThreat[] }>('/hail/threats', {
      ...params,
      radius: params.radius || 25, // Default 25 miles
    })
  }

  /**
   * Fetch storm threats (rotation, severe signatures)
   * @param params - Query parameters
   */
  async getStormThreats(params: {
    latitude: number
    longitude: number
    radius?: number
  }): Promise<XweatherResponse<{ threats: any[] }>> {
    return this.request<{ threats: any[] }>('/storm/threats', {
      ...params,
      radius: params.radius || 25,
    })
  }
}

// Singleton instance
let xweatherClient: XweatherClient | null = null

export const getXweatherClient = (): XweatherClient => {
  if (!xweatherClient) {
    const apiKey = process.env.XWEATHER_API_KEY
    if (!apiKey) {
      throw new Error('XWEATHER_API_KEY is not set')
    }
    xweatherClient = new XweatherClient({
      apiKey,
      baseUrl: process.env.XWEATHER_BASE_URL,
    })
  }
  return xweatherClient
}
