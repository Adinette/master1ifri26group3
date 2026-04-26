# 🚀 Quick Start Phase 11 - Démarrage Rapide

**Branche**: `phase-11-inventory-fix`  
**Status**: ✅ Production Ready  
**Rapport détaillé**: [RAPPORT_PHASE_11.md](./RAPPORT_PHASE_11.md)

---

## 📋 Résumé des Changements (Phase 10 → Phase 11)

### Ce qui a été fixé:
- ✅ **Inventory Service**: Résolution erreurs 500 sur /api/stock, /api/mouvements, /api/warehouses
- ✅ **Cache Prisma**: Isolation clé de cache global (prisma → inventoryPrisma)
- ✅ **RabbitMQ Events**: Validation flux production.completed → stock.updated → auto-batch
- ✅ **9 Services**: Tous opérationnels avec health checks
- ✅ **144 fichiers**: Modification et mise à jour complète (9,775 insertions)

---

## 🎯 Choix d'Approche

### Option 1️⃣: Installation Nouvelle (Recommandé pour test complet)

```bash
# 1. Cloner le projet
git clone https://github.com/Adinette/tp_twm.git
cd tp_twm

# 2. Checkout Phase 11
git checkout phase-11-inventory-fix

# 3. Installer dépendances (main app)
npm install

# 4. Installer dépendances services (9 microservices)
npm --prefix services/auth install
npm --prefix services/billing install
npm --prefix services/inventory install
npm --prefix services/notification install
npm --prefix services/order install
npm --prefix services/product install
npm --prefix services/production install
npm --prefix services/reporting install
npm --prefix services/user install

# 5. Générer Prisma clients
npx prisma generate
npm --prefix services/auth run prisma:generate
npm --prefix services/billing run prisma:generate
npm --prefix services/inventory run prisma:generate
npm --prefix services/notification run prisma:generate
npm --prefix services/order run prisma:generate
npm --prefix services/product run prisma:generate
npm --prefix services/production run prisma:generate
npm --prefix services/reporting run prisma:generate
npm --prefix services/user run prisma:generate

# 6. Démarrer (2 terminaux)
Terminal 1: npm run dev:infra
Terminal 2: npm run dev:full
```

### Option 2️⃣: Mise à Jour Installation Existante

```bash
# 1. Sauvegarder votre travail
git checkout -b backup/my-changes-$(date +%s)
git push origin backup/my-changes-$(date +%s)

# 2. Retourner à main branch
git checkout chore/validation-front-back-readme

# 3. Merge Phase 11
git fetch origin
git merge origin/phase-11-inventory-fix

# 4. Réinstaller dépendances
rm -r node_modules package-lock.json
npm install

# Services
foreach ($service in @('auth','billing','inventory','notification','order','product','production','reporting','user')) {
  rm -r services/$service/node_modules services/$service/package-lock.json
  npm --prefix services/$service install
}

# 5. Régénérer Prisma
npx prisma generate
foreach ($service in @('auth','billing','inventory','notification','order','product','production','reporting','user')) {
  npm --prefix services/$service run prisma:generate
}

# 6. Redémarrer infrastructure
npm run dev:full
```

---

## ⚡ Démarrage Rapide (Installation Déjà Faite)

```bash
# Terminal 1: Infrastructure (RabbitMQ, PostgreSQL, Kong)
npm run dev:infra

# Terminal 2: Tous les services + Frontend (10 processes)
npm run dev:full

# Ou plus contrôlé:
Terminal 1: npm run dev:infra
Terminal 2: npm run dev:services
Terminal 3: npm run dev
Terminal 4 (après ~30s): node scripts/init-consumers.mjs
```

### URLs Après Démarrage:
```
Frontend:              http://localhost:3000
Dashboard:             http://localhost:3000/dashboard
Main API:              http://localhost:3000/api/health
Auth Service:          http://localhost:3001/api/health
Inventory Service:     http://localhost:3004/api/health
Production Service:    http://localhost:3006/api/health
... (autres services: 3002, 3005, 3007, 3008, 3009)

RabbitMQ Admin:        http://localhost:15672 (guest/guest)
Kong Admin:            http://localhost:8001
```

---

## 📊 Vérification Santé Services

```powershell
# Vérifier tous les services (Windows PowerShell)
$services = @(
  ('Main',        'http://localhost:3000/api/health'),
  ('Auth',        'http://localhost:3001/api/health'),
  ('Billing',     'http://localhost:3002/api/health'),
  ('Inventory',   'http://localhost:3004/api/health'),
  ('Notification','http://localhost:3005/api/health'),
  ('Production',  'http://localhost:3006/api/health'),
  ('Order',       'http://localhost:3007/api/health'),
  ('Reporting',   'http://localhost:3008/api/health'),
  ('User',        'http://localhost:3009/api/health')
)

foreach ($svc in $services) {
  try {
    $resp = Invoke-WebRequest -Uri $svc[1] -UseBasicParsing -TimeoutSec 2
    Write-Host "✅ $($svc[0])" -ForegroundColor Green
  } catch {
    Write-Host "❌ $($svc[0])" -ForegroundColor Red
  }
}
```

