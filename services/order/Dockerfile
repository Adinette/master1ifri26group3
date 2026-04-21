FROM node:20-alpine

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci

# Copier le code source
COPY . .

# Générer Prisma Client
RUN npx prisma generate

# Builder l'application Next.js
RUN npm run build

# Exposer le port
EXPOSE 3005

# Démarrer l'application
CMD ["npm", "start"]
