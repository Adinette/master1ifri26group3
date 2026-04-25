#!/usr/bin/env node
/**
 * Attend que les services soient prêts puis initialise les consumers RabbitMQ.
 */

const ENDPOINTS = [
  { name: "inventory", url: "http://localhost:3004/api/init" },
  { name: "production", url: "http://localhost:3006/api/init" },
  { name: "notification", url: "http://localhost:3008/api/init" },
];

const DELAY_MS = 20000; // attendre 20s que les services soient up
const MAX_RETRIES = 5;
const RETRY_DELAY_MS = 5000;

async function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function initEndpoint(name, url) {
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(url, { method: "GET" });
      if (res.ok) {
        console.log(`[init-consumers] ✓ ${name} (${url}) → ${res.status}`);
        return;
      }
      console.warn(`[init-consumers] ⚠ ${name} → HTTP ${res.status} (tentative ${attempt}/${MAX_RETRIES})`);
    } catch (err) {
      console.warn(`[init-consumers] ⚠ ${name} → ${err.message} (tentative ${attempt}/${MAX_RETRIES})`);
    }
    if (attempt < MAX_RETRIES) await sleep(RETRY_DELAY_MS);
  }
  console.error(`[init-consumers] ✗ ${name} échec après ${MAX_RETRIES} tentatives`);
}

async function main() {
  console.log(`[init-consumers] Attente de ${DELAY_MS / 1000}s avant initialisation des consumers...`);
  await sleep(DELAY_MS);

  console.log("[init-consumers] Initialisation des consumers RabbitMQ...");
  await Promise.all(ENDPOINTS.map(({ name, url }) => initEndpoint(name, url)));
  console.log("[init-consumers] Terminé.");
}

main();
