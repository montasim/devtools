# Shareable App State Design

**Date:** 2026-04-12
**Status:** Approved
**Author:** Claude (with user collaboration)

## Overview

Enable users to share the complete state of their devtools workspace with others through persistent, shareable links. The system supports all pages (text, json, etc.) and all tabs within those pages, with optional password protection and configurable expiration.

## Goals

- Share entire app state across all tabs and pages
- Persistent storage in database with short, clean URLs
- View-only mode with toggle to edit/copy to workspace
- Optional password protection and configurable expiration
- Updatable shared links after creation
- Support for large content through efficient storage

## Architecture

### Approach: Hybrid Metadata + JSON Content

Two-table approach balancing simplicity and scalability:

- `shared_links` - Fast metadata queries (expiration, passwords, view count)
- `shared_content` - Flexible JSON state storage

## Database Schema

### `shared_links` Table

```prisma
model SharedLink {
  id           String   @id @default(cuid())
  pageType     String                              // 'text', 'json', etc.
  title        String?                             // Optional user-provided title
  expiresAt    DateTime?                           // Null = never expires
  passwordHash String?                             // Null = public access
  updateToken  String?                             // Authorization token for updates/deletes
  viewCount    Int      @default(0)
  updatedAt    DateTime @updatedAt
  createdAt    DateTime @default(now())

  content      SharedContent @relation

  @@index([pageType])
  @@index([createdAt])
}
```

### `shared_content` Table

```prisma
model SharedContent {
  id        String   @id @default(cuid())
  linkId    String   @unique
  state     Json                              // Page-specific state as JSON
  link      SharedLink @relation(fields: [linkId], references: [id], onDelete: Cascade)

  @@index([linkId])
}
```

**Authorization Model:**

- Each shared link has a unique `updateToken` generated on creation
- The `updateToken` is returned only to the creator (never in GET requests)
- PATCH and DELETE operations require the `updateToken` in request headers
- This prevents unauthorized modifications while keeping links publicly viewable

### Example State JSON

```json
{
    "activeTab": "convert",
    "tabs": {
        "diff": {
            "input1": "original text",
            "input2": "modified text",
            "options": {
                "caseSensitive": false,
                "ignoreWhitespace": true
            }
        },
        "convert": {
            "input": "hello world",
            "output": "HELLO WORLD",
            "conversionType": "UPPERCASE"
        },
        "clean": {
            "input": "  extra  spaces  ",
            "output": "extra spaces",
            "selectedOperations": ["trim", "remove-extra-spaces"]
        }
    }
}
```

## URL Structure

### Format

```
domain.com/text/cls123abc456def
domain.com/json/cls789xyz456abc
```

- Clean, semantic URLs
- No query parameters needed (state stored in database)
- CUIDs for short, URL-safe identifiers
- Page type in path (`text`, `json`, etc.)

### Route Handlers

```
/app/[pageType]/[id]/page.tsx
```

Examples:

- `/text/cls123abc456def` → `app/text/[id]/page.tsx`
- `/json/cls789xyz456abc` → `app/json/[id]/page.tsx`

## API Routes

### POST /api/share/create

Create a new shared link

**Request:**

```typescript
{
  pageType: 'text' | 'json' | ...,
  state: AppPageState,
  title?: string,
  expiresAt?: string,  // ISO date
  password?: string
}
```

**Response (201 Created):**

```typescript
{
  id: string,
  shortUrl: string,  // /text/cls123abc
  fullUrl: string,   // https://domain.com/text/cls123abc
  updateToken: string  // Save this for updates/deletes
}
```

**Errors:**

- 400 Bad Request: Invalid state data, exceeds size limit
- 429 Too Many Requests: Rate limit exceeded

### GET /api/share/:id

Retrieve shared link metadata (without content)

**Response (200 OK):**

```typescript
{
  id: string,
  pageType: string,
  title: string | null,
  expiresAt: string | null,
  hasPassword: boolean,
  viewCount: number,
  createdAt: string,
  updatedAt: string
}
```

**Errors:**

- 404 Not Found: Link doesn't exist

### POST /api/share/:id/access

Access shared content (handles password validation)

**Request:**

```typescript
{
  password?: string
}
```

**Response (200 OK):**

```typescript
{
  state: AppPageState,
  linkId: string
}
```

**Errors:**

- 400 Bad Request: `PASSWORD_REQUIRED` - Password needed but not provided
- 401 Unauthorized: `INVALID_PASSWORD` - Wrong password
- 404 Not Found: `NOT_FOUND` - Link doesn't exist
- 410 Gone: `LINK_EXPIRED` - Link has expired

