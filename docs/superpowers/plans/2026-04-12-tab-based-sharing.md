# Tab-Based Sharing Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Enable users to share individual tab content from text, JSON, and base64 pages through persistent, shareable links with password protection and expiration.

**Architecture:** Per-tab state storage with composite pageType values (e.g., 'text-diff'), loading page with redirect flow, reusable ShareForm component, sessionStorage for state transfer, Zod validation, Axios HTTP client.

**Tech Stack:** Prisma, PostgreSQL, bcrypt, Zod, Axios, React, Next.js 16, React Query, TypeScript

---

## File Structure

### Database & API Layer

- `prisma/schema.prisma` - Database schema (modify)
- `lib/schemas/share.ts` - Zod validation schemas
- `lib/types/share.ts` - TypeScript types inferred from Zod
- `lib/crypto.ts` - Password hashing utilities
- `lib/validation.ts` - State size validation
- `lib/rate-limit.ts` - Rate limiting (in-memory for dev)
- `lib/api/share.ts` - Axios API client + React Query hooks
- `app/api/share/create/route.ts` - POST endpoint for creating shares
- `app/api/share/[id]/route.ts` - GET endpoint for metadata
- `app/api/share/[id]/access/route.ts` - POST endpoint for accessing content

### Components Layer

- `components/share/share-form.tsx` - Reusable share creation form
- `components/shared/shared-content-banner.tsx` - Banner shown when viewing shared content
- `components/shared/password-prompt.tsx` - Password input for protected links
- `components/shared/share-error-display.tsx` - Error state display

### Tab State Interfaces

- `app/text/tabs/types.ts` - Text tab ref interfaces
- `app/json/tabs/types.ts` - JSON tab ref interfaces
- `app/base64/tabs/types.ts` - Base64 tab ref interfaces

### Tab Components (modify to add getState/setState)

- `app/text/tabs/text-diff-tab.tsx`
- `app/text/tabs/text-convert-tab.tsx`
- `app/text/tabs/text-clean-tab.tsx`
- `app/json/tabs/json-viewer-tab.tsx`
- `app/json/tabs/json-diff-tab.tsx`
- `app/json/tabs/json-schema-tab.tsx`
- `app/json/tabs/json-parser-tab.tsx`
- `app/json/tabs/json-format-tab.tsx`
- `app/json/tabs/json-minify-tab.tsx`
- `app/json/tabs/json-export-tab.tsx`
- `app/base64/tabs/media-to-base64-tab.tsx`
- `app/base64/tabs/base64-to-media-tab.tsx`

### Share Dialogs (integrate ShareForm)

- `components/text/diff-pane/text-diff-share-dialog.tsx`
- `components/text/convert-pane/convert-share-dialog.tsx`
- `components/text/clean-pane/clean-share-dialog.tsx`
- `components/schema/schema-share-dialog.tsx`
- `components/viewer/viewer-share-dialog.tsx`
- `components/parser/parser-share-dialog.tsx`
- `components/minify/minify-share-dialog.tsx`
- `components/format/format-share-dialog.tsx`
- `components/export/export-share-dialog.tsx`
- `components/base64/base64-share-dialog.tsx`

### Routing & Pages

- `app/[pageType]/[id]/page.tsx` - Loading/interstitial page
- `app/text/page.tsx` - Main text page (modify for shared state)
- `app/json/page.tsx` - Main JSON page (modify)
- `app/base64/page.tsx` - Main base64 page (modify)

---

## Phase 1: Database & API Infrastructure

### Task 1.1: Install Dependencies

**Files:**

- Modify: `package.json`

- [ ] **Step 1: Install required packages**

Run: `npm install zod axios @tanstack/react-query bcrypt`

Expected: Packages installed successfully

- [ ] **Step 2: Install bcrypt types**

Run: `npm install -D @types/bcrypt`

Expected: Type definitions installed

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "deps: add zod, axios, react-query, bcrypt"
```

---

### Task 1.2: Update Prisma Schema

**Files:**

- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Update SharedLink model**

Open `prisma/schema.prisma` and update the SharedLink model:

```prisma
model SharedLink {
  id           String    @id @default(cuid())
  pageType     String    // Composite: 'text-diff', 'json-schema', etc.
  title        String    // Required user-provided title
  comment      String?   // Optional user comment
  expiresAt    DateTime? // Null = never expires
  passwordHash String?   // Null = public access
  viewCount    Int       @default(0)
  createdAt    DateTime  @default(now())
  updatedAt    DateTime  @updatedAt

  content SharedContent?

  @@index([pageType])
  @@index([createdAt])
  @@index([expiresAt])
}
```

- [ ] **Step 2: Verify SharedContent model**

Ensure SharedContent model exists:

```prisma
model SharedContent {
  id        String   @id @default(cuid())
  linkId    String   @unique
  state     Json     // Single tab's state as JSON
  link      SharedLink @relation(fields: [linkId], references: [id], onDelete: Cascade)

  @@index([linkId])
}
```

- [ ] **Step 3: Generate Prisma client**

Run: `npx prisma generate`

Expected: Client generated successfully in `lib/generated/prisma`

- [ ] **Step 4: Create database migration**

Run: `npx prisma migrate dev --name add_tab_based_sharing`

Expected: Migration created and applied successfully

- [ ] **Step 5: Commit**

```bash
git add prisma/schema.prisma prisma/migrations
git commit -m "feat: update Prisma schema for tab-based sharing

- Add comment field to SharedLink
- Add indexes for pageType, createdAt, expiresAt
- Keep existing SharedContent model"
```

---

### Task 1.2: Install Dependencies

**Files:**

- Modify: `package.json`

- [ ] **Step 1: Install required packages**

Run: `npm install zod axios @tanstack/react-query bcrypt`

Expected: Packages installed successfully

- [ ] **Step 2: Install bcrypt types**

Run: `npm install -D @types/bcrypt`

Expected: Type definitions installed

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "deps: add zod, axios, react-query, bcrypt"
```

---

### Task 1.3: Create Zod Validation Schemas

**Files:**

- Create: `lib/schemas/share.ts`

- [ ] **Step 1: Create schema file**

Create `lib/schemas/share.ts`:

