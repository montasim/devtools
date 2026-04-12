# Shareable App State - Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build core infrastructure for persistent, database-backed shareable links with password protection and configurable expiration

**Architecture:** Two-table PostgreSQL schema (SharedLink + SharedContent) with Next.js API routes, serverless-compatible connection pooling, and token-based authorization for updates

**Tech Stack:** Next.js 16.2.2, Prisma 7.4.2, PostgreSQL, bcrypt, React 19, TypeScript

---

## File Structure Map

```
prisma/
  schema.prisma                          # Add SharedLink and SharedContent models

lib/
  prisma.ts                              # Update with connection pooling
  share/
    rate-limit.ts                        # IP-based rate limiting utility
    validate-state.ts                    # State validation logic
    crypto.ts                            # Password hashing with bcrypt
    logger.ts                            # Share event logging
  constants.ts                           # Add MAX_STATE_SIZE constant

types/
  share.ts                               # TypeScript interfaces for share types

app/api/share/
  route.ts                               # POST /api/share (create)
  [id]/
    route.ts                             # GET (metadata), PATCH (update), DELETE
    access/
      route.ts                           # POST /api/share/:id/access (with password)

app/text/
  [id]/
    page.tsx                             # Shared link viewer page

.env.local.example                      # Environment variables template
```

---

## Pre-Flight Checks

**Before starting implementation, verify these requirements:**

- [ ] **Step 1: Install bcrypt dependency**

Run: `pnpm add bcrypt`
Run: `pnpm add -D @types/bcrypt`
Expected: bcrypt added to package.json dependencies

- [ ] **Step 2: Verify PostgreSQL is running**

Run: `psql $DATABASE_URL -c "SELECT 1"`
Expected: Database connection successful

- [ ] **Step 3: Verify Prisma schema has DATABASE_URL**

Check `prisma/schema.prisma` contains:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

If missing, add it before proceeding.

- [ ] **Step 4: Verify TypeScript path aliases**

Check `tsconfig.json` has paths configured:

```json
{
    "compilerOptions": {
        "paths": {
            "@/*": ["./*"]
        }
    }
}
```

- [ ] **Step 5: Verify Vitest test configuration**

Check `vitest.config.ts` or `vite.config.ts` includes:

```typescript
test: {
  include: ['**/__tests__/**/*.ts', '**/*.test.ts'],
}
```

- [ ] **Step 6: Create types directory if needed**

Run: `mkdir -p types`
Expected: Directory created (or already exists)

---

## Task 1: Add Database Models

**Files:**

- Modify: `prisma/schema.prisma`
- Test: (manual - verify migration)

- [ ] **Step 1: Add SharedLink and SharedContent models to Prisma schema**

Open `prisma/schema.prisma` and add after existing models:

```prisma
// Shareable app state models
model SharedLink {
  id           String   @id @default(cuid())
  pageType     String                              // 'text', 'json', etc.
  title        String?                             // Optional user-provided title
  expiresAt    DateTime?                           // Null = never expires
  passwordHash String?                             // Null = public access
  updateToken  String?   @unique                   // Authorization token for updates/deletes
  viewCount    Int      @default(0)
  updatedAt    DateTime @updatedAt
  createdAt    DateTime @default(now())

  content      SharedContent @relation

  @@index([pageType])
  @@index([createdAt])
  @@index([updateToken])  // For faster update token lookups
}

model SharedContent {
  id        String   @id @default(cuid())
  linkId    String   @unique
  state     Json                              // Page-specific state as JSON
  link      SharedLink @relation(fields: [linkId], references: [id], onDelete: Cascade)

  @@index([linkId])
}
```

- [ ] **Step 2: Format Prisma schema**

Run: `npx prisma format`
Expected: Schema reformatted with proper indentation

- [ ] **Step 3: Create database migration**

Run: `npx prisma migrate dev --name add_shared_links`
Expected: Migration created and applied, database schema updated

- [ ] **Step 4: Regenerate Prisma client**

Run: `npx prisma generate`
Expected: Prisma client regenerated with new models

- [ ] **Step 5: Verify migration in database**

Run: `psql $DATABASE_URL -c "\dt+" | grep Shared`
Expected: Tables `SharedLink` and `SharedContent` listed with indexes

- [ ] **Step 6: Commit**

```bash
git add prisma/schema.prisma prisma/migrations
git commit -m "feat: add SharedLink and SharedContent database models"
```

---

## Task 2: Add Constants

**Files:**

- Modify: `lib/constants.ts`

- [ ] **Step 1: Add share-related constants**

Open `lib/constants.ts` and add to the file:

```typescript
// Shareable state limits
export const SHARE_LIMITS = {
    MAX_STATE_SIZE: 5 * 1024 * 1024, // 5MB total
    MAX_FIELD_SIZE: 1024 * 1024, // 1MB per field
    RATE_LIMIT_MAX: 10, // Max creates per hour
    RATE_LIMIT_WINDOW: 3600000, // 1 hour in milliseconds
} as const;
```

- [ ] **Step 2: Run TypeScript check**

Run: `pnpm typecheck`
Expected: No type errors

- [ ] **Step 3: Commit**

```bash
git add lib/constants.ts
git commit -m "feat: add share limits constants"
```

---

## Task 3: Create TypeScript Types

**Files:**

- Create: `types/share.ts`

- [ ] **Step 1: Create share type definitions**

Create `types/share.ts`:

```typescript
// Page state types
export interface TextPageState {
    activeTab: 'diff' | 'convert' | 'clean';
    tabs: {
        diff: DiffTabState;
        convert: ConvertTabState;
        clean: CleanTabState;
    };
}

export interface DiffTabState {
    input1: string;
    input2: string;
    options?: {
        caseSensitive?: boolean;
        ignoreWhitespace?: boolean;
    };
}

export interface ConvertTabState {
    input: string;
    output: string;
    conversionType: string | null;
}

export interface CleanTabState {
    input: string;
    output: string;
    selectedOperations: string[];
}

// Generic page state
export type AppPageState = TextPageState | Record<string, unknown>;

// API request/response types
export interface CreateShareRequest {
    pageType: string;
    state: AppPageState;
    title?: string;
    expiresAt?: string; // ISO date
    password?: string;
}

export interface CreateShareResponse {
    id: string;
    shortUrl: string;
    fullUrl: string;
    updateToken: string;
}

export interface ShareMetadata {
    id: string;
    pageType: string;
    title: string | null;
    expiresAt: string | null;
    hasPassword: boolean;
    viewCount: number;
    createdAt: string;
    updatedAt: string;
}

export interface AccessShareRequest {
    password?: string;
}

export interface AccessShareResponse {
    state: AppPageState;
    linkId: string;
}

export interface UpdateShareRequest {
    state?: AppPageState;
    title?: string;
    expiresAt?: string;
    password?: string | null;
}

export interface UpdateShareResponse {
    updatedAt: string;
}

export interface DeleteShareResponse {
    success: boolean;
}

// Error types
export interface ShareError {
    error: string;
    message: string;
    details?: unknown;
}

export type ShareErrorCode =
    | 'NOT_FOUND'
    | 'EXPIRED'
    | 'INVALID_PASSWORD'
    | 'PASSWORD_REQUIRED'
    | 'STATE_TOO_LARGE'
    | 'INVALID_STATE'
    | 'RATE_LIMITED';
```

