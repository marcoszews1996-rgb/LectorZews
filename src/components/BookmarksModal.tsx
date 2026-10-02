import React, { useState } from 'react';
import { Bookmark, FavoriteItem, PDFDocumentData } from '../types';
import { sounds } from '../utils/soundEffects';
import {
  Bookmark as BookmarkIcon,
  Star,
  Trash2,
  ExternalLink,
  Edit3,
  Check,
  X,
  Clock,
  BookOpen,
  Search,
  PlusCircle,
} from 'lucide-react';

interface BookmarksModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookmarks: Bookmark[];
  favorites: FavoriteItem[];
  currentDoc: PDFDocumentData | null;
  currentPage: number;
  currentSentence: number;
  onJumpToBookmark: (bookmark: Bookmark) => void;
  onDeleteBookmark: (id: string) => void;
  onUpdateNote: (id: string, note: string) => void;
  onAddCurrentBookmark: (note?: string) => void;
  onSelectFavorite: (fav: FavoriteItem) => void;
  onToggleFavoriteDoc: (doc: PDFDocumentData) => void;
  isCurrentDocFavorite: boolean;
}

export const BookmarksModal: React.FC<BookmarksModalProps> = ({
  isOpen,
  onClose,
  bookmarks,
  favorites,
  currentDoc,
  currentPage,
  currentSentence,
  onJumpToBookmark,
  onDeleteBookmark,
  onUpdateNote,
  onAddCurrentBookmark,
  onSelectFavorite,
  onToggleFavoriteDoc,
  isCurrentDocFavorite,
}) => {
  const [activeTab, setActiveTab] = useState<'bookmarks' | 'favorites'>('bookmarks');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [newQuickNote, setNewQuickNote] = useState('');
  const [showAddPrompt, setShowAddPrompt] = useState(false);

  if (!isOpen) return null;

  const filteredBookmarks = bookmarks.filter((bm) => {
    const q = searchQuery.toLowerCase();
    return (
      bm.docTitle.toLowerCase().includes(q) ||
      bm.snippet.toLowerCase().includes(q) ||
      (bm.note && bm.note.toLowerCase().includes(q))
    );
  });

  const handleSaveNote = (id: string) => {
    sounds.playClick(700);
    onUpdateNote(id, noteText);
    setEditingNoteId(null);
  };

  const handleStartEditNote = (bm: Bookmark) => {
    sounds.playClick(600);
    setEditingNoteId(bm.id);
    setNoteText(bm.note || '');
  };

  const handleQuickAdd = () => {
    sounds.playPlay();
    onAddCurrentBookmark(newQuickNote.trim() || undefined);
    setNewQuickNote('');
    setShowAddPrompt(false);
  };

  return (
    <div
      id="bookmarks-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm transition-opacity"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          sounds.playClick(500);
          onClose();
        }
      }}
    >
      <div
        id="bookmarks-modal-card"
        className="w-full max-w-xl max-h-[90vh] flex flex-col rounded-2xl bg-neutral-900/95 border border-amber-500/20 text-neutral-100 shadow-2xl overflow-hidden backdrop-blur-md"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-800 bg-neutral-950/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <BookmarkIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-neutral-100 font-serif-elegant tracking-wide">
                Marcadores y Favoritos
              </h2>
              <p className="text-xs text-neutral-400">
                Puntos de lectura guardados en tus documentos
              </p>
            </div>
          </div>
          <button
            id="btn-close-bookmarks"
            onClick={() => {
              sounds.playClick(500);
              onClose();
            }}
            className="w-8 h-8 rounded-full flex items-center justify-center text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
            title="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-neutral-800 px-5 pt-3 gap-2 bg-neutral-950/40">
          <button
            id="tab-bookmarks"
            onClick={() => {
              sounds.playClick(650);
              setActiveTab('bookmarks');
            }}
            className={`pb-3 px-3 text-xs sm:text-sm font-medium transition-colors relative flex items-center gap-2 ${
              activeTab === 'bookmarks'
                ? 'text-amber-400 border-b-2 border-amber-400'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <BookmarkIcon className="w-4 h-4" />
            <span>Marcadores</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-mono">
              {bookmarks.length}
            </span>
          </button>

          <button
            id="tab-favorites"
            onClick={() => {
              sounds.playClick(650);
              setActiveTab('favorites');
            }}
            className={`pb-3 px-3 text-xs sm:text-sm font-medium transition-colors relative flex items-center gap-2 ${
              activeTab === 'favorites'
                ? 'text-amber-400 border-b-2 border-amber-400'
                : 'text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Star className="w-4 h-4" />
            <span>Documentos Favoritos</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 font-mono">
              {favorites.length}
            </span>
          </button>
        </div>

        {/* Current Document Quick Bookmark Bar */}
        {currentDoc && activeTab === 'bookmarks' && (
          <div className="px-5 py-3 bg-amber-500/5 border-b border-amber-500/15 flex flex-col gap-2">
            <div className="flex items-center justify-between gap-2">
              <div className="text-xs text-neutral-300 flex items-center gap-1.5 truncate">
                <BookOpen className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span className="truncate font-medium">{currentDoc.title}</span>
                <span className="text-neutral-500">·</span>
                <span className="text-amber-300/90 shrink-0 font-mono">
                  Pág. {currentPage}
                </span>
              </div>

              <button
                id="btn-trigger-add-bookmark"
                onClick={() => {
                  sounds.playClick(750);
                  setShowAddPrompt(!showAddPrompt);
                }}
                className="shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-medium transition-all active:scale-95"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>{showAddPrompt ? 'Cancelar' : 'Marcar página actual'}</span>
              </button>
            </div>

            {showAddPrompt && (
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  placeholder="Añadir una nota o recordatorio (opcional)..."
                  value={newQuickNote}
                  onChange={(e) => setNewQuickNote(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd()}
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg bg-neutral-950 border border-neutral-700 text-neutral-100 placeholder-neutral-500 focus:outline-none focus:border-amber-500"
                  autoFocus
                />
                <button
                  id="btn-confirm-add-bookmark"
                  onClick={handleQuickAdd}
                  className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-neutral-950 font-medium text-xs transition-colors"
                >
                  Guardar
                </button>
              </div>
            )}
          </div>
        )}

        {/* Search Bar for Bookmarks */}
        {activeTab === 'bookmarks' && bookmarks.length > 2 && (
          <div className="px-5 py-2.5 border-b border-neutral-800 flex items-center gap-2 bg-neutral-950/20">
            <Search className="w-3.5 h-3.5 text-neutral-500" />
            <input
              type="text"
              placeholder="Buscar en marcadores o notas..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="text-xs text-neutral-400 hover:text-white"
              >
                Limpiar
              </button>
            )}
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-[220px]">
          {activeTab === 'bookmarks' ? (
            filteredBookmarks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-neutral-400">
                <div className="w-12 h-12 rounded-2xl bg-neutral-800/80 border border-neutral-700 flex items-center justify-center text-neutral-500 mb-3">
                  <BookmarkIcon className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium text-neutral-300">
                  {searchQuery ? 'No hay marcadores coincidentes' : 'Aún no has guardado marcadores'}
                </p>
                <p className="text-xs text-neutral-500 max-w-xs mt-1">
                  Guarda tus fragmentos y páginas favoritas pulsando el icono de marcador en la barra de lectura.
                </p>
              </div>
            ) : (
              filteredBookmarks.map((bm) => (
                <div
                  key={bm.id}
                  id={`bookmark-item-${bm.id}`}
                  className="group p-3.5 rounded-xl bg-neutral-950/60 hover:bg-neutral-900/90 border border-neutral-800 hover:border-amber-500/30 transition-all flex flex-col gap-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                        Pág. {bm.pageNumber}
                      </span>
                      <span className="text-xs font-semibold text-neutral-200 truncate">
                        {bm.docTitle}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        id={`btn-jump-bm-${bm.id}`}
                        onClick={() => {
                          sounds.playSkip(true);
                          onJumpToBookmark(bm);
                          onClose();
                        }}
                        className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-medium flex items-center gap-1 transition-all active:scale-95"
                        title="Ir a este punto de lectura"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Ir</span>
                      </button>

                      <button
                        id={`btn-edit-note-${bm.id}`}
                        onClick={() => handleStartEditNote(bm)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
                        title="Editar nota"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        id={`btn-delete-bm-${bm.id}`}
                        onClick={() => {
                          sounds.playClick(400);
                          onDeleteBookmark(bm.id);
                        }}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-neutral-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                        title="Eliminar marcador"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Text snippet */}
                  <p className="text-xs text-neutral-300 italic line-clamp-2 bg-neutral-900/50 p-2 rounded-lg border-l-2 border-amber-500/40">
                    "{bm.snippet}"
                  </p>

                  {/* Note Editing or View */}
                  {editingNoteId === bm.id ? (
                    <div className="flex items-center gap-2 pt-1">
                      <input
                        type="text"
                        value={noteText}
                        onChange={(e) => setNoteText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSaveNote(bm.id)}
                        className="flex-1 px-2 py-1 text-xs rounded bg-neutral-900 border border-neutral-700 text-neutral-200 focus:outline-none focus:border-amber-400"
                        placeholder="Nota o recordatorio..."
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveNote(bm.id)}
                        className="w-6 h-6 rounded bg-amber-500 text-neutral-950 flex items-center justify-center"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setEditingNoteId(null)}
                        className="w-6 h-6 rounded bg-neutral-800 text-neutral-400 flex items-center justify-center"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : bm.note ? (
                    <div className="text-[11px] text-amber-300/80 bg-amber-500/10 px-2.5 py-1 rounded-md flex items-center gap-1.5">
                      <span className="font-semibold">Nota:</span>
                      <span className="truncate">{bm.note}</span>
                    </div>
                  ) : null}

                  <div className="flex items-center gap-1 text-[10px] text-neutral-500">
                    <Clock className="w-3 h-3" />
                    <span>{new Date(bm.createdAt).toLocaleDateString()} a las {new Date(bm.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))
            )
          ) : (
            /* Favorites Tab */
            favorites.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center text-neutral-400">
                <div className="w-12 h-12 rounded-2xl bg-neutral-800/80 border border-neutral-700 flex items-center justify-center text-amber-400/50 mb-3">
                  <Star className="w-6 h-6" />
                </div>
                <p className="text-sm font-medium text-neutral-300">
                  No hay documentos marcados como favoritos
                </p>
                <p className="text-xs text-neutral-500 max-w-xs mt-1">
                  Pulsa la estrella en el encabezado de cualquier libro o PDF para tenerlo siempre a mano.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {favorites.map((fav) => (
                  <div
                    key={fav.id}
                    id={`favorite-item-${fav.id}`}
                    className="p-3.5 rounded-xl bg-neutral-950/60 hover:bg-neutral-900 border border-neutral-800 hover:border-amber-500/30 flex items-center justify-between gap-3 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-xs sm:text-sm font-semibold text-neutral-200 truncate">
                          {fav.title}
                        </h4>
                        <p className="text-[11px] text-neutral-400">
                          {fav.totalPages} páginas · Guardado el{' '}
                          {new Date(fav.savedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <button
                      id={`btn-open-favorite-${fav.id}`}
                      onClick={() => {
                        sounds.playClick(700);
                        onSelectFavorite(fav);
                        onClose();
                      }}
                      className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-medium transition-all active:scale-95 shrink-0"
                    >
                      Abrir
                    </button>
                  </div>
                ))}
              </div>
            )
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-neutral-800/80 bg-neutral-950/80 flex items-center justify-between text-xs text-neutral-400">
          <span>LectorZews · Almacenamiento local seguro</span>
          {currentDoc && (
            <button
              id="btn-toggle-favorite-footer"
              onClick={() => {
                sounds.playTick();
                onToggleFavoriteDoc(currentDoc);
              }}
              className="flex items-center gap-1.5 text-amber-400 hover:text-amber-300 font-medium"
            >
              <Star
                className={`w-3.5 h-3.5 ${
                  isCurrentDocFavorite ? 'fill-amber-400 text-amber-400' : 'text-neutral-400'
                }`}
              />
              <span>{isCurrentDocFavorite ? 'En favoritos' : 'Añadir a favoritos'}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