```typescript
import { z } from 'zod';

// Request schemas
export const CreateShareSchema = z.object({
    pageType: z.enum([
        // Text page
        'text-diff',
        'text-convert',
        'text-clean',
        // JSON page
        'json-viewer',
        'json-diff',
        'json-schema',
        'json-parser',
        'json-format',
        'json-minify',
        'json-export',
        // Base64 page
        'base64-encode',
        'base64-decode',
    ]),
    title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
    comment: z.string().max(1000, 'Comment too long').optional(),
    state: z.any(),
    expiration: z.enum(['1h', '1d', '7d', '30d']).optional(),
    password: z.string().min(4, 'Password must be at least 4 characters').max(100).optional(),
});

export const AccessShareSchema = z.object({
    password: z.string().optional(),
});

// Response schemas
export const ShareMetadataSchema = z.object({
    id: z.string(),
    pageType: z.string(),
    title: z.string(),
    comment: z.string().nullable(),
    expiresAt: z.string().nullable(),
    hasPassword: z.boolean(),
    viewCount: z.number(),
    createdAt: z.string(),
});

export const ShareAccessResponseSchema = z.object({
    state: z.any(),
    linkId: z.string(),
    pageType: z.string(),
    title: z.string(),
    comment: z.string().nullable(),
    expiresAt: z.string().nullable(),
    hasPassword: z.boolean(),
    viewCount: z.number(),
});

export const CreateShareResponseSchema = z.object({
    id: z.string(),
    shortUrl: z.string(),
    fullUrl: z.string(),
    expiresAt: z.string().nullable(),
    hasPassword: z.boolean(),
});

export const ShareErrorSchema = z.object({
    error: z.enum([
        'NOT_FOUND',
        'LINK_EXPIRED',
        'PASSWORD_REQUIRED',
        'INVALID_PASSWORD',
        'STATE_TOO_LARGE',
        'RATE_LIMITED',
        'INVALID_STATE',
    ]),
    message: z.string(),
    details: z.any().optional(),
    retryAfter: z.number().optional(),
});

// Tab-specific state schemas
export const TextDiffStateSchema = z.object({
    leftContent: z.string().max(1_000_000, 'Content too large'),
    rightContent: z.string().max(1_000_000, 'Content too large'),
});

export const TextConvertStateSchema = z.object({
    input: z.string().max(1_000_000),
    output: z.string().max(1_000_000),
    conversionType: z.string().nullable(),
});

export const TextCleanStateSchema = z.object({
    input: z.string().max(1_000_000),
    output: z.string().max(1_000_000),
    selectedOperations: z.array(z.string()),
});

export const JsonViewerStateSchema = z.object({
    input: z.string().max(1_000_000),
    format: z.boolean(),
});

export const JsonDiffStateSchema = z.object({
    leftContent: z.string().max(1_000_000),
    rightContent: z.string().max(1_000_000),
});

export const JsonSchemaStateSchema = z.object({
    input: z.string().max(1_000_000),
    schema: z.string().max(1_000_000),
    validationErrors: z.array(z.any()),
});

export const JsonParserStateSchema = z.object({
    input: z.string().max(1_000_000),
    parsed: z.any(),
});

export const JsonFormatStateSchema = z.object({
    input: z.string().max(1_000_000),
    output: z.string().max(1_000_000),
    indent: z.number(),
});

export const JsonMinifyStateSchema = z.object({
    input: z.string().max(1_000_000),
    output: z.string().max(1_000_000),
});

export const JsonExportStateSchema = z.object({
    input: z.string().max(1_000_000),
    exportFormat: z.enum(['csv', 'xml', 'yaml']),
    output: z.string().max(1_000_000),
});

export const Base64EncodeStateSchema = z.object({
    input: z.string().max(1_000_000),
    mimeType: z.string(),
    fileName: z.string(),
});

export const Base64DecodeStateSchema = z.object({
    input: z.string().max(1_000_000),
    output: z.string().max(1_000_000),
});
```

- [ ] **Step 2: Commit**

```bash
git add lib/schemas/share.ts
git commit -m "feat: add Zod validation schemas for sharing"
```

---

### Task 1.4: Create TypeScript Types

**Files:**

- Create: `lib/types/share.ts`

- [ ] **Step 1: Create types file**

Create `lib/types/share.ts`:

```typescript
import type { z } from 'zod';
import {
    CreateShareSchema,
    ShareMetadataSchema,
    ShareAccessResponseSchema,
    CreateShareResponseSchema,
    ShareErrorSchema,
    TextDiffStateSchema,
    TextConvertStateSchema,
    TextCleanStateSchema,
    JsonViewerStateSchema,
    JsonDiffStateSchema,
    JsonSchemaStateSchema,
    JsonParserStateSchema,
    JsonFormatStateSchema,
    JsonMinifyStateSchema,
    JsonExportStateSchema,
    Base64EncodeStateSchema,
    Base64DecodeStateSchema,
} from '@/lib/schemas/share';

// Infer types from schemas
export type CreateShareInput = z.infer<typeof CreateShareSchema>;
export type ShareMetadata = z.infer<typeof ShareMetadataSchema>;
export type ShareAccessResponse = z.infer<typeof ShareAccessResponseSchema>;
export type CreateShareResponse = z.infer<typeof CreateShareResponseSchema>;
export type ShareError = z.infer<typeof ShareErrorSchema>;

// Tab state types
export type TextDiffState = z.infer<typeof TextDiffStateSchema>;
export type TextConvertState = z.infer<typeof TextConvertStateSchema>;
export type TextCleanState = z.infer<typeof TextCleanStateSchema>;
export type JsonViewerState = z.infer<typeof JsonViewerStateSchema>;
export type JsonDiffState = z.infer<typeof JsonDiffStateSchema>;
export type JsonSchemaState = z.infer<typeof JsonSchemaStateSchema>;
export type JsonParserState = z.infer<typeof JsonParserStateSchema>;
export type JsonFormatState = z.infer<typeof JsonFormatStateSchema>;
export type JsonMinifyState = z.infer<typeof JsonMinifyStateSchema>;
export type JsonExportState = z.infer<typeof JsonExportStateSchema>;
export type Base64EncodeState = z.infer<typeof Base64EncodeStateSchema>;
export type Base64DecodeState = z.infer<typeof Base64DecodeStateSchema>;
```

- [ ] **Step 2: Commit**

```bash
git add lib/types/share.ts
git commit -m "feat: add TypeScript types for sharing"
```

---

### Task 1.5: Create Crypto Utilities

**Files:**

- Create: `lib/crypto.ts`

- [ ] **Step 1: Create crypto utilities**

Create `lib/crypto.ts`:

```typescript
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, SALT_ROUNDS);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

export function validatePassword(password: string): boolean {
    return password.length >= 4 && password.length <= 100;
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/crypto.ts
git commit -m "feat: add password hashing utilities"
```

---

### Task 1.6: Create Validation Utilities

**Files:**

- Create: `lib/validation.ts`

- [ ] **Step 1: Create validation utilities**

Create `lib/validation.ts`:

```typescript
const MAX_STATE_SIZE = 5 * 1024 * 1024; // 5MB total
const MAX_FIELD_SIZE = 1 * 1024 * 1024; // 1MB per field

export function validateState(state: any): { valid: boolean; error?: string } {
    // Check total size
    const stateSize = JSON.stringify(state).length;
    if (stateSize > MAX_STATE_SIZE) {
        return { valid: false, error: 'STATE_TOO_LARGE' };
    }

    // Check individual string fields
    function checkFields(obj: any, path = '') {
        for (const [key, value] of Object.entries(obj)) {
            const fieldPath = path ? `${path}.${key}` : key;

            if (typeof value === 'string') {
                if (value.length > MAX_FIELD_SIZE) {
                    return {
                        valid: false,
                        error: `Field ${fieldPath} exceeds size limit`,
                    };
                }
            } else if (typeof value === 'object' && value !== null) {
                const result = checkFields(value, fieldPath);
                if (!result.valid) return result;
            }
        }
        return { valid: true };
    }

    return checkFields(state);
}

export function sanitizeTitle(title: string): string {
    return title.trim().slice(0, 200);
}

export function sanitizeComment(comment: string): string {
    return comment.trim().slice(0, 1000);
}

export function validateExpiration(expiration: string): boolean {
    const valid = ['1h', '1d', '7d', '30d'];
    return valid.includes(expiration);
}

export function calculateExpiration(expiration: string): Date | null {
    if (!expiration) return null;

    const now = new Date();
    const milliseconds = {
        '1h': 60 * 60 * 1000,
        '1d': 24 * 60 * 60 * 1000,
        '7d': 7 * 24 * 60 * 60 * 1000,
        '30d': 30 * 24 * 60 * 60 * 1000,
    }[expiration];

    if (!milliseconds) return null;
    return new Date(now.getTime() + milliseconds);
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/validation.ts
git commit -m "feat: add state validation and sanitization utilities"
```

