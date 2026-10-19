---
status: final
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - step-03-create-stories
inputDocuments:
  - _bmad-output/planning-artifacts/prds/prd-bmad-2026-10-16/prd.md
  - _bmad-output/planning-artifacts/prds/prd-bmad-2026-10-16/addendum.md
  - _bmad-output/planning-artifacts/architectures/architecture-bmad-2026-10-19/architecture.md
  - _bmad-output/planning-artifacts/ux-designs/ux-bmad-2026-10-16/DESIGN.md
  - _bmad-output/planning-artifacts/ux-designs/ux-bmad-2026-10-16/EXPERIENCE.md
  - _bmad-output/planning-artifacts/briefs/brief-bmad-2026-10-15/brief.md
  - _bmad-output/planning-artifacts/briefs/brief-bmad-2026-10-15/addendum.md
  - _bmad-output/api_structure.md
---

# Muvdash - Epic Breakdown

## Overview

This document organizes requirements from the Muvdash PRD, UX contract, architecture, product brief, and API structure into implementation-ready epics and stories. Stories are ordered for strictly sequential implementation; parallel implementation is intentionally not planned.

## Requirements Inventory

### Functional Requirements

- FR1: When the Home route mounts, fetch the Studio Ghibli film catalog and show skeleton film cards while the request is loading.
- FR2: Display each film as a selectable card containing only its image, title, and description; limit the description to two rows and open the selected film's details.
- FR3: If catalog loading fails or returns an empty list, show the same friendly unavailable state with an action that retries the catalog request.
- FR4: Filter the loaded catalog client-side using partial, case-insensitive matches across title, release date, producer, director, and description; clearing the query restores all fetched films.
- FR5: When a query has no matches, show a friendly no-results state distinct from the unavailable-catalog state.
- FR6: Open a centered details modal for a selected film, show available film fields and resolved related Ghibli data, and provide an X close control.
- FR7: If a related-data request fails, show an error modal containing only a friendly error message and X close control; do not show partial film details or a retry action.
- FR8: Provide reachable Contact and About routes, each showing simple text identifying the current page in the first release.
- FR9: Provide visual aids, tooltips, or additional information where needed to help visitors understand the interface and film information. The specific targets are not identified in the UX contract and need confirmation.

### NonFunctional Requirements

- NFR1: Use a mobile-first responsive experience; the card grid targets two columns on mobile, four on tablet, and six or more on desktop.
- NFR2: Meet WCAG 2.2 AA contrast requirements and provide keyboard access, visible focus, usable touch targets, and meaning that does not rely on color alone.
- NFR3: Respect reduced-motion preferences by retaining interactions while reducing animation intensity and duration.
- NFR4: Tolerate missing film fields and related-data failures gracefully; omit absent details rather than displaying placeholders or raw API identifiers/URLs.
- NFR5: Keep search immediate and client-side. No numeric performance threshold is specified.

### Additional Requirements

- Implement a single client-side Vue 3 application using Vite, TypeScript, Pinia, Vue Router, and Vuetify; no backend is in MVP scope.
- Fetch the catalog from `https://ghibliapi.vercel.app/films`. Request related resources only as needed and only from URLs supplied by the Ghibli API data; load image assets from their supplied URLs.
- Isolate API access in a service or composable layer. Keep state limited to catalog/loading/error, selected film, search/view/modal/navigation UI, and theme preference.
- Persist the selected theme in localStorage; use dark mode by default when no saved preference exists.
- Preserve the architecture's focused test coverage for catalog loading/error states, search, details, theme persistence, and route navigation.
- FR-9's target elements were not specified in the UX contract. Story 1.7 proposes guidance for the icon-only mobile menu and card-view control, using the tooltip interaction rules recorded in the UX memlog; review this scope before implementation.

### UX Design Requirements

