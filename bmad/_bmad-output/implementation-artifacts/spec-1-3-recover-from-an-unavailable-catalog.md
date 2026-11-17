---
title: 'Recover from an Unavailable Catalog'
type: 'feature'
created: '2026-11-16'
baseline_revision: '6b97faceb40c656a6ff2f2c69cde280affa24679'
status: 'done'
review_loop_iteration: 0
followup_review_recommended: false
context:
  - bmad/_bmad-output/planning-artifacts/epics.md
warnings: []
deferred: []
---

<intent-contract>

## Intent

**Problem:** When the film catalog request fails or returns no films, Home shows an unavailable message but provides no way to recover without reloading the page.

**Approach:** Present the existing unavailable state as a clear, themed card with an accessible retry action. Reuse the current catalog loading path so retry returns to the established loading state and then displays either film cards or the retryable unavailable card.

## Boundaries & Constraints

**Always:** Keep request and empty-catalog failures retryable; a retry must start a fresh request and show loading; success replaces the unavailable card with film cards; another failure or empty response keeps retry available. Preserve the current catalog layout and support both themes, keyboard and touch operation, and reduced-motion preferences. Keep unavailable copy and presentation distinct from a no-search-results state.

**Never:** Add search or no-results functionality (owned by Story 1.5), change the API/service contract or film validation, add automatic retry, or change film-card content and responsive grid behavior.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Initial request fails or is empty | Failed fetch/response or zero films | The unavailable card shows a retry action | Keep retry available |
| Retry starts | Visitor activates retry | A new request starts and Home shows its loading state | Existing loading state remains authoritative |
| Retry succeeds | Request returns films | Film cards replace the unavailable card | No error state remains |
| Retry fails or is empty | Request fails or returns zero films | The unavailable card returns with retry available | Visitor may retry again |

</intent-contract>

## Code Map

- `bmad/_bmad-output/planning-artifacts/epics.md:205` -- Story 1.3 requirements and acceptance criteria; implementation order is third, dependent on Story 1.2.
- `bmad/_bmad-output/implementation-artifacts/spec-1-2-browse-the-film-catalog.md` -- completed prior-story continuity; its catalog, loading, card, and test behavior must remain intact.
- `frontend/src/views/HomeView.vue:8-9, 20-36, 61-64` -- mount triggers `loadFilms`; the template already branches for loading, `requestError`, and cards. Replace only the error paragraph with the unavailable card and bind retry to the existing store action. The component already uses theme-aware CSS variables and reduced-motion handling for loading skeletons.
- `frontend/src/stores/films.ts:11-26` -- `loadFilms()` clears the error, sets loading, calls `fetchFilms()`, treats an empty result or exception as `requestError`, and always ends loading. Reuse this behavior; no store/service change is needed.
- `frontend/src/components/FilmCard.vue:10-11, 28-33` -- established card treatment uses Vuetify `v-card`, `rounded="lg"`, `elevation="2"`, and theme surface/text colors.
- `frontend/src/__tests__/catalog.spec.ts:1-38, 158-191` -- existing mounted Home test harness and failure/empty response coverage. Extend it with retry, loading, recovery, repeat-failure, and accessible-control assertions.
- `frontend/package.json` -- validation scripts: `test:unit`, `type-check`, and `build`.

## Tasks & Acceptance

**Execution:**
- `frontend/src/views/HomeView.vue` -- render a themed, softly rounded unavailable card with clear copy and a visible, comfortably sized retry button; call `filmsStore.loadFilms()` on activation so the existing loading/results branches remain the single state flow.
- `frontend/src/__tests__/catalog.spec.ts` -- cover initial request and empty failures, activation and fresh request, loading while retry is pending, successful recovery, repeated failure/empty retryability, and the retry control's accessible name and target size.

