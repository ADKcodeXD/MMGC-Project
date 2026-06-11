# Admin Next Migration TODO

This is the canonical migration checklist for `apps/admin-next`.

## Goal

Replace the old Vben admin in `apps/MMGCBACK` with a lighter React admin while preserving backend API contracts, deployment shape, permissions, and operational workflows.

## Phase 0 - Foundation

- [x] Create `@mmgc/admin-next` package.
- [x] Add React + Vite + Ant Design 5.
- [x] Add TanStack Query, React Router, Zustand, Axios.
- [x] Add responsive app shell.
- [x] Add online API dev mode.
- [x] Add Dockerfile.
- [x] Update workflow to build `mmgc-admin:latest` from `apps/admin-next`.
- [x] Add local package documentation and migration logs.

## Phase 1 - API And Auth Parity

- [x] Add Axios client with old API response transform.
- [x] Add JWT storage.
- [x] Use old login endpoint `/user/login`.
- [x] Support backend login returning raw JWT string.
- [x] Add user info endpoint and role display.
- [x] Add 401 handling and logout flow.
- [ ] Confirm token header behavior with online API.
- [ ] Confirm old permission roles: ADMIN, SUBADMIN, COMMITTER, GROUPMEMBER.

## Phase 2 - Dashboard And Cloud Ops

- [x] Add dashboard overview cards.
- [x] Connect Qiniu traffic/storage/cost endpoint.
- [x] Add Cloud Ops entry page.
- [x] Add cloud ops date-range selector, UV, domestic/overseas traffic, costs, storage, and site-map status panel.
- [ ] Add domestic vs overseas traffic chart.
- [ ] Add CDN hit rate card when backend endpoint exists.
- [ ] Add hot video traffic ranking.
- [ ] Add abnormal traffic alerts.
- [ ] Add Qiniu upload/transcode task status.
- [ ] Add operational health panel for backend, MongoDB, Redis, CDN.
- [ ] Implement real Qiniu CDN whitelist/referer policy mutation API with confirmation, audit log, and rollback.

## Phase 3 - Activity Management

- [x] Activity list.
- [x] Activity search.
- [x] Day drawer.
- [x] Create day.
- [x] Delete day.
- [x] Drag-sort days.
- [x] Admin Member Management
- [x] Admin Sponsor Management
- [x] Activity list logo and organizer display.
- [x] Sponsor detail page with old-admin edit/delete flow.
- [x] Sponsor description uses rich text like Activity detail.
- [x] Member detail page with old-admin edit/delete flow.
- [ ] Activity create/edit drawer.
- [ ] Activity cover/logo/background upload.
- [ ] Activity rich text fields.
- [ ] Sponsor selection.
- [ ] Staff management.
- [ ] Day edit drawer.
- [ ] Day cover upload.
- [x] Day public/private controls parity.
- [x] Day poll links include Bilibili, Twitter/X, and other links.

## Phase 4 - Video Management

- [x] Video list.
- [x] Search by keyword.
- [x] Filter by activity and day.
- [x] Quick filter for unbound videos inside Day scheduling movie picker.
- [x] Move unbound-video filtering to backend `unboundOnly` API parameter.
- [x] Add sort controls for Activities, Movies, Sponsors, Members, Statistics, and Day movie picker.
- [x] Create/edit drawer basic fields.
- [x] Delete video.
- [x] Drag-sort videos.
- [x] Qiniu direct upload helper.
- [x] Admin Statistics & Rank Management
- [x] Full old movie schema parity.
- [x] Cover upload integrated with preview.
- [x] Video upload integrated with progress and retry.
- [x] Multi-language play links: cn/en/jp.
- [x] Download links: Baidu, Google, OneDrive, other.
- [x] External play links: bilibili, youtube, niconico, twitter, personal site.
- [x] Bilibili space shortcut for filling video author name and Bilibili link.
- [x] Robust video detail fetch with fallback when admin detail endpoint fails.
- [x] Treat `moviePlaylink.cn/en/jp` as separate playback sources, not translatable text.
- [ ] Author remote search and manual author fallback.
- [ ] Uploader display.
- [ ] Public schedule fields: real publish time and expected play time.
- [ ] Origin flag.
- [ ] Batch operations.
- [ ] Sort by activity/day with clearer conflict handling.

