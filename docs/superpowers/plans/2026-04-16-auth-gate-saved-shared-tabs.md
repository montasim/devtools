# Authentication-Gate Saved and Shared Tabs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add authentication-aware conditional rendering to Saved and Shared tabs across all tools, preventing unnecessary API calls for unauthenticated users and providing a seamless login redirect flow.

**Architecture:** Create a reusable AuthPrompt component and integrate it into existing SavedTab and SharedTab components. Use React Query's `enabled` option to prevent API calls when unauthenticated. Update login page to support redirect parameter.

**Tech Stack:** React, Next.js 16, React Query (@tanstack/react-query), TypeScript, Tailwind CSS, Lucide Icons, existing AuthContext

---

## File Structure

```
components/shared/
  auth-prompt.tsx              # NEW - Reusable login prompt component
  saved-tab.tsx                # MODIFY - Add auth check and conditional rendering
  shared-tab.tsx               # MODIFY - Add auth check and conditional rendering
app/login/
  page.tsx                     # MODIFY - Add redirect parameter support
```

**Decomposition rationale:**

- `auth-prompt.tsx`: Single responsibility - display login prompt with redirect. Reusable across both saved and shared tabs.
- `saved-tab.tsx` & `shared-tab.tsx`: Each handles its own data fetching and UI, but now with auth gating.
- `login/page.tsx`: Minimal change to support redirect parameter.

---

## Task 1: Create AuthPrompt Component

**Files:**

- Create: `components/shared/auth-prompt.tsx`

- [ ] **Step 1: Create the AuthPrompt component file**

```tsx
'use client';

import { useRouter } from 'next/navigation';
import { Lock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';

interface AuthPromptProps {
    featureName: string;
    currentPath: string;
}

export function AuthPrompt({ featureName, currentPath }: AuthPromptProps) {
    const router = useRouter();
    const redirectUrl = `/login?redirect=${encodeURIComponent(currentPath)}`;

    const handleLoginClick = () => {
        router.push(redirectUrl);
    };

    return (
        <EmptyState icon={Lock} title="Authentication Required">
            <p className="text-sm text-muted-foreground mb-4">
                Please login to access {featureName}
            </p>
            <Button onClick={handleLoginClick}>Login to Access</Button>
        </EmptyState>
    );
}
```

- [ ] **Step 2: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: No TypeScript errors

- [ ] **Step 3: Commit**

```bash
git add components/shared/auth-prompt.tsx
git commit -m "feat: add reusable AuthPrompt component for authentication-gated content"
```

---

## Task 2: Update SavedTab with Auth Check

**Files:**

- Modify: `components/shared/saved-tab.tsx`

- [ ] **Step 1: Add useAuth import and hook usage**

Add at the top of the file (after existing imports):

```tsx
import { useAuth } from '@/hooks/useAuth';
```

Add inside the SavedTab component function (after the queryClient declaration):

```tsx
const { user, loading: authLoading } = useAuth();
```

- [ ] **Step 2: Add React Query enabled option**

Modify the useQuery call to add the `enabled` option. Find the existing useQuery (around line 60) and update it:

```tsx
const {
    data: savedItems = [],
    isLoading,
    error,
} = useQuery({
    queryKey: ['saved-items', queryKey],
    queryFn: async () => {
        const response = await fetch(`/api/saved/user?pageName=${pageName}`);
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('You must be logged in to view your saved items');
            }
            throw new Error('Failed to fetch saved items');
        }
        return response.json() as Promise<SavedItem[]>;
    },
    enabled: !!user, // Only run when authenticated
});
```

- [ ] **Step 3: Add pathname and searchParams hooks for redirect URL**

Add to the imports at the top:

```tsx
import { usePathname, useSearchParams } from 'next/navigation';
```

Add inside the SavedTab component function (after useAuth call):

```tsx
const pathname = usePathname();
const searchParams = useSearchParams();
const currentPath = `${pathname}?${searchParams.toString()}`;
```

- [ ] **Step 4: Add conditional rendering for auth prompt**

Add after the error handling useEffect (around line 82), before the return statement:

```tsx
// Show auth prompt if not authenticated
if (!user && !authLoading) {
    return <AuthPrompt featureName="Saved Items" currentPath={currentPath} />;
}
```

- [ ] **Step 5: Update loading state to check auth**

Modify the loading check in the return statement (around line 178). Change:

```tsx
{isLoading ? (
```

To:

```tsx
{isLoading || authLoading ? (
```

- [ ] **Step 6: Add AuthPrompt import**

Add to the imports at the top:

```tsx
import { AuthPrompt } from '@/components/shared/auth-prompt';
```

- [ ] **Step 7: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: No TypeScript errors

- [ ] **Step 8: Commit**

```bash
git add components/shared/saved-tab.tsx
git commit -m "feat: add authentication gate to SavedTab component"
```

---

## Task 3: Update SharedTab with Auth Check

**Files:**

