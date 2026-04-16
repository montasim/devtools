# Authentication-Gate Saved and Shared Tabs Design

**Date:** 2026-04-16
**Status:** Approved
**Author:** Claude (Sonnet 4.6)

## Overview

Add authentication-aware conditional rendering to the Saved and Shared tabs across all tools (base64, json, text). When users are not authenticated, show a login prompt instead of making unnecessary API calls that return 401 errors.

## Problem Statement

Currently, the Saved and Shared tabs are always visible and make API calls immediately upon mounting, regardless of authentication status. This results in:

- Unnecessary API requests to `/api/saved/user` and `/api/share/user`
- 401 errors returned for unauthenticated users
- Error toasts displayed to users who aren't logged in
- Poor user experience

## Requirements

1. **Hide API calls from unauthenticated users** - Prevent React Query from executing when user is not logged in
2. **Show helpful login prompt** - Display "Please login to access this feature" message with a login button
3. **Redirect back after login** - After successful login, redirect users to the tab they were trying to access
4. **Maintain existing authenticated experience** - No changes to the current flow for logged-in users
5. **Apply consistently across all tools** - Base64, JSON, and Text tools should all behave the same way

## Architecture

### Component Changes

#### 1. SavedTab Component (`components/shared/saved-tab.tsx`)

- Add `useAuth()` hook to access `user` and `loading` states
- Wrap React Query with `enabled: !!user` to prevent API calls when unauthenticated
- Add conditional rendering: if `!user && !loading`, show login prompt instead of content
- Keep all existing functionality for authenticated users

#### 2. SharedTab Component (`components/shared/shared-tab.tsx`)

- Same changes as SavedTab
- Add `useAuth()` hook
- Wrap React Query with `enabled: !!user`
- Show login prompt when unauthenticated

#### 3. New AuthPrompt Component (`components/shared/auth-prompt.tsx`)

- Reusable component for displaying login prompt
- Props:
    - `featureName`: Name of the feature (e.g., "Saved Items", "Shared Links")
    - `currentPath`: Current URL path with query parameters for redirect
- Displays:
    - Lock icon (Lucide `Lock` icon)
    - Message: "Please login to access [featureName]"
    - Login button with link to `/login?redirect={currentPath}`

#### 4. Login Page Update (`app/login/page.tsx`)

- Accept optional `redirect` query parameter
- After successful login, redirect to the `redirect` URL
- Fallback to existing `/json?tab=diff` if no redirect provided

### Data Flow

#### Unauthenticated User Flow:

1. User clicks on "Saved" or "Shared" tab
2. Tab component renders with `useAuth()` → `user = null`, `loading = false`
3. React Query query is disabled (`enabled: !!user` evaluates to `false`)
4. Login prompt displays instead of tab content
5. User clicks "Login" button → navigates to `/login?redirect=/base64?tab=saved`

#### Login & Redirect Flow:

1. User completes login on `/login` page
2. On success, login page reads `redirect` query parameter
3. If `redirect` exists, router pushes to that URL
4. If no `redirect`, falls back to existing hardcoded `/json?tab=diff`
5. User returns to the original tab they were trying to access

#### Authenticated User Flow:

1. Tab component renders with `useAuth()` → `user = {...}`, `loading = false`
2. React Query executes normally (`enabled: !!user` evaluates to `true`)
3. Tab content loads normally
4. No changes to existing authenticated experience

### Authentication State Handling

#### Loading State:

- Show "Loading..." message while checking authentication status
- Prevents flash of login prompt for authenticated users on page load
- Uses existing `loading` state from `useAuth()` hook

#### Race Condition Prevention:

- React Query's `enabled` option ensures query only runs after auth check completes
- Query won't execute even if user becomes authenticated later (requires manual refetch or component remount)
- This is acceptable since switching tabs will remount the component

#### Auth State Changes:

- If user logs out while viewing saved/shared tab → component shows login prompt
- If user logs in while on saved/shared tab → component needs refresh (can switch tabs or page reload)
- No automatic refresh needed since login redirects away from the page

## Implementation Details

### AuthPrompt Component Structure:

```tsx
interface AuthPromptProps {
    featureName: string;
    currentPath: string;
}

export function AuthPrompt({ featureName, currentPath }: AuthPromptProps) {
    const redirectUrl = `/login?redirect=${encodeURIComponent(currentPath)}`;

    return (
        <EmptyState icon={Lock} title="Authentication Required">
            <p className="text-sm text-muted-foreground mb-4">
                Please login to access {featureName}
            </p>
            <Button onClick={() => router.push(redirectUrl)}>Login to Access</Button>
        </EmptyState>
    );
}
```

### React Query Enabled Pattern:

```tsx
const { data, isLoading, error } = useQuery({
    queryKey: ['saved-items', queryKey],
    queryFn: async () => {
        const response = await fetch(`/api/saved/user?pageName=${pageName}`);
        if (!response.ok) {
            throw new Error('Failed to fetch saved items');
        }
        return response.json();
    },
    enabled: !!user, // Only run when authenticated
});
```

### URL Construction for Redirect:

```tsx
const pathname = usePathname();
const searchParams = useSearchParams();
const currentPath = `${pathname}?${searchParams.toString()}`;
```

### Login Page Redirect Logic:

```tsx
// In login page
const router = useRouter();
const searchParams = useSearchParams();
const redirect = searchParams.get('redirect');

async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await login(email, password);
    toast.success('Login successful');
    router.push(redirect || '/json?tab=diff');
}
```

## Files to Modify

1. `components/shared/saved-tab.tsx` - Add auth check and conditional rendering
2. `components/shared/shared-tab.tsx` - Add auth check and conditional rendering
3. `components/shared/auth-prompt.tsx` - Create new component
4. `app/login/page.tsx` - Add redirect parameter support

## Testing Checklist

- [ ] Unauthenticated user sees login prompt on Saved tab
- [ ] Unauthenticated user sees login prompt on Shared tab
- [ ] No API calls made when user is not authenticated
- [ ] Login button redirects to login page with correct redirect URL
- [ ] After login, user is redirected back to the original tab
- [ ] Authenticated users see no change in behavior
- [ ] Loading state displays correctly during auth check
- [ ] Works consistently across base64, json, and text tools
- [ ] Redirect fallback works if no redirect parameter provided
- [ ] No console errors or warnings

## Success Criteria

- No API calls to saved/shared endpoints for unauthenticated users
- Clean, helpful login prompt with clear call-to-action
- Seamless redirect flow after login
- Zero regression for authenticated users
- Consistent behavior across all tools

## Edge Cases

1. **User logs out while viewing saved/shared tab** - Component should show login prompt immediately
2. **User logs in on a different tab** - When switching to saved/shared, it should load normally
3. **Bookmark with direct tab link** - If user bookmarks `/base64?tab=saved`, they should see login prompt when not authenticated
4. **Session expires while viewing tab** - Component should handle gracefully (existing error handling)
5. **Redirect URL is malformed** - Login page should use fallback if redirect is invalid

## Future Enhancements

- Consider adding "Sign up" button alongside login button for new users
- Could add item count badges on tab buttons for authenticated users
- Might want to cache redirect URL in localStorage for more persistent flow
- Could add analytics to track how many users reach the login prompt from these tabs
