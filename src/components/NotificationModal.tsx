import React, { useState } from 'react';
import { sounds } from '../utils/soundEffects';
import { readingReminderService, LastReadBookData, REMINDER_INTERVAL_MS } from '../utils/readingReminderNotification';
import {
  Bell,
  BellRing,
  Clock,
  Check,
  X,
  Sparkles,
  BookOpen,
  Send,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react';

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  lastReadBook: LastReadBookData | null;
  onToast: (msg: string) => void;
}

export const NotificationModal: React.FC<NotificationModalProps> = ({
  isOpen,
  onClose,
  lastReadBook,
  onToast,
}) => {
  const [isEnabled, setIsEnabled] = useState<boolean>(() => readingReminderService.isEnabled());
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>(() =>
    readingReminderService.getPermissionStatus()
  );
  const [isSendingTest, setIsSendingTest] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleToggle = async () => {
    sounds.playTick();
    if (permission !== 'granted') {
      const granted = await readingReminderService.requestPermission();
      const updatedPerm = readingReminderService.getPermissionStatus();
      setPermission(updatedPerm);
      if (granted) {
        setIsEnabled(true);
        sounds.playDocumentLoaded();
        onToast('🔔 ¡Notificaciones cada 8h activadas con éxito!');
      } else {
        onToast('Aviso: Permite las notificaciones en tu navegador o celular para recibir recordatorios');
      }
      return;
    }

    const next = !isEnabled;
    setIsEnabled(next);
    readingReminderService.setEnabled(next);
    if (next) {
      sounds.playPlay();
      onToast('Recordatorios cada 8 horas activados');
    } else {
      sounds.playClick(400);
      onToast('Recordatorios pausados');
    }
  };

  const handleRequestPermission = async () => {
    sounds.playClick(600);
    const granted = await readingReminderService.requestPermission();
    const updatedPerm = readingReminderService.getPermissionStatus();
    setPermission(updatedPerm);
    if (granted) {
      setIsEnabled(true);
      sounds.playDocumentLoaded();
      onToast('🔔 ¡Permisos concedidos! Recibirás mensajes cada 8 horas');
    } else {
      onToast('Aviso: No se concedió el permiso de notificaciones');
    }
  };

  const handleSendTestNotification = async () => {
    if (permission !== 'granted') {
      await handleRequestPermission();
      return;
    }

    setIsSendingTest(true);
    sounds.playPlay();
    const sent = await readingReminderService.triggerTestReminder();
    setTimeout(() => {
      setIsSendingTest(false);
      if (sent) {
        sounds.playDocumentLoaded();
        onToast('✨ Notificación agradable enviada. Revisa tu barra de notificaciones');
      } else {
        onToast('No se pudo enviar la notificación. Verifica que estén permitidas.');
      }
    }, 400);
  };

  const lastSent = readingReminderService.getLastNotificationSent();
  const nextScheduledMs = lastSent ? Math.max(0, lastSent + REMINDER_INTERVAL_MS - Date.now()) : 0;
  const hoursLeft = Math.floor(nextScheduledMs / (1000 * 60 * 60));
  const minutesLeft = Math.floor((nextScheduledMs % (1000 * 60 * 60)) / (1000 * 60));

  return (
    <div
      id="notification-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="notification-modal-card"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl bg-gradient-to-b from-neutral-900 via-neutral-900/95 to-neutral-950 border border-amber-500/30 shadow-2xl p-5 sm:p-6 text-neutral-100 flex flex-col gap-4 relative animate-scaleUp"
      >
        {/* Close Button */}
        <button
          id="btn-close-notification-modal"
          onClick={() => {
            sounds.playClick(400);
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-xl bg-neutral-800/80 hover:bg-neutral-800 text-neutral-400 hover:text-neutral-200 transition active:scale-95"
          title="Cerrar"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0 border border-amber-500/30 shadow-inner">
            <BellRing className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="font-title text-base sm:text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-400">
              Recordatorios cada 8 Horas
            </h3>
            <p className="text-xs text-neutral-400">
              Mensajes agradables para retomar tu lectura donde la dejaste
            </p>
          </div>
        </div>

        {/* Permission Warning Banner if not granted */}
        {permission !== 'granted' && permission !== 'unsupported' && (
          <div className="p-3.5 rounded-xl bg-amber-950/50 border border-amber-500/30 flex items-start gap-3 text-xs text-amber-200">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold mb-1">Permiso necesario</p>
              <p className="text-amber-300/80 mb-2 leading-relaxed">
                Para que LectorZews te recuerde cada 8 horas volver a leer, activa los permisos de notificación.
              </p>
              <button
                onClick={handleRequestPermission}
                className="px-3 py-1.5 rounded-lg bg-amber-500 text-neutral-950 font-bold text-xs shadow-md active:scale-95 transition"
              >
                Activar notificaciones
              </button>
            </div>
          </div>
        )}

        {/* Main Toggle Switch */}
        <div
          onClick={handleToggle}
          className="p-3.5 rounded-xl bg-neutral-800/70 hover:bg-neutral-800 border border-neutral-700/60 cursor-pointer flex items-center justify-between gap-3 transition active:scale-[0.99]"
        >
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
                isEnabled && permission === 'granted'
                  ? 'bg-amber-500 text-neutral-950'
                  : 'bg-neutral-700/60 text-neutral-400'
              }`}
            >
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-neutral-100">
                Avisos periódicos cada 8 horas
              </p>
              <p className="text-[11px] text-neutral-400">
                {isEnabled && permission === 'granted'
                  ? 'Activo: te enviaremos un mensaje cálido'
                  : 'Desactivado'}
              </p>
            </div>
          </div>

          <div
            className={`w-11 h-6 rounded-full transition-colors relative p-0.5 ${
              isEnabled && permission === 'granted' ? 'bg-amber-500' : 'bg-neutral-700'
            }`}
          >
            <div
              className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform ${
                isEnabled && permission === 'granted' ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </div>
        </div>

        {/* Last Read Book Preview */}
        <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800 flex flex-col gap-2">
          <div className="flex items-center justify-between text-[11px] text-amber-400/90 font-semibold uppercase tracking-wider">
            <span className="flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              Tu punto de lectura actual
            </span>
            <span className="font-mono text-neutral-400 text-[10px]">
              {lastReadBook ? `Pág. ${lastReadBook.page}` : 'Sin libro iniciado'}
            </span>
          </div>

          {lastReadBook ? (
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs font-bold text-neutral-200 truncate">{lastReadBook.title}</p>
                <p className="text-[11px] text-neutral-400">
                  {lastReadBook.author ? `${lastReadBook.author} • ` : ''}Página {lastReadBook.page} de{' '}
                  {lastReadBook.totalPages}
                </p>
              </div>
              <div className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" title="Punto guardado" />
            </div>
          ) : (
            <p className="text-xs text-neutral-400 italic">
              Abre cualquier libro para que los avisos te inviten a continuarlo en su página exacta.
            </p>
          )}
        </div>

        {/* Timing Information */}
        {isEnabled && permission === 'granted' && (
          <div className="flex items-center justify-between px-2 text-[11px] text-neutral-400">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400/80" />
              Próximo recordatorio:
            </span>
            <span className="font-mono text-amber-300 font-semibold">
              {nextScheduledMs > 0 ? `En ~${hoursLeft}h ${minutesLeft}m` : 'Próximamente hoy'}
            </span>
          </div>
        )}

        {/* Test Notification Button */}
        <div className="pt-1 flex flex-col gap-2">
          <button
            id="btn-test-notification"
            onClick={handleSendTestNotification}
            disabled={isSendingTest}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-neutral-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-950/40 active:scale-95 transition disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isSendingTest ? 'Enviando...' : 'Probar notificación ahora'}</span>
          </button>
          <p className="text-[10px] text-center text-neutral-400">
            Envía una notificación de muestra agradable de inmediato para comprobar el sonido y el mensaje en tu pantalla.
          </p>
        </div>
      </div>
    </div>
  );
};
