# NameForge

A fast, client-side generator for random **pronounceable** names. Tune length,
consonant clustering, and start/end letters, then generate and copy names in
bulk. Built with React + Vite on the front end and an Express server that serves
the app (with a Drizzle/SQLite scaffold ready for future API work).

![Stack](https://img.shields.io/badge/React-18-61dafb) ![Vite](https://img.shields.io/badge/Vite-7-646cff) ![Express](https://img.shields.io/badge/Express-5-000000) ![SQLite](https://img.shields.io/badge/SQLite-better--sqlite3-003b57)

## Features

- **Pronounceable output** — letters are chosen using English-frequency weights,
  and a configurable cap on consecutive consonants keeps names easy to say.
- **Length control** — independent min/max letter sliders (1–20).
- **Batch generation** — produce 1–100 names at once.
- **Start / end constraints** — lock the first and/or last letter.
- **One-click copy** — copy a single name or the whole batch.
- **Light / dark mode** — follows your system preference, with a manual toggle.

> Name generation runs entirely in the browser ([`client/src/pages/home.tsx`](client/src/pages/home.tsx)).
> The Express server currently serves the client and ships a users table +
> storage layer ([`server/storage.ts`](server/storage.ts)) as a starting point
> for adding API routes in [`server/routes.ts`](server/routes.ts).

## Tech stack

| Layer    | Tools |
|----------|-------|
| Frontend | React 18, Vite 7, Tailwind CSS, shadcn/ui (Radix), wouter, TanStack Query |
| Backend  | Express 5, TypeScript (run via `tsx`) |
| Database | Drizzle ORM + better-sqlite3 (SQLite, `data.db`) |
| Build    | Vite (client) + esbuild (server bundle) |

## Requirements

- **Node.js 20+** (developed on Node 24)
- **npm** (a `bun.lock` is also included if you prefer [Bun](https://bun.sh))

## Installation

```bash
# 1. Clone the repository
git clone <your-repo-url> NameForge
cd NameForge

# 2. Install dependencies
npm install
```

> Using Bun instead? Run `bun install`.

The SQLite database file (`data.db`) is created automatically on first run. To
create/update tables from the Drizzle schema, run:

```bash
npm run db:push
```

## Usage

### Development

Starts the Express server with Vite middleware and hot-module reloading:

```bash
npm run dev
```

Then open the URL printed in the terminal. The app serves on **port `6324`** by
default — override it with the `PORT` environment variable:

```bash
PORT=3000 npm run dev
```

### Production build

Bundles the client (Vite → `dist/public`) and the server (esbuild → `dist/index.cjs`):

```bash
npm run build
npm start
```

`npm start` runs the bundled server with `NODE_ENV=production` on the same port
(`PORT`, default `6324`).

### Type-check

```bash
npm run check
```

## How to generate names

1. Use the **Generator Settings** sliders to set min/max letters, how many names
   to produce, and the maximum run of consecutive consonants (lower = smoother,
   more pronounceable).
2. Optionally pick a **Starts With** and/or **Ends With** letter.
3. Click **Generate Names**.
4. Click any name to copy it, or **Copy All** to grab the whole batch.

## Available scripts

| Script            | Description |
|-------------------|-------------|
| `npm run dev`     | Start the dev server (Express + Vite HMR) |
| `npm run build`   | Build client and server into `dist/` |
| `npm start`       | Run the production build |
| `npm run check`   | Type-check with `tsc` |
| `npm run db:push` | Push the Drizzle schema to `data.db` |

## Project structure

```
NameForge/
├── client/            # React front end
│   └── src/
│       ├── pages/home.tsx   # Generator UI + name-generation logic
│       └── components/ui/   # shadcn/ui components
├── server/            # Express server
│   ├── index.ts       # App entry, middleware, listener
│   ├── routes.ts      # API routes (add yours here)
│   ├── storage.ts     # Drizzle/SQLite data access
│   ├── vite.ts        # Vite dev middleware
│   └── static.ts      # Static file serving (production)
├── shared/
│   └── schema.ts      # Drizzle schema + Zod types
├── script/build.ts    # Production build script
└── drizzle.config.ts  # Drizzle Kit config
```

## Configuration

| Variable   | Default | Description |
|------------|---------|-------------|
| `PORT`     | `6324`  | Port the server listens on |
| `NODE_ENV` | —       | `development` enables Vite middleware; `production` serves the built client |

## License

Released under the [MIT](https://opensource.org/licenses/MIT) license.
