# Integration

A curated t‑shirt storefront built on the MERN stack — **M**ongoDB (Atlas), **E**xpress, **R**eact, **N**ode.

## Overview

Integration is a full‑stack e‑commerce demo/storefront split into two independently runnable apps:

- **`client/`** — the React frontend
- **`server/`** — the Express + MongoDB backend

The repo is set up as a lightweight monorepo: a root `package.json` orchestrates both apps for local development and deployment, so you generally only need to run commands from the project root.

## Tech stack

- **Frontend:** React (`client/`)
- **Backend:** Express (`server/`)
- **Database:** MongoDB Atlas
- **Tooling:** Husky (git hooks), Concurrently (run client + server together)
- **Deployment:** configured for [Render](https://render.com) via `render.yaml`

## Project structure

```
Integration/
├── client/              # React frontend
├── server/              # Express API + MongoDB models/routes
├── versions/            # (see repo for details)
├── INTEGRATION_LOGO/    # brand assets
├── render.yaml          # Render deployment config
├── package.json         # root scripts (dev, build, start, seed)
├── AGENTS.md            # notes for AI coding agents working in this repo
├── DESIGN.md            # design/architecture notes
├── HANDOFF.md           # project handoff notes
├── CHANGELOG.md         # release history
└── MEMORY.md            # project memory/context notes
```

> This repo also includes `AGENTS.md`, `DESIGN.md`, `HANDOFF.md`, and `MEMORY.md` — worth a look for deeper context on architecture and conventions before making changes.

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS recommended)
- npm
- A [MongoDB Atlas](https://www.mongodb.com/atlas) cluster (or local MongoDB instance)

### Installation

```bash
git clone https://github.com/NajmosSalahin/Integration.git
cd Integration
npm install
```

Install dependencies for each app as well:

```bash
cd client && npm install
cd ../server && npm install
```

### Environment variables

The server needs a MongoDB connection string and any other secrets it depends on (e.g. JWT secret, port). Create a `.env` file inside `server/` — check `server/` for a `.env.example` or the config/db files to see exactly which variables are required.

```env
MONGODB_URI=your_mongodb_atlas_connection_string
PORT=5000
# add any additional variables the server expects
```

### Running locally

From the project root, run both client and server together:

```bash
npm run dev
```

Or run them individually:

```bash
npm run dev:client   # starts the React client
npm run dev:server   # starts the Express server
```

### Seeding the database

The project ships with seed scripts for products and users:

```bash
npm run seed          # seed products
npm run seed:users    # seed users
```

### Building for production

```bash
npm run build   # builds the client
npm start        # starts the server (serving the built client, depending on config)
```

## Deployment

The included `render.yaml` configures this project for deployment on [Render](https://render.com). Connect the repository to Render and it should pick up the service definitions from that file.

## Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes
4. Push to the branch and open a Pull Request

Husky is configured to run git hooks automatically after `npm install` — check `.husky/` for what runs on commit/push.

## License

[Add your license here, e.g. MIT]

## Author

**Najmos Salahin** — [GitHub](https://github.com/NajmosSalahin)
