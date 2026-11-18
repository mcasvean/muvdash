---
title: 'Switch Card Image Orientation'
type: 'feature'
created: '2026-11-18'
status: 'review'
review_loop_iteration: 0
followup_review_recommended: false
context:
  - bmad/_bmad-output/planning-artifacts/epics.md
  - bmad/_bmad-output/implementation-artifacts/epic-1-context.md
  - bmad/_bmad-output/implementation-artifacts/spec-1-2-browse-the-film-catalog.md
warnings: []
deferred: []
---

<intent-contract>

## Intent

**Problem:** Visitors cannot choose whether film cards use portrait posters or landscape banners.

**Approach:** Add an accessible orientation toggle to Home. Portrait posters remain the default; landscape mode uses each film's `movie_banner` field.

## Boundaries & Constraints

**Always:** Keep the existing responsive grid, card content, and image-first hierarchy. Preserve consistent image framing within each mode, communicate the active mode in the control, and support keyboard, touch, and reduced-motion preferences.

**Never:** Change catalog fetching, search behavior, card fields, responsive breakpoints, or unavailable-catalog behavior.

</intent-contract>

## Code Map

- `frontend/src/services/filmService.ts` -- Accept the optional landscape image field from the existing catalog response.
- `frontend/src/components/FilmCard.vue` -- Select portrait or landscape image and use the matching frame ratio.
- `frontend/src/views/HomeView.vue` -- Keep orientation state and expose the accessible toggle.
- `frontend/src/__tests__/catalog.spec.ts` -- Verify the portrait default and both toggle directions.
- `bmad/_bmad-output/implementation-artifacts/sprint-status.yaml` -- Track Story 1.6.

## Tasks & Acceptance

**Execution:**

- `frontend/src/services/filmService.ts` -- Type and validate the optional `movie_banner` field without changing the catalog request.
- `frontend/src/components/FilmCard.vue` -- Render the selected image field while preserving the card hierarchy and stable dimensions.
- `frontend/src/views/HomeView.vue` -- Add a portrait-default toggle with a visible active mode, accessible state, focus styling, and reduced-motion support.
- `frontend/src/__tests__/catalog.spec.ts` -- Verify the default portrait image and switching to landscape and back.

**Acceptance Criteria:**

- Given the catalog is displayed for the first time, when Home renders, then cards use each film's portrait `image` field.
- Given portrait cards are active, when the visitor activates the view control, then cards use `movie_banner` and the control communicates the active mode.
- Given landscape cards are active, when the visitor activates the view control again, then cards return to `image` and the control updates.
- Given either card mode is active, when the grid is displayed, then it remains multi-column with the same card hierarchy and consistent image framing.
- Given the visitor operates the control by keyboard or touch, when it is focused or activated, then it has a visible focus state and comfortable target size; its accessible name and state identify the active mode without relying on color.
- Given reduced motion is requested, when card orientation changes, then image framing changes without transition motion.
- Given focused tests run, when they exercise default portrait mode and both toggle directions, then each behavior passes.

## Verification

**Commands:**

- `npm run test:unit -- --run src/__tests__/catalog.spec.ts` (from `frontend`) -- expected: focused catalog and orientation tests pass.
- `npm run build` (from `frontend`) -- expected: Vue type-check and production build pass.
- `git diff --check` (from repository root) -- expected: no whitespace errors.

**Results:** All 25 focused catalog tests passed, the frontend type-check/build passed, and `git diff --check` passed.
