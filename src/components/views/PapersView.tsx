import React, { useState, useEffect } from 'react';
import {
  Search,
  ExternalLink,
  Bookmark,
  Check,
  Filter,
  Share2,
  Plus,
  Edit3,
  Trash2,
  ShieldCheck,
  BookOpen,
  MessageSquare,
  FileSpreadsheet,
  Download,
  Copy,
  CheckCheck,
  User,
  Quote,
  Sparkles,
  Send,
  X
} from 'lucide-react';
import { localDB, StorageState } from '../../lib/db';
import { useAuth } from '../../lib/AuthContext';
import { Publication } from '../../types';

interface PapersViewProps {
  onSelectPaper: (pub: Publication) => void;
  onOpenAddPaperModal: () => void;
  onOpenEditPaperModal: (pub: Publication) => void;
}

export const PapersView: React.FC<PapersViewProps> = ({
  onSelectPaper,
  onOpenAddPaperModal,
  onOpenEditPaperModal
}) => {
  const [dbState, setDbState] = useState<StorageState>(localDB.getState());
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'All' | 'Journal' | 'Patent' | 'Conference' | 'Bookmarked'>('All');
  const [selectedPaperForNotes, setSelectedPaperForNotes] = useState<Publication | null>(null);
  const [noteText, setNoteText] = useState('');
  const [activeCitePaper, setActiveCitePaper] = useState<Publication | null>(null);
  const [citeCopied, setCiteCopied] = useState(false);
  const [citeFormat, setCiteFormat] = useState<'BibTeX' | 'APA' | 'IEEE'>('BibTeX');

  const [requestDatasetPaper, setRequestDatasetPaper] = useState<Publication | null>(null);
  const [requestPurpose, setRequestPurpose] = useState('');
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  const { user, isAdmin } = useAuth();

  useEffect(() => {
    return localDB.subscribe(setDbState);
  }, []);

  const handleDelete = async (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete publication: "${title}"?`)) {
      await localDB.deletePublication(id);
    }
  };

  const handleSaveNote = async () => {
    if (!selectedPaperForNotes) return;
    await localDB.savePaperNote(selectedPaperForNotes.id, noteText);
    setSelectedPaperForNotes(null);
    setNoteText('');
  };

  const handleDatasetRequestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!requestDatasetPaper) return;

    localDB.submitDatasetRequest({
      paperId: requestDatasetPaper.id,
      paperTitle: requestDatasetPaper.title,
      requesterName: user?.displayName || 'Researcher',
      requesterEmail: user?.email || 'researcher@csir-immt.res.in',
      purpose: requestPurpose,
      status: 'pending'
    });

    setRequestSubmitted(true);
    setTimeout(() => {
      setRequestSubmitted(false);
      setRequestDatasetPaper(null);
      setRequestPurpose('');
    }, 1500);
  };

  const filteredPublications = dbState.publications.filter((pub) => {
    let matchesFilter = true;
    if (activeFilter === 'Bookmarked') {
      matchesFilter = !!pub.isSavedOffline;
    } else if (activeFilter !== 'All') {
      matchesFilter = pub.type === activeFilter;
    }

    const matchesQuery =
      pub.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pub.abstract.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pub.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
      pub.authors.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesQuery;
  });

  const generateCitation = (pub: Publication, format: 'BibTeX' | 'APA' | 'IEEE') => {
    const authorLast = pub.authors.split(',')[0].trim().replace(/\s+/g, '');
    const citeKey = `${authorLast.toLowerCase()}${pub.year}`;

    if (format === 'BibTeX') {
      return `@article{${citeKey},
  title={${pub.title}},
  author={${pub.authors}},
  journal={${pub.journal}},
  year={${pub.year}},
  doi={${pub.doi || 'N/A'}},
  url={${pub.url}}
}`;
    } else if (format === 'APA') {
      return `${pub.authors} (${pub.year}). ${pub.title}. ${pub.journal}. https://doi.org/${pub.doi || ''}`;
    } else {
      return `[1] ${pub.authors}, "${pub.title}," ${pub.journal}, ${pub.year}.`;
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCiteCopied(true);
    setTimeout(() => setCiteCopied(false), 2000);
  };

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-300">
      {/* Header */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#122131] border border-[#2fd9f4]/30 text-[#2fd9f4] font-mono text-xs font-semibold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#2fd9f4] animate-pulse" />
            PUBLICATIONS REPOSITORY ({dbState.publications.length} TOTAL)
          </div>

          <div className="flex items-center gap-2">
            {isAdmin ? (
              <button
                onClick={onOpenAddPaperModal}
                className="px-4 py-2 rounded-lg bg-[#ffc640] hover:bg-[#e3aa00] text-[#051424] font-mono text-xs font-bold uppercase flex items-center gap-1.5 transition-all shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>ADD NEW PUBLICATION</span>
              </button>
            ) : (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-[#122131] border border-[#273647] font-mono text-xs text-[#2fd9f4]">
                <User className="w-3.5 h-3.5" />
                <span>Researcher Access: Annotate, Bookmark & Request Data</span>
              </div>
            )}
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold font-serif text-[#d4e4fa]">
          Research <span className="text-[#ffc640]">Publications & Patents</span>
        </h1>

        <p className="text-xs sm:text-sm text-[#c6c6cd] leading-relaxed max-w-2xl font-sans">
          A comprehensive dynamic archive of peer-reviewed research and industrial patents focusing on metal additive manufacturing, thermal spray coatings, and advanced metallurgical analysis.
        </p>
      </section>

      {/* Search & Filter Sector */}
      <section className="space-y-3">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-[#c6c6cd]" />
          <input
            type="text"
            placeholder="Search SLM, DED, LSA, coatings, superalloys, authors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#122131] border border-[#273647] focus:border-[#2fd9f4] text-xs font-mono text-[#d4e4fa] placeholder-slate-400 outline-none transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
          {(['All', 'Journal', 'Patent', 'Conference', 'Bookmarked'] as const).map((type) => (
            <button
              key={type}
              onClick={() => setActiveFilter(type)}
              className={`px-4 py-2 rounded-lg border transition-all ${
                activeFilter === type
                  ? 'bg-[#2fd9f4]/20 border-[#2fd9f4] text-[#2fd9f4] font-semibold'
                  : 'bg-[#122131] border-[#273647] text-[#c6c6cd] hover:border-[#2fd9f4]/40'
              }`}
            >
              {type === 'Bookmarked' ? '★ My Saved Library' : type}
            </button>
          ))}
        </div>
      </section>

      {/* Publications List */}
      <section className="space-y-4">
        {filteredPublications.length === 0 ? (
          <div className="p-8 text-center rounded-xl bg-[#122131] border border-[#273647] text-slate-400 text-xs font-mono">
            No research papers found matching query.
          </div>
        ) : (
          filteredPublications.map((pub) => (
            <article
              key={pub.id}
              className="rounded-xl bg-[#122131] border border-[#1c2b3c] p-5 space-y-3 hover:border-[#ffc640]/40 transition-all group shadow-md"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-[#1c2b3c] text-[#ffc640] font-bold">
                    {pub.type}
                  </span>
                  <span className="text-slate-400">
                    {pub.doi || pub.patentNo || pub.confProc}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {isAdmin && (
                    <>
                      {/* Edit Button */}
                      <button
                        onClick={() => onOpenEditPaperModal(pub)}
                        className="p-1.5 rounded bg-[#1c2b3c] text-[#ffc640] hover:bg-[#273647] transition-colors"
                        title="Edit publication"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={(e) => handleDelete(e, pub.id, pub.title)}
                        className="p-1.5 rounded bg-[#1c2b3c] text-rose-400 hover:bg-rose-950/40 transition-colors"
                        title="Delete publication"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}

                  {/* Citation Count Badge */}
                  <div className="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#1c2b3c] text-[#2fd9f4] font-bold">
                    <span>{pub.citations} Citations</span>
                  </div>
                </div>
              </div>

              {/* Title and Optional Schematic Figure */}
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                {pub.coverImage && (
                  <div 
                    onClick={() => onSelectPaper(pub)}
                    className="w-full sm:w-36 h-24 rounded-lg overflow-hidden border border-[#273647] bg-[#051424] shrink-0 cursor-pointer group-hover:border-[#ffc640]/50 transition-colors relative"
                  >
                    <img
                      src={pub.coverImage}
                      alt={pub.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded bg-[#051424]/80 text-[9px] font-mono text-[#ffc640]">
                      FIGURE
                    </div>
                  </div>
                )}

                <div className="flex-1 space-y-1.5">
                  <h2
                    onClick={() => onSelectPaper(pub)}
                    className="text-lg font-bold font-serif text-[#d4e4fa] group-hover:text-[#ffc640] cursor-pointer transition-colors leading-snug"
                  >
                    {pub.title}
                  </h2>

                  <p className="text-xs text-[#2fd9f4] font-mono">
                    {pub.authors}
                  </p>

                  <p className="text-xs text-[#c6c6cd] leading-relaxed line-clamp-2">
                    {pub.abstract}
                  </p>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {pub.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded bg-[#051424] text-[11px] font-mono text-[#2fd9f4] border border-[#273647]"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* User / Peer Notes Badge if present */}
              {pub.userNotes && (
                <div className="p-2.5 rounded-lg bg-[#051424] border border-[#2fd9f4]/30 text-xs font-mono text-[#2fd9f4] space-y-1">
                  <div className="text-[10px] text-[#ffc640] font-bold uppercase flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" />
                    My Research Notes & Annotations:
                  </div>
                  <p className="text-slate-300 italic">{pub.userNotes}</p>
                </div>
              )}

              {/* Footer Actions */}
              <div className="flex flex-wrap items-center justify-between pt-3 border-t border-[#1c2b3c] text-xs font-mono gap-2">
                <span className="text-[#c6c6cd]">{pub.journal} ({pub.year})</span>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Notes / Annotation Button for Researcher */}
                  <button
                    onClick={() => {
                      setSelectedPaperForNotes(pub);
                      setNoteText(pub.userNotes || '');
                    }}
                    className="px-2.5 py-1 rounded bg-[#051424] border border-[#273647] text-[#2fd9f4] hover:border-[#2fd9f4] flex items-center gap-1 transition-all"
                    title="Add or edit researcher notes"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{pub.userNotes ? 'Edit Notes' : 'Annotate'}</span>
                  </button>

                  {/* Cite Button */}
                  <button
                    onClick={() => setActiveCitePaper(pub)}
                    className="px-2.5 py-1 rounded bg-[#051424] border border-[#273647] text-[#c6c6cd] hover:text-[#ffc640] hover:border-[#ffc640]/50 flex items-center gap-1 transition-all"
                    title="Export citation"
                  >
                    <Quote className="w-3.5 h-3.5 text-[#ffc640]" />
                    <span>Cite</span>
                  </button>

                  {/* Request Sample / Dataset Button */}
                  <button
                    onClick={() => setRequestDatasetPaper(pub)}
                    className="px-2.5 py-1 rounded bg-[#051424] border border-[#273647] text-[#c6c6cd] hover:text-[#d4e4fa] flex items-center gap-1 transition-all"
                    title="Request dataset or reprint"
                  >
                    <FileSpreadsheet className="w-3.5 h-3.5 text-[#2fd9f4]" />
                    <span className="hidden sm:inline">Data Request</span>
                  </button>

                  {/* Offline Database Save Button */}
                  <button
                    onClick={() => localDB.toggleOfflinePublication(pub.id)}
                    className={`px-2.5 py-1 rounded border flex items-center gap-1 transition-all ${
                      pub.isSavedOffline
                        ? 'bg-emerald-950/50 border-emerald-500 text-emerald-400'
                        : 'bg-[#051424] border-[#273647] text-[#c6c6cd] hover:text-[#d4e4fa]'
                    }`}
                    title="Bookmark paper to my collection"
                  >
                    <Bookmark className="w-3.5 h-3.5" />
                    <span>{pub.isSavedOffline ? 'Bookmarked' : 'Bookmark'}</span>
                  </button>

                  {/* External Link */}
                  <a
                    href={pub.url}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1 rounded bg-[#ffc640] text-[#051424] font-bold hover:bg-[#e3aa00] flex items-center gap-1 transition-all"
                  >
                    <span>View Paper</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            </article>
          ))
        )}
      </section>

      {/* Citation Generator Modal */}
      {activeCitePaper && (
        <div className="fixed inset-0 z-50 bg-[#051424]/90 backdrop-blur-md p-4 flex items-center justify-center animate-in fade-in">
          <div className="max-w-lg w-full bg-[#122131] border border-[#273647] rounded-2xl p-6 space-y-4 relative shadow-2xl font-mono text-xs">
            <button
              onClick={() => setActiveCitePaper(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-[#051424] text-slate-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 text-[#ffc640] font-bold">
              <Quote className="w-4 h-4" />
              <span>CITE THIS PUBLICATION</span>
            </div>

            <h3 className="font-serif font-bold text-sm text-[#d4e4fa]">{activeCitePaper.title}</h3>

            <div className="flex gap-2">
              {(['BibTeX', 'APA', 'IEEE'] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setCiteFormat(fmt)}
                  className={`px-3 py-1.5 rounded-lg border font-bold ${
                    citeFormat === fmt
                      ? 'bg-[#ffc640] text-[#051424] border-[#ffc640]'
                      : 'bg-[#051424] text-[#c6c6cd] border-[#273647]'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>

            <pre className="p-3 rounded-lg bg-[#051424] border border-[#273647] text-[#2fd9f4] overflow-x-auto whitespace-pre-wrap leading-relaxed select-all">
              {generateCitation(activeCitePaper, citeFormat)}
            </pre>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => copyToClipboard(generateCitation(activeCitePaper, citeFormat))}
                className="px-4 py-2 rounded-lg bg-[#2fd9f4] hover:bg-[#1ebcd4] text-[#051424] font-bold flex items-center gap-1.5"
              >
                {citeCopied ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{citeCopied ? 'COPIED TO CLIPBOARD' : 'COPY CITATION'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes / Annotation Modal */}
      {selectedPaperForNotes && (
        <div className="fixed inset-0 z-50 bg-[#051424]/90 backdrop-blur-md p-4 flex items-center justify-center animate-in fade-in">
          <div className="max-w-lg w-full bg-[#122131] border border-[#273647] rounded-2xl p-6 space-y-4 relative shadow-2xl font-mono text-xs">
            <button
              onClick={() => setSelectedPaperForNotes(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-[#051424] text-slate-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 text-[#2fd9f4] font-bold">
              <MessageSquare className="w-4 h-4" />
              <span>RESEARCHER ANNOTATION & NOTES</span>
            </div>

            <h3 className="font-serif font-bold text-sm text-[#d4e4fa]">{selectedPaperForNotes.title}</h3>

            <div>
              <label className="text-[#c6c6cd] block mb-1">Your Personal / Lab Annotation</label>
              <textarea
                rows={4}
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="e.g. Note parameter settings: 2.4 kW laser power at 15 mm/s scan speed produced optimal gamma-prime precipitate morphology..."
                className="w-full px-3 py-2 rounded-lg bg-[#051424] border border-[#273647] text-[#d4e4fa] focus:border-[#2fd9f4] outline-none leading-relaxed"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedPaperForNotes(null)}
                className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveNote}
                className="px-4 py-2 rounded-lg bg-[#2fd9f4] hover:bg-[#1ebcd4] text-[#051424] font-bold"
              >
                Save Annotation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Dataset / Raw Data Request Modal */}
      {requestDatasetPaper && (
        <div className="fixed inset-0 z-50 bg-[#051424]/90 backdrop-blur-md p-4 flex items-center justify-center animate-in fade-in">
          <div className="max-w-lg w-full bg-[#122131] border border-[#273647] rounded-2xl p-6 space-y-4 relative shadow-2xl font-mono text-xs">
            <button
              onClick={() => setRequestDatasetPaper(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-[#051424] text-slate-300 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 text-[#ffc640] font-bold">
              <FileSpreadsheet className="w-4 h-4" />
              <span>REQUEST RESEARCH DATASET / REPRINT</span>
            </div>

            <h3 className="font-serif font-bold text-sm text-[#d4e4fa]">{requestDatasetPaper.title}</h3>

            {requestSubmitted ? (
              <div className="p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-center space-y-2">
                <CheckCheck className="w-6 h-6 mx-auto text-emerald-400" />
                <div className="font-bold">Dataset Request Submitted!</div>
                <p className="text-[11px] text-emerald-400">CSIR-IMMT lab admin will review and dispatch dataset access.</p>
              </div>
            ) : (
              <form onSubmit={handleDatasetRequestSubmit} className="space-y-3">
                <div>
                  <label className="text-[#c6c6cd] block mb-1">Your Academic / Institutional Affiliation & Purpose</label>
                  <textarea
                    rows={3}
                    required
                    value={requestPurpose}
                    onChange={(e) => setRequestPurpose(e.target.value)}
                    placeholder="e.g. Academic research replication on laser additive manufacturing microstructures at IIT Kharagpur..."
                    className="w-full px-3 py-2 rounded-lg bg-[#051424] border border-[#273647] text-[#d4e4fa] focus:border-[#ffc640] outline-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setRequestDatasetPaper(null)}
                    className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-[#ffc640] hover:bg-[#e3aa00] text-[#051424] font-bold flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Request</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Statistics Footer Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 font-mono">
        <div className="p-4 rounded-xl bg-[#122131] border border-[#1c2b3c]">
          <div className="text-2xl font-bold font-serif text-[#ffc640]">
            {dbState.publications.reduce((acc, p) => acc + p.citations, 0)}
          </div>
          <div className="text-xs text-[#c6c6cd] uppercase mt-1">Total Citations</div>
        </div>
        <div className="p-4 rounded-xl bg-[#122131] border border-[#1c2b3c]">
          <div className="text-2xl font-bold font-serif text-[#2fd9f4]">
            {dbState.publications.filter((p) => p.type === 'Journal').length}
          </div>
          <div className="text-xs text-[#c6c6cd] uppercase mt-1">Journal Papers</div>
        </div>
        <div className="p-4 rounded-xl bg-[#122131] border border-[#1c2b3c]">
          <div className="text-2xl font-bold font-serif text-[#ffc640]">
            {dbState.publications.filter((p) => p.type === 'Patent').length}
          </div>
          <div className="text-xs text-[#c6c6cd] uppercase mt-1">Industrial Patents</div>
        </div>
      </section>

      <footer className="pt-6 border-t border-[#1c2b3c] text-center font-mono text-xs text-[#c6c6cd]">
        © 2025 Metallurgy & AM Research Lab | CSIR-IMMT.
      </footer>
    </div>
  );
};
