# SFMC Benin

Plateforme microservices de supervision et pilotage pour SFMC Benin.
Le depot technique conserve le nom tp_twm.

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