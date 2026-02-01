import { promises as fs } from 'fs'
import path from 'path'
import { randomUUID } from 'crypto'

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

const STORE_PATH = path.join(process.cwd(), 'data', 'reports.json')

async function loadStore(): Promise<ReportStore> {
  try {
    const raw = await fs.readFile(STORE_PATH, 'utf-8')
    return JSON.parse(raw) as ReportStore
  } catch {
    return { reports: [] }
  }
}

async function saveStore(store: ReportStore) {
  await fs.writeFile(STORE_PATH, JSON.stringify(store, null, 2))
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
