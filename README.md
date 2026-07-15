# Olympic Participation Tracker

Application React pour visualiser les donnees de participation aux Jeux Olympiques, construite avec React 19, TypeScript, Vite et Tailwind CSS.

## Tech Stack

- **Framework :** React 19 + TypeScript
- **Build :** Vite 6
- **Styling :** Tailwind CSS 3.4
- **Routing :** React Router v7 en mode Data Router
- **Tests :** Jest + React Testing Library

## Prerequis

- **Node.js** 22.x ou superieur
- **npm** 10.x ou superieur

## Installation

```bash
git clone <repository-url>
cd p6-dfsjs-frontend
npm install
```

## Scripts disponibles

| Commande | Description |
|---|---|
| `npm run dev` | Serveur de developpement (port 5173) |
| `npm run build` | Verification TypeScript + build production (`dist/`) |
| `npm run preview` | Apercu du build de production |
| `npm test` | Lancer les tests |
| `npm run test:watch` | Tests en mode watch |
| `npm run test:coverage` | Tests avec rapport de couverture |
| `npm run test:ci` | Tests en mode CI avec rapport JUnit (utilisé par `run-tests.sh`) |

## Structure du projet

```
p6-dfsjs-frontend/
├── public/
│   └── mock/
│       └── olympic.json            # Donnees mock (5 pays, 3 participations chacun)
├── src/
│   ├── main.tsx                    # Point d'entree React 19
│   ├── App.tsx                     # Montage du RouterProvider
│   ├── router.tsx                  # Definition des routes et loaders
│   ├── index.css                   # Directives Tailwind CSS
│   ├── pages/
│   │   ├── Home.tsx                # Page d'accueil (liste des participations)
│   │   └── NotFound.tsx            # Page 404
│   ├── services/
│   │   └── olympicService.ts       # Service de donnees + loader de route
│   └── types/
│       └── olympic.ts              # Interfaces TypeScript (Olympic, Participation)
├── tests/
│   ├── polyfills.ts                # Polyfills pour React Router v7 dans jsdom
│   ├── setup.ts                    # Setup Jest (jest-dom)
│   └── components/
│       └── Home.test.tsx           # Tests du composant Home
├── run-tests.sh                    # Script de tests pour la CI (npm ci + rapport JUnit)
├── index.html                      # Template HTML SPA
├── .husky/
│   └── commit-msg                  # Hook git commitlint
├── package.json
├── tsconfig.json                   # Configuration TypeScript stricte
├── vite.config.ts                  # Configuration Vite
├── jest.config.js                  # Configuration Jest
├── babel.config.json               # Presets Babel pour Jest (env, react, typescript)
├── tailwind.config.js              # Configuration Tailwind CSS
├── postcss.config.js               # Configuration PostCSS
├── .releaserc.json                 # Configuration semantic-release
├── commitlint.config.js            # Regles de lint Conventional Commits
├── CHANGELOG.md                    # Genere par semantic-release (cree a la premiere release)
└── CORRECTIONS.md                  # Journal des corrections appliquees
```

## Architecture

```
Pages (Composants UI)
    ↓ useLoaderData()
Router (Data Router + Loaders)
    ↓ loader()
Services (Fetch des donnees)
    ↓
Donnees (mock JSON)
```

Le projet utilise le **Data Router** de React Router v7. Les donnees sont chargees par un `loader` **avant** le rendu du composant, puis accessibles via `useLoaderData<T>()`.

### Routes

Les routes sont definies dans `src/router.tsx` :

| Route | Page | Loader |
|---|---|---|
| `/` | `Home` | `olympicLoader` (charge les donnees olympiques) |
| `*` | `NotFound` | - |

### Modele de donnees

```typescript
interface Olympic {
  id: number;
  country: string;
  participations: Participation[];
}

interface Participation {
  id: number;
  year: number;
  city: string;
  medalsCount: number;
  athleteCount: number;
}
```

### Donnees mock

5 pays avec 3 participations chacun (Londres 2012, Rio 2016, Tokyo 2020) :
France, United States, Germany, China, Great Britain.

## Tests

```bash
npm test
```

Les tests utilisent `createMemoryRouter` avec `hydrationData` pour injecter les donnees directement sans passer par le loader, ce qui evite les dependances aux Web APIs dans jsdom.

### Script CI : `run-tests.sh`

C'est le point d'entrée des tests dans le workflow GitHub Actions (job `test`), mais il se lance aussi en local à l'identique :

```bash
./run-tests.sh
```

Ce qu'il fait, dans l'ordre :

