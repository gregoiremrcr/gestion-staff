# Dossier technique --- Projet de digitalisation de la restauration

**Document de cadrage technique**\
**Projet :** Digitalisation de la restauration\
**Périmètre :** application pour un restaurant unique, avec espace
d'administration intégré\
**Version :** 1.0\
**Statut :** proposition d'architecture pour le POC et sa future
évolution

------------------------------------------------------------------------

## 1. Synthèse des choix techniques

Le projet reposera sur une architecture web en trois grandes couches :
une interface utilisateur développée avec **Next.js et TypeScript**, une
API métier développée avec **NestJS et TypeScript**, et une base de
données **MongoDB**.

L'espace d'administration sera intégré à la même application Next.js que
l'interface opérationnelle du personnel. Les deux espaces partageront le
socle technique et l'authentification, mais disposeront de routes,
d'écrans et de permissions distincts.

  -----------------------------------------------------------------------
  Couche                  Technologie retenue     Rôle
  ----------------------- ----------------------- -----------------------
  Frontend                Next.js + TypeScript    Interfaces du personnel
                                                  et d'administration

  Backend                 NestJS + TypeScript     API REST, règles
                                                  métier,
                                                  authentification et
                                                  autorisations

  Base de données         MongoDB                 Stockage des
                                                  utilisateurs, produits,
                                                  commandes et paramètres

  Accès aux données       Mongoose                Modélisation et
                                                  interaction avec
                                                  MongoDB

  Styles et composants    Tailwind CSS +          Interface cohérente et
                          bibliothèque de         responsive
                          composants (par ex.     
                          shadcn/ui)              

  Graphiques              Recharts (si            Visualisation des
                          nécessaire)             indicateurs du tableau
                                                  de bord

  Authentification        JWT avec gestion        Identification des
                          sécurisée des sessions  utilisateurs

  Contrôle d'accès        RBAC (rôles et          Restriction des
                          permissions)            fonctionnalités selon
                                                  le profil
  -----------------------------------------------------------------------

**Principe directeur :** privilégier un monolithe modulaire, simple à
développer et à déployer dans le cadre du POC, tout en séparant
clairement l'interface, l'API et la persistance des données.

------------------------------------------------------------------------

## 2. Choix des technologies

### 2.1 Frontend --- Next.js et TypeScript

**Next.js** sera utilisé pour construire l'application web. Il s'appuie
sur React et permet d'organiser les pages, les composants et les routes
au sein d'un même projet.

**TypeScript** apporte un typage statique qui facilite la maintenance,
la compréhension des modèles de données et la détection de certaines
erreurs pendant le développement.

Les bénéfices attendus sont : - un seul projet frontend pour l'espace du
personnel et l'espace d'administration ; - une organisation claire des
routes et des composants ; - une interface responsive, utilisable sur
ordinateur, tablette et mobile ; - une base évolutive pour ajouter
ultérieurement de nouvelles fonctionnalités.

### 2.2 Backend --- NestJS et TypeScript

**NestJS** est retenu pour développer le serveur et l'API en TypeScript.
Il fournit une structure modulaire adaptée à une application métier.

Le backend centralisera : - les règles métier ; - la validation des
données reçues ; - l'authentification ; - la vérification des rôles et
permissions ; - les opérations de lecture et d'écriture en base ; - les
traitements liés aux commandes, aux produits et aux utilisateurs.

L'API sera exposée sous forme de **services REST**. Cette séparation
évite de placer les règles métier uniquement dans le frontend et permet
à plusieurs interfaces de consommer les mêmes fonctionnalités si le
projet évolue.

> **Clarification importante :** FastAPI est un framework backend
> Python. Puisque le choix du projet est de conserver TypeScript côté
> serveur, NestJS est plus cohérent que FastAPI avec cette orientation.

### 2.3 Base de données --- MongoDB et Mongoose

**MongoDB** est retenu comme base de données documentaire. Il stockera
les données nécessaires au fonctionnement du restaurant.

**Mongoose** sera utilisé dans NestJS pour définir les schémas, valider
les documents et faciliter les interactions avec MongoDB.

Ce choix convient au périmètre envisagé, sous réserve de concevoir
soigneusement les relations entre les utilisateurs, les produits et les
commandes. Les données indispensables à l'historique d'une commande
devront être conservées dans celle-ci : par exemple, le nom et le prix
du produit au moment de l'achat, afin qu'une modification ultérieure du
catalogue ne réécrive pas l'historique.

### 2.4 Bibliothèque d'interface et visualisation

