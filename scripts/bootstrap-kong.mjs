const KONG_ADMIN = process.env.KONG_ADMIN_URL || "http://localhost:8001";
const SOFT_FAIL = process.argv.includes("--soft-fail") || process.env.KONG_BOOTSTRAP_SOFT_FAIL === "1";

const SERVICES = [
  { service: "auth-service", upstream: "auth-upstream", target: "host.docker.internal:3001", path: "/api/auth" },
  { service: "user-service", upstream: "user-upstream", target: "host.docker.internal:3002", path: "/api/users" },
  { service: "product-service", upstream: "product-upstream", target: "host.docker.internal:3003", path: "/api/products" },
  { service: "inventory-service", upstream: "inventory-upstream", target: "host.docker.internal:3004", path: "/api/inventory" },
  { service: "order-service", upstream: "order-upstream", target: "host.docker.internal:3005", path: "/api/orders" },
  { service: "production-service", upstream: "production-upstream", target: "host.docker.internal:3006", path: "/api/production" },
  { service: "billing-service", upstream: "billing-upstream", target: "host.docker.internal:3007", path: "/api/billing" },
  { service: "notification-service", upstream: "notification-upstream", target: "host.docker.internal:3008", path: "/api/notify" },
  { service: "reporting-service", upstream: "reporting-upstream", target: "host.docker.internal:3009", path: "/api/reports" },
];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForKong(maxAttempts = 45, intervalMs = 2000) {
  for (let i = 1; i <= maxAttempts; i += 1) {
    try {
      const res = await fetch(`${KONG_ADMIN}/status`);
      if (res.ok) return;
    } catch {}
    process.stdout.write(`Kong en attente (${i}/${maxAttempts})...\r`);
    await sleep(intervalMs);
  }
  throw new Error(`Kong Admin indisponible sur ${KONG_ADMIN}`);
}

async function upsertUpstream(name) {
  const payload = {
    name,
    algorithm: "round-robin",
    healthchecks: {
      active: {
        type: "http",
        http_path: "/health",
        timeout: 3,
        healthy: { interval: 10, successes: 2 },
        unhealthy: { interval: 5, http_failures: 3, tcp_failures: 3, timeouts: 3 },
      },
      passive: {
        healthy: { successes: 5 },
        unhealthy: { http_failures: 5, tcp_failures: 3, timeouts: 5 },
      },
    },
  };

  const res = await fetch(`${KONG_ADMIN}/upstreams/${name}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Upstream ${name} KO (${res.status})`);
  }
}

async function registerTarget(upstream, target) {
  const res = await fetch(`${KONG_ADMIN}/upstreams/${upstream}/targets`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ target, weight: 100 }),
  });

  if (!res.ok && res.status !== 409) {
    const txt = await res.text();
    throw new Error(`Target ${target} KO (${res.status}) ${txt}`);
  }
}

async function upsertService(name, upstream) {
  const payload = {
    name,
    host: upstream,
    port: 80,
    protocol: "http",
    connect_timeout: 5000,
    read_timeout: 30000,
    write_timeout: 30000,
    retries: 3,
  };

  const res = await fetch(`${KONG_ADMIN}/services/${name}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Service ${name} KO (${res.status})`);
  }
}

async function upsertRoute(service, path) {
  const routeName = `${service}-route`;
  const payload = {
    name: routeName,
    paths: [path],
    strip_path: false,
    preserve_host: false,
    protocols: ["http", "https"],
  };

  const res = await fetch(`${KONG_ADMIN}/services/${service}/routes/${routeName}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error(`Route ${routeName} KO (${res.status})`);
  }
}

async function main() {
  console.log("[kong-bootstrap] Initialisation du registre dynamique...");
  await waitForKong();
  console.log("\n[kong-bootstrap] Kong prêt.");

  for (const item of SERVICES) {
    await upsertUpstream(item.upstream);
    await registerTarget(item.upstream, item.target);
    await upsertService(item.service, item.upstream);
    await upsertRoute(item.service, item.path);
    console.log(`[kong-bootstrap] OK ${item.service}`);
  }

  console.log("[kong-bootstrap] Terminé.");
}

main().catch((err) => {
  if (SOFT_FAIL) {
    console.warn("[kong-bootstrap] AVERTISSEMENT:", err.message);
    console.warn("[kong-bootstrap] Soft-fail actif: démarrage poursuivi sans blocage.");
    process.exit(0);
    return;
  }
  console.error("[kong-bootstrap] ERREUR:", err.message);
  process.exit(1);
});
