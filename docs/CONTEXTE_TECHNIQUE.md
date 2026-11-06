# Gestion Staff — contexte technique

> La base de données du projet est désormais Supabase Database (PostgreSQL). MongoDB n’est plus utilisé par l’API.

## Présentation

Gestion Staff est une webapp métier pour un restaurant unique. Elle sert aux managers et administrateurs pour piloter l’activité, mais aussi au personnel pour les usages opérationnels et le futur pointage des heures. Ce n’est pas un site vitrine : le frontend, l’API et la base de données communiquent réellement.

## Structure

~~~text
gestion-staff/
├── apps/
│   ├── web/                 # Next.js, React, TypeScript
│   │   └── app/             # App Router, écran, layout, styles
│   └── api/                 # NestJS, TypeScript
│       ├── src/             # API, modèles, contrôleurs et guards
│       └── seed.mjs         # Données de démonstration
├── docs/
├── Dockerfile.api
├── Dockerfile.web
├── docker-compose.yml
├── .dockerignore
├── package.json             # Monorepo npm workspaces
└── README.md
~~~

Il n’y a qu’une application frontend. Les différences entre administration, management et personnel sont gérées par l’authentification, les rôles et l’interface affichée.

## Architecture

~~~text
Navigateur
    │ REST JSON
    ▼
Next.js / React / TypeScript
    │
    ▼
NestJS / TypeScript
    ├── JWT + RBAC
    ├── validation DTO
    ├── règles catalogue et commandes
    └── Swagger
    │ Mongoose
    ▼
Supabase Database (PostgreSQL)
~~~

Avec Docker, les services sont web:3000, api:3001 et mongo:27017. Le navigateur utilise l’URL API publique localhost:3001/api ; l’API utilise le nom réseau mongo.

## Stack

Frontend : Next.js 16.4.5, React 19.3.0, TypeScript, Tailwind CSS 4, CSS responsive et ESLint.

Backend : NestJS 12, TypeScript ESM, Supabase REST côté serveur, Passport JWT, bcrypt, class-validator, Swagger et Vitest.

Infrastructure : Docker Compose, Node.js 22 Alpine, MongoDB 8 et volume mongo_data.

## Authentification

1. Le frontend appelle POST /api/auth/login.
2. L’API compare le mot de passe avec le hash bcrypt.
3. L’API renvoie un JWT signé par JWT_SECRET.
4. Le frontend conserve le token dans localStorage pour le POC.
5. Les requêtes ajoutent Authorization: Bearer token.
6. Le guard JWT recharge l’utilisateur depuis MongoDB.
7. Le guard de rôles autorise ou refuse l’action.

L’API utilise la clé service role uniquement côté serveur pour accéder aux tables Supabase. Elle ne doit jamais être envoyée au navigateur.

Les mots de passe ne sont jamais stockés en clair. Pour la production, localStorage devra être remplacé par un cookie httpOnly, secure et sameSite.

## Rôles

- ADMIN : administration complète ;
- MANAGER : pilotage opérationnel et gestion du catalogue ;
- STAFF : usage opérationnel.

| Action | ADMIN | MANAGER | STAFF |
|---|---:|---:|---:|
| Connexion | oui | oui | oui |
| Dashboard | oui | oui | oui, version opérationnelle |
| Consulter les commandes | oui | oui | oui |
| Modifier un statut valide | oui | oui | oui |
| Gérer les produits | oui | oui | non |
| Gérer les catégories | oui | oui | non |
| Gérer les comptes et rôles | oui | non | non |
| Pointer ses heures | à venir | à venir | à venir |
| Consulter les heures de l’équipe | oui | oui | non |

Le frontend peut masquer un bouton, mais l’API est la vraie protection.

## Données actuelles

### users

Nom, email unique, passwordHash, rôle, actif et timestamps.

### categories

Nom unique, description, ordre d’affichage, actif et timestamps.

### products

Nom, description, prix, disponibilité, référence catégorie et timestamps.

### orders

Numéro unique, lignes, total, statut, créateur et timestamps.

