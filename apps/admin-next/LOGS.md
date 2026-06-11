# Admin Next Migration Logs

## 2026-06-11

### Created Migration Package

- Created `apps/admin-next` as the React migration target.
- Added package scripts:
  - `dev`
  - `dev:online`
  - `build`
- Added root scripts:
  - `dev:admin-next`
  - `dev:admin-next-online`
  - `build:admin-next`

### Added Stack

- React + Vite.
- Ant Design 5.
- TanStack Query.
- React Router.
- Zustand.
- Axios.

### Added Core App

- Responsive app shell with desktop sider and mobile drawer.
- Login page using `/user/login`.
- Axios client compatible with old backend response shape.
- JWT local storage.
- Dashboard page using `/statistics/dashboardOverview`.
- Cloud Ops page for Qiniu/CDN/storage monitoring entry.

### Added Activity And Day Management

- Activity list and search.
- Day management drawer.
- Create day.
- Delete day.
- Drag-sort days.

### Added Video Management

- Video list.
- Keyword search.
- Activity and day filters.
- Create/edit drawer with basic fields.
- Delete video.
- Drag-sort videos.
- Added Qiniu direct upload helper:
  - Fetches `/upload/getQiniuToken`.
  - Uploads to `https://up-z2.qiniup.com`.
  - Returns CDN URL using `VITE_UPLOAD_CDN`.

### Deployment Changes

- Added `apps/admin-next/Dockerfile`.
- Updated `.github/workflows/deploy.yml` so `mmgc-admin:latest` builds from `apps/admin-next`.
- Kept production image name and compose service name unchanged for seamless replacement.

### Validation

- `corepack pnpm --filter @mmgc/admin-next run build` passed.
- Docker build was attempted but local Docker Desktop/Linux engine was not running.

### Known Gaps

- Full old movie form schema is not yet migrated.
- Qiniu upload needs old path parity, file guards, and better progress/retry UX.
- Activity edit/create is not yet migrated.
- Site config is not yet migrated.
- User info and permission display are not yet migrated.
- Route-level lazy loading is not yet added; current build has a large chunk warning.

### Documentation Update

- Added `apps/admin-next/AGENTS.md`.
- Added `apps/admin-next/TODO.md` as the canonical migration checklist.
- Added `apps/admin-next/LOGS.md` as persistent progress history.
- Captured UI direction:
  - rounded modern UI,
  - light and calm colors,
  - no dominant very-dark palette,
  - more reusable split components.
- Re-ran `corepack pnpm --filter @mmgc/admin-next run build`: passed.

### Completed Phase 2: Missing Admin Pages & Auth Enhance

- Enhanced Auth: Added user info pulling, role tag display in the header, logout button, and 401 unauth redirect logic.
- Added Sponsors Management Page: list, search, and form to upload logos.
- Added Members Management Page: list, search, and role adjustments with visual color tags.
- Added Statistics & Rank Page: author info and medal rank configuration.
- Added Config Page: global configuration form including frontend video watermark toggle (`enableWatermark`).
- Added full Route-Level Lazy Loading (`React.lazy` + `Suspense`) which drastically decreased main chunk size and minimized chunk-size warnings on build.
- `corepack pnpm --filter @mmgc/admin-next run build` completed successfully.

### Completed Phase 3: Activity & Day Management

- Implemented `ActivityEdit.tsx`: an independent page for creating and editing Activities.
  - Basic fields: Time range, Multilingual Names.
  - Visual Resources: Cover, Logo, Background image, Welcome page background video (with Qiniu Upload).
  - Rich Text: Added `@wangeditor/editor-for-react` for multilingual activity descriptions (`desc`).
  - Sponsor Binding: Multiselect dropdown using existing sponsors API.
  - Staff Management: Dynamic array editor for organizers, judges, translators, etc.
