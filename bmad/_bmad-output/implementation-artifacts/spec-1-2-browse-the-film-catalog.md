---
title: "Browse the Film Catalog"
type: "feature"
created: "2026-10-19"
status: "done"
route: "dispatch"
review_loop_iteration: 0
baseline_commit: "b9550f342ea9b85bc9b7aedf9c26eceb4238994e"
context:
  - "{project-root}/_bmad-output/implementation-artifacts/epic-1-context.md"
  - "{project-root}/_bmad-output/planning-artifacts/epics.md"
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Home currently shows only a placeholder, so visitors cannot browse the Studio Ghibli film collection.

**Approach:** Fetch the catalog from the configured Studio Ghibli endpoint when Home mounts, show skeleton cards while it loads, and render the returned films as an accessible responsive card grid using the approved MuvDash design tokens.

## Boundaries & Constraints

**Always:** Keep this client-only and use the existing Vue 3, Pinia, Vuetify, and Vite setup. Show only each film's image, title, and description. Use the API `id` only as a stable key, never as visible text. Use supplied image URLs, tolerate missing fields without placeholders, preserve stable card sizing, and limit descriptions to two rows. Apply the approved responsive grid, color roles, contrast, and reduced-motion requirements. Fetch once per Home mount; do not issue catalog requests for rendering. If the request fails or returns an empty array, show the temporary message `Unable to load films` without a retry action; Story 1.3 replaces this with the final unavailable experience.

**Never:** Do not add search, a retry action or final unavailable card, navigation changes, theme controls, image-orientation toggling, film selection/details, or related-resource requests. These belong to later stories. Do not add a backend or independent data provider.

## I/O & Edge-Case Matrix

| Scenario                               | Input / State                                      | Expected Output / Behavior                                                     | Error Handling                                                    |
| -------------------------------------- | -------------------------------------------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------------- |
| Catalog pending                        | Home mounts; film request unresolved               | Loading state with stable skeleton cards in the responsive grid                | Do not render stale sample content                                |
| Catalog succeeds                       | API returns film array                             | Render one card per returned film with available image, title, and description | Omit absent fields; reserve image aspect ratio if image is absent |
| Catalog request fails or returns empty | Home request rejects or API returns an empty array | Show `Unable to load films`                                                    | No retry in this story; final retry experience is Story 1.3       |

</frozen-after-approval>

## Code Map

- `frontend/src/views/HomeView.vue` -- Replace the placeholder with catalog lifecycle and card-grid presentation; retain the existing route.
- `frontend/src/createMuvdashApp.ts` -- Pinia is registered here; create a store per app instance through the current app bootstrap.
- `frontend/src/plugins/vuetify.ts` -- Reuse the approved MuvDash theme colors; do not add theme-switching behavior.
- `frontend/vite.config.ts` -- Vuetify auto-import is configured by the official plugin; use its registered components.
- `frontend/src/__tests__/app.spec.ts` -- Existing app-mount test and jsdom setup; add focused catalog tests in `frontend/src/__tests__/catalog.spec.ts`.
- `bmad/_bmad-output/api_structure.md` -- Studio Ghibli film array and record fields; use `id` as a key and `image`, `title`, and `description` for visible card content.
- `bmad/_bmad-output/implementation-artifacts/spec-1-1-scaffold-the-frontend-application.md` -- Completed scaffold decisions and test conventions; do not modify this prior story spec.

## Tasks & Acceptance

**Execution:**

- [x] `frontend/src/services/filmService.ts` -- Fetch and type the film array from `https://ghibliapi.vercel.app/films` -- isolate external I/O and preserve the API boundary.
- [x] `frontend/src/stores/films.ts` -- Add catalog, loading, and request-error state plus a single load action -- share request state with Home without introducing later-story behavior.
- [x] `frontend/src/components/FilmCard.vue` -- Render available image, title, and description with stable aspect ratio and two-line truncation -- reuse one card contract per film.
- [x] `frontend/src/views/HomeView.vue` -- Load on mount, show skeletons while pending, and render the responsive card grid on success -- deliver the Home browsing flow.
- [x] `frontend/src/__tests__/catalog.spec.ts` -- Mock the fetch boundary and verify request, loading, success, partial data, responsive classes, and card fields -- cover the story's observable behavior.

**Acceptance Criteria:**

