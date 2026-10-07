export type ThemeMode = 'auto' | 'dark' | 'light';

export type VoicePresetId = 'femenina' | 'masculina';

export type AmbientTrackId = 'none' | 'biblioteca' | 'lluvia';

export interface AmbientTrack {
  id: AmbientTrackId;
  name: string;
  badge: string;
  description: string;
  icon: string;
}

export interface VoicePreset {
  id: VoicePresetId;
  name: string;
  badge: string;
  description: string;
  pitch: number;
  rateMultiplier: number;
  gender: 'female' | 'male';
}

export interface LanguageOption {
  code: string;
  name: string;
  flag: string;
  nativeName?: string;
  fullCode?: string;
  isDefault?: boolean;
}

export interface DocumentPage {
  pageNumber: number;
  text: string;
  sentences: string[];
}

export interface PDFDocumentData {
  title: string;
  fileName: string;
  totalPages: number;
  pages: DocumentPage[];
  totalSentences: number;
}

export interface PlaybackPosition {
  pageIndex: number;
  sentenceIndex: number;
}

export interface Bookmark {
  id: string;
  docTitle: string;
  docFileName: string;
  pageNumber: number;
  sentenceIndex: number;
  snippet: string;
  createdAt: number;
  note?: string;
}

export interface FavoriteItem {
  id: string;
  fileName: string;
  title: string;
  totalPages: number;
  savedAt: number;
}

export type SleepTimerMode = 'duration' | 'end_of_page';

export interface SleepTimerState {
  isActive: boolean;
  mode: SleepTimerMode;
  initialMinutes: number;
  remainingSeconds: number;
  targetTimestamp: number | null; // Date.now() timestamp when timer fires
}

export interface BookHistoryItem {
  id: string;
  title: string;
  author?: string;
  fileName: string;
  totalPages: number;
  lastPageIndex: number;
  lastSentenceIndex: number;
  progressPercent: number;
  lastPlayedAt: number;
  isSample?: boolean;
  sampleId?: string;
}
