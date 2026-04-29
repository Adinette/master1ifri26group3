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
> Cahier des charges complet : `docs/Cahier_des_charges.pdf`.

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

## Fonctionnalités clés livrées

La livraison couvre les principaux processus du cahier des charges, avec une
coordination distribuée par événements RabbitMQ et une orchestration côté BFF.

- **Authentification** : NextAuth (credentials + Google OAuth), JWT, sessions
  partagées entre les microservices.
- **Catalogue & stock** : CRUD produits, mouvements multi-types
  (`in` / `out` / `adjust` / `release`), seuils d'alerte automatiques.
- **Commandes** : cycle de vie complet (`pending` → `validated` → `shipped`),
  réservation automatique de stock à la création.
- **Saga d'annulation distribuée** : `POST /api/orders/:id/cancel` libère le
  stock (Inventory), annule les factures (Billing), publie `order.cancelled`
  sur RabbitMQ.
- **Production** : création de lots, passage à `completed` qui republie
  `stock.updated` pour réapprovisionner automatiquement.
- **Notifications** : consumer dédié écoutant `order.created`,
  `payment.confirmed`, `stock.alert`.
- **Reporting / Dashboard** : KPIs temps réel agrégés depuis tous les
  microservices, avec timeouts (800 ms) et cache *stale-while-error* (30 s)
  pour rester réactif même en cas de panne partielle.

> Détails techniques d'implémentation et historique des phases :
> voir `docs/Rapport_Projet_TWM_Phase12.docx`.

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

- `docs/Cahier_des_charges.pdf` : cahier des charges fonctionnel.
- `docs/Guide_Google_OAuth.html` : guide d'intégration Google OAuth.
- `docs/Rapport_Projet_TWM_Phase12.docx` : rapport de projet (livraison finale).

## Liens de base (en local)

- **Accueil** : <http://localhost:3000>
- **Catalogue** : <http://localhost:3000/catalogue>
- **Login** : <http://localhost:3000/front/auth/login>
- **Dashboard** : <http://localhost:3000/dashboard>
- **Kong Admin** : <http://localhost:8001>
- **RabbitMQ UI** : <http://localhost:15672>