---

### Task 1.7: Create Rate Limiting

**Files:**

- Create: `lib/rate-limit.ts`

- [ ] **Step 1: Create rate limiting utilities**

Create `lib/rate-limit.ts`:

```typescript
// Simple in-memory rate limiter for development
// TODO: Use Redis/Upstash for production

const requests = new Map<string, number[]>();

const LIMITS = {
    create: { max: 10, window: 3600000 }, // 10 per hour
    access: { max: 100, window: 3600000 }, // 100 per hour
};

export function checkRateLimit(
    ip: string,
    type: 'create' | 'access',
): { allowed: boolean; remaining: number; resetAt?: number } {
    const limit = LIMITS[type];
    const now = Date.now();
    const windowStart = now - limit.window;

    const userRequests = requests.get(ip) || [];
    const recent = userRequests.filter((t) => t > windowStart);

    if (recent.length >= limit.max) {
        const oldestRequest = recent[0];
        return {
            allowed: false,
            remaining: 0,
            resetAt: oldestRequest + limit.window,
        };
    }

    recent.push(now);
    requests.set(ip, recent);

    return {
        allowed: true,
        remaining: limit.max - recent.length,
    };
}

export function getClientIp(request: Request): string {
    // Check various headers for IP
    const forwarded = request.headers.get('x-forwarded-for');
    if (forwarded) {
        return forwarded.split(',')[0].trim();
    }

    const realIp = request.headers.get('x-real-ip');
    if (realIp) {
        return realIp;
    }

    return 'unknown';
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/rate-limit.ts
git commit -m "feat: add rate limiting utilities"
```

---

### Task 1.8: Create Axios API Client

**Files:**

- Create: `lib/api/share.ts`

- [ ] **Step 1: Create API client**

Create `lib/api/share.ts`:

```typescript
'use client';

import axios, { AxiosError } from 'axios';
import { z } from 'zod';
import type {
    CreateShareInput,
    ShareMetadata,
    ShareAccessResponse,
    CreateShareResponse,
    ShareError,
} from '@/lib/types/share';
import {
    CreateShareSchema,
    ShareMetadataSchema,
    ShareAccessResponseSchema,
    CreateShareResponseSchema,
    ShareErrorSchema,
    AccessShareSchema,
} from '@/lib/schemas/share';

// Create axios instance
const api = axios.create({
    baseURL: '/api/share',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Response validation helper
function validateResponse<T>(schema: z.ZodSchema<T>, data: unknown): T {
    return schema.parse(data);
}

// Error handling helper
function handleApiError(error: unknown): ShareError {
    if (axios.isAxiosError(error)) {
        const data = error.response?.data;
        if (data) {
            try {
                return ShareErrorSchema.parse(data);
            } catch {
                return {
                    error: 'INVALID_STATE',
                    message: 'Invalid error response from server',
                };
            }
        }
    }
    return {
        error: 'INVALID_STATE',
        message: 'An unexpected error occurred',
    };
}

// API methods
export const shareApi = {
    async create(input: CreateShareInput): Promise<CreateShareResponse> {
        try {
            const validated = CreateShareSchema.parse(input);
            const response = await api.post<CreateShareResponse>('/create', validated);
            return validateResponse(CreateShareResponseSchema, response.data);
        } catch (error) {
            throw handleApiError(error);
        }
    },

    async getMetadata(id: string): Promise<ShareMetadata> {
        try {
            const response = await api.get<ShareMetadata>(`/${id}`);
            return validateResponse(ShareMetadataSchema, response.data);
        } catch (error) {
            throw handleApiError(error);
        }
    },

    async access(id: string, password?: string): Promise<ShareAccessResponse> {
        try {
            const validated = AccessShareSchema.parse({ password });
            const response = await api.post<ShareAccessResponse>(`/${id}/access`, validated);
            return validateResponse(ShareAccessResponseSchema, response.data);
        } catch (error) {
            throw handleApiError(error);
        }
    },
};

// React Query hooks
import { useMutation, useQuery } from '@tanstack/react-query';

export function useCreateShare() {
    return useMutation({
        mutationFn: shareApi.create,
    });
}

export function useShareMetadata(id: string) {
    return useQuery({
        queryKey: ['share-metadata', id],
        queryFn: () => shareApi.getMetadata(id),
        enabled: !!id,
        staleTime: 0,
    });
}

export function useAccessShare() {
    return useMutation({
        mutationFn: ({ id, password }: { id: string; password?: string }) =>
            shareApi.access(id, password),
    });
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/api/share.ts
git commit -m "feat: add Axios API client and React Query hooks"
```

---

### Task 1.9: Create POST /api/share/create Route

**Files:**

- Create: `app/api/share/create/route.ts`

- [ ] **Step 1: Create API route**

Create `app/api/share/create/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/crypto';
import {
    validateState,
    sanitizeTitle,
    sanitizeComment,
    calculateExpiration,
} from '@/lib/validation';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import type { CreateShareResponse } from '@/lib/types/share';

export async function POST(request: NextRequest) {
    try {
        // Rate limiting
        const ip = getClientIp(request);
        const rateLimit = checkRateLimit(ip, 'create');
        if (!rateLimit.allowed) {
            return NextResponse.json(
                {
                    error: 'RATE_LIMITED',
                    message: 'Too many share links created. Try again later.',
                    retryAfter: rateLimit.resetAt
                        ? Math.ceil((rateLimit.resetAt - Date.now()) / 1000)
                        : undefined,
                },
                { status: 429 },
            );
        }

        const body = await request.json();
        const { pageType, title, comment, state, expiration, password } = body;

        // Validate required fields
        if (!pageType || !title || !state) {
            return NextResponse.json(
                { error: 'INVALID_STATE', message: 'Missing required fields' },
                { status: 400 },
            );
        }

        // Validate state size
        const validation = validateState(state);
        if (!validation.valid) {
            return NextResponse.json(
                { error: validation.error || 'INVALID_STATE', message: 'State validation failed' },
                { status: 400 },
            );
        }

        // Hash password if provided
        let passwordHash: string | null = null;
        if (password) {
            passwordHash = await hashPassword(password);
        }

        // Calculate expiration
        const expiresAt = calculateExpiration(expiration);

        // Create shared link
        const sharedLink = await prisma.sharedLink.create({
            data: {
                pageType,
                title: sanitizeTitle(title),
                comment: comment ? sanitizeComment(comment) : null,
                expiresAt,
                passwordHash,
                content: {
                    create: {
                        state,
                    },
                },
            },
            include: {
                content: true,
            },
        });

        // Construct response
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || request.nextUrl.origin;
        const shortUrl = `/${pageType.split('-')[0]}/${sharedLink.id}`;
        const fullUrl = `${baseUrl}${shortUrl}`;

        const response: CreateShareResponse = {
            id: sharedLink.id,
            shortUrl,
            fullUrl,
            expiresAt: sharedLink.expiresAt?.toISOString() || null,
            hasPassword: !!passwordHash,
        };

        return NextResponse.json(response, { status: 201 });
    } catch (error) {
        console.error('Error creating share:', error);
        return NextResponse.json(
            { error: 'INVALID_STATE', message: 'Failed to create share link' },
            { status: 500 },
        );
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/share/create/route.ts
git commit -m "feat: add POST /api/share/create endpoint"
```

