# Tab-Based Sharing Design

**Date:** 2026-04-12
**Status:** Approved
**Author:** Claude (with user collaboration)

## Overview

Enable users to share individual tab content from text, JSON, and base64 pages through persistent, shareable links. Each tab has its own share sidebar modal with configurable options (title, comment, expiration, password). When users visit shared links, they see a loading page, then are redirected to the appropriate tab with the shared content loaded in read-only mode.

## Goals

- Share individual tab content (not entire page state)
- Persistent storage in database with short, clean URLs
- Read-only viewing mode with SharedContentBanner showing metadata
- Optional password protection and configurable expiration (1h, 1d, 7d, 30d)
- Required title field, optional comment field
- No editing - users must reshare to update content

## Architecture

### Approach: Per-Tab State Storage

Each tab shares only its own content. Database `pageType` field stores composite values like `"text-diff"`, `"json-schema"`, `"base64-encode"` to encode both page and tab in a single field.

**Key Design Decisions:**

- Composite pageType values (e.g., `'text-diff'`, `'json-schema'`)
- Shareable link format: `/text/cls123abc` → redirect to `/text?tab=diff`
- Loading/interstitial page handles authentication and fetch
- sessionStorage transfers state between loading page and main page
- Reusable ShareForm component for all share dialogs
- Read-only mode when viewing shared content

## Database Schema

### Prisma Schema

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

model SharedContent {
  id        String   @id @default(cuid())
  linkId    String   @unique
  state     Json     // Single tab's state as JSON
  link      SharedLink @relation(fields: [linkId], references: [id], onDelete: Cascade)

  @@index([linkId])
}
```

**Composite pageType values:**

- Text page: `'text-diff'`, `'text-convert'`, `'text-clean'`
- JSON page: `'json-viewer'`, `'json-diff'`, `'json-schema'`, `'json-parser'`, `'json-format'`, `'json-minify'`, `'json-export'`
- Base64 page: `'base64-encode'` (media-to-base64), `'base64-decode'` (base64-to-media)

## URL Structure & Routing Flow

**URL Format:**

```
/text/cls123abc456def
/json/cls789xyz456abc
/base64/cls456def789ghi
```

**Routing Flow:**

```
User visits: /text/cls123abc
         ↓
[app/[pageType]/[id]/page.tsx]
         ↓
    Show loading page
    "Loading shared content..."
         ↓
    Fetch metadata from GET /api/share/cls123abc
         ↓
    Check if password protected?
    ├─ Yes → Show password prompt
    │         ↓
    │      User enters password
    │         ↓
    │      POST /api/share/cls123abc/access
    │         ↓
    └─ No → POST /api/share/cls123abc/access
              ↓
         Get state + pageType (e.g., "text-diff")
              ↓
    Parse pageType → page="text", tab="diff"
              ↓
    Store state in sessionStorage
              ↓
    Redirect to /text?tab=diff
              ↓
[/text/page.tsx detects shared state]
         ↓
    Load state from sessionStorage
         ↓
    Show SharedContentBanner at top
         ↓
    Populate tab with shared content (read-only)
```

## API Routes

### POST /api/share/create

Creates a new shared link

**Request:**

```typescript
{
  pageType: 'text-diff' | 'json-schema' | 'base64-encode' | ...,
  title: string,              // Required
  comment?: string,           // Optional
  state: TabState,            // Tab-specific state
  expiration?: '1h' | '1d' | '7d' | '30d',
  password?: string           // Optional
}
```

**Response (201 Created):**

```typescript
{
  id: string,
  shortUrl: string,    // /text/cls123abc
  fullUrl: string,     // https://domain.com/text/cls123abc
  expiresAt: string | null,
  hasPassword: boolean
}
```

**Errors:**

- `400 Bad Request` - Invalid state, missing title
- `429 Too Many Requests` - Rate limit exceeded

---

### GET /api/share/[id]

Get shared link metadata (without content)

**Response (200 OK):**

```typescript
{
  id: string,
  pageType: string,
  title: string,
  comment: string | null,
  expiresAt: string | null,
  hasPassword: boolean,
  viewCount: number,
  createdAt: string
}
```

**Errors:**

- `404 Not Found` - Link doesn't exist

---

### POST /api/share/[id]/access

Access shared content (validates password)

**Request:**

```typescript
{
  password?: string
}
```

**Response (200 OK):**

```typescript
{
  state: TabState,
  linkId: string,
  pageType: string,
  title: string,
  comment: string | null,
  expiresAt: string | null,
  hasPassword: boolean,
  viewCount: number
}
```

**Errors:**

- `400 Bad Request` - `{ error: 'PASSWORD_REQUIRED' }`
- `401 Unauthorized` - `{ error: 'INVALID_PASSWORD' }`
- `404 Not Found` - `{ error: 'NOT_FOUND' }`
- `410 Gone` - `{ error: 'LINK_EXPIRED' }`

---

## State Serialization

Each tab component implements two methods via `useImperativeHandle`:

```typescript
export interface TextDiffTabRef {
    getState(): TextDiffState;
    setState(state: TextDiffState): void;
}
```

**Tab State Interfaces:**

```typescript
// Text Diff Tab
interface TextDiffState {
    leftContent: string;
    rightContent: string;
}

