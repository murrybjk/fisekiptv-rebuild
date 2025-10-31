# FisekIPTV - Architecture Documentation

**Version:** 1.0.0
**Last Updated:** 2025-10-29
**Status:** Production-Ready

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Technology Stack](#technology-stack)
3. [Directory Structure](#directory-structure)
4. [Core Components](#core-components)
5. [Data Flow](#data-flow)
6. [State Management](#state-management)
7. [Stream Playback Architecture](#stream-playback-architecture)
8. [Component Relationships](#component-relationships)
9. [API Routes](#api-routes)
10. [Styling System](#styling-system)

---

## System Overview

FisekIPTV is a modern IPTV streaming application built with Next.js 16 App Router. The application provides a clean, responsive interface for streaming live TV channels, movies, and series from IPTV providers using the Xtream Codes API.

### Key Features

- ✅ **Live TV Streaming** with adaptive layouts
- ✅ **Movies & Series Browsing** with infinite scroll
- ✅ **Advanced Stream Resolution** (server-side URL resolution, CORS proxy)
- ✅ **Dual Player Support** (Video.js for HLS, mpegts.js for raw TS streams)
- ✅ **Dark Theme** with Shadcn UI components
- ✅ **Responsive Design** (mobile, tablet, desktop)
- ✅ **Persistent State** via Zustand + localStorage

---

## Technology Stack

### Core Framework
- **Next.js 16.0.0** - React framework with App Router and Turbopack
- **React 19** - UI library
- **TypeScript** - Type safety

### UI & Styling
- **Shadcn UI** - Component library
- **Tailwind CSS** - Utility-first CSS
- **Lucide React** - Icon library
- **Radix UI** - Headless UI primitives

### Video Playback
- **Video.js** - HLS/MP4 playback
- **mpegts.js** - Raw MPEG-TS stream playback
- **@videojs/http-streaming** - HLS support

### State Management
- **Zustand** - Lightweight state management
- **localStorage** - Persistence layer

### API & Data Fetching
- **Fetch API** - HTTP requests
- **Xtream Codes API** - IPTV provider API

---

## Directory Structure

```
src/
├── app/                        # Next.js App Router pages
│   ├── api/                    # API routes
│   │   ├── resolve-stream/     # Server-side stream URL resolution
│   │   └── ts-proxy/           # CORS proxy for TS streams
│   ├── channels/               # Channels page (future)
│   ├── movies/                 # Movies page
│   ├── series/                 # Series/TV shows page
│   ├── settings/               # Settings page
│   ├── test-streams/           # Stream testing page (dev)
│   ├── layout.tsx              # Root layout
│   ├── page.tsx                # Home/Live TV page
│   ├── error.tsx               # Error boundary
│   └── loading.tsx             # Loading state
│
├── components/                 # React components
│   ├── features/               # Feature-specific components
│   │   ├── video-player.tsx    # Main video player
│   │   ├── connection-dialog.tsx # IPTV connection setup
│   │   ├── channel-card.tsx    # Channel grid item
│   │   ├── movie-card.tsx      # Movie grid item
│   │   ├── series-card.tsx     # Series grid item
│   │   ├── search-bar.tsx      # Search input
│   │   ├── view-toggle.tsx     # Grid/List toggle
│   │   ├── infinite-scroll.tsx # Infinite scroll wrapper
│   │   └── ...
│   ├── layout/                 # Layout components
│   │   ├── app-header.tsx      # Top header bar
│   │   ├── app-sidebar.tsx     # Left sidebar navigation
│   │   └── live-tv-layout.tsx  # Adaptive Live TV layout
│   └── ui/                     # Shadcn UI components
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── sidebar.tsx
│       └── ...
│
├── config/                     # Configuration
│   └── constants.ts            # App constants
│
├── hooks/                      # Custom React hooks
│   ├── use-channels.ts         # Fetch & manage channels
│   ├── use-movies.ts           # Fetch & manage movies
│   ├── use-series.ts           # Fetch & manage series
│   ├── use-player.ts           # Video player controls
│   ├── use-infinite-scroll.ts  # Infinite scroll logic
│   ├── use-mobile.ts           # Mobile detection
│   └── use-debounced-callback.ts # Debouncing utility
│
├── lib/                        # Utility libraries
│   ├── api/
│   │   └── client.ts           # IPTV API client
│   ├── stream-resolver.ts      # Stream URL resolution
│   └── utils.ts                # Utility functions (cn, etc.)
│
├── store/                      # Zustand state stores
│   ├── connection.ts           # IPTV connection state
│   ├── content.ts              # Current tab/content state
│   └── player.ts               # Video player state
│
└── types/                      # TypeScript types
    └── index.ts                # API response types

docs/                           # Documentation
├── archive/                    # Archived docs
│   ├── *.md                    # Historical completion reports
│   └── test-pages/             # Archived test pages
```

---

## Core Components

### 1. Video Player (`src/components/features/video-player.tsx`)

**Purpose:** Unified video player supporting multiple stream types

**Features:**
- HLS streams via Video.js
- Raw TS streams via mpegts.js
- Persistent video element (never unmounted)
- PiP support
- Minimize/maximize controls
- Stop/copy URL functions

**Key Logic:**
```
1. Initialize Video.js player ONCE (never destroy)
2. Detect stream type (HLS vs TS)
3. Use appropriate player:
   - Video.js for HLS/MP4
   - mpegts.js for raw TS streams
4. Proxy TS streams through /api/ts-proxy for CORS
5. Wait for 'canplay' event before calling play()
```

**State:**
- Uses `usePlayerStore` for global player state
- Local state for PiP, player ready, mounted

**Connected To:**
- `LiveTVLayout` (rendered inside)
- `usePlayer` hook
- `/api/ts-proxy` route
- `/api/resolve-stream` route

---

### 2. Live TV Layout (`src/components/layout/live-tv-layout.tsx`)

**Purpose:** Smart adaptive layout for Live TV page

**Layout Modes:**
1. **Collapsed** (not playing): Player 180px, full channel grid
2. **Minimized** (playing): Player 320px top, channels below
3. **Side-by-side** (playing): 55% player, 45% channels

**Dynamic Behavior:**
- Layout switches based on `isPlaying` + `isMinimized` state
- Grid columns adjust: 1-5 columns (full) vs 1-2 columns (side-by-side)
- Smooth CSS transitions

**Connected To:**
- `VideoPlayer` component
- `ChannelCard` component
- `SearchBar` + `ViewToggle`
- `usePlayerStore` for layout state

---

### 3. App Header (`src/components/layout/app-header.tsx`)

**Purpose:** Top navigation bar

**Features:**
- Logo
- Tab navigation (Live TV, Movies, Series, Settings)
- Connection status
- Sidebar toggle (mobile)

**Connected To:**
- `useContentStore` for tab state
- `useConnectionStore` for connection info
- `AppSidebar` (triggers open/close)

---

### 4. App Sidebar (`src/components/layout/app-sidebar.tsx`)

**Purpose:** Left sidebar for category/genre filtering

**Features:**
- Dynamic category list
- Selected category highlighting
- Refresh button
- Collapsible (mobile)

**Connected To:**
- Parent page (receives categories as prop)
- `Sidebar` UI component (Shadcn)

---

### 5. Connection Dialog (`src/components/features/connection-dialog.tsx`)

**Purpose:** IPTV server connection setup

**Features:**
- Form for Server URL, Username, Password
- Save to localStorage
- Test connection button

**Connected To:**
- `useConnectionStore`
- `client.ts` API for authentication

---

### 6. Channel/Movie/Series Cards

**Purpose:** Grid/list item display

**Features:**
- Lazy-loaded images
- Play button overlay
- Category badge
- Responsive sizing

**Connected To:**
- `onPlay` callback (parent)
- `usePlayer` hook

---

## Data Flow

### 1. Application Initialization

```
User visits app
    ↓
src/app/layout.tsx renders
    ↓
Checks localStorage for connection
    ↓
If not connected: Show ConnectionDialog
If connected: Load content
```

### 2. Live TV Streaming Flow

```
User clicks channel
    ↓
ChannelCard calls onPlay(streamUrl, title)
    ↓
usePlayer hook updates usePlayerStore
    ↓
VideoPlayer detects new currentStreamUrl
    ↓
Stream URL Resolution:
    1. Call /api/resolve-stream (server-side)
    2. Follow redirects, get tokenized URL
    3. Detect stream type (HLS vs TS)
    ↓
Load with appropriate player:
    HLS: Video.js directly
    TS: mpegts.js → proxied through /api/ts-proxy
    ↓
Wait for 'canplay' event
    ↓
Call play()
```

### 3. Category Filtering Flow

```
User clicks category in sidebar
    ↓
Parent page updates selectedCategoryId
    ↓
filteredChannels = channels.filter(...)
    ↓
LiveTVLayout re-renders with filtered list
```

---

## State Management

### Zustand Stores

#### 1. `usePlayerStore` (`src/store/player.ts`)

**Purpose:** Global video player state

**State:**
```typescript
{
  currentStreamUrl: string          // Stream URL
  currentTitle: string               // Channel/movie name
  currentSubtitle: string            // Category/subtitle
  isPlaying: boolean                 // Is actively playing
  isMinimized: boolean               // Minimized/maximized
}
```

**Actions:**
```typescript
play(url, title, subtitle)
stop()
toggleMinimize()
```

**Persistence:** None (ephemeral)

---

#### 2. `useConnectionStore` (`src/store/connection.ts`)

**Purpose:** IPTV server connection state

**State:**
```typescript
{
  serverUrl: string
  username: string
  password: string
  isConnected: boolean
}
```

**Actions:**
```typescript
setConnection(url, username, password)
clearConnection()
```

**Persistence:** localStorage (`fisekiptv-connection`)

---

#### 3. `useContentStore` (`src/store/content.ts`)

**Purpose:** Current tab/content state

**State:**
```typescript
{
  currentTab: 'live' | 'movies' | 'series' | 'settings'
}
```

**Actions:**
```typescript
setCurrentTab(tab)
```

**Persistence:** None (ephemeral)

---

## Stream Playback Architecture

### Problem & Solution

**Problem:** IPTV streams have complex issues:
1. HEAD requests fail (rate-limiting, unsupported)
2. CORS restrictions on segments
3. Multiple redirect hops lose authentication tokens
4. Video element remounting causes play() interruptions

**Solution:**

### 1. Server-Side URL Resolution (`/api/resolve-stream`)

**Purpose:** Resolve stream URLs on the server to avoid client-side CORS/HEAD issues

**How It Works:**
```typescript
GET /api/resolve-stream?url=<originalUrl>
    ↓
Server sends GET with Range: bytes=0-0 (minimizes bandwidth)
    ↓
Follows all redirects (302, 301, etc.)
    ↓
Returns final tokenized URL
```

**Benefits:**
- No CORS restrictions (server-side)
- Supports redirects
- GET requests universally supported
- Returns valid tokenized URLs

---

### 2. CORS Proxy for TS Streams (`/api/ts-proxy`)

**Purpose:** Proxy TS stream segments through our server to add CORS headers

**How It Works:**
```typescript
GET /api/ts-proxy?u=<encodedStreamUrl>
    ↓
Server fetches stream segment
    ↓
Adds CORS headers (Access-Control-Allow-Origin: *)
    ↓
Streams response back to client
```

**Benefits:**
- Bypasses restrictive IPTV server CORS policies
- Transparent to client (just a different URL)
- Works with mpegts.js segment requests

---

### 3. Persistent Video Element

**Problem:** React re-renders were removing video element mid-playback

**Solution:**
```typescript
// Video element is ALWAYS rendered (never conditional)
{isMounted && (
  <div data-vjs-player>
    <video ref={videoRef} />
  </div>
)}

// Placeholder is absolute positioned (doesn't affect video)
{showPlaceholder && (
  <div className="absolute inset-0">...</div>
)}
```

**Benefits:**
- No remount races
- play() never called on removed element
- Smooth state transitions

---

### 4. Proper Play() Lifecycle

**Problem:** Calling play() before media is ready causes AbortError

**Solution:**
```typescript
videoElement.addEventListener('canplay', () => {
  if (document.contains(videoElement)) {
    player.play().catch(err => console.error(err))
  }
}, { once: true })
```

**Benefits:**
- Only plays when media is ready
- Checks element is still in DOM
- Automatic cleanup with `{ once: true }`

---

## Component Relationships

### Home Page (Live TV)

```
src/app/page.tsx
    ├── ConnectionDialog (if not connected)
    ├── SidebarProvider
    │   ├── AppSidebar
    │   │   └── categories list
    │   └── SidebarInset
    │       ├── AppHeader
    │       └── LiveTVLayout
    │           ├── VideoPlayer
    │           ├── SearchBar
    │           ├── ViewToggle
    │           └── ChannelCard[] (grid)
```

### Movies Page

```
src/app/movies/page.tsx
    ├── AppHeader
    ├── AppSidebar (categories)
    └── MovieCard[] (infinite scroll)
```

### Series Page

```
src/app/series/page.tsx
    ├── AppHeader
    ├── AppSidebar (categories)
    └── SeriesCard[] (infinite scroll)
```

---

## API Routes

### 1. `/api/resolve-stream`

**Method:** GET
**Query Params:**
- `url` (string, required): Original IPTV stream URL

**Response:**
```json
{
  "originalUrl": "http://...",
  "resolvedUrl": "http://...?token=xyz"
}
```

**Error Handling:**
- Returns originalUrl as fallback on error
- 10-second timeout

**Connected To:**
- `StreamResolver.resolveStreamUrl()` (client-side)
- `VideoPlayer` component

---

### 2. `/api/ts-proxy`

**Method:** GET
**Query Params:**
- `u` (string, required): Encoded stream segment URL

**Response:**
- Streams video/mp2t content
- Adds CORS headers

**Headers:**
```
Content-Type: video/mp2t
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, OPTIONS
Access-Control-Allow-Headers: Range, Content-Type
Cache-Control: no-cache, no-store, must-revalidate
```

**Connected To:**
- `mpegts.js` player (segment requests)
- `VideoPlayer` component

---

## Styling System

### Tailwind CSS

**Configuration:** `tailwind.config.ts`

**Key Features:**
- Dark theme (default)
- Custom color palette (hsl-based)
- Responsive breakpoints
- Animation utilities

### Shadcn UI

**Purpose:** Pre-built, accessible components

**Customization:**
- Components in `src/components/ui/`
- Styled with Tailwind
- Based on Radix UI primitives

**Key Components:**
- `Button`, `Card`, `Dialog`, `Sidebar`
- `Tabs`, `Sheet`, `Popover`, `Tooltip`
- `Select`, `Input`, `Form`

### CSS Variables

**Theme Colors (Dark Mode):**
```css
--background: 222.2 84% 4.9%
--foreground: 210 40% 98%
--primary: 217.2 91.2% 59.8%
--muted: 217.2 32.6% 17.5%
--border: 217.2 32.6% 17.5%
```

---

## Performance Optimizations

### 1. Dynamic Imports

```typescript
const VideoPlayer = dynamic(
  () => import("@/components/features/video-player"),
  { ssr: false }
)
```

**Benefits:**
- Reduces initial bundle size
- Prevents SSR hydration issues with Video.js

---

### 2. Image Lazy Loading

```typescript
<img loading="lazy" ... />
```

---

### 3. Infinite Scroll

**Implementation:** `useInfiniteScroll` hook

**Logic:**
- Observe last element with IntersectionObserver
- Load next page when visible
- Prevents over-fetching

---

### 4. Debounced Search

**Implementation:** `useDebouncedCallback` hook

**Logic:**
- 300ms delay
- Prevents excessive API calls during typing

---

## Security Considerations

### 1. Server-Side Stream Resolution

**Why:** Prevents exposing user credentials in browser

**Implementation:** Stream URLs are resolved server-side, client only receives final URL

---

### 2. No Credentials in Client Code

**Storage:** Connection info stored in localStorage (not in code)

---

### 3. CORS Proxy

**Purpose:** Allows bypassing restrictive IPTV CORS policies while maintaining security

---

## Development Workflow

### 1. Running Locally

```bash
pnpm install
pnpm run dev
```

**URL:** http://localhost:3000

---

### 2. Testing Streams

**Test Page:** `/test-streams`

**Features:**
- HLS stream test
- Raw TS stream test
- Real-time console logs

---

### 3. Building for Production

```bash
pnpm run build
pnpm run start
```

---

## Troubleshooting

### Stream Won't Play

**Check:**
1. Is URL resolved correctly? (Console logs)
2. Are CORS headers present? (Network tab)
3. Is mpegts.js loaded? (Check for 404s)
4. Is codec supported? (Check browser console)

---

### Layout Issues

**Check:**
1. Is `isPlaying` state correct? (React DevTools)
2. Is `isMinimized` state correct?
3. Are Tailwind classes applied? (Inspect element)

---

### Connection Issues

**Check:**
1. Is localStorage populated? (Application tab)
2. Is server URL correct?
3. Are credentials valid?

---

## Future Enhancements

### Planned Features

- ✅ Adaptive Live TV Layout (COMPLETE)
- ⏳ EPG (Electronic Program Guide)
- ⏳ Favorites/Watchlist
- ⏳ Playback Resume
- ⏳ Multi-language support
- ⏳ Chromecast support

---

## Documentation References

- **[RULES.md](./RULES.md)** - Development standards and patterns
- **[IMPLEMENTATION.md](./IMPLEMENTATION.md)** - Implementation phases and progress
- **[README.md](./README.md)** - Quick start and overview
- **[CLAUDE.md](./CLAUDE.md)** - Claude AI configuration
- **[docs/archive/](./docs/archive/)** - Historical documentation and completion reports

---

## Maintainers

**Project:** FisekIPTV Rebuild
**Repository:** fisekiptv-rebuild
**Stack:** Next.js 16 + TypeScript + Shadcn UI + Zustand

**Last Audit:** 2025-10-29
**Status:** Production-Ready ✅

---

## ADR-007: Layout Containment & Heights (2025-10-29)

### Status
**ACCEPTED** — Implemented in v1.0.1

### Context

The initial layout implementation had several issues:

1. **Sidebar Overlap** — Sidebar was overlapping the channel grid because the main container (`SidebarInset`) had no viewport height constraint, allowing content to overflow beyond the screen.

2. **Player Height Conflicts** — The `VideoPlayer` component enforced `min-h-[300px]`, which overrode parent-defined heights in collapsed (60-140px) and minimized (250-350px) modes, causing layout inconsistencies.

3. **Flex Overflow Issues** — Parent flex containers didn't use `min-h-0`, preventing child containers from properly shrinking and establishing scroll areas.

4. **Responsive Height Complexity** — Multiple responsive breakpoints for player heights (60px/100px/140px for collapsed, 250px/300px/350px for minimized) added unnecessary complexity without functional benefit.

5. **TypeScript Strictness** — Several areas used `any` types, violating strict mode and reducing type safety.

### Decision

We established a **Layout Containment Chain** with the following rules:

#### 1. Viewport Binding
- **Where:** `src/app/page.tsx:92`
- **Rule:** The `SidebarInset` container MUST have `h-screen` to constrain content to viewport height.
- **Rationale:** Prevents content from flowing beyond visible area, establishes the root constraint for all child layouts.

#### 2. Player Heights (Parent-Controlled)
- **Where:** `src/components/layout/live-tv-layout.tsx:69-71`
- **Heights:**
  - Collapsed: `h-[200px]` (sufficient for Video.js controls)
  - Minimized: `h-[350px]` (consistent across viewports)
  - Side-by-side: `lg:w-[55%] lg:h-full` (player 55%, channels 45%)
- **Rationale:** 
  - 200px minimum allows Video.js control bar visibility
  - Single value per mode reduces complexity
  - Parent defines height, child respects it

#### 3. Player Container (Height Respect)
- **Where:** `src/components/features/video-player.tsx:334`
- **Rule:** Use `h-full` (NOT `min-h-[300px]`)
- **Rationale:** Allows player to inherit size from parent layout, prevents conflicts with collapsed/minimized modes.

#### 4. Flex Containment Chain
- **Where:** `src/components/layout/live-tv-layout.tsx:61,86,100`
- **Pattern:**
  1. Root: `flex-1 flex flex-col min-h-0` (allows children to shrink)
  2. Channels section: `flex-1 flex flex-col min-h-0 overflow-hidden` (parent allows child scroll)
  3. Scroll area: `overflow-y-auto` (child scrolls within parent)
- **Rationale:** `min-h-0` is required on flex parents to allow children to establish scrollable areas; without it, flex items won't shrink below content size.

#### 5. TypeScript Strict Mode
- **Where:** `src/types/index.ts`, `src/hooks/use-debounced-callback.ts`, `src/lib/api/client.ts`, etc.
- **Rule:** No `any` types; use generics or `unknown` with type guards.
- **Examples:**
  - `APIResponse<T = unknown>` (was `any`)
  - `useDebouncedCallback<T extends unknown[]>` (proper generics)
  - `(err: Error)` instead of `(err: any)`
- **Rationale:** Strict type safety catches errors at compile time, improves maintainability.

### Consequences

#### Positive
- ✅ **No Sidebar Overlap** — Content stays within viewport bounds
- ✅ **Consistent Player Heights** — Predictable sizing across all modes
- ✅ **Proper Scrolling** — Channels section scrolls correctly without layout shifts
- ✅ **Type Safety** — Zero `any` types in layout/core files
- ✅ **Reduced Complexity** — Single height value per mode (was 3 breakpoints)
- ✅ **Better DX** — Clear rules for future layout changes

#### Neutral
- ℹ️ **Documentation Overhead** — Must update docs when heights change (see RULES.md)
- ℹ️ **Learning Curve** — Developers must understand `min-h-0` pattern

#### Negative
- ⚠️ **Breaking Change** — Old layouts expecting `min-h-[300px]` will break
- ⚠️ **Migration Required** — Any custom layouts must adopt new pattern

### Implementation Files

| File | Change | Line |
|------|--------|------|
| `src/app/page.tsx` | Added `h-screen` to SidebarInset | 92 |
| `src/components/layout/live-tv-layout.tsx` | Simplified heights (200/350), added `min-h-0` | 61,69-71,86 |
| `src/components/features/video-player.tsx` | Replaced `min-h-[300px]` with `h-full` | 334 |
| `src/types/index.ts` | `APIResponse<T = unknown>` | 95 |
| `src/hooks/use-debounced-callback.ts` | Generic signature `T extends unknown[]` | 3-26 |
| `src/lib/api/client.ts` | `APIResponse<{ data: Genre[] }>` | 222 |
| `src/components/ui/sidebar.tsx` | Moved `Math.random()` to `useState` | 664 |

### Validation

**Manual Testing:**
- ✅ Sidebar does not overlap channels in any layout mode
- ✅ Player respects parent heights (200px/350px/55%)
- ✅ Channels section scrolls without layout shift
- ✅ TypeScript compiles with zero errors in strict mode

**Automated Testing:**
- ✅ Playwright smoke tests verify min heights and no overlap
- See `tests/smoke.spec.ts` for assertions

### Future Considerations

1. **Virtual Scrolling** — With 4580+ channels, consider react-window or react-virtualized for performance
2. **Dynamic Heights** — If user preferences for player size are added, ensure parent-controlled pattern is maintained
3. **Mobile Layouts** — Current heights (200/350) tested on desktop; validate on actual mobile devices

### References

- **Flex `min-height` Quirk:** https://stackoverflow.com/questions/36247140/why-dont-flex-items-shrink-past-content-size
- **Next.js Layouts:** https://nextjs.org/docs/app/building-your-application/routing/layouts-and-templates
- **Shadcn Sidebar:** https://ui.shadcn.com/docs/components/sidebar

---

**Decision Date:** 2025-10-29  
**Status:** Implemented  
**Reviewed By:** Architecture Team  
**Version:** 1.0.1
