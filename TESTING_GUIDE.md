# Authentication-Gate Saved/Shared Tabs - Testing Guide

## Prerequisites

1. Start the development server:

```bash
npm run dev
```

2. Open browser to: http://localhost:3000

3. Open Browser DevTools:
    - Network tab (to verify no API calls)
    - Console tab (to check for errors)

---

## Test 1: Unauthenticated User Flow - Saved Tab

**Steps:**

1. Ensure you're logged out (logout if necessary)
2. Navigate to: http://localhost:3000/base64?tab=saved

**Expected Results:**

- ✅ Login prompt is displayed (not error toast)
- ✅ Prompt shows "Authentication Required" with lock icon
- ✅ Prompt shows "Please login to access Saved Items"
- ✅ "Login to Access" button is visible
- ✅ NO API call to `/api/saved/user` in Network tab

**Test the redirect:** 5. Click "Login to Access" button 6. Verify URL changes to: `/login?redirect=/base64?tab=saved`

---

## Test 2: Unauthenticated User Flow - Shared Tab

**Steps:**

1. Navigate to: http://localhost:3000/json?tab=shared

**Expected Results:**

- ✅ Login prompt is displayed
- ✅ Prompt shows "Please login to access Shared Links"
- ✅ "Login to Access" button is visible
- ✅ NO API call to `/api/share/user` in Network tab

**Test the redirect:** 5. Click "Login to Access" button 6. Verify URL changes to: `/login?redirect=/json?tab=shared`

---

## Test 3: Login Redirect Flow

**Steps:**

1. On the login page (with redirect parameter visible in URL)
2. Enter your credentials
3. Click "Sign in"

**Expected Results:**

- ✅ After successful login, redirected back to original tab
- ✅ URL matches the redirect parameter (e.g., `/base64?tab=saved`)
- ✅ Saved/Shared tab now loads with your data
- ✅ No login prompt displayed

---

## Test 4: Authenticated User Flow

**Steps:**

1. Logout, then login again (without redirect parameter)
2. Navigate to: http://localhost:3000/base64?tab=saved
3. Navigate to: http://localhost:3000/text?tab=shared

**Expected Results:**

- ✅ Tab loads normally with your data
- ✅ NO login prompt displayed
- ✅ All functionality works as before
- ✅ No regression in existing features

---

## Test 5: Loading State

**Steps:**

1. Open a new incognito/private window
2. Navigate to: http://localhost:3000/json?tab=saved

**Expected Results:**

- ✅ See brief "Loading..." message
- ✅ Then login prompt appears (not a flash)
- ✅ Smooth transition between states

---

## Test 6: All Three Tools

Test the following for each tool (base64, json, text):

**Base64 Tool:**

- http://localhost:3000/base64?tab=saved
- http://localhost:3000/base64?tab=shared

**JSON Tool:**

- http://localhost:3000/json?tab=saved
- http://localhost:3000/json?tab=shared

**Text Tool:**

- http://localhost:3000/text?tab=saved
- http://localhost:3000/text?tab=shared

**Expected Results for all:**

- ✅ Unauthenticated: Login prompt displayed
- ✅ Authenticated: Tab loads with data
- ✅ No API calls when unauthenticated
- ✅ Consistent behavior across tools

---

## Test 7: Edge Cases

### 7a. User logs out while viewing saved/shared tab

**Steps:**

1. Login, navigate to `/base64?tab=saved`
2. Open browser console
3. Run: `fetch('/api/auth/logout', {method: 'POST'})`
4. Reload page

**Expected Results:**

- ✅ Login prompt appears after reload

### 7b. Direct bookmark access

**Steps:**

1. Logout
2. Navigate directly to: `/json?tab=saved`

**Expected Results:**

- ✅ Login prompt appears

### 7c. Invalid redirect URL

**Steps:**

1. Navigate to: `/login?redirect=http://evil.com`
2. Login with valid credentials

**Expected Results:**

- ✅ Redirected to fallback (`/json?tab=diff`) NOT evil.com

---

## Test 8: Console Errors Check

**Steps:**

1. Keep DevTools Console tab open
2. Navigate through all tabs (base64, json, text)
3. Check both saved and shared tabs

**Expected Results:**

- ✅ NO console errors
- ✅ NO console warnings

---

## Success Criteria Checklist

After completing all tests, verify:

- [ ] No API calls to `/api/saved/user` or `/api/share/user` for unauthenticated users
- [ ] Clean, helpful login prompt displayed with clear call-to-action
- [ ] Seamless redirect flow after login works correctly
- [ ] Zero regression for authenticated users (everything works as before)
- [ ] Consistent behavior across all three tools (base64, json, text)
- [ ] No console errors or warnings
- [ ] Loading state displays correctly during auth check
- [ ] Redirect fallback works if no redirect parameter provided

---

## Reporting Results

After testing, report:

- **Overall Status**: Pass/Fail
- **Tests Passed**: X/8
- **Issues Found**: [List any problems]
- **Screenshot/Video**: [Optional but helpful]
