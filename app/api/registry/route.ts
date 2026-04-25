import { NextRequest } from "next/server"

const KONG_ADMIN = process.env.KONG_ADMIN_URL || "http://localhost:8001"

// Validation des entrées (prévention SSRF / injection)
function isValidServiceName(name: string): boolean {
  return /^[a-zA-Z0-9_-]{1,64}$/.test(name)
}
function isValidTarget(target: string): boolean {
  return /^[a-zA-Z0-9._-]{1,253}:[0-9]{1,5}$/.test(target)
}
function isValidWeight(w: unknown): w is number {
  return typeof w === "number" && Number.isInteger(w) && w >= 0 && w <= 1000
}

function upstreamFromService(service: string): string {
  return service.endsWith("-service")
    ? service.replace(/-service$/, "-upstream")
    : `${service}-upstream`
}

// ─── GET /api/registry ─────────────────────────────────────────────────────
// Retourne tous les upstreams avec leurs targets et leur état de santé
export async function GET() {
  try {
    // Récupérer la liste des upstreams
    const upstreamsRes = await fetch(`${KONG_ADMIN}/upstreams?size=100`, {
      cache: "no-store",
    })
    if (!upstreamsRes.ok) {
      return Response.json({ error: "Kong Admin inaccessible" }, { status: 502 })
    }
    const upstreamsData = await upstreamsRes.json()
    const upstreams = upstreamsData.data || []

    // Pour chaque upstream, récupérer les targets + la santé
    const enriched = await Promise.all(
      upstreams.map(async (upstream: { name: string; algorithm: string; healthchecks: unknown }) => {
        let targets: unknown[] = []
        let healthData: unknown[] = []

        try {
          const tRes = await fetch(
            `${KONG_ADMIN}/upstreams/${upstream.name}/targets?size=100`,
            { cache: "no-store" }
          )
          if (tRes.ok) {
            const tData = await tRes.json()
            targets = tData.data || []
          }
        } catch { /* Kong offline */ }

        try {
          const hRes = await fetch(
            `${KONG_ADMIN}/upstreams/${upstream.name}/health`,
            { cache: "no-store" }
          )
          if (hRes.ok) {
            const hData = await hRes.json()
            healthData = hData.data || []
          }
        } catch { /* health check indisponible */ }

        // Fusionner targets + health
        const healthMap = new Map(
          (healthData as Array<{ id: string; health: string }>).map((h) => [h.id, h.health])
        )
        const enrichedTargets = (targets as Array<{ id: string; target: string; weight: number; created_at: number }>)
          .filter((t) => t.weight > 0)
          .map((t) => ({
            id: t.id,
            target: t.target,
            weight: t.weight,
            createdAt: t.created_at,
            health: healthMap.get(t.id) ?? "UNKNOWN",
          }))

        return {
          name: upstream.name,
          algorithm: upstream.algorithm,
          healthchecks: upstream.healthchecks,
          targets: enrichedTargets,
          totalInstances: enrichedTargets.length,
          healthyInstances: enrichedTargets.filter((t) => t.health === "HEALTHY").length,
        }
      })
    )

    return Response.json({ upstreams: enriched, total: enriched.length })
  } catch {
    return Response.json({ error: "Erreur interne" }, { status: 500 })
  }
}