- Modify: `components/shared/shared-tab.tsx`

- [ ] **Step 1: Add useAuth import and hook usage**

Add at the top of the file (after existing imports):

```tsx
import { useAuth } from '@/hooks/useAuth';
```

Add inside the SharedTab component function (after the useState declarations):

```tsx
const { user, loading: authLoading } = useAuth();
```

- [ ] **Step 2: Add React Query enabled option**

Modify the useQuery call to add the `enabled` option. Find the existing useQuery (around line 60) and update it:

```tsx
const {
    data: sharedItems = [],
    isLoading,
    error,
    refetch,
} = useQuery({
    queryKey: ['user-shares', queryKey],
    queryFn: async () => {
        const response = await fetch(`/api/share/user?pageName=${pageName}`);
        if (!response.ok) {
            if (response.status === 401) {
                throw new Error('You must be logged in to view your shares');
            }
            throw new Error('Failed to fetch shares');
        }
        return response.json() as Promise<SharedItem[]>;
    },
    enabled: !!user, // Only run when authenticated
});
```

- [ ] **Step 3: Add pathname and searchParams hooks for redirect URL**

Add to the imports at the top:

```tsx
import { usePathname, useSearchParams } from 'next/navigation';
```

Add inside the SharedTab component function (after useAuth call):

```tsx
const pathname = usePathname();
const searchParams = useSearchParams();
const currentPath = `${pathname}?${searchParams.toString()}`;
```

- [ ] **Step 4: Add conditional rendering for auth prompt**

Add after the error handling useEffect (around line 86), before the return statement:

```tsx
// Show auth prompt if not authenticated
if (!user && !authLoading) {
    return <AuthPrompt featureName="Shared Links" currentPath={currentPath} />;
}
```

- [ ] **Step 5: Update loading state to check auth**

Modify the loading check in the return statement (around line 175). Change:

```tsx
{isLoading ? (
```

To:

```tsx
{isLoading || authLoading ? (
```

- [ ] **Step 6: Add AuthPrompt import**

Add to the imports at the top:

```tsx
import { AuthPrompt } from '@/components/shared/auth-prompt';
```

- [ ] **Step 7: Remove error toast for 401 errors**

The error toast is no longer needed since we're preventing the API call. Remove or comment out the error handling useEffect (around line 81-86):

```tsx
// Handle loading and error states
// useEffect(() => {
//     if (error) {
//         const errorMessage = error instanceof Error ? error.message : 'Failed to fetch shares';
//         toast.error(errorMessage);
//     }
// }, [error]);
```

Note: Keep the error variable in useQuery for React Query's internal handling, but don't display it to users.

- [ ] **Step 8: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: No TypeScript errors

- [ ] **Step 9: Commit**

```bash
git add components/shared/shared-tab.tsx
git commit -m "feat: add authentication gate to SharedTab component"
```

---

## Task 4: Update Login Page with Redirect Support

**Files:**

- Modify: `app/login/page.tsx`

- [ ] **Step 1: Extract redirect parameter from searchParams**

Add after the existing `const router = useRouter();` line (around line 17):

```tsx
const searchParams = useSearchParams();
const redirect = searchParams.get('redirect');
```

- [ ] **Step 2: Add useSearchParams import**

Add to the imports at the top:

```tsx
import { useSearchParams } from 'next/navigation';
```

- [ ] **Step 3: Update handleSubmit to use redirect parameter**

Modify the handleSubmit function to use the redirect parameter (around line 23-36):

```tsx
async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
        await login(email, password);
        toast.success('Login successful');
        // Use redirect parameter if provided, otherwise fallback to default
        router.push(redirect || '/json?tab=diff');
    } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Login failed');
    } finally {
        setLoading(false);
    }
}
```

- [ ] **Step 4: Add basic redirect URL validation (optional but recommended)**

Add a helper function to validate the redirect URL before using it (add before the LoginPage component):

```tsx
function isValidRedirect(url: string | null): boolean {
    if (!url) return false;
    try {
        const parsed = new URL(url, window.location.origin);
        // Only allow relative URLs or URLs on the same domain
        return parsed.origin === window.location.origin;
    } catch {
        return false;
    }
}
```

Then update the handleSubmit to use validation:

```tsx
router.push(isValidRedirect(redirect) ? redirect! : '/json?tab=diff');
```

Note: This step is optional but recommended for security. If skipped, use the simpler version from Step 3.

- [ ] **Step 5: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: No TypeScript errors

- [ ] **Step 6: Commit**

```bash
git add app/login/page.tsx
git commit -m "feat: add redirect parameter support to login page"
```

---

## Task 5: Manual Testing and Verification

**Files:**

- No file modifications
- Test all three tools: base64, json, text

- [ ] **Step 1: Start development server**

Run: `npm run dev`
Expected: Server starts on http://localhost:3000

- [ ] **Step 2: Test unauthenticated user flow**