- Implemented `VideoSelectDrawer.tsx`: a drawer to search, filter, and batch bind existing videos to a specific Day.
- Enhanced Day Management: Added missing properties `themeName`, `themeDesc`, `themeCover`, `isPublic` to Day edit panel.
- Validated via `corepack pnpm --filter @mmgc/admin-next run build`.

### Completed Phase 4: Migration And Optimization (CloudOps, Uploads, Forms)

- Completed UI modernization across QiniuUpload, Movies, Activities, and CloudOps.
- Replaced drag-and-drop sort on `Movies.tsx` with Card grid and pagination.
- Kept drag-and-drop ordering in `DayEdit.tsx` for bound videos (now transitioning to Grid Drag-and-Drop).
- Optimized `SearchMoviesModal` with intuitive top/bottom UI for Bound/Unbound states.
- Implemented `I18nFormItem` component with one-click AI translation integration.
- Configured ECharts dashboard for CloudOps.

### Started Phase 5: Form Parity, UI Improvements & Drag and Drop

- Addressed missing fields in Activity (`rules`, `timesorother`, `faq`) and Movie (`downloadLinks`, `playLinks`, etc.) to match legacy system (`MMGCBACK`).
- Resolving user feedback regarding Staff UI by transitioning from inline rows to Avatar grid + modal.
- Implementing `@dnd-kit` for drag-and-drop reordering of Staff and DayEdit bound movies.
- Integrating `antd-img-crop` for enhanced Media upload UX.

### Sponsor, Member, Activity List, And Video Library Parity Pass

- Added sponsor detail route `/sponsors/:id` with detail fetch, view/edit toggle, Qiniu logo upload, multilingual fields, update, and delete.
- Added member detail route `/members/:id` with detail fetch, view/edit toggle, avatar upload, role/gender/profile/social fields, optional password reset, update, and delete.
- Simplified sponsor and member list pages so complex editing happens on detail pages instead of cramped drawers.
- Updated activity list to show logo/cover thumbnail directly in the table.
- Updated activity list to show organizer staff tags.
- Added video library quick switch for unbound videos on the current result page.
- Replaced the Movie edit temporary detail workaround with old-compatible `/movie/getMovieDetailAll`.
- Validation: `corepack pnpm --filter @mmgc/admin-next run build` passed. Vite still reports existing large chunk warnings for editor/cloud/upload-related chunks.

### Video Edit And Day Poll Link UX Pass

- Rebuilt `MovieEdit.tsx` into a clean UTF-8 version while keeping the old-backend field model.
- Added Bilibili space shortcut on video edit:
  - accepts `https://space.bilibili.com/<mid>`,
  - calls `/bilibili/userinfo`,
  - fills `authorName`,
  - fills `movieLink.bilibili`,
  - previews the fetched avatar.
- Hardened video detail loading:
  - primary: `/movie/getMovieDetailAll`,
  - fallback: `/movie/getMovieDetail`,
  - final fallback: list search by movie ID.
- Rebuilt `DayEdit.tsx` into a clean UTF-8 version while preserving bound-video management, drag sorting, search modal, and unbind actions.
- Added Day poll links for Twitter/X and other links in addition to Bilibili.
- Rebuilt `ActivityEdit.tsx` into a clean UTF-8 version while preserving Staff/Sponsor/Qiniu/multilingual fields.
- Enlarged fixed footer save buttons on video edit, day edit, and activity edit for better operations UX.
- Validation: `corepack pnpm --filter @mmgc/admin-next run build` passed. Vite still reports existing large chunk warnings.

### Playback Source Field Correction

- Replaced the generic `I18nFormItem` usage for `moviePlaylink`.
- `moviePlaylink.cn/en/jp` is now edited as separate playback sources, not as translatable text.
- Removed AI translation controls from playback source editing.
- Added CN/EN/JP source tabs on video edit.
- Upload and preview now bind to the currently selected playback source tab, so switching sources changes the preview target.
- Validation: `corepack pnpm --filter @mmgc/admin-next run build` passed.

