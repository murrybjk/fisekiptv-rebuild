// ============================================================================
// CONFIGURATION CONSTANTS - FisekIPTV
// ============================================================================

export const API_CONFIG = {
  defaultTimeout: 5000,
  itemsPerPage: 50,
  retryAttempts: 3,
  retryDelay: 1000,
}

export const ROUTES = {
  home: '/',
  channels: '/channels',
  movies: '/movies',
  series: '/series',
  settings: '/settings',
}

export const LOCAL_STORAGE_KEYS = {
  connection: 'fisekiptv-connection',
  theme: 'fisekiptv-theme',
}

export const PLACEHOLDERS = {
  channel: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTAiIGhlaWdodD0iNTAiIGZpbGw9IiM2NjYiIHZpZXdCb3g9IjAgMCAxNiAxNiI+PHBhdGggZD0iTTggMTVBNyA3IDAgMSAxIDggMWE3IDcgMCAwIDEgMCAxNFptMC0xMEE2IDYgMCAxIDAgOCAxNGE2IDYgMCAwIDAtNi02eiIvPjwvc3ZnPg==',
  movie: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzQ0NCIgdmlld0JveD0iMCAwIDIwIDMwIj48cmVjdCB3aWR0aD0iMjAiIGhlaWdodD0iMzAiIGZpbGw9IiMzMzMiLz48dGV4dCB4PSIxMCIgeT0iMTciIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiIGZvbnQtc2l6ZT0iMyI+TW92aWU8L3RleHQ+PC9zdmc+',
  series: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iIzQ0NCIgdmlld0JveD0iMCAwIDIwIDMwIj48cmVjdCB3aWR0aD0iMjAiIGhlaWdodD0iMzAiIGZpbGw9IiMzMzMiLz48dGV4dCB4PSIxMCIgeT0iMTciIHRleHQtYW5jaG9yPSJtaWRkbGUiIGZpbGw9IiM2NjYiIGZvbnQtc2l6ZT0iMyI+U2VyaWVzPC90ZXh0Pjwvc3ZnPg==',
}