-   **Tailwind CSS** : mise en forme rapide et cohérente des écrans.
-   **shadcn/ui** : base de composants réutilisables pour les
    formulaires, tableaux, menus et fenêtres de dialogue.
-   **Recharts** : graphiques du tableau de bord, uniquement si les
    indicateurs retenus nécessitent une visualisation graphique.

Ces outils sont des choix de mise en œuvre proposés. Ils pourront être
ajustés selon la maquette, les contraintes d'accessibilité et le temps
disponible.

------------------------------------------------------------------------

## 3. Organisation des espaces applicatifs

### 3.1 Une seule application, deux espaces fonctionnels

L'espace d'administration sera intégré à la même application Next.js que
l'espace opérationnel du personnel. Il ne s'agira donc pas de maintenir
deux frontends indépendants.

Cette organisation permet de mutualiser : - le système de connexion ; -
les composants communs ; - les appels à l'API ; - les conventions
graphiques ; - les mécanismes de gestion des erreurs et des sessions.

Les routes et les permissions resteront séparées afin que chaque
utilisateur n'accède qu'aux fonctions correspondant à son rôle.

### 3.2 Profils et droits d'accès

Le modèle proposé repose sur trois rôles :

  -----------------------------------------------------------------------
  Rôle                                Responsabilités principales
  ----------------------------------- -----------------------------------
  **ADMIN**                           Administration globale du
                                      restaurant, gestion des comptes et
                                      des rôles, accès aux commandes,
                                      produits, statistiques et
                                      paramètres

  **MANAGER**                         Suivi de l'activité, gestion
                                      opérationnelle des commandes et du
                                      catalogue, gestion des employés
                                      selon les droits définis

  **STAFF**                           Accès aux fonctions opérationnelles
                                      nécessaires au poste, consultation
                                      des commandes et mise à jour de
                                      leur statut selon les autorisations
                                      accordées
  -----------------------------------------------------------------------

La matrice définitive des permissions devra être validée avec les
besoins métier. Un rôle ne doit pas être considéré comme une simple
étiquette d'interface : il détermine précisément les actions autorisées.

### 3.3 Exemples de routes frontend

``` text
/
├── login
├── admin
│   ├── dashboard
│   ├── orders
│   ├── products
│   ├── categories
│   ├── employees
│   ├── users
│   ├── analytics
│   └── settings
└── staff
    ├── dashboard
    └── orders
```

Les routes sont indicatives. Elles pourront être adaptées au parcours
utilisateur final et au périmètre effectivement retenu pour le POC.

------------------------------------------------------------------------

## 4. Architecture applicative

### 4.1 Vue d'ensemble

``` text
┌───────────────────────────────────────────────┐
│             Navigateur utilisateur            │
│                                               │
│     Espace Admin       Espace Personnel       │
│           └──────── Next.js ────────┘         │
└───────────────────────┬───────────────────────┘
                        │ Requêtes HTTPS / REST
                        ▼
┌───────────────────────────────────────────────┐
│                Backend NestJS                 │
│                                               │
│  Authentification et autorisations (RBAC)     │
│  Utilisateurs / Employés                      │
│  Produits / Catégories                        │
│  Commandes                                    │
│  Statistiques / Paramètres                    │
│                                               │
│          Validation et règles métier          │
└───────────────────────┬───────────────────────┘
                        │ Mongoose
                        ▼
┌───────────────────────────────────────────────┐
│                  MongoDB                      │
│                                               │
│  users | employees | products | categories    │
│  orders | restaurant_settings                 │
└───────────────────────────────────────────────┘
```

### 4.2 Architecture backend en modules

Le backend sera organisé en modules fonctionnels. Cette approche permet
de séparer les responsabilités sans introduire prématurément une
architecture distribuée.

  -----------------------------------------------------------------------
  Module NestJS                       Responsabilité
  ----------------------------------- -----------------------------------
  `auth`                              Connexion, déconnexion, émission et
                                      validation des jetons

  `users`                             Gestion des comptes utilisateurs

  `roles` / `permissions`             Définition et vérification des
                                      droits

  `employees`                         Informations et gestion du
                                      personnel

  `products`                          Création, modification et
                                      consultation des produits

  `categories`                        Organisation du catalogue

  `orders`                            Création, consultation et évolution
                                      du statut des commandes

  `analytics`                         Agrégation des indicateurs utiles
                                      au tableau de bord

  `restaurant-settings`               Paramètres propres au restaurant
  -----------------------------------------------------------------------

