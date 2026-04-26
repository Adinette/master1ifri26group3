import { NextRequest } from 'next/server'

const REPORTING_SERVICE = process.env.REPORTING_SERVICE_URL || 'http://localhost:3009'

// Cache mémoire process-local : on évite de bombarder reporting (qui fan-out
// vers 5 micros) à chaque rafraîchissement de page.
const TTL_MS = 30_000
type CacheEntry = { expiresAt: number; status: number; payload: unknown }
const cache = new Map<string, CacheEntry>()

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const search = req.nextUrl.search
  const cacheKey = search || '__all__'
  const now = Date.now()

  const entry = cache.get(cacheKey)
  if (entry && entry.expiresAt > now) {
    return Response.json(entry.payload, {
      status: entry.status,
      headers: { 'X-Cache': 'HIT', 'Cache-Control': 'private, max-age=30' },
    })
  }

  try {
    const response = await fetch(`${REPORTING_SERVICE}/api/dashboard${search}`, {
      cache: 'no-store',
      signal: AbortSignal.timeout(2000),
    })
    const data = (await response.json()) as { partial?: boolean } & Record<string, unknown>

    // On ne cache que les réponses succès complètes pour éviter de figer
    // un état dégradé (partial=true).
    if (response.ok && data && data.partial !== true) {
      cache.set(cacheKey, { expiresAt: now + TTL_MS, status: response.status, payload: data })
    }

    return Response.json(data, {
      status: response.status,
      headers: { 'X-Cache': 'MISS', 'Cache-Control': 'private, max-age=30' },
    })
  } catch {
    // Si on a encore une copie cache (même périmée), on la sert plutôt que
    // d'afficher une erreur (stratégie stale-while-error).
    if (entry) {
      return Response.json(entry.payload, {
        status: entry.status,
        headers: { 'X-Cache': 'STALE', 'Cache-Control': 'private, max-age=10' },
      })
    }
    return Response.json({ error: 'Service reporting indisponible' }, { status: 503 })
  }
}