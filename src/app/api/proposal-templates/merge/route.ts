import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireOrgContext } from '@/lib/server-auth'
import { z } from 'zod'
import { getStormEvent, ensureStormEvents } from '@/lib/storms/mock-data'
import { reverseGeocode } from '@/lib/map/geocode'

const mergeSchema = z.object({
  templateId: z.string().min(1),
  leadId: z.string().optional().nullable(),
  stormEventId: z.string().optional().nullable(),
  overrides: z.record(z.string()).optional(),
})

/** Merge template with lead + storm context. Returns merged body. */
export async function POST(request: NextRequest) {
  try {
    const { orgId } = await requireOrgContext()
    const body = await request.json()
    const data = mergeSchema.parse(body)

    const template = await prisma.proposalTemplate.findFirst({
      where: { id: data.templateId, customerId: orgId },
    })
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    const fields: Record<string, string> = {
      Today: new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
      YourCompany: '',
      LeadName: '',
      LeadCompany: '',
      LeadEmail: '',
      LeadPhone: '',
      Address: '',
      StormType: '',
      StormDate: '',
      StormArea: '',
    }

    const customer = await prisma.customer.findUnique({
      where: { id: orgId },
      select: { company: true, name: true },
    })
    fields.YourCompany = customer?.company || customer?.name || 'Your Company'

    if (data.leadId) {
      const lead = await prisma.lead.findFirst({
        where: { id: data.leadId, customerId: orgId },
      })
      if (lead) {
        fields.LeadName = lead.name
        fields.LeadCompany = lead.company || ''
        fields.LeadEmail = lead.email || ''
        fields.LeadPhone = lead.phone || ''
        fields.Address = lead.company || lead.name
      }
    }

    if (data.stormEventId) {
      await ensureStormEvents(orgId)
      const event = await getStormEvent(orgId, data.stormEventId)
      if (event) {
        fields.StormType = event.type === 'hail' ? 'Hail' : 'High Wind'
        fields.StormDate = new Date(event.startTime).toLocaleDateString(undefined, {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
        const areaName = await reverseGeocode(event.centroid.lat, event.centroid.lng)
        const neighborhoods = Array.from(
          new Set(event.polygons.flatMap((p) => p.impactedNeighborhoods || []))
        ).slice(0, 6)
        fields.StormArea = neighborhoods.length > 0
          ? `${areaName || 'Impact zone'} (${neighborhoods.join(', ')})`
          : areaName || `${event.centroid.lat.toFixed(2)}, ${event.centroid.lng.toFixed(2)}`
        if (!fields.Address) fields.Address = fields.StormArea
      }
    }

    Object.entries(data.overrides ?? {}).forEach(([k, v]) => {
      if (typeof v === 'string') fields[k] = v
    })

    let merged = template.body
    for (const [key, value] of Object.entries(fields)) {
      merged = merged.replace(new RegExp(`\\[${key}\\]`, 'gi'), value)
    }

    return NextResponse.json({ merged, fields })
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.errors }, { status: 400 })
    }
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