1. **`set -euo pipefail`** — le script s'arrête à la première commande en erreur et propage son code de sortie, ce qui fait échouer le job CI proprement (variable non définie ou erreur au milieu d'un pipe comprises).
2. **Nettoie puis recrée `test-results/`** — les rapports d'un run précédent ne peuvent pas polluer le résultat courant.
3. **`npm ci`** — installation propre et reproductible des dépendances, strictement depuis `package-lock.json` (contrairement à `npm install`, qui peut modifier le lockfile).
4. **`npm run test:ci`** — lance Jest en mode CI (`--ci`, pas d'écriture de snapshots) avec deux reporters : `default` (sortie console lisible) et `jest-junit` (rapport XML exploitable par les outils).

La variable d'environnement `JEST_JUNIT_OUTPUT_DIR` est exportée vers `test-results/`, donc le rapport atterrit dans `test-results/junit.xml`. C'est ce fichier que le workflow uploade en artefact (`junit-report`), y compris quand les tests échouent (`if: always()`).

**À noter :** `.gitattributes` force les fins de ligne LF sur les `*.sh`. Sans ça, un checkout depuis Windows (CRLF) casse le script avec le classique `env: 'bash\r': No such file or directory`.

## Docker

L'application peut être buildée et servie via Docker, en multi-stage : un stage `builder` (Node) qui compile l'application, puis un stage `runner` (Nginx) qui sert uniquement le résultat statique (`dist/`).

### Build et run

```bash
docker compose up -d --build
```

L'application est alors accessible sur [http://localhost:8080](http://localhost:8080).

Sans `docker-compose`, en commandes brutes :

```bash
docker build -t olympic-tracker .
docker run -p 80:8080 olympic-tracker
```

### Details du build

| Stage | Image de base | Role |
|---|---|---|
| `builder` | `node:24.18.0-alpine` | `npm install` puis `npm run build` (`tsc` + Vite), produit `/app/dist` |
| `runner` | `nginxinc/nginx-unprivileged:alpine3.23` | Sert `dist/` en statique sur le port 8080, en utilisateur non-root |

La configuration Nginx (`nginx.conf`) gere le fallback SPA (`try_files $uri /index.html`) pour le routing cote client de React Router, ainsi que le cache long des assets statiques et la compression gzip.

## Intégration continue & Releases

Le workflow GitHub Actions (`.github/workflows/ci.yml`) enchaîne trois jobs sur chaque push :

1. **`test`** — installe les dépendances et lance la suite Jest via `./run-tests.sh` (détaillé dans la section [Tests](#script-ci--run-testssh)), sur toutes les branches.
2. **`release`** *(uniquement sur `main`)* — lance [semantic-release](https://semantic-release.gitbook.io/) pour déterminer la prochaine version à partir de l'historique des commits, générer un changelog et publier une release GitHub.
3. **`build-and-push-image`** — build l'image Docker et la pousse sur `ghcr.io`. Si `release` a publié une nouvelle version, l'image est aussi taguée avec ce numéro de version (ex : `ghcr.io/<owner>/<repo>:1.4.0`), en plus de son tag de branche.

### Conventional Commits

Le versionnage repose entièrement sur le format des messages de commit, qui doivent respecter [Conventional Commits](https://www.conventionalcommits.org/) :

```
<type>[scope optionnel]: <description>
```

| Type                                                | Effet sur la version      | Exemple                                     |
|------------------------------------------------------|----------------------------|------------------------------------------------|
| `fix:`                                                | patch (`1.0.0` → `1.0.1`) | `fix(home): corrige l'affichage des médailles` |
| `feat:`                                               | minor (`1.0.0` → `1.1.0`) | `feat(router): ajoute une page de détail pays`  |
| `feat!:` ou un footer `BREAKING CHANGE:`              | major (`1.0.0` → `2.0.0`) | `feat!: renomme les props du composant Home`   |
| `chore:`, `docs:`, `refactor:`, `test:`, `ci:`, ...    | pas de release             | `chore(ci): ajuste le workflow`                |

Les messages sont contrôlés localement par un hook `commit-msg` (`commitlint` + `husky`), installé automatiquement par `npm install` (script `prepare`). Un commit qui ne respecte pas la convention est rejeté avant même d'être créé. C'est un filet de sécurité local uniquement — rien ne le vérifie en CI, donc un message passé au travers (`--no-verify`, ou un clone où les hooks n'ont jamais été installés) ne compte simplement pas pour la prochaine release ; ça ne casse pas le build.

**À noter :** la toute première release n'a lieu qu'une fois qu'un commit `feat:`/`fix:` (ou breaking) arrive sur `main` — semantic-release a besoin d'au moins un commit pertinent pour publier quoi que ce soit, même le `1.0.0` initial.

### Ce que produit semantic-release

Configuré dans `.releaserc.json` :

- un tag Git `vX.Y.Z` et une Release GitHub avec des notes générées automatiquement
- un `CHANGELOG.md` à la racine du dépôt
- le champ `version` de `package.json` synchronisé (pas de publication npm — configuré explicitement en `npmPublish: false`)
- le commit de release et le changelog repoussés sur `main` sous la forme `chore(release): X.Y.Z [skip ci]`

## License

MIT
