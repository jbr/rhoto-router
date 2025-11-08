# rhoto-router

A lightweight, declarative React router with first-class support for nested routing and relative navigation.

## Installation

```bash
npm install rhoto-router
# or
yarn add rhoto-router
```

## Core Concepts

### Path Matching & Consumption

Unlike many routers, `rhoto-router` uses a **path consumption** model. Each `Route` component matches against the remaining unmatched portion of the URL path, then "consumes" the matched part, passing only the remainder to its children. This makes nested routing intuitive and composable.

```tsx
// URL: /users/123/posts/456
<Route path="/users/:userId">
  {/* This Route sees: /posts/456 */}
  <Route path="/posts/:postId">
    {/* This Route sees: / */}
  </Route>
</Route>
```

### Subroute Tracking

The router maintains a tree structure of all mounted routes and their match status. This enables the `NotFound` component to detect when no routes match at any level of nesting.

## Components

### `<Router>`

The root router component. Wrap your app with this to enable routing.

```tsx
import { Router } from 'rhoto-router';

function App() {
  return (
    <Router>
      <YourApp />
    </Router>
  );
}
```

**Features:**
- Listens to browser navigation events (`pushState`, `popstate`)
- Provides router context to all children
- Parses query parameters automatically

### `<Route>`

Matches a URL pattern and renders children only if the pattern matches.

```tsx
<Route path="/about">
  <AboutPage />
</Route>

<Route path="/users/:id">
  {(params) => <UserProfile userId={params.id} />}
</Route>

<Route path="/dashboard" exact>
  {/* Only matches /dashboard, not /dashboard/settings */}
</Route>
```

