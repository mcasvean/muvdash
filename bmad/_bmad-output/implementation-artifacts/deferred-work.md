- source_spec: `{project-root}/_bmad-output/implementation-artifacts/spec-1-1-scaffold-the-frontend-application.md`
  summary: Strengthen future-story acceptance tests for responsive card layout, description truncation, navigation dismissal, search reset/request count, and theme application/accessibility.
  evidence: Blind Hunter found that several story test criteria do not explicitly verify all corresponding behaviors already stated in their acceptance criteria.
  owner: Product owner
  status: open
  resolution: Review before implementing the affected catalog, navigation, search, and theme stories.
- source_spec: `{project-root}/_bmad-output/implementation-artifacts/spec-1-1-scaffold-the-frontend-application.md`
  summary: Make WCAG contrast verification measurable for all approved theme text and control color pairs.
  evidence: The stories require WCAG 2.2 AA, but the plan does not enumerate which foreground/background combinations and states the contrast check must cover.
  owner: Product owner and developer
  status: open
  resolution: Define measurable pairs and states before implementing the theme story.
- source_spec: `{project-root}/_bmad-output/implementation-artifacts/spec-1-1-scaffold-the-frontend-application.md`
  summary: Reconcile FR-9 guidance targets and correct the stale story number in the requirements inventory.
  evidence: The requirements inventory still references Story 1.7 after the guidance story was renumbered to Story 1.8, and the UX artifacts leave broader guidance targets unresolved.
  owner: Product owner
  status: open
  resolution: Confirm Story 1.8's proposed targets before implementing that story.