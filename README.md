# DevTools

A comprehensive suite of 30+ free developer tools for formatting, validating, generating, and transforming data. All tools run entirely in your browser for maximum privacy and speed.

## Features

### Formatters & Converters

| Tool                          | Description                                                  |
| ----------------------------- | ------------------------------------------------------------ |
| **JSON Tools**                | Format, minify, diff, validate, and transform JSON           |
| **Text Tools**                | Diff, case conversion, and text cleaning                     |
| **Base64 Tools**              | Encode/decode Base64 with media preview and format detection |
| **URL Encode/Decode**         | Encode and decode percent-encoded URLs                       |
| **HTML Entity Encode/Decode** | Encode and decode HTML entities                              |
| **cURL Converter**            | Convert cURL to fetch, Axios, Python, and HTTPie             |
| **Number Base Converter**     | Binary, octal, decimal, hex, and custom radix                |
| **CSS Unit Converter**        | Convert between px, rem, em, vw, vh, pt, cm                  |
| **Color Picker**              | HEX, RGB, HSL, OKLCH and palette generator                   |
| **Markdown Preview**          | Write Markdown with live preview                             |

### Generators

| Tool                       | Description                          |
| -------------------------- | ------------------------------------ |
| **ID Generator**           | Generate UUIDs, ULIDs, and NanoIDs   |
| **Hash Generator**         | Generate hashes and HMAC signatures  |
| **Bcrypt / Argon2 Hasher** | Hash and verify passwords            |
| **RSA Key Generator**      | Generate RSA key pairs (PEM/DER)     |
| **Password Generator**     | Secure passwords with strength meter |
| **QR Code Generator**      | Generate customizable QR codes       |
| **Git Branch Generator**   | Generate consistent git branch names |

### Network & API

| Tool                    | Description                                         |
| ----------------------- | --------------------------------------------------- |
| **API Request Builder** | Build, test, and debug HTTP requests                |
| **WebSocket Tester**    | Connect to WS endpoints, send/receive in real-time  |
| **CORS Checker**        | Test cross-origin requests and inspect CORS headers |
| **Certificate Decoder** | Decode and inspect SSL/TLS X.509 certificates       |
| **User Agent Analyzer** | Parse and decode User-Agent strings                 |
| **DNS Lookup**          | Query NS, A, AAAA, MX, TXT, CNAME, SOA, PTR records |

### Reference

| Tool                    | Description                                                |
| ----------------------- | ---------------------------------------------------------- |
| **Regex Tester**        | Test regex with live matching and capture groups           |
| **HTTP Status Codes**   | Searchable reference with descriptions and specs           |
| **MIME Type Reference** | File extension to MIME type mapping                        |
| **Unicode Lookup**      | Search Unicode characters by name and codepoint            |
| **ASCII Table**         | Interactive ASCII/Unicode reference with search and filter |

### Utilities

| Tool               | Description                                          |
| ------------------ | ---------------------------------------------------- |
| **CRON Builder**   | Visual cron expression builder with next-run preview |
| **Unit Converter** | Data sizes, time durations, and time zones           |
| **URL Shortener**  | Shorten long URLs into compact links                 |

### Platform Features

- **Command Palette** — Press `Cmd+K` / `Ctrl+K` to search tools, actions, and pages
- **Context Menu** — Right-click anywhere for save, share, history, navigation, and quick tool access
- **Share Text** — Share content via links with optional password protection and expiration
- **Save & Sync** — Save tool state to your account and restore across sessions
- **History** — Automatic local history tracking for all tool inputs
- **Authentication** — Sign up, login, profile management with email/password
- **Dark Mode** — Full dark/light theme support with system preference detection
- **Responsive** — Works on desktop, tablet, and mobile
- **Easter Egg** — Try the Konami code (↑↑↓↓←→←→BA)
- **Console Banner** — Branded ASCII art greeting in browser DevTools console

## Tech Stack

| Layer     | Technology                         |
| --------- | ---------------------------------- |
| Framework | Next.js 16 (App Router, Turbopack) |
| UI        | React 19, shadcn/ui, Radix UI      |
| Styling   | Tailwind CSS 4                     |
| State     | TanStack React Query               |
| Editor    | CodeMirror 6                       |
| Database  | PostgreSQL via Prisma 7            |
| Auth      | JWT with bcrypt password hashing   |
| Icons     | Lucide React, Tabler Icons         |
| Email     | Resend                             |
| Language  | TypeScript                         |

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- PostgreSQL (for auth and save/share features)

### Installation

```bash
git clone <repository-url>
cd devtools

pnpm install

# Set up environment variables
cp .env.example .env
# Edit .env with your database URL and other secrets

# Set up database
pnpm prisma generate
pnpm prisma db push

pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Available Scripts

```bash
pnpm dev             # Start development server
pnpm build           # Build for production
pnpm start           # Start production server
pnpm lint            # Run ESLint
pnpm lint:fix        # Fix ESLint errors
pnpm format          # Format with Prettier
pnpm format:check    # Check formatting
pnpm typecheck       # TypeScript type checking
pnpm test            # Run Vitest
```

## Project Structure

```
devtools/
├── app/
│   ├── (auth)/              # Auth pages (login, signup, profile, reset-password)
│   ├── (legal)/             # Legal pages (privacy, terms, cookies, disclaimer)
│   ├── (tools)/             # 30 tool pages
│   ├── api/                 # API routes (auth, saved, shares, shortener)
│   ├── docs/                # Documentation
│   ├── share/               # Shared content viewer
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
├── components/
│   ├── layout/              # Layout components (context menu, command palette, easter egg)
│   ├── navbar/              # Navigation bar
│   ├── providers/           # Theme, auth, query, tooltip providers
│   └── ui/                  # Reusable UI primitives (shadcn)
├── config/
│   ├── navigation.tsx       # Navigation menu and tool definitions
│   └── seo.ts               # SEO metadata for all pages
├── features/
│   ├── auth/                # Authentication hooks and components
│   └── tools/               # Tool implementations
│       ├── core/            # Shared hooks, components, plugins, context
│       └── <tool>/          # Individual tool modules with tabs
├── hooks/                   # Shared React hooks
├── lib/                     # Utilities, API client, SEO helpers
└── prisma/                  # Database schema and migrations
```

## Keyboard Shortcuts

| Shortcut           | Action               |
| ------------------ | -------------------- |
| `Cmd+K` / `Ctrl+K` | Open command palette |
| `↑↑↓↓←→←→BA`       | Easter egg           |

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

This project uses [Conventional Commits](https://www.conventionalcommits.org/) enforced by commitlint.

## License

MIT