---

## 🧪 Tester les Flux RabbitMQ

### Flux 1: Production Completed → Stock Update
```powershell
# Avant (noter stock quantity)
Invoke-WebRequest -Uri 'http://localhost:3004/api/stock' -UseBasicParsing

# Marquer production batch comme completed
Invoke-WebRequest -Uri 'http://localhost:3006/api/production/8' `
  -Method PUT -Body '{"status":"completed"}' `
  -ContentType 'application/json' -UseBasicParsing

# Attendre 4s pour RabbitMQ
Start-Sleep -Seconds 4

# Après (stock quantity devrait augmenter de +2)
Invoke-WebRequest -Uri 'http://localhost:3004/api/stock' -UseBasicParsing
```

### Flux 2: Stock Alert → Auto-Batch Production
```powershell
# Avant (noter nombre de batches)
$before = (Invoke-WebRequest -Uri 'http://localhost:3006/api/production' -UseBasicParsing).Content | ConvertFrom-Json
$before.Count

# Publier stock alert via RabbitMQ
node -e "
const amqplib = require('amqplib');
(async () => {
  const conn = await amqplib.connect('amqp://guest:guest@localhost:5672');
  const ch = await conn.createChannel();
  await ch.assertExchange('sfmc.events','topic',{durable:true});
  const payload = {
    trigger: 'insufficient-stock',
    productId: 1,
    shortage: 429
  };
  ch.publish('sfmc.events','stock.alert',Buffer.from(JSON.stringify(payload)),{persistent:true});
  setTimeout(() => {conn.close()}, 500);
})();
"

# Attendre 4s
Start-Sleep -Seconds 4

# Après (nouvelles batches créées)
$after = (Invoke-WebRequest -Uri 'http://localhost:3006/api/production' -UseBasicParsing).Content | ConvertFrom-Json
$after.Count
```

---

## 🔧 Commandes Essentielles

```bash
# Installer nouvelle dépendance
npm install package-name
npm --prefix services/inventory install package-name

# Régénérer Prisma après changement schema
npx prisma generate
npm --prefix services/inventory run prisma:generate

# Voir logs d'un service
docker logs tp_twm-postgres-1    # DB
docker logs tp_twm-rabbitmq-1    # RabbitMQ

# Arrêter tout
docker compose down

# Arrêter et nettoyer (⚠️ perte data)
docker compose down -v

# Test code
npm test
```

---

## 📖 Documentations

- **Rapport complet**: [RAPPORT_PHASE_11.md](./RAPPORT_PHASE_11.md)
  - Tous les 144 changements détaillés
  - Guide déploiement complet
  - Troubleshooting
  - Leçons apprises

- **README Principal**: [README.md](./README.md)
  - Architecture général
  - Structure projet
  - Scripts disponibles

---

## ❓ Troubleshooting

| Problème | Solution |
|----------|----------|
| Port déjà en utilisation | `npx kill-port 3004` |
| Docker pas accessible | Démarrer Docker Desktop |
| Prisma client missing | `npx prisma generate` |
| DB connexion error | Vérifier `npm run dev:infra` |
| RabbitMQ unavailable | Vérifier logs: `docker logs tp_twm-rabbitmq-1` |

Plus de détails: Voir section "Troubleshooting" dans [RAPPORT_PHASE_11.md](./RAPPORT_PHASE_11.md#36-troubleshooting-démarrage)

---

## ✅ Checklist Avant Production

- [ ] Branche `phase-11-inventory-fix` clonée ou mergée
- [ ] Toutes dépendances installées (`npm install`)
- [ ] Dépendances services installées (9 services)
- [ ] Prisma clients générés (`npx prisma generate`)
- [ ] Infrastructure démarrée (`npm run dev:infra`)
- [ ] Services démarrés (`npm run dev:full` ou équivalent)
- [ ] Health checks passent ✅ pour tous services
- [ ] Flux RabbitMQ testés (stock.updated et stock.alert)
- [ ] Frontend accessible (http://localhost:3000)
- [ ] Rapport examiné: [RAPPORT_PHASE_11.md](./RAPPORT_PHASE_11.md)

---

## 🎬 Prochaines Étapes

1. **Merger vers main**: `git checkout main && git merge phase-11-inventory-fix`
2. **Créer PR**: [Créer PR via GitHub](https://github.com/Adinette/tp_twm/pull/new/phase-11-inventory-fix)
3. **Review et Approuve**: Attendre approbation
4. **Déployer**: Push vers production

---

**Généré**: 26 avril 2026  
**Branch**: `phase-11-inventory-fix`  
**Pour plus de détails**: Voir [RAPPORT_PHASE_11.md](./RAPPORT_PHASE_11.md)
