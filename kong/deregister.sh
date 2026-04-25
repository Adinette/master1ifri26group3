#!/bin/bash
# =============================================================================
# SFMC Bénin — Désenregistrement dynamique d'une instance de service dans Kong
# =============================================================================
# Usage :
#   bash kong/deregister.sh <service-name> <host:port>
#
# Exemples :
#   bash kong/deregister.sh auth-service host.docker.internal:3001
#   bash kong/deregister.sh auth-service host.docker.internal:3011  # 2e instance
#
# Le script :
#   1. Trouve le target dans l'upstream correspondant
#   2. Le supprime (weight=0 ou DELETE selon l'option)
#   3. Affiche l'état de l'upstream après suppression
#
# Note : Kong conserve l'historique des targets supprimés pour l'audit.
#        Les targets avec weight=0 sont exclus du load balancing.
# =============================================================================

KONG_ADMIN="${KONG_ADMIN_URL:-http://localhost:8001}"

# ── Validation des arguments ─────────────────────────────────────────────────
SERVICE_NAME="$1"
TARGET="$2"

if [ -z "$SERVICE_NAME" ] || [ -z "$TARGET" ]; then
  echo "Usage: bash kong/deregister.sh <service-name> <host:port>"
  echo "  Ex : bash kong/deregister.sh auth-service host.docker.internal:3001"
  exit 1
fi

# Validation sécurité (éviter injection dans l'URL curl)
if ! echo "$TARGET" | grep -qE '^[a-zA-Z0-9._-]+:[0-9]{1,5}$'; then
  echo "✗ Format invalide pour TARGET. Attendu: hostname:port"
  exit 1
fi

if ! echo "$SERVICE_NAME" | grep -qE '^[a-zA-Z0-9_-]+$'; then
  echo "✗ SERVICE_NAME contient des caractères non autorisés"
  exit 1
fi

# Dériver le nom de l'upstream
UPSTREAM="${SERVICE_NAME%%-service}-upstream"
if [ "$UPSTREAM" = "$SERVICE_NAME-upstream" ]; then
  UPSTREAM="${SERVICE_NAME}-upstream"
fi

echo "┌─────────────────────────────────────────────┐"
echo "│  Kong Service Discovery — Désenregistrement │"
echo "└─────────────────────────────────────────────┘"
echo "  Service  : $SERVICE_NAME"
echo "  Upstream : $UPSTREAM"
echo "  Target   : $TARGET"
echo ""

# ── Vérifier que Kong est accessible ─────────────────────────────────────────
if ! curl -sf "$KONG_ADMIN/status" > /dev/null 2>&1; then
  echo "✗ Kong Admin inaccessible à $KONG_ADMIN"
  exit 1
fi

# ── 1. Trouver le Target ID dans l'Upstream ───────────────────────────────────
echo "→ Recherche du target $TARGET dans $UPSTREAM..."

TARGETS_JSON=$(curl -s "$KONG_ADMIN/upstreams/$UPSTREAM/targets/all" 2>/dev/null)
if [ $? -ne 0 ] || echo "$TARGETS_JSON" | grep -q '"message"'; then
  echo "✗ Upstream $UPSTREAM introuvable ou Kong inaccessible"
  echo "  Vérifiez : curl $KONG_ADMIN/upstreams/$UPSTREAM"
  exit 1
fi

# Chercher le target actif (weight > 0) correspondant
if command -v python3 &> /dev/null; then
  TARGET_ID=$(echo "$TARGETS_JSON" | python3 -c "
import sys, json
try:
  data = json.load(sys.stdin).get('data', [])
  # Trouver le target actif le plus récent (Kong peut avoir des doublons)
  hits = [t for t in data if t.get('target') == '$TARGET' and t.get('weight', 0) > 0]
  # Trier par created_at décroissant
  hits.sort(key=lambda t: t.get('created_at', 0), reverse=True)
  print(hits[0]['id'] if hits else '')
except Exception as e:
  print('')
" 2>/dev/null)
else
  echo "⚠ python3 non disponible — impossible de parser la réponse Kong"
  echo "  Supprimez manuellement : DELETE $KONG_ADMIN/upstreams/$UPSTREAM/targets/<id>"
  exit 1
fi

if [ -z "$TARGET_ID" ]; then
  echo "✗ Target $TARGET introuvable (ou déjà weight=0) dans $UPSTREAM"
  echo ""
  echo "  Targets actuels :"
  echo "$TARGETS_JSON" | python3 -c "
import sys, json
data = json.load(sys.stdin).get('data', [])
for t in data:
  print(f\"    {t.get('target')}  weight={t.get('weight')}  id={t.get('id','?')[:8]}...\")
" 2>/dev/null
  exit 1
fi

echo "  ✔ Target trouvé (id=${TARGET_ID:0:8}...)"

# ── 2. Supprimer le Target ────────────────────────────────────────────────────
HTTP=$(curl -s -o /dev/null -w "%{http_code}" \
  -X DELETE "$KONG_ADMIN/upstreams/$UPSTREAM/targets/$TARGET_ID")

if [ "$HTTP" = "204" ]; then
  echo "  ✔ Target $TARGET supprimé de $UPSTREAM"
else
  echo "  ✗ Erreur lors de la suppression (HTTP $HTTP)"
  exit 1
fi

# ── 3. Afficher l'état résiduel ───────────────────────────────────────────────
echo ""
echo "→ État de l'upstream $UPSTREAM après désenregistrement :"
HEALTH=$(curl -s "$KONG_ADMIN/upstreams/$UPSTREAM/health" 2>/dev/null)
REMAINING=$(echo "$HEALTH" | python3 -c "
import sys, json
try:
  data = json.load(sys.stdin).get('data', [])
  active = [t for t in data if t.get('weight', 0) > 0]
  for t in active:
    status = t.get('health', 'UNKNOWN')
    addr   = t.get('target', '?')
    w      = t.get('weight', '?')
    icon   = '✅' if status == 'HEALTHY' else ('❌' if status == 'UNHEALTHY' else '⏳')
    print(f'  {icon} {addr}  weight={w}  status={status}')
  if not active:
    print('  ⚠ Aucun target actif — le service est hors ligne !')
  print(f'  Instances restantes : {len(active)}')
except:
  print('  (impossible de parser la réponse)')
" 2>/dev/null)
echo "$REMAINING"

echo ""
echo "✅ $TARGET retiré de $UPSTREAM"
echo "   Pour réenregistrer : bash kong/register.sh $SERVICE_NAME $TARGET"