- UX-DR1: Implement dark and light design tokens using the approved purple, turquoise, orange, and text roles; maintain WCAG 2.2 AA contrast in both themes.
- UX-DR2: Apply the friendly, restrained visual direction: readable compact typography, consistent hierarchy, softly rounded cards/buttons/modal, and subtle shadows.
- UX-DR3: Keep the header sticky on all breakpoints. Keep search directly below it, sticky while scrolling, and more compact in its scrolled state.
- UX-DR4: Show the MuvDash text logo at the left linking to Home; use text route labels Home, Contact, and About. On mobile, use a burger menu that closes on outside tap, close action, or route selection; show route links on larger screens.
- UX-DR5: Use a consistent responsive card grid with two columns on mobile, four on tablet, and six or more on desktop. Keep card dimensions consistent and center-crop images when needed.
- UX-DR6: Provide portrait and landscape card modes. Default to portrait imagery; place the view toggle by search and update its icon to communicate the active mode.
- UX-DR7: Cards show only image, title, and description; descriptions are limited to two rows. Preserve the image-first, title-second hierarchy in both modes.
- UX-DR8: Present details in a centered modal with film image/title followed by description, director, producer, release date, running time, score, people, species, locations, and vehicles. Omit absent fields, resolve relationships, hide raw IDs/URLs, and allow scrolling when needed.
- UX-DR9: Provide an always-visible two-option light/dark theme control with sun/moon icons; highlight the active option, place it according to the responsive header design, default to dark, and persist/restore the selection through localStorage.
- UX-DR10: Use subtle transitions for search, card feedback, menu expansion, and modal appearance; reduce their intensity and duration when reduced motion is requested.
- UX-DR11: Make all key interactions keyboard- and touch-accessible with visible focus states, comfortable touch targets, and no color-only meaning.
- UX-DR12: Use friendly, clear, supportive copy for loading/error/empty states and concise informational Contact/About pages.
- UX-DR13: Confirm which interface elements need tooltips or other explanatory aids, then specify their interaction behavior; this is not resolved by the current UX contract.

### FR Coverage Map

FR1: Epic 1 - Load the catalog and show its loading state.
FR2: Epic 1 - Browse selectable film cards; Epic 2 - open the selected film's details.
FR3: Epic 1 - Recover from an unavailable or empty catalog.
FR4: Epic 1 - Search the catalog and restore it when the query is cleared.
FR5: Epic 1 - Show a distinct no-results state.
FR6: Epic 2 - View a selected film's details and resolved related data.
FR7: Epic 2 - Show the specified error modal when related data fails.
FR8: Epic 1 - Navigate to the Contact and About routes.
FR9: Epic 1 - Provide contextual guidance for the mobile menu and card-view control as proposed in Story 1.7.

### UX-DR Coverage Map

UX-DR1: Stories 1.1 and 1.6 - Implement approved theme tokens and contrast.
UX-DR2: Stories 1.1, 1.2, 1.3, and 2.1 - Apply the visual direction to the app shell, cards, unavailable state, and modal.
UX-DR3: Stories 1.3 and 1.4 - Keep the header and compacting search sticky without overlap.
UX-DR4: Story 1.3 - Implement logo, routes, responsive navigation, and mobile dismissal behavior.
UX-DR5: Stories 1.1 and 1.5 - Implement responsive, consistent card sizing and image cropping in both card modes.
UX-DR6: Story 1.5 - Implement portrait/landscape view selection and state icon.
UX-DR7: Stories 1.1 and 1.5 - Preserve card fields, hierarchy, and description truncation in both modes.
UX-DR8: Stories 2.1 and 2.2 - Implement the modal layout and resolved related fields.
UX-DR9: Story 1.6 - Implement accessible theme selection and persistence.
UX-DR10: Stories 1.1-1.7 and 2.1-2.2 - Apply subtle motion and reduced-motion behavior to loading and interactive transitions.
UX-DR11: All stories - Each story's acceptance criteria verify keyboard/touch access, visible focus, comfortable targets, and non-color cues for its interactive controls.
UX-DR12: Stories 1.2, 1.3, 1.4, and 2.2 - Provide clear, supportive empty/error and informational copy.
UX-DR13: Story 1.7 - Implement and review contextual guidance targets and interactions.

## Epic List

### Epic 1: Browse and Find Ghibli Films

Visitors can open Muvdash, browse the responsive film catalog, search by film information, recover from loading and empty states, switch card presentation, and navigate the informational routes. This epic delivers a useful catalog experience independently. Shared shell, theme, accessibility, responsive behavior, and visual design are included where needed to complete that experience.