---

### Task 1.10: Create GET /api/share/[id] Route

**Files:**

- Create: `app/api/share/[id]/route.ts`

- [ ] **Step 1: Create API route**

Create `app/api/share/[id]/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { ShareMetadata } from '@/lib/types/share';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        const sharedLink = await prisma.sharedLink.findUnique({
            where: { id },
            select: {
                id: true,
                pageType: true,
                title: true,
                comment: true,
                expiresAt: true,
                passwordHash: true,
                viewCount: true,
                createdAt: true,
            },
        });

        if (!sharedLink) {
            return NextResponse.json(
                { error: 'NOT_FOUND', message: 'Share link not found' },
                { status: 404 },
            );
        }

        const response: ShareMetadata = {
            id: sharedLink.id,
            pageType: sharedLink.pageType,
            title: sharedLink.title,
            comment: sharedLink.comment,
            expiresAt: sharedLink.expiresAt?.toISOString() || null,
            hasPassword: !!sharedLink.passwordHash,
            viewCount: sharedLink.viewCount,
            createdAt: sharedLink.createdAt.toISOString(),
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error fetching share metadata:', error);
        return NextResponse.json(
            { error: 'NOT_FOUND', message: 'Failed to fetch share link' },
            { status: 500 },
        );
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/share/[id]/route.ts
git commit -m "feat: add GET /api/share/[id] endpoint"
```

---

### Task 1.11: Create POST /api/share/[id]/access Route

**Files:**

- Create: `app/api/share/[id]/access/route.ts`

- [ ] **Step 1: Create API route**

Create `app/api/share/[id]/access/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/crypto';
import { checkRateLimit, getClientIp } from '@/lib/rate-limit';
import type { ShareAccessResponse } from '@/lib/types/share';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const { password } = body;

        // Rate limiting
        const ip = getClientIp(request);
        const rateLimit = checkRateLimit(ip, 'access');
        if (!rateLimit.allowed) {
            return NextResponse.json(
                {
                    error: 'RATE_LIMITED',
                    message: 'Too many requests. Try again later.',
                    retryAfter: rateLimit.resetAt
                        ? Math.ceil((rateLimit.resetAt - Date.now()) / 1000)
                        : undefined,
                },
                { status: 429 },
            );
        }

        // Fetch shared link with content
        const sharedLink = await prisma.sharedLink.findUnique({
            where: { id },
            include: {
                content: true,
            },
        });

        if (!sharedLink) {
            return NextResponse.json(
                { error: 'NOT_FOUND', message: 'Share link not found' },
                { status: 404 },
            );
        }

        // Check expiration
        if (sharedLink.expiresAt && new Date() > sharedLink.expiresAt) {
            return NextResponse.json(
                { error: 'LINK_EXPIRED', message: 'This share link has expired' },
                { status: 410 },
            );
        }

        // Check password
        if (sharedLink.passwordHash) {
            if (!password) {
                return NextResponse.json(
                    { error: 'PASSWORD_REQUIRED', message: 'A password is required' },
                    { status: 400 },
                );
            }

            const isValid = await verifyPassword(password, sharedLink.passwordHash);
            if (!isValid) {
                return NextResponse.json(
                    { error: 'INVALID_PASSWORD', message: 'Incorrect password' },
                    { status: 401 },
                );
            }
        }

        // Increment view count
        await prisma.sharedLink.update({
            where: { id },
            data: { viewCount: { increment: 1 } },
        });

        // Construct response
        const response: ShareAccessResponse = {
            state: sharedLink.content?.state || {},
            linkId: sharedLink.id,
            pageType: sharedLink.pageType,
            title: sharedLink.title,
            comment: sharedLink.comment,
            expiresAt: sharedLink.expiresAt?.toISOString() || null,
            hasPassword: !!sharedLink.passwordHash,
            viewCount: sharedLink.viewCount + 1,
        };

        return NextResponse.json(response);
    } catch (error) {
        console.error('Error accessing share:', error);
        return NextResponse.json(
            { error: 'INVALID_STATE', message: 'Failed to access shared content' },
            { status: 500 },
        );
    }
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/share/[id]/access/route.ts
git commit -m "feat: add POST /api/share/[id]/access endpoint"
```

---

## Phase 2: Reusable Components

### Task 2.1: Create ShareForm Component

**Files:**

- Create: `components/share/share-form.tsx`

- [ ] **Step 1: Create ShareForm component**

Create `components/share/share-form.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateShare } from '@/lib/api/share';
import type { ShareError } from '@/lib/types/share';

interface ShareFormProps {
  pageType: string;
  getState: () => any;
  onLinkGenerated?: (url: string) => void;
}

export function ShareForm({ pageType, getState, onLinkGenerated }: ShareFormProps) {
  const createShare = useCreateShare();
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [expiration, setExpiration] = useState<'1h' | '1d' | '7d' | '30d'>('7d');
  const [password, setPassword] = useState('');
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerateLink = async () => {
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }

    try {
      const input = {
        pageType,
        title: title.trim(),
        comment: comment.trim() || undefined,
        state: getState(),
        expiration,
        password: password || undefined,
      };

      const response = await createShare.mutateAsync(input);
      setGeneratedUrl(response.fullUrl);
      onLinkGenerated?.(response.fullUrl);
      toast.success('Share link generated!');
    } catch (error) {
      if (error && typeof error === 'object' && 'error' in error) {
        const shareError = error as ShareError;

        switch (shareError.error) {
          case 'STATE_TOO_LARGE':
            toast.error('Content is too large to share (max 5MB)');
            break;
          case 'RATE_LIMITED':
            toast.error('Too many shares created. Try again later.');
            break;
          default:
            toast.error(shareError.message);
        }
      } else {
        toast.error('Failed to create share link');
      }
    }
  };

  const handleCopy = async () => {
    if (generatedUrl) {
      await navigator.clipboard.writeText(generatedUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Link copied to clipboard!');
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {!generatedUrl ? (
        <>
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="My awesome content"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="comment">Comment (optional)</Label>
            <Textarea
              id="comment"
              placeholder="Add a description..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expiration">Expiration</Label>
            <Select value={expiration} onValueChange={(v: any) => setExpiration(v)}>
              <SelectTrigger id="expiration">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">1 hour</SelectItem>
                <SelectItem value="1d">1 day</SelectItem>
                <SelectItem value="7d">7 days</SelectItem>
                <SelectItem value="30d">30 days</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password (optional)</Label>
            <Input
              id="password"
              type="password"
              placeholder="Leave empty for public access"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button
            onClick={handleGenerateLink}
            disabled={!title.trim() || createShare.isPending}
            className="w-full"
          >
            {createShare.isPending ? 'Generating...' : 'Generate Link'}
          </Button>
        </>
      ) : (
        <>
          <div className="p-4 bg-green-50 dark:bg-green-950 rounded-lg">
            <p className="text-sm font-medium text-green-900 dark:text-green-100">
              ✓ Share link created successfully!
            </p>
          </div>

          <div className="space-y-2">
            <Label>Shareable Link</Label>
            <div className="flex gap-2">
              <Input
                value={generatedUrl}
                readOnly
                className="flex-1 text-xs"
              />
              <Button
                size="sm"
                onClick={handleCopy}
                className="shrink-0"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Anyone with this link can view the content
            </p>
          </div>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/share/share-form.tsx
git commit -m "feat: add ShareForm component"
```