// ─── POST /api/registry ────────────────────────────────────────────────────
// Enregistre dynamiquement une instance dans un upstream Kong
// Body: { service: "auth-service", target: "host.docker.internal:3001", weight?: 100 }
export async function POST(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: "Body JSON invalide" }, { status: 400 })
  }

  const { service, target, weight = 100 } = body as Record<string, unknown>

  if (typeof service !== "string" || !isValidServiceName(service)) {
    return Response.json({ error: "Champ 'service' invalide (alphanumérique, tirets, max 64)" }, { status: 400 })
  }
  if (typeof target !== "string" || !isValidTarget(target)) {
    return Response.json({ error: "Champ 'target' invalide. Format attendu: hostname:port" }, { status: 400 })
  }
  if (!isValidWeight(weight)) {
    return Response.json({ error: "Champ 'weight' invalide (entier 0–1000)" }, { status: 400 })
  }

  const upstream = upstreamFromService(service)

  try {
    // Créer l'upstream si inexistant (upsert via PUT)
    const upRes = await fetch(`${KONG_ADMIN}/upstreams/${upstream}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: upstream,
        algorithm: "round-robin",
        healthchecks: {
          active: {
            type: "http",
            http_path: "/health",
            timeout: 3,
            healthy: { interval: 10, successes: 2 },
            unhealthy: { interval: 5, http_failures: 3 },
          },
          passive: {
            healthy: { successes: 5 },
            unhealthy: { http_failures: 5 },
          },
        },
      }),
    })
    if (!upRes.ok && upRes.status !== 200 && upRes.status !== 201) {
      const err = await upRes.text()
      return Response.json({ error: `Impossible de créer l'upstream: ${err}` }, { status: 502 })
    }

    // Ajouter le target
    const tRes = await fetch(`${KONG_ADMIN}/upstreams/${upstream}/targets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ target, weight }),
    })

    if (!tRes.ok) {
      const err = await tRes.text()
      return Response.json({ error: `Impossible d'enregistrer le target: ${err}` }, { status: 502 })
    }

    const created = await tRes.json()
    return Response.json(
      {
        message: `Target ${target} enregistré dans ${upstream}`,
        upstream,
        target: { id: created.id, target, weight },
      },
      { status: 201 }
    )
  } catch {
    return Response.json({ error: "Kong Admin inaccessible" }, { status: 502 })
  }
}

// ─── DELETE /api/registry ──────────────────────────────────────────────────
// Désenregistre une instance d'un upstream Kong
// Body: { service: "auth-service", target: "host.docker.internal:3001" }
export async function DELETE(req: NextRequest) {
  let body: unknown
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: "Body JSON invalide" }, { status: 400 })
  }

  const { service, target } = body as Record<string, unknown>

  if (typeof service !== "string" || !isValidServiceName(service)) {
    return Response.json({ error: "Champ 'service' invalide" }, { status: 400 })
  }
  if (typeof target !== "string" || !isValidTarget(target)) {
    return Response.json({ error: "Champ 'target' invalide. Format attendu: hostname:port" }, { status: 400 })
  }

  const upstream = upstreamFromService(service)

  try {
    // Lister tous les targets (y compris supprimés)
    const allRes = await fetch(`${KONG_ADMIN}/upstreams/${upstream}/targets/all`, {
      cache: "no-store",
    })
    if (!allRes.ok) {
      return Response.json({ error: `Upstream ${upstream} introuvable` }, { status: 404 })
    }

    const allData = await allRes.json()
    const targets: Array<{ id: string; target: string; weight: number; created_at: number }> =
      allData.data || []

    // Trouver le target actif le plus récent
    const actives = targets
      .filter((t) => t.target === target && t.weight > 0)
      .sort((a, b) => b.created_at - a.created_at)

    if (actives.length === 0) {
      return Response.json(
        { error: `Target ${target} introuvable ou déjà supprimé dans ${upstream}` },
        { status: 404 }
      )
    }

    const targetId = actives[0].id

    // Supprimer le target
    const delRes = await fetch(`${KONG_ADMIN}/upstreams/${upstream}/targets/${targetId}`, {
      method: "DELETE",
    })

    if (delRes.status !== 204) {
      return Response.json({ error: `Erreur lors de la suppression (${delRes.status})` }, { status: 502 })
    }

    return Response.json({
      message: `Target ${target} retiré de ${upstream}`,
      upstream,
      removedTarget: target,
    })
  } catch {
    return Response.json({ error: "Kong Admin inaccessible" }, { status: 502 })
  }
}
