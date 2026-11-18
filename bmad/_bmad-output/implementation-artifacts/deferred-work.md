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
  summary: Reconcile the FR-9 guidance target scope and Story 1.8 documentation.
  evidence: FR-9 target scope had not been confirmed in UX artifacts before Story 1.8 began.
  owner: Product owner and developer
  status: done
  resolution: FR-9 now identifies Story 1.8; the product owner approved the mobile-menu and card-view tooltip targets on 2026-11-18, and no broader targets were added.