---

### Task 2.2: Update SharedContentBanner Component

**Files:**

- Modify: `components/shared/shared-content-banner.tsx`

- [ ] **Step 1: Read existing component**

Run: `cat components/shared/shared-content-banner.tsx`

- [ ] **Step 2: Replace with enhanced version**

Replace the entire file content with:

```typescript
'use client';

import { Lock, Clock, Eye, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SharedContentBannerProps {
  title: string;
  comment?: string | null;
  expiresAt?: string | null;
  hasPassword: boolean;
  viewCount: number;
  createdAt: string;
  onClose?: () => void;
}

export function SharedContentBanner({
  title,
  comment,
  expiresAt,
  hasPassword,
  viewCount,
  createdAt,
  onClose,
}: SharedContentBannerProps) {
  const formatExpiration = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = date.getTime() - now.getTime();

    if (diff < 0) return 'Expired';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `Expires in ${days} day${days > 1 ? 's' : ''}`;
    if (hours > 0) return `Expires in ${hours} hour${hours > 1 ? 's' : ''}`;
    return 'Expires soon';
  };

  return (
    <div className="bg-primary/10 border-b border-primary/20">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="secondary" className="shrink-0">
                Shared Content
              </Badge>
              {onClose && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={onClose}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            <h2 className="text-lg font-semibold truncate">{title}</h2>

            {comment && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {comment}
              </p>
            )}

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Eye className="h-3.5 w-3.5" />
                <span>{viewCount} view{viewCount !== 1 ? 's' : ''}</span>
              </div>

              {hasPassword && (
                <div className="flex items-center gap-1">
                  <Lock className="h-3.5 w-3.5" />
                  <span>Password protected</span>
                </div>
              )}

              {expiresAt && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{formatExpiration(expiresAt)}</span>
                </div>
              )}

              <div>
                Created {new Date(createdAt).toLocaleDateString()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add components/shared/shared-content-banner.tsx
git commit -m "feat: enhance SharedContentBanner component"
```

---

### Task 2.3: Create PasswordPrompt Component

**Files:**

- Create: `components/shared/password-prompt.tsx`

- [ ] **Step 1: Create PasswordPrompt component**

Create `components/shared/password-prompt.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PasswordPromptProps {
  pageType: string;
  id: string;
  metadata: {
    title: string;
    pageType: string;
  };
  onUnlock: (password: string) => Promise<{ error?: string }>;
}

export function PasswordPrompt({ pageType, id, metadata, onUnlock }: PasswordPromptProps) {
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const result = await onUnlock(password);

    if (result?.error) {
      if (result.error === 'INVALID_PASSWORD') {
        setError('Incorrect password');
      } else {
        setError(result.error);
      }
    }

    setIsLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h1 className="text-2xl font-bold mb-2">Password Protected</h1>
          <p className="text-muted-foreground">
            This content is protected with a password
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              autoFocus
            />
          </div>

          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}

          <Button type="submit" disabled={!password || isLoading} className="w-full">
            {isLoading ? 'Unlocking...' : 'Unlock'}
          </Button>
        </form>

        {metadata.title && (
          <p className="text-xs text-center text-muted-foreground mt-6">
            Sharing "{metadata.title}"
          </p>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/shared/password-prompt.tsx
git commit -m "feat: add PasswordPrompt component"
```

---

### Task 2.4: Create ShareErrorDisplay Component

**Files:**

- Create: `components/shared/share-error-display.tsx`

- [ ] **Step 1: Create error display component**

Create `components/shared/share-error-display.tsx`:

```typescript
'use client';

import { useRouter } from 'next/navigation';
import { AlertCircle, Clock, Lock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

type ShareError =
  | 'NOT_FOUND'
  | 'LINK_EXPIRED'
  | 'PASSWORD_REQUIRED'
  | 'INVALID_PASSWORD'
  | 'STATE_TOO_LARGE'
  | 'RATE_LIMITED'
  | 'INVALID_STATE';

interface ShareErrorDisplayProps {
  error: ShareError;
  pageType: string;
}

const errorConfig = {
  NOT_FOUND: {
    title: 'Share Link Not Found',
    message: 'This share link doesn\'t exist or has been deleted.',
    icon: AlertCircle,
  },
  LINK_EXPIRED: {
    title: 'Share Link Expired',
    message: 'This share link has expired and is no longer available.',
    icon: Clock,
  },
  PASSWORD_REQUIRED: {
    title: 'Password Required',
    message: 'This content is protected with a password.',
    icon: Lock,
  },
  INVALID_PASSWORD: {
    title: 'Incorrect Password',
    message: 'The password you entered is incorrect. Please try again.',
    icon: Lock,
  },
  STATE_TOO_LARGE: {
    title: 'Content Too Large',
    message: 'This content is too large to share (max 5MB).',
    icon: AlertTriangle,
  },
  RATE_LIMITED: {
    title: 'Too Many Requests',
    message: 'You\'ve made too many requests. Please wait a while and try again.',
    icon: AlertTriangle,
  },
  INVALID_STATE: {
    title: 'Invalid Content',
    message: 'The shared content is invalid or corrupted.',
    icon: AlertCircle,
  },
};

export function ShareErrorDisplay({ error, pageType }: ShareErrorDisplayProps) {
  const config = errorConfig[error];
  const Icon = config.icon;
  const router = useRouter();

  const handleGoToPage = () => {
    router.push(`/${pageType}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="max-w-md w-full text-center">
        <Icon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
        <h1 className="text-2xl font-bold mb-2">{config.title}</h1>
        <p className="text-muted-foreground mb-6">{config.message}</p>

        <Button onClick={handleGoToPage}>
          Go to {pageType.charAt(0).toUpperCase() + pageType.slice(1)} Page
        </Button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add components/shared/share-error-display.tsx
