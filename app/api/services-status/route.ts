import { serviceDefinitions } from '@/app/lib/service-monitoring'

const HEALTH_TIMEOUT_MS = 600
const CACHE_TTL_MS = 10_000

type CheckResult = {
  online: boolean
  latencyMs: number
  httpStatus: number | null
  error: string | null
}

type CachedResponse = {
  expiresAt: number
  payload: {
    checkedAt: string
    services: Record<string, 'online' | 'offline'>
    details: Record<string, CheckResult>
  }
}

let cached: CachedResponse | null = null
let inflight: Promise<CachedResponse['payload']> | null = null

async function checkService(url: string, validStatuses: readonly number[]): Promise<CheckResult> {
  const startedAt = Date.now()
  try {
    const response = await fetch(url, {
      cache: 'no-store',
      signal: AbortSignal.timeout(HEALTH_TIMEOUT_MS),
    })
    return {
      online: validStatuses.includes(response.status),
      latencyMs: Date.now() - startedAt,
      httpStatus: response.status,
      error: null,
    }
  } catch (error) {
    return {
      online: false,
      latencyMs: Date.now() - startedAt,
      httpStatus: null,
      error: error instanceof Error ? error.message : 'Service inaccessible',
    }
  }
}

async function runChecks(): Promise<CachedResponse['payload']> {
  const checks = await Promise.all(
    serviceDefinitions.map(async (service) => {
      const check = await checkService(`http://localhost:${service.port}${service.path}`, service.validStatuses)
      return [service.name, check] as const
    })
  )

  const details = Object.fromEntries(checks)
  const services = Object.fromEntries(
    checks.map(([name, check]) => [name, check.online ? 'online' : 'offline'] as const)
  ) as Record<string, 'online' | 'offline'>

  return {
    checkedAt: new Date().toISOString(),
    services,
    details,
  }
}

export async function GET() {
  const now = Date.now()

  // 1) On sert le cache si encore valide
  if (cached && cached.expiresAt > now) {
    return Response.json(cached.payload, {
      headers: { 'X-Cache': 'HIT', 'Cache-Control': 'private, max-age=10' },
    })
  }

  // 2) Coalescing : si une vérification est déjà en cours, on attend la même
  //    plutôt que d'envoyer 9 health-checks supplémentaires en parallèle.
  if (!inflight) {
    inflight = runChecks().finally(() => {
      inflight = null
    })
  }

  const payload = await inflight
  cached = { expiresAt: Date.now() + CACHE_TTL_MS, payload }

  return Response.json(payload, {
    headers: { 'X-Cache': 'MISS', 'Cache-Control': 'private, max-age=10' },
  })
}