// Text Convert Tab
interface TextConvertState {
    input: string;
    output: string;
    conversionType: string | null;
}

// Text Clean Tab
interface TextCleanState {
    input: string;
    output: string;
    selectedOperations: string[];
}

// JSON Viewer Tab
interface JsonViewerState {
    input: string;
    format: boolean;
}

// JSON Diff Tab
interface JsonDiffState {
    leftContent: string;
    rightContent: string;
}

// JSON Schema Tab
interface JsonSchemaState {
    input: string;
    schema: string;
    validationErrors: any[];
}

// JSON Parser Tab
interface JsonParserState {
    input: string;
    parsed: any;
}

// JSON Format Tab
interface JsonFormatState {
    input: string;
    output: string;
    indent: number;
}

// JSON Minify Tab
interface JsonMinifyState {
    input: string;
    output: string;
}

// JSON Export Tab
interface JsonExportState {
    input: string;
    exportFormat: 'csv' | 'xml' | 'yaml';
    output: string;
}

// Base64 Encode Tab (Media to Base64)
interface Base64EncodeState {
    input: string; // base64 encoded media
    mimeType: string;
    fileName: string;
}

// Base64 Decode Tab (Base64 to Media)
interface Base64DecodeState {
    input: string; // text/base64 to encode
    output: string; // base64 encoded result
}
```

## Components

### ShareForm (Reusable Component)

**Location:** `components/share/share-form.tsx`

**Props:**

```typescript
interface ShareFormProps {
    pageType: string;
    getState: () => any;
    onLinkGenerated?: (url: string) => void;
}
```

**Features:**

- Title input (required)
- Comment textarea (optional)
- Expiration select (1h, 1d, 7d, 30d)
- Password input (optional)
- Generate Link button
- Displays generated link with copy button after creation
- Uses Zod for validation
- Uses Axios for API calls

### SharedContentBanner

**Location:** `components/shared/shared-content-banner.tsx`

**Props:**

```typescript
interface SharedContentBannerProps {
    title: string;
    comment?: string | null;
    expiresAt?: string | null;
    hasPassword: boolean;
    viewCount: number;
    createdAt: string;
    onClose?: () => void;
}
```

**Display:**

- "Shared Content" badge
- Title
- Comment (if provided)
- View count with Eye icon
- Password protection status with Lock icon (if applicable)
- Expiration time with Clock icon (if applicable)
- Creation date
- Close button (optional)

### PasswordPrompt

**Location:** Used in loading page

**Features:**

- Lock icon
- Password input field
- Submit button
- Error display for incorrect password
- Metadata display (title)

### ShareErrorDisplay

**Location:** Used in loading page

**Error Types:**

- NOT_FOUND
- LINK_EXPIRED
- PASSWORD_REQUIRED
- INVALID_PASSWORD
- STATE_TOO_LARGE
- RATE_LIMITED
- INVALID_STATE

## Technology Stack

### Validation: Zod

**Location:** `lib/schemas/share.ts`

```typescript
export const CreateShareSchema = z.object({
  pageType: z.enum([...]),
  title: z.string().min(1).max(200),
  comment: z.string().max(1000).optional(),
  state: z.any(),
  expiration: z.enum(['1h', '1d', '7d', '30d']).optional(),
  password: z.string().min(4).max(100).optional(),
});

// Tab-specific state schemas
export const TextDiffStateSchema = z.object({
  leftContent: z.string().max(1_000_000),
  rightContent: z.string().max(1_000_000),
});
```

**Type Inference:**

```typescript
export type CreateShareInput = z.infer<typeof CreateShareSchema>;
export type TextDiffState = z.infer<typeof TextDiffStateSchema>;
```

### HTTP Client: Axios

**Location:** `lib/api/share.ts`

```typescript
export const shareApi = {
  async create(input: CreateShareInput): Promise<CreateShareResponse> {
    const validated = CreateShareSchema.parse(input);
    const response = await api.post('/create', validated);
    return CreateShareResponseSchema.parse(response.data);
  },

  async getMetadata(id: string): Promise<ShareMetadata> { ... },

  async access(id: string, password?: string): Promise<ShareAccessResponse> { ... },
};
```

**React Query Hooks:**

```typescript
export function useCreateShare() {
    return useMutation({ mutationFn: shareApi.create });
}

export function useShareMetadata(id: string) {
    return useQuery({
        queryKey: ['share-metadata', id],
        queryFn: () => shareApi.getMetadata(id),
    });
}
```

## Security

### Password Security

```typescript
// lib/crypto.ts
import bcrypt from 'bcrypt';

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}
```

### Content Size Limits

```typescript
// lib/validation.ts
const MAX_STATE_SIZE = 5 * 1024 * 1024; // 5MB total
const MAX_FIELD_SIZE = 1 * 1024 * 1024; // 1MB per field