git commit -m "feat: add ShareErrorDisplay component"
```

---

## Phase 3: Tab Component Refactoring

### Task 3.1: Create Text Tab Type Interfaces

**Files:**

- Create: `app/text/tabs/types.ts`

- [ ] **Step 1: Create type definitions**

Create `app/text/tabs/types.ts`:

```typescript
import type { TextDiffState, TextConvertState, TextCleanState } from '@/lib/types/share';

export interface TextDiffTabRef {
    getState(): TextDiffState;
    setState(state: TextDiffState): void;
}

export interface TextConvertTabRef {
    getState(): TextConvertState;
    setState(state: TextConvertState): void;
}

export interface TextCleanTabRef {
    getState(): TextCleanState;
    setState(state: TextCleanState): void;
}
```

- [ ] **Step 2: Commit**

```bash
git add app/text/tabs/types.ts
git commit -m "feat: add text tab ref interfaces"
```

---

### Task 3.2: Refactor TextDiffTab with State Interface

**Files:**

- Modify: `app/text/tabs/text-diff-tab.tsx`

- [ ] **Step 1: Read existing component**

Run: `head -100 app/text/tabs/text-diff-tab.tsx`

- [ ] **Step 2: Add ref interface and imperative handle**

Based on the existing component structure, add:

- Import `forwardRef` and `useImperativeHandle` from React
- Import `TextDiffTabRef` from types
- Wrap component with `forwardRef<TextDiffTabRef, Props>`
- Add `useImperativeHandle` to expose `getState()` and `setState()`

Example pattern to add:

```typescript
import { forwardRef, useImperativeHandle } from 'react';
import { TextDiffTabRef } from '../types';

export const TextDiffTab = forwardRef<TextDiffTabRef, TextDiffTabProps>((props, ref) => {
    // ... existing component code

    useImperativeHandle(ref, () => ({
        getState: () => ({
            leftContent: left,
            rightContent: right,
        }),
        setState: (state) => {
            setLeft(state.leftContent);
            setRight(state.rightContent);
        },
    }));

    // ... rest of component
});

TextDiffTab.displayName = 'TextDiffTab';
```

- [ ] **Step 3: Commit**

```bash
git add app/text/tabs/text-diff-tab.tsx
git commit -m "refactor: add state interface to TextDiffTab"
```

---

### Task 3.4: Refactor TextConvertTab with State Interface

**Files:**

- Modify: `app/text/tabs/text-convert-tab.tsx`

- [ ] **Step 1: Add ref interface**

Follow same pattern as TextDiffTab:

- Import `forwardRef`, `useImperativeHandle`, `TextConvertTabRef`
- Wrap with `forwardRef`
- Add `useImperativeHandle` with `getState()` and `setState()`

- [ ] **Step 2: Commit**

```bash
git add app/text/tabs/text-convert-tab.tsx
git commit -m "refactor: add state interface to TextConvertTab"
```

---

### Task 3.5: Refactor TextCleanTab with State Interface

**Files:**

- Modify: `app/text/tabs/text-clean-tab.tsx`

- [ ] **Step 1: Add ref interface**

Follow same pattern as other text tabs

- [ ] **Step 2: Commit**

```bash
git add app/text/tabs/text-clean-tab.tsx
git commit -m "refactor: add state interface to TextCleanTab"
```

---

### Task 3.6: Create JSON Tab Type Interfaces

**Files:**

- Create: `app/json/tabs/types.ts`

- [ ] **Step 1: Create type definitions**

Create `app/json/tabs/types.ts`:

```typescript
import type {
    JsonViewerState,
    JsonDiffState,
    JsonSchemaState,
    JsonParserState,
    JsonFormatState,
    JsonMinifyState,
    JsonExportState,
} from '@/lib/types/share';

export interface JsonViewerTabRef {
    getState(): JsonViewerState;
    setState(state: JsonViewerState): void;
}

export interface JsonDiffTabRef {
    getState(): JsonDiffState;
    setState(state: JsonDiffState): void;
}

export interface JsonSchemaTabRef {
    getState(): JsonSchemaState;
    setState(state: JsonSchemaState): void;
}

export interface JsonParserTabRef {
    getState(): JsonParserState;
    setState(state: JsonParserState): void;
}

export interface JsonFormatTabRef {
    getState(): JsonFormatState;
    setState(state: JsonFormatState): void;
}

export interface JsonMinifyTabRef {
    getState(): JsonMinifyState;
    setState(state: JsonMinifyState): void;
}

export interface JsonExportTabRef {
    getState(): JsonExportState;
    setState(state: JsonExportState): void;
}
```

- [ ] **Step 2: Commit**

```bash
git add app/json/tabs/types.ts
git commit -m "feat: add JSON tab ref interfaces"
```

---

### Task 3.6: Refactor All JSON Tabs with State Interfaces

**Files:**

- Modify: All JSON tab components

- [ ] **Step 1: Refactor JsonViewerTab**

Add ref interface to `app/json/tabs/json-viewer-tab.tsx`

- [ ] **Step 2: Commit**

```bash
git add app/json/tabs/json-viewer-tab.tsx
git commit -m "refactor: add state interface to JsonViewerTab"
```

- [ ] **Step 3-16: Repeat for other JSON tabs**

Repeat for: json-diff-tab, json-schema-tab, json-parser-tab, json-format-tab, json-minify-tab, json-export-tab

Each in separate commit with appropriate message

---

### Task 3.7: Create Base64 Tab Type Interfaces

**Files:**

- Create: `app/base64/tabs/types.ts`

- [ ] **Step 1: Create type definitions**

Create `app/base64/tabs/types.ts`:

```typescript
import type { Base64EncodeState, Base64DecodeState } from '@/lib/types/share';

export interface Base64EncodeTabRef {
    getState(): Base64EncodeState;
    setState(state: Base64EncodeState): void;
}

export interface Base64DecodeTabRef {
    getState(): Base64DecodeState;
    setState(state: Base64DecodeState): void;
}
```

- [ ] **Step 2: Commit**

```bash
git add app/base64/tabs/types.ts
git commit -m "feat: add base64 tab ref interfaces"
```

---

### Task 3.9: Refactor Base64 Tabs with State Interfaces

**Files:**

- Modify: `app/base64/tabs/media-to-base64-tab.tsx`
- Modify: `app/base64/tabs/base64-to-media-tab.tsx`

- [ ] **Step 1: Refactor MediaToBase64Tab**

Add ref interface to `app/base64/tabs/media-to-base64-tab.tsx`

- [ ] **Step 2: Commit**

```bash
git add app/base64/tabs/media-to-base64-tab.tsx
git commit -m "refactor: add state interface to MediaToBase64Tab"
```

- [ ] **Step 3: Refactor Base64ToMediaTab**

Add ref interface to `app/base64/tabs/base64-to-media-tab.tsx`

- [ ] **Step 4: Commit**

```bash
git add app/base64/tabs/base64-to-media-tab.tsx
git commit -m "refactor: add state interface to Base64ToMediaTab"
```

---

## Phase 4: Share Dialog Integration

### Task 4.1: Integrate ShareForm into TextDiffShareDialog

**Files:**

- Modify: `components/text/diff-pane/text-diff-share-dialog.tsx`

- [ ] **Step 1: Read existing component**

Run: `head -50 components/text/diff-pane/text-diff-share-dialog.tsx`

- [ ] **Step 2: Add ShareForm integration**

Import ShareForm and add it at the top of the SheetContent, before the existing content. Preserve all existing export options.

Pattern:

```typescript
import { ShareForm } from '@/components/share/share-form';

