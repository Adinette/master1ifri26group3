-- =====================================================================
-- SFMC Bénin — Création de toutes les tables (idempotent)
-- =====================================================================
-- Ce script crée TOUTES les tables nécessaires aux 9 microservices et au
-- BFF root, dans l'unique base partagée `apiProjet`.
--
-- IMPORTANT : ne JAMAIS utiliser `prisma db push` schéma par schéma sur
-- cette base. Prisma considère chaque schéma comme la source de vérité
-- TOTALE et droppe les tables qui n'y figurent pas. Utiliser ce script
-- SQL à la place pour la création / mise à jour structurelle.
--
-- Le client TypeScript (`@prisma/client`) reste généré normalement par
-- `npx prisma generate --schema services/<svc>/prisma/schema.prisma`.
-- =====================================================================

-- ---------------------------------------------------------------------
-- Table `users` (partagée : NextAuth root + user-service)
-- ---------------------------------------------------------------------
-- Union des colonnes des 2 schémas Prisma qui mappent vers `users` :
--   - prisma/schema.prisma (NextAuth) : name/email/password/email_verified_at/provider/provider_id
--   - services/user/prisma/schema.prisma : name/email/password/role/phone
CREATE TABLE IF NOT EXISTS users (
  id                 SERIAL        PRIMARY KEY,
  name               VARCHAR(255)  NOT NULL,
  email              VARCHAR(255)  UNIQUE NOT NULL,
  password           VARCHAR(255)  NOT NULL,
  email_verified_at  TIMESTAMP     NULL,
  provider           VARCHAR(255)  NULL,
  provider_id        VARCHAR(255)  NULL,
  role               VARCHAR(50)   NOT NULL DEFAULT 'user',
  phone              VARCHAR(20)   NULL,
  created_at         TIMESTAMP     NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMP     NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- Table `password_reset_tokens` (root)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  email       VARCHAR(255) PRIMARY KEY,
  token       VARCHAR(255) NOT NULL,
  created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- Table `auth_users` (auth-service, séparée pour le micro-service auth)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS auth_users (
  id          SERIAL       PRIMARY KEY,
  email       VARCHAR(255) UNIQUE NOT NULL,
  password    VARCHAR(255) NOT NULL,
  name        VARCHAR(255) NOT NULL,
  role        VARCHAR(50)  NOT NULL DEFAULT 'user',
  created_at  TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- Table `products` (product-service)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id           SERIAL       PRIMARY KEY,
  name         VARCHAR(255) NOT NULL,
  category     VARCHAR(100) NOT NULL,
  unit         VARCHAR(50)  NOT NULL,
  price        DOUBLE PRECISION NOT NULL,
  description  TEXT         NULL,
  created_at   TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- Tables `warehouses` / `stocks` / `movements` (inventory-service)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS warehouses (
  id          SERIAL       PRIMARY KEY,
  name        VARCHAR(255) NOT NULL,
  location    VARCHAR(255) NULL,
  created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS stocks (
  id             SERIAL       PRIMARY KEY,
  product_id     INTEGER      NOT NULL,
  product_name   VARCHAR(255) NOT NULL,
  warehouse_id   INTEGER      NOT NULL REFERENCES warehouses(id) ON DELETE RESTRICT,
  quantity       INTEGER      NOT NULL DEFAULT 0,
  min_threshold  INTEGER      NOT NULL DEFAULT 10,
  updated_at     TIMESTAMP    NOT NULL DEFAULT NOW(),
  UNIQUE(product_id, warehouse_id)
);

CREATE TABLE IF NOT EXISTS movements (
  id            SERIAL       PRIMARY KEY,
  product_id    INTEGER      NOT NULL,
  product_name  VARCHAR(255) NOT NULL,
  warehouse_id  INTEGER      NOT NULL REFERENCES warehouses(id) ON DELETE RESTRICT,
  type          VARCHAR(3)   NOT NULL,
  quantity      INTEGER      NOT NULL,
  reason        VARCHAR(255) NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- Table `orders` (order-service)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id            SERIAL       PRIMARY KEY,
  client_name   VARCHAR(255) NOT NULL,
  product_id    INTEGER      NOT NULL,
  product_name  VARCHAR(255) NOT NULL,
  quantity      INTEGER      NOT NULL,
  total_price   DOUBLE PRECISION NOT NULL,
  status        VARCHAR(50)  NOT NULL DEFAULT 'pending',
  created_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- Table `production_batches` (production-service)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS production_batches (
  id            SERIAL       PRIMARY KEY,
  product_id    INTEGER      NOT NULL,
  product_name  VARCHAR(255) NOT NULL,
  quantity      INTEGER      NOT NULL,
  status        VARCHAR(50)  NOT NULL DEFAULT 'planned',
  start_date    TIMESTAMP    NOT NULL,
  end_date      TIMESTAMP    NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- Tables `invoices` / `payments` (billing-service)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS invoices (
  id            SERIAL       PRIMARY KEY,
  order_id      INTEGER      NOT NULL,
  client_name   VARCHAR(255) NOT NULL,
  amount        DOUBLE PRECISION NOT NULL,
  status        VARCHAR(50)  NOT NULL DEFAULT 'pending',
  due_date      TIMESTAMP    NOT NULL,
  paid_at       TIMESTAMP    NULL,
  created_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS payments (
  id                     SERIAL           PRIMARY KEY,
  invoice_id             INTEGER          NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  amount                 DOUBLE PRECISION NOT NULL,
  method                 VARCHAR(50)      NOT NULL,
  gateway_provider       VARCHAR(100)     NULL,
  gateway_transaction_id VARCHAR(255)     NULL,
  gateway_status         VARCHAR(50)      NULL,
  created_at             TIMESTAMP        NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- Table `notifications` (notification-service)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id          SERIAL       PRIMARY KEY,
  type        VARCHAR(100) NOT NULL,
  message     TEXT         NOT NULL,
  recipient   VARCHAR(255) NOT NULL,
  status      VARCHAR(50)  NOT NULL DEFAULT 'sent',
  created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- Table `reports` (reporting-service)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reports (
  id          SERIAL       PRIMARY KEY,
  type        VARCHAR(100) NOT NULL,
  data        JSONB        NOT NULL,
  created_at  TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------
-- Index utiles pour les performances
-- ---------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_orders_status      ON orders(status);
CREATE INDEX IF NOT EXISTS idx_invoices_status    ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_order     ON invoices(order_id);
CREATE INDEX IF NOT EXISTS idx_movements_product  ON movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stocks_product     ON stocks(product_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
