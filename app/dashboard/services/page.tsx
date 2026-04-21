"use client"

import { useEffect, useState } from "react"

const services = [
  { name: "Auth Service",         port: 3001, route: "/api/auth" },
  { name: "User Service",         port: 3002, route: "/api/users" },
  { name: "Product Service",      port: 3003, route: "/api/products" },
  { name: "Inventory Service",    port: 3004, route: "/api/inventory" },
  { name: "Order Service",        port: 3005, route: "/api/orders" },
  { name: "Production Service",   port: 3006, route: "/api/production" },
  { name: "Billing Service",      port: 3007, route: "/api/billing" },
  { name: "Notification Service", port: 3008, route: "/api/notify" },
  { name: "Reporting Service",    port: 3009, route: "/api/reports" },
]

type Status = "checking" | "online" | "offline"

export default function ServicesPage() {
  const [kongStatus, setKongStatus] = useState<Status>("checking")
  const [rabbitStatus, setRabbitStatus] = useState<Status>("checking")
  const [serviceStatuses, setServiceStatuses] = useState<Record<string, Status>>(
    Object.fromEntries(services.map(s => [s.name, "checking"]))
  )

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
        if (data?.services) {
          setServiceStatuses(data.services)
        }
      })
      .catch(() => {
        setServiceStatuses(Object.fromEntries(services.map(s => [s.name, "offline"])))
      })
  }, [])

  const badge = (status: Status) => {
    if (status === "checking") return <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-700">⏳ Vérification...</span>
    if (status === "online")   return <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-700">✅ En ligne</span>
    return                            <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-700">❌ Hors ligne</span>
  }

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-bold">Statut des Services</h1>

      {/* Infrastructure */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Infrastructure</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 shadow flex justify-between items-center">
            <div>
              <p className="font-medium">Kong Gateway</p>
              <p className="text-sm text-gray-500">Port 8000 / Admin 8001</p>
            </div>
            {badge(kongStatus)}
          </div>
          <div className="bg-white rounded-xl p-4 shadow flex justify-between items-center">
            <div>
              <p className="font-medium">RabbitMQ</p>
              <p className="text-sm text-gray-500">Port 5672 / Dashboard 15672</p>
            </div>
            {badge(rabbitStatus)}
          </div>
        </div>
      </div>

      {/* Microservices */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Microservices</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {services.map(s => (
            <div key={s.name} className="bg-white rounded-xl p-4 shadow flex justify-between items-center">
              <div>
                <p className="font-medium">{s.name}</p>
                <p className="text-sm text-gray-500">:{s.port} → {s.route}</p>
              </div>
              {badge(serviceStatuses[s.name])}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}