### Scheduling Filter, Sorting, Sponsor Rich Text, And Config Parity

- Moved the "only unbound videos" switch into the Day scheduling movie picker (`SearchMoviesModal`).
- Removed the unbound-only filter from the normal video library list and replaced it with generic sort controls.
- Added sort controls using old backend `sortRule/orderRule` support for Activities, Movies, Sponsors, Members, Statistics, and the Day movie picker.
- Updated sponsor add/detail forms so sponsor description uses rich text, matching Activity detail behavior.
- Restored global config fields:
  - statistics history background via `otherSettings.bgStatistics`,
  - frontend video play switch `isVideoPlay`,
  - legacy `skin` field,
  - raw `otherSettings` JSON editing.
- Validation: `corepack pnpm --filter @mmgc/admin-next run build` passed. Vite still reports existing large chunk warnings.

### Layout, Cloud Ops, And Video Disable Guardrail

- Rebuilt the app shell with clean Chinese menu labels.
- Updated desktop layout so the left menu is fixed and the right content area scrolls independently.
- Improved responsive shell behavior for mobile using `100dvh` and drawer menu.
- Fixed admin-next statistics API path from `/statistics/traffic` to backend-compatible `/statistics/siteTraffic`.
- Rebuilt Cloud Ops page with:
  - date range selector,
  - CDN total traffic,
  - domestic/overseas traffic split,
  - UV totals,
  - storage and cost estimate cards,
  - traffic/UV trend chart,
  - region split chart,
  - site-map status panel,
  - CDN whitelist guardrail warning.
- Added global config "all-site video disabled" intent via `otherSettings.allSiteVideoDisabled`.
- When all-site video disable is enabled, config save also forces `isVideoPlay=false` and writes a pending CDN block plan to `otherSettings.cdnBlockPlan`.
- Important: no Qiniu CDN whitelist policy is actually mutated yet. This still needs a backend operation endpoint with confirmation, audit log, and rollback.
- Added `enableWatermark` to backend Mongoose config schema so the existing config field can persist correctly.
- Validation:
  - `corepack pnpm --filter @mmgc/admin-next run build` passed.
  - `corepack pnpm --filter mmgc_backend run build` passed.

### AI Translation Contract Check

- Checked admin-next translation flow against backend response contract.
- Direct model gateway test without backend reached `https://api.apifast.tech/v1/chat/completions` but returned `401 Unauthorized` / invalid token with the current `OPENAI_API_KEY` environment value.
- Backend response format remains compatible: `/translate/auto` returns `Result.success({ cn, en, jp })`.
- Fixed admin-next `I18nFormItem` because the shared API client already unwraps `Result.data`; the form now reads the returned `I18N` payload directly and keeps a compatibility fallback for old `{ data }` wrappers.
- Cleaned garbled Chinese labels/messages in `I18nFormItem`.
- Typed `translateApi.autoTranslate` as `I18N`.
- Validation: `corepack pnpm --filter @mmgc/admin-next run build` passed. Vite still reports existing large chunk warnings.

### Server-Side Unbound Video Filter

- Added `unboundOnly` to admin-next `PageParams`.
- Updated Day scheduling movie picker to send `/movie/getAllMovie?unboundOnly=true` instead of filtering only the current frontend page.
- Removed frontend unbound filtering from pagination total calculation so server totals remain authoritative.
- Added backend `MoviePageParams.unboundOnly`.
- Updated backend movie list query to match videos with no `activityId` and no `day` when `unboundOnly=true` or `unboundOnly=1`.
- Validation:
  - `corepack pnpm --filter @mmgc/admin-next run build` passed.
  - `corepack pnpm --filter mmgc_backend run build` passed.

### Sponsor Rich Text Display Fix

