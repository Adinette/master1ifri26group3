"use client"

import { useEffect, useState, useCallback } from "react"
import { serviceDefinitions } from "@/app/lib/service-monitoring"

type Status = "checking" | "online" | "offline"
type HealthStatus = "HEALTHY" | "UNHEALTHY" | "UNKNOWN"

interface UpstreamTarget {
  id: string
  target: string
  weight: number
  createdAt: number
  health: HealthStatus
}

interface Upstream {
  name: string
  algorithm: string
  targets: UpstreamTarget[]
  totalInstances: number
  healthyInstances: number
}

function healthBadge(h: HealthStatus) {
  if (h === "HEALTHY")   return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">● HEALTHY</span>
  if (h === "UNHEALTHY") return <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">● UNHEALTHY</span>
  return                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-500">● UNKNOWN</span>
}

export default function ServicesPage() {
  const [kongStatus, setKongStatus] = useState<Status>("checking")
  const [rabbitStatus, setRabbitStatus] = useState<Status>("checking")
  const [serviceStatuses, setServiceStatuses] = useState<Record<string, Status>>(
    Object.fromEntries(serviceDefinitions.map((service) => [service.name, "checking"]))
  )
  const [pendingDeregister, setPendingDeregister] = useState<string | null>(null)
  const [deregisteringTarget, setDeregisteringTarget] = useState<string | null>(null)

  // ── Dynamic Registry state ──────────────────────────────────────────────
  const [upstreams, setUpstreams] = useState<Upstream[]>([])
  const [registryLoading, setRegistryLoading] = useState(false)
  const [registryError, setRegistryError] = useState<string | null>(null)

  // Register form
  const [regService, setRegService] = useState("auth-service")
  const [regTarget, setRegTarget] = useState("host.docker.internal:3001")
  const [regWeight, setRegWeight] = useState(100)
  const [regMsg, setRegMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null)
  const [regLoading, setRegLoading] = useState(false)

  // ── Infrastructure & microservices status ───────────────────────────────
  useEffect(() => {
    fetch("/api/kong-status")
      .then(r => r.json())
      .then(data => {
        setKongStatus(data.kong ? "online" : "offline")
        setRabbitStatus(data.rabbitmq ? "online" : "offline")
      })
      .catch(() => {
        setKongStatus("offline")
        setRabbitStatus("offline")
      })

    fetch("/api/services-status")
      .then(r => r.json())
      .then(data => {
        if (data?.services) setServiceStatuses(data.services)
      })
      .catch(() => {
        setServiceStatuses(Object.fromEntries(serviceDefinitions.map((s) => [s.name, "offline"])))
      })
  }, [])

  // ── Charger les upstreams Kong ──────────────────────────────────────────
  const loadRegistry = useCallback(async () => {
    setRegistryLoading(true)
    setRegistryError(null)
    setPendingDeregister(null)
    try {
      const res = await fetch("/api/registry", { cache: "no-store" })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      setUpstreams(data.upstreams ?? [])
    } catch {
      setRegistryError("Kong Admin inaccessible — démarrez Kong (docker compose up)")
    } finally {
      setRegistryLoading(false)
    }
  }, [])

  useEffect(() => { loadRegistry() }, [loadRegistry])

  // ── Enregistrer un target ───────────────────────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setRegLoading(true)
    setRegMsg(null)
    try {
      const res = await fetch("/api/registry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service: regService, target: regTarget, weight: regWeight }),
      })
      const data = await res.json()
      if (res.ok) {
        setRegMsg({ type: "ok", text: data.message })
        loadRegistry()
      } else {
        setRegMsg({ type: "err", text: data.error ?? "Erreur inconnue" })
      }
    } catch {
      setRegMsg({ type: "err", text: "Réseau inaccessible" })
    } finally {
      setRegLoading(false)
    }
  }

  // ── Désenregistrer un target ────────────────────────────────────────────
  const handleDeregister = async (upstreamName: string, target: string) => {
    const targetKey = `${upstreamName}:${target}`
    const service = upstreamName.replace(/-upstream$/, "-service")
    setDeregisteringTarget(targetKey)
    try {
      const res = await fetch("/api/registry", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ service, target }),
      })
      const data = await res.json()
      if (res.ok) {
        setRegMsg({ type: "ok", text: data.message })
        loadRegistry()
      } else {
        setRegMsg({ type: "err", text: data.error ?? "Erreur" })
      }
    } catch {
      setRegMsg({ type: "err", text: "Réseau inaccessible" })
    } finally {
      setDeregisteringTarget(null)
      setPendingDeregister(null)
    }
  }

  const badge = (status: Status) => {
    if (status === "checking") return <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">⏳ Vérification...</span>
    if (status === "online")   return <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">✅ En ligne</span>
    return                            <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-700">❌ Hors ligne</span>
  }

  const serviceOptions = [
    "auth-service", "user-service", "product-service", "inventory-service",
    "order-service", "production-service", "billing-service",
    "notification-service", "reporting-service",
  ]

  return (
    <div className="p-6 space-y-10">
      <div>
        <h1 className="text-2xl font-bold">Statut des Services</h1>
        <p className="text-sm text-slate-500 mt-1">Supervision infrastructure, microservices et registre dynamique Kong</p>
      </div>

      {/* ── Infrastructure ──────────────────────────────────────────────── */}
      <section>
        <h2 className="text-base font-semibold mb-3 text-slate-700 uppercase tracking-widest text-xs">Infrastructure</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex justify-between items-center">
            <div>
              <p className="font-medium">Kong Gateway</p>
              <p className="text-sm text-slate-400">Port 8000 / Admin 8001</p>
            </div>
            {badge(kongStatus)}
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex justify-between items-center">
            <div>
              <p className="font-medium">RabbitMQ</p>
              <p className="text-sm text-slate-400">Port 5672 / Dashboard 15672</p>
            </div>
            {badge(rabbitStatus)}
          </div>
        </div>
      </section>

      {/* ── Microservices ────────────────────────────────────────────────── */}
      <section>
        <h2 className="text-base font-semibold mb-3 text-slate-700 uppercase tracking-widest text-xs">Microservices</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {serviceDefinitions.map((service) => (
            <div key={service.name} className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 flex justify-between items-center">
              <div>
                <p className="font-medium">{service.name}</p>
                <p className="text-sm text-slate-400">:{service.port} → {service.path}</p>
              </div>
              {badge(serviceStatuses[service.name])}
            </div>
          ))}
        </div>
      </section>

      {/* ── Dynamic Service Registry ─────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-slate-700 uppercase tracking-widest text-xs">
              Service Discovery — Registre dynamique Kong
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Upstream / Target · Round-robin · Health checks actifs (sonde /health toutes les 10s)
            </p>
          </div>
          <button
            onClick={loadRegistry}
            disabled={registryLoading}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition disabled:opacity-50"
          >
            {registryLoading ? "Chargement…" : "↻ Rafraîchir"}
          </button>
        </div>

        {registryError && (
          <div className="rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700 mb-4">
            ⚠ {registryError}
          </div>
        )}

        {regMsg && (
          <div className={`rounded-xl border px-4 py-3 text-sm mb-4 ${
            regMsg.type === "ok"
              ? "border-green-200 bg-green-50 text-green-700"
              : "border-red-200 bg-red-50 text-red-700"
          }`}>
            {regMsg.type === "ok" ? "✔" : "✗"} {regMsg.text}
          </div>
        )}

        {/* Upstreams list */}
        {upstreams.length === 0 && !registryLoading && !registryError && (
          <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-6 text-center text-sm text-slate-400">
            Aucun upstream — lancez <code className="font-mono bg-slate-100 px-1 rounded">bash kong/setup.sh</code> pour initialiser le registre
          </div>
        )}

        <div className="space-y-3">
          {upstreams.map((up) => (
            <div key={up.name} className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
              {/* Upstream header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-50 bg-slate-50/60">
                <div className="flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <span className="font-mono text-sm font-semibold text-slate-800">{up.name}</span>
                  <span className="text-xs text-slate-400 border border-slate-200 rounded px-1.5 py-0.5">
                    {up.algorithm}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span className="text-green-600 font-medium">{up.healthyInstances} sain{up.healthyInstances !== 1 ? "s" : ""}</span>
                  <span>/</span>
                  <span>{up.totalInstances} instance{up.totalInstances !== 1 ? "s" : ""}</span>
                </div>
              </div>

              {/* Targets */}
              {up.targets.length === 0 ? (
                <p className="px-4 py-3 text-xs text-slate-400 italic">Aucun target actif</p>
              ) : (
                <div className="divide-y divide-slate-50">
                  {up.targets.map((t) => (
                    <div key={t.id} className="flex items-center justify-between px-4 py-2.5 gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="font-mono text-sm text-slate-700">{t.target}</span>
                        <span className="text-xs text-slate-400">weight={t.weight}</span>
                        {healthBadge(t.health)}
                      </div>
                      {pendingDeregister === `${up.name}:${t.target}` ? (
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => handleDeregister(up.name, t.target)}
                            disabled={deregisteringTarget === `${up.name}:${t.target}`}
                            className="text-xs px-2 py-1 rounded border border-red-200 text-red-600 hover:bg-red-50 transition disabled:opacity-50"
                          >
                            {deregisteringTarget === `${up.name}:${t.target}` ? "Retrait..." : "Confirmer"}
                          </button>
                          <button
                            onClick={() => setPendingDeregister(null)}
                            disabled={deregisteringTarget === `${up.name}:${t.target}`}
                            className="text-xs px-2 py-1 rounded border border-slate-200 text-slate-500 hover:bg-slate-50 transition disabled:opacity-50"
                          >
                            Annuler
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setPendingDeregister(`${up.name}:${t.target}`)}
                          className="text-xs px-2 py-1 rounded border border-red-200 text-red-500 hover:bg-red-50 transition shrink-0"
                        >
                          Retirer
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Register form */}
        <div className="mt-6 bg-white rounded-xl border border-blue-100 shadow-sm p-5">
          <h3 className="font-semibold text-sm text-slate-700 mb-4">
            Enregistrer une nouvelle instance
          </h3>
          <form onSubmit={handleRegister} className="grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <div>
              <label className="block text-xs text-slate-500 mb-1">Service</label>
              <select
                value={regService}
                onChange={(e) => setRegService(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {serviceOptions.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs text-slate-500 mb-1">Target (host:port)</label>
              <input
                type="text"
                value={regTarget}
                onChange={(e) => setRegTarget(e.target.value)}
                placeholder="host.docker.internal:3001"
                pattern="^[a-zA-Z0-9._-]+:[0-9]{1,5}$"
                required
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-500 mb-1">Weight (0–1000)</label>
              <input
                type="number"
                min={0}
                max={1000}
                value={regWeight}
                onChange={(e) => setRegWeight(parseInt(e.target.value, 10) || 100)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>
            <div className="sm:col-span-4 flex justify-end">
              <button
                type="submit"
                disabled={regLoading}
                className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium transition disabled:opacity-50"
              >
                {regLoading ? "Enregistrement…" : "Enregistrer l'instance"}
              </button>
            </div>
          </form>
          <p className="mt-3 text-xs text-slate-400">
            Équivalent shell :{" "}
            <code className="font-mono bg-slate-50 px-1 rounded">
              bash kong/register.sh {regService} {regTarget} {regWeight}
            </code>
          </p>
        </div>
      </section>
    </div>
  )
}