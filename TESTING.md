# Testing Guide — FisekIPTV Rebuild

## Overview

This document outlines testing procedures for the FisekIPTV application, covering manual smoke tests, automated Playwright tests, and regression validation.

## Manual Testing

### Test Plan 1: Layout Containment Chain

**Objective:** Verify viewport-bound shell and proper scroll containment

**Steps:**
1. Start dev server: `pnpm dev`
2. Navigate to http://localhost:3000
3. Verify main container does not extend beyond viewport
4. Resize browser window (1920x1080, 1366x768, 1280x720)
5. Confirm no horizontal scrollbars appear
6. Verify sidebar is visible and does not overlap channels list

**Expected Results:**
- No viewport overflow at any resolution
- SidebarInset has `h-screen` class
- No horizontal scrollbars
- Sidebar and main content are properly separated

**Related Files:**
- `src/app/page.tsx:92` - SidebarInset with h-screen

---

### Test Plan 2: Player Height Modes

**Objective:** Validate player heights in all layout modes

**Steps:**
1. Open application
2. Click "Connect to Server" and enter valid M3U URL
3. Select any live channel
4. **Test Collapsed Mode:**
   - Stop playback
   - Measure player container height (should be 200px)
   - Verify channels list is visible below player
5. **Test Minimized Mode:**
   - Play a channel
   - Click minimize button
   - Measure player height (should be 350px)
   - Verify channels list scrolls independently
6. **Test Side-by-Side Mode (Desktop Only):**
   - Maximize player
   - Verify player takes 55% width, channels take 45%
   - Verify both sections have independent scroll

**Expected Results:**
- Collapsed: Player height = 200px
- Minimized: Player height = 350px
- Side-by-side: Player width = 55%, Channels width = 45%
- No overlap between player and channels in any mode

**Related Files:**
- `src/components/layout/live-tv-layout.tsx:69-71` - Height definitions
- `src/components/features/video-player.tsx:334` - Player with h-full

---

### Test Plan 3: Scroll Behavior

**Objective:** Ensure proper scroll containment in all sections

**Steps:**
1. Load application with 50+ categories
2. **Test Sidebar Scroll:**
   - Sidebar should scroll independently
   - Search bar should remain sticky at top
3. **Test Channels List Scroll:**
   - Load category with 100+ channels
   - Channels list should scroll without moving player
   - Verify scrollbar appears only on channels container
4. **Test Player Controls:**
   - Player controls should remain visible (not scrolled away)

**Expected Results:**
- Sidebar scrolls independently via `overflow-y-auto`
- Channels list scrolls independently
- Player remains fixed when channels scroll
- No nested scrollbars
- `min-h-0` chain prevents flex overflow

**Related Files:**
- `src/components/layout/live-tv-layout.tsx:61,86` - min-h-0 chain
- `src/components/layout/live-tv-layout.tsx:100` - overflow-y-auto

---

### Test Plan 4: Stream Playback

**Objective:** Validate video playback across stream types

**Steps:**
1. Connect to server with mixed content (HLS and TS streams)
2. **Test HLS Stream:**
   - Select channel with .m3u8 URL
   - Verify Video.js loads stream
   - Check controls (play, pause, volume, fullscreen)
3. **Test TS Stream:**
   - Select channel with .ts URL
   - Verify mpegts.js loads stream (check console for "mpegts.js player loaded")
   - Verify playback starts automatically
4. **Test Error Handling:**
   - Select broken/invalid stream URL
   - Verify error toast appears
   - Verify player falls back gracefully
5. **Test PiP Mode:**
   - Click Picture-in-Picture button
   - Verify video continues playing in PiP window

**Expected Results:**
- HLS streams load via Video.js
- TS streams load via mpegts.js (with API proxy)
- Errors show user-friendly toast notifications
- PiP mode works on supported browsers
- No player crashes or blank screens

**Related Files:**
- `src/components/features/video-player.tsx:120-189` - mpegts loading
- `src/components/features/video-player.tsx:192-228` - Video.js loading
- `src/lib/stream-resolver.ts` - URL resolution logic

---

## Automated Testing

### Playwright Smoke Tests

**Setup:**
```bash
# Install Playwright browsers (first time only)
pnpm exec playwright install

# Run smoke tests
pnpm test:smoke

# Run with UI mode (recommended for debugging)
pnpm test:smoke:ui

# Run with step-by-step debugging
pnpm test:smoke:debug
```

**Test Coverage:**

1. **Viewport Containment** (`tests/smoke.spec.ts`)
   - Verifies `h-screen` on main container
   - Ensures no viewport overflow
   - Validates responsive behavior