- [ ] **Step 2: Run TypeScript check**

Run: `pnpm typecheck`
Expected: No type errors

- [ ] **Step 3: Commit**

```bash
git add types/share.ts
git commit -m "feat: add share type definitions"
```

---

## Task 4: Update Prisma Client with Connection Pooling

**Files:**

- Modify: `lib/prisma.ts` (update if needed)

- [ ] **Step 1: Verify lib/prisma.ts exists and is correct**

Run: `ls -la lib/prisma.ts`
Expected: File exists

- [ ] **Step 2: Verify prisma export**

The file should already exist with correct imports using `@/lib/generated/prisma/client` and PrismaPg adapter. No changes needed.

- [ ] **Step 2: Run TypeScript check**

Run: `pnpm typecheck`
Expected: No type errors

- [ ] **Step 3: Test Prisma connection**

Run: `node -e "require('./lib/prisma.ts').prisma.\$disconnect()"`
Expected: No errors

- [ ] **Step 4: Commit**

```bash
git add lib/prisma.ts
git commit -m "feat: add Prisma client with serverless connection pooling"
```

---

## Task 5: Create Crypto Utility

**Files:**

- Create: `lib/share/crypto.ts`
- Test: Manual test file

- [ ] **Step 1: Write failing test for crypto utility**

Create `lib/share/__tests__/crypto.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { hashPassword, comparePassword, generateUpdateToken } from '../crypto';

describe('crypto', () => {
    describe('hashPassword', () => {
        it('should hash a password', async () => {
            const hash = await hashPassword('test-password');
            expect(hash).toBeDefined();
            expect(hash).not.toBe('test-password');
            expect(hash.length).toBeGreaterThan(20);
        });
    });

    describe('comparePassword', () => {
        it('should compare correct password', async () => {
            const hash = await hashPassword('test-password');
            const isValid = await comparePassword('test-password', hash);
            expect(isValid).toBe(true);
        });

        it('should reject incorrect password', async () => {
            const hash = await hashPassword('test-password');
            const isValid = await comparePassword('wrong-password', hash);
            expect(isValid).toBe(false);
        });
    });

    describe('generateUpdateToken', () => {
        it('should generate unique tokens', () => {
            const token1 = generateUpdateToken();
            const token2 = generateUpdateToken();
            expect(token1).not.toBe(token2);
            expect(token1.length).toBeGreaterThan(20);
        });
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test lib/share/crypto.test.ts`
Expected: FAIL with "Cannot find module '../crypto'"

- [ ] **Step 3: Implement crypto utility**

Create `lib/share/crypto.ts`:

```typescript
import bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

export async function hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
}

export function generateUpdateToken(): string {
    return randomBytes(32).toString('base64url');
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test lib/share/crypto.test.ts`
Expected: PASS all tests

- [ ] **Step 5: Run TypeScript check**

Run: `pnpm typecheck`
Expected: No type errors

- [ ] **Step 6: Commit**

```bash
git add lib/share/
git commit -m "feat: add crypto utility for password hashing and token generation"
```

---

## Task 6: Create State Validation Utility

**Files:**

- Create: `lib/share/validate-state.ts`
- Test: `lib/share/__tests__/validate-state.test.ts`

- [ ] **Step 1: Write failing test for state validation**

Create `lib/share/__tests__/validate-state.test.ts`:

```typescript
import { describe, it, expect } from 'vitest';
import { validateState, ValidationError } from '../validate-state';
import { SHARE_LIMITS } from '@/lib/constants';
import type { AppPageState } from '@/types/share';

describe('validateState', () => {
    it('should pass valid state', () => {
        const state: AppPageState = {
            activeTab: 'diff',
            tabs: {
                diff: { input1: 'test', input2: 'test2' },
                convert: { input: 'test', output: 'TEST', conversionType: 'UPPERCASE' },
                clean: { input: 'test', output: 'test', selectedOperations: [] },
            },
        };
        expect(() => validateState(state, 'text')).not.toThrow();
    });

    it('should throw on missing activeTab', () => {
        const state = { tabs: {} } as unknown as AppPageState;
        expect(() => validateState(state, 'text')).toThrow(ValidationError);
    });

    it('should throw on missing tabs', () => {
        const state = { activeTab: 'diff' } as unknown as AppPageState;
        expect(() => validateState(state, 'text')).toThrow(ValidationError);
    });

    it('should throw on invalid tab', () => {
        const state = {
            activeTab: 'invalid',
            tabs: {},
        } as unknown as AppPageState;
        expect(() => validateState(state, 'text')).toThrow(ValidationError);
    });

    it('should throw on state too large', () => {
        const largeText = 'x'.repeat(SHARE_LIMITS.MAX_STATE_SIZE + 1);
        const state = {
            activeTab: 'diff',
            tabs: {
                diff: { input1: largeText, input2: 'test' },
                convert: { input: 'test', output: 'TEST', conversionType: null },
                clean: { input: 'test', output: 'test', selectedOperations: [] },
            },
        };
        expect(() => validateState(state, 'text')).toThrow(ValidationError);
    });

    it('should throw on field too large', () => {
        const largeText = 'x'.repeat(SHARE_LIMITS.MAX_FIELD_SIZE + 1);
        const state = {
            activeTab: 'diff',
            tabs: {
                diff: { input1: largeText, input2: 'test' },
                convert: { input: 'test', output: 'TEST', conversionType: null },
                clean: { input: 'test', output: 'test', selectedOperations: [] },
            },
        };
        expect(() => validateState(state, 'text')).toThrow(ValidationError);
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test lib/share/validate-state.test.ts`
Expected: FAIL with "Cannot find module '../validate-state'"

- [ ] **Step 3: Implement state validation**

Create `lib/share/validate-state.ts`:

