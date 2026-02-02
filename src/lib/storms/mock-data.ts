import { promises as fs } from 'fs'
import path from 'path'
import os from 'os'
import { randomUUID } from 'crypto'

export type StormType = 'hail' | 'wind'

export type GeoJsonPolygon = {
  type: 'Polygon'
  coordinates: Array<Array<[number, number]>>
}

export type StormPolygon = {
  id: string
  geojson: GeoJsonPolygon
  maxHailSizeIn?: number
  maxWindSpeedMph?: number
  impactedNeighborhoods: string[]
}

export type StormEvent = {
  id: string
  orgId: string
  provider: string
  type: StormType
  startTime: string
  endTime: string
  severityScore: number
  maxHailSizeIn: number | null
  maxWindSpeedMph: number | null
  impactedAreaCount: number
  polygons: StormPolygon[]
  centroid: { lat: number; lng: number }
  createdAt: string
  /** UX: 1-2 sentence explanation (optional) */
  ai_explanation?: string
  /** UX: provider chips */
  providers_used?: string[]
  /** UX: 0-1 confidence */
  confidence?: number
  /** UX: for grouping */
  assetId?: string | null
  /** UX: test alert flag */
  isTestAlert?: boolean
}

type StormStore = {
  orgs: Record<string, StormEvent[]>
}

const PRIMARY_PATH = path.join(process.cwd(), 'data', 'mock-storms.json')
const FALLBACK_PATH = path.join(os.tmpdir(), 'tempestiq-mock-storms.json')

const DEFAULT_ORG_ID = 'demo-customer-1'

const REGION_CENTERS = [
  { name: 'Dallas-Fort Worth, TX', lat: 32.7767, lng: -96.7970 },
  { name: 'Omaha, NE', lat: 41.2565, lng: -95.9345 },
  { name: 'Denver, CO', lat: 39.7392, lng: -104.9903 },
  { name: 'Kansas City, MO', lat: 39.0997, lng: -94.5786 },
  { name: 'Oklahoma City, OK', lat: 35.4676, lng: -97.5164 },
]

const NEIGHBORHOODS = [
  'North Loop',
  'Westfield',
  'Ridgeview',
  'Oak Terrace',
  'Cedar Hills',
  'Brookstone',
  'Sunset Park',
  'Lakewood',
  'Meadow Ridge',
  'Pinecrest',
]

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min
}

function pick<T>(items: T[]) {
  return items[Math.floor(Math.random() * items.length)]
}

function buildPolygon(center: { lat: number; lng: number }, radiusMiles: number, points = 8) {
  const ring: Array<[number, number]> = []
  const latFactor = 1 / 69
  const lngFactor = 1 / (69 * Math.cos((center.lat * Math.PI) / 180))
  for (let i = 0; i < points; i += 1) {
    const angle = (Math.PI * 2 * i) / points
    const jitter = rand(0.75, 1.1)
    const lat = center.lat + Math.sin(angle) * radiusMiles * latFactor * jitter
    const lng = center.lng + Math.cos(angle) * radiusMiles * lngFactor * jitter
    ring.push([lng, lat])
  }
  ring.push(ring[0])
  return ring
}

function generateStormEvent(orgId: string, index: number): StormEvent {
  const base = pick(REGION_CENTERS)
  const startOffsetHours = rand(6, 120) * -1
  const durationHours = rand(1.5, 4.5)
  const start = new Date(Date.now() + startOffsetHours * 60 * 60 * 1000)
  const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000)
  const type: StormType = Math.random() > 0.45 ? 'hail' : 'wind'
  const severityScore = Math.round(rand(62, 96))
  const maxHailSizeIn = type === 'hail' ? Number(rand(1.0, 3.2).toFixed(1)) : null
  const maxWindSpeedMph = type === 'wind' ? Math.round(rand(45, 82)) : Math.round(rand(35, 55))
  const polygonCount = Math.floor(rand(2, 4))
  const polygons: StormPolygon[] = Array.from({ length: polygonCount }).map(() => {
    const radius = rand(4, 12)
    const center = {
      lat: base.lat + rand(-0.25, 0.25),
      lng: base.lng + rand(-0.3, 0.3),
    }
    return {
      id: randomUUID(),
      geojson: {
        type: 'Polygon',
        coordinates: [buildPolygon(center, radius)],
      },
      maxHailSizeIn: maxHailSizeIn ?? undefined,
      maxWindSpeedMph,
      impactedNeighborhoods: Array.from({ length: Math.floor(rand(3, 6)) }).map(() => pick(NEIGHBORHOODS)),
    }
  })

  const impactedAreaCount = polygons.reduce((sum, polygon) => sum + polygon.impactedNeighborhoods.length, 0)
  return {
    id: randomUUID(),
    orgId,
    provider: 'mock-provider',
    type,
    startTime: start.toISOString(),
    endTime: end.toISOString(),
    severityScore,
    maxHailSizeIn,
    maxWindSpeedMph,
    impactedAreaCount,
    polygons,
    centroid: { lat: base.lat, lng: base.lng },
    createdAt: new Date().toISOString(),
  }
}

