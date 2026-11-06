# Gestion Staff --- Digitalisation de la restauration

Application web en cours de développement dans le cadre d'un projet de
digitalisation de la restauration. Le projet vise à fournir une
interface opérationnelle pour le personnel et un espace d'administration
pour gérer l'activité d'un restaurant unique.

> **Statut :** projet en développement --- POC. Les fonctionnalités
> décrites ci-dessous constituent le périmètre cible et peuvent ne pas
> être toutes implémentées.

## Sommaire

-   [Objectifs](#objectifs)
-   [Stack technique](#stack-technique)
-   [Architecture du dépôt](#architecture-du-dépôt)
-   [Prérequis](#prérequis)
-   [Installation](#installation)
-   [Configuration](#configuration)
-   [Lancement en développement](#lancement-en-développement)
-   [Documentation de l'API](#documentation-de-lapi)
-   [Rôles prévus](#rôles-prévus)
-   [Sécurité](#sécurité)
-   [Feuille de route](#feuille-de-route)
-   [Contribuer au projet](#contribuer-au-projet)

## Objectifs

Le projet a pour objectif de centraliser les principales opérations d'un
restaurant dans une application web. Le périmètre fonctionnel envisagé
comprend :

-   un espace d'administration ;
-   un espace opérationnel pour le personnel ;
-   l'authentification et la gestion des droits ;
-   la gestion du catalogue de produits et des catégories ;
-   le suivi des commandes et de leurs statuts ;
-   un tableau de bord avec des indicateurs d'activité.

Le périmètre exact sera ajusté en fonction des besoins métier, du temps
disponible et des retours des tests utilisateurs.

## Stack technique

  -----------------------------------------------------------------------
  Élément                 Technologie             Utilisation
  ----------------------- ----------------------- -----------------------
  Frontend                Next.js, React,         Interface web
                          TypeScript              

  Backend                 NestJS, TypeScript      API et règles métier

  API                     REST                    Communication entre le
                                                  frontend et le backend

  Base de données         MongoDB                 Persistance des données

  ODM                     Mongoose                Schémas et accès à
                                                  MongoDB

  Validation              class-validator,        Validation des données
                          class-transformer       entrantes

  Documentation API       Swagger / OpenAPI       Exploration et
                                                  documentation des
                                                  endpoints

  Gestion des paquets     npm                     Installation des
                                                  dépendances et scripts

  Versionnement           Git, GitHub             Historique et
                                                  collaboration
  -----------------------------------------------------------------------

## Architecture du dépôt

Le dépôt utilise une organisation de type **monorepo npm** : le frontend
et le backend sont regroupés dans un seul dépôt Git, sous le répertoire
`apps/`.

``` text
gestion-staff/
├── apps/
│   ├── web/                   # Frontend Next.js
│   └── api/                   # Backend NestJS
├── docs/                      # Documentation du projet
├── package.json               # Configuration npm workspaces et scripts racine
├── package-lock.json
├── .gitignore
└── README.md
```

L'arborescence exacte peut évoluer au cours du développement. Chaque
application conserve son propre `package.json`.

### Vue d'ensemble

``` text
Navigateur
    |
    v
Next.js — interface Admin et Personnel
    |
    | API REST
    v
NestJS — authentification, autorisations et logique métier
    |
    | Mongoose
    v
MongoDB
```

## Prérequis

Avant de commencer, installer :

-   [Node.js](https://nodejs.org/) ;
-   npm, fourni avec Node.js ;
-   [Git](https://git-scm.com/) ;
-   une instance MongoDB locale ou un cluster MongoDB accessible.

Vérifier les installations :

``` powershell
node -v
npm -v
git --version
```

## Installation

Cloner le dépôt puis se placer dans le dossier du projet :

``` powershell
git clone https://github.com/gregoiremrcr/gestion-staff.git
cd gestion-staff
```

Installer les dépendances depuis la racine du monorepo :

``` powershell
npm install
```

> Cette commande suppose que le `package.json` racine déclare les
> workspaces `apps/*` et que `apps/web` ainsi que `apps/api` contiennent
> chacun un `package.json`.

Si une application n'a pas encore été générée, l'initialiser depuis la
racine du dépôt :

``` powershell
npx create-next-app@latest apps/web
npx @nestjs/cli new apps/api --package-manager npm --skip-git
```

Ne relancer ces commandes que pour une application absente ou à
réinitialiser : elles ne doivent pas écraser du code existant.

### Scripts racine

Le `package.json` à la racine doit inclure une configuration équivalente
à celle-ci :

``` json
{
  "name": "gestion-staff",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "apps/*"
  ],
  "scripts": {
    "dev:web": "npm run dev --workspace=apps/web",
    "dev:api": "npm run start:dev --workspace=apps/api",
    "build:web": "npm run build --workspace=apps/web",
    "build:api": "npm run build --workspace=apps/api"
  }
}
```

Si le fichier existe déjà, conserver ses autres scripts et fusionner
uniquement les entrées nécessaires.

## Configuration

### Backend --- `apps/api/.env`

Créer un fichier `.env` dans `apps/api/` :

``` dotenv
PORT=3001
FRONTEND_URL=http://localhost:3000
MONGODB_URI=mongodb://127.0.0.1:27017/gestion_staff
JWT_SECRET=replace_with_a_long_random_secret
```

Adapter `MONGODB_URI` à l'environnement MongoDB utilisé. La valeur de
`JWT_SECRET` est un exemple : définir une vraie valeur secrète dans
l'environnement local ou l'hébergeur.

Le backend doit charger la configuration avec `@nestjs/config` et se
connecter à MongoDB via Mongoose.

### Frontend --- `apps/web/.env.local`

Créer un fichier `.env.local` dans `apps/web/` :

``` dotenv
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

Cette variable correspond à l'URL de base de l'API en développement. Le
frontend doit l'utiliser pour effectuer ses requêtes HTTP.

### Protection des secrets

-   Ne jamais committer `.env`, `.env.local` ni de secrets réels.
-   Vérifier que les fichiers d'environnement sont exclus dans
    `.gitignore`.
-   Maintenir des fichiers `.env.example` sans valeurs secrètes si
    nécessaire.
-   En production, définir les variables depuis la configuration
    sécurisée de l'hébergeur.

## Lancement en développement

Démarrer MongoDB et vérifier que l'URI configurée est accessible.

Ouvrir ensuite deux terminaux à la racine du dépôt.

**Terminal 1 --- frontend :**

``` powershell
npm run dev:web
```

Le frontend Next.js est généralement disponible sur
<http://localhost:3000>.

**Terminal 2 --- backend :**

``` powershell
npm run dev:api
```

Le backend NestJS est configuré pour écouter sur le port `3001` si la
variable `PORT` est définie comme dans l'exemple.

Si une commande échoue, vérifier que les dépendances sont installées,
que les scripts existent dans les `package.json` concernés et que les
variables d'environnement sont correctement configurées.

## Documentation de l'API

L'API est conçue selon le modèle REST. Swagger peut être configuré dans
NestJS pour exposer la documentation interactive, par exemple à :

<http://localhost:3001/api/docs>

Cette URL ne sera disponible qu'après l'installation et la configuration
de Swagger dans le backend.

## Rôles prévus

Le contrôle d'accès envisagé repose sur trois rôles :

  -----------------------------------------------------------------------
  Rôle                                Périmètre envisagé
  ----------------------------------- -----------------------------------
  `ADMIN`                             Administration du restaurant,
                                      comptes et rôles, catalogue,
                                      commandes, statistiques et
                                      paramètres

  `MANAGER`                           Gestion opérationnelle, suivi des
                                      commandes et gestion du catalogue
                                      selon les permissions définies

  `STAFF`                             Accès aux fonctions opérationnelles
                                      nécessaires au poste, notamment la
                                      consultation et la mise à jour
                                      autorisée des commandes
  -----------------------------------------------------------------------

Les permissions exactes restent à valider. Elles devront être vérifiées
côté backend pour chaque route protégée ; masquer un bouton dans le
frontend ne constitue pas une protection suffisante.

## Sécurité

Les bonnes pratiques prévues pour le projet sont :

-   hachage des mots de passe, jamais stockés en clair ;
-   validation des données reçues par l'API ;
-   contrôle des rôles et permissions côté backend ;
-   secrets stockés dans les variables d'environnement ;
-   HTTPS dans les environnements hébergés ;
-   messages d'erreur qui ne divulguent pas d'informations sensibles ;
-   sauvegardes et procédure de restauration à définir avant un usage en
    production.

## Feuille de route

Le développement sera priorisé de manière progressive :

1.  Initialiser et vérifier le frontend, le backend et la connexion à
    MongoDB.
2.  Configurer l'API REST et Swagger.
3.  Mettre en place l'authentification et les rôles.
4.  Développer la gestion des produits et catégories.
5.  Développer le suivi des commandes.
6.  Construire les espaces Admin et Personnel.
7.  Ajouter les indicateurs utiles au tableau de bord.
8.  Tester l'application, vérifier l'accessibilité et déployer un
    environnement de démonstration.

Cette feuille de route est indicative et sera ajustée au périmètre
validé du POC.

## Contribuer au projet

Pour contribuer :

1.  Récupérer les dernières modifications de la branche principale.
2.  Créer une branche dédiée à la fonctionnalité ou au correctif.
3.  Effectuer les changements et lancer les vérifications disponibles.
4.  Décrire clairement les modifications dans un commit.
5.  Ouvrir une pull request pour revue avant intégration.

Exemple :

``` powershell
git checkout main
git pull
git checkout -b feat/nom-de-la-fonctionnalite
```

## Dépôt

-   GitHub :
    [gregoiremrcr/gestion-staff](https://github.com/gregoiremrcr/gestion-staff)

------------------------------------------------------------------------

*Documentation de démarrage du projet --- à mettre à jour au fur et à
mesure de l'implémentation.*
