import React from 'react';
import { X, ExternalLink, Bookmark, Share2 } from 'lucide-react';
import { Publication } from '../../types';
import { localDB } from '../../lib/db';

interface PaperModalProps {
  publication: Publication | null;
  onClose: () => void;
}

export const PaperModal: React.FC<PaperModalProps> = ({ publication, onClose }) => {
  if (!publication) return null;

  return (
    <div className="fixed inset-0 z-50 bg-[#051424]/90 backdrop-blur-md p-4 flex items-center justify-center animate-in fade-in">
      <div className="max-w-2xl w-full bg-[#122131] border border-[#273647] rounded-2xl p-6 space-y-5 relative shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg bg-[#051424] text-slate-300 hover:text-white border border-[#273647]"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-2">
          <div className="flex items-center gap-2 font-mono text-xs text-[#2fd9f4]">
            <span className="px-2 py-0.5 rounded bg-[#1c2b3c] text-[#ffc640] font-bold">
              {publication.type}
            </span>
            <span>{publication.journal} ({publication.year})</span>
          </div>

          <h2 className="text-2xl font-bold font-serif text-[#d4e4fa]">
            {publication.title}
          </h2>

          <div className="text-xs font-mono text-[#ffc640]">
            Authors: {publication.authors}
          </div>
        </div>

        <div className="space-y-2 p-4 rounded-xl bg-[#051424] border border-[#273647]">
          <h3 className="text-xs font-mono text-[#2fd9f4] font-bold uppercase">Abstract</h3>
          <p className="text-xs text-[#c6c6cd] leading-relaxed">
            {publication.abstract}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 font-mono text-xs">
          {publication.tags.map((t, idx) => (
            <span key={idx} className="px-2.5 py-1 rounded bg-[#1c2b3c] text-[#2fd9f4] border border-[#273647]">
              {t}
            </span>
          ))}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-[#273647] font-mono text-xs">
          <button
            onClick={() => {
              localDB.toggleOfflinePublication(publication.id);
            }}
            className="px-4 py-2 rounded bg-[#051424] border border-[#273647] text-[#d4e4fa] hover:border-[#ffc640] flex items-center gap-1.5"
          >
            <Bookmark className="w-4 h-4 text-[#ffc640]" />
            <span>Save to Client Offline DB</span>
          </button>

          <a
            href={publication.url}
            target="_blank"
            rel="noreferrer"
            className="px-5 py-2 rounded bg-[#ffc640] text-[#051424] font-bold hover:bg-[#e3aa00] flex items-center gap-1.5"
          >
            <span>Open Publication</span>
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};