### PATCH /api/share/:id

Update existing shared link

**Headers:**

```
Authorization: Bearer <updateToken>
```

**Request:**

```typescript
{
  state?: AppPageState,
  title?: string,
  expiresAt?: string,
  password?: string | null  // null = remove password
}
```

**Response (200 OK):**

```typescript
{
    updatedAt: string;
}
```

**Errors:**

- 401 Unauthorized: Invalid or missing updateToken
- 404 Not Found: Link doesn't exist
- 400 Bad Request: Invalid state data, exceeds size limit

### DELETE /api/share/:id

Delete shared link

**Headers:**

```
Authorization: Bearer <updateToken>
```

**Response (200 OK):**

```typescript
{
    success: true;
}
```

**Errors:**

- 401 Unauthorized: Invalid or missing updateToken
- 404 Not Found: Link doesn't exist

## State Serialization

### Text Page State Interface

```typescript
interface TextPageState {
    activeTab: 'diff' | 'convert' | 'clean';
    tabs: {
        diff: {
            input1: string;
            input2: string;
            options?: {
                caseSensitive?: boolean;
                ignoreWhitespace?: boolean;
            };
        };
        convert: {
            input: string;
            output: string;
            conversionType: string | null;
        };
        clean: {
            input: string;
            output: string;
            selectedOperations: string[];
        };
    };
}
```

### Serialization Pattern

Each tab component implements:

- `getState()` - Returns current state as JSON
- `setState(state)` - Restores state from JSON

**On Share Creation:**

```typescript
const state = {
    activeTab: getActiveTab(),
    tabs: {
        diff: diffTabRef.current?.getState(),
        convert: convertTabRef.current?.getState(),
        clean: cleanTabRef.current?.getState(),
    },
};
```

**On Shared Link Load:**

```typescript
function restoreState(state: TextPageState) {
    setActiveTab(state.activeTab);
    diffTabRef.current?.setState(state.tabs.diff);
    convertTabRef.current?.setState(state.tabs.convert);
    cleanTabRef.current?.setState(state.tabs.clean);
}
```

### State Validation

**On Share Creation:**

```typescript
function validateState(state: AppPageState): void {
    // Validate structure
    if (!state.activeTab || !state.tabs) {
        throw new Error('INVALID_STATE_STRUCTURE');
    }

    // Validate page type
    const validTabs = ['diff', 'convert', 'clean'];
    if (!validTabs.includes(state.activeTab)) {
        throw new Error('INVALID_TAB');
    }

    // Validate content size
    const stateSize = JSON.stringify(state).length;
    if (stateSize > MAX_STATE_SIZE) {
        throw new Error('STATE_TOO_LARGE');
    }

    // Validate individual field sizes
    const MAX_FIELD_SIZE = 1024 * 1024; // 1MB per field
    for (const [tabName, tabData] of Object.entries(state.tabs)) {
        for (const [field, value] of Object.entries(tabData)) {
            if (typeof value === 'string' && value.length > MAX_FIELD_SIZE) {
                throw new Error(`Field ${tabName}.${field} exceeds size limit`);
            }
        }
    }
}
```

### Component Refactoring Strategy

**Current State:** Existing tab components don't expose state serialization methods.

**Migration Path:**

1. **Add State Interface to Each Tab Component**

```typescript
// Before: TextDiffTab
export function TextDiffTab() {
    const [input1, setInput1] = useState('');
    const [input2, setInput2] = useState('');
    // ...
}

// After: TextDiffTab with serialization
export interface TextDiffTabRef {
    getState(): DiffTabState;
    setState(state: DiffTabState): void;
}

export const TextDiffTab = forwardRef<TextDiffTabRef>((props, ref) => {
    const [input1, setInput1] = useState('');
    const [input2, setInput2] = useState('');

    useImperativeHandle(ref, () => ({
        getState: () => ({
            input1,
            input2,
            options: {
                /* current options */
            },
        }),
        setState: (state) => {
            setInput1(state.input1);
            setInput2(state.input2);
            // restore options
        },
    }));

    // ... rest of component
});
```

2. **Update Parent Component to Use Refs**

