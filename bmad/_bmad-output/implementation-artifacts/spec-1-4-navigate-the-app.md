---
title: 'Navigate the App'
type: 'feature'
created: '2026-11-17'
baseline_revision: '502a9882202a6f6f6600f5182e6cd39693c05f86'
status: 'done'
review_loop_iteration: 0
followup_review_recommended: false
context: []
warnings: []
deferred: []
---

<intent-contract>

## Intent

**Problem:** The app shell currently has a static MuvDash title and only a Home route, so visitors cannot move between Home, Contact, and About or identify those pages.

**Approach:** Turn the existing header into a linked, responsive primary navigation. Add simple Contact and About routes; use text links on tablet/desktop and an accessible temporary drawer on mobile, preserving the existing visual system.

## Boundaries & Constraints

**Always:** The MuvDash text logo links to Home. Home, Contact, and About links reach their corresponding routes; Contact and About only need to identify the page. Keep the header visible while scrolling, show text links at the existing Vuetify `sm` breakpoint (600px) and above, and provide a mobile menu below it. The mobile panel closes when the visitor taps outside, uses its close control, or selects a route. Use approved theme color roles, compact readable type, clear hierarchy, visible focus, accessible names, comfortable touch targets, and state indicators that do not rely on color alone. Reduce navigation transitions for reduced-motion preferences.

**Never:** Add contact forms, detailed informational content, search, theme controls, backend work, or changes to catalog behavior. Do not add icon-only route links.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Return Home | Logo selected from any route | Home route and catalog view display | No error expected |
| Visit an information page | Contact or About selected | Corresponding route displays a simple page identifier | No error expected |
| Open mobile navigation | Viewport below 600px; menu activated | A panel with Home, Contact, and About text links opens | Keep route links accessible |
| Dismiss mobile navigation | Outside tap, close control, or route selection | Panel closes; route selection also navigates | No error expected |
| Use tablet/desktop navigation | Viewport at least 600px | Text route links appear in the visible header | Header remains visible while scrolling |

</intent-contract>

## Code Map

- `bmad/_bmad-output/planning-artifacts/epics.md:258-296` -- source requirements and acceptance criteria for Story 1.4.
- `bmad/_bmad-output/implementation-artifacts/epic-1-context.md` -- cross-story navigation design: text logo links Home; mobile navigation dismisses on outside tap, close, or route selection.
- `bmad/_bmad-output/implementation-artifacts/spec-1-3-recover-from-an-unavailable-catalog.md` -- immediately prior completed story; preserve the catalog route and its existing unavailable/loading behavior.
- `frontend/src/App.vue:1-20` -- app shell currently owns the MuvDash app bar and `RouterView`; make it the shared navigation surface without moving catalog behavior into the shell.
- `frontend/src/router/index.ts:1-14` -- router currently defines only the Home route; add named Contact and About routes here.
- `frontend/src/__tests__/app.spec.ts:1-45` -- existing mounted application-shell harness, including the `ResizeObserver` mock; extend it to exercise routes and mobile-menu dismissal.
- `frontend/src/plugins/vuetify.ts:3-31` -- existing dark/light theme roles; use these theme variables for header, panel, links, focus, and active-route styling. Vuetify's default `sm` breakpoint is 600px.
- `frontend/package.json` -- validation scripts: `test:unit`, `type-check`, and `build`.

## Tasks & Acceptance

**Execution:**
- `frontend/src/App.vue` -- link the logo to Home; add text links and a mobile menu trigger; use a temporary, labeled navigation drawer with a close action and route-dismiss behavior; keep the header visible and style focus, active state, targets, theme, and motion accessibly.
- `frontend/src/router/index.ts` -- register named Contact and About routes while preserving Home.
- `frontend/src/views/ContactView.vue` -- add a simple, theme-consistent Contact page identifier.
- `frontend/src/views/AboutView.vue` -- add a simple, theme-consistent About page identifier.
- `frontend/src/__tests__/app.spec.ts` -- verify logo and route navigation, mobile panel open/close via outside tap, close control, and route selection, plus responsive and accessible header behavior.

