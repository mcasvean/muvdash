# Product and Technical Addendum

This addendum carries confirmed implementation constraints and provisional user-facing copy that support [prd.md](prd.md). The API response example is documented in [\_bmad-output/api_structure.md](../../../api_structure.md).

## Confirmed Client Stack

- Vue.js 3
- Vite
- TypeScript
- Pinia
- Vue Router
- Vuetify (component library and UI system)

## Routes and Page Content

- **Home:** Fetch the film catalog when the route component mounts; display film cards.
- **Contact:** Display simple text identifying the Contact page in the first release. Fuller content will be specified in a later feature requirement.
- **About:** Display simple text identifying the About page in the first release. Fuller content will be specified in a later feature requirement.

## Studio Ghibli API

- Fetch the film catalog with a GET request to `https://ghibliapi.vercel.app/films` when Home loads.
- When a visitor opens film details, request related-resource URLs referenced by that film as needed, such as people, species, locations, and vehicles, so the information can be presented as data rather than raw URLs.
- Load image and other asset URLs supplied in the film data, even when those URLs are hosted outside the Ghibli API domain (for example, `image.tmdb.org`).
- Do not query independent providers or endpoints that are not referenced by Studio Ghibli API data.
- The example film record and its fields are defined in [`api_structure.md`](../../../api_structure.md).
- That Markdown example is illustrative, not a complete standalone JSON response fixture.

## Cards, Search, and Details

- **Card fields:** `image`, `title`, and `description`; trim descriptions to a maximum of two rows.
- **Search fields:** `title`, `release_date`, `producer`, `director`, and `description`.
- Search is client-side, partial, and case-insensitive. Clearing the query restores the full fetched catalog.
- The details modal presents all available fields from the film record and resolves related Ghibli data as needed.
- Every modal has an X close control.

## Loading and Error States

- While the initial film list loads, show skeleton film cards. Their appearance and motion are for the UX phase.
- If the film-list request fails or succeeds with an empty list, show the same friendly card with a retry action.
- If a search returns no matching films, show a separate friendly, funny message.
- If a related-details request fails, show an error modal instead of the details. The modal contains only the error message and X close control; it has no retry action.

## Provisional Copy

These are user-provided directions, not final UX copy:

- **Catalog request failure or empty catalog:** “Oops, seems like there are no movies today in the cinema. Please try again later. Until then, grab more popcorn.” The user may want a funnier version.
- **No search matches:** Convey “No match for this search. Try with different texts,” with a friendly, funny tone.
- **Related details unavailable:** Convey “Oops, the details are not available now. Try again later,” with a friendly tone.

## Deferred UX Decisions

- Visual direction, responsive layout, and skeleton-card appearance/motion.
- Which elements need visual aids, tooltips, or extra information.
- Final copy for the loading/error/no-results experience.