Chaque module pourra contenir, selon le besoin, un contrôleur, un
service, un schéma Mongoose et des DTO de validation.

### 4.3 Modèle de données initial

Collections MongoDB proposées :

  -----------------------------------------------------------------------
  Collection                          Contenu principal
  ----------------------------------- -----------------------------------
  `users`                             Identifiants de connexion, mot de
                                      passe haché, rôle, état du compte

  `employees`                         Informations professionnelles du
                                      personnel et lien vers le compte
                                      utilisateur

  `products`                          Nom, description, prix,
                                      disponibilité, catégorie

  `categories`                        Nom, description et ordre
                                      d'affichage

  `orders`                            Lignes de commande, quantités,
                                      montants, statut, dates et
                                      informations utiles au suivi

  `restaurant_settings`               Paramètres généraux du restaurant
  -----------------------------------------------------------------------

Ce modèle est une première base de conception, pas un schéma définitif.
Les champs exacts, les contraintes, les index et les règles de
suppression devront être précisés pendant la conception détaillée.

**Point de vigilance sur les commandes :** conserver dans chaque ligne
de commande un instantané des informations commerciales pertinentes (nom
du produit, prix unitaire, éventuellement options) au moment où la
commande est passée. Cela préserve la cohérence de l'historique si le
catalogue évolue.

------------------------------------------------------------------------

## 5. Authentification et sécurité

La sécurité doit être appliquée dans le backend, et pas uniquement dans
l'affichage des pages.

Mesures prévues :

1.  **Authentification** : connexion avec des identifiants ; émission
    d'un JWT ou mise en place d'une session sécurisée.
2.  **Stockage des mots de passe** : hachage avec un algorithme adapté ;
    aucun mot de passe en clair dans la base.
3.  **Autorisation RBAC** : vérification du rôle et des permissions sur
    chaque endpoint protégé.
4.  **Validation des entrées** : DTO et validation côté API pour les
    données reçues.
5.  **Protection des secrets** : variables d'environnement pour les
    clés, URI de base de données et secrets de déploiement.
6.  **Transport sécurisé** : HTTPS en production.
7.  **Gestion des erreurs** : réponses API maîtrisées, sans exposer de
    secrets ou de détails internes.
8.  **Traçabilité** : prévoir, si le périmètre le justifie, un
    historique des actions sensibles (modification des rôles,
    paramètres, commandes).

Les boutons masqués dans l'interface ne constituent pas une mesure de
sécurité suffisante : un utilisateur pourrait appeler directement l'API.
Le backend doit donc refuser toute action non autorisée.

Pour un déploiement réel, il faudra également définir la politique de
sauvegarde, la durée de conservation des données, la gestion des comptes
administrateurs et les procédures de restauration.

------------------------------------------------------------------------

## 6. Déploiement et environnements

### 6.1 Environnements recommandés

Il est recommandé de distinguer au minimum :

-   **Développement local** : travail quotidien de l'équipe, avec
    données de test.
-   **Préproduction / démonstration** : version hébergée pour les tests
    utilisateurs et la validation du POC.
-   **Production** : environnement destiné à une utilisation réelle, à
    mettre en place uniquement si le projet dépasse le cadre de la
    démonstration.

Les données personnelles réelles ne doivent pas être utilisées dans les
environnements de test sans cadre approprié. Des données fictives ou
anonymisées sont préférables pour le POC.

### 6.2 Schéma de déploiement cible

``` text
Utilisateur
    │
    │ HTTPS
    ▼
Hébergement Frontend
Next.js
    │
    │ HTTPS / API REST
    ▼
Hébergement Backend
NestJS
    │
    │ Connexion sécurisée
    ▼
Base de données MongoDB hébergée
```

Le frontend et le backend peuvent être hébergés séparément, ce qui
facilite leur configuration et leur évolution. MongoDB peut être fourni
par un service managé. Les fournisseurs précis restent à choisir selon
le budget, les contraintes de l'école et les besoins de démonstration.

### 6.3 Options d'hébergement envisageables

  -----------------------------------------------------------------------
  Élément                 Option possible         À vérifier avant
                                                  décision
  ----------------------- ----------------------- -----------------------
  Frontend Next.js        Vercel ou hébergeur     Compatibilité avec le
                          compatible Node.js      mode de rendu et les
                                                  besoins du projet

  Backend NestJS          Render, Railway ou      Port, variables
                          serveur Node.js         d'environnement,
                                                  disponibilité et logs

  MongoDB                 MongoDB Atlas           Région, sauvegardes,
                                                  réseau et limites du
                                                  plan

  Dépôt de code           GitHub ou GitLab        Accès de l'équipe,
                                                  branches et droits
  -----------------------------------------------------------------------

