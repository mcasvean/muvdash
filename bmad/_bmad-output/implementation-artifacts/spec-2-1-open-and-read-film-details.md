---
title: 'Open and Read Film Details'
type: 'feature'
created: '2026-11-18'
status: 'review'
review_loop_iteration: 1
followup_review_recommended: true
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

**Approach:** Add an explicit, accessible details action to each film card. Open a centered, responsive dialog with the selected film's landscape banner when available (poster fallback), title, and available core details in the approved order.

## Boundaries & Constraints

**Always:** Prefer the landscape banner image, falling back to the poster when no banner is available. Show the full image and title first, then available description, director, producer, release date, running time, and score. Give the image a viewport-aware 16:9 reserved area that does not shrink or crop when details are long. Keep the image and title outside the independently scrollable details region. Omit absent values without placeholders or raw identifiers/URLs. Keep the dialog centered, usable by keyboard and touch, and dismissible with its labeled close control or standard dialog dismissal. Honor reduced motion.

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
- Given a film has a landscape banner, when its details modal opens, then the modal uses the banner and fits the full image without cropping; if no banner is available, it uses the poster when available.
- Given the dialog is open, when details are displayed, then available description, director, producer, release date, running time, and score appear after the image and title in that order.
- Given the film has long details or related information, when the modal is displayed, then the full image remains in its reserved viewport-aware area without being compressed or cropped, while only the details region scrolls.
- Given requested fields are absent, when the dialog is rendered, then those fields are omitted without placeholders, raw IDs, or raw URLs.
- Given the dialog is displayed on a phone or larger viewport, when its content is rendered, then it remains centered, uses the available viewport appropriately, and permits internal vertical scrolling when needed.
- Given the visitor activates the labeled close control or dismisses the dialog, when it is open, then it closes and returns the visitor to the catalog context.
- Given the dialog opens or closes, when motion is enabled or reduced motion is requested, then its transition is subtle or reduced respectively, and keyboard focus remains visible and usable.
- Given focused tests run, when they cover selected-film details, available fields, omission, and closing, then those behaviors pass.

## Implementation Result

Added an accessible “View details” action to each film card and a centered Vuetify dialog for the selected film. Core film fields are shown in the approved order with absent values omitted. Follow-up layout work reserves a non-shrinking image area and makes long details scroll independently so the full image remains visible; close control, responsive sizing, reduced-motion handling, and keyboard focus behavior are preserved.

## Verification

- `npm run test:unit -- --run src/__tests__/catalog.spec.ts` (from `frontend`) -- passed, 29 tests.
- Browser check against live film data -- dialog opens with ordered details and closes back to the catalog.
- `npm run build-only` (from `frontend`) -- passed.
- `npx prettier --check src/components/FilmCard.vue src/services/filmService.ts src/views/HomeView.vue src/__tests__/catalog.spec.ts` (from `frontend`) -- passed.
- Follow-up focused catalog suite -- passed, 31 tests.
- Follow-up `npm run build-only` and frontend Prettier check -- passed.
- Browser check with Castle in the Sky and long related data -- the image area remained 352px tall, the full poster used `object-fit: contain`, details scrolled independently, and the modal fit within desktop and narrow browser viewports.
- Landscape-image follow-up: focused catalog suite passed (31 tests), production build and frontend Prettier check passed. The modal selected the landscape banner; at a 468px-wide browser viewport its image frame was 376x212px (16:9), while long details scrolled independently.
- Full unit suite -- 38 passed, 2 existing app-navigation tests failed in `src/__tests__/app.spec.ts`.
- `npm run build` -- production build passed, but the combined command is blocked by the existing type error at `src/__tests__/app.spec.ts:153` (`Element.focus`).

## Review Status

Story 2.1 was previously approved; a follow-up modal layout fix is ready for review. Unrelated app-shell navigation and test typing issues remain unchanged.
