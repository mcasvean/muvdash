---
title: 'Search the Catalog'
type: 'feature'
created: '2026-11-18'
baseline_revision: 'fb80906468a502ed2b628c9a40cfe8e1b6b4e86c'
status: 'done'
review_loop_iteration: 0
followup_review_recommended: false
context:
  - bmad/_bmad-output/planning-artifacts/epics.md
  - bmad/_bmad-output/implementation-artifacts/epic-1-context.md
  - bmad/_bmad-output/implementation-artifacts/spec-1-4-navigate-the-app.md
warnings: []
deferred: []
---

<intent-contract>

## Intent

**Problem:** Visitors must browse the full film catalog manually to find films relevant to them.

**Approach:** Add a sticky, compacting search control to Home that filters the already-loaded catalog locally across title, release date, producer, director, and description. Show an actionable no-results state distinct from catalog loading failures.

## Boundaries & Constraints

**Always:** Match partial, case-insensitive text in all five fields without another request. Clearing the query restores every fetched film. Keep search directly below the sticky app header while scrolling; compact it without overlap. Center the search and card-orientation controls together, aligned with the catalog edges and the header logo/theme-control boundaries. Flow search results from left to right with a small, consistent gap; when fewer cards match, leave unused grid space on the right. Cap each card at 18rem wide and 36rem tall. Give the search placeholder strong, readable contrast against its input background in both themes. Make input and clear action keyboard/touch accessible, with visible focus, comfortable targets, and understandable text. Respect reduced-motion preferences.

**Never:** Change the catalog request flow, card content, or unavailable-catalog behavior. Do not implement Story 1.6 or other future stories.

</intent-contract>

## Code Map

- `bmad/_bmad-output/planning-artifacts/epics.md` -- Story 1.5 requirements and acceptance criteria.
- `bmad/_bmad-output/implementation-artifacts/epic-1-context.md` -- catalog search behavior and sticky-header/search continuity.
- `frontend/src/views/HomeView.vue` -- Home owns the search query, filtered results, aligned toolbar, and distinct no-results presentation.
- `frontend/src/services/filmService.ts` -- film record type and validation must retain the searchable API fields.
- `frontend/src/App.vue` -- existing fixed header establishes the search toolbar's sticky offset and stacking order.
- `frontend/src/__tests__/catalog.spec.ts` -- add focused filtering, clear, no-results, accessibility, aligned-layout, contrast, and compact-toolbar tests.
- `bmad/_bmad-output/implementation-artifacts/sprint-status.yaml` -- track Story 1.5 only.

## Tasks & Acceptance

**Execution:**
- `frontend/src/services/filmService.ts` -- type and validate the optional release date, producer, and director fields without altering the endpoint or request behavior.
- `frontend/src/views/HomeView.vue` -- filter loaded films locally; add an accessible clearable search control and a no-results state with a clear action; center and align the toolbar with the catalog and header boundaries, strengthen placeholder contrast in both themes, and keep the toolbar sticky and compact it on scroll with reduced-motion support.
- `frontend/src/__tests__/catalog.spec.ts` -- verify matching in all five fields, partial case-insensitive matching, no-results recovery, query clearing without another request, and the toolbar's accessible/sticky/compact/aligned behavior and search placeholder contrast.

**Acceptance Criteria:**
- Given the catalog has loaded, when a visitor enters a query, then partial case-insensitive matches in title, release date, producer, director, or description are shown without another catalog request.
- Given a search query is active, when the visitor clears it, then the full fetched catalog is restored.
- Given a query matches no films, when results are displayed, then a friendly no-results message and a clear-query action appear, distinct from the unavailable-catalog state.
- Given the visitor scrolls Home, when the page moves, then search remains directly below the sticky header and compacts without overlap.
- Given the catalog toolbar is displayed, when search and the card-orientation control are rendered, then they are centered together and align with the catalog's left and right edges and the header logo/theme-control boundaries.
- Given a search returns one, two, or three films, when results are displayed, then cards flow from the left with a small consistent gap, unused grid space remains on the right, and no card exceeds 18rem in width or 36rem in height.
- Given the search field is displayed in either theme, when its placeholder is visible, then it has strong contrast against the input background and remains easy to read.
- Given search is used by keyboard or touch, when input or clear controls are focused or activated, then they have visible focus, accessible names, comfortable targets, and state conveyed without color alone.
- Given reduced motion is requested, when search compacts or results update, then transitions are subtle or reduced.
- Given focused tests run, when they exercise all five fields, partial case-insensitive matching, no-results behavior, and query clearing, then each behavior passes.
- Given focused layout and theme tests run, when they check toolbar alignment, grid row spacing, sparse-result card bounds, and search placeholder contrast in both themes, then each behavior passes.

## Auto Run Result

**Summary:** Added local film search across the requested catalog fields, an actionable no-results state, and a sticky search control that compacts on scroll. The follow-up layout update keeps sparse results left-aligned with compact gaps and caps each card at 18rem wide and 36rem tall, leaving unused space to the right.

**Files changed:**
- `frontend/src/services/filmService.ts` -- added typed, validated release date, producer, and director fields.
- `frontend/src/views/HomeView.vue` -- added local filtering, clear actions, no-results feedback, sticky/compact search, accessibility styling, and reduced-motion handling.
- `frontend/src/__tests__/catalog.spec.ts` -- added search-field, query-clear, no-results, toolbar, sparse-result alignment, and card-bound coverage.
- `bmad/_bmad-output/implementation-artifacts/sprint-status.yaml` -- retained completed story statuses and refreshed the tracker timestamp.
- `bmad/_bmad-output/implementation-artifacts/spec-1-5-search-the-catalog.md` -- recorded this implementation and verification.
- `frontend/src/components/FilmCard.vue` -- capped card width and height.

**Verification performed:**
- `npm --prefix frontend run test:unit -- --run` -- passed, 38 tests.
- `npm --prefix frontend run build-only` -- passed Vite production build.
- Prettier check for changed frontend files -- passed.
- `git diff --check` (from repository root) -- passed.

## Verification

**Commands:**
- `npm --prefix frontend run test:unit -- --run` -- expected: frontend unit tests pass.
- `npm --prefix frontend run build-only` -- expected: Vite production build passes.
- `git diff --check` (from repository root) -- expected: no whitespace errors.
