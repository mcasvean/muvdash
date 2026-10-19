---
title: Muvdash Architecture
status: final
created: 2026-10-19
updated: 2026-10-19
---

# Architecture: Muvdash

## 1. Purpose

This architecture defines the first-release client-side application structure for Muvdash, a small Vue 3 + TypeScript movie browser built around the Studio Ghibli API. The system is intentionally compact and mobile-first, with a simple route structure, a small shared state layer, and a single primary data flow for catalog browsing and film detail inspection.

## 2. Core goals

- Provide a friendly, fast browsing experience for a film catalog.
- Keep the app easy to understand and maintain for a single-project learning context.
- Support 3 routes: Home, Contact, and About.
- Use a single client app with no backend service in the MVP.
- Keep all data access within the client and aligned to the Studio Ghibli API contract.

## 3. Non-goals

- No streaming or media playback.
- No authentication or user accounts.
- No external analytics, CMS, or third-party provider beyond the Studio Ghibli data source.
- No backend application in the MVP.

## 4. Solution overview

Muvdash is a Vue 3 single-page app built with Vite and TypeScript. It uses Vue Router for route handling and Pinia for UI/state management. Vuetify is the planned component and styling system for the app shell, cards, modal, navigation, and theme controls.

The application follows a thin-client architecture where the browser fetches, normalizes, and renders data directly from the Studio Ghibli API. The app is not a multi-service system; it is a focused client experience with local state and persistent theme storage.

## 5. Technical stack

- Vue 3
- Vite
- TypeScript
- Vue Router
- Pinia
- Vuetify
- Studio Ghibli API
- Browser localStorage for theme persistence

## 6. Architectural principles

### 6.1 Client-first simplicity

The app should remain easy to reason about. Primary app logic belongs in the client layer, and the architecture avoids unnecessary abstraction.

### 6.2 Clear separation of concerns

Route pages, UI components, API access, and state are separated into distinct responsibilities.

### 6.3 Mobile-first responsive design

The app is built for small screens first, then expands to tablet and desktop layouts without reworking the underlying structure.

### 6.4 Resilience for partial data

The app should tolerate missing fields and failed requests gracefully. Missing related data should be omitted instead of rendering placeholders or broken strings.

## 7. High-level component structure

### App shell

- Root app container
- Header with brand, navigation, and theme toggle
- Sticky search bar under header
- Route outlet

### Feature modules

- Home view
  - Catalog loading state
  - Search/filter state
  - Card grid
  - View toggle (portrait/landscape)
  - Empty-state and unavailable-state handling
- Detail modal
  - Film overview
  - Resolved metadata from related resources
  - Close action
- Contact view
  - lightweight informational text
- About view
  - lightweight informational text

### Shared UI component layer

- Navigation menu
- Search input
- Movie card
- Detail modal
- Theme switch
- Empty-state / unavailable-state cards

## 8. Routing model

The app uses a simple three-route SPA structure.

- / → Home
- /contact → Contact
- /about → About

Navigation is text-based, with the logo linking to Home and route links rendered as plain labels. The mobile version uses a burger menu that expands into a route list and closes on dismissal.

## 9. State management

Pinia is used for the app-level state required by the product. The state should be deliberately limited to the minimum needed for a clean experience.

### State domains

- catalog: full film list, loading flag, and error state
- selectedFilm: currently viewed movie for the modal
- ui: search term, card layout view mode, modal open state, navigation menu visibility
- settings: theme preference

### Store responsibilities

- Fetch the film catalog from the Ghibli API.
- Keep the search filter in sync with the current query.
- Handle loading and failure states.
- Store the selected film for detail rendering.
- Persist theme in localStorage.

## 10. Data flow

### Catalog loading flow

1. Home view mounts.
2. Store dispatches a fetch for the film catalog.
3. Request resolves with film list or error.
4. Store updates loading and data state.
5. Home view renders skeletons, cards, or empty/unavailable state.

### Search flow

1. User types into the search field.
2. Store updates the query value.
3. Catalog is filtered client-side.
4. Grid re-renders with matching results.
5. No additional request is sent for filtering.

### Detail modal flow

1. User selects a film card.
2. Store sets selected film and opens the modal.
3. Detail component renders available data and resolves related resources when needed.
4. If related-resource fetch fails, the app shows a friendly error panel instead of partial film data.

## 11. API integration

The app uses the Studio Ghibli API as its data source and minimal data boundary.

### Data sources

- Film list endpoint
- Individual film resource endpoints
- Related resource URLs embedded in film data, such as people, species, locations, and vehicles
- Image assets referenced by the record payload

### Fetch rules

- Do not add non-Ghibli providers or alternate APIs.
- Use relation URLs only when needed to render detail data.
- Handle unresolved or missing fields without placeholders.
- Keep API access isolated to a single service or composable layer for easy testing and future maintenance.

## 12. UI composition and styling

### Visual system

- Dark-first palette with purple surfaces, turquoise accent, orange support accent.
- Softly rounded corners and understated shadows.
- Mobile-first layout with dense, scannable cards.
- Friendly but readable typography.

### Framework choice

Vuetify provides the component baseline while the app retains custom styling choices for the brand system. This keeps the project cohesive while still allowing a tailored identity.

## 13. Theme handling

The theme is controlled through a dedicated setting in localStorage.

- Default theme: dark
- If saved value exists, use it
- Toggle updates both app theme and stored preference
- Theme change is global and applies to all routes and shared surfaces

## 14. Error handling and resilience

- Catalog load failure shows an unavailable-friendly card with retry action.
- Empty search results show a no-results state.
- Failed related-resource fetches result in an error modal rather than broken detail content.
- Missing detail fields are omitted instead of rendered as placeholders.

## 15. Accessibility requirements

- Respect WCAG 2.2 AA color contrast requirements.
- Ensure keyboard access for navigation, search, theme switch, and modal close controls.
- Provide visible focus states.
- Support reduced motion via subtler transitions when system preference requests it.

## 16. Testing strategy

The MVP should include a focused test strategy covering core behaviors:

- home catalog loads correctly
- empty and error states render as designed
- search filters results correctly
- film detail modal opens with expected fields
- theme preference persists across reloads
- route navigation works across Home, Contact, and About

## 17. Risks and tradeoffs

### Risk: data variability

The Studio Ghibli API may omit fields, although the app is designed to handle that gracefully.

### Risk: over-architecture

The app is intentionally simple to keep it easy to learn and maintain; the team should resist adding unnecessary layering.

### Risk: visual polish outpacing usability

The design should remain readable and simple, with motion and color reserved for supportive UI cues instead of distracting decoration.

## 18. Recommendation

Proceed with the MVP as a single-page Vue app with a small Pinia store, simple route-level views, and one centralized API composable or service layer. This gives the project a clean structure while staying well within the learning and scope goals of the first release.
