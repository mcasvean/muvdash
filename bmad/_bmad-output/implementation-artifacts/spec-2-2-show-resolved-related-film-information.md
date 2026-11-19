---
title: 'Show Resolved Related Film Information'
type: 'feature'
created: '2026-11-18'
status: 'review'
review_loop_iteration: 0
followup_review_recommended: false
context:
  - bmad/_bmad-output/planning-artifacts/epics.md
  - bmad/_bmad-output/planning-artifacts/prds/prd-bmad-2026-10-16/prd.md
  - bmad/_bmad-output/planning-artifacts/ux-designs/ux-bmad-2026-10-16/EXPERIENCE.md
  - bmad/_bmad-output/implementation-artifacts/spec-2-1-open-and-read-film-details.md
warnings:
  - No separate plan.md or task-breakdown artifact exists; the Epic 2.2 acceptance criteria are the task source.
deferred: []
---

<intent-contract>

## Intent

**Problem:** Core film details do not expose the related people, species, locations, and vehicles supplied by the Studio Ghibli API.

**Approach:** Resolve only usable, selected-film relationship URLs from the Studio Ghibli API and display their readable fields after the core film details. If any required request fails, replace the details with a friendly error-only modal.

## Boundaries & Constraints

**Always:** Request related data only when a film's details are opened. Resolve only referenced resources from the approved Studio Ghibli API origin and the four relationship categories. Display readable resource names and available descriptive fields; omit missing or unusable data, IDs, and URLs. Wait for all required requests before showing film details so failures never expose partial results. Keep the full film image in its reserved, non-shrinking area while long related information scrolls separately. The error modal contains only friendly copy and its accessible X close control, with no retry action. Preserve modal accessibility, responsive sizing, and reduced-motion behavior.

**Never:** Fetch relationship collections or endpoints not usable as a referenced resource. Do not fetch nested relationship URLs from the resource objects. Do not show raw IDs, raw URLs, partial related data, or a retry control in the error modal.

</intent-contract>

## Code Map

- `frontend/src/services/filmService.ts` -- validate relationship URLs, fetch only referenced resources, and normalize displayable data.
- `frontend/src/views/HomeView.vue` -- resolve selected-film data before displaying details and show the error-only modal on failure.
- `frontend/src/__tests__/catalog.spec.ts` -- verify related data resolution, request scope, omission, and error behavior.
- `bmad/_bmad-output/implementation-artifacts/sprint-status.yaml` -- track Story 2.2.

## Tasks & Acceptance

- Given a visitor opens film details, when the film references usable related-resource URLs, then only those selected-film Studio Ghibli resources are requested and resolved people, species, locations, and vehicles appear after core details in that order.
- Given a related category or field is absent or has no usable data, when details render, then that field is omitted without placeholders, raw IDs, or URLs.
- Given any required related-resource request fails, when resolution completes, then an error modal appears instead of film details or partial related data.
- Given the related-data error modal is shown, when its content renders, then it contains only a friendly error message and an accessible X close control, with no retry action.
- Given the error modal is open, when its X close control is activated, then the modal closes and returns the visitor to the catalog context.
- Given the error modal opens or closes, when reduced motion is requested or the visitor uses keyboard or touch, then transitions are reduced as requested and the close control remains focusable, visible, labeled, and comfortably sized.
- Given focused tests run, when they cover resolution, omission, and a related-request failure, then those behaviors pass.

## Implementation Result

Added on-demand resolution of usable relationship URLs from the selected film, restricted to referenced resources on the Studio Ghibli API origin. The details dialog waits for all required requests, displays readable people/species/locations/vehicles fields after core details, and omits empty or unusable resource data. A failed request replaces the dialog content with friendly error copy and its close control only. Long details scroll within their own region without compressing or cropping the film image.

## Verification

- `npm run test:unit -- --run src/__tests__/catalog.spec.ts` (from `frontend`) -- passed, 31 tests.
- Browser check against live film data -- resolved People, Species, and Vehicles; absent Locations were omitted; no raw IDs or URLs were displayed.
- `npm run build-only` (from `frontend`) -- passed.
- `npx prettier --check src/services/filmService.ts src/views/HomeView.vue src/__tests__/catalog.spec.ts` (from `frontend`) -- passed.
- Full unit suite -- 40 passed, 2 app-shell route-navigation tests failed in `src/__tests__/app.spec.ts`.
- `npm run type-check` -- blocked by the existing `Element.focus` type error at `src/__tests__/app.spec.ts:153`; no type errors were reported for Story 2.2 changes.
- `git diff --check` -- passed.

## Review Status

Implementation is ready for review. The unrelated app-shell navigation and test typing issues remain unchanged.