```typescript
// In text page or wrapper
const diffTabRef = useRef<TextDiffTabRef>(null);
const convertTabRef = useRef<ConvertTabRef>(null);
const cleanTabRef = useRef<CleanTabRef>(null);

// Collect state when sharing
const collectState = () => ({
    activeTab: getActiveTab(),
    tabs: {
        diff: diffTabRef.current?.getState(),
        convert: convertTabRef.current?.getState(),
        clean: cleanTabRef.current?.getState(),
    },
});
```

3. **Implementation Order:**
    - Phase 2.1: Add interfaces to TextDiffTab
    - Phase 2.2: Add interfaces to other text tabs
    - Phase 2.3: Test state collection and restoration
    - Phase 2.4: Implement share creation UI
    - Phase 2.5: Implement shared link viewer

## Security & Privacy

### Password Protection

- Never store plain-text passwords
- Use bcrypt with 10 salt rounds
- Password validation before content returned

```typescript
import bcrypt from 'bcrypt';

// Hashing
passwordHash = await bcrypt.hash(password, 10);

// Validation
const isValid = await bcrypt.compare(password, sharedLink.passwordHash);
```

### Expiration Handling

```typescript
if (sharedLink.expiresAt && new Date() > sharedLink.expiresAt) {
    throw new Error('LINK_EXPIRED');
}
```

### Content Size Limits

```typescript
const MAX_STATE_SIZE = 5 * 1024 * 1024; // 5MB

if (JSON.stringify(state).length > MAX_STATE_SIZE) {
    throw new Error('STATE_TOO_LARGE');
}
```

### Rate Limiting

- IP-based rate limiting on create/access endpoints
- Maximum 10 creates per hour per IP

### View Count Tracking

```typescript
await prisma.sharedLink.update({
    where: { id },
    data: { viewCount: { increment: 1 } },
});
```

## User Experience

### Share Creation Flow

1. **Trigger** - User clicks Share button in toolbar
2. **Configure** - Dialog opens with options:
    - Title (optional)
    - Expiration: Never / 7 days / 30 days
    - Password (optional)
3. **Create** - Button generates link
4. **Result** - Shareable link displayed with Copy button

### Shared Link Viewer Flow

1. **Open Link** - User opens `/text/cls123abc`
2. **Authentication** (if password protected)
    - Show password prompt
    - Validate password
    - Show error on invalid attempts
3. **Validation** - Check expiration, existence
4. **Render** - Display content in view-only mode
5. **Mode Toggle** - User can switch to edit/copy mode

### View Modes

**View-Only Mode (Default):**

- Content rendered read-only
- Shows metadata (views, creation date)
- "Edit Copy" button to enable editing

**Edit Copy Mode:**

- Content fully editable
- Changes don't affect original shared link
- "Save as New Share" option
- "Back to View" to return to view-only

## Error Handling

### Error States

**404 - Not Found**

```
Share Link Not Found
This share link doesn't exist or has been deleted.
[Go to Home]
```

**Expired**

```
Share Link Expired
This share link expired on April 15, 2026.
[Go to Home]
```

**Invalid Password**

```
Incorrect Password
The password you entered is incorrect.
Password: [__________] [Unlock]
❌ 2 attempts remaining
```

**State Too Large**

```
Content Too Large
This content is too large to share (max 5MB).
Try removing some content or splitting into multiple shares.
[OK]
```

### API Error Format

```typescript
{
  error: 'ERROR_CODE',
  message: 'Human-readable message',
  details?: any
}
```

**Error Codes:**

- `NOT_FOUND` - Link doesn't exist
- `EXPIRED` - Link has expired
- `INVALID_PASSWORD` - Wrong password
- `PASSWORD_REQUIRED` - Password needed
- `STATE_TOO_LARGE` - Content exceeds size limit
- `RATE_LIMITED` - Too many requests

## Implementation Phases

### Phase 1: Core Infrastructure

- Database schema and migrations
- API routes (create, get, access)
- Basic URL routing

## Environment Variables

Create `.env.local` file:

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/devtools"

# Rate Limiting (using Vercel's edge config or custom)
RATE_LIMIT_MAX_REQUESTS=10
RATE_LIMIT_WINDOW_MS=3600000  # 1 hour