- Given Home mounts, when the request is pending, then skeleton cards appear and expose a loading state accessibly.
- Given the request succeeds with films, when loading completes, then one card is rendered for each film and shows only its available image, title, and description.
- Given a film has an image, when its card renders, then the image has descriptive alternative text derived from the film title.
- Given a film field is missing, when its card renders, then the missing field is omitted without placeholder text and card dimensions remain stable.
- Given the viewport is mobile, tablet, or desktop, when the grid renders, then it uses two, four, or at least six columns respectively; images use a centered crop and descriptions never exceed two rows.
- Given the device requests reduced motion, when skeletons are visible, then their motion is static or reduced to a subtle treatment.
- Given a catalog request succeeds, when Home is mounted once, then exactly one catalog request is made and card rendering makes no additional requests.
- Given the catalog request fails or returns an empty array, when loading completes, then Home displays `Unable to load films` without retry controls.
- Given the catalog fetch service is implemented, when focused tests run, then they verify the endpoint, pending state, successful array rendering, and partial records without relying on live API availability.

### Review Findings

- [x] [Review][Patch] Reject empty and duplicate catalog IDs [frontend/src/services/filmService.ts:27]
- [x] [Review][Patch] Cover invalid IDs and optional field types in catalog tests [frontend/src/__tests__/catalog.spec.ts:168]
- [x] [Review][Patch] Verify effective mobile, tablet, and desktop column counts [frontend/src/__tests__/catalog.spec.ts:139]
- [x] [Review][Patch] Assert that no sample films are shown while loading [frontend/src/__tests__/catalog.spec.ts:81]

#### Rejected

- `false` — The spec being `done` while the sprint story is `review` is the intended transition between Build completion and the separate code-review gate; the tracker will be synced after this review.
- `low` — Measurable theme contrast remains a product-owner/developer follow-up already tracked in `deferred-work.md`; this catalog review does not change the approved theme, and editing its frozen spec is outside this review.

## Implementation Notes

- Implemented the catalog fetch/store flow, loading and unavailable states, and accessible responsive film cards with stable image sizing, two-line descriptions, and reduced-motion skeleton styling.
- Set the six-column breakpoint to Vuetify `lg` for both skeletons and film cards so it applies at desktop widths; the responsive test verifies the corresponding grid classes.
- Validate catalog records before rendering, provide fallback alt text when a poster has no title, and cover invalid records, rejected requests, image sources, card sizing, truncation, and reduced-motion styling in focused tests.
- The live catalog endpoint was not exercised; catalog behavior is covered with mocked fetch responses.

## Verification

**Commands:**

- `npm --prefix frontend run test:unit -- --run` -- passed: 2 test files, 13 tests.
- `npm --prefix frontend run build` -- passed: TypeScript check and Vite production build.
- `git diff --check` -- passed.

## Review Triage Log

| Reviewer finding | Verdict and evidence |
| --- | --- |
| Blind Hunter: malformed catalog records could reach rendering and crash the catalog. | `medium — patch`: the fetch boundary now validates IDs and optional field types; a malformed-record test confirms the unavailable state is shown instead of rendering invalid data. |
| Edge Case Hunter: a `null` catalog entry could reach rendering. | `medium — patch`: this is the same input-validation defect; the new record guard and malformed-record test cover it. |
| Blind Hunter: an image without a film title had empty alternative text. | `medium — patch`: untitled posters now have the descriptive fallback `Film poster`, covered by the catalog test. |
| Edge Case Hunter: an image without a title was treated as decorative. | `medium — patch`: this is the same alternative-text defect; the fallback text is asserted in the catalog test. |
| Blind Hunter: a rejected network request was not tested. | `low — patch`: a rejected-fetch test now verifies the unavailable message and absence of retry controls. |
| Blind Hunter: reduced-motion behavior was not tested. | `low — patch`: the catalog test now verifies the reduced-motion CSS rule disables skeleton animation. |
| Blind Hunter: the two-line description limit was not tested. | `low — patch`: the catalog test now verifies the description line clamp. |
| Blind Hunter: the missing-image frame ratio was not tested. | `low — patch`: the catalog test now verifies the reserved image-frame aspect ratio. |
| Edge Case Hunter: tablet landscape widths of 960–1279px use two columns. | `false`: Vuetify's `sm="3"` spans one quarter of the grid (four cards per row) until `lg`; `lg="2"` spans one sixth (six cards per row), not two. The installed Vuetify `lg` threshold is 1145px, so the claimed two-column outcome does not occur. |
| Verification Gap Reviewer: the supplied image URL was not asserted. | `low — patch`: the catalog test now compares the rendered image source with the fixture URL. |
| Verification Gap Reviewer: card frame sizing and description truncation were not asserted. | `low — patch`: the test now verifies both corresponding CSS rules. |
| Verification Gap Reviewer: reduced-motion behavior was not asserted. | `low — patch`: the test now verifies the reduced-motion media rule and its disabled animation declaration. |
