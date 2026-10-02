import { Bookmark, FavoriteItem, ThemeMode, VoicePresetId, BookHistoryItem } from '../types';

const BOOKMARKS_KEY = 'lectorzews_bookmarks_v1';
const FAVORITES_KEY = 'lectorzews_favorites_v1';
const SETTINGS_KEY = 'lectorzews_settings_v1';
const HISTORY_KEY = 'lectorzews_history_v1';

export interface UserSettings {
  speed: number;
  voicePreset: VoicePresetId;
  language: string;
  theme: ThemeMode;
  soundsEnabled: boolean;
  fontSize: 'sm' | 'md' | 'lg' | 'xl';
  smartRhythm: boolean;
}

const DEFAULT_SETTINGS: UserSettings = {
  speed: 1.0,
  voicePreset: 'femenina',
  language: 'es',
  theme: 'auto',
  soundsEnabled: true,
  fontSize: 'md',
  smartRhythm: true,
};

export function getStoredBookmarks(): Bookmark[] {
  try {
    const raw = localStorage.getItem(BOOKMARKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveBookmark(bookmark: Omit<Bookmark, 'id' | 'createdAt'>): Bookmark {
  const bookmarks = getStoredBookmarks();
  const newBookmark: Bookmark = {
    ...bookmark,
    id: 'bm_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    createdAt: Date.now(),
  };
  const updated = [newBookmark, ...bookmarks];
  try {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
  } catch {}
  return newBookmark;
}

export function removeBookmark(id: string): Bookmark[] {
  const bookmarks = getStoredBookmarks();
  const updated = bookmarks.filter((b) => b.id !== id);
  try {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
  } catch {}
  return updated;
}

export function updateBookmarkNote(id: string, note: string): Bookmark[] {
  const bookmarks = getStoredBookmarks();
  const updated = bookmarks.map((b) => (b.id === id ? { ...b, note } : b));
  try {
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
  } catch {}
  return updated;
}

export function getStoredFavorites(): FavoriteItem[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function toggleFavorite(item: Omit<FavoriteItem, 'savedAt'>): boolean {
  const favorites = getStoredFavorites();
  const exists = favorites.some((f) => f.fileName === item.fileName);
  let updated: FavoriteItem[];
  if (exists) {
    updated = favorites.filter((f) => f.fileName !== item.fileName);
  } else {
    updated = [{ ...item, savedAt: Date.now() }, ...favorites];
  }
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
  } catch {}
  return !exists;
}

export function isFavorite(fileName: string): boolean {
  const favorites = getStoredFavorites();
  return favorites.some((f) => f.fileName === fileName);
}

export function getStoredSettings(): UserSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    // Migrate any legacy presets to strictly 'femenina' or 'masculina'
    if (parsed.voicePreset !== 'femenina' && parsed.voicePreset !== 'masculina') {
      if (
        parsed.voicePreset === 'masculine' ||
        parsed.voicePreset === 'sharvard_m' ||
        parsed.voicePreset === 'deep_baritone' ||
        parsed.voicePreset === 'classic_narrator'
      ) {
        parsed.voicePreset = 'masculina';
      } else {
        parsed.voicePreset = 'femenina';
      }
    }
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: Partial<UserSettings>) {
  try {
    const current = getStoredSettings();
    localStorage.setItem(SETTINGS_KEY, JSON.stringify({ ...current, ...settings }));
  } catch {}
}

export function getStoredHistory(): BookHistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveHistoryItem(item: Omit<BookHistoryItem, 'id' | 'lastPlayedAt'>): BookHistoryItem[] {
  const history = getStoredHistory();
  const id = item.fileName || item.title;
  const filtered = history.filter((h) => h.fileName !== item.fileName && h.title !== item.title);
  const newItem: BookHistoryItem = {
    ...item,
    id,
    lastPlayedAt: Date.now(),
  };
  const updated = [newItem, ...filtered].slice(0, 50);
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch {}
  return updated;
}

export function removeHistoryItem(id: string): BookHistoryItem[] {
  const history = getStoredHistory();
  const updated = history.filter((h) => h.id !== id && h.fileName !== id);
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch {}
  return updated;
}

export function clearHistory(): void {
  try {
    localStorage.removeItem(HISTORY_KEY);
  } catch {}
}

const PDF_OPEN_COUNT_KEY = 'lectorzews_pdf_open_count_v1';
const INTERSTITIAL_SHOWN_KEY = 'lectorzews_interstitial_shown_v1';

export function getPdfOpenCount(): number {
  try {
    const raw = localStorage.getItem(PDF_OPEN_COUNT_KEY);
    return raw ? parseInt(raw, 10) || 0 : 0;
  } catch {
    return 0;
  }
}

export function incrementPdfOpenCount(): number {
  const current = getPdfOpenCount();
  const next = current + 1;
  try {
    localStorage.setItem(PDF_OPEN_COUNT_KEY, next.toString());
  } catch {}
  return next;
}

export function resetPdfOpenCount(): void {
  try {
    localStorage.setItem(PDF_OPEN_COUNT_KEY, '0');
    localStorage.removeItem(INTERSTITIAL_SHOWN_KEY);
  } catch {}
}

export function hasSeenInterstitial(): boolean {
  try {
    return localStorage.getItem(INTERSTITIAL_SHOWN_KEY) === 'true';
  } catch {
    return false;
  }
}

export function markInterstitialAsSeen(): void {
  try {
    localStorage.setItem(INTERSTITIAL_SHOWN_KEY, 'true');
  } catch {}
}
