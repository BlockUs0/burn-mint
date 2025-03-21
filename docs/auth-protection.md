# Authentication Protection with withAuth HOC

This document explains how to use the `withAuth` Higher Order Component (HOC) to protect routes and components in your application.

## How It Works

The `withAuth` HOC:

1. Automatically checks the validity of JWT tokens stored in `localStorage`
2. Decodes JWT tokens and reads the expiration time
3. Sets up a timer to check token validity every second
4. Redirects to the home page when a token expires or is invalid
5. Shows a toast notification on token expiration

## Using withAuth in Your Components

You can wrap any component with the `withAuth` HOC to make it protected:

```jsx
import withAuth from "@/lib/withAuth";

function MyProtectedComponent() {
  // Your component logic here
  return (
    <div>
      This component is only accessible to authenticated users
    </div>
  );
}

// Export the component wrapped with withAuth
export default withAuth(MyProtectedComponent);
```

## Testing Token Expiration

The application includes a testing utility at `/auth-test` that allows you to:

1. View your current token information
2. Enable mock expiration for testing
3. Set custom expiration times for testing

You can also enable mock expiration programmatically:

```jsx
import { setMockExpiration } from "@/lib/withAuth";

// Enable mock expiration with a 60-second timeout
setMockExpiration(true, 60000);

// Disable mock expiration
setMockExpiration(false);
```

## How to Apply to Specific Routes

Any route that requires authentication should use a component wrapped with the `withAuth` HOC:

```jsx
// In your routing setup
<Route path="/protected-route">
  <ProtectedComponent />
</Route>
```

## How to Apply to All Routes

If you want to protect your entire application, you can wrap your main component or router with the `withAuth` HOC. However, this might not be desirable if you want some routes to be accessible without authentication.

A better approach is to create a layout component that wraps your protected routes:

```jsx
// ProtectedLayout.jsx
import withAuth from "@/lib/withAuth";

function ProtectedLayout({ children }) {
  return <>{children}</>;
}

export default withAuth(ProtectedLayout);

// In your router
<Route path="/protected">
  <ProtectedLayout>
    <ProtectedContent />
  </ProtectedLayout>
</Route>
```

## Notes

- The withAuth HOC checks for a token named `blockus_access_token` in localStorage
- When a token expires, it will clear both `blockus_access_token` and `blockus_user_id` from localStorage
- The default redirect path is the home page ('/')