```typescript
import { SHARE_LIMITS } from '@/lib/constants';
import type { AppPageState, ShareErrorCode } from '@/types/share';

export class ValidationError extends Error {
    code: ShareErrorCode;
    details?: unknown;

    constructor(code: ShareErrorCode, message: string, details?: unknown) {
        super(message);
        this.name = 'ValidationError';
        this.code = code;
        this.details = details;
    }
}

export function validateState(state: unknown, pageType: string): asserts state is AppPageState {
    // Validate basic structure
    if (!state || typeof state !== 'object') {
        throw new ValidationError('INVALID_STATE', 'State must be an object');
    }

    const s = state as Record<string, unknown>;

    if (!s.activeTab || typeof s.activeTab !== 'string') {
        throw new ValidationError('INVALID_STATE', 'State must have activeTab property');
    }

    if (!s.tabs || typeof s.tabs !== 'object') {
        throw new ValidationError('INVALID_STATE', 'State must have tabs property');
    }

    // Validate page type
    const validTabs = ['diff', 'convert', 'clean'];
    if (pageType === 'text' && !validTabs.includes(s.activeTab as string)) {
        throw new ValidationError('INVALID_STATE', `Invalid tab: ${s.activeTab}`);
    }

    // Validate content size
    const stateSize = JSON.stringify(state).length;
    if (stateSize > SHARE_LIMITS.MAX_STATE_SIZE) {
        throw new ValidationError(
            'STATE_TOO_LARGE',
            `State size ${stateSize} exceeds limit ${SHARE_LIMITS.MAX_STATE_SIZE}`,
        );
    }

    // Validate individual field sizes
    const tabs = s.tabs as Record<string, Record<string, unknown>>;
    for (const [tabName, tabData] of Object.entries(tabs)) {
        if (!tabData || typeof tabData !== 'object') continue;

        for (const [field, value] of Object.entries(tabData)) {
            if (typeof value === 'string' && value.length > SHARE_LIMITS.MAX_FIELD_SIZE) {
                throw new ValidationError(
                    'STATE_TOO_LARGE',
                    `Field ${tabName}.${field} exceeds size limit`,
                );
            }
        }
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test lib/share/validate-state.test.ts`
Expected: PASS all tests

- [ ] **Step 5: Run TypeScript check**

Run: `pnpm typecheck`
Expected: No type errors

- [ ] **Step 6: Commit**

```bash
git add lib/share/validate-state.ts lib/share/__tests__/validate-state.test.ts
git commit -m "feat: add state validation utility"
```

---

## Task 7: Create Rate Limiting Utility

**Files:**

- Create: `lib/share/rate-limit.ts`
- Test: `lib/share/__tests__/rate-limit.test.ts`

- [ ] **Step 1: Write failing test for rate limiting**

Create `lib/share/__tests__/rate-limit.test.ts`:

```typescript
import { describe, it, expect, beforeEach } from 'vitest';
import { checkRateLimit, RateLimitError } from '../rate-limit';
import { SHARE_LIMITS } from '@/lib/constants';

describe('rate-limit', () => {
    beforeEach(() => {
        // Clear rate limit data
        const requests = (global as any).__rateLimitRequests;
        if (requests) requests.clear();
    });

    it('should allow requests under limit', () => {
        const ip = '127.0.0.1';
        for (let i = 0; i < SHARE_LIMITS.RATE_LIMIT_MAX; i++) {
            const result = checkRateLimit(ip);
            expect(result.allowed).toBe(true);
        }
    });

    it('should block requests over limit', () => {
        const ip = '127.0.0.2';
        // Exhaust limit
        for (let i = 0; i < SHARE_LIMITS.RATE_LIMIT_MAX; i++) {
            checkRateLimit(ip);
        }
        // Next request should be blocked
        const result = checkRateLimit(ip);
        expect(result.allowed).toBe(false);
        expect(result.remaining).toBe(0);
    });

    it('should track remaining requests', () => {
        const ip = '127.0.0.3';
        const result1 = checkRateLimit(ip);
        expect(result1.remaining).toBe(SHARE_LIMITS.RATE_LIMIT_MAX - 1);

        const result2 = checkRateLimit(ip);
        expect(result2.remaining).toBe(SHARE_LIMITS.RATE_LIMIT_MAX - 2);
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test lib/share/rate-limit.test.ts`
Expected: FAIL with "Cannot find module '../rate-limit'"

- [ ] **Step 3: Implement rate limiting**

Create `lib/share/rate-limit.ts`:

```typescript
import { SHARE_LIMITS } from '@/lib/constants';
import type { ShareErrorCode } from '@/types/share';

export class RateLimitError extends Error {
    code: ShareErrorCode;
    remaining: number;

    constructor(remaining: number) {
        super('Rate limit exceeded');
        this.name = 'RateLimitError';
        this.code = 'RATE_LIMITED';
        this.remaining = remaining;
    }
}

// In-memory rate limiter for development
// TODO: Replace with Upstash Redis for production
const requests = new Map<string, number[]>();

export function checkRateLimit(ip: string): { allowed: boolean; remaining: number } {
    const now = Date.now();
    const windowStart = now - SHARE_LIMITS.RATE_LIMIT_WINDOW;
    const userRequests = requests.get(ip) || [];

    // Remove old requests outside the window
    const recent = userRequests.filter((t) => t > windowStart);

    if (recent.length >= SHARE_LIMITS.RATE_LIMIT_MAX) {
        return { allowed: false, remaining: 0 };
    }

    recent.push(now);
    requests.set(ip, recent);
    return { allowed: true, remaining: SHARE_LIMITS.RATE_LIMIT_MAX - recent.length };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test lib/share/rate-limit.test.ts`
Expected: PASS all tests

- [ ] **Step 5: Run TypeScript check**

Run: `pnpm typecheck`
Expected: No type errors

- [ ] **Step 6: Commit**

```bash
git add lib/share/rate-limit.ts lib/share/__tests__/rate-limit.test.ts
git commit -m "feat: add in-memory rate limiting utility"
```

---

## Task 8: Create Logger Utility

**Files:**

- Create: `lib/share/logger.ts`

- [ ] **Step 1: Implement logger utility**

Create `lib/share/logger.ts`:

```typescript
export type ShareEventType = 'created' | 'accessed' | 'updated' | 'deleted';

export interface ShareEvent {
    type: ShareEventType;
    linkId: string;
    pageType: string;
    ip?: string;
    success: boolean;
    error?: string;
}

export function logShareEvent(event: ShareEvent): void {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
        console.log('[Share]', event);
    }

    // In production, send to monitoring service
    // e.g., Datadog, New Relic, or Vercel Analytics
    // TODO: Integrate with production monitoring
}
```

- [ ] **Step 2: Run TypeScript check**

Run: `pnpm typecheck`
Expected: No type errors

- [ ] **Step 3: Commit**

```bash
git add lib/share/logger.ts
git commit -m "feat: add share event logger utility"
```

---

## Task 9: Create POST /api/share Route

**Files:**

- Create: `app/api/share/route.ts`
- Test: `app/api/share/__tests__/route.test.ts`

- [ ] **Step 1: Write failing test for create endpoint**