**Acceptance Criteria:**
- Given the catalog request fails or returns an empty list, when loading finishes, then Home shows the unavailable card with a clearly named retry action.
- Given the visitor activates retry, when the new request is pending, then the catalog shows its loading state and a fresh request has been made.
- Given retry returns films, when loading finishes, then film cards replace the unavailable card.
- Given retry fails or returns no films, when loading finishes, then the unavailable card and retry action remain available.
- Given the catalog is unavailable, when its state is shown, then error-specific copy and the retry action distinguish it from a no-search-results state without adding search behavior.
- Given either theme or reduced motion is active, when the unavailable/loading/results state is shown or changes, then theme tokens and the existing reduced-motion behavior are respected; the unavailable card adds no animated transition.
- Given retry is available, when operated by keyboard or touch, then it has a visible focus treatment, an accessible name, a comfortable target size, and text that identifies the action without relying on color.
- Given the focused catalog recovery tests run, when they exercise failed, empty, retry, and successful responses, then all state transitions pass.

## Spec Change Log

## Review Triage Log

### 2026-11-17 — Review pass
- verdicts: 6 findings — high 0, medium 1, low 3, false 2, maybe-false 0
- findings:
  - `[low]` `[patch]` Retry rejection coverage — Added a test where the retry request rejects and verified the unavailable card remains retryable.
  - `[low]` `[patch]` Keyboard and focus coverage — Verified the control is a native focusable button and tests now assert focusability, its accessible name, and the visible `:focus-visible` outline; native button semantics provide keyboard activation.
  - `[low]` `[patch]` Theme and motion coverage — Added checks for theme-token styling and no card animation/transition; the existing reduced-motion test covers the loading skeleton.
  - `[false]` `[reject]` Verification outcomes absent from the spec — The finalization section below records actual command outcomes; the Verification section correctly lists reproducible commands and success criteria.
  - `[medium]` `[patch]` Duplicate retry requests — Guarded retry activation while loading and added a rapid repeated-activation test; the duplicate request could otherwise let overlapping responses race.
  - `[false]` `[reject]` Intent alignment — Prior conversation context identifies Story 1.3 as the next story; “faster” is a process preference, not a request to change product behavior. This diff implements the selected story.

## Auto Run Result

**Summary:** Added a themed, accessible unavailable-catalog card with a retry action that reuses the established loading and results flow.

**Files changed:**
- `frontend/src/views/HomeView.vue` -- added the retryable unavailable card and ignored duplicate retry activation while loading.
- `frontend/src/__tests__/catalog.spec.ts` -- added retry recovery, failure, accessibility, theme-token, and motion coverage.
- `bmad/_bmad-output/implementation-artifacts/sprint-status.yaml` -- marked Story 1.3 done and updated the timestamp.
- `bmad/_bmad-output/implementation-artifacts/spec-1-3-recover-from-an-unavailable-catalog.md` -- documented scope, code map, acceptance, review, and verification.

**Review findings:** Patched 4 findings (medium 1, low 3); deferred 0; rejected 2 false findings with reasons in the triage log.

**Follow-up review recommendation:** false. No high findings or unresolved review items remain; this pass patched one medium finding.

**Verification performed:**
- `npm run test:unit -- --run src/__tests__/catalog.spec.ts` (from `frontend`) -- passed, 17 tests.
- `npm run build` (from `frontend`) -- passed Vue type-check and production build.
- `git diff --check` (from repository root) -- passed.
- An initial test invocation from the repository root could not find `package.json`; rerunning from `frontend` passed.

**Residual risks:** No browser-level visual or theme-switching check was performed; the implementation uses Vuetify theme tokens and native button semantics, with focused unit coverage.

## Verification

**Commands:**
- `npm run test:unit -- --run src/__tests__/catalog.spec.ts` (from `frontend`) -- expected: focused catalog tests pass.
- `npm run build` (from `frontend`) -- expected: Vue type-check and production build pass.
- `git diff --check` (from repository root) -- expected: no whitespace errors.