Chaque ligne conserve productId, name, unitPrice et quantity. Le prix historique ne change donc pas si le catalogue est modifié.

Statuts : PENDING, CONFIRMED, PREPARING, READY, COMPLETED et CANCELLED. Les transitions impossibles sont refusées.

## API REST

Préfixe : /api

- GET /api et GET /api/health : santé ;
- GET /api/docs : documentation Swagger ;
- POST /api/auth/login ;
- GET /api/auth/me ;
- GET, POST, PATCH et DELETE /api/products ;
- GET, POST, PATCH et DELETE /api/categories ;
- GET /api/orders ;
- GET /api/orders/:id ;
- POST /api/orders ;
- PATCH /api/orders/:id/status ;
- GET /api/analytics/dashboard.

## Configuration

API, fichier apps/api/.env :

~~~dotenv
PORT=3001
FRONTEND_URL=http://localhost:3000
MONGODB_URI=mongodb://127.0.0.1:27017/gestion_staff
JWT_SECRET=change_me_with_a_long_random_secret
JWT_EXPIRES_IN=1d
~~~

Frontend, fichier apps/web/.env.local :

~~~dotenv
NEXT_PUBLIC_API_URL=http://localhost:3001/api
~~~

En Docker, les variables Supabase sont chargées depuis apps/api/.env. Les fichiers .env et .env.local sont ignorés par Git.

## Docker

Services :

- api : compilation NestJS avec Dockerfile.api, port 3001 ;
- web : compilation Next.js avec Dockerfile.web, port 3000.

Le Dockerfile web installe les binaires Linux musl requis par Tailwind et Lightning CSS.

Commandes :

~~~powershell
docker compose build --no-cache
docker compose up -d
docker compose exec api node apps/api/seed.mjs
docker compose logs -f api
docker compose down
~~~

Les données résident dans le projet Supabase et ne sont pas supprimées par docker compose down.

## Seed

Le seed crée trois comptes, trois catégories, trois produits et deux commandes.

~~~text
admin@restaurant.fr   / Admin123!
manager@restaurant.fr / Manager123!
staff@restaurant.fr   / Staff123!
~~~

Ces comptes sont réservés à la démonstration locale.

## Développement local

~~~powershell
npm install
Copy-Item apps/api/.env.example apps/api/.env
Copy-Item apps/web/.env.example apps/web/.env.local
npm run seed
npm run dev:api
npm run dev:web
~~~

Un projet Supabase doit être configuré et sa migration SQL appliquée.

Scripts racine : dev:web, dev:api, build:web, build:api, lint:web, lint:api, test:api et seed.

## Prochaine brique : pointage des heures

Le pointage n’est pas encore implémenté. Une collection attendance_records pourra contenir employeeId, userId, date, clockIn, clockOut, breakMinutes, status, note et timestamps.

Fonctionnement prévu :

1. Le STAFF clique sur « Commencer mon service ».
2. L’API crée un pointage ouvert avec l’heure serveur.
3. Le STAFF termine son service.
4. L’API clôture le pointage.
5. Le STAFF consulte ses propres heures.
6. Le MANAGER consulte et corrige celles de son équipe.
7. L’ADMIN dispose d’une vue globale.

Les heures doivent être calculées côté serveur. Il faudra gérer les doublons, pauses, services traversant minuit et corrections auditées.

## Sécurité et production

Avant un usage réel : remplacer les secrets d’exemple, utiliser HTTPS, passer à des cookies httpOnly, ajouter une limitation de débit, compléter les tests MongoDB, gérer complètement les employés, auditer les corrections, sauvegarder MongoDB et renforcer la validation des erreurs.

## État

Le socle frontend/backend est compilable, l’API utilise JWT, bcrypt, RBAC, Supabase et Swagger, le catalogue et les commandes sont persistés, le dashboard utilise PostgreSQL Supabase, Docker Compose démarre les services et le seed prépare une démonstration.

La prochaine étape est l’ajout des employés, plannings et pointages afin de couvrir complètement la gestion du personnel.