Create `app/api/share/__tests__/route.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { POST } from '../route';
import { prisma } from '@/lib/prisma';

describe('POST /api/share', () => {
    beforeEach(async () => {
        // Setup test database state
    });

    afterEach(async () => {
        // Cleanup test database state
    });

    it('should create a shared link', async () => {
        const request = new Request('http://localhost:3000/api/share', {
            method: 'POST',
            body: JSON.stringify({
                pageType: 'text',
                state: {
                    activeTab: 'diff',
                    tabs: {
                        diff: { input1: 'test', input2: 'test2' },
                        convert: { input: '', output: '', conversionType: null },
                        clean: { input: '', output: '', selectedOperations: [] },
                    },
                },
            }),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(201);
        expect(data.id).toBeDefined();
        expect(data.shortUrl).toBeDefined();
        expect(data.fullUrl).toBeDefined();
        expect(data.updateToken).toBeDefined();
    });

    it('should reject invalid state', async () => {
        const request = new Request('http://localhost:3000/api/share', {
            method: 'POST',
            body: JSON.stringify({
                pageType: 'text',
                state: { invalid: 'data' },
            }),
        });

        const response = await POST(request);
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBeDefined();
    });

    it('should hash password if provided', async () => {
        const request = new Request('http://localhost:3000/api/share', {
            method: 'POST',
            body: JSON.stringify({
                pageType: 'text',
                state: {
                    activeTab: 'diff',
                    tabs: {
                        diff: { input1: 'test', input2: 'test2' },
                        convert: { input: '', output: '', conversionType: null },
                        clean: { input: '', output: '', selectedOperations: [] },
                    },
                },
                password: 'test-password',
            }),
        });

        const response = await POST(request);
        expect(response.status).toBe(201);

        const link = await prisma.sharedLink.findFirst({
            where: { id: (await response.json()).id },
        });
        expect(link?.passwordHash).toBeDefined();
        expect(link?.passwordHash).not.toBe('test-password');
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test app/api/share/route.test.ts`
Expected: FAIL with "Cannot find module '../route'"

- [ ] **Step 3: Implement create endpoint**

Create `app/api/share/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { validateState, ValidationError } from '@/lib/share/validate-state';
import { hashPassword, generateUpdateToken } from '@/lib/share/crypto';
import { checkRateLimit } from '@/lib/share/rate-limit';
import { logShareEvent } from '@/lib/share/logger';
import type { CreateShareRequest, CreateShareResponse, ShareError } from '@/types/share';

export async function POST(request: NextRequest) {
    try {
        // Get client IP for rate limiting
        const ip = request.headers.get('x-forwarded-for') ?? 'unknown';
        const rateLimit = checkRateLimit(ip);

        if (!rateLimit.allowed) {
            logShareEvent({
                type: 'created',
                linkId: 'unknown',
                pageType: 'unknown',
                ip,
                success: false,
                error: 'RATE_LIMITED',
            });

            return NextResponse.json<ShareError>(
                {
                    error: 'RATE_LIMITED',
                    message: 'Too many share creation attempts. Please try again later.',
                },
                { status: 429 },
            );
        }

        const body: CreateShareRequest = await request.json();

        // Validate state
        validateState(body.state, body.pageType);

        // Hash password if provided
        let passwordHash: string | null = null;
        if (body.password) {
            passwordHash = await hashPassword(body.password);
        }

        // Generate update token
        const updateToken = generateUpdateToken();

        // Create shared link and content
        const link = await prisma.sharedLink.create({
            data: {
                pageType: body.pageType,
                title: body.title,
                expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
                passwordHash,
                updateToken,
                content: {
                    create: {
                        state: body.state as unknown as Record<string, unknown>,
                    },
                },
            },
            include: {
                content: true,
            },
        });

        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
        const shortUrl = `/${body.pageType}/${link.id}`;
        const fullUrl = `${baseUrl}${shortUrl}`;

        logShareEvent({
            type: 'created',
            linkId: link.id,
            pageType: body.pageType,
            ip,
            success: true,
        });

        return NextResponse.json<CreateShareResponse>(
            {
                id: link.id,
                shortUrl,
                fullUrl,
                updateToken,
            },
            { status: 201 },
        );
    } catch (error) {
        if (error instanceof ValidationError) {
            return NextResponse.json<ShareError>(
                {
                    error: error.code,
                    message: error.message,
                    details: error.details,
                },
                { status: 400 },
            );
        }

        console.error('Error creating share:', error);
        return NextResponse.json<ShareError>(
            {
                error: 'INTERNAL_ERROR',
                message: 'An error occurred while creating the share link',
            },
            { status: 500 },
        );
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test app/api/share/route.test.ts`
Expected: PASS all tests (may need database setup)

- [ ] **Step 5: Run TypeScript check**

Run: `pnpm typecheck`
Expected: No type errors

- [ ] **Step 6: Commit**

```bash
git add app/api/share/
git commit -m "feat: add POST /api/share endpoint for creating shared links"
```

---

## Task 10: Create GET /api/share/:id Route

**Files:**

- Modify: `app/api/share/[id]/route.ts`
- Test: `app/api/share/[id]/__tests__/route.test.ts`

- [ ] **Step 1: Write failing test for get metadata endpoint**

