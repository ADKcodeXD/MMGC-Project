# Admin Next

MMGC new React admin. This package is intended to replace the old Vben admin in `apps/MMGCBACK` gradually.

## Stack

- React + Vite
- Ant Design 5
- TanStack Query
- React Router
- Zustand
- Axios

## Commands

```powershell
corepack pnpm --filter @mmgc/admin-next run dev
corepack pnpm --filter @mmgc/admin-next run dev:online
corepack pnpm --filter @mmgc/admin-next run build
```

## Deployment

`apps/admin-next/Dockerfile` builds the new admin. GitHub Actions still pushes the same image name:

```text
mmgc-admin:latest
```

The production compose `admin` service can keep the same image name and replace the old admin without service renaming.

## Progress

Last updated: 2026-06-11

Done:

- Created React + Vite + Ant Design 5 admin package.
- Added login page. Login API is `/user/login`.
- Added responsive shell: desktop sider and mobile drawer menu.
- Added Dashboard using `/statistics/dashboardOverview`.
- Added Activities page with activity search and day drawer.
- Added day create, delete, and drag-sort save flow.
- Added Movies page with search, activity/day filters, drawer create/edit, delete, and drag-sort save flow.
- Added Cloud Ops page for Qiniu/CDN/storage monitoring entry.
- Added `apps/admin-next/Dockerfile`.
- Updated GitHub workflow so `mmgc-admin:latest` is built from `apps/admin-next`.

Verified:

- `corepack pnpm --filter @mmgc/admin-next run build` passed.
- Docker build attempted with `docker build -f apps/admin-next/Dockerfile -t mmgc-admin-next-test .`, but local Docker Desktop/Linux engine was not running.

Todo:

- Test login against the online API with a real account.
- Migrate full old movie submission fields, Qiniu upload, and AI translation helpers.
- Migrate activity edit, site config, member selection, and upload components.
- Add route-level lazy loading. Current bundle has a Vite warning for chunks larger than 500 kB.
- Verify Docker build for `apps/admin-next/Dockerfile`.

## Design Rules

- Keep the old `apps/MMGCBACK` available as fallback until the new admin covers production workflows.
- Prefer dense, operational screens over decorative template pages.
- Mobile must support key operations without overflow.
- Video cards must use stable aspect ratios and truncated text.
- AI helpers must preview or fill empty fields first, not overwrite manual content silently.
