# 17TV / FisekIPTV — Development Rules

## 🧩 General Philosophy
- Use **Shadcn UI** components for all interface elements.
- Follow **clean layout hierarchy**: header, sidebar, main content, modals.
- Avoid redundant visual elements like grid scroll buttons or favorites logic.
- Keep dark theme first (Tailwind `dark:` utilities).

## 🧱 Structure
/app → pages / routes
/components → reusable UI parts (Shadcn or custom)
/hooks → React hooks for data fetching or state
/lib → API logic and utilities
/store → Zustand or Context store
/config → constants, environment

## 🎨 UI/UX Rules
- Use `lucide-react` icons wherever appropriate.
- Buttons → `Button` from Shadcn (`variant="outline"`, `size="sm"`).
- Tables/lists → Shadcn `DataTable` or simplified grid, no scroll buttons.
- Charts → default to “By Head Category”, toggle to “By Category”.
- Filters → dynamic via `Select` or `Popover + Calendar` (month/date range).
- Keep minimal spacing (`p-4`, `gap-4`) and consistent typography.

## ⚙️ Logic Rules
- Remove unused states and favorites.
- Centralize state using Zustand or React Context.
- Lazy-load heavy modules.
- API calls handled via `/lib/api.ts` and consumed via hooks.
- No direct API calls inside UI components.
- Use TypeScript everywhere with strict mode.

## 🧮 Charts and Filters
- Default chart: Head Category view.
- Toggleable chart: Category view.
- Month/date filter dynamically re-renders chart and totals.
- Show total expenses, per-category breakdown, and monthly trend.

## ✅ Miscellaneous
- Maintain mobile responsiveness.
- No unnecessary transitions; prefer instant updates.
- Keep color scheme consistent: `bg-background`, `text-foreground`, `muted`.


---

## 🏗️ Layout Guardrails

These rules ensure consistent, predictable layout behavior across the application.

### 1. Viewport-Bound Shell
- **Rule:** The main app container (SidebarInset) MUST have `h-screen`.
- **Location:** `src/app/page.tsx:92`
- **Rationale:** Prevents content overflow beyond viewport, establishes root height constraint.
- **Example:**
  ```tsx
  <SidebarInset className="flex flex-col h-screen overflow-hidden">
  ```

### 2. Flex Containment Chain (min-h-0 Pattern)
- **Rule:** Flex parents that should allow child scrolling MUST use `min-h-0`.
- **Location:** `src/components/layout/live-tv-layout.tsx:61,86`
- **Rationale:** Flex items won't shrink below content size without `min-h-0`; this allows proper scroll area establishment.
- **Pattern:**
  ```tsx
  {/* Parent: allows children to shrink */}
  <div className="flex-1 flex flex-col min-h-0">
    
    {/* Child: scrollable area */}
    <div className="flex-1 overflow-y-auto">
      {/* Content */}
    </div>
  </div>
  ```

### 3. Scroll Areas
- **Rule:** Scrollable content containers MUST use `overflow-y-auto` (or `overflow-auto`), NOT `overflow-hidden`.
- **Location:** `src/components/layout/live-tv-layout.tsx:100`
- **Rationale:** Allows content to scroll within constrained height.
- **Anti-pattern:** Setting `overflow-hidden` on the element that should scroll.

### 4. Parent-Controlled Heights
- **Rule:** Child components MUST NOT enforce their own `min-h-*` if parent defines the height.
- **Example:** VideoPlayer uses `h-full`, not `min-h-[300px]`.
- **Location:** `src/components/features/video-player.tsx:334`
- **Rationale:** Prevents conflicts between parent intent and child constraints.
- **Pattern:**
  ```tsx
  {/* Parent defines height */}
  <div className="h-[200px]">
    {/* Child respects parent */}
    <VideoPlayer className="h-full" />
  </div>
  ```

### 5. Layout Mode Heights
- **Rule:** Document all layout-specific height values and keep them consistent.
- **Defined Heights:**
  - **Collapsed:** `h-[200px]` (player not actively playing)
  - **Minimized:** `h-[350px]` (player playing but minimized)
  - **Side-by-side:** `lg:w-[55%] lg:h-full` (player 55%, channels 45%)
- **Location:** `src/components/layout/live-tv-layout.tsx:69-71`
- **Rationale:** Single source of truth for layout dimensions.

### 6. Responsive Height Strategy
- **Rule:** Use single height values per mode; avoid excessive breakpoints (sm/md/lg/xl) unless functionally necessary.
- **Rationale:** Simplifies maintenance and reduces CSS complexity.
- **Example:**
  ```tsx
  // ✅ Good: Single value
  layoutMode === 'collapsed' && "h-[200px]"
  
  // ❌ Bad: Unnecessary breakpoints
  layoutMode === 'collapsed' && "h-[60px] md:h-[100px] lg:h-[140px]"
  ```

### 7. Documentation Update Policy
- **Rule:** When changing layout heights or containment patterns, update the following files:
  1. `ARCHITECTURE.md` — ADR-007 section
  2. `IMPLEMENTATION.md` — "Player Heights" section
  3. `RULES.md` — This section (if pattern changes)
  4. `CHANGELOG.md` — Document the change in appropriate version
- **Rationale:** Prevents documentation drift; ensures team alignment.

### 8. Testing Layout Changes
- **Rule:** Any layout height or overflow changes MUST be validated with:
  1. Manual test in browser (all 3 layout modes)
  2. Playwright smoke test update (if assertions change)
  3. Mobile viewport test (actual device or DevTools)
- **Location:** See `TESTING.md` for full procedure.

### 9. TypeScript Strict Mode (Layout Context)
- **Rule:** All layout-related props, hooks, and utilities MUST have explicit types (no `any`).
- **Examples:**
  - Layout mode: `'collapsed' | 'minimized' | 'side-by-side'`
  - Heights: `const heights = { collapsed: 200, minimized: 350 } as const`
- **Rationale:** Type safety prevents runtime layout errors.

### 10. Z-Index Layering
- **Rule:** Use semantic z-index values from Tailwind (z-10, z-20, z-30, z-40, z-50).
- **Layering:**
  - Base content: `z-0` (default)
  - Video player controls: `z-10`
  - Sticky headers: `z-40`
  - Modals/Dialogs: `z-50`
- **Anti-pattern:** Arbitrary values like `z-[999]` or `z-[9999]`.

---

**Layout Guardrails Version:** 1.0.1  
**Last Updated:** 2025-10-29  
**See also:** ARCHITECTURE.md (ADR-007) for detailed rationale
