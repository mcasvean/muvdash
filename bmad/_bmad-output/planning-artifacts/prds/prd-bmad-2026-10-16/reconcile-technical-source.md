# Technical Source Reconciliation

## Scope and precedence

This reconciliation compares the source brief addendum (`briefs/brief-bmad-2026-10-15/addendum.md`) and API example (`api_structure.md`) with the current product requirements (`prds/prd-bmad-2026-10-16/prd.md` and `addendum.md`). The PRD and its addendum are the current requirements. This document records gaps and source-artifact defects only; it does not change either PRD file or the source files.

The PRD and its addendum agree on the current Studio Ghibli data boundary: fetch the catalog from `/films`, and when details are opened, fetch related resources referenced by a film as needed. The older source addendum's statement of only the film-list endpoint is incomplete and superseded by that later decision. It must not be read as a films-only product boundary. The current PRD does not permit other data providers.

## Reconciliation findings

### 1. Related-resource API behavior is missing from the source addendum

**Source:** The brief addendum specifies `GET https://ghibliapi.vercel.app/films` and says the details modal shows fields in the API example. The example includes `people`, `species`, `locations`, and `vehicles` as arrays of resource URLs, but does not describe resolving them.

**Current requirement:** PRD §4.3 FR-6 and §5.2, together with the current addendum's Studio Ghibli API section, allow related Ghibli resources referenced by a film to be requested only when needed for that film's details. The visitor should see the related information as data, not raw URLs.

**Reconciliation:** Extend the source-side technical contract to describe this on-demand resolution behavior. Keep the film-list fetch on Home; do not fetch every related resource during catalog loading. Limit requests to Ghibli API resources referenced by the selected film. The old source wording is stale by omission, not a current prohibition.

### 2. Catalog loading, unavailable, and retry behavior is missing

**Source:** The brief addendum says to fetch the list on Home and show cards, but gives no loading or catalog-failure behavior.

**Current requirement:** PRD §4.1 FR-1 and FR-3, and the current addendum's Loading and Error States section, require skeleton movie cards during initial loading. A failed request and a successful empty response use the same friendly unavailable card, which provides a retry action. The UX phase decides skeleton appearance and motion and final wording.

**Reconciliation:** Carry these states and retry behavior into the technical/UX source. Do not conflate an empty or failed catalog with an empty search result.

### 3. Related-details failure behavior is missing

**Source:** The brief addendum defines a details modal and a close button, but does not say what happens if resolving related data fails.

**Current requirement:** PRD §4.3 FR-7 and the current addendum require an error modal in place of film details when a related-data request fails. It contains only the friendly error message and an X close control; it has no retry action. Final copy is deferred to UX.

**Reconciliation:** Add this exact failure behavior. Keep it distinct from catalog retry behavior; the details-error modal must not expose partial film details or offer retry.

### 4. Search matching and no-results behavior is underspecified

**Source:** The brief addendum lists the matching fields (`title`, `release_date`, `producer`, `director`, and `description`) and says filtering is client-side. It does not define matching semantics or the empty-result state.

**Current requirement:** PRD §4.2 FR-4 and FR-5, and the current addendum's Cards, Search, and Details and Loading and Error States sections, require partial, case-insensitive matching against those fields. Clearing the query restores the full fetched catalog. No matches display a separate friendly, funny message; final copy is deferred to UX.

**Reconciliation:** Preserve the existing field list and add the matching, clearing, and distinct no-results behavior to the source contract.

### 5. Route content and mobile-first guidance are missing

**Source:** The brief addendum says Contact and About routes are required, and defers visual style. It does not specify page content or a device-priority constraint.

**Current requirement:** PRD §4.4 FR-8 and the current addendum's Routes and Page Content section specify simple text identifying Contact or About on each route in the first release. PRD §5.1 requires a mobile-first initial experience; exact layout and responsive behavior remain UX decisions. PRD §5.3 FR-9 additionally requires the UX deliverable to identify where visual aids, tooltips, or explanatory information help visitors understand the interface and film information.

**Reconciliation:** Add the first-release route content and mobile-first constraint to the source-side UX requirements. Retain visual design, responsive details, and the specific guidance affordances as UX-phase decisions, but carry the requirement to decide them forward.

### 6. API example is not valid JSON as written

**Source:** `api_structure.md` describes the response as a JSON array, but its example ends with a comma after the film object and does not close the array.

**Current requirement:** The PRD addendum treats this file as the example film-record contract and refers to it for available fields.

**Reconciliation:** Correct the example before treating it as machine-parseable JSON. This is a source-document defect, not a disagreement about the film fields or the permitted API scope.

## Confirmed alignment

- The Vue 3, Vite, TypeScript, Pinia, and Vue Router stack in the source addendum matches the current PRD addendum.
- Home, Contact, and About routes are present in both; the current PRD adds the simple first-release Contact/About content noted above.
- The source card fields and search fields match the current addendum.
- The source details modal and close control align with the current details requirement; the current PRD adds on-demand related-data resolution and its failure behavior.
- The current PRD and addendum consistently restrict data providers to Studio Ghibli APIs.