Ces fournisseurs sont des pistes et non des choix contractuels. La
décision finale dépendra du coût, des quotas gratuits éventuels, de la
localisation des données, de la facilité de déploiement et des
conditions d'utilisation en vigueur.

### 6.4 Configuration et secrets

Les informations sensibles seront configurées par variables
d'environnement, jamais enregistrées dans le dépôt Git.

Exemple indicatif :

``` dotenv
# Backend
PORT=3001
MONGODB_URI=
JWT_SECRET=
FRONTEND_URL=

# Frontend
NEXT_PUBLIC_API_URL=
```

Les valeurs réelles doivent être définies dans l'environnement
d'hébergement. Le fichier `.env` local doit être ignoré par Git ; un
fichier `.env.example` peut documenter les variables attendues sans
contenir de secret.

### 6.5 Intégration continue et qualité

Pour fiabiliser les livraisons, le dépôt pourra intégrer une pipeline CI
simple :

-   installation des dépendances ;
-   vérification du typage TypeScript ;
-   lint ;
-   tests automatisés disponibles ;
-   build du frontend et du backend ;
-   déploiement de la version de démonstration après validation.

Le niveau d'automatisation doit rester proportionné à la durée du
projet. Pour le POC, une procédure de déploiement reproductible et
documentée est plus importante qu'une infrastructure complexe.

------------------------------------------------------------------------

## 7. Organisation du dépôt de code

Une organisation en monorepo est recommandée pour ce projet : le
frontend et le backend sont regroupés dans un même dépôt, tout en
conservant des répertoires séparés.

``` text
restaurant-digitalisation/
├── apps/
│   ├── web/                 # Application Next.js
│   └── api/                 # API NestJS
├── docs/
│   ├── architecture.md
│   ├── api.md
│   └── tests-utilisateurs.md
├── .gitignore
├── .env.example
└── README.md
```

Exemple d'organisation interne :

``` text
apps/web/
├── app/
│   ├── admin/
│   ├── staff/
│   └── login/
├── components/
├── lib/
└── public/

apps/api/
├── src/
│   ├── auth/
│   ├── users/
│   ├── employees/
│   ├── products/
│   ├── categories/
│   ├── orders/
│   ├── analytics/
│   └── restaurant-settings/
└── test/
```

Le dépôt devra contenir un README qui explique les prérequis,
l'installation, la configuration, le lancement local, les tests et
l'accès à la démonstration.

------------------------------------------------------------------------

## 8. Périmètre fonctionnel du POC

Pour obtenir un prototype fonctionnel dans le temps imparti, il est
préférable de concentrer les efforts sur un parcours métier central
plutôt que de développer immédiatement toutes les fonctionnalités
possibles.

### 8.1 Fonctionnalités prioritaires

  -----------------------------------------------------------------------
  Priorité                Fonctionnalité          Résultat attendu
  ----------------------- ----------------------- -----------------------
  P0                      Authentification        Un utilisateur peut se
                                                  connecter et accéder à
                                                  son espace

  P0                      Gestion des rôles       Les accès diffèrent
                                                  selon ADMIN, MANAGER et
                                                  STAFF

  P0                      Gestion des commandes   Les commandes sont
                                                  consultables et leur
                                                  statut peut évoluer
                                                  selon les droits

  P0                      Gestion des produits    L'administrateur peut
                                                  consulter et modifier
                                                  le catalogue

  P1                      Tableau de bord         Vue synthétique des
                                                  commandes et de
                                                  l'activité

  P1                      Gestion des employés    Création et gestion des
                                                  comptes ou profils du
                                                  personnel

  P1                      Catégories              Organisation du
                                                  catalogue

  P2                      Statistiques avancées   Indicateurs et
                                                  visualisations
                                                  complémentaires

  P2                      Paramètres              Configuration plus
                                                  complète du restaurant
  -----------------------------------------------------------------------

Les priorités devront être ajustées selon le scénario de démonstration
validé par l'équipe et les résultats de la recherche utilisateur.

### 8.2 Critères de réussite du POC

Le POC pourra être considéré comme démontrable lorsque :

