# SFMC Bénin

Plateforme microservices de supervision et de pilotage pour la **SFMC Bénin**,
entreprise spécialisée dans la production et la distribution de matériaux de
construction (ciment, fer, briques, granulats).

La plateforme couvre les trois chaînes métier identifiées dans le cahier des
charges : **production**, **commerciale** et **logistique**, avec une gestion
distribuée par microservices, une communication événementielle (RabbitMQ) et
une authentification centralisée (NextAuth + JWT).

> **Projet réalisé par le Groupe 3** — Master 1 IFRI, *Technologies Web et Mobile*.
> Stack imposée : **Next.js**.
>
> **Membres :**
>
> - AGBOGBA ZOUNON Silas O. C.
> - ANATO K. Freddy
> - DOUGLOUI Adinette
>
> Cahier des charges complet : `docs/CAHIER DES CHARGES DÉTAILLÉ-Bon.pdf`.

## Stack

- **Frontend principal** : Next.js 16, React 19, TypeScript, Tailwind CSS 4
- **Architecture** : BFF dans `app/api` + microservices métier dans `services/*`
- **Messagerie** : RabbitMQ (exchange `sfmc.events`)
- **Base de données** : PostgreSQL via Prisma
- **API Gateway** : Kong
- **Auth** : NextAuth (config dans `app/lib/auth-options.ts`)

## Services et ports

| Service | Port |
| --- | --- |
| Frontend principal | 3000 |
| Auth Service | 3001 |
| User Service | 3002 |
| Product Service | 3003 |
| Inventory Service | 3004 |
| Order Service | 3005 |
| Production Service | 3006 |
| Billing Service | 3007 |
| Notification Service | 3008 |
| Reporting Service | 3009 |
| Kong Proxy | 8000 |
| Kong Admin | 8001 |
| RabbitMQ (AMQP) | 5672 |
| RabbitMQ UI | 15672 |

## Prérequis

- Node.js 20+
- npm 10+
- Docker Desktop
- Une instance **PostgreSQL** accessible (locale ou hébergée — voir ci-dessous)
- Fichier `.env` configuré à la racine (voir section suivante)

## Configuration (`.env`)

Le projet a besoin d'un fichier **`.env`** à la racine. Un modèle complet est
fourni dans **`.env.example`** — il suffit de le copier et d'adapter les valeurs :

```bash
cp .env.example .env
```

Le fichier `.env.example` documente toutes les variables consommées par le
front, les microservices et `prisma.config.ts`. Les variables critiques :

- `DATABASE_URL` — chaîne de connexion PostgreSQL (**obligatoire**).
- `NEXTAUTH_SECRET` / `JWT_SECRET` — clés de signature des tokens.
- `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` — OAuth Google (optionnel).
- `RABBITMQ_URL` — par défaut `amqp://guest:guest@localhost:5672`
  (correspond au RabbitMQ lancé par `npm run dev:infra`).
- `*_SERVICE_URL` — URLs des microservices (défauts en local sur `localhost:3001-3009`).

> ⚠️ **À propos de PostgreSQL** : `docker-compose.yml` lance Postgres uniquement
> pour Kong, **pas** pour l'application. Il faut donc soit installer PostgreSQL
> en local, soit utiliser un service hébergé (Neon, Supabase, etc.) et adapter
> `DATABASE_URL` en conséquence.

## Démarrage local

1. Installer les dépendances :

   ```bash
   npm install
   ```

2. Créer et renseigner le fichier `.env` (voir section ci-dessus) :

   ```bash
   cp .env.example .env
   ```

3. Générer les clients Prisma (racine + 9 microservices) :

   ```bash
   npx prisma generate
   npx prisma generate --schema services/auth/prisma/schema.prisma
   npx prisma generate --schema services/user/prisma/schema.prisma
   npx prisma generate --schema services/product/prisma/schema.prisma
   npx prisma generate --schema services/inventory/prisma/schema.prisma
   npx prisma generate --schema services/order/prisma/schema.prisma
   npx prisma generate --schema services/production/prisma/schema.prisma
   npx prisma generate --schema services/billing/prisma/schema.prisma
   npx prisma generate --schema services/notification/prisma/schema.prisma
   npx prisma generate --schema services/reporting/prisma/schema.prisma
   ```

   > Astuce : un build complet (`npm run build` dans un service) exécute déjà
   > `prisma generate` automatiquement.