**FRs covered:** Catalog portions of FR1-FR5, FR8, and FR9. FR2's detail-opening behavior is completed in Epic 2.

### Epic 2: Explore a Film's Details

Visitors can open a selected film to inspect its available information and resolved related Ghibli data, with a clear error experience if related data cannot be loaded. This epic builds on the selectable film catalog from Epic 1 and remains a complete detail experience within its domain.

**FRs covered:** Detail-opening portion of FR2, FR6, and FR7.

## Epic 1: Browse and Find Ghibli Films

Visitors can open Muvdash, browse and search the responsive Studio Ghibli catalog, recover from empty and error states, change card presentation, and navigate the informational routes.

### Story 1.1: Browse the Film Catalog

As a visitor,
I want to open Home and see the Studio Ghibli film catalog,
So that I can browse the available films.

**Acceptance Criteria:**

**Given** the Home route has started loading the catalog,
**When** the request is pending,
**Then** skeleton film cards are displayed.

**Given** the catalog request succeeds,
**When** films are displayed,
**Then** each card shows its image, title, and description only,
**And** descriptions are limited to two rows.

**Given** the visitor views the catalog at mobile, tablet, or desktop widths,
**When** the grid is rendered,
**Then** it uses two columns on mobile, four on tablet, and six or more on desktop,
**And** cards remain consistent in size and images are center-cropped as needed.

**Given** the visitor navigates the catalog by keyboard,
**When** interactive controls receive focus,
**Then** focus is visible and meaning is not conveyed by color alone.

**Given** the interface is rendered in either theme,
**When** text and controls appear,
**Then** the approved design tokens and WCAG 2.2 AA contrast requirements are respected.

**Given** the Home experience is rendered,
**When** cards and shared surfaces are displayed,
**Then** the approved purple/turquoise/orange roles, compact readable typography, softly rounded corners, and restrained shadows are applied.

**Given** the device requests reduced motion,
**When** catalog skeletons are displayed,
**Then** their animation is reduced to a subtle transition or static treatment.

**Given** a film card is interactive,
**When** it is used by keyboard or touch,
**Then** it has a visible focus state and a comfortable target size.

**Given** catalog loading and card rendering are implemented,
**When** focused automated tests run,
**Then** they verify the initial request, loading state, and rendered card fields.

**Implementation order:** 1 overall; first story in Epic 1.
**Technical dependencies:** None.
**Implementation constraints:** Use the client-only Vue 3, Vite, TypeScript, Pinia, Vue Router, and Vuetify stack; fetch the catalog from `https://ghibliapi.vercel.app/films`; isolate API access in a service or composable with minimal state; do not add a backend.
**Requirements:** FR1, FR2; NFR1, NFR2, NFR3; UX-DR1, UX-DR2, UX-DR5, UX-DR7, UX-DR10, UX-DR11.
**Parallel implementation:** No. Implement stories one at a time as requested.

### Story 1.2: Recover from an Unavailable Catalog

As a visitor,
I want to retry when the catalog cannot be loaded,
So that I can still browse films if the service becomes available.

**Acceptance Criteria:**

**Given** the catalog request fails or returns an empty list,
**When** loading finishes,
**Then** Home shows the same friendly unavailable-catalog state with a retry action.

**Given** the visitor selects retry,
**When** a new catalog request starts,
**Then** the app shows its loading state and requests the catalog again.

**Given** the retry succeeds with films,
**When** loading finishes,
**Then** the unavailable state is replaced by the film cards.

**Given** the retry fails or returns an empty list,
**When** loading finishes,
**Then** the unavailable state remains available for another retry.

**Given** a search has no matches,
**When** the no-results state appears,
**Then** it remains distinct from the unavailable-catalog state.

**Given** the unavailable state is displayed,
**When** its copy and retry action are rendered,
**Then** they follow the friendly, clear visual and tone direction.

**Given** the unavailable card is rendered,
**When** it appears in either theme,
**Then** it uses the shared card treatment, approved color roles, softly rounded corners, and restrained shadow.

