import { promises as fs } from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'
import os from 'os'

export type ReportRecord = {
  id: string
  orgId: string
  stormEventId: string
  address: string
  lat: number
  lon: number
  impacted: boolean
  distanceToPolygonM: number | null
  createdByUserId: string | null
  createdAt: string
}

type ReportStore = {
  reports: ReportRecord[]
}

const PRIMARY_PATH = path.join(process.cwd(), 'data', 'reports.json')
const FALLBACK_PATH = path.join(os.tmpdir(), 'tempestiq-reports.json')

async function loadStore(): Promise<ReportStore> {
  for (const p of [PRIMARY_PATH, FALLBACK_PATH]) {
    try {
      const raw = await fs.readFile(p, 'utf-8')
      return JSON.parse(raw) as ReportStore
    } catch {
      continue
    }
  }
  return { reports: [] }
}

async function saveStore(store: ReportStore) {
  const json = JSON.stringify(store, null, 2)
  try {
    await fs.mkdir(path.dirname(PRIMARY_PATH), { recursive: true })
    await fs.writeFile(PRIMARY_PATH, json)
  } catch {
    try {
      await fs.writeFile(FALLBACK_PATH, json)
    } catch {
      throw new Error('Unable to persist reports. Storage not writable.')
    }
  }
}

export async function listReports(orgId: string) {
  const store = await loadStore()
  return store.reports.filter((report) => report.orgId === orgId)
}

export async function getReport(orgId: string, id: string) {
  const store = await loadStore()
  return store.reports.find((report) => report.orgId === orgId && report.id === id) ?? null
}

export async function createReport(input: Omit<ReportRecord, 'id' | 'createdAt'>) {
  const store = await loadStore()
  const report: ReportRecord = {
    ...input,
    id: randomUUID(),
    createdAt: new Date().toISOString(),
  }
  store.reports.unshift(report)
  await saveStore(store)
  return report
}
