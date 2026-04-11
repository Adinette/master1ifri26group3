#!/bin/bash
KONG_ADMIN="http://localhost:8001"

echo "Enregistrement des services dans Kong..."

services=(
  "auth-service|http://host.docker.internal:3001"
  "user-service|http://host.docker.internal:3002"
  "product-service|http://host.docker.internal:3003"
  "inventory-service|http://host.docker.internal:3004"
  "order-service|http://host.docker.internal:3005"
  "production-service|http://host.docker.internal:3006"
  "billing-service|http://host.docker.internal:3007"
  "notification-service|http://host.docker.internal:3008"
  "reporting-service|http://host.docker.internal:3009"
)

routes=(
  "auth-service|/api/auth"
  "user-service|/api/users"
  "product-service|/api/products"
  "inventory-service|/api/inventory"
  "order-service|/api/orders"
  "production-service|/api/production"
  "billing-service|/api/billing"
  "notification-service|/api/notify"
  "reporting-service|/api/reports"
)

for entry in "${services[@]}"; do
  name="${entry%%|*}"
  url="${entry##*|}"
  curl -s -X POST "$KONG_ADMIN/services" \
    --data "name=$name" \
    --data "url=$url"
  echo " ✔ Service $name enregistré"
done

for entry in "${routes[@]}"; do
  service="${entry%%|*}"
  path="${entry##*|}"
  curl -s -X POST "$KONG_ADMIN/services/$service/routes" \
    --data "paths[]=$path" \
    --data "name=$service-route"
  echo " ✔ Route $path → $service"
done

echo "Done ! Kong est configuré."