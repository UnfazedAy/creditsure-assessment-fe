# CrediSure Administration Dashboard (frontend)

A small React frontend that demonstrates the CrediSure FastAPI backend assessment: login, dashboard overview, a searchable/filterable/paginated user table, an API status indicator, and responsive navigation. It consumes the **existing deployed API** only. There is no mock data and no separate backend.

- Backend: https://creditsure-assessment-production.up.railway.app
- Swagger: https://creditsure-assessment-production.up.railway.app/docs

## Stack

React 18, TypeScript, Vite, Tailwind CSS 3, React Router 6, Axios, Lucide icons, react-hot-toast.

## Getting started

Prerequisites: Node.js 18+ and npm.

```bash
npm install
cp .env.example .env     # set VITE_API_BASE_URL if different
npm run dev              # http://localhost:5173
```

Other scripts (from `package.json`):

```bash
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
npm run build       # typecheck + production build into dist/
npm run preview     # serve the production build locally
```

## Environment

| Variable | Purpose |
| --- | --- |
| `VITE_API_BASE_URL` | Backend **origin** (e.g. `https://creditsure-assessment-production.up.railway.app`). The client appends `/api/v1` once; a trailing `/api/v1` in the variable is stripped. |

Vite variables are public in the built bundle. Never put credentials or secrets in them. Admin credentials are entered by the reviewer at the login screen and are not stored in the source.

## Pages

| Route | Purpose |
| --- | --- |
| `/login` | Email/password sign-in (show/hide password, inline validation, backend error display). |
| `/dashboard` | Four statistic cards from `GET /dashboard/overview`, refresh, skeletons, retry. |
| `/users` | Server-side search (400 ms debounce), status and role filters, pagination (5/10/20 per page), details modal, activate/deactivate with confirmation. State is kept in URL query params. |
| `/*` | 404 page. `/` redirects based on auth state. |

## Authentication flow

1. `POST /auth/login` returns tokens in `data`. Only the **access token** is kept (the refresh token is discarded; the backend has no refresh endpoint).
2. The token is stored in `sessionStorage` so a page refresh keeps the session. On load, `GET /auth/me` validates it; the role comes from that response, not from stored data.
3. An Axios interceptor adds `Authorization: Bearer <token>` (the client is bound to the API base URL only).
4. A `401` on an authenticated request clears the session and redirects to `/login` with a "session expired" message. A `403` shows an "Access denied" state.
5. Non-admin accounts are rejected after login with an explanatory message. This is a UX check only; the backend enforces authorization.

**Security note:** `sessionStorage` is readable by any JavaScript on the page, so an XSS flaw could expose the token. This is acceptable for an assessment demo, but a production app should prefer httpOnly, Secure, SameSite cookies set by the backend (plus refresh-token rotation). Passwords are never stored, and tokens are never logged.

## API status indicator

Shown in the top bar. It runs `GET /health` on load, every 60 s while the tab is visible, and on click. States: **Checking…**, **Connected**, **Request in progress** (any in-flight API call), **Request failed** (last authenticated call failed), **Unavailable** (health check failed). A healthy `/health` only means that endpoint is reachable, not that every protected route works.

## Responsive navigation

- **≥1024px:** persistent sidebar with labels, user info and logout.
- **768–1023px:** collapsed icon rail (labels via tooltip/aria).
- **<768px:** top bar with a hamburger that opens a drawer. The drawer traps focus, closes on Escape, backdrop click, close button or link selection, and locks page scroll.

## Project structure

```
src/
  api/         client.ts (Axios, interceptors, errors), auth.ts, users.ts, dashboard.ts
  components/  layout/ (Sidebar, MobileNav, DashboardLayout), ApiStatus, Modal, ...
  context/     AuthContext.tsx
  hooks/       useModalBehavior.ts
  pages/       LoginPage, DashboardPage, UsersPage, NotFoundPage
  types/       api.ts
```

## Deploying to Vercel

1. Push the project to a Git repository and import it in Vercel (framework preset: **Vite**; build `npm run build`; output `dist`).
2. Add the environment variable `VITE_API_BASE_URL` = your backend origin, then deploy.
3. `vercel.json` already contains the SPA rewrite so deep links such as `/users` work after refresh.

### CORS

The browser calls the API cross-origin, so the FastAPI app must allow the frontend origin. If you see CORS errors in the console, update the backend (this project does not modify it):

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://<your-app>.vercel.app", "http://localhost:5173"],
    allow_methods=["GET", "POST", "PATCH", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)
```

## Known limitations

- No refresh-token flow (not provided by the backend); an expired token returns the user to login.
- No user deletion, role editing or user creation UI (not supported by the admin API).
- Dashboard statistics refresh on page load, on the Refresh button, and when returning to the page after a status change; there is no live push.
- No automated test suite; verification is via typecheck, lint, build and manual checks.
