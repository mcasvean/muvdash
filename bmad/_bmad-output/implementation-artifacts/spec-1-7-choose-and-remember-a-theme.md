---
title: 'Choose and Remember a Theme'
type: 'feature'
created: '2026-11-18'
status: 'done'
review_loop_iteration: 0
followup_review_recommended: false
context:
  - bmad/_bmad-output/planning-artifacts/epics.md
  - bmad/_bmad-output/implementation-artifacts/epic-1-context.md
  - bmad/_bmad-output/implementation-artifacts/spec-1-4-navigate-the-app.md
warnings: []
deferred:
  - 'Contrast verification remains measurable follow-up work for the approved theme pairs.'
---

<intent-contract>

## Intent

**Problem:** Visitors cannot choose or retain a comfortable light or dark appearance.

**Approach:** Add a small Pinia setting for the theme preference, apply it through the existing Vuetify dark/light themes, and restore or persist it with localStorage.

## Boundaries & Constraints

**Always:** Default to dark when no valid preference is stored. Restore a saved light or dark preference on app startup. Add Light with a sun icon on the left and Dark with a moon icon on the right. Keep the control visible on every breakpoint, before the mobile menu on phones and after navigation on larger screens. Make the active option explicit by text weight/underline or pressed state as well as visual highlighting. Preserve route navigation and reduced-motion behavior.

**Never:** Fall back to system `prefers-color-scheme`, add a system theme option, change catalog or route behavior, or alter Story 1.8 guidance scope.

</intent-contract>

## Code Map

- `frontend/src/stores/theme.ts` -- Hold the theme preference and initialize/persist it.
- `frontend/src/plugins/vuetify.ts` -- Reuse the approved MuvDash dark and light themes.
- `frontend/src/App.vue` -- Render and style the responsive two-option theme control in the header.
- `frontend/src/__tests__/app.spec.ts` -- Verify dark default, saved restoration, and persistence across theme changes.
- `bmad/_bmad-output/implementation-artifacts/sprint-status.yaml` -- Track Story 1.7.

## Tasks & Acceptance

**Execution:**

- `frontend/src/stores/theme.ts` -- Read the valid `muvdash-theme` localStorage value, default to dark, and switch the Vuetify theme plus saved preference.
- `frontend/src/App.vue` -- Add native, keyboard-accessible Light/Dark buttons with sun/moon icons, pressed state, visible focus, comfortable targets, and responsive header placement.
- `frontend/src/__tests__/app.spec.ts` -- Test default dark, restore from localStorage, persist both choices, active pressed state, header placement hooks, focus, and reduced motion.

**Acceptance Criteria:**

- Given no theme preference is stored, when the app starts, then dark theme is applied.
- Given a stored light or dark preference exists, when the app starts, then that preference is restored.
- Given the visitor chooses Light or Dark, when the choice changes, then the active option is highlighted and pressed, the app theme updates across routes, and localStorage is updated.
- Given the control is rendered, when viewed on phones or larger screens, then Light precedes Dark and the control is before the mobile menu or after desktop navigation.
- Given either theme is active, when interface surfaces and text render, then existing approved theme roles remain in use and active state is not communicated by color alone.
- Given keyboard or touch use, when the control receives focus or is activated, then focus and targets remain accessible.
- Given reduced motion is requested, when theme surfaces change, then transitions are subtle or removed.
- Given focused tests run, when they cover default, restoration, and persistence, then they pass.

## Auto Run Result

**Summary:** Added a persisted Pinia theme setting and an accessible two-option theme control in the shared header. Dark remains the fallback, saved light/dark preferences restore on startup, and route changes retain the active theme.

**Files changed:**

- `frontend/src/stores/theme.ts` -- added theme state, `muvdash-theme` localStorage persistence, safe storage fallbacks, and Vuetify theme application.
- `frontend/src/App.vue` -- added the responsive Light/Dark control, pressed and active styling, visible focus targets, and reduced-motion support.
- `frontend/src/__tests__/app.spec.ts` -- added dark default, saved restoration, invalid fallback, route continuity, persistence, header placement, icon, and pressed-state coverage.
- `bmad/_bmad-output/implementation-artifacts/sprint-status.yaml` -- marked Story 1.7 done after approval.
- `bmad/_bmad-output/implementation-artifacts/spec-1-7-choose-and-remember-a-theme.md` -- recorded this implementation and verification.

## Verification

**Commands:**

- `npm run test:unit -- --run src/__tests__/app.spec.ts` (from `frontend`) -- passed, 10 app tests.
- `npm run test:unit -- --run` (from `frontend`) -- passed, 35 tests across 2 files.
- `npm run build` (from `frontend`) -- passed Vue type-check and production build.
- `git diff --check` (from repository root) -- passed.

## Review Closure

Approved by the product owner on 2026-11-18; Story 1.7 is complete.

