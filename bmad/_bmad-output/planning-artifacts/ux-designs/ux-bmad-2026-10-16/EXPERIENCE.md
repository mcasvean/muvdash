---
name: Muvdash
status: draft
sources:
  - {planning_artifacts}/briefs/brief-bmad-2026-10-15/brief.md
  - {planning_artifacts}/briefs/brief-bmad-2026-10-15/addendum.md
  - {planning_artifacts}/prds/prd-bmad-2026-10-16/prd.md
  - {planning_artifacts}/prds/prd-bmad-2026-10-16/addendum.md
  - {output_folder}/api_structure.md
updated: 2026-10-19
---

# Muvdash Experience Specification

## Core experience goal

Muvdash should feel like a friendly, easy-to-scan movie discovery space. Users can browse the collection, search quickly, and open a film detail without losing context or entering a heavy app flow.

## User journey

1. User opens the app and lands on the Home screen.
2. User sees a sticky search bar and a movie grid immediately.
3. User can scan cards, switch between portrait and landscape image treatment, and select a film.
4. User opens a centered modal to read the description and metadata.
5. User can navigate to Contact or About without leaving the app flow.
6. User can switch theme as needed and keep that preference stored locally.

## Route behavior

### Home

Home is the default landing route. It contains the card grid, sticky search, and card-view toggle.

### Contact

Contact is a lightweight informational route for the app owner or project contact information. It should remain simple, readable, and visually consistent with the rest of the app.

### About

About contains the app story and contextual information. It should be brief and friendly, with no overwhelming copy.

## Search and discovery

- The search field sits directly beneath the sticky header.
- It remains visible as the user scrolls.
- Search is fast and client-side; the experience should feel immediate and lightweight.
- Empty states are friendly and explicit rather than blank or confusing.
- If no results match, the UI should explain the situation and offer a quick return to the full list.

## Card experience

- Cards use a consistent image-first hierarchy.
- Title is the main text focus, followed by a short description.
- Cards should display only the image, title, and description in both portrait and landscape modes.
- Descriptions are trimmed to a maximum of two rows.
- Release date and producer remain in the modal, not the card itself.
- The layout preserves consistent card sizing and uses a centered crop when necessary.

## View toggle

- A compact toggle sits next to the search field.
- The default card mode uses the portrait image variant.
- Activating the toggle switches to a landscape presentation.
- Activating again returns to portrait mode.
- The toggle icon updates to reflect the current mode and avoids ambiguity.

## Details modal

The modal is the primary deep-dive interaction. It should remain centered and readable across screen sizes.

### Content order

1. Film image
2. Film title
3. Description
4. Director
5. Producer
6. Release date
7. Running time
8. Score
9. People
10. Species
11. Locations
12. Vehicles

### Rules

- Omit absent fields entirely; do not show placeholders.
- Hide raw API IDs and raw URLs from the user.
- Use resolved content from the API relationship objects instead of exposing their internal IDs.
- Maintain a clean reading flow and allow vertical scrolling for long descriptions or dense metadata.

## Theme behavior

- Dark mode is the default.
- The theme toggle is always visible in the header and uses a two-option light/dark control with iconography.
- Light option shows a sun icon; dark option shows a moon icon.
- The active side remains visibly highlighted.
- Theme choice is persisted in localStorage and restored on reload.
- If no stored preference exists, the app uses dark mode.

## Motion and reduced-motion support

- Subtle transitions are used for search, card hover/tap feedback, menu expansion, and modal appearance.
- On reduced-motion devices, the app keeps the interaction but reduces the intensity and duration of the animation.
- Motion should never block reading or decision-making.

## Accessibility behavior

- The app follows WCAG 2.2 AA requirements.
- Contrast is checked for text and controls in both light and dark themes.
- Focus states must remain visible and distinct.
- Touch targets must be large enough to be comfortable on mobile.
- The app must work without relying on color alone for meaning.

## Tone and copy guidance

- Copy should feel friendly and clear.
- Navigation labels use plain wording: Home, Contact, About.
- Error and empty states should be straightforward and supportive.
- Keep messaging playful but not whimsical to the point of reducing clarity.

## Final UX outcome

The overall experience should feel like an approachable film browser: quick, readable, and emotionally warm, with enough polish to feel intentional without becoming distracting or over-designed.