// In the component, add before existing content:
<ShareForm
  pageType="text-diff"
  getState={() => ({
    leftContent: leftContent || left, // Use actual prop names
    rightContent: rightContent || right, // Use actual prop names
  })}
/>

  <Separator />

  {/* Existing content preserved */}
</div>
```

- [ ] **Step 3: Commit**

```bash
git add components/text/diff-pane/text-diff-share-dialog.tsx
git commit -m "feat: integrate ShareForm into TextDiffShareDialog"
```

---

### Task 4.2: Integrate ShareForm into TextConvertShareDialog

**Files:**

- Modify: `components/text/convert-pane/convert-share-dialog.tsx`

- [ ] **Step 1: Add ShareForm with pageType 'text-convert'**

- [ ] **Step 2: Commit**

```bash
git add components/text/convert-pane/convert-share-dialog.tsx
git commit -m "feat: integrate ShareForm into ConvertShareDialog"
```

---

### Task 4.3: Integrate ShareForm into TextCleanShareDialog

**Files:**

- Modify: `components/text/clean-pane/clean-share-dialog.tsx` (if exists)

- [ ] **Step 1: Add ShareForm with pageType 'text-clean'**

- [ ] **Step 2: Commit**

```bash
git add components/text/clean-pane/clean-share-dialog.tsx
git commit -m "feat: integrate ShareForm into CleanShareDialog"
```

---

### Task 4.4: Integrate ShareForm into All JSON Share Dialogs

**Files:**

- Modify: All JSON share dialogs

- [ ] **Step 1: Integrate into JsonSchemaShareDialog**

Modify `components/schema/schema-share-dialog.tsx` with pageType 'json-schema'

- [ ] **Step 2: Commit**

```bash
git add components/schema/schema-share-dialog.tsx
git commit -m "feat: integrate ShareForm into JsonSchemaShareDialog"
```

- [ ] **Step 3-16: Repeat for other JSON dialogs**

Repeat for: viewer, diff, parser, format, minify, export share dialogs with appropriate pageTypes

---

### Task 4.5: Integrate ShareForm into Base64ShareDialog

**Files:**

- Modify: `components/base64/base64-share-dialog.tsx`

- [ ] **Step 1: Determine which tab type**

Check which base64 tab this dialog serves and use appropriate pageType ('base64-encode' or 'base64-decode')

- [ ] **Step 2: Add ShareForm integration**

- [ ] **Step 3: Commit**

```bash
git add components/base64/base64-share-dialog.tsx
git commit -m "feat: integrate ShareForm into Base64ShareDialog"
```

---

## Phase 5: Loading Page & Routing

### Task 5.1: Create Loading Page Route Handler

**Files:**

- Create: `app/[pageType]/[id]/page.tsx`

- [ ] **Step 1: Create dynamic route page**

Create `app/[pageType]/[id]/page.tsx` as a CLIENT component:

```typescript
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { PasswordPrompt } from '@/components/shared/password-prompt';
import { ShareErrorDisplay } from '@/components/shared/share-error-display';

interface PageProps {
  params: { pageType: string; id: string };
}

function pageTypeFromMetadata(pageType: string): string {
  const parts = pageType.split('-');
  if (parts[0] === 'base64' && parts[1] === 'encode') {
    return 'encode';
  }
  if (parts[0] === 'base64' && parts[1] === 'decode') {
    return 'decode';
  }
  return parts[1] || parts[0];
}

