# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [1.0.1] - 2025-10-29

### Fixed

#### Layout & Containment
- **Sidebar overlap issue** — Added `h-screen` to `SidebarInset` container to prevent content from exceeding viewport height (`src/app/page.tsx:92`)
- **Player height conflicts** — Removed `min-h-[300px]` from `VideoPlayer` component, now uses `h-full` to respect parent-defined heights (`src/components/features/video-player.tsx:334`)
- **Flex overflow chain** — Added `min-h-0` to flex parents to allow proper child scrolling (`src/components/layout/live-tv-layout.tsx:61,86`)
- **Channels scroll area** — Ensured channels section uses `overflow-y-auto` for proper scrolling within constrained height (`src/components/layout/live-tv-layout.tsx:100`)

#### TypeScript Strict Mode
- **API response types** — Changed `APIResponse<T = any>` to `APIResponse<T = unknown>` for strict mode compliance (`src/types/index.ts:95`)
- **Genre data typing** — Fixed `APIResponse<{ data: any[] }>` to `APIResponse<{ data: Genre[] }>` in API client (`src/lib/api/client.ts:222`)
- **Debounce hook generics** — Replaced `T extends (...args: any[]) => void` with proper `T extends unknown[]` generic signature (`src/hooks/use-debounced-callback.ts:3`)
- **Error handler typing** — Changed `(err: any)` to `(err: Error)` in video player error handling (`src/components/features/video-player.tsx:171`)
- **Tab type safety** — Removed `as any` cast in header tab handling, added type guard for valid `ContentTab` values (`src/components/layout/app-header.tsx:24-27`)

#### React Compliance
- **Sidebar skeleton purity** — Moved `Math.random()` from `useMemo` (render phase) to `useState` initializer (mount phase) to fix React purity violation (`src/components/ui/sidebar.tsx:664`)
- **Debounce ref mutation** — Moved `callbackRef.current = callback` from render phase to `useEffect` to prevent ref mutation during render (`src/hooks/use-debounced-callback.ts:10-13`)
- **Connection dialog state** — Derived `showConnectionDialog` from `isConnected` prop instead of using `setState` in effect, eliminating cascading render warnings (`src/app/page.tsx:23`, `src/app/movies/page.tsx:34`, `src/app/series/page.tsx:38`)
- **HTML entity escaping** — Changed `doesn't` to `doesn&apos;t` in series page to fix React HTML entity warning (`src/app/series/page.tsx:217`)

#### Dependencies
- **Exhaustive deps compliance** — Added missing dependencies to `useEffect` hooks where applicable:
  - `src/app/movies/page.tsx:44,51` — Added `setTab`, `loadCategories`, `setSelectedCategory` to dependency arrays
  - `src/app/series/page.tsx:48,55` — Added `setTab`, `loadCategories`, `setSelectedCategory` to dependency arrays
- **Intentional suppressions** — Added `eslint-disable-next-line` comments for hooks where dependencies would cause infinite loops:
  - `src/hooks/use-channels.ts:47` — Excluded `loadChannels` and `channels.length` to prevent re-fetch loop

### Changed

#### Layout Heights (Breaking Change)
- **Collapsed mode:** ~~`h-[60px] md:h-[100px] lg:h-[140px]`~~ → **`h-[200px]`** (single value, allows Video.js controls visibility)
- **Minimized mode:** ~~`h-[250px] md:h-[300px] lg:h-[350px]`~~ → **`h-[350px]`** (single value, consistent across viewports)
- **Side-by-side mode:** No change, confirmed **`lg:w-[55%]`** (player) and **`lg:w-[45%]`** (channels)
- **Rationale:** Simplified responsive logic, ensured minimum 200px for Video.js control bar visibility

#### State Management Patterns
- **Connection dialog visibility** — Changed from `useState` + `useEffect` to direct derivation: `const showConnectionDialog = !isConnected`
- **Dialog close handlers** — Changed `onOpenChange` from `setShowConnectionDialog` to no-op `() => {}` (dialog controlled by connection state)

#### Import Cleanup
- **Removed unused imports** across 5 files:
  - `src/app/page.tsx` — Removed `Tv`, `Film`, `MonitorPlay`, `Button`, `ChannelCard`, `SearchBar`, `ViewToggle`, `VideoPlayer`, `dynamic`, `useEffect`, `useState`
  - `src/app/movies/page.tsx` — Removed `useState` (kept `useEffect`)
  - `src/app/series/page.tsx` — Removed `Loader2`
  - `src/components/layout/app-sidebar.tsx` — Removed `SidebarGroupLabel`
  - `src/components/layout/live-tv-layout.tsx` — Removed `useState`

### Added

#### Documentation
- **CHANGELOG.md** — Created version history (this file)
- **TESTING.md** — Created comprehensive testing guide with manual steps and Playwright smoke test plan
- **ADR-007** — Added "Layout Containment & Heights" architecture decision record to `ARCHITECTURE.md`
- **Layout Guardrails** — Added 10-rule layout section to `RULES.md` documenting containment patterns
- **Version 1.0.1 section** — Added to `PROJECT_SUMMARY.md` summarizing all fixes

