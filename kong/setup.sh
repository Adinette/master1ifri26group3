#!/bin/bash
# =============================================================================
# SFMC Bénin — Kong Gateway : enregistrement dynamique via Upstream/Target
# =============================================================================
# Architecture :
#   Service → Upstream (pool lb) → Targets (instances réelles)
#
# Avantages vs URL statique :
#   • Ajout/suppression d'instances SANS redémarrer Kong
#   • Health checks actifs : Kong sonde /health toutes les 10s
#   • Load balancing round-robin natif entre plusieurs instances
#   • Auto-exclusion des targets unhealthy (passive checks)
#
# Usage :
#   bash kong/setup.sh              # Initialise tout
#   bash kong/register.sh <svc> <host:port>    # Ajoute une instance
#   bash kong/deregister.sh <svc> <host:port>  # Retire une instance
# =============================================================================

KONG_ADMIN="${KONG_ADMIN_URL:-http://localhost:8001}"

# service-name | upstream-name | host:port | route-path
SERVICES=(
  "auth-service|auth-upstream|host.docker.internal:3001|/api/auth"
  "user-service|user-upstream|host.docker.internal:3002|/api/users"
  "product-service|product-upstream|host.docker.internal:3003|/api/products"
  "inventory-service|inventory-upstream|host.docker.internal:3004|/api/inventory"
  "order-service|order-upstream|host.docker.internal:3005|/api/orders"
  "production-service|production-upstream|host.docker.internal:3006|/api/production"
  "billing-service|billing-upstream|host.docker.internal:3007|/api/billing"
  "notification-service|notification-upstream|host.docker.internal:3008|/api/notify"
  "reporting-service|reporting-upstream|host.docker.internal:3009|/api/reports"
)

# Attendre que Kong soit prêt
echo "⏳ Attente de Kong..."
until curl -sf "$KONG_ADMIN/status" > /dev/null 2>&1; do
  sleep 2
done
echo "✔ Kong est prêt"
echo ""

for entry in "${SERVICES[@]}"; do
  IFS='|' read -r svc_name upstream_name target route_path <<< "$entry"

  echo "──────────────────────────────────────────"
  echo "📦 $svc_name"

  # ── 1. Créer l'Upstream (pool de load balancing) ────────────────────────
  curl -s -X PUT "$KONG_ADMIN/upstreams/$upstream_name" \
    -H "Content-Type: application/json" \
    -d "{
      \"name\": \"$upstream_name\",
      \"algorithm\": \"round-robin\",
      \"healthchecks\": {
        \"active\": {
          \"type\": \"http\",
          \"http_path\": \"/health\",
          \"timeout\": 3,
          \"concurrency\": 5,
          \"healthy\": {
            \"interval\": 10,
            \"successes\": 2,
            \"http_statuses\": [200, 204]
          },
          \"unhealthy\": {
            \"interval\": 5,
            \"http_failures\": 3,
            \"tcp_failures\": 3,
            \"timeouts\": 3,
            \"http_statuses\": [429, 500, 503]
          }
        },
        \"passive\": {
          \"type\": \"http\",
          \"healthy\": {
            \"successes\": 5,
            \"http_statuses\": [200, 201, 202, 204]
          },
          \"unhealthy\": {
            \"http_failures\": 5,
            \"tcp_failures\": 3,
            \"timeouts\": 5,
            \"http_statuses\": [429, 500, 502, 503, 504]
          }
        }
      }
    }" > /dev/null
  echo "  ✔ Upstream $upstream_name créé (round-robin + health checks)"

  # ── 2. Enregistrer le Target initial dans l'Upstream ────────────────────
  HTTP=$(curl -s -o /dev/null -w "%{http_code}" \
    -X POST "$KONG_ADMIN/upstreams/$upstream_name/targets" \
    -H "Content-Type: application/json" \
    -d "{\"target\": \"$target\", \"weight\": 100}")
  if [ "$HTTP" = "201" ]; then
    echo "  ✔ Target $target enregistré (weight=100)"
  else
    echo "  ⚠ Target déjà présent ou erreur HTTP $HTTP"
  fi

  # ── 3. Créer le Service Kong pointant sur l'Upstream ────────────────────
  curl -s -X PUT "$KONG_ADMIN/services/$svc_name" \
    -H "Content-Type: application/json" \
    -d "{
      \"name\": \"$svc_name\",
      \"host\": \"$upstream_name\",
      \"port\": 80,
      \"protocol\": \"http\",
      \"connect_timeout\": 5000,
      \"read_timeout\": 30000,
      \"write_timeout\": 30000,
      \"retries\": 3
    }" > /dev/null
  echo "  ✔ Service $svc_name → upstream://$upstream_name"

  # ── 4. Créer la Route ────────────────────────────────────────────────────
  curl -s -X PUT "$KONG_ADMIN/services/$svc_name/routes/$svc_name-route" \
    -H "Content-Type: application/json" \
    -d "{
      \"name\": \"$svc_name-route\",
      \"paths\": [\"$route_path\"],
      \"strip_path\": false,
      \"preserve_host\": false,
      \"protocols\": [\"http\", \"https\"]
    }" > /dev/null
  echo "  ✔ Route $route_path → $svc_name"
done

echo ""
echo "=============================================="
echo "✅ Kong configuré — enregistrement dynamique"
echo "   Ajouter une instance  : bash kong/register.sh <service> <host:port>"
echo "   Retirer une instance  : bash kong/deregister.sh <service> <host:port>"
echo "   Lister les upstreams  : curl $KONG_ADMIN/upstreams"
echo "   Santé d'un upstream   : curl $KONG_ADMIN/upstreams/<name>/health"
echo "=============================================="