**Given** the device requests reduced motion,
**When** the unavailable state changes to loading or results,
**Then** any transition is subtle or reduced.

**Given** retry is available,
**When** the visitor operates it by keyboard or touch,
**Then** it has a visible focus state, accessible name, comfortable target size, and does not rely on color alone to convey its action.

**Given** catalog error recovery is implemented,
**When** focused automated tests run,
**Then** they verify failed and empty responses, retry, and successful recovery.

**Implementation order:** 2 overall; second story in Epic 1.
**Technical dependencies:** Story 1.1's catalog loading and rendering path.
**Requirements:** FR3, FR5; NFR2, NFR3; UX-DR2, UX-DR10, UX-DR11, UX-DR12.
**Parallel implementation:** No. Implement stories one at a time as requested.

### Story 1.3: Navigate the App

As a visitor,
I want to move between Home, Contact, and About,
So that I can browse films and access the app's informational pages.

**Acceptance Criteria:**

**Given** the app is open,
**When** the visitor selects the MuvDash logo,
**Then** the Home route is displayed.

**Given** the visitor selects Contact or About,
**When** the route changes,
**Then** the corresponding page is displayed with simple text identifying that page.

**Given** any route is displayed,
**When** the header and route content are rendered,
**Then** they use the approved color roles, compact readable typography, and consistent visual hierarchy.

**Given** the viewport is mobile-sized,
**When** the visitor activates the menu button,
**Then** a navigation panel with text links for Home, Contact, and About opens.

**Given** the mobile navigation panel is open,
**When** the visitor taps outside it, selects its close control, or selects a route,
**Then** the panel closes.

**Given** the viewport is tablet or desktop-sized,
**When** the app is displayed,
**Then** text route links appear in the header and the header remains visible while scrolling.

**Given** navigation is used with keyboard or touch,
**When** a control is focused or activated,
**Then** it has a visible focus state, usable accessible name, and comfortable target size; menu transitions are subtle and reduced when requested by the device, and state is not conveyed by color alone.

**Given** route navigation is implemented,
**When** focused automated tests run,
**Then** they verify Home, Contact, and About navigation and mobile menu dismissal.

**Implementation order:** 3 overall; third story in Epic 1.
**Technical dependencies:** Story 1.1's app shell and Home route.
**Requirements:** FR8; NFR2, NFR3; UX-DR2, UX-DR3, UX-DR4, UX-DR10, UX-DR11, UX-DR12.
**Parallel implementation:** No. Implement stories one at a time as requested.

### Story 1.4: Search the Catalog

As a visitor,
I want to search films by their information,
So that I can quickly find a film I am interested in.

**Acceptance Criteria:**

**Given** the catalog has loaded,
**When** the visitor enters a query,
**Then** results match partial, case-insensitive text in title, release date, producer, director, or description without another catalog request.

**Given** a search query is active,
**When** the visitor clears it,
**Then** the complete fetched catalog is restored.

**Given** a query matches no films,
**When** results are displayed,
**Then** a friendly no-results message appears, distinct from the unavailable-catalog state, with a way to clear the query and return to the full list.

**Given** the visitor scrolls the Home page,
**When** the page moves,
**Then** search remains visible directly below the sticky header and compacts without overlap.

**Given** the visitor uses search by keyboard or touch,
**When** the input and clear action are focused or activated,
**Then** both are accessible, retain visible focus, provide comfortable target sizes, and do not rely on color alone to convey state.

**Given** the device requests reduced motion,
**When** search becomes compact or its results update,
**Then** the transition remains subtle or is reduced.

**Given** search is implemented,
**When** focused automated tests run,
**Then** they verify matching across all five fields, partial case-insensitive matching, no-results behavior, and query clearing.

**Implementation order:** 4 overall; fourth story in Epic 1.
**Technical dependencies:** Stories 1.1 and 1.3 for the loaded catalog, Home view, and sticky header.
**Requirements:** FR4, FR5; NFR2, NFR3, NFR5; UX-DR3, UX-DR10, UX-DR11, UX-DR12.
**Parallel implementation:** No. Implement stories one at a time as requested.

### Story 1.5: Switch Card Image Orientation

