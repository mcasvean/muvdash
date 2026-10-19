---
title: "Scaffold the Frontend Application"
type: "feature"
created: "2026-10-19"
status: "done"
route: "oneshot"
review_loop_iteration: 0
context:
  - "{project-root}/_bmad-output/planning-artifacts/epics.md"
  - "{project-root}/_bmad-output/planning-artifacts/architectures/architecture-bmad-2026-10-19/architecture.md"
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Muvdash has finalized requirements but no frontend project, so its features cannot yet be implemented or run.

**Approach:** Create a runnable Vue 3 frontend at the Git repository root using Vite, TypeScript, Pinia, Vue Router, and Vuetify. Preserve the existing `bmad/` planning workspace and `LICENSE`; provide a minimal application shell, production build, and passing smoke test without implementing catalog features.

</frozen-after-approval>

## Implementation Notes

- Scaffolded the Vue 3/Vite/TypeScript application under the repository-root `frontend/` directory to preserve the existing `bmad/` workspace and `LICENSE`.
- Installed Pinia, Vue Router, Vuetify, the Vuetify Vite auto-import plugin, and Material Design Icons; configured the reviewed dark/light palette with dark as the default.
- Replaced Vue starter content with a minimal MuvDash shell and an app-mount smoke test that exercises the same app factory as production. Removed unused Vue demo components, counter store, generic About route, and DevTools overlay; added MuvDash document metadata and favicon. Catalog behavior, route expansion, and theme controls remain assigned to later stories.
- App creation now uses a fresh router per instance; the smoke test verifies Vuetify markup and Pinia registration, and restores its jsdom `ResizeObserver` stub.
- Vitest inlines Vuetify so component styles are transformed, and the jsdom smoke test supplies the browser `ResizeObserver` API required by Vuetify layout.
- Verification passed: `npm --prefix ..\frontend run test:unit -- --run`, `npm --prefix ..\frontend run build`, and browser render at `http://127.0.0.1:5173/` with no unresolved Vuetify components.

## Review Triage Log

- medium — The original smoke test configured its own plugins; replaced it with a test of the production `createMuvdashApp` factory.
- low — The document had no language and retained the Vite title; set `lang="en"`, the MuvDash title, and a theme-color meta tag.
- low — The browser icon used Vue branding; added a MuvDash favicon and updated the document reference.
- low — Unused Vue starter components, icons, and counter store remained; removed them.
- medium — Future catalog-story tests do not explicitly assert responsive column counts and description truncation; deferred to `deferred-work.md` because this requires revising the approved story plan.
- medium — Navigation tests do not name all three mobile-menu dismissal paths; deferred to `deferred-work.md` because this requires revising the approved story plan.
- medium — Search tests do not assert catalog restoration and absence of a second catalog request after clearing; deferred to `deferred-work.md` because this requires revising the approved story plan.
- medium — Theme tests do not explicitly assert app-wide application and accessible active-state communication; deferred to `deferred-work.md` because this requires revising the approved story plan.
- medium — Contrast acceptance criteria do not enumerate the foreground/background pairs and states to measure; deferred to `deferred-work.md` for UX/requirements follow-up.
- medium — FR-9 still references the old Story 1.7 number and broader tooltip targets remain unresolved; deferred to `deferred-work.md` for planning reconciliation.
- medium — FR-9's stale reference was corrected, and Story 1.8 now labels its tooltip targets as proposed and requires product-owner confirmation before implementation.
- medium — Deferred follow-ups lacked ownership and resolution points; added owner, open status, and resolution timing to each deferred entry.
- false — The spec's `done` status and sprint story's `review` status are not inconsistent: the one-shot Build instructions require the spec to become `done` and then explicitly sync the sprint story to `review`.
- low — README setup commands did not specify their working directory or Node prerequisite; documented `cd frontend` and the package's supported Node versions.
- low — The scaffold exposed a generic About page before its planned story; removed the unused route/view so navigation is introduced in Story 1.4.
- medium — The smoke test did not detect unresolved Vuetify components or prove Pinia registration; it now asserts the rendered Vuetify application and active Pinia instance.
- low — The test's `ResizeObserver` mock leaked into other tests; now restored after each test.
- medium — App instances reused a singleton router; the app factory now creates and returns an independent router per instance.
