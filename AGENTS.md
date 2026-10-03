# Agent Instructions

This repository contains reusable agent skills under:

`.agents/skills/`

Before starting a task, inspect the available skills in `.agents/skills/` and use the most relevant skill when the task matches its purpose.

Do not say that a skill is unavailable before checking the repository's `.agents/skills/` directory and the corresponding `SKILL.md`.

## Available Skills

### brandkit

Location:

`.agents/skills/brandkit/SKILL.md`

Use this skill when the task involves:

- brand identity
- brand consistency
- typography
- colors
- visual identity
- design system branding
- brand guidelines

---

### design-taste-frontend

Location:

`.agents/skills/design-taste-frontend/SKILL.md`

Use this skill when the task involves:

- frontend UI design
- improving visual quality
- improving layout and spacing
- improving typography
- improving component styling
- improving overall frontend aesthetics

---

### design-taste-frontend-v1

Location:

`.agents/skills/design-taste-frontend-v1/SKILL.md`

Use this skill when explicitly requested or when compatibility with the previous frontend design-taste workflow is required.

Prefer `design-taste-frontend` over this skill unless the task specifically requires the v1 behavior.

---

### full-output-enforcement

Location:

`.agents/skills/full-output-enforcement/SKILL.md`

Use this skill when:

- generating complete files
- generating full implementations
- avoiding partial code or placeholders
- the user requests the complete output
- the task requires production-ready code instead of snippets

Do not omit important parts of the requested implementation when this skill is active.

---

### high-end-visual-design

Location:

`.agents/skills/high-end-visual-design/SKILL.md`

Use this skill when the task involves:

- premium UI
- polished landing pages
- high-end visual design
- modern visual hierarchy
- sophisticated layouts
- strong visual presentation

---

### imagegen-frontend-web

Location:

`.agents/skills/imagegen-frontend-web/SKILL.md`

Use this skill when the frontend task requires:

- generated visual assets
- hero images
- decorative illustrations
- backgrounds
- visual placeholders
- image assets for web UI

---

### minimalist-ui

Location:

`.agents/skills/minimalist-ui/SKILL.md`

Use this skill when the task involves:

- simplifying the UI
- reducing visual clutter
- improving whitespace
- reducing unnecessary elements
- creating a clean or minimal interface
- improving information hierarchy through simplification

---

### redesign-existing-projects

Location:

`.agents/skills/redesign-existing-projects/SKILL.md`

This is the primary skill for redesigning or auditing an existing project.

Use this skill when the task involves:

- auditing an existing frontend project
- redesigning an existing UI
- improving UX of an existing application
- modernizing an existing interface
- preserving current functionality while changing presentation
- improving an existing codebase instead of creating a new project
- reviewing an existing React frontend
- proposing UI/UX changes based on existing source code

When using this skill:

1. Inspect the existing project before proposing changes.
2. Understand the current architecture and technology stack.
3. Preserve existing business logic unless explicitly asked to modify it.
4. Do not assume TypeScript if the project currently uses JavaScript/JSX.
5. Respect the existing framework and project conventions.
6. Prefer incremental improvements over unnecessary rewrites.
7. Clearly separate audit findings from actual implementation changes.
8. If the user requests a read-only audit, do not modify files.
9. Do not claim this skill is unavailable until `.agents/skills/redesign-existing-projects/SKILL.md` has been checked.

## Skill Selection Rules

For existing frontend redesign work, prefer:

`redesign-existing-projects`

Then combine it with other relevant skills when necessary.

Examples:

Existing project redesign:

`redesign-existing-projects`

Existing project + improved frontend aesthetics:

`redesign-existing-projects`

- `design-taste-frontend`

Existing project + premium visual redesign:

`redesign-existing-projects`

- `high-end-visual-design`

Existing project + minimal design:

`redesign-existing-projects`

- `minimalist-ui`

Existing project + generated visual assets:

`redesign-existing-projects`

- `imagegen-frontend-web`

Existing project + complete implementation requested:

`redesign-existing-projects`

- `full-output-enforcement`

## Important Behavior

Before responding with statements such as:

> "The requested skill is not available in the current environment."

first check:

`.agents/skills/`

and specifically verify whether the corresponding `SKILL.md` exists.

If the skill exists in the repository, read its `SKILL.md` and follow its instructions.

## Project Awareness

Always inspect the current project before making assumptions about:

- programming language
- frontend framework
- TypeScript usage
- CSS framework
- component architecture
- routing
- state management
- folder structure
- design system

For example, if the existing frontend uses React with JavaScript/JSX, do not describe it as a TypeScript project unless TypeScript is actually present.

## Existing Project Safety

When working on an existing project:

- preserve existing functionality
- preserve business logic unless explicitly requested otherwise
- avoid unnecessary dependency changes
- avoid framework migrations unless requested
- avoid changing APIs unnecessarily
- inspect reusable components before creating duplicates
- inspect existing styles before introducing a new styling system

For audit-only tasks:

- do not modify files
- do not run destructive commands
- report findings separately from proposed changes
