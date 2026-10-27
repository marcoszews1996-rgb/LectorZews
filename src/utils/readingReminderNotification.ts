import { BookHistoryItem } from '../types';
import { getStoredHistory } from './storage';

const NOTIFICATIONS_ENABLED_KEY = 'lectorzews_notifs_enabled_v1';
const LAST_NOTIF_SENT_KEY = 'lectorzews_last_notif_sent_v1';
const LAST_READ_BOOK_KEY = 'lectorzews_last_read_book_v1';

// 8 hours in milliseconds (8 * 60 * 60 * 1000)
export const REMINDER_INTERVAL_MS = 8 * 60 * 60 * 1000;

export interface LastReadBookData {
  title: string;
  fileName: string;
  page: number;
  totalPages: number;
  sentenceIndex: number;
  author?: string;
  timestamp: number;
}

const PLEASANT_MESSAGES = [
  {
    title: '📖 Tu rincón de lectura te espera',
    body: (book: string, page: number) =>
      `¿Continuamos con «${book}» en la página ${page}? Toca para seguir escuchando donde lo dejaste con tu voz preferida.`,
  },
  {
    title: '✨ Un momento de calma para ti',
    body: (book: string, page: number) =>
      `Es un instante ideal para desconectar y sumergirte en «${book}» (Pág. ${page}). Tu audiolibro está listo.`,
  },
  {
    title: '☕ Haz una pausa reconfortante',
    body: (book: string, page: number) =>
      `Tómate un respiro con «${book}». Tu lectura en segundo plano te acompaña cuando quieras relajarte.`,
  },
  {
    title: '🌿 Respira hondo y disfruta la historia',
    body: (book: string, page: number) =>
      `Retoma «${book}» justo donde lo dejaste en la página ${page}. Todo preparado para acompañarte.`,
  },
  {
    title: '💫 Tu historia favorita no se olvida',
    body: (book: string, page: number) =>
      `Descubre qué ocurre ahora en «${book}» (Pág. ${page}). ¡Vuelve a disfrutar de la lectura en LectorZews!`,
  },
  {
    title: '🎧 Tu narración te está esperando',
    body: (book: string, page: number) =>
      `Colócate los auriculares y continúa con «${book}» en la página ${page}. Relájate y escucha a tu ritmo.`,
  },
];

const DEFAULT_WELCOME_MESSAGES = [
  {
    title: '📖 Un momento de paz con tus libros',
    body: 'Disfruta de audiolibros, poesía y tus documentos PDF con voz natural en segundo plano en LectorZews.',
  },
  {
    title: '✨ Tu biblioteca está lista para ti',
    body: 'Elige una obra clásica, un poema de Bécquer o tu propio archivo PDF para relajarte escuchando.',
  },
];

export class ReadingReminderService {
  private timerId: number | null = null;
  private onResumeHandler: ((book: LastReadBookData) => void) | null = null;

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  public getPermissionStatus(): NotificationPermission | 'unsupported' {
    if (!this.isSupported()) return 'unsupported';
    return Notification.permission;
  }

  public isEnabled(): boolean {
    try {
      const stored = localStorage.getItem(NOTIFICATIONS_ENABLED_KEY);
      if (stored === null) {
        // By default enabled if permission is already granted
        return this.getPermissionStatus() === 'granted';
      }
      return stored === 'true';
    } catch {
      return false;
    }
  }

  public setEnabled(enabled: boolean): void {
    try {
      localStorage.setItem(NOTIFICATIONS_ENABLED_KEY, enabled ? 'true' : 'false');
    } catch {}
  }

  public getLastNotificationSent(): number {
    try {
      const raw = localStorage.getItem(LAST_NOTIF_SENT_KEY);
      return raw ? parseInt(raw, 10) || 0 : 0;
    } catch {
      return 0;
    }
  }

  private setLastNotificationSent(time: number): void {
    try {
      localStorage.setItem(LAST_NOTIF_SENT_KEY, time.toString());
    } catch {}
  }

  public recordLastReadPosition(data: Omit<LastReadBookData, 'timestamp'>): void {
    try {
      const item: LastReadBookData = {
        ...data,
        timestamp: Date.now(),
      };
      localStorage.setItem(LAST_READ_BOOK_KEY, JSON.stringify(item));
    } catch {}
  }

