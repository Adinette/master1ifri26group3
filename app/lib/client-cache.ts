/**
 * Cache mémoire client + déduplication des requêtes réseau.
 *
 * Pourquoi ?
 * — Plusieurs pages du dashboard consomment les mêmes endpoints (par ex.
 *   `/api/orders` est lu par les pages Commandes ET Facturation).
 * — Sans cache, chaque navigation déclenche un nouveau fetch même si la
 *   réponse est inchangée depuis quelques secondes.
 * — `cachedJson` mutualise les fetches en cours (inflight) et garde la
 *   réponse 5s par défaut.
 *
 * Utilisation :
 *   const data = await cachedJson<Order[]>('/api/orders')
 *   // ... après une mutation :
 *   invalidate('/api/orders')
 */

type Entry = { expiresAt: number; data: unknown }

const cache = new Map<string, Entry>()
const inflight = new Map<string, Promise<unknown>>()
const DEFAULT_TTL_MS = 5_000

export async function cachedJson<T>(
  url: string,
  options?: { ttlMs?: number; init?: RequestInit }
): Promise<T> {
  const ttl = options?.ttlMs ?? DEFAULT_TTL_MS
  const now = Date.now()

  const entry = cache.get(url)
  if (entry && entry.expiresAt > now) {
    return entry.data as T
  }

  const ongoing = inflight.get(url)
  if (ongoing) {
    return ongoing as Promise<T>
  }

  const promise = fetch(url, options?.init)
    .then(async (response) => {
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
      }
      const data = (await response.json()) as T
      cache.set(url, { expiresAt: Date.now() + ttl, data })
      return data
    })
    .finally(() => {
      inflight.delete(url)
    })

  inflight.set(url, promise)
  return promise
}

/**
 * Invalide le cache pour une URL exacte ou pour toutes les clés commençant
 * par le préfixe donné. À appeler après une mutation (POST/PUT/DELETE).
 */
export function invalidate(prefix: string): void {
  for (const key of Array.from(cache.keys())) {
    if (key === prefix || key.startsWith(prefix)) {
      cache.delete(key)
    }
  }
}

/** Vide tout le cache — utile lors d'un sign-out ou d'un changement de profil. */
export function clearClientCache(): void {
  cache.clear()
  inflight.clear()
}