#### Testing Infrastructure
- **Playwright smoke tests** — Created `tests/smoke.spec.ts` with layout assertions (viewport binding, min heights, no overlap, scroll behavior)
- **Test identifiers** — Added `data-testid` props to:
  - `src/components/layout/app-sidebar.tsx` — `data-testid="app-sidebar"`
  - `src/components/features/video-player.tsx` — `data-testid="video-player"`

### Notes

#### Acceptable ESLint Warnings (6 total)
The following warnings are intentionally preserved to prevent infinite loops:
1. `use-channels.ts:47` — Missing deps `loadChannels`, `channels.length`
2. `use-movies.ts:85` — Missing deps `loadCategories`, `vodCategories.length`
3. `use-movies.ts:91` — Missing deps `currentPage`, `isConnected`, `loadMovies`
4. `use-series.ts:144` — Missing deps `loadCategories`, `seriesCategories.length`
5. `use-series.ts:150` — Missing deps `currentPage`, `isConnected`, `loadSeries`
6. `video-player.tsx:189` — Missing dep `loadVideojsStream` (stable reference)

#### Breaking Changes
- Components that depended on `min-h-[300px]` player height must be updated
- Custom layouts must adopt the `min-h-0` flex containment pattern
- TypeScript strict mode may surface previously hidden type errors

#### Migration Guide
1. Replace any `min-h-[300px]` on video players with `h-full`
2. Ensure parent containers define player heights (200px/350px/h-full)
3. Add `min-h-0` to flex parents that should allow child scrolling
4. Replace any `any` types with `unknown` or proper generics
5. Review layout changes in `ARCHITECTURE.md` ADR-007

---

## [1.0.0] - 2025-10-29

### Added

#### Core Features
- **Live TV streaming** with HLS and raw TS stream support
- **Movies & Series** VOD library with category filtering
- **Adaptive layout** system with 3 modes (collapsed, minimized, side-by-side)
- **Connection management** with IPTV server authentication
- **Search functionality** with debounced input
- **Grid/List view toggle** for content display

#### Technical Implementation
- **Next.js 16** App Router with React 19
- **TypeScript** strict mode throughout
- **Shadcn UI** component library (26 components)
- **Zustand** state management (3 stores: connection, content, player)
- **Video.js** for HLS/MP4 playback
- **mpegts.js** for raw TS stream playback
- **Server-side stream resolution** API route (`/api/resolve-stream`)
- **CORS proxy** for TS streams (`/api/ts-proxy`)

#### Components
- **Layout components** (3): AppHeader, AppSidebar, LiveTVLayout
- **Feature components** (14): ConnectionDialog, VideoPlayer, ChannelCard, MovieCard, SeriesCard, EpisodeCard, SearchBar, ViewToggle, LoadingScreen, ErrorBoundary, and more
- **UI components** (26): Shadcn UI primitives

#### Documentation
- **ARCHITECTURE.md** — Complete technical architecture (1000+ lines)
- **PROJECT_SUMMARY.md** — Executive summary and statistics
- **IMPLEMENTATION.md** — Phase-by-phase implementation status
- **RULES.md** — Development standards and best practices
- **CLAUDE.md** — AI assistant configuration
- **README.md** — Quick start and usage guide

### Fixed

#### Stream Playback
- **Video.js initialization** — Persistent video element pattern (never unmounts)
- **SSR hydration** — Dynamic import with `ssr: false` for Video.js
- **HLS stream support** — Video.js with @videojs/http-streaming
- **Raw TS stream support** — mpegts.js with CORS proxy
- **Stream URL resolution** — Server-side redirect following
- **CORS restrictions** — Proxy route adds required headers

#### Layout & UI
- **Dark theme** — Tailwind dark mode throughout
- **Responsive design** — Mobile, tablet, desktop layouts
- **Sidebar navigation** — Shadcn Sidebar with collapsible support
- **Tab navigation** — Live TV, Movies, Series, Settings
- **Loading states** — Skeletons and spinners

### Changed
- **Architecture** — Migrated from vanilla JS to Next.js + TypeScript
- **State management** — Replaced React Context with Zustand
- **Styling** — Replaced custom CSS with Tailwind + Shadcn
- **Build system** — Replaced Webpack with Turbopack

### Removed
- **Legacy codebase** — Archived old vanilla JS implementation (32MB freed)
- **Redundant features** — Favorites system, scroll buttons
- **Obsolete docs** — Archived 11 completion reports

---

## Version Numbering

- **Major (x.0.0):** Breaking changes, major refactors
- **Minor (0.x.0):** New features, non-breaking changes
- **Patch (0.0.x):** Bug fixes, documentation updates

---

**Maintained by:** FisekIPTV Team
**Last Updated:** 2025-10-29