- Added reusable rich text helpers for sanitized preview and plain-text excerpts.
- Added `RichTextPreview` for read-only rich text rendering.
- Updated sponsor list cards to show a plain-text summary instead of raw HTML tags.
- Rebuilt sponsor detail page with clean Chinese copy and read/edit separation:
  - read mode shows Logo, sponsor name, and rich-text intro preview,
  - edit mode keeps the existing multilingual rich-text editor and Qiniu Logo upload.
- Added responsive rich-text CSS so images, tables, lists, and long links do not overflow.
- Validation: `corepack pnpm --filter @mmgc/admin-next run build` passed. Vite still reports existing large chunk warnings.

### Movie Author Avatar Support

- Added movie-level `authorAvatar` to backend schema, entity, TypeScript type, and AJV validation.
- Updated admin-next video edit form:
  - Bilibili space fetch now fills author name, author avatar, and Bilibili link,
  - author avatar URL can also be manually edited,
  - system author ID input is disabled for now.
- Updated frontend movie types with `authorAvatar`.
- Updated frontend desktop/mobile movie detail and activity movie cards:
  - prefer movie `authorAvatar`, then system member avatar,
  - clicking external author display opens the Bilibili link when present.
- Validation:
  - `corepack pnpm --filter mmgc_backend run build` passed.
  - `corepack pnpm --filter @mmgc/admin-next run build` passed.
  - `corepack pnpm --filter mirai-offcial-website run build` fails on Windows because the existing package script uses Unix shell syntax after `nuxi build`.
  - `corepack pnpm --filter mirai-offcial-website exec nuxi build` passed.

### PV Analytics, Billing Rework, And Schedule Order Fix

- Reused and completed the existing frontend analytics plugin:
  - initial page view is now tracked,
  - route changes continue to report `/statistics/track`.
- Added backend `/statistics/trackOverview`:
  - total PV,
  - total UV by IP,
  - total events,
  - daily PV/UV/click trends,
  - page path Top 20.
- Reworked Qiniu billing constants from the provided June 2026 bill:
  - standard storage: ￥0.115/GB/month with 10GB free quota,
  - low-frequency storage: ￥0.075/GB/month,
  - low-frequency retrieval: ￥0.03/GB,
  - CDN back-to-origin: ￥0.15/GB with standard 10GB free quota,
  - China HTTPS outbound: ￥0.28/GB,
  - Asia overseas HTTPS: ￥0.60/GB,
  - EU/NA HTTPS: ￥0.40/GB,
  - 100GB CDN traffic package: ￥16 fixed cost.
- Rebuilt Cloud Ops page with:
  - PV/UV cards,
  - CDN traffic charts,
  - PV/UV trend charts,
  - page Top table,
  - Qiniu cost pie chart,
  - usage bar chart,
  - detailed billing table by item/category.
- Fixed front/back schedule order consistency:
  - backend `getMovieByActivityId` now sorts by `sortIndex ASC, movieId ASC`,
  - frontend movie detail related list now sorts by `sortIndex ASC`.
- Validation:
  - `corepack pnpm --filter mmgc_backend run build` passed.
  - `corepack pnpm --filter @mmgc/admin-next run build` passed.
  - `corepack pnpm --filter mirai-offcial-website exec nuxi build` passed.

### Completed Phase 5.6: Analytics, Cache Sorting Fix, and Subpath Deployment

- **Analytics Event & PV Tracking**:
  - Added Koa controller and service in backend to store visitor traces under a new MongoDB collection (`tracks`).
  - Added a client-side Nuxt 3 plugin `analytics.client.ts` to automatically log Page Views (PV) on route changes.
  - Implemented specific event tracking (`$track`) for playing videos, liking/unliking, voting, clicking external Bilibili/Twitter poll links, copying share links, and generating/downloading posters.
- **Cache Sorting Fix**:
  - Resolved a local state reversion bug in `DayEdit.tsx` by updating elements' `sortIndex` values directly in the React Query cache on drag-end.
  - Invalidated the query cache on sort mutations to guarantee synchronization with the backend.
