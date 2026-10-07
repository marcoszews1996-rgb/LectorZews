import React from 'react';
import {
  Headphones,
  Smartphone,
  Lock,
  BatteryCharging,
  CheckCircle2,
  X,
  Volume2,
  Sparkles,
  Radio,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
import { sounds } from '../utils/soundEffects';
import { AmbientTrackId } from '../types';
import { Music } from 'lucide-react';

interface BackgroundAudioModalProps {
  isOpen: boolean;
  onClose: () => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  bookTitle?: string;
  ambientTrack?: AmbientTrackId;
  onOpenVoicesModal?: () => void;
}

export const BackgroundAudioModal: React.FC<BackgroundAudioModalProps> = ({
  isOpen,
  onClose,
  isPlaying,
  onTogglePlay,
  bookTitle,
  ambientTrack = 'none',
  onOpenVoicesModal,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="background-audio-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-950/80 backdrop-blur-md animate-fadeIn"
      onClick={() => {
        sounds.playClick(400);
        onClose();
      }}
    >
      <div
        id="background-audio-modal-container"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-3xl bg-neutral-900/95 border border-amber-500/40 shadow-2xl p-5 sm:p-6 text-neutral-100 flex flex-col gap-4 scrollbar-thin"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
              <Headphones className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold font-title text-neutral-100">
                  Lectura en Segundo Plano
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  Activado
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Escucha tus libros mientras usas otras aplicaciones o con la pantalla apagada
              </p>
            </div>
          </div>

          <button
            id="btn-close-bg-audio-modal"
            onClick={() => {
              sounds.playClick(400);
              onClose();
            }}
            className="p-2 rounded-xl text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Audio Status Indicator Card */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/15 to-neutral-950 border border-amber-500/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 shrink-0">
              <Radio className={`w-4 h-4 ${isPlaying ? 'animate-spin' : ''}`} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-amber-200 truncate">
                {bookTitle || 'LectorZews Activo'}
              </p>
              <p className="text-[11px] text-neutral-400 flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
                <span>{isPlaying ? 'Transmitiendo voz activamente' : 'Listo para reproducir'}</span>
              </p>
            </div>
          </div>

          <button
            id="btn-bg-modal-toggle-play"
            onClick={() => {
              sounds.playClick(600);
              onTogglePlay();
            }}
            className="px-3.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs shadow-md transition active:scale-95 shrink-0"
          >
            {isPlaying ? 'Pausar' : 'Probar Ahora'}
          </button>
        </div>

        {/* Ambient Instrumental Status Card */}
        <div className="p-3.5 rounded-2xl bg-neutral-950 border border-emerald-500/30 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <Music className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-neutral-200 truncate">
                Música Instrumental de Fondo:{' '}
                <span className="text-emerald-300">
                  {ambientTrack === 'biblioteca'
                    ? '📖 Biblioteca Acústica'
                    : ambientTrack === 'lluvia'
                    ? '🌧️ Lluvia Serena (432 Hz)'
                    : '🔇 Desactivada'}
                </span>
              </p>
              <p className="text-[11px] text-neutral-400">
                {ambientTrack !== 'none'
                  ? 'Suena suavemente de fondo mientras se lee cualquier PDF.'
                  : 'Puedes activar instrumentales relajantes desde el selector de voz.'}
              </p>
            </div>
          </div>

          {onOpenVoicesModal && (
            <button
              id="btn-bg-modal-change-ambient"
              onClick={() => {
                sounds.playClick(600);
                onClose();
                onOpenVoicesModal();
              }}
              className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold transition active:scale-95 shrink-0"
            >
              Cambiar
            </button>
          )}
        </div>

        {/* How it Works / Features */}
        <div className="space-y-3 text-xs text-neutral-300">
          <h4 className="font-semibold text-neutral-200 text-xs uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            ¿Cómo funciona en tu teléfono o PC?
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800 flex items-start gap-2.5">
              <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-neutral-200">Pantalla Bloqueada</p>
                <p className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">
                  Puedes apagar o bloquear la pantalla del teléfono; la narración continuará sin detenerse frase tras frase.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800 flex items-start gap-2.5">
              <Smartphone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-neutral-200">Multitarea Libre</p>
                <p className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">
                  Abre WhatsApp, Google Maps, revisa redes o trabaja en tu PC; la app seguirá hablando en segundo plano.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800 flex items-start gap-2.5">
              <Volume2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-neutral-200">Controles de Notificación</p>
                <p className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">
                  Aparece la tarjeta multimedia de Android/Windows en la barra superior para pausar o saltar frases.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-neutral-950/60 border border-neutral-800 flex items-start gap-2.5">
              <Headphones className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-neutral-200">Audífonos Bluetooth</p>
                <p className="text-[11px] text-neutral-400 mt-0.5 leading-relaxed">
                  Pausa y reanuda presionando el botón táctil de tus audífonos inalámbricos o del volante de tu auto.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Vital Android Tip: Battery Optimization */}
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200/90 space-y-2">
          <div className="flex items-center gap-2 font-semibold text-amber-300">
            <BatteryCharging className="w-4 h-4 text-amber-400" />
            <span>Consejo de batería en Android (Xiaomi, Samsung, Motorola, etc.)</span>
          </div>
          <p className="text-[11px] text-neutral-300 leading-relaxed">
            Para evitar que Android cierre la aplicación automáticamente tras unos minutos:
          </p>
          <ol className="list-decimal list-inside text-[11px] text-neutral-300 space-y-1 pl-1">
            <li>Mantén presionado el icono de <strong>LectorZews</strong> y toca <strong>Información de la app (ⓘ)</strong>.</li>
            <li>Entra en <strong>Batería</strong> (o <em>Uso de batería</em>).</li>
            <li>Selecciona <strong>"Sin restricciones"</strong> o <strong>"No optimizar"</strong>.</li>
          </ol>
        </div>

        {/* Technical Reality & Instant Multitask Solutions */}
        <div className="p-3.5 rounded-2xl bg-neutral-950/70 border border-amber-500/40 text-xs space-y-2.5">
          <div className="flex items-center gap-2 font-semibold text-amber-300">
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
            <span>¿Es normal que se detenga al apagar la pantalla en el APK de prueba?</span>
          </div>
          <p className="text-[11px] text-neutral-300 leading-relaxed">
            <strong>Sí, es 100% normal en el APK de prueba.</strong> PWABuilder empaqueta la app utilizando el motor interno de <strong>Google Chrome (TWA)</strong>. Google Chrome tiene una restricción de fábrica que bloquea la síntesis de voz en cuanto el móvil se bloquea o la app pierde foco total.
          </p>
          <div className="pt-1 space-y-1.5 text-[11px] text-neutral-300">
            <p className="font-semibold text-amber-200">¿Cómo usar la app ahora mismo mientras haces otras cosas?</p>
            <div className="space-y-1.5 pl-1">
              <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800">
                <p className="font-semibold text-emerald-300">📱 Opción 1 (Recomendada): Pantalla Dividida o Ventana Flotante</p>
                <p className="text-[10px] text-neutral-400 mt-0.5">
                  Abre LectorZews en ventana emergente o pantalla dividida arriba en tu teléfono. Puedes chatear en WhatsApp, navegar en TikTok, Instagram o trabajar y la voz <strong>nunca se pausará</strong>.
                </p>
              </div>
              <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800">
                <p className="font-semibold text-amber-300">🕯️ Opción 2: Modo Pantalla Activa (WakeLock)</p>
                <p className="text-[10px] text-neutral-400 mt-0.5">
                  La app activa el modo atril con tema oscuro: la pantalla no se apaga sola y puedes dejar el móvil sobre tu mesa o cargador escuchando tu libro sin consumir batería.
                </p>
              </div>
              <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800">
                <p className="font-semibold text-indigo-300">📦 Opción 3: Publicación definitiva en Play Store (Capacitor)</p>
                <p className="text-[10px] text-neutral-400 mt-0.5">
                  La compilación nativa en Android Studio con Capacitor añade un <em>Foreground Service</em> nativo de Android, que le permite hablar con la pantalla 100% apagada dentro del bolsillo.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Close Button */}
        <button
          id="btn-confirm-bg-audio-modal"
          onClick={() => {
            sounds.playClick(700);
            onClose();
          }}
          className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-semibold text-xs transition active:scale-98"
        >
          Entendido, disfrutar en segundo plano
        </button>
      </div>
    </div>
  );
};
