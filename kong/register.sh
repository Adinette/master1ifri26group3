#!/bin/bash
# =============================================================================
# SFMC Bénin — Enregistrement dynamique d'une instance de service dans Kong
# =============================================================================
# Usage :
#   bash kong/register.sh <service-name> <host:port> [weight]
#
# Exemples :
#   bash kong/register.sh auth-service host.docker.internal:3001
#   bash kong/register.sh product-service host.docker.internal:3003 50
#   bash kong/register.sh auth-service host.docker.internal:3011 100  # 2e instance !
#
# Le script :
#   1. Dérive le nom d'upstream depuis le nom de service (auth-service → auth-upstream)
#   2. Crée l'upstream s'il n'existe pas encore
#   3. Ajoute le target avec le poids indiqué
#   4. Affiche l'état de santé après enregistrement
# =============================================================================

KONG_ADMIN="${KONG_ADMIN_URL:-http://localhost:8001}"

# ── Validation des arguments ─────────────────────────────────────────────────
SERVICE_NAME="$1"
TARGET="$2"
WEIGHT="${3:-100}"

if [ -z "$SERVICE_NAME" ] || [ -z "$TARGET" ]; then
  echo "Usage: bash kong/register.sh <service-name> <host:port> [weight]"
  echo "  Ex : bash kong/register.sh auth-service host.docker.internal:3001"
  exit 1
fi

# Valider format host:port (sécurité basique — pas d'injection de commande)
if ! echo "$TARGET" | grep -qE '^[a-zA-Z0-9._-]+:[0-9]{1,5}$'; then
  echo "✗ Format invalide pour TARGET. Attendu: hostname:port (ex: host.docker.internal:3001)"
  exit 1
fi

if ! echo "$SERVICE_NAME" | grep -qE '^[a-zA-Z0-9_-]+$'; then
  echo "✗ SERVICE_NAME contient des caractères non autorisés"
  exit 1
fi

if ! echo "$WEIGHT" | grep -qE '^[0-9]+$' || [ "$WEIGHT" -lt 0 ] || [ "$WEIGHT" -gt 1000 ]; then
  echo "✗ WEIGHT doit être un entier entre 0 et 1000"
  exit 1
fi

# Dériver le nom de l'upstream : auth-service → auth-upstream
UPSTREAM="${SERVICE_NAME%%-service}-upstream"
# Cas où le nom ne contient pas "-service"
if [ "$UPSTREAM" = "$SERVICE_NAME-upstream" ]; then
  UPSTREAM="${SERVICE_NAME}-upstream"
fi

echo "┌─────────────────────────────────────────────┐"
echo "│  Kong Service Discovery — Enregistrement    │"
echo "└─────────────────────────────────────────────┘"
echo "  Service  : $SERVICE_NAME"
echo "  Upstream : $UPSTREAM"
echo "  Target   : $TARGET (weight=$WEIGHT)"
echo ""

# ── Attendre que Kong soit disponible ────────────────────────────────────────
if ! curl -sf "$KONG_ADMIN/status" > /dev/null 2>&1; then
  echo "✗ Kong Admin inaccessible à $KONG_ADMIN"
  echo "  Vérifiez que Kong est démarré (docker compose up kong)"
  exit 1
fi

# ── 1. Créer l'upstream si inexistant ────────────────────────────────────────
EXISTING=$(curl -s -o /dev/null -w "%{http_code}" "$KONG_ADMIN/upstreams/$UPSTREAM")
if [ "$EXISTING" = "404" ]; then
  echo "→ Upstream $UPSTREAM inexistant, création..."
  curl -s -X POST "$KONG_ADMIN/upstreams" \
    -H "Content-Type: application/json" \
    -d "{
      \"name\": \"$UPSTREAM\",
      \"algorithm\": \"round-robin\",
      \"healthchecks\": {
        \"active\": {
          \"type\": \"http\",
          \"http_path\": \"/health\",
          \"timeout\": 3,
          \"healthy\": { \"interval\": 10, \"successes\": 2 },
          \"unhealthy\": { \"interval\": 5, \"http_failures\": 3 }
        },
        \"passive\": {
          \"healthy\": { \"successes\": 5 },
          \"unhealthy\": { \"http_failures\": 5 }
        }
      }
    }" > /dev/null
  echo "  ✔ Upstream $UPSTREAM créé"
else
  echo "  ✔ Upstream $UPSTREAM déjà présent"
fi

# ── 2. Enregistrer le Target ──────────────────────────────────────────────────
HTTP=$(curl -s -o /tmp/kong_reg_resp.json -w "%{http_code}" \
  -X POST "$KONG_ADMIN/upstreams/$UPSTREAM/targets" \
  -H "Content-Type: application/json" \
  -d "{\"target\": \"$TARGET\", \"weight\": $WEIGHT}")

if [ "$HTTP" = "201" ]; then
  TARGET_ID=$(cat /tmp/kong_reg_resp.json | python3 -c "import sys,json; print(json.load(sys.stdin).get('id','?'))" 2>/dev/null || echo "?")
  echo "  ✔ Target enregistré (id=$TARGET_ID)"
else
  echo "  ✗ Erreur lors de l'enregistrement (HTTP $HTTP)"
  cat /tmp/kong_reg_resp.json 2>/dev/null
  exit 1
fi

# ── 3. Afficher l'état de l'upstream ─────────────────────────────────────────
echo ""
echo "→ État de l'upstream $UPSTREAM :"
HEALTH=$(curl -s "$KONG_ADMIN/upstreams/$UPSTREAM/health" 2>/dev/null)
if command -v python3 &> /dev/null; then
  echo "$HEALTH" | python3 -c "
import sys, json
try:
  d = json.load(sys.stdin)
  targets = d.get('data', [])
  for t in targets:
    status = t.get('health', 'UNKNOWN')
    addr   = t.get('target', '?')
    w      = t.get('weight', '?')
    icon   = '✅' if status == 'HEALTHY' else ('❌' if status == 'UNHEALTHY' else '⏳')
    print(f'  {icon} {addr}  weight={w}  status={status}')
  print(f'  Total instances : {len(targets)}')
except:
  print('  (impossible de parser la réponse)')
" 2>/dev/null
else
  echo "$HEALTH"
fi

echo ""
echo "✅ $TARGET enregistré dans $UPSTREAM"
echo "   Pour vérifier : curl $KONG_ADMIN/upstreams/$UPSTREAM/health"
echo "   Pour retirer  : bash kong/deregister.sh $SERVICE_NAME $TARGET"
