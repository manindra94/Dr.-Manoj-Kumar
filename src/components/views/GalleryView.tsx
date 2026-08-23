import React, { useState, useEffect } from 'react';
import {
  Award,
  Image,
  Maximize2,
  X,
  Microscope,
  Plus,
  Edit3,
  Trash2,
  ShieldCheck,
  Bookmark,
  MessageSquare,
  Filter,
  Layers,
  Sparkles
} from 'lucide-react';
import { localDB, StorageState } from '../../lib/db';
import { useAuth } from '../../lib/AuthContext';
import { GalleryItem } from '../../types';

interface GalleryViewProps {
  onOpenAddGalleryModal?: () => void;
  onOpenEditGalleryModal?: (item: GalleryItem) => void;
}

export const GalleryView: React.FC<GalleryViewProps> = ({
  onOpenAddGalleryModal,
  onOpenEditGalleryModal
}) => {
  const [dbState, setDbState] = useState<StorageState>(localDB.getState());
  const [selectedImage, setSelectedImage] = useState<GalleryItem | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [noteItem, setNoteItem] = useState<GalleryItem | null>(null);
  const [galleryNote, setGalleryNote] = useState('');

  const { user, isAdmin } = useAuth();

  useEffect(() => {
    return localDB.subscribe(setDbState);
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete gallery item: "${title}"?`)) {
      await localDB.deleteGalleryItem(id);
      if (selectedImage?.id === id) {
        setSelectedImage(null);
      }
    }
  };

  const handleSaveGalleryNote = async () => {
    if (!noteItem) return;
    await localDB.saveGalleryNote(noteItem.id, galleryNote);
    setNoteItem(null);
    setGalleryNote('');
  };

  const categories = ['All', ...Array.from(new Set(dbState.gallery.map((g) => g.category)))];

  const filteredGallery = dbState.gallery.filter((item) => {
    if (activeCategory === 'All') return true;
    return item.category === activeCategory;
  });

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-300">
      {/* Title */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#122131] border border-[#ffc640]/30 text-[#ffc640] font-mono text-xs font-semibold uppercase tracking-wider">
            <Award className="w-3.5 h-3.5" />
            LABORATORY GALLERY ({dbState.gallery.length} FIGURES)
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && onOpenAddGalleryModal && (
              <button
                onClick={onOpenAddGalleryModal}
                className="px-4 py-2 rounded-lg bg-[#ffc640] hover:bg-[#e3aa00] text-[#051424] font-mono text-xs font-bold uppercase flex items-center gap-1.5 transition-all shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>ADD GALLERY FIGURE</span>
              </button>
            )}
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold font-serif text-[#d4e4fa]">
          Micrographs & <span className="text-[#ffc640]">Laboratory Gallery</span>
        </h1>

        <p className="text-xs sm:text-sm text-[#c6c6cd] leading-relaxed max-w-2xl font-sans">
          Dynamic repository of honors, fellowships, and scientific imagery from CSIR-IMMT material characterization labs.
        </p>
      </section>

      {/* Awards Grid */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold font-serif text-[#d4e4fa]">Major Awards & Medals</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {dbState.awards.map((award, i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-[#122131] border border-[#1c2b3c] space-y-3 hover:border-[#ffc640] transition-all shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-[#1c2b3c] text-[#ffc640]">
                  <Award className="w-6 h-6" />
                </div>
                <span className="px-3 py-1 rounded bg-[#051424] text-[#2fd9f4] font-mono text-xs font-bold border border-[#273647]">
                  {award.year}
                </span>
              </div>

              <h3 className="text-lg font-bold font-serif text-[#d4e4fa]">{award.title}</h3>
              <p className="text-xs text-[#c6c6cd] leading-relaxed font-sans">{award.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Category Filter Tabs */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-bold font-serif text-[#d4e4fa]">Research Gallery & Characterization</h2>
          <div className="flex flex-wrap gap-2 font-mono text-xs">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg border transition-all ${
                  activeCategory === cat
                    ? 'bg-[#2fd9f4] text-[#051424] font-bold border-[#2fd9f4]'
                    : 'bg-[#122131] text-[#c6c6cd] border-[#273647] hover:text-[#d4e4fa]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredGallery.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedImage(item)}
              className="group relative rounded-xl bg-[#122131] border border-[#1c2b3c] overflow-hidden cursor-pointer hover:border-[#ffc640] transition-all shadow-md flex flex-col justify-between"
            >
              <div>
                <div className="aspect-video overflow-hidden relative bg-[#051424]">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#051424] via-transparent to-transparent opacity-80" />
                  
                  <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isAdmin && onOpenEditGalleryModal && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenEditGalleryModal(item);
                        }}
                        className="p-1.5 rounded-lg bg-[#051424]/90 text-[#ffc640] hover:bg-[#1c2b3c]"
                        title="Edit figure"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {isAdmin && (
                      <button
                        onClick={(e) => handleDelete(e, item.id, item.title)}
                        className="p-1.5 rounded-lg bg-[#051424]/90 text-rose-400 hover:bg-rose-950/80"
                        title="Delete figure"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <div className="p-1.5 rounded-lg bg-[#051424]/90 text-[#d4e4fa]">
                      <Maximize2 className="w-3.5 h-3.5 text-[#2fd9f4]" />
                    </div>
                  </div>

                  {item.figureNo && (
                    <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#051424]/90 text-[#ffc640] font-mono text-[10px] font-bold border border-[#273647]">
                      {item.figureNo}
                    </span>
                  )}
                </div>

                <div className="p-3.5 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#2fd9f4]">
                    <span>{item.category}</span>
                    {item.scaleBar && <span className="text-[#ffc640]">{item.scaleBar}</span>}
                  </div>
                  <h3 className="font-serif font-bold text-sm text-[#d4e4fa] group-hover:text-[#ffc640] transition-colors leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-[#c6c6cd] line-clamp-2 font-sans">{item.description}</p>
                </div>
              </div>

              {/* Technical notes & Researcher tools */}
              <div className="p-3.5 pt-0 flex items-center justify-between border-t border-[#1c2b3c] font-mono text-xs">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setNoteItem(item);
                    setGalleryNote(item.userNotes || '');
                  }}
                  className="text-[11px] text-[#2fd9f4] hover:underline flex items-center gap-1"
                >
                  <MessageSquare className="w-3 h-3" />
                  <span>{item.userNotes ? 'View Notes' : 'Add Note'}</span>
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    localDB.toggleOfflineGalleryItem(item.id);
                  }}
                  className={`text-[11px] flex items-center gap-1 ${
                    item.isSavedOffline ? 'text-emerald-400 font-bold' : 'text-[#c6c6cd] hover:text-[#d4e4fa]'
                  }`}
                >
                  <Bookmark className="w-3 h-3 text-[#ffc640]" />
                  <span>{item.isSavedOffline ? 'Saved' : 'Save'}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Lightbox Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-[#051424]/90 backdrop-blur-md p-4 flex items-center justify-center animate-in fade-in">
          <div className="max-w-3xl w-full bg-[#122131] border border-[#273647] rounded-2xl overflow-hidden p-6 space-y-4 relative shadow-2xl">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 p-2 rounded-lg bg-[#051424] text-slate-300 hover:text-white border border-[#273647]"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="aspect-video rounded-xl overflow-hidden border border-[#273647] bg-[#051424]">
              <img
                src={selectedImage.imageUrl}
                alt={selectedImage.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-contain"
              />
            </div>

            <div className="space-y-2 font-mono">
              <div className="flex items-center justify-between text-xs text-[#ffc640]">
                <span>[{selectedImage.category}] {selectedImage.scaleBar && `• ${selectedImage.scaleBar}`}</span>
                {isAdmin && onOpenEditGalleryModal && (
                  <button
                    onClick={() => {
                      const curr = selectedImage;
                      setSelectedImage(null);
                      onOpenEditGalleryModal(curr);
                    }}
                    className="px-2.5 py-1 rounded bg-[#1c2b3c] text-[#ffc640] border border-[#ffc640]/40 flex items-center gap-1 font-bold"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Figure</span>
                  </button>
                )}
              </div>
              <h2 className="text-xl font-bold font-serif text-[#d4e4fa]">{selectedImage.title}</h2>
              <p className="text-xs text-[#c6c6cd] leading-relaxed font-sans">{selectedImage.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Researcher Gallery Note Modal */}
      {noteItem && (
        <div className="fixed inset-0 z-50 bg-[#051424]/90 backdrop-blur-md p-4 flex items-center justify-center animate-in fade-in">
          <div className="max-w-md w-full bg-[#122131] border border-[#273647] rounded-2xl p-6 space-y-4 relative shadow-2xl font-mono text-xs">
            <button
              onClick={() => setNoteItem(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-[#051424] text-slate-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 text-[#2fd9f4] font-bold">
              <MessageSquare className="w-4 h-4" />
              <span>FIGURE ANALYSIS NOTE</span>
            </div>

            <h3 className="font-serif font-bold text-sm text-[#d4e4fa]">{noteItem.title}</h3>

            <div>
              <label className="text-[#c6c6cd] block mb-1">Microstructural / Phase Identification Notes</label>
              <textarea
                rows={4}
                value={galleryNote}
                onChange={(e) => setGalleryNote(e.target.value)}
                placeholder="e.g. Dendritic spacing ~12 μm with fine Laves phase precipitation along inter-dendritic boundaries..."
                className="w-full px-3 py-2 rounded-lg bg-[#051424] border border-[#273647] text-[#d4e4fa] focus:border-[#2fd9f4] outline-none leading-relaxed"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setNoteItem(null)}
                className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveGalleryNote}
                className="px-4 py-2 rounded-lg bg-[#2fd9f4] hover:bg-[#1ebcd4] text-[#051424] font-bold"
              >
                Save Figure Note
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
