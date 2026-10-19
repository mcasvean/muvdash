# Epic 1 Context: Browse and Find Ghibli Films

<!-- Compiled from planning artifacts. Edit freely. Regenerate with compile-epic-context if planning docs change. -->

## Goal

Deliver a useful, friendly Studio Ghibli catalog experience: visitors can browse a responsive film grid, find films through client-side search, recover from unavailable catalog data, choose a card presentation, and reach the Contact and About pages. The catalog should be useful independently of the film-details experience in Epic 2.

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

- The Home route fetches the catalog from `https://ghibliapi.vercel.app/films` when it mounts and shows skeleton cards while loading. A failed request or empty catalog uses the same friendly unavailable state with a retry action; no search matches use a distinct state.
- Cards show only film image, title, and description; descriptions are limited to two rows. Keep cards consistently sized with centered image crops as needed. The responsive grid targets two columns on mobile, four on tablet, and six or more on desktop.
- Search filters the loaded catalog immediately on the client, matching partial, case-insensitive text in title, release date, producer, director, and description. Clearing the query restores the full catalog without another catalog request.
- Home, Contact, and About are in scope. Contact and About need only simple identifying text for this release.
- Use a mobile-first experience and support keyboard and touch operation, visible focus, comfortable targets, and meaning that does not depend on color alone. Meet WCAG 2.2 AA contrast requirements and reduce motion intensity and duration when requested.
- Apply the defined purple, turquoise, orange, and text roles in both themes, with compact readable typography, a clear hierarchy, softly rounded surfaces, and restrained shadows. Keep the experience friendly, legible, and supportive rather than decorative.
- Search and navigation stay accessible while scrolling: the header is sticky, and search sits directly beneath it and compacts without overlap. Mobile navigation uses a dismissible menu; larger layouts show text route links.
- Keep the two-option light/dark theme control visible across breakpoints. Default to dark when no preference is saved and persist the chosen theme in `localStorage`.
- Do not invent tooltip targets or guidance behaviors beyond the defined icon-control scope. The UX artifacts do not settle broader guidance targets.

## Technical Decisions

- Create the frontend at the Git repository root, alongside (not inside) the `bmad/` planning/tooling directory. Preserve the existing BMAD files and license.
- Implement one client-side Vue 3 application using Vite, TypeScript, Pinia, Vue Router, and Vuetify. No backend is in MVP scope.
- Keep route pages, UI components, API access, and state responsibilities separate without unnecessary abstraction. Isolate API calls in a service or composable; keep state limited to catalog/loading/error, selected film, search/view/modal/navigation UI, and theme preference.
- The Ghibli API data is the boundary for catalog data and supplied assets. Load images from URLs in the data; do not add independent providers or unrelated endpoints. Related resources are for details and are requested only when needed.
- Design for partial data and request failures. Omit absent information rather than rendering placeholders or raw API identifiers/URLs.
- Preserve focused automated coverage for catalog loading and error states, search, theme persistence, and route navigation.

## UX & Interaction Patterns

- Keep film cards image-first, with title and short description following; retain this hierarchy in portrait and landscape modes. Default to portrait imagery and place the compact view control beside search.
- Keep Home, Contact, and About as plain text route labels; the MuvDash text logo links to Home. The mobile menu closes on outside tap, close action, or route selection.
- The theme selector uses sun/moon icons with a visibly highlighted active option. Use subtle transitions for loading and interactions, reduced when the device requests reduced motion.

## Cross-Story Dependencies

- Implement Epic 1 stories strictly one at a time in their listed order. Story 1.1 scaffolds the frontend and registers the approved client stack; Story 1.2 builds the catalog on that foundation. Later search, view, theme, route, and help behavior builds on the relevant catalog or shell controls.
- Epic 2 depends on Epic 1's selectable film catalog; the detailed film modal and related-data behavior belong to Epic 2, not this epic's catalog-card context.