## Phase 5 - Submission Form

- [x] Rebuild old multi-step movie submission flow with better UX.
- [x] Split form sections: basic info, translation, video, links, schedule, relation.
- [x] Add AI translate preview.
- [x] Add fill-empty-only mode.
- [x] Prevent accidental overwrite of manual translations.
- [x] Add form completeness check before submit.
- [x] Add mobile-friendly submit flow.

## Phase 5.5 - Form Parity & UI Drag-and-Drop
- [x] Replace Staff inline editing with Avatar Grid + Modal.
- [x] Implement Staff drag-and-drop ordering (`@dnd-kit`).
- [x] Implement Bound Movies drag-and-drop ordering in DayEdit.
- [x] Add missing Activity rich text fields: `rules`, `timesorother`, `faq`.
- [x] Implement `antd-img-crop` for QiniuUpload.

## Phase 5.6 - Analytics, Cache Sorting Fix, and Subpath Deployment
- [x] Custom event & PV analytics collection and API backend integration.
- [x] Nuxt 3 client-side analytics auto-tracking router plugin.
- [x] Track key video interactions: play, copy link, like, vote, external poll click, and poster download/generate.
- [x] Fix local cache sorting inconsistency in `DayEdit.tsx` by updating elements `sortIndex` on drag-end.
- [x] Add migration banner alert to Vue 3 old admin prompting switch to `/newAdmin`.
- [x] Configure base path to `/newAdmin/` in `vite.config.ts` and set basename in `BrowserRouter`.
## Phase 6 - Site Config

- [x] Migrate config page.
- [x] Support current activity config.
- [ ] Support skin/background/statistics background settings.
- [ ] Support video play enable switch.
- [x] Support frontend video watermark toggle.
- [x] Restore statistics history background config via `otherSettings.bgStatistics`.
- [x] Support frontend video play switch.
- [x] Support legacy `skin` field.
- [x] Add global all-site video disable intent in `otherSettings.allSiteVideoDisabled`.
- [ ] Support other settings JSON editing with validation.

## Phase 7 - Upload And Qiniu Enhancements

- [x] Fetch `/upload/getQiniuToken`.
- [x] Browser direct upload to Qiniu.
- [x] Generate old-compatible CDN URLs.
- [ ] Reuse old upload path rules exactly.
- [ ] Add file type and size guards.
- [ ] Add resumable upload for large videos if needed.
- [ ] Add upload queue panel.
- [ ] Add video metadata extraction: size, duration, resolution, bitrate.
- [ ] Add Qiniu transcode workflow hooks.
- [ ] Add storage cleanup tools.

## Phase 8 - UI System

- [x] Light modern shell.
- [x] Mobile drawer menu.
- [x] Fixed desktop left menu with independently scrollable right content.
- [x] Soft card layout.
- [ ] Extract reusable `PageHeader`.
- [ ] Extract reusable `FilterBar`.
- [ ] Extract reusable `MetricCard`.
- [ ] Extract reusable `EntityDrawer`.
- [ ] Extract reusable `I18nFieldGroup`.
- [ ] Extract reusable `FormSection`.
- [ ] Improve rounded modern visual language consistently.
- [ ] Avoid very dark dominant palettes.
- [ ] Add empty/loading/error states consistently.

## Phase 9 - Deployment Replacement

- [x] Keep compose service name `admin`.
- [x] Keep image name `mmgc-admin:latest`.
- [x] Workflow builds admin image from `apps/admin-next`.
- [ ] Verify Docker build when Docker engine is available.
- [ ] Confirm production env variables.
- [ ] Confirm static nginx fallback.
- [ ] Confirm online API and upload CORS behavior.
- [ ] Prepare rollback: old admin Dockerfile remains at `apps/MMGCBACK/Dockerfile`.

## Phase 10 - Cleanup After Parity

- [ ] Remove unused Vben template code only after final approval.
- [ ] Archive old admin docs.
- [ ] Document replacement release notes.
- [x] Add route-level lazy loading.
- [x] Reduce first bundle size.
- [ ] Add minimal smoke tests for core pages.

## Current Next Step

Continue old-admin parity for activity edit staff/sponsor binding UX. Server-side unbound video filtering is now available through `/movie/getAllMovie?unboundOnly=true`.
