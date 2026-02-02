/**
 * NOAA NWS Local Storm Report (LSR) types
 * @see https://mapservices.weather.noaa.gov/vector/rest/services/obs/nws_local_storm_reports/MapServer
 */

export interface NoaaLsrFeature {
  attributes: {
    objectid: number
    wfo_id: string
    wfo: string
    lsr_validtime: number // epoch ms
    descript: string
    loc_desc: string
    state: string
    magnitude: string | null
    units: string | null
    remarks: string | null
    valid_time: string
  }
  geometry: {
    x: number // longitude
    y: number // latitude
  }
}

export interface NoaaLsrQueryResponse {
  features: NoaaLsrFeature[]
  exceededTransferLimit?: boolean
}

/** Severe weather types we care about (filter out Snow, Freezing Rain, etc.) */
export const SEVERE_LSR_TYPES = [
  'Hail',
  'Tornado',
  'Funnel Cloud',
  'Waterspout',
  'Thunderstorm Wind',
  'Wind',
  'Dust Storm',
  'Heavy Rain',
  'Flash Flood',
] as const

export type SevereLsrType = (typeof SEVERE_LSR_TYPES)[number]

export function isSevereLsrType(descript: string): boolean {
  const d = descript?.trim() || ''
  return SEVERE_LSR_TYPES.some((t) => d.toLowerCase().includes(t.toLowerCase()))
}
