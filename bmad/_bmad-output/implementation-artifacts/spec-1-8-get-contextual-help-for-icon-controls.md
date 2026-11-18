---
title: 'Get Contextual Help for Icon Controls'
type: 'feature'
created: '2026-11-18'
status: 'done'
review_loop_iteration: 0
followup_review_recommended: false
context:
  - bmad/_bmad-output/planning-artifacts/epics.md
  - bmad/_bmad-output/implementation-artifacts/epic-1-context.md
  - bmad/_bmad-output/implementation-artifacts/spec-1-4-navigate-the-app.md
  - bmad/_bmad-output/implementation-artifacts/spec-1-6-switch-card-image-orientation.md
warnings: []
deferred: []
---

<intent-contract>

## Intent

**Problem:** Visitors may not understand the actions represented by the mobile menu and card-view icons.

**Approach:** Add concise Vuetify tooltips to only the approved mobile menu and card-view controls. On desktop, the card-view button shows guidance on hover/focus; on mobile and tablet, adjacent information buttons toggle guidance on click/tap.

## Boundaries & Constraints

**Always:** Keep native control behavior intact. Make the tooltip description available to assistive technology through the activator's accessible description. Preserve visible focus and comfortable targets. Close desktop tooltips on pointer/focus exit; close mobile/tablet tooltips on repeated info-button activation, outside/app action, route change, and Escape. Disable tooltip motion when reduced motion is requested.

**Never:** Add tooltip targets beyond the mobile menu and card-view control. Do not change navigation or card-orientation behavior.

</intent-contract>

## Code Map

- `frontend/src/components/ContextualTooltip.vue` -- Reusable tooltip wrapper with app-action and route dismissal.
- `frontend/src/App.vue` -- Add guidance to the mobile menu control.
- `frontend/src/views/HomeView.vue` -- Add guidance to the card orientation control.
- `frontend/src/assets/main.css` -- Respect reduced-motion preference for tooltip transitions.
- `frontend/src/__tests__/app.spec.ts` -- Verify mobile menu tooltip activation, description, and dismissal.
- `frontend/src/__tests__/catalog.spec.ts` -- Verify card orientation tooltip activation and description.
- `bmad/_bmad-output/implementation-artifacts/sprint-status.yaml` -- Track Story 1.8.

## Tasks & Acceptance

**Acceptance Criteria:**

- Given the card-view control is displayed on desktop, when its button is hovered or keyboard-focused, then a concise tooltip describes its action.
- Given either approved target is displayed on mobile or tablet, when the visitor views the control, then an adjacent information icon is available and opens the tooltip on click/tap.
- Given a desktop tooltip is open, when the pointer or keyboard focus leaves the card-view button, then the tooltip closes.
- Given a mobile/tablet tooltip is open, when the visitor activates its information icon again, clicks or focuses elsewhere, selects a route, or presses Escape, then the tooltip closes.
- Given keyboard or assistive-technology use, when a target is focused or activated, then its action description is available, with visible focus and a comfortable target.
- Given reduced motion is requested, when a tooltip opens or closes, then its transition is removed.
- Given focused tests run, when they cover activation, accessible description, and dismissal, then the behaviors pass.

## Auto Run Result

**Summary:** Added responsive contextual help to only the approved mobile menu and card-orientation controls. Desktop users get card-view guidance on hover/focus; mobile/tablet users get adjacent info buttons with click/tap toggles. Route changes, outside clicks/focus, Escape, and repeated info-button activation close open tooltips; reduced-motion users do not receive tooltip transitions.

**Files changed:**

- `frontend/src/components/ContextualTooltip.vue` -- added a reusable Vuetify tooltip wrapper with accessible activator descriptions and app-action/route dismissal.
- `frontend/src/App.vue` -- added the mobile-menu info button and click-triggered tooltip.
- `frontend/src/views/HomeView.vue` -- added a desktop hover/focus tooltip and a mobile/tablet adjacent info button for card orientation.
- `frontend/src/assets/main.css` -- disabled tooltip transitions for reduced-motion preferences.
- `frontend/src/__tests__/app.spec.ts` and `frontend/src/__tests__/catalog.spec.ts` -- added activation, accessible-description, repeat-action, outside/app-action, and route-dismissal coverage.
- Planning and implementation artifacts -- recorded the approved targets, resolved the target-confirmation follow-up, and marked Story 1.8 done after approval.

## Verification

**Commands:**

- `npm run test:unit -- --run src/__tests__/app.spec.ts src/__tests__/catalog.spec.ts` (from `frontend`) -- passed, 37 tests.
- `npm run test:unit -- --run` (from `frontend`) -- passed, 37 tests across 2 files.
- `npm run build` (from `frontend`) -- passed Vue type-check and production build.
- Browser responsive check -- mobile info controls appear through the tablet range, desktop card-view uses hover guidance, and the 320px CSS-width header has no horizontal overflow.
- `git diff --check` (from repository root) -- passed.

## Review Closure

Approved by the product owner on 2026-11-18; Story 1.8 is complete.
