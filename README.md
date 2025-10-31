# FisekIPTV - Modern IPTV Player

A clean, modern IPTV player built with **Next.js 16**, **TypeScript**, **Shadcn UI**, and **Zustand**. Fully responsive, dark-themed, and optimized for performance.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-16.0.0-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## ✨ Features

### 🎬 Content

- **Live TV** - Browse and watch live television channels
- **Movies (VOD)** - Access video on demand library
- **TV Series** - Watch episodes from TV series
- **Categories** - Filter content by genre/category
- **Search** - Find channels, movies, and series quickly

### 📺 Video Player

- **HLS Streaming** - Supports .m3u8 streams via Video.js
- **Raw TS Streams** - MPEG-TS playback via mpegts.js
- **Adaptive Layout** - Smart side-by-side or stacked modes
- **Server-Side URL Resolution** - Bypasses CORS/redirect issues
- **CORS Proxy** - Proxied TS segments for compatibility
- **Picture-in-Picture** - Watch while browsing
- **Playback Speed** - Adjust speed (0.5x - 2x)
- **Fullscreen** - Immersive viewing experience
- **Minimize** - Compact player mode
- **Copy URL** - Share stream links

### 🎨 User Interface

- **Dark Theme** - Modern dark-first design
- **Responsive** - Works on mobile, tablet, and desktop
- **Grid View** - Compact card layout
- **List View** - Detailed row layout
- **Infinite Scroll** - Seamless content loading
- **Loading States** - Smooth loading indicators
- **Error Handling** - Graceful error recovery

### 🔧 Technical

- **TypeScript** - Type-safe codebase
- **Zustand** - Lightweight state management
- **Next.js Image** - Optimized image loading
- **Video.js** - Professional video player
- **Form Validation** - Zod + React Hook Form
- **Shadcn UI** - 26+ beautiful components

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+
- **npm** or **pnpm**

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/fisekiptv-rebuild.git

# Navigate to project
cd fisekiptv-rebuild

# Install dependencies
npm install

# Run development server
npm run dev

# Open browser
# Visit http://localhost:3000
```

### First Time Setup

1. Open the application
2. Connection dialog will appear
3. Enter your IPTV server URL (e.g., `http://example.com`)
4. Enter your MAC address (e.g., `00:1A:79:XX:XX:XX`)
5. Click "Connect to Server"
6. Start watching!

---

## 📁 Project Structure

```
fisekiptv-rebuild/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes (resolve-stream, ts-proxy)
│   │   ├── page.tsx           # Home (Live TV)
│   │   ├── movies/            # Movies page
│   │   ├── series/            # Series page
│   │   ├── settings/          # Settings page
│   │   └── test-streams/      # Stream testing page
│   │
│   ├── components/
│   │   ├── features/          # Feature components
│   │   ├── layout/            # Layout components
│   │   └── ui/                # Shadcn UI components (26+)
│   │
│   ├── hooks/                 # Custom React hooks
│   ├── store/                 # Zustand stores
│   ├── lib/                   # Utilities & API client
│   ├── types/                 # TypeScript types
│   └── config/                # Configuration
│
├── docs/                      # Documentation
│   └── archive/               # Historical docs
│
├── public/                    # Static assets
├── ARCHITECTURE.md            # Complete architecture documentation
├── IMPLEMENTATION.md          # Implementation phases
├── RULES.md                   # Development standards
├── README.md                  # This file
└── package.json
```

---

## 🎯 Usage Guide

### Live TV

1. Click "Live TV" tab
2. Select a genre from sidebar
3. Browse channels in grid
4. Click "Watch Live" to play
5. Use player controls (PiP, fullscreen, etc.)

### Movies

1. Click "Movies" tab
2. Select a category from sidebar
3. Browse movies in grid
4. Search for specific titles
5. Click "Play Movie" to watch
6. Load more for additional content

### TV Series

1. Click "Series" tab
2. Select a category from sidebar
3. Browse series in grid
4. Click "View Episodes" on a series
5. Select an episode to watch
6. Click "Back to Series" to return