- **Old Admin Switch Banner**:
  - Injected an Ant Design Vue Alert banner at the top of the default layout of the legacy admin panel (`apps/MMGCBACK`), prompting users to switch to the new admin system (`/newAdmin`).
- **Base Path Configuration**:
  - Configured Vite base path (`base: '/newAdmin/'`) and React Router basename (`basename="/newAdmin"`) for `admin-next` to support subpath hosting.
  - Fixed absolute links in `DayEdit.tsx` to match the new deployment path.
- **Validation**:
  - `corepack pnpm --filter mmgc_backend run build` completed successfully.
  - `corepack pnpm --filter mirai-offcial-website exec nuxi typecheck` completed successfully.
  - `corepack pnpm --filter @mmgc/admin-next run build` completed successfully.

### Qiniu Billing Adjustment: Metered Usage Only

- Removed the 100GB CDN traffic package fixed cost from Qiniu billing estimation.
- Kept the `trafficPackageCost` response field as `0` for compatibility with existing admin types.
- Updated Cloud Ops default values, billing table, pie chart source data, and operation note so displayed totals are pure usage-based estimates.
- Resource package purchases and package offsets are intentionally excluded from estimated totals.

### Admin Next Responsive Baseline

- Added global responsive layout guards for the React admin:
  - page containers, cards, tabs, forms, tables, and grids now shrink safely on narrow screens,
  - table wrappers get horizontal overflow protection,
  - filter toolbars and page-heading actions wrap and become full-width on mobile,
  - pagination, statistic cards, card headers, and form controls get smaller mobile spacing.
- Replaced fixed inline save bars in activity/day/movie edit pages with a shared `.floating-actions` layout.
- Fixed the floating action bar desktop offset so it no longer overlays the left sidebar, while mobile uses full width.
- Updated the day movie picker drawer so its two-column workspace stacks vertically on mobile.
- Validation: `corepack pnpm --filter @mmgc/admin-next run build` passed.

### Schedule Movie Order Alignment

- Kept Day Edit and the movie picker drawer on the authorized admin `/movie/getAllMovie` endpoint so admin-only fields and unpublished resources remain available.
- Explicitly query bound contest videos with `sortRule: 'sortIndex movieId'` and ascending `orderRule` semantics to match the public frontend display order.
- Added backend default sorting for admin movie list queries scoped by `activityId + day`, so schedule queries default to `sortIndex ASC, movieId ASC` even if a caller forgets to pass sort params.
- When binding a video from the library into a Day, the admin now assigns `sortIndex` to the current list tail (`max(sortIndex) + 1`) so newly added videos do not jump to the front with `sortIndex = 0`.
- Validation:
  - `corepack pnpm --filter @mmgc/admin-next run build` passed.
  - `corepack pnpm --filter mmgc_backend run build` passed.

### Qiniu Kodo Storage And Origin Stats Fetch

- Hardened backend Qiniu Kodo statistics fetching for dashboard overview:
  - standard storage now tries both `api.qiniu.com` and `api.qiniuapi.com`,
  - Kodo stats requests now prefer Qiniu v2 access tokens and fall back to the legacy token path,
  - request headers include `Content-Type` and `X-Qiniu-Date` to match the Qiniu SDK v2 signing path.
- Added tolerant response parsing for storage and flow stats:
  - supports `datas`, `data.datas`, `result.datas`, raw arrays, and common `values.flow` payloads,
  - standard storage current/average values and CDN back-to-origin bytes no longer depend on a single response shape.
- Affected dashboard fields:
  - `currentStorageGB`,
  - `billing.standardStorageGB`,
  - `billing.standardCdnBackToOriginGB`,
  - `billing.standardCdnBackToOriginCost`,
  - low-frequency storage/retrieval/origin fields.
- Validation: `corepack pnpm --filter mmgc_backend run build` passed.

### Sitemap Management

