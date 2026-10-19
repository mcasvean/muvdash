# Epic 1 Context: Browse and Find Ghibli Films

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Deliver a usable, mobile-first Studio Ghibli catalog where visitors can browse and search films, recover from an unavailable catalog, switch card image orientation, and reach the Contact and About routes. Epic 1 provides a useful catalog experience independently; film-detail exploration is completed in Epic 2.

## Stories

- Story 1.1: Scaffold the Frontend Application
- Story 1.2: Browse the Film Catalog
- Story 1.3: Recover from an Unavailable Catalog
- Story 1.4: Navigate the App
- Story 1.5: Search the Catalog
- Story 1.6: Switch Card Image Orientation
- Story 1.7: Choose and Remember a Theme
- Story 1.8: Get Contextual Help for Icon Controls

## Requirements & Constraints

- When Home mounts, fetch the film catalog from `https://ghibliapi.vercel.app/films` and show skeleton cards while loading. A failed request or empty catalog uses the same friendly unavailable state with retry; a search with no matches uses a distinct state.
- Film cards contain only image, title, and description, with descriptions limited to two rows. Keep card sizing consistent and images center-cropped as needed. Target two columns on mobile, four on tablet, and six or more on desktop.
- Filter the loaded catalog immediately on the client by partial, case-insensitive matches in title, release date, producer, director, and description. Clearing search restores the fetched catalog without another request.
- Provide Home, Contact, and About routes. Contact and About need only identify the current page in this release.
- Design mobile-first for keyboard and touch use, with visible focus, comfortable targets, and meaning not conveyed by color alone. Meet WCAG 2.2 AA contrast requirements and reduce motion intensity and duration when requested.
- Story 1.8's proposed tooltip targets are the mobile menu and card-view control. Product-owner confirmation of these targets is required before implementation; do not add other targets without approval.

## Technical Decisions

- Create the frontend at the Git repository root, alongside the `bmad/` directory; preserve existing BMAD files and the repository license.
- Use one client-side Vue 3 application with Vite, TypeScript, Pinia, Vue Router, and Vuetify. No backend is in MVP scope.
- Separate route pages, UI components, API access, and state responsibilities without unnecessary abstraction. Isolate API access in a service or composable; keep state limited to catalog/loading/error, selected film, search/view/modal/navigation UI, and theme preference.
- Use the Ghibli data as the boundary for catalog records, related-resource URLs, and supplied image assets. Do not query independent providers or unrelated endpoints; request related data only when needed for film details.
- Tolerate missing fields and request failures. Omit absent information rather than showing placeholders or raw API identifiers/URLs. Keep focused automated coverage for catalog loading/recovery, search, theme persistence, and route navigation.

## UX & Interaction Patterns

- Preserve the image-first card hierarchy in portrait and landscape modes. Default to portrait imagery and place the compact view control beside search.
- Use the defined purple, turquoise, orange, and text color roles across dark and light themes; keep typography compact and readable, hierarchy clear, corners softly rounded, and shadows restrained.
- Keep the header sticky and search directly beneath it, visible while scrolling and compacting without overlap. Use text route labels and a MuvDash text logo linking to Home. Mobile navigation dismisses on outside tap, close action, or route selection; larger layouts show route links.
- Keep a two-option light/dark control visible at all breakpoints, with sun/moon icons and a highlighted active option. Default to dark without a saved preference and persist the choice in `localStorage`.
- Use subtle interaction transitions and reduce them when the device requests reduced motion. Keep copy friendly, clear, and supportive.

## Cross-Story Dependencies

- Implement stories strictly one at a time in the listed order. The scaffold precedes catalog browsing; subsequent catalog, route, search, view, theme, and guidance work builds on the relevant app shell or catalog controls.
- Epic 2 depends on Epic 1's selectable film catalog. The details modal and related-data behavior belong to Epic 2.