-   un utilisateur peut se connecter ;
-   son rôle détermine les écrans et actions accessibles ;
-   un administrateur peut gérer les produits ;
-   les commandes peuvent être consultées et leur statut mis à jour ;
-   les restrictions d'accès sont contrôlées par l'API ;
-   l'application est accessible sur un environnement de démonstration ;
-   le parcours principal peut être testé par un utilisateur sans
    assistance constante.

------------------------------------------------------------------------

## 9. Tests, accessibilité et validation

La validation ne doit pas se limiter à vérifier que l'application
fonctionne techniquement. Le POC doit également être évalué du point de
vue des utilisateurs.

### Tests techniques à prévoir

-   tests unitaires des services métier importants ;
-   tests des endpoints d'authentification et d'autorisation ;
-   vérification des cas d'accès refusé ;
-   tests du parcours principal de commande ;
-   vérification des validations de formulaires ;
-   test du build et du déploiement.

### Tests utilisateurs à prévoir

Un protocole de test devra définir : - le profil des participants ; -
les tâches à réaliser ; - les consignes données ; - les critères
d'observation (réussite, erreurs, temps, hésitations) ; - les retours
qualitatifs ; - les améliorations décidées à partir des résultats.

### Accessibilité et ergonomie

Points de contrôle recommandés : - navigation au clavier ; - libellés
explicites pour les champs et boutons ; - contrastes suffisants ; -
structure de titres cohérente ; - messages d'erreur compréhensibles ; -
états de chargement et de confirmation visibles ; - interface responsive
sur les tailles d'écran ciblées.

Les tests utilisateurs et les contrôles d'accessibilité devront être
documentés et intégrés au bilan du POC.

------------------------------------------------------------------------

## 10. Évolutivité et limites assumées

L'architecture proposée est volontairement simple : un frontend Next.js,
un backend NestJS organisé en modules et une base MongoDB. Il s'agit
d'un **monolithe modulaire**, et non d'une architecture microservices.

Cette approche présente plusieurs avantages pour le projet : -
développement et déploiement plus simples ; - responsabilités séparées
par module ; - maintenance accessible à une petite équipe ; -
possibilité d'ajouter des fonctionnalités sans multiplier les services.

Des évolutions pourront être envisagées après validation du besoin : -
notifications en temps réel pour les commandes ; - suivi plus détaillé
des stocks ; - journal d'audit des actions ; - exports et rapports ; -
intégration éventuelle avec des outils externes ; - application ou
interface dédiée à d'autres usages.

Ces évolutions ne sont pas nécessaires pour valider le POC initial.
Elles ne devront être engagées que si les tests et les besoins métier
les justifient.

------------------------------------------------------------------------

## 11. Décisions restant à valider

Avant le développement complet, l'équipe devra confirmer les points
suivants :

1.  **Parcours métier principal :** commande en salle, commande à
    emporter, commande en ligne, ou combinaison de plusieurs parcours.
2.  **Gestion des commandes :** statuts exacts et rôles autorisés à les
    modifier.
3.  **Droits du manager et du personnel :** actions précises autorisées
    pour chaque profil.
4.  **Données du catalogue :** options, suppléments, disponibilité,
    images et catégories.
5.  **Authentification :** stratégie JWT ou session sécurisée, selon le
    mode d'hébergement.
6.  **Hébergement :** fournisseurs, région, quotas et contraintes
    budgétaires.
7.  **Données de démonstration :** jeu de données fictif nécessaire aux
    tests.
8.  **Indicateurs :** statistiques réellement utiles aux responsables du
    restaurant.

Ces décisions doivent être prises en cohérence avec le périmètre du POC,
les retours de recherche utilisateur et le temps de réalisation
disponible.

------------------------------------------------------------------------

## 12. Conclusion

La solution proposée s'appuie sur **Next.js et TypeScript pour le
frontend**, **NestJS et TypeScript pour le backend**, et **MongoDB avec
Mongoose pour la persistance**. L'espace d'administration est intégré au
même projet Next.js que l'espace du personnel, avec des routes et des
permissions différenciées.

Cette architecture répond au besoin d'un outil de gestion pour un
restaurant unique, tout en restant suffisamment structurée pour évoluer.
Le choix d'un monolithe modulaire permet de concentrer l'effort sur les
fonctionnalités essentielles du POC : authentification, gestion des
rôles, catalogue et commandes. Le déploiement sur un environnement de
démonstration, la sécurité des accès, l'accessibilité et les tests
utilisateurs complètent le dispositif de validation.

**Recommandation :** valider d'abord le parcours métier prioritaire et
la matrice des permissions, puis développer et tester le POC sur ce
périmètre avant d'engager les fonctionnalités secondaires.