async function loadStore(): Promise<StormStore> {
  for (const p of [PRIMARY_PATH, FALLBACK_PATH]) {
    try {
      const raw = await fs.readFile(p, 'utf-8')
      return JSON.parse(raw) as StormStore
    } catch {
      continue
    }
  }
  return { orgs: {} }
}

async function saveStore(store: StormStore) {
  const json = JSON.stringify(store, null, 2)
  try {
    await fs.mkdir(path.dirname(PRIMARY_PATH), { recursive: true })
    await fs.writeFile(PRIMARY_PATH, json)
  } catch {
    try {
      await fs.writeFile(FALLBACK_PATH, json)
    } catch {
      throw new Error('Unable to persist storms. Storage not writable.')
    }
  }
}

export async function ensureStormEvents(orgId: string, count = 8) {
  const store = await loadStore()
  if (!store.orgs[orgId] || store.orgs[orgId].length === 0) {
    store.orgs[orgId] = Array.from({ length: count }).map((_, idx) => generateStormEvent(orgId, idx))
    await saveStore(store)
  }
  return store.orgs[orgId]
}

/** Force-add sample storms for testing. Always appends. */
export async function seedStormEvents(orgId: string, count = 8) {
  const store = await loadStore()
  const existing = store.orgs[orgId] ?? []
  const newEvents = Array.from({ length: count }).map((_, idx) =>
    generateStormEvent(orgId, existing.length + idx)
  )
  store.orgs[orgId] = [...newEvents, ...existing]
  await saveStore(store)
  return store.orgs[orgId]
}

export async function listStormEvents(orgId: string) {
  const store = await loadStore()
  return store.orgs[orgId] ?? []
}

export async function getStormEvent(orgId: string, id: string) {
  const events = await listStormEvents(orgId)
  return events.find((event) => event.id === id) ?? null
}

/** Create a test alert event for the given org. No provider APIs called. */
export async function createTestStormEvent(orgId: string): Promise<StormEvent> {
  await ensureStormEvents(orgId)
  const store = await loadStore()
  const base = REGION_CENTERS[0]
  const start = new Date()
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000)
  const polygons: StormPolygon[] = [{
    id: randomUUID(),
    geojson: { type: 'Polygon', coordinates: [buildPolygon({ lat: base.lat, lng: base.lng }, 6)] },
    maxHailSizeIn: 1.5,
    impactedNeighborhoods: ['North Loop', 'Westfield', 'Ridgeview'],
  }]
  const event: StormEvent = {
    id: randomUUID(),
    orgId,
    provider: 'test',
    type: 'hail',
    startTime: start.toISOString(),
    endTime: end.toISOString(),
    severityScore: 78,
    maxHailSizeIn: 1.5,
    maxWindSpeedMph: null,
    impactedAreaCount: 3,
    polygons,
    centroid: { lat: base.lat, lng: base.lng },
    createdAt: start.toISOString(),
    ai_explanation: 'Test alert: Hail threat (demo). No real storm detected.',
    providers_used: [],
    confidence: 1,
    isTestAlert: true,
  }
  store.orgs[orgId] = [event, ...(store.orgs[orgId] ?? [])]
  await saveStore(store)
  return event
}

export async function seedDefaultStorms() {
  await ensureStormEvents(DEFAULT_ORG_ID, 8)
}

export { DEFAULT_ORG_ID }
