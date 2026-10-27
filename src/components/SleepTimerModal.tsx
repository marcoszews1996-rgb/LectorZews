import React, { useState } from 'react';
import { SleepTimerState, SleepTimerMode } from '../types';
import { sounds } from '../utils/soundEffects';
import {
  Moon,
  Clock,
  BatteryCharging,
  X,
  Plus,
  Square,
  Play,
  Check,
  Sparkles,
  Zap,
  BookOpen,
} from 'lucide-react';

interface SleepTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
  timerState: SleepTimerState;
  onStartTimer: (minutes: number, mode?: SleepTimerMode) => void;
  onCancelTimer: () => void;
  onAddMinutes: (minutes: number) => void;
  isDarkMode: boolean;
  onEnableDarkMode?: () => void;
}

const PRESET_INTERVALS = [
  { minutes: 15, label: '15 min', desc: 'Siesta breve o descanso ligero' },
  { minutes: 30, label: '30 min', desc: 'Ideal para conciliar el sueño', recommended: true },
  { minutes: 45, label: '45 min', desc: 'Lectura nocturna relajada' },
  { minutes: 60, label: '60 min (1 hora)', desc: 'Capítulo largo de novela' },
];

export const SleepTimerModal: React.FC<SleepTimerModalProps> = ({
  isOpen,
  onClose,
  timerState,
  onStartTimer,
  onCancelTimer,
  onAddMinutes,
  isDarkMode,
  onEnableDarkMode,
}) => {
  const [customMinutes, setCustomMinutes] = useState<number>(20);
  const [showCustomInput, setShowCustomInput] = useState<boolean>(false);

  if (!isOpen) return null;

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    if (mins >= 60) {
      const hrs = Math.floor(mins / 60);
      const remMins = mins % 60;
      return `${hrs}h ${remMins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
    }
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSelectPreset = (mins: number) => {
    sounds.playSleepTimerSet();
    onStartTimer(mins, 'duration');
  };

  const handleSelectEndOfPage = () => {
    sounds.playSleepTimerSet();
    onStartTimer(0, 'end_of_page');
  };

  const handleStartCustom = () => {
    const val = Math.max(1, Math.min(240, customMinutes));
    sounds.playSleepTimerSet();
    onStartTimer(val, 'duration');
    setShowCustomInput(false);
  };

  const handleAddQuickTime = (mins: number) => {
    sounds.playTick();
    onAddMinutes(mins);
  };

  const handleCancel = () => {
    sounds.playTick();
    onCancelTimer();
  };

  const progressPercent =
    timerState.isActive && timerState.initialMinutes > 0
      ? Math.max(
          0,
          Math.min(
            100,
            Math.round((timerState.remainingSeconds / (timerState.initialMinutes * 60)) * 100)
          )
        )
      : 0;

  return (
    <div
      id="sleep-timer-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-950/80 backdrop-blur-sm animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          sounds.playTick();
          onClose();
        }
      }}
    >
      <div
        id="sleep-timer-modal"
        className="w-full max-w-md max-h-[92vh] flex flex-col rounded-2xl bg-neutral-900/95 border border-indigo-500/25 text-neutral-100 shadow-2xl overflow-hidden backdrop-blur-md transition-all"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-neutral-950/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
              <Moon className="w-4 h-4 text-indigo-300 fill-indigo-300/20" />
            </div>
            <div>
              <h2 className="text-base font-bold text-neutral-100 flex items-center gap-2">
                Temporizador de Apagado
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold uppercase tracking-wider">
                  Noche
                </span>
              </h2>
              <p className="text-xs text-neutral-400">
                Pausa la lectura automáticamente y ahorra batería
              </p>
            </div>
          </div>
          <button
            id="btn-close-sleep-timer-modal"
            onClick={() => {
              sounds.playTick();
              onClose();
            }}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/80 transition-colors"
            title="Cerrar ventana"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Active Timer Live Countdown Card */}
          {timerState.isActive ? (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-950/60 to-neutral-950/80 border border-indigo-500/40 space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 animate-ping" />
                  <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
                    {timerState.mode === 'end_of_page'
                      ? 'Temporizador activo: Fin de página'
                      : 'Temporizador activo'}
                  </span>
                </div>
                <span className="text-xs text-indigo-300/80 font-mono">
                  {timerState.mode === 'end_of_page'
                    ? 'Pausará al cambiar página'
                    : `${progressPercent}% restante`}
                </span>
              </div>

              {timerState.mode === 'duration' ? (
                <div className="flex flex-col items-center py-2">
                  <span className="font-mono text-4xl sm:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-white to-amber-200">
                    {formatTime(timerState.remainingSeconds)}
                  </span>
                  <span className="text-xs text-neutral-400 mt-1">
                    Tiempo restante para pausar el audio
                  </span>

                  {/* Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-neutral-800 overflow-hidden mt-3">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-amber-400 transition-all duration-1000 rounded-full"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center py-3 text-center">
                  <div className="w-12 h-12 rounded-full bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center mb-2">
                    <BookOpen className="w-6 h-6 text-indigo-300" />
                  </div>
                  <p className="text-sm font-semibold text-neutral-200">
                    Se pausará al terminar la página actual
                  </p>
                  <p className="text-xs text-neutral-400 mt-0.5">
                    Disfruta de este capítulo; la narración se detendrá suavemente sin sobresaltos.
                  </p>
                </div>
              )}

              {/* Action buttons while timer is active */}
              <div className="grid grid-cols-3 gap-2 pt-1">
                <button
                  id="btn-timer-add-5m"
                  onClick={() => handleAddQuickTime(5)}
                  className="px-2.5 py-2 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 border border-neutral-700 text-xs font-semibold text-neutral-200 flex items-center justify-center gap-1 transition-all active:scale-95"
                  title="Sumar 5 minutos al temporizador"
                >
                  <Plus className="w-3.5 h-3.5 text-indigo-400" />
                  <span>+5 min</span>
                </button>
                <button
                  id="btn-timer-add-15m"
                  onClick={() => handleAddQuickTime(15)}
                  className="px-2.5 py-2 rounded-xl bg-neutral-800/80 hover:bg-neutral-700 border border-neutral-700 text-xs font-semibold text-neutral-200 flex items-center justify-center gap-1 transition-all active:scale-95"
                  title="Sumar 15 minutos al temporizador"
                >
                  <Plus className="w-3.5 h-3.5 text-indigo-400" />
                  <span>+15 min</span>
                </button>
                <button
                  id="btn-timer-cancel"
                  onClick={handleCancel}
                  className="px-2.5 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-xs font-semibold text-red-300 flex items-center justify-center gap-1 transition-all active:scale-95"
                  title="Desactivar temporizador"
                >
                  <Square className="w-3 h-3 fill-red-400/80" />
                  <span>Cancelar</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800 flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400 shrink-0">
                <BatteryCharging className="w-4 h-4" />
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Selecciona un intervalo. Cuando el tiempo termine, la lectura se pausará
                automáticamente para no dejar el audio encendido toda la noche.
              </p>
            </div>
          )}

          {/* Quick Preset Intervals */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-amber-400/90">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Intervalos recomendados
              </span>
              {timerState.isActive && (
                <span className="text-neutral-500 text-[11px] font-normal normal-case">
                  Pulsa para cambiar tiempo
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {PRESET_INTERVALS.map((preset) => {
                const isCurrentActive =
                  timerState.isActive &&
                  timerState.mode === 'duration' &&
                  timerState.initialMinutes === preset.minutes;

                return (
                  <button
                    key={preset.minutes}
                    id={`btn-sleep-preset-${preset.minutes}`}
                    onClick={() => handleSelectPreset(preset.minutes)}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all active:scale-98 ${
                      isCurrentActive
                        ? 'bg-indigo-500/20 border-indigo-400 text-neutral-100 shadow-md shadow-indigo-950/40'
                        : 'bg-neutral-950/60 hover:bg-neutral-800/80 border-neutral-800 text-neutral-300 hover:border-neutral-700'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-neutral-100">{preset.label}</span>
                        {preset.recommended && (
                          <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300 font-semibold border border-amber-500/30">
                            Popular
                          </span>
                        )}
                      </div>
                      {isCurrentActive && <Check className="w-4 h-4 text-indigo-400" />}
                    </div>
                    <span className="text-[11px] text-neutral-400">{preset.desc}</span>
                  </button>
                );
              })}
            </div>

            {/* End of Current Page Option */}
            <button
              id="btn-sleep-preset-end-of-page"
              onClick={handleSelectEndOfPage}
              className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition-all active:scale-98 ${
                timerState.isActive && timerState.mode === 'end_of_page'
                  ? 'bg-indigo-500/20 border-indigo-400 text-neutral-100 shadow-md shadow-indigo-950/40'
                  : 'bg-neutral-950/60 hover:bg-neutral-800/80 border-neutral-800 text-neutral-300 hover:border-neutral-700'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-neutral-800 flex items-center justify-center text-amber-400">
                  <BookOpen className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-neutral-100">Al terminar la página actual</h4>
                  <p className="text-[11px] text-neutral-400">
                    Detiene la lectura cuando finalice la última frase de esta página
                  </p>
                </div>
              </div>
              {timerState.isActive && timerState.mode === 'end_of_page' && (
                <Check className="w-4 h-4 text-indigo-400 shrink-0" />
              )}
            </button>
          </div>

          {/* Custom Duration Input */}
          <div className="p-3.5 rounded-xl bg-neutral-950/60 border border-neutral-800 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Tiempo personalizado
              </span>
              {!showCustomInput && (
                <button
                  id="btn-toggle-custom-sleep-input"
                  onClick={() => setShowCustomInput(true)}
                  className="text-xs text-amber-400 hover:text-amber-300 font-medium"
                >
                  Configurar minutos
                </button>
              )}
            </div>

            {showCustomInput && (
              <div className="space-y-3 pt-1 animate-fadeIn">
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min="1"
                    max="120"
                    step="1"
                    value={customMinutes}
                    onChange={(e) => setCustomMinutes(Number(e.target.value))}
                    className="flex-1 accent-amber-500 cursor-pointer h-2 bg-neutral-800 rounded-lg"
                  />
                  <div className="w-16 px-2 py-1 rounded-lg bg-neutral-900 border border-neutral-700 text-center font-mono font-bold text-sm text-amber-300">
                    {customMinutes} m
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    id="btn-start-custom-timer"
                    onClick={handleStartCustom}
                    className="flex-1 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 text-neutral-950 text-xs font-bold shadow-md hover:brightness-105 active:scale-95 transition-all"
                  >
                    Activar {customMinutes} minutos
                  </button>
                  <button
                    onClick={() => setShowCustomInput(false)}
                    className="px-3 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-xs text-neutral-400"
                  >
                    Ocultar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Night Mode & Battery Tip */}
          {!isDarkMode && onEnableDarkMode && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-neutral-200">
                <Moon className="w-4 h-4 text-amber-300 shrink-0" />
                <span>¿Lees en la oscuridad? Activa el modo oscuro para no deslumbrarte.</span>
              </div>
              <button
                id="btn-enable-dark-mode-sleep"
                onClick={() => {
                  sounds.playTick();
                  onEnableDarkMode();
                }}
                className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[11px] font-semibold shrink-0 transition-colors"
              >
                Activar
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-neutral-800 bg-neutral-950/70 flex items-center justify-between text-xs text-neutral-400">
          <span className="flex items-center gap-1.5">
            <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
            <span>Evita el gasto de batería nocturno</span>
          </span>
          <button
            id="btn-sleep-timer-ready"
            onClick={() => {
              sounds.playTick();
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 font-medium transition-colors"
          >
            Listo
          </button>
        </div>
      </div>
    </div>
  );
};
