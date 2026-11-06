# Gestion Staff

POC full-stack pour le pilotage d’un restaurant : authentification, rôles, catalogue, commandes et tableau de bord. La persistance utilise Supabase Database (PostgreSQL).

## Démarrage

Prérequis : Node.js 20+, npm et MongoDB local.

```powershell
npm install
Copy-Item apps/api/.env.example apps/api/.env
Copy-Item apps/web/.env.example apps/web/.env.local
npm run seed
npm run dev:api
npm run dev:web
```

Frontend : http://localhost:3000 · API : http://localhost:3001 · Swagger : http://localhost:3001/api/docs

Avant le premier lancement, crée un projet Supabase, exécute `supabase/migrations/001_initial.sql` dans le SQL Editor, puis renseigne `SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY` dans `apps/api/.env`. La clé service role reste strictement côté API.

## Lancement avec Docker

Docker Desktop doit être démarré et `apps/api/.env` doit contenir les variables Supabase :

```powershell
docker compose up --build -d
docker compose exec api node apps/api/seed.mjs
```

L’application est alors disponible sur http://localhost:3000 et Swagger sur http://localhost:3001/api/docs. Pour arrêter les services :

```powershell
docker compose down
```

Les données sont conservées dans le projet Supabase. Ajoutez un vrai `JWT_SECRET` dans `apps/api/.env` avant un usage partagé.

Comptes de démonstration (uniquement pour le POC) : `admin@restaurant.fr / Admin123!`, `manager@restaurant.fr / Manager123!`, `staff@restaurant.fr / Staff123!`.

## Architecture et droits

`apps/web` est une application Next.js unique. `apps/api` est un monolithe NestJS modulaire utilisant Supabase Database via son API REST serveur, JWT et bcrypt. Le token est conservé dans `localStorage` pour simplifier la démonstration locale ; en production, préférer un cookie httpOnly.

Les endpoints sensibles sont protégés par JWT et RBAC : ADMIN et MANAGER administrent le catalogue ; les trois rôles consultent les commandes ; STAFF ne peut effectuer que les transitions opérationnelles valides. Les lignes de commande conservent le nom et le prix au moment de l’achat.

## Scripts

`npm run dev:web`, `npm run dev:api`, `npm run seed`, `npm run build:web`, `npm run build:api`, `npm run lint:web`, `npm run lint:api`, `npm run test:api`.

## Limites connues

Le POC ne couvre pas encore l’édition complète des employés, la pagination avancée, les notifications temps réel ni les paramètres détaillés du restaurant. MongoDB doit être démarré avant l’API et les tests d’intégration.