1. Open browser and navigate to http://localhost:3000/base64?tab=saved
2. Verify: Login prompt is displayed (not error toast)
3. Open browser DevTools Network tab
4. Verify: No API call to `/api/saved/user` was made
5. Click "Login to Access" button
6. Verify: Redirected to `/login?redirect=/base64?tab=saved`

- [ ] **Step 3: Test Shared tab unauthenticated flow**

1. Navigate to http://localhost:3000/json?tab=shared
2. Verify: Login prompt is displayed
3. Open DevTools Network tab
4. Verify: No API call to `/api/share/user` was made
5. Click "Login to Access" button
6. Verify: Redirected to `/login?redirect=/json?tab=shared`

- [ ] **Step 4: Test login redirect flow**

1. On the login page (with redirect parameter), enter credentials and login
2. Verify: After successful login, redirected back to the original tab
3. Verify: Saved/Shared tab now loads with data

- [ ] **Step 5: Test authenticated user flow**

1. Logout and login again (without redirect parameter)
2. Navigate to any tool's Saved tab (e.g., /base64?tab=saved)
3. Verify: Tab loads normally with data (no login prompt)
4. Navigate to any tool's Shared tab (e.g., /text?tab=shared)
5. Verify: Tab loads normally with data (no login prompt)

- [ ] **Step 6: Test loading state**

1. Open a new incognito/private window
2. Navigate to /base64?tab=saved
3. Verify: See brief loading state before login prompt appears (not a flash)

- [ ] **Step 7: Test all three tools**

Repeat steps 2-5 for all three tools:

- Base64: http://localhost:3000/base64?tab=saved and /base64?tab=shared
- JSON: http://localhost:3000/json?tab=saved and /json?tab=shared
- Text: http://localhost:3000/text?tab=saved and /text?tab=shared

- [ ] **Step 8: Test edge cases**

1. **User logs out while viewing saved/shared tab:**
    - Login, navigate to /base64?tab=saved
    - Open browser console and run: `fetch('/api/auth/logout', {method: 'POST'})`
    - Reload page
    - Verify: Login prompt appears

2. **Direct bookmark access:**
    - Logout
    - Navigate directly to /json?tab=saved
    - Verify: Login prompt appears

3. **Invalid redirect URL:**
    - Navigate to /login?redirect=http://evil.com
    - Login with valid credentials
    - Verify: Redirected to fallback (/json?tab=diff) not evil.com

- [ ] **Step 9: Check console for errors**

1. Open browser DevTools Console tab
2. Navigate through all tabs
3. Verify: No console errors or warnings

- [ ] **Step 10: Commit**

```bash
git add .
git commit -m "test: verify authentication-gate saved/shared tabs implementation"
```

---

## Task 6: Documentation and Cleanup

**Files:**

- No specific file modifications
- Update relevant documentation if needed

- [ ] **Step 1: Update API documentation (if exists)**

Check if there's any documentation about the saved/shared API endpoints and add a note about authentication requirement:

```markdown
## Authentication Requirements

The following endpoints require authentication:

- GET /api/saved/user - Returns user's saved items
- GET /api/share/user - Returns user's shared links

Unauthenticated users will not see these tabs and no API calls will be made.
```

- [ ] **Step 2: Update component documentation (if exists)**

If there's a README or component documentation, update it to mention the auth gating behavior.

- [ ] **Step 3: Final commit**

```bash
git add .
git commit -m "docs: update documentation for authentication-gated tabs"
```

---

## Success Criteria Verification

After completing all tasks, verify:

- [ ] No API calls to `/api/saved/user` or `/api/share/user` for unauthenticated users
- [ ] Clean, helpful login prompt with clear call-to-action displayed
- [ ] Seamless redirect flow after login works correctly
- [ ] Zero regression for authenticated users (everything works as before)
- [ ] Consistent behavior across all three tools (base64, json, text)
- [ ] No console errors or warnings
- [ ] Loading state displays correctly during auth check
- [ ] Redirect fallback works if no redirect parameter provided

---

## Notes for Implementation

**Key dependencies:**

- `@/hooks/useAuth` - Must be imported from the existing auth context
- `@/components/ui/empty-state` - Existing component for consistent UI
- `@/components/ui/button` - Existing button component

**Testing approach:**

- Manual testing is required for this feature since it involves authentication flow and browser navigation
- No unit tests are needed as the logic is straightforward (conditional rendering based on auth state)
- Integration testing would require a full test setup with auth mocking

**Common issues to watch for:**

- Make sure to add `enabled: !!user` to the useQuery options, not as a separate prop
- Don't forget to add `authLoading` to the loading check to prevent flash of login prompt
- Ensure the redirect URL is properly URL-encoded to avoid parsing issues
- The redirect validation function is optional but recommended for security

**Performance considerations:**

- React Query's `enabled` option is the most efficient way to prevent unnecessary API calls
- No additional overhead added to authenticated user flow
- AuthPrompt component is lightweight and only renders when needed
