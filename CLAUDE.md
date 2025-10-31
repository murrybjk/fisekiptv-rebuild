# CLAUDE Configuration — FisekIPTV

## Objective
Rebuild the FisekIPTV app with a modern, efficient, and clean Shadcn-based UI, removing redundant elements and improving usability while maintaining functionality.

## MCP Behavior
- Use connected MCP servers (`context7`, `playwright`, `shadcn`) to assist in:
  - Analyzing the codebase
  - Refactoring UI
  - Suggesting Shadcn components
  - Validating layouts

## Directives
1. Follow `RULES.md` for design and architecture standards.
2. Follow `IMPLEMENTATION.md` for phase-by-phase execution.
3. Prioritize **clean UI**, **code modularity**, and **maintainability**.
4. Remove redundant features and optimize for clarity.
5. All changes must conform to Shadcn and Tailwind standards.
6. Use Lucide icons for navigation and visual clarity.
7. Default dashboard chart: By Head Category (toggleable to Category).
8. All filters (month/date) should re-render content dynamically.

## Workflow
When opened in Claude:
1. Read `RULES.md` and `IMPLEMENTATION.md`.
2. Generate a Phase 1 Analysis summary.
3. Proceed sequentially through Phases 2–5.
4. Use `/components/ui` from Shadcn to build.
5. Write or modify code directly inside project files.

