---
title: 'Open and Read Film Details'
type: 'feature'
created: '2026-11-18'
status: 'done'
review_loop_iteration: 0
followup_review_recommended: false
context:
  - bmad/_bmad-output/planning-artifacts/epics.md
  - bmad/_bmad-output/planning-artifacts/ux-designs/ux-bmad-2026-10-16/EXPERIENCE.md
  - bmad/_bmad-output/implementation-artifacts/epic-1-context.md
warnings: []
deferred: []
---

<intent-contract>

## Intent

**Problem:** Film cards show only a short summary, so visitors cannot inspect a film before choosing what to watch.

**Approach:** Add an explicit, accessible details action to each film card. Open a centered, responsive dialog with the selected film's image, title, and available core details in the approved order.

## Boundaries & Constraints

**Always:** Show image and title first, then available description, director, producer, release date, running time, and score. Omit absent values without placeholders or raw identifiers/URLs. Keep the dialog centered, internally scrollable when needed, usable by keyboard and touch, and dismissible with its labeled close control or standard dialog dismissal. Honor reduced motion.

**Never:** Fetch relationship resources or display people, species, locations, or vehicles in this story; those belong to Story 2.2. Do not expose raw API IDs or URLs.

</intent-contract>

## Code Map

- `frontend/src/services/filmService.ts` -- describe the core fields returned by the film API.
- `frontend/src/components/FilmCard.vue` -- add a details action while preserving card content.
- `frontend/src/views/HomeView.vue` -- manage selected-film context and render the responsive dialog.
- `frontend/src/__tests__/catalog.spec.ts` -- verify selected-film details, absent-value omission, and closing.
- `bmad/_bmad-output/implementation-artifacts/sprint-status.yaml` -- track Story 2.1.

## Tasks & Acceptance

- Given the catalog is displayed, when a visitor activates a film card's details action, then a centered dialog opens for that film with its image and title.
- Given the dialog is open, when details are displayed, then available description, director, producer, release date, running time, and score appear after the image and title in that order.
- Given requested fields are absent, when the dialog is rendered, then those fields are omitted without placeholders, raw IDs, or raw URLs.
- Given the dialog is displayed on a phone or larger viewport, when its content is rendered, then it remains centered, uses the available viewport appropriately, and permits internal vertical scrolling when needed.
- Given the visitor activates the labeled close control or dismisses the dialog, when it is open, then it closes and returns the visitor to the catalog context.
- Given the dialog opens or closes, when motion is enabled or reduced motion is requested, then its transition is subtle or reduced respectively, and keyboard focus remains visible and usable.
- Given focused tests run, when they cover selected-film details, available fields, omission, and closing, then those behaviors pass.

## Implementation Result

Added an accessible “View details” action to each film card and a centered Vuetify dialog for the selected film. Core film fields are shown in the approved order with absent values omitted; the close control, responsive sizing, internal scrolling, reduced-motion handling, and keyboard focus behavior are covered.

## Verification

- `npm run test:unit -- --run src/__tests__/catalog.spec.ts` (from `frontend`) -- passed, 29 tests.
- Browser check against live film data -- dialog opens with ordered details and closes back to the catalog.
- `npm run build-only` (from `frontend`) -- passed.
- `npx prettier --check src/components/FilmCard.vue src/services/filmService.ts src/views/HomeView.vue src/__tests__/catalog.spec.ts` (from `frontend`) -- passed.
- Full unit suite -- 38 passed, 2 existing app-navigation tests failed in `src/__tests__/app.spec.ts`.
- `npm run build` -- production build passed, but the combined command is blocked by the existing type error at `src/__tests__/app.spec.ts:153` (`Element.focus`).

## Review Closure

Approved by the product owner on 2026-11-18; Story 2.1 is complete. Unrelated app-shell navigation and test typing issues remain unchanged.
