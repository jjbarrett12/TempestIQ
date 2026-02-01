import { NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import React from 'react'
import { requireOrgContext } from '@/lib/server-auth'
import { getReport } from '@/lib/reports/store'
import { ensureStormEvents, getStormEvent } from '@/lib/storms/mock-data'
import { StormReportDocument } from '@/lib/reports/pdf'

export const runtime = 'nodejs'

export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const { orgId } = await requireOrgContext()
  const report = await getReport(orgId, params.id)

  if (!report) {
    return NextResponse.json({ error: 'Report not found' }, { status: 404 })
  }

  await ensureStormEvents(orgId)
  const event = await getStormEvent(orgId, report.stormEventId)
  if (!event) {
    return NextResponse.json({ error: 'Storm event not found' }, { status: 404 })
  }

  const pdfBuffer = await renderToBuffer(
    React.createElement(StormReportDocument, { report, event })
  )

  return new NextResponse(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="storm-report-${report.id}.pdf"`,
    },
  })
}
