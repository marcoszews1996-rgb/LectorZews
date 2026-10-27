import React from 'react';
import {
  Clock,
  Play,
  Trash2,
  X,
  BookOpen,
  Calendar,
  FileText,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { BookHistoryItem } from '../types';
import { sounds } from '../utils/soundEffects';

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  history: BookHistoryItem[];
  onResumeBook: (item: BookHistoryItem) => void;
  onRemoveHistoryItem: (id: string) => void;
  onClearHistory: () => void;
}

function formatTimeAgo(timestamp: number): string {
  const diffSec = Math.floor((Date.now() - timestamp) / 1000);
  if (diffSec < 60) return 'Hace unos momentos';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `Hace ${diffMin} min`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `Hace ${diffHours} h`;
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays === 1) return 'Ayer';
  if (diffDays < 7) return `Hace ${diffDays} días`;
  return new Date(timestamp).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'short',
  });
}

export const HistoryModal: React.FC<HistoryModalProps> = ({
  isOpen,
  onClose,
  history,
  onResumeBook,
  onRemoveHistoryItem,
  onClearHistory,
}) => {
  if (!isOpen) return null;

  return (
    <div
      id="history-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-950/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        id="history-modal-content"
        className="relative w-full max-w-2xl max-h-[88vh] flex flex-col rounded-3xl bg-neutral-900 border border-amber-500/30 text-neutral-100 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Clock */}
        <div className="flex items-start justify-between p-5 sm:p-6 border-b border-neutral-800 bg-neutral-950/40 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-amber-500/15 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-md shadow-amber-950/30">
              <Clock className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold font-title text-neutral-100">
                  Historial de Libros Reproducidos
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold border border-amber-500/30">
                  {history.length}
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-0.5 font-serif-elegant">
                Tus libros recientes y el punto exacto donde pausaste la narración
              </p>
            </div>
          </div>
          <button
            id="btn-close-history-modal"
            onClick={() => {
              sounds.playClick(400);
              onClose();
            }}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-100 hover:bg-neutral-800 transition"
            title="Cerrar historial"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
                <Clock className="w-8 h-8 opacity-60" />
              </div>
              <h3 className="text-base font-semibold text-neutral-200 mb-1 font-serif-elegant">
                No hay libros reproducidos todavía
              </h3>
              <p className="text-xs text-neutral-400 max-w-sm leading-relaxed mb-4">
                Cuando empieces a reproducir cualquier libro de la biblioteca o cargues tu propio PDF, se registrará aquí automáticamente con tu avance de página.
              </p>
              <button
                onClick={() => {
                  sounds.playClick(600);
                  onClose();
                }}
                className="px-4 py-2 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-semibold transition active:scale-95"
              >
                Explorar biblioteca de libros
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1 text-xs text-neutral-400">
                <span>Últimas sesiones de audio</span>
                <button
                  id="btn-clear-all-history"
                  onClick={() => {
                    sounds.playClick(300);
                    onClearHistory();
                  }}
                  className="flex items-center gap-1 text-[11px] text-red-400/80 hover:text-red-300 transition"
                  title="Borrar todo el historial"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Limpiar historial</span>
                </button>
              </div>

              {history.map((item) => (
                <div
                  key={item.id}
                  id={`history-item-${item.id}`}
                  className="group p-3.5 sm:p-4 rounded-2xl bg-neutral-950/70 border border-neutral-800 hover:border-amber-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 text-[10px] font-mono font-medium border border-amber-500/20">
                        {item.isSample ? 'OBRA CLÁSICA' : 'PDF'}
                      </span>
                      <span className="text-[11px] text-neutral-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatTimeAgo(item.lastPlayedAt)}
                      </span>
                    </div>

                    <h4 className="text-sm font-bold text-neutral-100 group-hover:text-amber-300 transition-colors truncate font-serif-elegant">
                      {item.title}
                    </h4>

                    {item.author && (
                      <p className="text-xs text-neutral-400 truncate mt-0.5">
                        {item.author}
                      </p>
                    )}

                    {/* Progress Bar & Page info */}
                    <div className="mt-2.5 flex items-center gap-3">
                      <div className="flex-1 h-1.5 rounded-full bg-neutral-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-600 to-amber-400 transition-all duration-300"
                          style={{ width: `${Math.max(4, Math.min(100, item.progressPercent))}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-mono text-amber-300/90 whitespace-nowrap">
                        Pág. {item.lastPageIndex + 1} de {item.totalPages} ({Math.round(item.progressPercent)}%)
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-800/80 justify-end">
                    <button
                      id={`btn-resume-${item.id}`}
                      onClick={() => {
                        sounds.playClick(700);
                        onResumeBook(item);
                        onClose();
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-neutral-950 font-bold text-xs shadow-md shadow-amber-950/40 transition active:scale-95"
                      title="Reanudar narración de este libro"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Reanudar</span>
                    </button>

                    <button
                      id={`btn-remove-${item.id}`}
                      onClick={() => {
                        sounds.playClick(400);
                        onRemoveHistoryItem(item.id);
                      }}
                      className="p-2 rounded-xl text-neutral-500 hover:text-red-400 hover:bg-neutral-800/80 transition"
                      title="Eliminar del historial"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 sm:p-4 border-t border-neutral-800 bg-neutral-950/50 flex items-center justify-between text-xs text-neutral-400 shrink-0">
          <div className="flex items-center gap-1.5 text-[11px] text-amber-400/80">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Guarda automáticamente tu página y segundo exacto</span>
          </div>
          <button
            onClick={() => {
              sounds.playClick(400);
              onClose();
            }}
            className="px-4 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs font-semibold transition active:scale-95"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