### Settings

1. Click "Settings" button in header
2. View connection information
3. Change server if needed
4. Clear cache to free up space
5. Disconnect from server

---

## 🛠️ Development

### Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint

# Add Shadcn Components
npx shadcn@latest add [component-name]
```

### Tech Stack

**Frontend:**
- Next.js 16.0.0 (App Router)
- React 19.2.0
- TypeScript 5.x
- Tailwind CSS 4.x

**UI Components:**
- Shadcn UI
- Radix UI (primitives)
- Lucide React (icons)

**State Management:**
- Zustand (stores)
- LocalStorage (persistence)

**Media:**
- Video.js (player)
- @videojs/http-streaming (HLS)
- Next.js Image (optimization)

**Forms:**
- React Hook Form
- Zod (validation)

**Notifications:**
- Sonner (toasts)

---

## 📖 Architecture

### State Management

**Connection Store** (`src/store/connection.ts`)
- Server URL
- MAC Address
- Connection status
- Account information

**Content Store** (`src/store/content.ts`)
- Current tab (live/movies/series)
- View mode (grid/list)
- Categories
- Content items (channels, movies, series, episodes)
- Search query
- Pagination

**Player Store** (`src/store/player.ts`)
- Stream URL
- Current title
- Playing status
- Minimized state

### API Client

**IPTVClient** (`src/lib/api/client.ts`)
- Account & connection endpoints
- Live TV channels
- VOD movies
- TV series & episodes
- Stream link creation
- Image URL building

### Custom Hooks

- `useChannels` - Fetch and manage channels
- `useMovies` - Fetch and manage movies
- `useSeries` - Fetch and manage series
- `usePlayer` - Control video player
- `useInfiniteScroll` - Implement infinite scroll
- `useDebouncedCallback` - Debounce user input

---

## 🎨 UI Components

### Feature Components
- ConnectionDialog - Server connection form
- ChannelCard / ChannelListItem - Channel display
- MovieCard / MovieListItem - Movie display
- SeriesCard - Series display
- EpisodeCard - Episode display
- VideoPlayer - Video.js player
- SearchBar - Search input with debounce
- ViewToggle - Grid/List switcher
- InfiniteScroll - Infinite scroll wrapper
- ErrorBoundary - Error handling
- LoadingScreen - Loading indicator

### Shadcn Components (26+)
Button, Card, Dialog, Input, Label, Select, Form, Tabs, Sidebar, Breadcrumb, ScrollArea, Separator, Badge, Avatar, Table, Sonner, Spinner, Skeleton, Command, Popover, ToggleGroup, Dropdown, Sheet, Tooltip, and more...

---

## 🔒 Security

- No sensitive data stored in code
- Server credentials persist in localStorage only
- Form validation prevents invalid inputs
- Error boundaries prevent app crashes
- TypeScript ensures type safety

---

## 🚧 Troubleshooting

### Connection Issues
- Verify server URL is correct
- Check MAC address format (XX:XX:XX:XX:XX:XX)
- Ensure server is accessible
- Check firewall/network settings

### Playback Issues
- Verify stream URL is valid
- Check browser console for errors
- Try different browser
- Clear cache and reconnect

### Performance Issues
- Clear browser cache
- Use "Clear Cache" in Settings
- Close unused tabs
- Check network speed

---

## 📝 License

MIT License - feel free to use this project for personal or commercial purposes.

---

## 🙏 Acknowledgments

Built with:
- [Next.js](https://nextjs.org/) - React framework
- [Shadcn UI](https://ui.shadcn.com/) - UI components
- [Video.js](https://videojs.com/) - Video player
- [Zustand](https://zustand-demo.pmnd.rs/) - State management
- [Tailwind CSS](https://tailwindcss.com/) - Styling

---

## 📧 Contact

For issues or questions, please create an issue on GitHub.

---

**Enjoy your IPTV streaming! 🎉**