As a visitor,
I want to switch between portrait and landscape film cards,
So that I can browse using the image presentation I prefer.

**Acceptance Criteria:**

**Given** the catalog is displayed for the first time,
**When** the Home view renders,
**Then** cards use each film's portrait image field.

**Given** portrait cards are active,
**When** the visitor activates the view control,
**Then** cards use the landscape image field and the control communicates the active mode.

**Given** landscape cards are active,
**When** the visitor activates the view control again,
**Then** cards return to portrait images and the control updates to communicate that mode.

**Given** either card mode is active,
**When** the grid is displayed,
**Then** it remains multi-column with consistent card sizes, the image above the information, and the same image/title/description hierarchy.

**Given** the visitor operates the control by keyboard or touch,
**When** it is focused or activated,
**Then** it has a visible focus state and comfortable target size, its accessible name/state identifies the mode change without relying on color alone, and transition motion is reduced when requested by the device.

**Given** card view switching is implemented,
**When** focused automated tests run,
**Then** they verify the default portrait mode and both directions of the view toggle.

**Implementation order:** 5 overall; fifth story in Epic 1.
**Technical dependencies:** Stories 1.1 and 1.4 for film cards and the search toolbar where the control is placed.
**Requirements:** FR2; NFR1, NFR2, NFR3; UX-DR5, UX-DR6, UX-DR7, UX-DR10, UX-DR11.
**Parallel implementation:** No. Implement stories one at a time as requested.

### Story 1.6: Choose and Remember a Theme

As a visitor,
I want to choose light or dark appearance,
So that I can comfortably use Muvdash in my preferred theme.

**Acceptance Criteria:**

**Given** no theme preference is stored,
**When** the app starts,
**Then** dark theme is applied.

**Given** a theme preference is stored,
**When** the app starts,
**Then** that preference is restored.

**Given** the visitor selects Light or Dark,
**When** the choice changes,
**Then** the active option is highlighted, the theme updates across routes, and the choice is saved in localStorage.

**Given** the theme control is displayed,
**When** it appears in the header,
**Then** Light with a sun icon is on the left and Dark with a moon icon is on the right; the control remains visible on every breakpoint, before the mobile menu on phones and after navigation on larger screens.

**Given** either theme is active,
**When** interface surfaces and text are rendered,
**Then** the approved role colors and WCAG 2.2 AA contrast are maintained and the active state is not conveyed by color alone.

**Given** the visitor uses the theme control by keyboard or touch,
**When** it receives focus or is activated,
**Then** its focus state is visible and its targets are comfortable to activate.

**Given** the device requests reduced motion,
**When** the visitor changes the theme,
**Then** theme transitions remain subtle or are reduced.

**Given** theme selection is implemented,
**When** focused automated tests run,
**Then** they verify the dark default, restoration of a saved preference, and persistence after a theme change.

**Implementation order:** 6 overall; sixth story in Epic 1.
**Technical dependencies:** Stories 1.1 and 1.3 for theme tokens and the responsive header.
**Requirements:** NFR2, NFR3; UX-DR1, UX-DR9, UX-DR10, UX-DR11.
**Parallel implementation:** No. Implement stories one at a time as requested.

### Story 1.7: Get Contextual Help for Icon Controls

As a visitor,
I want brief explanations for icon-only controls,
So that I can understand their actions before using them.

**Acceptance Criteria:**

**Given** the mobile menu or card-view control is displayed,
**When** the visitor activates its icon by click or tap,
**Then** a concise tooltip explains the control's action.

**Given** a tooltip is open,
**When** the visitor activates the same control, taps outside, selects a route, or performs another app action,
**Then** the tooltip closes.

**Given** a tooltip-triggering control is used with a keyboard,
**When** it receives focus or is activated,
**Then** its focus state is visible, the explanation is available to assistive technology, it has a comfortable target size, and its meaning does not rely on color alone.

**Given** a tooltip is visible,
**When** the visitor changes route or the reduced-motion preference is active,
**Then** the tooltip closes on the route change and any transition remains subtle.

**Given** contextual guidance is implemented,
**When** focused automated tests run,
**Then** they verify activation, accessible description, and the specified dismissal behavior.

