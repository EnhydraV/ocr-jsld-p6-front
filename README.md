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
├── index.html                      # Template HTML SPA
├── package.json
├── tsconfig.json                   # Configuration TypeScript stricte
├── vite.config.ts                  # Configuration Vite
├── jest.config.js                  # Configuration Jest
├── babel.config.json               # Presets Babel pour Jest (env, react, typescript)
├── tailwind.config.js              # Configuration Tailwind CSS
├── postcss.config.js               # Configuration PostCSS
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
docker run -p 8080:8080 olympic-tracker
```

### Details du build

| Stage | Image de base | Role |
|---|---|---|
| `builder` | `node:24.18.0-alpine` | `npm install` puis `npm run build` (`tsc` + Vite), produit `/app/dist` |
| `runner` | `nginxinc/nginx-unprivileged:alpine3.23` | Sert `dist/` en statique sur le port 8080, en utilisateur non-root |

La configuration Nginx (`nginx.conf`) gere le fallback SPA (`try_files $uri /index.html`) pour le routing cote client de React Router, ainsi que le cache long des assets statiques et la compression gzip.

## License

MIT
