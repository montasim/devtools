# DevTools

**A fast toolbox for formatting, generating, testing, and inspecting developer data.**

[![CI](https://github.com/montasim/devtools/actions/workflows/ci.yml/badge.svg)](https://github.com/montasim/devtools/actions/workflows/ci.yml)
[![Live app](https://img.shields.io/badge/live-devtoolsn.vercel.app-000000?logo=vercel)](https://devtoolsn.vercel.app)
[![License: MIT](https://img.shields.io/badge/license-MIT-yellow.svg)](LICENSE)
[![Support on SupportKori](https://img.shields.io/badge/support-SupportKori-ffdd00)](https://www.supportkori.com/montasim)

DevTools puts more than 50 everyday utilities behind one searchable interface:
JSON and text transforms, encoders, generators, network diagnostics, security
inspectors, and reference tables. Most transformations run locally in the
browser, while account sync, saved shares, short links, webhooks, and selected
network checks use server-side APIs.

**[Open DevTools](https://devtoolsn.vercel.app)** · Press `Ctrl+K` or `Cmd+K`
inside the app to jump directly to a tool.

> **Project status:** the public tool suite is actively deployed. Local-only
> transforms work without an account; authentication, sync, sharing, short
> links, and server-assisted network tools depend on the production APIs and
> PostgreSQL configuration. CI validates lint, TypeScript, and a production
> build for changes targeting `main`.

## Why DevTools?

Small developer tasks often mean searching for many unrelated websites,
rechecking how each handles pasted data, and losing context between tools.
DevTools keeps those workflows in one consistent, searchable interface and
makes the local-versus-network processing boundary explicit.

## Tool collection

| Area | Included workflows |
| --- | --- |
| Structured data | JSON, XML, SVG, HTML, CSS, SQL, YAML, and CSV formatting or transformation |
| Text and encoding | Text cleanup and diff, Base64, URL encoding, HTML entities, cURL conversion, fancy/leet text, and text art |
| Generators | UUID/ULID/NanoID, hashes, bcrypt/Argon2, RSA keys, passwords, passphrases, QR codes, sample data, and Git branch names |
| Network and APIs | Request builder, header parser, WebSocket tester, CORS checker, DNS lookup, STUN/TURN checks, webhook inbox, certificate decoding, and IP/CIDR tools |
| References | Regex, HTTP status, MIME and Content-Type, Unicode, ASCII, emoji, time zones, and cron expressions |
| Browser utilities | Markdown preview, color and unit conversion, web playground, email-domain checks, spam-word checks, and RSS analysis |

The navigation registry in [`config/navigation.tsx`](config/navigation.tsx) is
the source of truth for the current catalog.

## Using DevTools

### Run a local transformation

1. Open [DevTools](https://devtoolsn.vercel.app) and press `Ctrl+K` or `Cmd+K`.
2. Search for a formatter, encoder, generator, parser, or reference page.
3. Paste or generate the input and choose the relevant tab or operation.
4. Review the result before copying or downloading it.
5. Clear the browser state when working on a shared device.

### Run a network check

1. Open the API, WebSocket, DNS, CORS, STUN/TURN, webhook, or email-domain tool.
2. Confirm that you are authorized to contact the target and that the request
   contains no secret that should be kept out of a third-party service.
3. Submit the narrowest useful request and inspect status, headers, timing, and
   response output.
4. Treat browser CORS failures and third-party lookup results as diagnostic
   evidence, not definitive proof that a service is unavailable or safe.

### Save or share work

Sign in with email OTP to sync supported saved items. Creating a share or short
link persists content or destination metadata on the server; set an expiration
and password where supported, and remove saved material when it is no longer
needed.

## Privacy boundary

“Browser-based” does not mean every feature is offline. The boundary is:

- Formatters, encoders, generators, parsers, and most reference tools process
  their current input in the browser.
- API, WebSocket, DNS, CORS, IP, STUN/TURN, email-domain, leaked-password, RSS,
  and webhook utilities necessarily contact the selected target or a server
  endpoint.
- Creating a share link, saved item, account, or shortened URL stores the
  submitted state in PostgreSQL. Password-protected shares store a password
  hash, but their content is still held server-side.
- Tool history and preferences that use local storage remain on that browser
  unless the user explicitly invokes an account-backed feature.

Do not paste credentials, production private keys, personal data, or classified
content into a networked workflow. Inspect the destination before sending an
API or WebSocket request.

## Technology

| Area | Technology |
| --- | --- |
| Application | Next.js 16, React 19, TypeScript 5 |
| Interface | Tailwind CSS 4, shadcn/ui, Radix UI, CodeMirror 6 |
| Client data | TanStack React Query, local storage |
| Server data | PostgreSQL, Prisma 7 |
| Authentication | Better Auth email OTP, bcrypt |
| Validation and formatting | Zod, AJV, Shiki, SQL Formatter |
| Testing and quality | Vitest, Testing Library, ESLint, Prettier, GitHub Actions |
| Deployment | Vercel |

## Platform features

- Command palette and global right-click menu for navigation and actions
- Local input history and reusable saved state
- Optional email-OTP accounts with cross-device saved items
- Expiring and optionally password-protected share links
- URL shortening with click tracking
- Webhook request capture and inspection
- Light/dark themes and responsive layouts
- Keyboard-accessible tool tabs and controls

## Run locally

### Requirements

- Node.js 24.12.0, matching [`.nvmrc`](.nvmrc)
- pnpm 10, matching the CI workflow
- PostgreSQL for authentication, shares, saved items, and short URLs

```bash
git clone https://github.com/montasim/devtools.git
cd devtools
nvm use
pnpm install
cp .env.example .env
```

Replace `DATABASE_URL` and every secret placeholder before schema setup:

```bash
pnpm exec prisma generate
pnpm exec prisma db push
pnpm dev
```

Open <http://localhost:3000>.

`prisma db push` changes the configured database schema. Point
`DATABASE_URL` at a disposable development database first; use reviewed Prisma
migrations rather than schema push for production change management.

### Active configuration

The application code currently reads these settings:

| Variable | Required for | Purpose |
| --- | --- | --- |
| `DATABASE_URL` | Server-backed features | PostgreSQL connection used by Prisma |
| `BETTER_AUTH_SECRET` | Authentication | Better Auth signing secret; falls back to `JWT_SECRET` |
| `JWT_SECRET` | Authentication fallback | Fallback signing secret when `BETTER_AUTH_SECRET` is absent |
| `BETTER_AUTH_URL` | Authentication | Canonical auth origin; falls back to `BASE_URL` |
| `BASE_URL` | Authentication fallback | Server-side fallback application origin |
| `OTP_HMAC_SECRET` | Email OTP | HMAC secret used for OTP handling |
| `RESEND_API_KEY` | Email OTP | Resend API key; without it, email delivery is skipped |
| `FROM_EMAIL` | Email OTP | Verified sender address |
| `NEXT_PUBLIC_APP_URL` | Browser links | Public origin for auth and generated short URLs |
| `NEXT_PUBLIC_BASE_URL` | Browser auth fallback | Browser-visible fallback origin for the auth client |

Replace every placeholder with a development-safe value and never commit the
result. [`.env.example`](.env.example) also contains infrastructure notes and
reserved settings; the table above is intentionally limited to variables
referenced by the current application.

## Commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start the Next.js development server |
| `pnpm build` | Generate Prisma Client and create a production build |
| `pnpm start` | Serve the production build |
| `pnpm lint` | Run ESLint |
| `pnpm lint:fix` | Run ESLint and apply safe fixes |
| `pnpm typecheck` | Check TypeScript without emitting files |
| `pnpm test --run` | Run the Vitest suite once |
| `pnpm format:check` | Check Prettier formatting |
| `pnpm format` | Rewrite files with Prettier |

`pnpm prepare` installs the repository's Husky hooks and normally runs as an
install lifecycle step.

The GitHub Actions workflow runs dependency installation, lint, TypeScript,
and the production build for pushes and pull requests targeting `main`.

## Architecture

```mermaid
flowchart LR
  Browser[Tool interface] --> Local[Local transforms and storage]
  Browser --> API[Next.js route handlers]
  API --> External[DNS / email / target services]
  API --> DB[(PostgreSQL / Prisma)]
  DB --> Accounts[Accounts, shares, saved items, short URLs]
```

```text
app/(tools)/           Tool pages and route-level metadata
features/tools/        Individual tools, tabs, hooks, data, and utilities
features/auth/         Account-facing hooks and components
app/api/               Auth, DNS, saved, share, URL, and webhook endpoints
config/navigation.tsx  Searchable tool catalog and navigation
lib/                   Auth, Prisma, API client, storage, and shared helpers
prisma/schema.prisma   Server-backed data model
```

## Documentation

- [In-app documentation](https://devtoolsn.vercel.app/docs)
- [Tool registry](config/navigation.tsx)
- [Environment template](.env.example)
- [Database schema](prisma/schema.prisma)
- [CI workflow](.github/workflows/ci.yml)
- [Privacy boundary](#privacy-boundary)
- [Local development](#run-locally)

## Deployment

The maintained deployment runs at
[devtoolsn.vercel.app](https://devtoolsn.vercel.app). A self-hosted deployment
needs a PostgreSQL database and production values for the active configuration
above. Use HTTPS for auth and shared-content flows, set the canonical public
origin consistently, and apply the Prisma schema before serving traffic.

## Limitations

- Browser security policies can block cross-origin API checks even when the
  target works from a server or CLI.
- DNS, IP reputation, disposable-email, and similar third-party information can
  be incomplete or stale.
- Cryptographic utilities are convenience tools, not a substitute for a
  reviewed key-management or password-storage design.
- Share and URL-shortener availability depends on the deployment and database;
  local-only utilities remain useful without an account.
- The current CI workflow does not execute the Vitest suite; run
  `pnpm test --run` explicitly when changing tool behavior.

## Contributing and security

Open a focused issue or pull request with reproduction steps, screenshots when
useful, and the checks you ran. New tools should declare whether input stays in
the browser, contacts a third party, or is persisted server-side.

Report vulnerabilities privately through the contact links on
[the maintainer's GitHub profile](https://github.com/montasim), not in a public
issue. Never include real secrets or user-submitted share content in reports.

The repository currently has no dedicated `CONTRIBUTING.md`, `SECURITY.md`,
`CODE_OF_CONDUCT.md`, or `SUPPORT.md`. Use
[Issues](https://github.com/montasim/devtools/issues) for public reports,
[Pull Requests](https://github.com/montasim/devtools/pulls) for changes, and the
maintainer's profile for private security reports. Contributions use
Conventional Commits as configured by commitlint.

Optional support through [SupportKori](https://www.supportkori.com/montasim)
helps fund hosting and maintenance.

## Funding

Optional SupportKori contributions help cover hosting, database services, and
maintenance of the growing tool catalog. Bug reports, tests, accessibility
improvements, and documentation are equally valuable.

[![Support DevTools on SupportKori](https://img.shields.io/badge/Support_DevTools-SupportKori-00B8B5?style=for-the-badge)](https://www.supportkori.com/montasim)

## License

Licensed under the [MIT License](LICENSE).

## Maintainer

[Mohammad Montasim Al Mamun Shuvo](https://github.com/montasim)