export function validateState(state: any): { valid: boolean; error?: string } {
    const stateSize = JSON.stringify(state).length;
    if (stateSize > MAX_STATE_SIZE) {
        return { valid: false, error: 'STATE_TOO_LARGE' };
    }
    // ... field-level validation
}
```

### Rate Limiting

```typescript
// lib/rate-limit.ts
const LIMITS = {
    create: { max: 10, window: 3600000 }, // 10 per hour
    access: { max: 100, window: 3600000 }, // 100 per hour
};

export function checkRateLimit(ip: string, type: 'create' | 'access') {
    // In-memory implementation for development
    // Use Redis/Upstash for production
}
```

## Integration Pattern

### Tab Component Pattern

```typescript
// app/text/tabs/text-diff-tab.tsx

export const TextDiffTab = forwardRef<TextDiffTabRef, TextDiffTabProps>(
  (props, ref) => {
    const [leftContent, setLeftContent] = useState('');
    const [rightContent, setRightContent] = useState('');

    useImperativeHandle(ref, () => ({
      getState: () => ({ leftContent, rightContent }),
      setState: (state) => {
        setLeftContent(state.leftContent);
        setRightContent(state.rightContent);
      },
    }));

    return (
      <div>
        <textarea value={leftContent} readOnly={props.readOnly} />
        <textarea value={rightContent} readOnly={props.readOnly} />
      </div>
    );
  }
);
```

### Share Dialog Integration

```typescript
// components/text/diff-pane/text-diff-share-dialog.tsx

import { ShareForm } from '@/components/share/share-form';

export function TextDiffShareDialog({ ... }) {
  const getCurrentState = () => ({
    leftContent,
    rightContent,
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent>
        <ShareForm
          pageType="text-diff"
          getState={getCurrentState}
        />
        <Separator />
        {/* Existing export options preserved */}
      </SheetContent>
    </Sheet>
  );
}
```

### Main Page Integration

```typescript
// app/text/page.tsx

function TextPageContent() {
  const [sharedData, setSharedData] = useState<any>(null);
  const diffTabRef = useRef<TextDiffTabRef>(null);

  useEffect(() => {
    const sharedStateStr = sessionStorage.getItem('sharedState');
    if (sharedStateStr) {
      const sharedState = JSON.parse(sharedStateStr);
      setSharedData(sharedState);
      sessionStorage.removeItem('sharedState');

      // Apply state to tab
      setTimeout(() => {
        const tab = sharedState.pageType.split('-')[1];
        setActiveTab(tab);
        diffTabRef.current?.setState(sharedState.state);
      }, 100);
    }
  }, []);

  return (
    <>
      {sharedData && (
        <SharedContentBanner
          title={sharedData.title}
          {...sharedData}
          onClose={() => setSharedData(null)}
        />
      )}
      <Tabs>
        <TabsContent value="diff">
          <TextDiffTab ref={diffTabRef} readOnly={!!sharedData} />
        </TabsContent>
      </Tabs>
    </>
  );
}
```

## Error Handling

### Error Response Format

```typescript
{
  error: 'ERROR_CODE',
  message: 'Human-readable message',
  details?: any,
  retryAfter?: number // for rate limiting
}
```

### Error Codes

- `NOT_FOUND` - Link doesn't exist
- `LINK_EXPIRED` - Link has expired
- `PASSWORD_REQUIRED` - Password needed
- `INVALID_PASSWORD` - Wrong password
- `STATE_TOO_LARGE` - Content exceeds 5MB limit
- `RATE_LIMITED` - Too many requests
- `INVALID_STATE` - Invalid or corrupted state

## Implementation Phases

### Phase 1: Database & API Infrastructure

- Update Prisma schema
- Run database migration
- Create API routes (create, get, access)
- Add password hashing utilities
- Add Zod validation schemas
- Add Axios API client
- Add rate limiting
- Test API endpoints

### Phase 2: Reusable Components

- Create ShareForm component
- Create SharedContentBanner component
- Create PasswordPrompt component
- Create ShareErrorDisplay component
- Test components in isolation

### Phase 3: Tab Component Refactoring

- Add ref interfaces to all tabs
- Implement getState() for each tab
- Implement setState() for each tab
- Add Zod state schemas for each tab
- Test state restoration

### Phase 4: Share Dialog Integration

- Integrate ShareForm into all existing share dialogs
- Preserve all existing export options
- Test share creation flow

### Phase 5: Loading Page & Routing

- Create /app/[pageType]/[id]/page.tsx
- Implement metadata fetching
- Implement password prompt flow
- Implement redirect logic
- Test error states

### Phase 6: Main Page Integration

- Add shared state detection to main pages
- Implement state restoration logic
- Integrate SharedContentBanner
- Add read-only mode to tabs
- Test end-to-end flow

### Phase 7: Testing & Polish

- End-to-end testing
- Performance testing
- UI/UX refinements
- Documentation

**Estimated Timeline:** 14-22 hours

## Future Considerations

- User accounts for managing shared links
- Edit mode (with updateToken for authorized updates)
- Multi-tab sharing
- Version history for shared links
- Analytics (most shared tabs, etc.)
- Email notifications when shared links are accessed
- Custom URL slugs
- QR code generation for mobile sharing
