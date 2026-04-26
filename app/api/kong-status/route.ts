const HEALTH_TIMEOUT_MS = 600
const CACHE_TTL_MS = 10_000

type CachedStatus = { expiresAt: number; payload: { kong: boolean; rabbitmq: boolean } }
let cached: CachedStatus | null = null
let inflight: Promise<CachedStatus['payload']> | null = null

async function probeKong(): Promise<boolean> {
  try {
    const res = await fetch("http://localhost:8001/status", {
      cache: "no-store",
      signal: AbortSignal.timeout(HEALTH_TIMEOUT_MS),
    })
    const data = await res.json()
    return data?.database?.reachable === true
  } catch {
    return false
  }
}

async function probeRabbit(): Promise<boolean> {
  try {
    const res = await fetch("http://localhost:15672/api/overview", {
      headers: { Authorization: "Basic " + Buffer.from("guest:guest").toString("base64") },
      cache: "no-store",
      signal: AbortSignal.timeout(HEALTH_TIMEOUT_MS),
    })
    return res.ok
  } catch {
    return false
  }
}

export async function GET() {
  const now = Date.now()
  if (cached && cached.expiresAt > now) {
    return Response.json(cached.payload, {
      headers: { 'X-Cache': 'HIT', 'Cache-Control': 'private, max-age=10' },
    })
  }

  if (!inflight) {
    inflight = (async () => {
      const [kong, rabbitmq] = await Promise.all([probeKong(), probeRabbit()])
      return { kong, rabbitmq }
    })().finally(() => {
      inflight = null
    })
  }

  const payload = await inflight
  cached = { expiresAt: Date.now() + CACHE_TTL_MS, payload }

  return Response.json(payload, {
    headers: { 'X-Cache': 'MISS', 'Cache-Control': 'private, max-age=10' },
  })
}