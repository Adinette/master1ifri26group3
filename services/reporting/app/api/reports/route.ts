import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

export async function GET() {
  try {
    const reports = await prisma.report.findMany({ orderBy: { createdAt: 'desc' } })
    return Response.json(reports)
  } catch {
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { type, data } = await req.json()
    if (!type || !data) return Response.json({ error: 'Champs requis manquants' }, { status: 400 })
    const report = await prisma.report.create({ data: { type, data } })
    return Response.json(report, { status: 201 })
  } catch {
    return Response.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}