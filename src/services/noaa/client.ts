/**
 * NOAA NWS Local Storm Reports (LSR) client
 * Fetches severe weather reports from the official NOAA ArcGIS REST API.
 * No API key required - public data.
 * @see https://mapservices.weather.noaa.gov/vector/rest/services/obs/nws_local_storm_reports/MapServer
 */

import axios from 'axios'
import type { NoaaLsrQueryResponse } from './types'
import { isSevereLsrType } from './types'

const NOAA_LSR_BASE = 'https://mapservices.weather.noaa.gov/vector/rest/services/obs/nws_local_storm_reports/MapServer'

/** Layer 0 = Last 24 Hours, Layer 1 = Last 48 Hours, Layer 2 = Last 72 Hours */
type LayerId = 0 | 1 | 2

export interface NoaaLsrReport {
  id: string
  objectid: number
  latitude: number
  longitude: number
  type: string
  magnitude: string | null
  units: string | null
  locDesc: string
  state: string
  validTime: Date
  remarks: string | null
  wfo: string
}

export class NoaaClient {
  /**
   * Fetch Local Storm Reports for a bounding box
   * @param bbox - [minLon, minLat, maxLon, maxLat]
   * @param layer - 0=24h, 1=48h, 2=72h
   * @param severeOnly - if true, filter to hail/wind/tornado etc. only
   */
  async getStormReports(
    bbox: [number, number, number, number],
    layer: LayerId = 0,
    severeOnly = true
  ): Promise<NoaaLsrReport[]> {
    const [minLon, minLat, maxLon, maxLat] = bbox
    const geometry = JSON.stringify({
      xmin: minLon,
      ymin: minLat,
      xmax: maxLon,
      ymax: maxLat,
      spatialReference: { wkid: 4269 },
    })

    const url = `${NOAA_LSR_BASE}/${layer}/query`
    const params = {
      where: '1=1',
      outFields: '*',
      returnGeometry: true,
      f: 'json',
      resultRecordCount: 500,
      geometry,
      geometryType: 'esriEnvelope',
      spatialRel: 'esriSpatialRelIntersects',
    }

    const res = await axios.get<NoaaLsrQueryResponse>(url, {
      params,
      timeout: 15000,
      headers: { Accept: 'application/json' },
    })

    const features = res.data?.features || []
    const reports: NoaaLsrReport[] = []

    for (const f of features) {
      const desc = f.attributes?.descript || ''
      if (severeOnly && !isSevereLsrType(desc)) continue

      reports.push({
        id: `noaa:${f.attributes?.objectid ?? 'unknown'}`,
        objectid: f.attributes?.objectid ?? 0,
        latitude: f.geometry?.y ?? 0,
        longitude: f.geometry?.x ?? 0,
        type: this.normalizeType(desc),
        magnitude: f.attributes?.magnitude ?? null,
        units: f.attributes?.units ?? null,
        locDesc: f.attributes?.loc_desc ?? '',
        state: f.attributes?.state ?? '',
        validTime: new Date(f.attributes?.lsr_validtime ?? 0),
        remarks: f.attributes?.remarks ?? null,
        wfo: f.attributes?.wfo ?? '',
      })
    }

    return reports
  }

  /**
   * Get storm reports for assets - builds bbox from all asset locations + radius
   */
  async getStormReportsForAssets(
    assets: { latitude: number; longitude: number; radiusMiles: number }[],
    layer: LayerId = 0
  ): Promise<NoaaLsrReport[]> {
    if (assets.length === 0) return []

    // Approx 1° lat ≈ 69 mi, 1° lon ≈ 69*cos(lat) mi
    let minLat = 90
    let maxLat = -90
    let minLon = 180
    let maxLon = -180

    for (const a of assets) {
      const degPerMile = 1 / 69
      const padding = Math.max(a.radiusMiles, 25) * degPerMile
      minLat = Math.min(minLat, a.latitude - padding)
      maxLat = Math.max(maxLat, a.latitude + padding)
      minLon = Math.min(minLon, a.longitude - padding)
      maxLon = Math.max(maxLon, a.longitude + padding)
    }

    const bbox: [number, number, number, number] = [minLon, minLat, maxLon, maxLat]
    return this.getStormReports(bbox, layer, true)
  }

  private normalizeType(descript: string): string {
    const d = descript.toLowerCase()
    if (d.includes('hail')) return 'hail'
    if (d.includes('tornado') || d.includes('funnel') || d.includes('waterspout')) return 'tornado'
    if (d.includes('wind') || d.includes('thunderstorm')) return 'wind'
    if (d.includes('flood') || d.includes('rain')) return 'flood'
    return 'storm_report'
  }
}

let noaaClient: NoaaClient | null = null

export const getNoaaClient = (): NoaaClient => {
  if (!noaaClient) {
    noaaClient = new NoaaClient()
  }
  return noaaClient
}
