# AGENTS.md

This package is the migration target for the old MMGC admin at `apps/MMGCBACK`.

## Migration Role

- Treat `apps/admin-next` as the new admin repository inside the monorepo.
- Keep old backend API contracts compatible unless the user explicitly approves backend changes.
- Keep production replacement seamless: service name remains `admin`, image name remains `mmgc-admin:latest`.
- Do not delete or break `apps/MMGCBACK`; it remains fallback until parity is confirmed.
- Record migration progress in `LOGS.md` and actionable work in `TODO.md` after meaningful changes.

## UI Direction

- Use a rounded, modern, calm operations UI.
- Avoid very dark dominant palettes. Prefer light surfaces, soft borders, restrained blue/green accents, and high readability.
- Prioritize mobile support: no overflow, no fixed desktop-only widths, key operations usable on narrow screens.
- Keep screens dense enough for operations, but not template-heavy.
- Do not add decorative dashboard noise or unused template pages.

## Component Rules

- Split reusable UI into components under `src/components`.
- Prefer small reusable units: page shell, filters, upload controls, sortable list, metric cards, drawers, form sections.
- Avoid duplicating API request logic in pages. Keep API calls under `src/api`.
- Keep page files focused on workflow composition.
- Use Ant Design 5 components first. Add new UI dependencies only when clearly necessary.

## Migration Priorities

1. Match old admin capabilities and API behavior.
2. Improve interaction design and mobile layout.
3. Remove old template bloat.
4. Add Qiniu/cloud operations features.
5. Optimize bundle and code splitting after core parity.

## Validation

- Primary validation during migration: `corepack pnpm --filter @mmgc/admin-next run build`.
- Docker/workflow checks are required before final replacement, but do not block day-to-day migration unless deployment files are changed.