4. Appliquer le schéma sur la base (première installation uniquement) :

   ```bash
   npx prisma db push
   ```

5. Démarrer l'infrastructure (Docker : RabbitMQ, Kong) :

   ```bash
   npm run dev:infra
   ```

6. Démarrer les microservices :

   ```bash
   npm run dev:services
   ```

7. Démarrer le frontend principal :

   ```bash
   npm run dev
   ```

Option tout-en-un (infra + front + services + init des consumers) :

```bash
npm run dev:full
```

## Vérification technique

Build racine :

```bash
npm run build
```

Build d'un microservice (exemple : production) :

```bash
npm --prefix services/production run build
```

> Note : sur Windows, un lint global peut être ralenti si des dossiers `.next`
> de services existent déjà. Les nettoyer si besoin avant de relancer le lint.

## Vérification fonctionnelle (Frontend)

- Navigation dashboard sans incohérence sur les pages :
  `billing`, `notifications`, `orders`, `production`, `products`, `profile`,
  `reporting`, `services`, `settings`, `stock`, `users`, `versions`.
- Pages métier :
  - **Produits** : création / modification / suppression.
  - **Commandes** : création + changement de statut + annulation (saga).
  - **Stock** : mouvements IN / OUT / ADJUST / RELEASE + visualisation des alertes.
  - **Production** : création de lot + passage à `completed`.
  - **Notifications** : lecture + actualisation.

## Vérification fonctionnelle (Backend & événements)

1. **Création de commande**
   - Order Service tente la réservation automatique de stock via Inventory.
   - Si stock suffisant : commande `validated`.
   - Si stock insuffisant : commande `pending` + émission de `stock.alert`.

2. **Réaction production**
   - Le consumer Production écoute `stock.alert`.
   - Création automatique d'un lot de production planifié.

3. **Remise en stock**
   - Quand un lot passe à `completed`, Production publie `stock.updated`.
   - Le consumer Inventory reçoit `stock.updated` et incrémente le stock.

4. **Notifications**
   - Le consumer Notification écoute `order.created`, `payment.confirmed`, `stock.alert`.
   - Les notifications sont enregistrées et exposées par API.

## Initialisation des consumers RabbitMQ