**Implementation order:** 7 overall; seventh story in Epic 1.
**Technical dependencies:** Stories 1.3 and 1.5 for the mobile menu and card-view control.
**Requirements:** FR9; NFR2, NFR3; UX-DR10, UX-DR11, UX-DR13.
**Parallel implementation:** No. Implement stories one at a time as requested.

## Epic 2: Explore a Film's Details

Visitors can open a selected film to inspect its available information and resolved related Ghibli data, with a clear error experience if related data cannot be loaded.

### Story 2.1: Open and Read Film Details

As a visitor,
I want to open a film's details from its card,
So that I can understand the film before choosing what to watch.

**Acceptance Criteria:**

**Given** the catalog is displayed,
**When** the visitor activates a film card's details action,
**Then** a centered modal opens for that film with its image and title.

**Given** the modal is open,
**When** film details are displayed,
**Then** available description, director, producer, release date, running time, and score appear after the image and title in that order.

**Given** one or more requested film fields are absent,
**When** the modal is rendered,
**Then** absent fields are omitted without placeholders, raw IDs, or raw URLs.

**Given** the modal is displayed on a phone or a larger viewport,
**When** its content is rendered,
**Then** it remains centered, uses the available viewport appropriately, and permits internal vertical scrolling when needed; phone typography is compact enough to prioritize visible content.

**Given** the visitor activates the X close control,
**When** the modal is open,
**Then** it closes and returns the visitor to the catalog context.

**Given** the modal opens or closes,
**When** motion is enabled or reduced-motion is requested,
**Then** its transition is subtle or reduced respectively, and keyboard focus remains visible and usable.

**Given** the modal is open,
**When** the visitor uses its controls by keyboard or touch,
**Then** controls have visible focus, comfortable target sizes, and accessible names, and their meaning does not rely on color alone.

**Given** the core details modal is implemented,
**When** focused automated tests run,
**Then** they verify the selected film, available core fields, and modal closing behavior.

**Implementation order:** 8 overall; first story in Epic 2.
**Technical dependencies:** Story 1.1's film cards and selected-film data.
**Requirements:** FR2, FR6; NFR2, NFR3, NFR4; UX-DR2, UX-DR8, UX-DR10, UX-DR11.
**Parallel implementation:** No. Implement stories one at a time as requested.

### Story 2.2: Show Resolved Related Film Information

As a visitor,
I want to see a film's related people, species, locations, and vehicles,
So that I can explore the additional information supplied by the Ghibli API.

**Acceptance Criteria:**

**Given** the visitor opens film details,
**When** the selected film references related-resource URLs,
**Then** the app requests only the referenced Studio Ghibli resources needed for the details and displays resolved people, species, locations, and vehicles after the film's core fields.

**Given** a related category or field is absent or has no usable data,
**When** the details are rendered,
**Then** that field is omitted rather than showing a placeholder, raw ID, or URL.

**Given** any required related-resource request fails,
**When** the details response is handled,
**Then** an error modal is shown instead of film details or partial related data.

**Given** the related-data error modal is shown,
**When** its content is rendered,
**Then** it contains only a friendly error message and an X close control, with no retry action.

**Given** the related-data error modal is open,
**When** the visitor activates its X close control,
**Then** the modal closes and returns the visitor to the catalog context.

**Given** the related-data error modal is displayed,
**When** it opens or closes with motion enabled or reduced-motion requested,
**Then** its transition is subtle or reduced respectively.

**Given** the visitor operates the error modal by keyboard or touch,
**When** the close control receives focus or is activated,
**Then** it has visible focus, a comfortable target size, an accessible name, and its meaning does not rely on color alone.

**Given** related-data resolution is implemented,
**When** focused automated tests run,
**Then** they verify resolved relationship data, omission of absent fields, and the error-only modal on request failure.

**Implementation order:** 9 overall; second story in Epic 2.
**Technical dependencies:** Story 2.1's details modal and selected-film context.
**Requirements:** FR6, FR7; NFR2, NFR3, NFR4; UX-DR8, UX-DR10, UX-DR11, UX-DR12.
**Parallel implementation:** No. Implement stories one at a time as requested.
