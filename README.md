# CrediSure Frontend

CrediSure is a React frontend for demonstrating the existing CrediSure FastAPI backend assessment. It provides separate administrator and regular-user experiences and connects to the deployed API; it does not include or modify a backend.

## Technology stack

React 18, TypeScript, Vite, Tailwind CSS 3, React Router 6, Axios, Lucide React, and react-hot-toast.

## Features

- Public welcome, login, and regular-user registration pages.
- Role-aware login and protected routes based on the user returned by `GET /api/v1/auth/me`.
- Administrator dashboard statistics and user management with server-side search, filters, and pagination.
- User details and account activation/deactivation controls, including self-deactivation prevention.
- Regular-user dashboard and read-only profile page.
- Responsive role-aware navigation and API health indicator.
- Session-based access-token storage and session restoration after refresh.

## Application routes

| Route | Access | Purpose |
| --- | --- | --- |
| `/` | Public | Welcome page; signed-in users are sent to their role's dashboard. |
| `/login` | Public | Regular-user login; administrators may also sign in here. |
| `/register` | Public | Create a regular-user account. |
| `/admin/login` | Public | Administrator login and assessment-only demo access information. |
| `/dashboard` | Administrator | Platform dashboard statistics. |
| `/users` | Administrator | Search, filter, paginate, inspect, and update user account status. |
| `/profile` | Authenticated user | Read-only details for the signed-in user. |
| `/my-dashboard` | Regular user | Personal account summary without platform-wide statistics. |
| `/*` | Public | Not-found page. |

## Authentication

- Login uses `POST /api/v1/auth/login`; the frontend then calls `GET /api/v1/auth/me` to load and verify the current user.
- The role returned by the backend controls access and redirects. A regular user cannot access administrator routes; an administrator signing in at `/login` is sent to the administrator dashboard.
- The access token is kept in `sessionStorage` to survive refreshes in the current tab. User passwords and the returned refresh token are not stored.
- A `401` on an authenticated request clears the session and requests sign-in again. The backend does not expose a refresh endpoint, so tokens are not renewed automatically.
- JavaScript-accessible `sessionStorage` is vulnerable to token theft if a cross-site scripting (XSS) flaw exists. A production system should consider backend-managed `httpOnly`, `Secure`, `SameSite` cookies.
- Registration calls `POST /api/v1/auth/register`, creates regular-user accounts only, and returns the user to the login page; it does not automatically sign them in.
- Logout removes the local access token.

## API integration

- Backend: <https://creditsure-assessment-production.up.railway.app>
- Swagger documentation: <https://creditsure-assessment-production.up.railway.app/docs>
- OpenAPI schema: <https://creditsure-assessment-production.up.railway.app/openapi.json>

Set `VITE_API_BASE_URL` to the backend origin in `.env`. The existing Axios client appends `/api/v1` and unwraps the standard API response envelope. Vite environment variables are public in the browser bundle and must not contain secrets.

The API status indicator uses `GET /api/v1/health`. A successful health check confirms only that the health endpoint is reachable, not that every authenticated endpoint is available.

## Assessment-only administrator access

**Demo Administrator Access**

- Email: `admin@credisure.com`
- Password: `Password123@`

These credentials provide administrator access to fictional assessment records. They are displayed only on the administrator login page. This publicly displayed account is appropriate only for the isolated assessment deployment; disable it or rotate its password after review.

## Local setup

Prerequisites: Node.js 18+ and npm.

1. Copy `.env.example` to `.env` and set `VITE_API_BASE_URL` if using a different backend.
2. Install dependencies and start Vite:

```bash
npm install
npm run dev
```

## Build and validation scripts

```bash
npm run typecheck   # TypeScript check
npm run lint        # ESLint
npm run build       # TypeScript check and production build in dist/
npm run preview     # Preview the production build locally
```

## Deployment to Vercel

1. Import the repository into Vercel and select the Vite framework preset.
2. Use `npm run build` as the build command and `dist` as the output directory.
3. Configure `VITE_API_BASE_URL` with the backend origin and deploy.
4. Keep the SPA rewrite in `vercel.json` so direct navigation and refreshes on application routes resolve to `index.html`.
5. Ensure the backend CORS configuration allows the deployed frontend origin.

## Project structure

```text
src/
  api/         Axios client and API functions
  components/  Shared UI and responsive navigation
  context/     Authentication and current-user state
  pages/       Public, administrator, and user pages
  types/       API request and response types
```

## Limitations

- Regular users cannot access administrator endpoints or platform-wide dashboard data.
- Profile information is read-only; self-service profile editing is not supported by the backend.
- Password reset/change and refresh-token renewal are not supported without corresponding backend endpoints.
- The application uses the deployed FastAPI backend; it does not provide mock production data or a local backend.
- The displayed administrator credentials are assessment-only and must be rotated or disabled after review.
- There is no automated frontend test suite; run the typecheck, lint, and build scripts and perform browser/API checks as appropriate.