**Acceptance Criteria:**
- Given any route is displayed, when the visitor selects the MuvDash logo, then Home is displayed.
- Given the visitor selects Contact or About, when navigation completes, then that route shows text identifying its page.
- Given any route is displayed, when the header and page render, then they use the approved theme roles, compact readable typography, and consistent visual hierarchy.
- Given the viewport is below 600px, when the visitor activates the menu button, then a panel with text links for Home, Contact, and About opens.
- Given the mobile panel is open, when the visitor taps outside, selects Close, or selects a route, then the panel closes; selecting a route also displays that page.
- Given the viewport is at least 600px, when the app is displayed and scrolled, then text route links appear and the header remains visible.
- Given navigation is used with keyboard or touch, when its controls are focused or activated, then focus is visible, names are accessible, targets are comfortable, active state is not conveyed by color alone, and menu motion respects reduced-motion preferences.
- Given focused navigation tests run, when they exercise Home, Contact, About, and mobile-menu dismissal, then all route and dismissal behaviors pass.

## Spec Change Log

## Review Triage Log

### 2026-11-18 — Review pass
- verdicts: 1 finding — high 0, medium 0, low 1, false 0, maybe-false 0
- findings:
  - `[low]` `[patch]` Closed-drawer accessibility state — The initial browser snapshot included the closed mobile drawer with the desktop links; added a conditional `aria-hidden` state and tests for closed/open values, alongside Vuetify's inactive-drawer behavior.

## Design Notes

Vuetify's temporary navigation drawer provides the modal panel, focus containment, and outside-tap scrim behavior; keep route links as text and close the drawer on selection. The drawer is explicitly hidden from assistive technology while closed, and its built-in transition is disabled under reduced-motion preferences.

## Auto Run Result

**Summary:** Added persistent responsive navigation for Home, Contact, and About, including a linked MuvDash brand, active-route styling, and a dismissible mobile drawer.

**Files changed:**
- `frontend/src/App.vue` -- added desktop links, mobile drawer, close behavior, accessibility state, and responsive styling.
- `frontend/src/router/index.ts` -- registered named Contact and About routes.
- `frontend/src/views/ContactView.vue` -- added the Contact page identifier.
- `frontend/src/views/AboutView.vue` -- added the About page identifier.
- `frontend/src/__tests__/app.spec.ts` -- added route, drawer dismissal, responsive, and accessibility coverage.
- `frontend/src/__tests__/catalog.spec.ts` -- scoped retry selectors so app-level navigation controls cannot be mistaken for catalog retry actions.
- `bmad/_bmad-output/implementation-artifacts/sprint-status.yaml` -- moved Story 1.4 to review, then done.
- `bmad/_bmad-output/implementation-artifacts/spec-1-4-navigate-the-app.md` -- recorded the implementation, review, and verification.

**Review findings:** Patched 1 low finding; deferred 0; rejected 0.

**Follow-up review recommendation:** false. The only patch is covered by focused accessibility-state assertions; no unresolved review items remain.

**Verification performed:**
- `npm run test:unit -- --run src/__tests__/app.spec.ts src/__tests__/catalog.spec.ts` (from `frontend`) -- passed, 23 tests.
- `npm run build` (from `frontend`) -- passed Vue type-check and production build.
- `git diff --check` (from repository root) -- passed.
- Manual browser check -- desktop links displayed at 1212px; mobile menu button appeared at 390px and opened the Home, Contact, and About drawer. Unit tests cover outside-tap, close-button, and route-selection dismissal.

**Residual risks:** No automated browser test was added; responsive appearance was checked manually at desktop and mobile widths, and behavior is covered by unit tests.

## Verification

**Commands:**
- `npm run test:unit -- --run src/__tests__/app.spec.ts src/__tests__/catalog.spec.ts` (from `frontend`) -- expected: focused app-shell, navigation, and catalog tests pass.
- `npm run build` (from `frontend`) -- expected: Vue type-check and production build pass.
- `git diff --check` (from repository root) -- expected: no whitespace errors.
