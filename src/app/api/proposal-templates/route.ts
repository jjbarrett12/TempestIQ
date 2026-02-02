import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireOrgContext } from '@/lib/server-auth'
import { z } from 'zod'

const createSchema = z.object({
  name: z.string().min(1).max(200),
  body: z.string().min(1),
})

export async function GET() {
  try {
    const { orgId } = await requireOrgContext()
    const templates = await prisma.proposalTemplate.findMany({
      where: { customerId: orgId },
      orderBy: { updatedAt: 'desc' },
    })
    return NextResponse.json({ templates })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { orgId } = await requireOrgContext()
    const body = await request.json()
    const data = createSchema.parse(body)
    const template = await prisma.proposalTemplate.create({
      data: {
        customerId: orgId,
        name: data.name,
        body: data.body,
      },
    })
    return NextResponse.json({ template }, { status: 201 })
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: e.errors }, { status: 400 })
    }
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