- Added a React admin page at `/sitemap` for sitemap operations:
  - checks `/sitemap.xml`, `/robots.txt`, and `/api/__sitemap__/urls`,
  - shows sitemap URL count and dynamic source URL count,
  - previews sitemap URLs with search and copy actions,
  - includes Google Search Console and Baidu Search Resource Platform submission links and steps.
- Added a left-menu entry named `站点地图`.
- Added Nuxt `robots.txt` route that declares `Sitemap: <site-url>/sitemap.xml`.
- Fixed backend `/movie/getMovieByActivityId` filtering so omitting `day` returns all activity movies instead of matching `day: undefined`; this keeps the sitemap dynamic source from missing movie pages.
- Validation:
  - `corepack pnpm --filter @mmgc/admin-next run build` passed.
  - `corepack pnpm --filter mirai-offcial-website exec nuxi build` passed.
  - `corepack pnpm --filter mmgc_backend run build` passed.

### Sitemap 401 Fix

- Fixed sitemap generation error: `[GET] "/api/__sitemap__/urls": 401 Unauthorized`.
- Root cause: the frontend global `/api` proxy middleware intercepted `/api/__sitemap__/urls` before Nitro could serve the local sitemap source, forwarding it to the backend where it required auth / did not exist.
- Moved the dynamic sitemap source to `/__sitemap__/urls`, outside the proxied `/api` namespace.
- Updated `@nuxtjs/sitemap` source config from `/api/__sitemap__/urls` to `/__sitemap__/urls`.
- Removed the old `server/api/__sitemap__/urls.ts` route to avoid future confusion.
- Updated admin sitemap management to call backend `/statistics/sitemapOverview`; the backend performs sitemap/robots/source checks server-side, avoiding browser CORS failures in `adminonline`.
- Validation:
  - `corepack pnpm --filter mirai-offcial-website exec nuxi build` passed.
  - `corepack pnpm --filter mmgc_backend run build` passed.
  - `corepack pnpm --filter @mmgc/admin-next run build` passed.

### Qiniu Usage Billing Estimate Scope

- Removed prepaid CDN traffic package presentation from the new admin dashboard billing view.
- Dashboard billing fallback now defaults `trafficPackageCost` and `totalCost` to `0`, matching the backend pure usage-based estimate.
- Removed the traffic package row from the billing table and removed package entries from the pie chart and usage bar chart.
- Replaced the traffic package savings card with a usage-based estimate note:
  - estimates use only usage multiplied by pay-as-you-go rates,
  - prepaid packages, package offsets, coupons, balance deductions, and manual bill adjustments are excluded.
- Validation: `corepack pnpm --filter @mmgc/admin-next run build` passed.

### Admin Title And Favicon

- Reused the frontend MiraiMad favicon for both admin applications:
  - `apps/admin-next/public/favicon.ico`,
  - `apps/MMGCBACK/public/favicon.ico`.
- Added a complete HTML head to the React admin entry with `MMGC 管理后台` as the default title.
- Added route-based document titles in the React admin using the format `页面 - MMGC 管理后台`.
- Updated the legacy Vue admin base title to `MMGC 管理后台`; its existing route title hook keeps the same `页面 - MMGC 管理后台` format.
- Validation:
  - `corepack pnpm --filter @mmgc/admin-next run build` passed.
  - `corepack pnpm --filter @mmgc/admin run build` passed with existing non-blocking warnings.

### Sitemap Legacy Source Compatibility

- Added a compatibility route for `/api/__sitemap__/urls` that reuses the current `/__sitemap__/urls` sitemap source implementation.
- Updated the frontend `/api` proxy middleware to skip `/api/__sitemap__/...`, preventing the sitemap source from being forwarded to the backend and returning `401 Unauthorized`.
- Confirmed the built Nuxt sitemap source remains `/__sitemap__/urls`, while the legacy `/api/__sitemap__/urls` route is also registered for old sitemap caches or stale deployed configs.
- Validation: `corepack pnpm --filter mirai-offcial-website exec nuxi build` passed.
