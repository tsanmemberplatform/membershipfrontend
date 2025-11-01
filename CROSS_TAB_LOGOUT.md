# Cross-Tab Logout Implementation

## Problem

When a user logs in on one tab, their token is stored in localStorage and overwrites any previous token. However, other tabs with different users still think they're authenticated, leading to API requests being made with the wrong token.

## Solution

Implemented cross-tab logout functionality that automatically logs out users in other tabs when a new user logs in.

## How It Works

### 1. Token Change Detection

- The auth slice now tracks the current token and listens for localStorage changes
- When localStorage 'authToken' changes, it compares with the current user's token
- If different, it dispatches a custom event to trigger logout in other tabs

### 2. Cross-Tab Communication

- Uses browser's `storage` event to detect localStorage changes across tabs
- Dispatches custom `auth:cross-tab-logout` event when token changes
- Each tab listens for this event and logs out the current user

### 3. User Experience

- When logged out due to cross-tab activity, user sees a clear message: "You have been logged out because another user logged in on this browser."
- User is redirected to login page with the message displayed via SweetAlert
- Message automatically disappears after 4 seconds

## Files Modified

### `src/store/slices/authSlice.ts`

- Added cross-tab token change detection
- Added `crossTabLogout` reducer
- Updated `loginSuccess` to track current token

### `src/hooks/useCrossTabAuth.ts` (New)

- Dedicated hook for cross-tab authentication synchronization
- Handles logout event and navigation
- Prevents redirect loops on login page

### `src/App.tsx`

- Initialized cross-tab auth hook at app level

### `src/pages/Login.tsx`

- Added support for displaying cross-tab logout messages
- Uses location state to show appropriate notifications

## Usage

The functionality is automatically active once implemented. No additional setup required.

## Testing

1. Open two browser tabs
2. Log in as User A in Tab 1
3. Log in as User B in Tab 2
4. Tab 1 should automatically log out User A and show the message
5. Both tabs should now be on the login page

## Benefits

- Prevents API requests with wrong tokens
- Clear user communication about logout reason
- Maintains security by ensuring only one user per browser session
- Seamless user experience with automatic cleanup