  public getLastReadBook(): LastReadBookData | null {
    try {
      const raw = localStorage.getItem(LAST_READ_BOOK_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
      // Fallback: pick the latest item from playback history
      const history = getStoredHistory();
      if (history.length > 0) {
        const top = history[0];
        return {
          title: top.title,
          fileName: top.fileName,
          page: top.lastPageIndex + 1,
          totalPages: top.totalPages,
          sentenceIndex: top.lastSentenceIndex,
          author: top.author,
          timestamp: top.lastPlayedAt,
        };
      }
      return null;
    } catch {
      return null;
    }
  }

  public async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) return false;
    try {
      const perm = await Notification.requestPermission();
      if (perm === 'granted') {
        this.setEnabled(true);
        // Dispatch initial confirmation notification
        this.sendNotification(
          '🔔 Notificaciones activadas en LectorZews',
          'Te recordaremos con cariño cada 8 horas para que retomes tus lecturas justo donde las dejaste.'
        );
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  public async sendNotification(title: string, body: string, bookData?: LastReadBookData | null): Promise<boolean> {
    if (!this.isSupported()) return false;
    if (Notification.permission !== 'granted') return false;

    try {
      // 1. Try Service Worker showNotification for persistent native mobile notification
      if ('serviceWorker' in navigator) {
        try {
          const reg = await navigator.serviceWorker.ready;
          if (reg && 'showNotification' in reg) {
            await reg.showNotification(title, {
              body,
              icon: '/pwa-192x192.png',
              badge: '/pwa-192x192.png',
              data: {
                url: '/',
                bookData: bookData || null,
              },
              tag: 'lectorzews-reading-reminder',
              vibrate: [200, 100, 200],
            } as unknown as NotificationOptions);
            this.setLastNotificationSent(Date.now());
            return true;
          }
        } catch {}
      }

      // 2. Standard Web Notification API fallback
      const notif = new Notification(title, {
        body,
        icon: '/pwa-192x192.png',
        badge: '/pwa-192x192.png',
        tag: 'lectorzews-reading-reminder',
      });

      notif.onclick = () => {
        try {
          window.focus();
        } catch {}
        if (bookData && this.onResumeHandler) {
          this.onResumeHandler(bookData);
        }
        notif.close();
      };

      this.setLastNotificationSent(Date.now());
      return true;
    } catch (err) {
      console.warn('Error sending notification:', err);
      return false;
    }
  }

  /**
   * Checks if 8 hours have elapsed since the last notification, and if so, sends a personalized reminder.
   */
  public async checkAndSend8HourReminder(force: boolean = false): Promise<boolean> {
    if (!this.isEnabled()) return false;
    if (this.getPermissionStatus() !== 'granted') return false;

    const lastSent = this.getLastNotificationSent();
    const now = Date.now();
    const elapsed = now - lastSent;

    if (!force && elapsed < REMINDER_INTERVAL_MS) {
      return false;
    }

    const lastBook = this.getLastReadBook();
    if (lastBook && lastBook.title) {
      // Randomly pick a warm pleasant template
      const template = PLEASANT_MESSAGES[Math.floor(Math.random() * PLEASANT_MESSAGES.length)];
      const pageNumber = Math.max(1, lastBook.page || 1);
      const title = template.title;
      const body = template.body(lastBook.title, pageNumber);
      return this.sendNotification(title, body, lastBook);
    } else {
      const template = DEFAULT_WELCOME_MESSAGES[Math.floor(Math.random() * DEFAULT_WELCOME_MESSAGES.length)];
      return this.sendNotification(template.title, template.body, null);
    }
  }

  /**
   * Send an immediate test reminder so the user can verify how it looks and feels.
   */
  public async triggerTestReminder(): Promise<boolean> {
    return this.checkAndSend8HourReminder(true);
  }

  /**
   * Start recurring background monitor:
   * Checks every 5 minutes if the 8-hour threshold has passed.
   */
  public startSchedule(onResume?: (book: LastReadBookData) => void): void {
    if (onResume) {
      this.onResumeHandler = onResume;
    }

    // Immediate check on initialization
    this.checkAndSend8HourReminder(false);

    // Periodic check every 5 minutes (300,000 ms)
    if (this.timerId !== null) {
      clearInterval(this.timerId);
    }
    this.timerId = window.setInterval(() => {
      this.checkAndSend8HourReminder(false);
    }, 5 * 60 * 1000);

    // Check on window focus and visibility change
    if (typeof window !== 'undefined') {
      window.addEventListener('visibilitychange', () => {
        if (!document.hidden) {
          this.checkAndSend8HourReminder(false);
        }
      });
    }
  }

  public stopSchedule(): void {
    if (this.timerId !== null) {
      clearInterval(this.timerId);
      this.timerId = null;
    }
  }
}

export const readingReminderService = new ReadingReminderService();
