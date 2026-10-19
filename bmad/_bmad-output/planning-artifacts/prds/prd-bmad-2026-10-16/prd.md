---
title: Muvdash
status: final
created: 2026-10-16
updated: 2026-10-16
---

# PRD: Muvdash

## 0. Document Purpose

This PRD defines Muvdash's first release for the project owner and UX designer and guides the implementation workflow. It builds on the [product brief](../../briefs/brief-bmad-2026-10-15/brief.md) and the [technical addendum](addendum.md). Product behavior is described here; the confirmed client stack, API contract, and provisional interface copy belong in the addendum.

## 1. Vision

Muvdash is primarily a practical project for its owner to learn the complete BMad workflow and gain enough understanding to repeat it on another project. Its simple, friendly Studio Ghibli film library gives friends a way to find a film quickly, scan useful information, and feel supported by visual cues, tooltips, and extra context where helpful. Muvdash is for browsing and learning about films; it is not a streaming or social app. The project is intended to continue through maintenance and separately defined feature additions after the first release.

The first release covers a mobile-first experience across three routes, with film browsing, search, details, and contextual help. Visual design is defined in the UX phase.

## 2. Target Users

### 2.1 Jobs To Be Done

- **Project owner:** Practice every BMad step and phase, understand its purpose, and gain enough experience to repeat the process on another project.
- **Friend browsing films:** Find a Studio Ghibli film to watch during free time, quickly understand its basic information, and feel guided while exploring.

### 2.2 Key User Journey

- **UJ-1. A friend finds a Ghibli film to watch.** During free time, a friend opens Muvdash, browses the film cards or searches by a known detail, scans the matching film information, and opens a film's details before choosing what to watch elsewhere.

## 3. Glossary

- **Film:** A Studio Ghibli movie represented by a record from the Ghibli API.
- **Film catalog:** The list of Films available in Muvdash.
- **Related data:** Film-linked information such as people, species, locations, and vehicles.
- **Search query:** Text entered to filter the Film catalog.

## 4. Features

### 4.1 Film Catalog

**Description:** Muvdash presents a browsable catalog of Studio Ghibli films on the Home route. It communicates loading and unavailable states in the app's friendly tone.

**Functional Requirements:**

#### FR-1: Load the film catalog

When the Home route mounts, Muvdash requests the Film catalog from the configured Studio Ghibli film-list endpoint.

**Consequences (testable):**

- Mounting the Home route starts a catalog request.
- While the catalog is loading, the Home route displays skeleton film cards.

#### FR-2: Browse film cards

Visitors can scan the Film catalog as cards containing each Film's image, title, and description. Realizes UJ-1.

**Consequences (testable):**

- Each card displays only the image, title, and description.
- The card description is trimmed to a maximum of two rows.
- Selecting a card's expand action opens that Film's details.

#### FR-3: Recover from an unavailable catalog

When the catalog request fails or returns an empty list, visitors see the same friendly, playful card and can retry the catalog request.

**Consequences (testable):**

- Both request failure and an empty catalog show the catalog unavailable card.
- The card includes a retry action that starts another catalog request.
- The provisional copy is recorded in the addendum; final wording is deferred to UX.

### 4.2 Search

**Description:** Visitors can filter the already-loaded Film catalog without another catalog request.

**Functional Requirements:**

#### FR-4: Search film information

Visitors can use a partial, case-insensitive Search query to filter the Film catalog by title, release date, producer, director, and description. Realizes UJ-1.

**Consequences (testable):**

- A query matches when its text occurs within any of the five fields, regardless of capitalization.
- Clearing the query restores the complete fetched Film catalog.

#### FR-5: Show search with no matches

When a Search query matches no Films, visitors see a separate friendly, playful no-results message.

**Consequences (testable):**

- The no-results state is distinct from the catalog unavailable card.
- Provisional message intent is recorded in the addendum; final wording is deferred to UX.

### 4.3 Film Details

**Description:** Visitors can inspect a Film's full information in a centered modal. Film-linked data is resolved from related Studio Ghibli API resources as needed.

**Functional Requirements:**

#### FR-6: View film details

Visitors can open a centered details modal for a Film and view all available Film fields, including resolved Related data. Realizes UJ-1.

**Consequences (testable):**

- The modal presents the available fields from the Film record and its related Ghibli resources.
- Related-resource requests are made only when needed to display the selected Film's details.
- The modal has an X close control.

#### FR-7: Handle unavailable related details

If a related-data request fails, Muvdash displays an error modal instead of the Film details.

**Consequences (testable):**

- The error modal shows a friendly error message and an X close control only.
- The error modal does not show Film details or a retry action.
- Provisional error copy is recorded in the addendum; final wording is deferred to UX.

### 4.4 Informational Routes

**Functional Requirements:**

#### FR-8: Provide Contact and About routes

Visitors can open the Contact and About routes. In the first release, each page displays simple text identifying the selected page; fuller page content is deferred to a later feature requirement.

**Consequences (testable):**

- The Contact route is reachable and displays text identifying the Contact page.
- The About route is reachable and displays text identifying the About page.

## 5. Cross-Cutting Requirements

### 5.1 Platform

The initial browsing experience is designed mobile-first. Exact layouts, visual treatment, and responsive behavior are defined in the UX phase.

### 5.2 Data Source Boundary

Muvdash may request or load URLs supplied in Studio Ghibli API film data, including related-resource endpoints and image assets, when needed to display a Film. It does not query independent providers or endpoints that are not referenced by the Ghibli data.

### 5.3 In-App Guidance

#### FR-9: Help visitors understand the interface

Muvdash provides visual aids, tooltips, and additional information where needed to help visitors understand the interface and film information. The UX phase will decide which elements need help and how it is presented.

**Consequences (testable):**

- The UX deliverable identifies the interface elements that need visual aids, tooltips, or additional explanatory information.

## 6. Non-Goals

- Playing or streaming films.
- Social, community, or user-to-user connection features.
- Querying independent providers or endpoints that are not referenced by Studio Ghibli API data.
- Defining the final visual design in this PRD; that belongs to the UX discussion.
- Choosing specific features for later releases in this first-release PRD.

## 7. MVP Scope

### 7.1 In Scope

- Home, Contact, and About routes.
- Studio Ghibli film catalog, cards, and related details.
- Client-side search, no-results feedback, and query clearing.
- Loading, catalog-unavailable, and related-details error states.
- Friendly in-app guidance identified during UX.
- Mobile-first UX design.

### 7.2 Out of Scope for MVP

- No additional features beyond §7.1 are included in this release; later additions will be defined in separate requirements. The product-level exclusions in §6 apply.

## 8. Success Metrics

- **SM-1 — BMad learning:** The project owner completes the BMad steps and phases for Muvdash and can explain and repeat the workflow on another project.
- **SM-2 — Film discovery:** Friends can browse or search the catalog, find a Film, and inspect its information quickly and with a sense of support. This is a qualitative success signal; no numeric target has been set. Validates FR-2, FR-4, FR-6, and FR-9; realizes UJ-1.

## 9. Open Questions

- Which specific interface elements need tooltips or additional guidance? Resolve during UX.
- What final friendly copy should the catalog-unavailable, search-no-results, and details-error states use? Resolve during UX.
- What exact visual design and responsive behavior should the mobile-first experience use? Resolve during UX.
- What evaluation will determine whether friends can find and understand a Film quickly? Revisit during the first usability check; no numeric target is set now.

## 10. Assumptions Index

No assumptions are included. Unresolved decisions are listed in §9.