Create `app/api/share/[id]/__tests__/route.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GET } from '../route';
import { prisma } from '@/lib/prisma';

describe('GET /api/share/:id', () => {
    let testLinkId: string;

    beforeEach(async () => {
        // Create test link
        const link = await prisma.sharedLink.create({
            data: {
                pageType: 'text',
                title: 'Test Share',
                expiresAt: null,
                passwordHash: null,
                updateToken: 'test-token',
                content: {
                    create: {
                        state: { activeTab: 'diff', tabs: {} },
                    },
                },
            },
        });
        testLinkId = link.id;
    });

    afterEach(async () => {
        // Cleanup
        await prisma.sharedContent.deleteMany({});
        await prisma.sharedLink.deleteMany({});
    });

    it('should return link metadata', async () => {
        const request = new Request(`http://localhost:3000/api/share/${testLinkId}`);
        const response = await GET(request, { params: { id: testLinkId } });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.id).toBe(testLinkId);
        expect(data.pageType).toBe('text');
        expect(data.title).toBe('Test Share');
        expect(data.hasPassword).toBe(false);
    });

    it('should return 404 for non-existent link', async () => {
        const request = new Request('http://localhost:3000/api/share/nonexistent');
        const response = await GET(request, { params: { id: 'nonexistent' } });

        expect(response.status).toBe(404);
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test app/api/share/[id]/route.test.ts`
Expected: FAIL with "Cannot find module '../route'"

- [ ] **Step 3: Implement get metadata endpoint**

Create `app/api/share/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { ShareMetadata, ShareError } from '@/types/share';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const link = await prisma.sharedLink.findUnique({
            where: { id: params.id },
        });

        if (!link) {
            return NextResponse.json<ShareError>(
                {
                    error: 'NOT_FOUND',
                    message: 'Share link not found',
                },
                { status: 404 },
            );
        }

        return NextResponse.json<ShareMetadata>({
            id: link.id,
            pageType: link.pageType,
            title: link.title,
            expiresAt: link.expiresAt?.toISOString() ?? null,
            hasPassword: !!link.passwordHash,
            viewCount: link.viewCount,
            createdAt: link.createdAt.toISOString(),
            updatedAt: link.updatedAt.toISOString(),
        });
    } catch (error) {
        console.error('Error fetching share metadata:', error);
        return NextResponse.json<ShareError>(
            {
                error: 'INTERNAL_ERROR',
                message: 'An error occurred while fetching share metadata',
            },
            { status: 500 },
        );
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test app/api/share/[id]/route.test.ts`
Expected: PASS all tests

- [ ] **Step 5: Run TypeScript check**

Run: `pnpm typecheck`
Expected: No type errors

- [ ] **Step 6: Commit**

```bash
git add app/api/share/[id]/route.ts app/api/share/[id]/__tests__/route.test.ts
git commit -m "feat: add GET /api/share/:id endpoint for retrieving metadata"
```

---

## Task 11: Create POST /api/share/:id/access Route

**Files:**

- Create: `app/api/share/[id]/access/route.ts`
- Test: `app/api/share/[id]/access/__tests__/route.test.ts`

- [ ] **Step 1: Write failing test for access endpoint**

Create `app/api/share/[id]/access/__tests__/route.test.ts`:

```typescript
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { POST } from '../route';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/share/crypto';

describe('POST /api/share/:id/access', () => {
    let testLinkId: string;
    let passwordProtectedLinkId: string;

    beforeEach(async () => {
        // Create public link
        const link = await prisma.sharedLink.create({
            data: {
                pageType: 'text',
                title: 'Public Share',
                expiresAt: null,
                passwordHash: null,
                updateToken: 'test-token',
                content: {
                    create: {
                        state: {
                            activeTab: 'diff',
                            tabs: {
                                diff: { input1: 'public', input2: 'data' },
                                convert: { input: '', output: '', conversionType: null },
                                clean: { input: '', output: '', selectedOperations: [] },
                            },
                        },
                    },
                },
            },
        });
        testLinkId = link.id;

        // Create password-protected link
        const passwordHash = await hashPassword('test-password');
        const protectedLink = await prisma.sharedLink.create({
            data: {
                pageType: 'text',
                title: 'Protected Share',
                expiresAt: null,
                passwordHash,
                updateToken: 'test-token-2',
                content: {
                    create: {
                        state: {
                            activeTab: 'diff',
                            tabs: {
                                diff: { input1: 'protected', input2: 'data' },
                                convert: { input: '', output: '', conversionType: null },
                                clean: { input: '', output: '', selectedOperations: [] },
                            },
                        },
                    },
                },
            },
        });
        passwordProtectedLinkId = protectedLink.id;
    });

    afterEach(async () => {
        await prisma.sharedContent.deleteMany({});
        await prisma.sharedLink.deleteMany({});
    });

    it('should access public link without password', async () => {
        const request = new Request(`http://localhost:3000/api/share/${testLinkId}/access`, {
            method: 'POST',
            body: JSON.stringify({}),
        });
        const response = await POST(request, { params: { id: testLinkId } });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.state).toBeDefined();
        expect(data.state.tabs.diff.input1).toBe('public');
    });

    it('should require password for protected link', async () => {
        const request = new Request(
            `http://localhost:3000/api/share/${passwordProtectedLinkId}/access`,
            {
                method: 'POST',
                body: JSON.stringify({}),
            },
        );
        const response = await POST(request, { params: { id: passwordProtectedLinkId } });
        const data = await response.json();

        expect(response.status).toBe(400);
        expect(data.error).toBe('PASSWORD_REQUIRED');
    });

    it('should reject incorrect password', async () => {
        const request = new Request(
            `http://localhost:3000/api/share/${passwordProtectedLinkId}/access`,
            {
                method: 'POST',
                body: JSON.stringify({ password: 'wrong-password' }),
            },
        );
        const response = await POST(request, { params: { id: passwordProtectedLinkId } });

        expect(response.status).toBe(401);
    });

    it('should accept correct password', async () => {
        const request = new Request(
            `http://localhost:3000/api/share/${passwordProtectedLinkId}/access`,
            {
                method: 'POST',
                body: JSON.stringify({ password: 'test-password' }),
            },
        );
        const response = await POST(request, { params: { id: passwordProtectedLinkId } });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.state).toBeDefined();
        expect(data.state.tabs.diff.input1).toBe('protected');
    });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test app/api/share/[id]/access/route.test.ts`
Expected: FAIL with "Cannot find module '../route'"

- [ ] **Step 3: Implement access endpoint**

Create `app/api/share/[id]/access/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword } from '@/lib/share/crypto';
import { logShareEvent } from '@/lib/share/logger';
import type { AccessShareRequest, AccessShareResponse, ShareError } from '@/types/share';

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
    const ip = request.headers.get('x-forwarded-for') ?? 'unknown';

    try {
        const link = await prisma.sharedLink.findUnique({
            where: { id: params.id },
            include: { content: true },
        });

        if (!link) {
            logShareEvent({
                type: 'accessed',
                linkId: params.id,
                pageType: 'unknown',
                ip,
                success: false,
                error: 'NOT_FOUND',
            });

            return NextResponse.json<ShareError>(
                {
                    error: 'NOT_FOUND',
                    message: 'Share link not found',
                },
                { status: 404 },
            );
        }

        // Check expiration
        if (link.expiresAt && new Date() > link.expiresAt) {
            logShareEvent({
                type: 'accessed',
                linkId: params.id,
                pageType: link.pageType,
                ip,
                success: false,
                error: 'EXPIRED',
            });

            return NextResponse.json<ShareError>(
                {
                    error: 'EXPIRED',
                    message: 'Share link has expired',
                },
                { status: 410 },
            );
        }

        // Check password
        if (link.passwordHash) {
            const body: AccessShareRequest = await request.json();

            if (!body.password) {
                return NextResponse.json<ShareError>(
                    {
                        error: 'PASSWORD_REQUIRED',
                        message: 'Password required',
                    },
                    { status: 400 },
                );
            }

            const isValid = await comparePassword(body.password, link.passwordHash);
            if (!isValid) {
                logShareEvent({
                    type: 'accessed',
                    linkId: params.id,
                    pageType: link.pageType,
                    ip,
                    success: false,
                    error: 'INVALID_PASSWORD',
                });

                return NextResponse.json<ShareError>(
                    {
                        error: 'INVALID_PASSWORD',
                        message: 'Incorrect password',
                    },
                    { status: 401 },
                );
            }
        }

        // Increment view count
        await prisma.sharedLink.update({
            where: { id: params.id },
            data: { viewCount: { increment: 1 } },
        });

        logShareEvent({
            type: 'accessed',
            linkId: params.id,
            pageType: link.pageType,
            ip,
            success: true,
        });

        return NextResponse.json<AccessShareResponse>({
            state: link.content.state as unknown,
            linkId: link.id,
        });
    } catch (error) {
        console.error('Error accessing share:', error);
        return NextResponse.json<ShareError>(
            {
                error: 'INTERNAL_ERROR',
                message: 'An error occurred while accessing the share link',
            },
            { status: 500 },
        );
    }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test app/api/share/[id]/access/route.test.ts`
Expected: PASS all tests

- [ ] **Step 5: Run TypeScript check**

Run: `pnpm typecheck`
Expected: No type errors

- [ ] **Step 6: Commit**

```bash
git add app/api/share/[id]/access/
git commit -m "feat: add POST /api/share/:id/access endpoint for accessing shared content"
```

---

## Task 12: Add PATCH and DELETE to /api/share/:id Route

**Files:**

- Modify: `app/api/share/[id]/route.ts`
- Test: Update existing test file

- [ ] **Step 1: Write failing tests for PATCH and DELETE**

Add to `app/api/share/[id]/__tests__/route.test.ts`:

```typescript
import { PATCH, DELETE } from '../route';

describe('PATCH /api/share/:id', () => {
    let testLinkId: string;
    let updateToken: string;

    beforeEach(async () => {
        const link = await prisma.sharedLink.create({
            data: {
                pageType: 'text',
                title: 'Original Title',
                expiresAt: null,
                passwordHash: null,
                updateToken: 'test-update-token',
                content: {
                    create: {
                        state: {
                            activeTab: 'diff',
                            tabs: {
                                diff: { input1: 'original', input2: 'data' },
                                convert: { input: '', output: '', conversionType: null },
                                clean: { input: '', output: '', selectedOperations: [] },
                            },
                        },
                    },
                },
            },
        });
        testLinkId = link.id;
        updateToken = 'test-update-token';
    });

    it('should update link with valid token', async () => {
        const request = new Request(`http://localhost:3000/api/share/${testLinkId}`, {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${updateToken}`,
            },
            body: JSON.stringify({ title: 'Updated Title' }),
        });
        const response = await PATCH(request, { params: { id: testLinkId } });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.updatedAt).toBeDefined();
    });

    it('should reject update without token', async () => {
        const request = new Request(`http://localhost:3000/api/share/${testLinkId}`, {
            method: 'PATCH',
            body: JSON.stringify({ title: 'Updated Title' }),
        });
        const response = await PATCH(request, { params: { id: testLinkId } });

        expect(response.status).toBe(401);
    });

    it('should reject update with invalid token', async () => {
        const request = new Request(`http://localhost:3000/api/share/${testLinkId}`, {
            method: 'PATCH',
            headers: {
                Authorization: 'Bearer invalid-token',
            },
            body: JSON.stringify({ title: 'Updated Title' }),
        });
        const response = await PATCH(request, { params: { id: testLinkId } });

        expect(response.status).toBe(401);
    });
});

describe('DELETE /api/share/:id', () => {
    let testLinkId: string;
    let updateToken: string;

    beforeEach(async () => {
        const link = await prisma.sharedLink.create({
            data: {
                pageType: 'text',
                title: 'To Delete',
                expiresAt: null,
                passwordHash: null,
                updateToken: 'test-delete-token',
                content: {
                    create: {
                        state: {
                            activeTab: 'diff',
                            tabs: {
                                diff: { input1: 'delete', input2: 'me' },
                                convert: { input: '', output: '', conversionType: null },
                                clean: { input: '', output: '', selectedOperations: [] },
                            },
                        },
                    },
                },
            },
        });
        testLinkId = link.id;
        updateToken = 'test-delete-token';
    });

    it('should delete link with valid token', async () => {
        const request = new Request(`http://localhost:3000/api/share/${testLinkId}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${updateToken}`,
            },
        });
        const response = await DELETE(request, { params: { id: testLinkId } });
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);

        // Verify deletion
        const link = await prisma.sharedLink.findUnique({ where: { id: testLinkId } });
        expect(link).toBeNull();
    });

    it('should reject delete without token', async () => {
        const request = new Request(`http://localhost:3000/api/share/${testLinkId}`, {
            method: 'DELETE',
        });
        const response = await DELETE(request, { params: { id: testLinkId } });

        expect(response.status).toBe(401);
    });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm test app/api/share/[id]/route.test.ts`
Expected: FAIL with "PATCH is not a function" and "DELETE is not a function"

- [ ] **Step 3: Implement PATCH and DELETE handlers**

Add to `app/api/share/[id]/route.ts`:

```typescript
import { hashPassword, generateUpdateToken } from '@/lib/share/crypto';
import { validateState, ValidationError } from '@/lib/share/validate-state';
import { logShareEvent } from '@/lib/share/logger';
import type {
    UpdateShareRequest,
    UpdateShareResponse,
    DeleteShareResponse,
    ShareError,
} from '@/types/share';

