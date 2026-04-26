# SFMC Bénin

Plateforme microservices de supervision et pilotage pour SFMC Bénin.
Le dépôt technique conserve le nom tp_twm.

> Branche active : `phase-12-ui-theme-dashboard` (itération finale Phase 12).

## Stack

- Frontend principal: Next.js 16, React 19, TypeScript, Tailwind CSS 4
- Architecture: BFF dans app/api + microservices metier dans services/*
- Messagerie: RabbitMQ (exchange sfmc.events)
- Base de donnees: PostgreSQL via Prisma
- API Gateway: Kong

## Services et ports

- Frontend principal: 3000
- Auth Service: 3001
- User Service: 3002
- Product Service: 3003
- Inventory Service: 3004
- Order Service: 3005
- Production Service: 3006
- Billing Service: 3007
- Notification Service: 3008
- Reporting Service: 3009
- Kong Proxy: 8000
- Kong Admin: 8001
- RabbitMQ: 5672
- RabbitMQ UI: 15672

## Prerequis

- Node.js 20+
- npm 10+
- Docker Desktop
- Fichier .env configure

## Demarrage local

1. Installer les dependances:

npm install

2. Demarrer l'infrastructure:

npm run dev:infra

3. Demarrer les microservices:

npm run dev:services

4. Demarrer le frontend principal:

npm run dev

Option tout-en-un (infra + front + services):

npm run dev:full

## Verification technique

Build racine:

npm run build

Build service production:

npm --prefix services/production run build

Note: sur Windows, un lint global peut etre ralenti si des dossiers .next de services existent deja.

## Verification fonctionnelle Frontend

- Navigation dashboard sans incoherence:
  - billing, notifications, orders, production, products, profile, reporting, services, settings, stock, users, versions
- Pages metier:
  - Produits: creation/modification/suppression
  - Commandes: creation + changement de statut
  - Stock: mouvements IN/OUT + visualisation alertes
  - Production: creation lot + passage completed
  - Notifications: lecture + actualisation

## Verification fonctionnelle Backend et evenements

1. Creation commande:
- Order Service tente la reservation auto de stock via Inventory.
- Si stock suffisant: commande validated.
- Si stock insuffisant: commande pending + emission stock.alert.

2. Reaction production:
- Production consumer ecoute stock.alert.
- Creation auto d un lot de production planifie.

3. Remise en stock:
- Quand un lot passe a completed, Production publie stock.updated.
- Inventory consumer recoit stock.updated et incremente le stock.

4. Notifications:
- Notification consumer ecoute order.created, payment.confirmed, stock.alert.
- Les notifications sont enregistrees et exposees par API.

## Initialisation des consumers RabbitMQ

Appeler ces endpoints apres demarrage local:

- http://localhost:3004/api/init
- http://localhost:3006/api/init
- http://localhost:3008/api/init

## Correctifs inclus dans cette livraison

- Correction JSX de la sidebar dashboard.
- Stabilisation build de services/production avec Prisma lazy client.
- Correction Next.js 16 sur auth:
  - extraction de la config NextAuth dans app/lib/auth-options.ts
  - suppression de l export non autorise dans la route app/api/auth/[...nextauth]/route.ts
- Build racine valide apres correction.
- Build services/production valide.

## Phase 12 - Itération finale (avril 2026)

Cette dernière passe consolide trois axes : conformité métier (saga d annulation),
performance perceptive du dashboard, et cohérence visuelle de la marque.

### 1. Annulation de commande - saga complète

- Endpoint `POST /api/orders/:id/cancel` orchestre la saga :
  - Inventory : `POST /api/stock/release` libère le stock réservé.
  - Billing : `POST /api/invoices/cancel-by-order/:orderId` annule les factures non payées.
  - Order : statut `cancelled`, publication `order.cancelled` sur RabbitMQ.
- Frontend : bouton Annuler avec confirmation sur `/dashboard/orders`.
- Reporting : KPI `cancelledOrders` ajouté au tableau de bord.
- Inventory publie `stock.updated` sur **tout** mouvement (in / out / adjust / release)
  pour que reporting reste en phase avec le stock réel.

### 2. Performance du dashboard

- Proxy `/api/reporting/dashboard` : cache mémoire 30 s + stale-while-error
  (ressert l ancienne copie si reporting plante).
- Reporting `dashboard/route.ts` : timeout 800 ms par appel micro-service
  (`AbortSignal.timeout`) et bascule en `available:false` si un micro est lent.
- `/api/services-status` et `/api/kong-status` : cache 10 s, timeout 600 ms par probe,
  dédoublonnage des requêtes concurrentes (in-flight coalescing).
- `app/dashboard/page.tsx` : `React.memo` sur `KpiCard`, `BarChart`, `DonutChart`,
  `InfraDot` ; les health-checks d infra sont différés de 200 ms après le premier paint
  pour donner la priorité réseau au reporting.
- Helper client `app/lib/client-cache.ts` : cache mémoire 5 s + déduplication
  des fetches GET, adopté dans `/dashboard/orders`, `/dashboard/billing`,
  `/dashboard/production`. Les mutations invalident proprement (cross-page :
  l annulation d une commande invalide stock + factures).
- Correction `react-hooks/immutability` (React 19) sur `DonutChart` :
  remplacement de la mutation d offset par un `reduce`.

### 3. Cohérence de marque

- Marque unifiée en « SFMC Bénin » partout dans l UI :
  - `app/components/DashboardSidebar.tsx` (desktop) corrigé (était « Bénin ERP »).
  - `app/layout.tsx` : metadata title et description avec accents.
  - `app/front/auth/login/page.tsx` : titre de connexion aligné.
- Identifiants techniques laissés intacts : domaine `sfmc-benin.bj`, animation CSS
  `sfmc-ticker`, URL WhatsApp encodées.

### 4. Vérifications

- `npx tsc --noEmit` : OK sur le root et les microservices (après `prisma generate`
  par service en mono-repo).
- `npx eslint app/**/*.{ts,tsx}` : aucune erreur introduite par cette livraison.
- Builds Next.js et Prisma stables.

### Fichiers clés ajoutés ou modifiés

Nouveaux endpoints :

- `services/inventory/app/api/stock/release/route.ts`
- `services/billing/app/api/invoices/cancel-by-order/[orderId]/route.ts`
- `services/order/app/api/orders/[id]/cancel/route.ts`
- `app/api/orders/[id]/cancel/route.ts` (proxy)

Nouveaux helpers :

- `app/lib/client-cache.ts`
- `services/inventory/lib/stock-workflow.ts` : `releaseStockForOrder`
- `services/billing/lib/billing-store.ts` : `cancelInvoice`, `cancelInvoicesByOrder`

Mises à jour notables :

- `app/api/reporting/dashboard/route.ts` (cache 30 s)
- `app/api/services-status/route.ts`, `app/api/kong-status/route.ts` (cache + coalescing)
- `services/reporting/app/api/dashboard/route.ts` (timeouts + KPI annulations)
- `app/dashboard/page.tsx`, `app/dashboard/orders/page.tsx`, `app/dashboard/billing/page.tsx`,
  `app/dashboard/production/page.tsx`

## Arborescence utile

- app: frontend principal, pages, dashboard, BFF
- services: microservices metier
- prisma: schema Prisma principal
- docs: documents et scripts de generation
- docker-compose.yml: infra locale

## Liens de base

- Accueil: http://localhost:3000
- Catalogue: http://localhost:3000/catalogue
- Login: http://localhost:3000/front/auth/login
- Dashboard: http://localhost:3000/dashboard