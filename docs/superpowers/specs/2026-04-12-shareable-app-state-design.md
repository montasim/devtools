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
  viewCount    Int      @default(0)
  updatedAt    DateTime @updatedAt
  createdAt    DateTime @default(now())

  content      SharedContent @relation

  @@index([pageType])
}
```

### `shared_content` Table

```prisma
model SharedContent {
  id        String   @id @default(cuid())
  linkId    String   @unique
  state     Json                              // Page-specific state as JSON
  link      SharedLink @relation(fields: [linkId], references: [id])
}
```

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

**Response:**

```typescript
{
  id: string,
  shortUrl: string,  // /text/cls123abc
  fullUrl: string   // https://domain.com/text/cls123abc
}
```

### GET /api/share/:id

Retrieve shared link metadata (without content)

**Response:**

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

### POST /api/share/:id/access

Access shared content (handles password validation)

**Request:**

```typescript
{
  password?: string
}
```

**Response:**

```typescript
{
  state: AppPageState,
  linkId: string
}
```

**Errors:**

- `PASSWORD_REQUIRED` - Password needed but not provided
- `INVALID_PASSWORD` - Wrong password
- `LINK_EXPIRED` - Link has expired
- `NOT_FOUND` - Link doesn't exist

### PATCH /api/share/:id

Update existing shared link

**Request:**

```typescript
{
  state?: AppPageState,
  title?: string,
  expiresAt?: string,
  password?: string | null  // null = remove password
}
```

**Response:**

```typescript
{
    updatedAt: string;
}
```

### DELETE /api/share/:id

Delete shared link

**Response:**

```typescript
{
    success: true;
}
```

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
