# Development guide

This guide is for working on the project locally. For the system design, see [ARCHITECTURE.md](ARCHITECTURE.md).

## Requirements

- Node.js 22 or newer (see `.nvmrc`)
- npm 10 or newer
- MongoDB Atlas or a local MongoDB instance

## First-time setup

```bash
git clone https://github.com/NajmosSalahin/Integration.git
cd Integration
npm install
cd client && npm install
cd ../server && npm install
cd ..
cp .env.example .env.development
```

Fill in `MONGO_URI`, `JWT_SECRET`, and `JWT_REFRESH_SECRET` at minimum. Generate secrets with:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Run the demo seed once:

```bash
npm run seed
```

Start both apps:

```bash
npm run dev
```

## Environment files

The server loads the environment file from the repository root:

- `.env.development` by default
- `.env.production` when `NODE_ENV=production`
- `ENV_FILE=/path/to/file` overrides both

Never commit a real `.env` file. The `.gitignore` excludes `.env*` except `.env.example`.

## Branching and commits

- `master` is the production branch.
- `develop` is the integration branch.
- Feature branches use `feat/<short-name>` or `fix/<short-name>`.
- Commit messages follow Conventional Commits: `feat:`, `fix:`, `chore:`, `docs:`, `refactor:`, `test:`, `ci:`, `build:`, `perf:`.
- Husky enforces the commit format and warns when code changes without a `CHANGELOG.md` update.

## Adding an API endpoint

1. Add or extend a Zod schema in `server/utils/validate.js`.
2. Add the handler in the matching `server/controllers/*.js` file.
3. Register the route in `server/routes/*.js` with `protect`, `requireSections(...)`, and `validate(...)` where appropriate.
4. Add a test in `server/tests/` if the behaviour is non-trivial.
5. Update the route table in [ARCHITECTURE.md](ARCHITECTURE.md) if the public API changes.
6. Add a `CHANGELOG.md` entry for user-visible changes.

## Adding a frontend page

1. Create the component in `client/src/pages/`.
2. Register the route in the router (see `client/src/App.jsx` or the router entry).
3. Add a fetch wrapper in `client/src/api/` if the page needs new data.
4. Use TanStack Query for server state and Zustand only for client-owned state such as the cart.
5. Add route metadata in `server/seo.js` if the page should be indexable.

## Styling

- Tailwind CSS 4 utility classes for layout and spacing.
- CSS variables for theme colours (`--bg`, `--text-primary`, `--accent`, and so on).
- Framer Motion for page and component transitions.
- Keep components accessible: labelled controls, focus states, and reduced-motion fallbacks.

## Testing

```bash
npm test
```

The suite uses `node:test` and lives in `server/tests/`. It covers auth middleware, session rotation, validation, rate limits, coupons, order status, email verification, origin handling, proxy trust, and health reporting.

Before opening a pull request:

```bash
npm test
npm run build
```

CI runs the same checks plus `npm audit` and gitleaks.

## Demo seed

`server/utils/seedDemo.js` inserts eight generic products, four categories, and three local banners. It uses the SVG assets in `client/public/demo/`.

- `npm run seed` inserts only when the products collection is empty.
- `npm run seed -- --reset` replaces products, banners, and categories.
- The script refuses to run with `NODE_ENV=production` unless `--force` is passed.

Do not add real catalog data or customer data to this repository.

## Admin accounts

Create an admin with an explicit password:

```bash
cd server
npm run make:admin -- you@example.com --password "a-long-unique-password" --permissions orders,products,coupons,banners,categories
```

Passwords must be at least 12 characters. The optional `ADMIN_BOOTSTRAP_*` flow only runs when `ALLOW_ADMIN_BOOTSTRAP=true`; use it for a first deploy, then remove the variables.

## Deployment

`render.yaml` defines one web service:

- Build: root install, client install/build, server install
- Start: `cd server && node server.js`
- Health check: `/api/health`

Set environment variables in the Render dashboard, not in the repository. After a deploy, verify:

- `/api/health` returns the package version
- Home, shop, and a product page load
- Login, refresh, and logout work
- Admin pages load for an admin account
- Checkout creates an order and sends the expected emails

## Security checks

- Never commit secrets. gitleaks runs in CI and on pre-commit if installed.
- Use `process.env` for every credential.
- Validate and authorise on the server; client checks are UX only.
- Report vulnerabilities privately as described in [SECURITY.md](../SECURITY.md).

## Release checklist

1. Update `CHANGELOG.md`.
2. Bump the version in the root, client, and server `package.json` files.
3. Run `npm test` and `npm run build`.
4. Commit with a conventional message.
5. Tag the release (`vX.Y.Z`) and push the tag.
6. Create a GitHub Release with the changelog summary.
7. Deploy and verify the health endpoint and the main flows.