export default function SharedLinkPage({ params }: PageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { pageType, id } = params;

  const [loading, setLoading] = useState(true);
  const [metadata, setMetadata] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadSharedContent() {
      // Validate pageType
      const validPageTypes = ['text', 'json', 'base64'];
      if (!validPageTypes.includes(pageType)) {
        router.push('/text');
        return;
      }

      try {
        // Fetch metadata
        const metadataRes = await fetch(`/api/share/${id}`);
        if (!metadataRes.ok) {
          if (metadataRes.status === 404) {
            setError('NOT_FOUND');
            return;
          }
          setError('INVALID_STATE');
          return;
        }

        const metadataData = await metadataRes.json();
        setMetadata(metadataData);

        // Check expiration
        if (metadataData.expiresAt && new Date(metadataData.expiresAt) < new Date()) {
          setError('LINK_EXPIRED');
          return;
        }

        // If not password protected, access content directly
        if (!metadataData.hasPassword) {
          await accessContent();
        }
      } catch (err) {
        console.error('Error loading share:', err);
        setError('INVALID_STATE');
      } finally {
        setLoading(false);
      }
    }

    loadSharedContent();
  }, [pageType, id]);

  async function accessContent(password?: string) {
    try {
      const accessRes = await fetch(`/api/share/${id}/access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (!accessRes.ok) {
        if (accessRes.status === 401) {
          return { error: 'INVALID_PASSWORD' };
        }
        setError('INVALID_STATE');
        return;
      }

      const accessData = await accessRes.json();

      // Store in sessionStorage
      sessionStorage.setItem('sharedState', JSON.stringify(accessData));

      // Redirect to correct tab
      const tab = pageTypeFromMetadata(accessData.pageType);
      router.push(`/${pageType}?tab=${tab}`);
    } catch (err) {
      console.error('Error accessing share:', err);
      setError('INVALID_STATE');
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-4" />
        <p className="text-muted-foreground">Loading shared content...</p>
      </div>
    );
  }

  if (error) {
    return <ShareErrorDisplay error={error} pageType={pageType} />;
  }

  if (metadata?.hasPassword) {
    return (
      <PasswordPrompt
        pageType={pageType}
        id={id}
        metadata={metadata}
        onUnlock={accessContent}
      />
    );
  }

  return null; // Will redirect
}
```

- [ ] **Step 2: Commit**

```bash
git add app/[pageType]/[id]/page.tsx
git commit -m "feat: add shared link loading page"
```

---

## Phase 6: Main Page Integration

### Task 6.1: Update Text Page for Shared State

**Files:**

- Modify: `app/text/page.tsx`

- [ ] **Step 1: Read existing page structure**

Run: `head -100 app/text/page.tsx`

- [ ] **Step 2: Add shared state detection**

Add state for sharedData, refs for tabs, and useEffect to detect sessionStorage:

```typescript
const [sharedData, setSharedData] = useState<any>(null);
const diffTabRef = useRef<TextDiffTabRef>(null);
const convertTabRef = useRef<TextConvertTabRef>(null);
const cleanTabRef = useRef<TextCleanTabRef>(null);

useEffect(() => {
    const sharedStateStr = sessionStorage.getItem('sharedState');
    if (sharedStateStr) {
        try {
            const sharedState = JSON.parse(sharedStateStr);
            setSharedData(sharedState);
            sessionStorage.removeItem('sharedState');

            // Apply state to tab
            setTimeout(() => {
                const tab = sharedState.pageType.split('-')[1];
                setActiveTab(tab as any);
                const params = new URLSearchParams();
                params.set('tab', tab);
                router.replace(`${pathname}?${params.toString()}`, { scroll: false });

                // Set state on appropriate tab
                switch (tab) {
                    case 'diff':
                        diffTabRef.current?.setState(sharedState.state);
                        break;
                    case 'convert':
                        convertTabRef.current?.setState(sharedState.state);
                        break;
                    case 'clean':
                        cleanTabRef.current?.setState(sharedState.state);
                        break;
                }
            }, 100);
        } catch (error) {
            console.error('Failed to parse shared state:', error);
            sessionStorage.removeItem('sharedState');
        }
    }
}, []);
```

- [ ] **Step 3: Add SharedContentBanner**

Add banner conditionally at the top of the page:

```typescript
return (
  <>
    {sharedData && (
      <SharedContentBanner
        title={sharedData.title}
        comment={sharedData.comment}
        expiresAt={sharedData.expiresAt}
        hasPassword={sharedData.hasPassword}
        viewCount={sharedData.viewCount}
        createdAt={sharedData.createdAt}
        onClose={() => setSharedData(null)}
      />
    )}
    {/* Existing Tabs component */}
  </>
);
```

- [ ] **Step 4: Pass refs to tab components**

```typescript
<TabsContent value="diff" className="mt-0">
  <TextDiffTab
    ref={diffTabRef}
    onClear={handleClear}
    readOnly={!!sharedData}
  />
</TabsContent>
```

- [ ] **Step 5: Commit**

```bash
git add app/text/page.tsx
git commit -m "feat: add shared state loading to text page"
```

---

### Task 6.2: Update JSON Page for Shared State

**Files:**

- Modify: `app/json/page.tsx`

- [ ] **Step 1: Add shared state detection**

Follow same pattern as text page with appropriate tab refs

- [ ] **Step 2: Commit**

```bash
git add app/json/page.tsx
git commit -m "feat: add shared state loading to JSON page"
```

---

### Task 6.3: Update Base64 Page for Shared State

**Files:**

- Modify: `app/base64/page.tsx`

- [ ] **Step 1: Add shared state detection**

Follow same pattern as other pages

- [ ] **Step 2: Commit**

```bash
git add app/base64/page.tsx
git commit -m "feat: add shared state loading to base64 page"
```

---

## Phase 7: Testing & Polish

### Task 7.1: Test Share Creation Flow

**Files:**

- Manual testing

- [ ] **Step 1: Start dev server**

Run: `npm run dev`

- [ ] **Step 2: Test share creation**

1. Navigate to /text page
2. Enter content in diff tab
3. Click Share button
4. Fill out form (title required, comment optional, select expiration)
5. Click Generate Link
6. Verify link is generated
7. Copy link
8. Paste in new browser window
9. Verify loading page appears
10. Verify redirect to correct tab with content loaded
11. Verify SharedContentBanner appears

- [ ] **Step 3: Test password protection**

1. Create share with password
2. Open link in incognito window
3. Verify password prompt appears
4. Test incorrect password
5. Test correct password
6. Verify content loads

- [ ] **Step 4: Test expiration**

1. Create share with 1h expiration
2. Verify it works immediately
3. Manually update database to expire it
4. Verify LINK_EXPIRED error

- [ ] **Step 5: Test all tabs**

Repeat for convert, clean, all JSON tabs, all base64 tabs

- [ ] **Step 6: Fix any issues found**

Commit fixes with descriptive messages

---

### Task 7.2: Test Error States

**Files:**

- Manual testing

- [ ] **Step 1: Test invalid link**

Visit `/text/invalidid` - should show NOT_FOUND

- [ ] **Step 2: Test rate limiting**

Create multiple shares rapidly - should hit rate limit

- [ ] **Step 3: Test large content**

Try to share content > 5MB - should show STATE_TOO_LARGE

- [ ] **Step 4: Test malformed state**

Manipulate sessionStorage with invalid state - should handle gracefully

- [ ] **Step 5: Fix any issues**

Commit fixes

---

### Task 7.3: Performance Testing

**Files:**

- Manual testing

- [ ] **Step 1: Test with large content**

Share near-maximum size content (4.9MB) - verify acceptable performance

- [ ] **Step 2: Test concurrent access**

Open shared link in multiple browser tabs simultaneously

- [ ] **Step 3: Test view count increment**

Verify view count increments correctly

- [ ] **Step 4: Optimize if needed**

Commit optimizations

---

### Task 7.4: Final Polish

**Files:**

- Multiple

- [ ] **Step 1: Review all UI components**

Ensure consistent styling, proper dark mode support, responsive design

- [ ] **Step 2: Add loading states**

Ensure all async operations have proper loading indicators

- [ ] **Step 3: Improve error messages**

Make user-facing error messages clear and actionable

- [ ] **Step 4: Add keyboard shortcuts**

Consider adding Enter key to submit forms, Esc to close modals

- [ ] **Step 5: Test accessibility**

Ensure keyboard navigation works, screen readers are supported

- [ ] **Step 6: Commit polish**

```bash
git commit -m "polish: improve UI/UX and accessibility"
```

---

### Task 7.5: Update Documentation

**Files:**

- Documentation files

- [ ] **Step 1: Update README if needed**

Document the new sharing feature

- [ ] **Step 2: Add inline code comments**

Ensure complex logic has explanatory comments

- [ ] **Step 3: Create migration guide**

Document changes for other developers

- [ ] **Step 4: Commit documentation**

```bash
git add README.md docs/
git commit -m "docs: document tab-based sharing feature"
```

---

## Completion

### Task 8.1: Final Review

- [ ] **Step 1: Review all commits**

Run: `git log --oneline --graph`

- [ ] **Step 2: Verify all tests pass**

Run: `npm test` (if tests exist)

- [ ] **Step 3: Verify build succeeds**

Run: `npm run build`

- [ ] **Step 4: Create summary commit**

```bash
git commit --allow-empty -m "feat: complete tab-based sharing implementation

- Database schema with composite pageType values
- API routes with Zod validation and Axios client
- Reusable ShareForm component
- State serialization for all tabs
- Loading page with redirect flow
- SharedContentBanner for metadata display
- Password protection and expiration support
- Rate limiting and input validation

Implementation complete and tested."
```

---

## Summary

This plan implements the tab-based sharing feature in 7 phases:

1. **Database & API** (11 tasks) - Foundation layer
2. **Components** (4 tasks) - Reusable UI building blocks
3. **Tab Refactoring** (8 tasks) - Add state interfaces to all tabs
4. **Share Dialogs** (5 tasks) - Integrate ShareForm
5. **Loading Page** (1 task) - Routing and authentication
6. **Main Pages** (3 tasks) - Shared state loading
7. **Testing** (5 tasks) - Comprehensive testing and polish

**Total:** 37 tasks across 7 phases, estimated 14-22 hours

Each task produces self-contained changes that can be committed independently.