# App
NEXT_PUBLIC_APP_URL="https://yourdomain.com"
```

## Deployment Considerations

### Migration from Current URL-based Sharing

**Current State:**

- Text convert pane uses URL parameters with base64-encoded content
- Format: `?input=<base64>&output=<base64>&type=<type>`
- Works for small content but has URL length limitations

**Migration Strategy:**

1. **Phase 1: Parallel Operation**
    - Keep existing URL-based sharing
    - Add new database-backed sharing
    - Both systems work independently

2. **Phase 2: User Education**
    - Add notice in existing share dialog: "New! Create permanent share links"
    - Highlight benefits: shorter URLs, no expiration, password protection

3. **Phase 3: Deprecation** (Optional, after 3-6 months)
    - Show deprecation notice for old URL-based shares
    - Provide migration tool to convert old URLs to new format
    - Remove old code after migration period

**Backward Compatibility:**

```typescript
// Detect old URL format and show migration prompt
if (searchParams.has('input') && searchParams.has('output')) {
    // Old format detected
    showMigrationPrompt({
        message:
            'This share link uses an old format. Would you like to create a new permanent link?',
        action: async () => {
            const state = parseOldFormat(searchParams);
            const newLink = await createShareLink(state);
            window.location.href = newLink.fullUrl;
        },
    });
}
```

### Database Migration Strategy

1. **Development:**

```bash
npx prisma migrate dev --name add_shared_links
```

2. **Production:**

```bash
npx prisma migrate deploy
```

3. **Rollback Plan:**

```bash
npx prisma migrate resolve --rolled-back [migration-name]
```

### Database Connection Pooling

**For Serverless (Vercel/Netlify):**

```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")  // For migration purposes
}
```

**Connection Pool Configuration:**

```javascript
// lib/prisma.ts
const prisma = new PrismaClient({
    datasources: {
        db: {
            url: process.env.DATABASE_URL,
        },
    },
    log: ['query', 'error', 'warn'],
});

// Handle connection limits in serverless
let globalPrisma = global.prisma || prisma;
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;
```

### Rate Limiting Implementation

**Using Vercel Edge Config (Recommended for Vercel deployments):**

```typescript
// lib/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(10, '1 h'),
    analytics: true,
});

export async function checkRateLimit(ip: string) {
    const { success, remaining } = await ratelimit.limit(ip);
    return { allowed: success, remaining };
}
```

**Alternative: In-memory for development:**

```typescript
// Simple in-memory rate limiter (not for production)
const requests = new Map<string, number[]>();

export function checkRateLimit(ip: string) {
    const now = Date.now();
    const hourAgo = now - 3600000;
    const userRequests = requests.get(ip) || [];

    // Remove old requests
    const recent = userRequests.filter((t) => t > hourAgo);

    if (recent.length >= 10) {
        return { allowed: false, remaining: 0 };
    }

    recent.push(now);
    requests.set(ip, recent);
    return { allowed: true, remaining: 10 - recent.length };
}
```

### Feature Flags

**Gradual Rollout Strategy:**

```typescript
// lib/features.ts
export const FEATURES = {
    SHARE_ENABLED: process.env.FEATURE_SHARE === 'true',
    SHARE_PASSWORD_PROTECTION: process.env.FEATURE_SHARE_PASSWORD === 'true',
    SHARE_EXPIRATION: process.env.FEATURE_SHARE_EXPIRATION === 'true',
} as const;
```

**Enable features progressively:**

1. Phase 1: `FEATURE_SHARE=true`
2. Phase 3: `FEATURE_SHARE_PASSWORD=true, FEATURE_SHARE_EXPIRATION=true`
3. Phase 4: Enable for JSON page

### Monitoring & Logging

**Metrics to Track:**

- Share creation rate (per hour/day)
- Share access rate (per hour/day)
- Database query performance
- Rate limit violations
- Error rates by type

**Logging Strategy:**

```typescript
// lib/logger.ts
export function logShareEvent(event: {
    type: 'created' | 'accessed' | 'updated' | 'deleted';
    linkId: string;
    pageType: string;
    ip?: string;
    success: boolean;
    error?: string;
}) {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
        console.log('[Share]', event);
    }

    // In production, send to monitoring service
    // e.g., Datadog, New Relic, or Vercel Analytics
}
```

### Phase 2: Text Page Integration

- State serialization for text tabs (diff, convert, clean)
- Share creation UI
- Shared link viewer with view-only mode

### Phase 3: Enhanced Features

- Password protection
- Configurable expiration
- View/edit mode toggle
- Update existing shared links

### Phase 4: Additional Pages

- JSON page integration
- Future pages as needed

## Future Considerations

- **Analytics**: Track which conversions/tools are most shared
- **User Accounts**: Link shares to user accounts for management
- **Collaboration**: Real-time collaborative editing
- **Version History**: Track changes to shared links over time
- **Embedding**: Allow embedding shared content in other sites