Appeler ces endpoints après le démarrage local (déclenche l'abonnement aux files) :

- <http://localhost:3004/api/init>
- <http://localhost:3006/api/init>
- <http://localhost:3008/api/init>

## Correctifs inclus dans cette livraison

- Correction JSX de la sidebar dashboard.
- Stabilisation du build de `services/production` avec un client Prisma `lazy`.
- Correction Next.js 16 sur l'auth :
  - extraction de la config NextAuth dans `app/lib/auth-options.ts` ;
  - suppression de l'export non autorisé dans la route
    `app/api/auth/[...nextauth]/route.ts`.
- Build racine valide après correction.
- Build `services/production` valide.

## Phase 12 — Itération finale (avril 2026)

Cette dernière passe consolide trois axes : conformité métier (saga d'annulation),
performance perceptive du dashboard, et cohérence visuelle de la marque.

### 1. Annulation de commande — saga complète

- Endpoint `POST /api/orders/:id/cancel` orchestre la saga :
  - **Inventory** : `POST /api/stock/release` libère le stock réservé.
  - **Billing** : `POST /api/invoices/cancel-by-order/:orderId` annule les factures non payées.
  - **Order** : statut `cancelled`, publication de `order.cancelled` sur RabbitMQ.
- Frontend : bouton « Annuler » avec confirmation sur `/dashboard/orders`.
- Reporting : KPI `cancelledOrders` ajouté au tableau de bord.
- Inventory publie `stock.updated` sur **tout** mouvement (`in` / `out` / `adjust` / `release`)
  pour que reporting reste en phase avec le stock réel.

### 2. Performance du dashboard

- Proxy `/api/reporting/dashboard` : cache mémoire 30 s + stale-while-error
  (ressert l'ancienne copie si reporting plante).
- Reporting `dashboard/route.ts` : timeout 800 ms par appel micro-service
  (`AbortSignal.timeout`) et bascule en `available: false` si un micro est lent.
- `/api/services-status` et `/api/kong-status` : cache 10 s, timeout 600 ms par probe,
  dédoublonnage des requêtes concurrentes (in-flight coalescing).
- `app/dashboard/page.tsx` : `React.memo` sur `KpiCard`, `BarChart`, `DonutChart`,
  `InfraDot` ; les health-checks d'infra sont différés de 200 ms après le premier
  paint pour donner la priorité réseau au reporting.
- Helper client `app/lib/client-cache.ts` : cache mémoire 5 s + déduplication
  des fetches GET, adopté dans `/dashboard/orders`, `/dashboard/billing`,
  `/dashboard/production`. Les mutations invalident proprement (cross-page :
  l'annulation d'une commande invalide stock + factures).
- Correction `react-hooks/immutability` (React 19) sur `DonutChart` :
  remplacement de la mutation d'offset par un `reduce`.

### 3. Cohérence de marque

- Marque unifiée en « SFMC Bénin » partout dans l'UI :
  - `app/components/DashboardSidebar.tsx` (desktop) corrigé (était « Bénin ERP »).
  - `app/layout.tsx` : metadata `title` et `description` avec accents.
  - `app/front/auth/login/page.tsx` : titre de connexion aligné.
- Identifiants techniques laissés intacts : domaine `sfmc-benin.bj`, animation CSS
  `sfmc-ticker`, URL WhatsApp encodées.

### 4. Vérifications

- `npx tsc --noEmit` : OK sur le root et les microservices (après `prisma generate`
  par service en mono-repo).
- `npx eslint app/**/*.{ts,tsx}` : aucune erreur introduite par cette livraison.
- Builds Next.js et Prisma stables.

### Fichiers clés ajoutés ou modifiés

**Nouveaux endpoints :**

- `services/inventory/app/api/stock/release/route.ts`
- `services/billing/app/api/invoices/cancel-by-order/[orderId]/route.ts`
- `services/order/app/api/orders/[id]/cancel/route.ts`
- `app/api/orders/[id]/cancel/route.ts` (proxy)

**Nouveaux helpers :**

- `app/lib/client-cache.ts`
- `services/inventory/lib/stock-workflow.ts` : `releaseStockForOrder`
- `services/billing/lib/billing-store.ts` : `cancelInvoice`, `cancelInvoicesByOrder`

**Mises à jour notables :**

- `app/api/reporting/dashboard/route.ts` (cache 30 s)
- `app/api/services-status/route.ts`, `app/api/kong-status/route.ts` (cache + coalescing)
- `services/reporting/app/api/dashboard/route.ts` (timeouts + KPI annulations)
- `app/dashboard/page.tsx`, `app/dashboard/orders/page.tsx`,
  `app/dashboard/billing/page.tsx`, `app/dashboard/production/page.tsx`

## Arborescence utile

- `app/` : frontend principal, pages, dashboard, BFF (`app/api`).
- `services/` : microservices métier (auth, user, product, inventory, order,
  production, billing, notification, reporting).
- `prisma/` : schéma Prisma principal.
- `kong/` : configuration de la gateway Kong.
- `scripts/` : scripts utilitaires (`bootstrap-kong.mjs`, `init-consumers.mjs`).
- `docs/` : cahier des charges, guide OAuth et rapport de projet.
- `tests/` : tests intégration root (lancés via `npm test`).
- `docker-compose.yml` : infra locale (RabbitMQ, Kong + Postgres dédié à Kong).
  La base Postgres applicative est à fournir séparément via `DATABASE_URL`.
- `proxy.ts` : proxy de développement frontend vers les microservices.

## Documents complémentaires

- `docs/CAHIER DES CHARGES DÉTAILLÉ-Bon.pdf` : cahier des charges fonctionnel.
- `docs/Guide_Google_OAuth.html` : guide d'intégration Google OAuth.
- `docs/Rapport_Projet_TWM_Phase12.docx` : rapport de projet (livraison finale).

## Liens de base (en local)

- **Accueil** : <http://localhost:3000>
- **Catalogue** : <http://localhost:3000/catalogue>
- **Login** : <http://localhost:3000/front/auth/login>
- **Dashboard** : <http://localhost:3000/dashboard>
- **Kong Admin** : <http://localhost:8001>
- **RabbitMQ UI** : <http://localhost:15672>