2. **Sidebar Visibility**
   - Checks sidebar is present
   - Verifies search input exists
   - Validates category list rendering

3. **Player Heights**
   - Collapsed mode: 200px height
   - Minimized mode: 350px height
   - Side-by-side mode: 55%/45% split

4. **Scroll Containment**
   - Sidebar scrolls independently
   - Channels list scrolls independently
   - Player remains fixed

5. **Player Controls**
   - Copy link button present
   - Minimize/maximize toggle works
   - Stop button functions

6. **Tab Navigation**
   - Movies tab exists
   - Series tab exists
   - Live TV tab (default)

**Running Tests in CI:**
```bash
# Headless mode for CI/CD pipelines
pnpm exec playwright test tests/smoke.spec.ts --reporter=html

# Generate HTML report
pnpm exec playwright show-report
```

---

## Regression Testing

### Layout Regression Checklist

Use this checklist after any layout changes:

- [ ] Main container has `h-screen` class
- [ ] Player heights: collapsed=200px, minimized=350px
- [ ] Flex containment chain includes `min-h-0`
- [ ] Scroll areas use `overflow-y-auto` (not `overflow-hidden`)
- [ ] VideoPlayer uses `h-full` (not `min-h-[300px]`)
- [ ] No horizontal scrollbars at 1280x720 resolution
- [ ] Sidebar does not overlap channels list
- [ ] Player does not overlap channels list
- [ ] All test IDs present: `data-testid="app-sidebar"`, `data-testid="video-player"`
- [ ] TypeScript compiles with 0 errors: `pnpm exec tsc --noEmit`
- [ ] ESLint shows 0 critical errors: `pnpm lint`
- [ ] Playwright smoke tests pass: `pnpm test:smoke`

### TypeScript Validation

```bash
# Check for type errors (should show 0 errors in src/)
pnpm exec tsc --noEmit
```

**Expected Output:**
```
✓ No errors found
```

### ESLint Validation

```bash
# Run linter (0 critical errors, warnings are acceptable)
pnpm lint
```

**Acceptable Warnings:**
- Unused variables in development/debug code
- Missing alt text on decorative images
- Console.log statements (will be removed in production)

**Unacceptable Errors:**
- React hooks dependency violations
- TypeScript `any` usage without suppression comment
- Missing key props in lists
- Invalid JSX syntax

---

## Testing Tools

### Installed Dependencies

- **@playwright/test**: E2E testing framework
- **TypeScript**: Type checking
- **ESLint**: Code quality and standards

### Browser DevTools Testing

**Layout Debugging:**
1. Open DevTools (F12)
2. Select Elements tab
3. Find `<div class="flex flex-col h-screen">`
4. Verify computed height = 100vh
5. Check children for `min-h-0` in flex containers
6. Inspect scroll containers for `overflow-y-auto`

**Console Checks:**
- `[VideoPlayer] Initializing Video.js player...` - Player init
- `[VideoPlayer] Loading TS stream with mpegts.js` - TS stream
- `[VideoPlayer] Loading stream with Video.js: application/x-mpegURL` - HLS stream
- No red errors related to layout or rendering

---

## Continuous Integration

### GitHub Actions (Future)

Example workflow for automated testing:

```yaml
name: Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm install -g pnpm
      - run: pnpm install
      - run: pnpm exec tsc --noEmit
      - run: pnpm lint
      - run: pnpm exec playwright install
      - run: pnpm test:smoke
```

---

## Troubleshooting

### Common Issues

**Issue: Playwright tests fail with "element not found"**
- Solution: Check `data-testid` attributes exist in components
- Verify components render client-side (not SSR-only)

**Issue: Player height test fails**
- Solution: Check layout mode state is correct
- Verify CSS classes match expected heights (200px/350px)
- Inspect flex containment chain for missing `min-h-0`

**Issue: Scroll tests fail**
- Solution: Verify `overflow-y-auto` on scroll containers
- Check parent containers have `min-h-0` in flex chain
- Ensure no `overflow-hidden` on elements that should scroll

**Issue: TypeScript errors in tests**
- Solution: Update `@playwright/test` types
- Check `tsconfig.json` includes test files

---

## Version History

**v1.0.1** - 2025-10-29
- Added Playwright smoke tests
- Documented manual test plans
- Established regression checklist

**v1.0.0** - 2025-10-29
- Initial testing guide

---

**See Also:**
- `CHANGELOG.md` - Version history
- `ARCHITECTURE.md` - ADR-007 for layout containment rationale
- `RULES.md` - Layout Guardrails section