**Props:**
- `path` (string): URL pattern to match, using [path-to-regexp](https://github.com/pillarjs/path-to-regexp) syntax
  - `/users/:id` - matches `/users/123`, extracts `id: "123"`
  - `/posts/:id(\\d+)` - matches only numeric IDs
  - `/files/:path*` - matches multiple path segments
- `exact` (boolean): If true, path must match exactly (no trailing unmatched parts)
- `children` (ReactNode | Function): Content to render when matched
  - Can be a function that receives `params` object containing both route params and query params

**Path Patterns:**
Uses `path-to-regexp`, which supports:
- Named parameters: `:id`, `:name`
- Optional parameters: `:id?`
- Zero or more: `:path*`
- One or more: `:path+`
- Custom regex: `:id(\\d+)`

### `<Link>`

Navigation component that prevents full page reloads.

```tsx
<Link href="/about">About</Link>

<Link href="/posts/123" className="nav-link" currentClassName="active">
  Post 123
</Link>

<Link href="./settings">
  {/* Relative to current path */}
  Settings
</Link>

<Link href="../">
  {/* Go up one level */}
  Back
</Link>

<Link href="/profile" exact>
  {({ onClick, current, url }) => (
    <CustomButton
      onClick={onClick}
      active={current}
      href={url}
    />
  )}
</Link>
```

**Props:**
- `href` (string): Destination path
  - Absolute: `/about`, `/users/123`
  - Relative: `./settings`, `../parent`
- `className` (string): CSS class to apply
- `currentClassName` (string): CSS class when link matches current URL (default: `"active"`)
- `exact` (boolean): Only apply current styling if exact match
- `onClick` (function): Additional click handler
- `children` (ReactNode | Function): Link content
  - Function receives `{ onClick, current, url }`
- Any other props are passed through to the `<a>` element

### `<Redirect>`

Declaratively navigate to a new URL.

```tsx
<Route path="/old-path">
  <Redirect to="/new-path" />
</Route>
```

Uses `replaceState`, so the redirect doesn't create a new history entry.

### `<NotFound>`

Renders children only when no routes have matched.

```tsx
<Router>
  <Route path="/home"><Home /></Route>
  <Route path="/about"><About /></Route>

  <NotFound>
    <h1>404 - Page Not Found</h1>
  </NotFound>
</Router>
```

The `NotFound` component checks the entire subroute tree to determine if any route matched anywhere in the component tree. It will render if:
- No routes matched at all
- A route explicitly called the `notFound()` function (available via `useRoute`)

## Hooks

### `useRouter()`

Access the router context from any component. **This is the most common hook** - use it whenever you need route information inside a component that's wrapped in a `<Route>`.

```tsx
import { useRouter } from 'rhoto-router';

function MyComponent() {
  const {
    fullPath,      // Current pathname: "/users/123/posts"
    query,         // Parsed query params: { sort: "date", filter: "all" }
    params,        // Combined route + query params
    navigate,      // Function to navigate programmatically
    update         // Force a router update
  } = useRouter();

  const handleClick = () => {
    navigate('/about', { ref: 'nav' }); // Navigate to /about?ref=nav
  };

  return <div>Current path: {fullPath}</div>;
}
```

**When to use `useRouter()`:**
- Inside components wrapped by `<Route>`
- When you need current route information (path, params, query)
- When you need to navigate programmatically

**Context Value:**
- `fullPath` (string): Complete current pathname
- `query` (object): Parsed query string parameters
- `params` (object): All parameters (route params + query params)
- `unmatched` (string): Portion of path not yet matched by any Route
- `navigate(path, query?, options?)`: Navigate to a new path
  - `path`: Destination pathname
  - `query`: Query parameters object (will be stringified)
  - `options.replace`: Use `replaceState` instead of `pushState`

### `useRoute(pathOrOptions)`

Conditionally match against the current unmatched path portion. Returns router context if matched, `null` if not. **Use this for conditional rendering** based on URL patterns.

**When to use `useRoute()`:**
- For components that conditionally render based on URL matching
- When the component is **not** wrapped in a `<Route>`
- For route-based conditional logic

**Important:** Don't use `useRoute()` inside a component that's already wrapped in `<Route>` with the same path pattern - the parent `<Route>` has already consumed that path segment. Instead, use `useRouter()` to access the matched params.

```tsx
import { useRoute } from 'rhoto-router';

// ✅ Good: Conditional rendering without wrapping Route
function AdminPanel() {
  const route = useRoute('/admin/:section');

  if (!route) return null;  // Not on /admin/* path

  return (
    <div>
      <h1>Admin Section: {route.params.section}</h1>
      <button onClick={() => route.navigateParams({ section: 'users' })}>
        Switch to Users
      </button>
    </div>
  );
}

// Used anywhere in your app without a Route wrapper
function App() {
  return (
    <Router>
      <HomePage />
      <AdminPanel />  {/* Shows only when URL matches */}
    </Router>
  );
}
```

**Comparison:**
```tsx
// With <Route> wrapper - use useRouter()
<Route path="/:userId">
  <UserProfile />
</Route>

function UserProfile() {
  const { params } = useRouter();  // ✅ Correct
  return <div>User {params.userId}</div>;
}

// Without <Route> wrapper - use useRoute()
function UserProfile() {
  const route = useRoute('/:userId');  // ✅ Correct
  if (!route) return null;
  return <div>User {route.params.userId}</div>;
}
```

**Arguments:**
- `pathOrOptions`: String path or options object
  - String: `useRoute('/users/:id')`
  - Object: `useRoute({ path: '/users/:id', exact: true })`

**Returns:** `RouterContextValue | null`
- `null` if path doesn't match
- Router context object if matched, with additional fields:
  - `routeParams`: Parameters extracted from this route only
  - `params`: All parameters (route params + query params)
  - `navigateParams(newParams)`: Update route/query params intelligently
    - If param name matches a route parameter, updates the URL path
    - If param name is new, adds it as a query parameter
  - `fullMatchedRoute`: The accumulated matched path pattern
  - `matches`: Array of all parameter matches from all parent routes
  - `unmatched`: Remaining path for child routes
  - `notFound()`: Mark this route as not found (triggers NotFound component)

## Example Usage

### Basic Routing

```tsx
import { Router, Route, Link, NotFound } from 'rhoto-router';

function App() {
  return (
    <Router>
      <nav>
        <Link href="/">Home</Link>
        <Link href="/about">About</Link>
        <Link href="/users">Users</Link>
      </nav>

      <Route path="/" exact>
        <Home />
      </Route>

      <Route path="/about">
        <About />
      </Route>

      <Route path="/users">
        <Users />
      </Route>

      <NotFound>
        <h1>404 Not Found</h1>
      </NotFound>
    </Router>
  );
}
```

### Nested Routing

```tsx
function App() {
  return (
    <Router>
      <Route path="/users">
        <UsersLayout>
          <Route path="/" exact>
            <UsersList />
          </Route>

          <Route path="/:userId">
            {(params) => (
              <>
                <UserProfile userId={params.userId} />

                {/* Nested further! */}
                <Route path="/posts">
                  <UserPosts userId={params.userId} />
                </Route>

                <Route path="/settings">
                  <UserSettings userId={params.userId} />
                </Route>
              </>
            )}
          </Route>
        </UsersLayout>
      </Route>
    </Router>
  );
}

// URL: /users/123/posts
// - First Route matches "/users", unmatched becomes "/123/posts"
// - Second Route matches "/:userId", unmatched becomes "/posts"
// - Third Route matches "/posts", unmatched becomes "/"
```

### Programmatic Navigation

```tsx
function LoginForm() {
  const { navigate } = useRouter();

  const handleSubmit = async (credentials) => {
    await login(credentials);
    navigate('/dashboard', { from: 'login' });
    // Navigates to: /dashboard?from=login
  };

  return <form onSubmit={handleSubmit}>...</form>;
}
```

### Parameter Navigation

```tsx
function UserProfile() {
  const route = useRoute('/users/:userId');

  if (!route) return null;

  const { userId } = route.params;

  const switchUser = (newId) => {
    // Updates the :userId parameter in the URL
    route.navigateParams({ userId: newId });
  };

  const addFilter = (filter) => {
    // Adds a query parameter since 'filter' isn't a route param
    route.navigateParams({ userId, filter });
  };

  return (
    <div>
      <h1>User {userId}</h1>
      <button onClick={() => switchUser('456')}>Switch User</button>
      <button onClick={() => addFilter('active')}>Filter Active</button>
    </div>
  );
}
```

### Relative Links

```tsx
function Dashboard() {
  return (
    <Route path="/dashboard">
      <nav>
        {/* Current path: /dashboard */}
        <Link href="./settings">Settings</Link>
        {/* Links to: /dashboard/settings */}

        <Link href="./profile">Profile</Link>
        {/* Links to: /dashboard/profile */}

        <Link href="../">Back to Home</Link>
        {/* Links to: / */}
      </nav>

      <Route path="/settings"><Settings /></Route>
      <Route path="/profile"><Profile /></Route>
    </Route>
  );
}
```

### Custom Not Found Handling

```tsx
function UserProfile() {
  const route = useRoute('/users/:userId');
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetchUser(route.params.userId).then(user => {
      if (user) {
        setUser(user);
      } else {
        // Mark this route as not found even though it matched
        route.notFound();
      }
    });
  }, [route.params.userId]);

  if (!user) return <div>Loading...</div>;

  return <div>User: {user.name}</div>;
}

// In your app:
<Route path="/users/:userId">
  <UserProfile />
</Route>

<NotFound>
  <h1>User not found</h1>
</NotFound>
```

### Render Props Pattern

```tsx
<Route path="/posts/:postId">
  {({ postId, ...params }) => (
    <PostPage postId={postId} filters={params} />
  )}
</Route>

<Link href="/profile">
  {({ onClick, current, url }) => (
    <CustomNavItem
      onClick={onClick}
      active={current}
      destination={url}
    >
      Profile
    </CustomNavItem>
  )}
</Link>
```

## How It Works

### Path Consumption Model

When the browser navigates to `/users/123/posts`:

1. Router provides `fullPath: "/users/123/posts"` and `unmatched: "/users/123/posts"`
2. First `<Route path="/users">` matches, consuming `/users`
   - Provides new context with `unmatched: "/123/posts"`
3. Child `<Route path="/:userId">` matches, consuming `/123`
   - Provides context with `unmatched: "/posts"` and `params: { userId: "123" }`
4. Child `<Route path="/posts">` matches, consuming `/posts`
   - Provides context with `unmatched: "/"` and `params: { userId: "123" }`

### Query Parameter Handling

Query parameters are automatically parsed using the [`qs`](https://github.com/ljharb/qs) library and merged into the `params` object alongside route parameters.

```tsx
// URL: /users/123?sort=date&filter=active

<Route path="/users/:userId">
  {(params) => {
    console.log(params);
    // { userId: "123", sort: "date", filter: "active" }
  }}
</Route>
```

### Browser History Integration

The router intercepts `window.history.pushState` and `window.onpopstate` to detect navigation without full page reloads. When navigation occurs:

1. The URL is updated via `pushState` (or `replaceState`)
2. Router state updates, triggering a re-render
3. Routes re-evaluate their matches against the new URL
4. Matched routes render, unmatched routes return `null`

## TypeScript Support

Full TypeScript definitions are included. The main types:

```typescript
interface RouterContextValue {
  query: { [index: string]: string };
  fullPath: string;
  matches: Match[];
  unmatched: string;
  params: { [index: string]: string };
  routeParams: { [index: string]: string };
  navigate(path: string, query?: unknown, options?: NavigateOptions): void;
  navigateParams(newParams: { [index: string]: string }): void;
  // ... more properties
}

interface NavigateOptions {
  replace: boolean;
}
```

## Requirements

- React 16.8+ (uses hooks)

## License

MIT