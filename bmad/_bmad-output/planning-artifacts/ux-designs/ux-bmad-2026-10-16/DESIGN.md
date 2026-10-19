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

# Muvdash Design System

## Design intent

Muvdash should feel friendly, cinematic, and low-friction. The experience is intentionally muted and warm rather than loud or synthetic. The overall tone is playful and modern, but still legible and trustworthy.

The visual language centers on a dark-first palette with purple surfaces, turquoise accents, and restrained orange highlights. The interface should feel polished without becoming glossy or overly decorative.

## Proposed color system

The palette below is a proposed WCAG 2.2 AA-safe token set for review. These values are intentionally tuned to the app’s dark-first default while still preserving a readable light-mode alternative.

### Dark theme

- Background: #1F1B2C
- Surface: #2E2343
- Elevated surface: #43375B
- Border: #5B4B7D
- Primary text on dark: #FFFFFF
- Body text on dark: #E9E4F2
- Muted text on dark: #D9CFEA
- Purple action surface: #2E2343
- Turquoise accent: #7FE0D2
- Turquoise accent soft: #9AE9DD
- Orange accent: #E7A15B
- Orange accent soft: #F2C077

Contrast checks for the dark theme:

- #FFFFFF on #2E2343 = 14.61:1
- #7FE0D2 on #2E2343 = 9.39:1
- #E9E4F2 on #1F1B2C = 13.46:1
- #1F1B2C on #E7A15B = 7.71:1
- #E7A15B on #2E2343 = 6.71:1

All ratios exceed the WCAG 2.2 AA minimum for normal text and remain comfortably usable for UI labels and controls.

### Light theme

- Background: #EAF8F6
- Surface: #F7F3FF
- Elevated surface: #F3EEFF
- Border: #B9DAD5
- Primary text: #2E2343
- Muted text: #43375B
- Turquoise accent: #1E5D61
- Orange accent: #C76E1D
- Purple action surface: #2E2343
- White text on purple surfaces: #FFFFFF

Contrast checks for the light theme:

- #2E2343 on #EAF8F6 = 13.25:1
- #2E2343 on #F7F3FF = 13.37:1
- #1E5D61 on #EAF8F6 = 6.89:1
- #7D5DA8 on #F6F3FB = 4.78:1

This keeps the light theme readable while preserving the brand’s purple/turquoise/orange hierarchy.

## Color role assignment

- Purple is the primary brand and surface color.
- Turquoise is the secondary accent used for emphasis, titles, and important detail states.
- Orange is the tertiary accent for highlights, informational emphasis, and selected states.
- White is reserved for text on purple surfaces and for high-contrast utility text.
- Dark purple is used for primary actions, while light turquoise and orange work as supportive emphasis rather than dominant container colors.

## Typography

- Recommended family: Inter, Segoe UI, or another modern sans-serif family.
- Use concise, highly readable sizing; avoid ornamental or highly stylized typography.
- Maintain strong hierarchy between movie titles, supporting text, metadata, and labels.
- Keep body text comfortable for scanning within a dense card grid.

### Suggested hierarchy

- H1 / logo: MuvDash, bold and compact
- Movie title: medium weight; turquoise accent in dark mode, purple in light mode
- Body copy: subdued neutral tone
- Metadata / labels: small uppercase or short-label treatment with clear spacing

## Layout system

- Mobile-first layout with three main route destinations: Home, Contact, and About.
- Header remains sticky and visible at the top while the content scrolls.
- Search stays visible directly beneath the header and compresses on scroll.
- Movie cards are arranged in a 2-column mobile layout, 4-column tablet layout, and denser desktop grid.
- Both portrait and landscape card modes use the same card sizing and soft spacing rhythm.

## Card and modal behavior

- Cards use very softly rounded corners with restrained, elegant shadows.
- Image area remains the primary focal point; title and description follow.
- Details modal remains centered and uses the same soft rounding and shadow language as the cards.
- Modal content should prioritize the movie title, artwork, description, and the requested metadata in a predictable order.
- Skip raw API IDs and raw URL strings; show the resolved content instead.

## Interaction design

- Header uses a logo text treatment: MuvDash.
- Route labels use text only: Home, Contact, About.
- Mobile navigation uses a burger menu that expands into a panel and dismisses on outside tap, close action, or route selection.
- Search and view toggle are visible without heavy visual noise.
- Theme toggle is always visible, with a two-option light/dark selector and active-state highlighting.
- Default theme is dark, with localStorage persistence as the source of truth after first selection.

## Motion and accessibility

- Animation should feel gentle and supportive rather than decorative.
- Reduced-motion devices should receive subtler transitions instead of the full animation chain.
- All key interactions must keep full keyboard and touch accessibility.
- Color usage must remain compliant with WCAG 2.2 AA across both dark and light modes.

## Final review note

This palette is proposed for review and adjustment. It is intentionally restrained, accessible, and aligned with the product brief and UX decisions captured in the memlog. If the user prefers a warmer purple, a brighter turquoise, or a less saturated orange, the token set can be revised without changing the underlying visual direction.