// ... existing GET handler ...

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
    const ip = request.headers.get('x-forwarded-for') ?? 'unknown';

    try {
        // Extract update token from Authorization header
        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json<ShareError>(
                {
                    error: 'UNAUTHORIZED',
                    message: 'Update token required',
                },
                { status: 401 },
            );
        }

        const updateToken = authHeader.substring(7);

        // Verify link exists and token matches
        const link = await prisma.sharedLink.findUnique({
            where: { id: params.id },
        });

        if (!link) {
            return NextResponse.json<ShareError>(
                {
                    error: 'NOT_FOUND',
                    message: 'Share link not found',
                },
                { status: 404 },
            );
        }

        if (link.updateToken !== updateToken) {
            logShareEvent({
                type: 'updated',
                linkId: params.id,
                pageType: link.pageType,
                ip,
                success: false,
                error: 'INVALID_TOKEN',
            });

            return NextResponse.json<ShareError>(
                {
                    error: 'UNAUTHORIZED',
                    message: 'Invalid update token',
                },
                { status: 401 },
            );
        }

        const body: UpdateShareRequest = await request.json();

        // Validate state if provided
        if (body.state) {
            validateState(body.state, link.pageType);
        }

        // Hash new password if provided
        let passwordHash: string | null = undefined;
        if (body.password !== undefined) {
            passwordHash = body.password ? await hashPassword(body.password) : null;
        }

        // Update link
        const updated = await prisma.sharedLink.update({
            where: { id: params.id },
            data: {
                ...(body.title !== undefined && { title: body.title }),
                ...(body.expiresAt !== undefined && {
                    expiresAt: body.expiresAt ? new Date(body.expiresAt) : null,
                }),
                ...(passwordHash !== undefined && { passwordHash }),
                ...(body.state && {
                    content: {
                        update: {
                            state: body.state as unknown as Record<string, unknown>,
                        },
                    },
                }),
            },
        });

        logShareEvent({
            type: 'updated',
            linkId: params.id,
            pageType: link.pageType,
            ip,
            success: true,
        });

        return NextResponse.json<UpdateShareResponse>({
            updatedAt: updated.updatedAt.toISOString(),
        });
    } catch (error) {
        if (error instanceof ValidationError) {
            return NextResponse.json<ShareError>(
                {
                    error: error.code,
                    message: error.message,
                    details: error.details,
                },
                { status: 400 },
            );
        }

        console.error('Error updating share:', error);
        return NextResponse.json<ShareError>(
            {
                error: 'INTERNAL_ERROR',
                message: 'An error occurred while updating the share link',
            },
            { status: 500 },
        );
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    const ip = request.headers.get('x-forwarded-for') ?? 'unknown';

    try {
        // Extract update token from Authorization header
        const authHeader = request.headers.get('authorization');
        if (!authHeader?.startsWith('Bearer ')) {
            return NextResponse.json<ShareError>(
                {
                    error: 'UNAUTHORIZED',
                    message: 'Update token required',
                },
                { status: 401 },
            );
        }

        const updateToken = authHeader.substring(7);

        // Verify link exists and token matches
        const link = await prisma.sharedLink.findUnique({
            where: { id: params.id },
        });

        if (!link) {
            return NextResponse.json<ShareError>(
                {
                    error: 'NOT_FOUND',
                    message: 'Share link not found',
                },
                { status: 404 },
            );
        }

        if (link.updateToken !== updateToken) {
            logShareEvent({
                type: 'deleted',
                linkId: params.id,
                pageType: link.pageType,
                ip,
                success: false,
                error: 'INVALID_TOKEN',
            });

            return NextResponse.json<ShareError>(
                {
                    error: 'UNAUTHORIZED',
                    message: 'Invalid update token',
                },
                { status: 401 },
            );
        }

        // Delete link (cascade will delete content)
        await prisma.sharedLink.delete({
            where: { id: params.id },
        });

        logShareEvent({
            type: 'deleted',
            linkId: params.id,
            pageType: link.pageType,
            ip,
            success: true,
        });

        return NextResponse.json<DeleteShareResponse>({
            success: true,
        });
    } catch (error) {
        console.error('Error deleting share:', error);
        return NextResponse.json<ShareError>(
            {
                error: 'INTERNAL_ERROR',
                message: 'An error occurred while deleting the share link',
            },
            { status: 500 },
        );
    }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm test app/api/share/[id]/route.test.ts`
Expected: PASS all tests

- [ ] **Step 5: Run TypeScript check**

Run: `pnpm typecheck`
Expected: No type errors

- [ ] **Step 6: Commit**

```bash
git add app/api/share/[id]/route.ts app/api/share/[id]/__tests__/route.test.ts
git commit -m "feat: add PATCH and DELETE handlers to /api/share/:id endpoint"
```

---

## Task 13: Create Shared Link Viewer Page

**Files:**

- Create: `app/text/[id]/page.tsx`
- Create: `components/shared/share-viewer.tsx`
- Create: `components/shared/password-prompt.tsx`

- [ ] **Step 1: Create password prompt component**

Create `components/shared/password-prompt.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

interface PasswordPromptProps {
    onSubmit: (password: string) => void;
    onCancel?: () => void;
    error?: string;
}

export function PasswordPrompt({ onSubmit, onCancel, error }: PasswordPromptProps) {
    const [password, setPassword] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (password.trim()) {
            onSubmit(password);
        } else {
            toast.error('Please enter a password');
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="w-full max-w-md space-y-8 rounded-lg border p-8 shadow-lg">
                <div className="text-center">
                    <Lock className="mx-auto h-12 w-12 text-gray-400" />
                    <h2 className="mt-6 text-3xl font-bold tracking-tight">Password Protected</h2>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        This shared content requires a password to view
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <div>
                        <label htmlFor="password" className="sr-only">
                            Password
                        </label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            required
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="relative block w-full"
                            autoFocus
                        />
                    </div>

                    {error && (
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    )}

                    <Button type="submit" className="w-full">
                        Unlock
                    </Button>

                    {onCancel && (
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={onCancel}
                            className="w-full"
                        >
                            Cancel
                        </Button>
                    )}
                </form>
            </div>
        </div>
    );
}
```

- [ ] **Step 2: Create share viewer component**

Create `components/shared/share-viewer.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { PasswordPrompt } from './password-prompt';
import type { AppPageState } from '@/types/share';

interface ShareViewerProps {
    linkId: string;
    pageType: string;
    initialState: AppPageState;
}

export function ShareViewer({ linkId, pageType, initialState }: ShareViewerProps) {
    const [viewMode, setViewMode] = useState<'view' | 'edit'>('view');
    const [state, setState] = useState(initialState);

    const handleBack = () => {
        window.location.href = `/${pageType}`;
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(window.location.href);
        toast.success('Link copied to clipboard');
    };

    return (
        <div className="min-h-screen">
            {/* Header */}
            <div className="border-b">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="sm" onClick={handleBack}>
                            <ArrowLeft className="h-4 w-4" />
                            Back to {pageType}
                        </Button>
                        <div className="h-6 w-px bg-gray-300 dark:bg-gray-700" />
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                            {viewMode === 'view' ? (
                                <span className="flex items-center gap-2">
                                    <Eye className="h-4 w-4" />
                                    View Only
                                </span>
                            ) : (
                                <span className="flex items-center gap-2">
                                    <EyeOff className="h-4 w-4" />
                                    Editing Copy
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {viewMode === 'view' ? (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setViewMode('edit')}
                            >
                                Edit Copy
                            </Button>
                        ) : (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setViewMode('view')}
                                >
                                    Back to View
                                </Button>
                                <Button size="sm" onClick={handleCopy}>
                                    Copy Link
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                {viewMode === 'view' ? (
                    <div className="rounded-lg border p-6">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Shared content rendered in view-only mode. Click "Edit Copy" to modify.
                        </p>
                        <pre className="mt-4 overflow-auto text-xs">
                            {JSON.stringify(state, null, 2)}
                        </pre>
                    </div>
                ) : (
                    <div className="rounded-lg border p-6">
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Editable copy - changes won't affect the original shared link.
                        </p>
                        <pre className="mt-4 overflow-auto text-xs">
                            {JSON.stringify(state, null, 2)}
                        </pre>
                    </div>
                )}
            </div>
        </div>
    );
}
```

- [ ] **Step 3: Create shared link viewer page**

Create `app/text/[id]/page.tsx`:

```typescript
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { ShareViewer } from '@/components/shared/share-viewer';
import { PasswordPrompt } from '@/components/shared/password-prompt';

interface PageProps {
    params: {
        id: string;
    };
}

export default async function SharedTextPage({ params }: PageProps) {
    const link = await prisma.sharedLink.findUnique({
        where: { id: params.id },
        include: { content: true },
    });

    if (!link || link.pageType !== 'text') {
        notFound();
    }

    // Check expiration
    if (link.expiresAt && new Date() > link.expiresAt) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold">Share Link Expired</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                        This share link expired on {link.expiresAt.toLocaleDateString()}
                    </p>
                </div>
            </div>
        );
    }

    // If password protected, show prompt
    // Note: Actual password validation happens client-side via API
    const isPasswordProtected = !!link.passwordHash;

    if (isPasswordProtected) {
        return (
            <PasswordPromptWrapper
                linkId={params.id}
                pageType={link.pageType}
                hasPassword={true}
            />
        );
    }

    return (
        <ShareViewer
            linkId={params.id}
            pageType={link.pageType}
            initialState={link.content.state as unknown}
        />
    );
}

// Client component wrapper for password handling
import { ShareViewerClient } from './share-viewer-client';

function PasswordPromptWrapper({
    linkId,
    pageType,
    hasPassword,
}: {
    linkId: string;
    pageType: string;
    hasPassword: boolean;
}) {
    return <ShareViewerClient linkId={linkId} pageType={pageType} hasPassword={hasPassword} />;
}
```

- [ ] **Step 4: Create client-side viewer wrapper**

Create `app/text/[id]/share-viewer-client.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShareViewer } from '@/components/shared/share-viewer';
import { PasswordPrompt } from '@/components/shared/password-prompt';
import { toast } from 'sonner';
import type { AppPageState } from '@/types/share';

interface ShareViewerClientProps {
    linkId: string;
    pageType: string;
    hasPassword: boolean;
}

export function ShareViewerClient({ linkId, pageType, hasPassword }: ShareViewerClientProps) {
    const [state, setState] = useState<AppPageState | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [passwordRequired, setPasswordRequired] = useState(hasPassword);
    const router = useRouter();

    const loadState = async (password?: string) => {
        try {
            setLoading(true);
            const response = await fetch(`/api/share/${linkId}/access`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password }),
            });

            const data = await response.json();

            if (!response.ok) {
                if (data.error === 'PASSWORD_REQUIRED') {
                    setPasswordRequired(true);
                    return;
                }
                if (data.error === 'INVALID_PASSWORD') {
                    setError('Incorrect password');
                    setPasswordRequired(true);
                    return;
                }
                throw new Error(data.message);
            }

            setState(data.state);
            setPasswordRequired(false);
            setError(null);
        } catch (err) {
            console.error('Error loading share:', err);
            toast.error('Failed to load shared content');
            router.push(`/${pageType}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!passwordRequired) {
            loadState();
        }
    }, [passwordRequired]);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-gray-900" />
                    <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                        Loading shared content...
                    </p>
                </div>
            </div>
        );
    }

    if (passwordRequired) {
        return <PasswordPrompt onSubmit={(pwd) => loadState(pwd)} error={error ?? undefined} />;
    }

    if (!state) {
        return null;
    }

    return <ShareViewer linkId={linkId} pageType={pageType} initialState={state} />;
}
```

- [ ] **Step 5: Run TypeScript check**

Run: `pnpm typecheck`
Expected: No type errors

- [ ] **Step 6: Commit**

```bash
git add app/text/[id]/ components/shared/
git commit -m "feat: add shared link viewer page for text shares"
```

---

## Task 14: Create Environment Variables Template

**Files:**

- Create: `.env.local.example`

- [ ] **Step 1: Create .env.local.example**

Create `.env.local.example`:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/devtools"

# Rate Limiting
RATE_LIMIT_MAX_REQUESTS=10
RATE_LIMIT_WINDOW_MS=3600000

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# Feature Flags (optional)
FEATURE_SHARE=true
FEATURE_SHARE_PASSWORD=false
FEATURE_SHARE_EXPIRATION=false
```

- [ ] **Step 2: Commit**

```bash
git add .env.local.example
git commit -m "feat: add environment variables template for share feature"
```

---

## Task 15: Verify End-to-End Flow

**Files:**

- None (manual testing)

- [ ] **Step 1: Start development server**

Run: `pnpm dev`
Expected: Server starts on http://localhost:3000

- [ ] **Step 2: Test creating a share**

Run: `curl -X POST http://localhost:3000/api/share -H "Content-Type: application/json" -d '{"pageType":"text","state":{"activeTab":"diff","tabs":{"diff":{"input1":"test","input2":"test2"},"convert":{"input":"","output":"","conversionType":null},"clean":{"input":"","output":"","selectedOperations":[]}}}}'`
Expected: JSON response with id, shortUrl, fullUrl, updateToken

- [ ] **Step 3: Test accessing metadata**

Run: `curl http://localhost:3000/api/share/{id_from_step_2}`
Expected: JSON with metadata (hasPassword: false, viewCount: 0, etc.)

- [ ] **Step 4: Test accessing content**

Run: `curl -X POST http://localhost:3000/api/share/{id_from_step_2}/access -H "Content-Type: application/json" -d '{}'`
Expected: JSON with state object

- [ ] **Step 5: Test shared link viewer in browser**

Open: `http://localhost:3000/text/{id_from_step_2}`
Expected: Page loads with shared content in view mode

- [ ] **Step 6: Test password protection**

Run: `curl -X POST http://localhost:3000/api/share -H "Content-Type: application/json" -d '{"pageType":"text","state":{"activeTab":"diff","tabs":{"diff":{"input1":"test","input2":"test2"},"convert":{"input":"","output":"","conversionType":null},"clean":{"input":"","output":"","selectedOperations":[]}}},"password":"test123"}'`
Then try accessing without password
Expected: Password required error

- [ ] **Step 7: Test update endpoint**

Run: `curl -X PATCH http://localhost:3000/api/share/{id_from_step_2} -H "Authorization: Bearer {updateToken_from_step_2}" -H "Content-Type: application/json" -d '{"title":"Updated Title"}'`
Expected: Success response with updatedAt timestamp

- [ ] **Step 8: Test delete endpoint**

Run: `curl -X DELETE http://localhost:3000/api/share/{id_from_step_2} -H "Authorization: Bearer {updateToken_from_step_2}"`
Expected: Success response, then verify link is deleted

- [ ] **Step 9: Commit**

```bash
git add .
git commit -m "test: verify end-to-end share functionality works"
```

---

## Completion Checklist

After completing all tasks, verify:

- [ ] All database migrations applied successfully
- [ ] All API routes return expected responses
- [ ] Shared link viewer renders correctly in browser
- [ ] Password protection works as expected
- [ ] Update and delete operations require valid tokens
- [ ] TypeScript compilation passes with no errors
- [ ] All tests pass
- [ ] No console errors in browser or server logs

---

## Notes for Implementation

1. **Testing:** Some tests require database setup. Use a test database or mock Prisma client for unit tests.

2. **Rate Limiting:** Current implementation is in-memory for development. Replace with Upstash Redis or similar for production.

3. **Monitoring:** TODOs in code indicate where production monitoring should be integrated.

4. **State Serialization:** This plan implements the backend infrastructure. Phase 2 will add state serialization interfaces to existing tab components.

5. **Error Handling:** All endpoints return consistent error format. Client-side components should handle errors gracefully with toast notifications.

6. **Security:** Passwords are hashed with bcrypt (10 rounds). Update tokens are unique and never returned in GET requests.

7. **Expiration:** Expired links return 410 Gone status. Client-side should display user-friendly expired message.

8. **View Count:** Incremented on successful access. Not atomic in high-concurrency scenarios but acceptable for this use case.

---

**Estimated Time:** 6-8 hours for all tasks

**Updated:** After plan review - Added pre-flight checks, corrected Prisma import paths, added updateToken index

**Critical Fixes Applied:**

1. ✅ Added bcrypt dependency installation to pre-flight checks
2. ✅ Fixed Prisma client import path to use existing `@/lib/generated/prisma/client`
3. ✅ Added DATABASE_URL verification to pre-flight checks
4. ✅ Added index on updateToken for faster lookups
5. ✅ Added TypeScript path alias verification
6. ✅ Added Vitest test configuration verification
7. ✅ Created types directory if needed

**Next Phase:** Add state serialization interfaces to tab components and implement share creation UI in the text page toolbar.
