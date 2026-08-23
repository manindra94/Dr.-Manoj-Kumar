import React, { useState } from 'react';
import { X, Save, Sparkles, Layers, Check, AlertCircle } from 'lucide-react';
import { localDB, StorageState } from '../../lib/db';
import { TechnicalVertical } from '../../types';

interface EditHomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentState: StorageState;
}

export const EditHomeModal: React.FC<EditHomeModalProps> = ({
  isOpen,
  onClose,
  currentState
}) => {
  const [heroTagline, setHeroTagline] = useState(currentState.homepageContent?.heroTagline || currentState.profile.heroTagline);
  const [heroDescription, setHeroDescription] = useState(currentState.homepageContent?.heroDescription || currentState.profile.heroDescription);
  const [announcement, setAnnouncement] = useState(currentState.homepageContent?.announcement || '');
  const [yearsExp, setYearsExp] = useState(currentState.profile.stats.yearsExperience);
  const [affiliation, setAffiliation] = useState(currentState.profile.stats.affiliation);
  const [patents, setPatents] = useState(currentState.profile.stats.patentsFiled);
  const [citations, setCitations] = useState(currentState.profile.stats.citations);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await localDB.updateHomePageContent({
        heroTagline,
        heroDescription,
        announcement
      });

      await localDB.updateProfile({
        heroTagline,
        heroDescription,
        stats: {
          ...currentState.profile.stats,
          yearsExperience: yearsExp,
          affiliation,
          patentsFiled: patents,
          citations
        }
      });

      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        onClose();
      }, 700);
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#0d1c2d] border border-[#1c2b3c] shadow-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#1c2b3c] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#ffc640]/10 border border-[#ffc640]/30 flex items-center justify-center text-[#ffc640]">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-serif font-bold text-[#d4e4fa]">
                Manage Home Page (Firebase CMS)
              </h2>
              <p className="text-xs font-mono text-[#c6c6cd]">
                Update hero headlines, announcement banner, and live statistics in Firestore
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1c2b3c] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {savedSuccess && (
          <div className="p-3 rounded-lg bg-emerald-950/50 border border-emerald-500/50 text-emerald-300 text-xs font-mono flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Homepage content successfully saved and synced to Firebase!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-[#ffc640] mb-1.5 font-bold">
              LIVE ANNOUNCEMENT BANNER
            </label>
            <input
              type="text"
              value={announcement}
              onChange={(e) => setAnnouncement(e.target.value)}
              placeholder="e.g. CSIR-IMMT Advanced Materials & Laser Cladding Facility: Open for Collaborations"
              className="w-full px-4 py-2.5 rounded-lg bg-[#122131] border border-[#1c2b3c] focus:border-[#ffc640] text-sm text-[#d4e4fa] font-mono outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-[#d4e4fa] mb-1.5 font-bold">
              HERO MAIN TAGLINE / HEADLINE
            </label>
            <input
              type="text"
              required
              value={heroTagline}
              onChange={(e) => setHeroTagline(e.target.value)}
              placeholder="e.g. Advancing Metal Additive Manufacturing"
              className="w-full px-4 py-2.5 rounded-lg bg-[#122131] border border-[#1c2b3c] focus:border-[#ffc640] text-sm text-[#d4e4fa] font-serif font-bold outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-[#d4e4fa] mb-1.5 font-bold">
              HERO SUBTITLE & SCIENTIFIC SUMMARY
            </label>
            <textarea
              rows={3}
              required
              value={heroDescription}
              onChange={(e) => setHeroDescription(e.target.value)}
              className="w-full px-4 py-2.5 rounded-lg bg-[#122131] border border-[#1c2b3c] focus:border-[#ffc640] text-sm text-[#d4e4fa] font-sans outline-none leading-relaxed"
            />
          </div>

          <div className="border-t border-[#1c2b3c] pt-4 space-y-3">
            <h3 className="text-xs font-mono text-[#2fd9f4] font-bold uppercase tracking-wider">
              Homepage Fast Metrics Counters
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-[#c6c6cd] mb-1">YEARS EXP.</label>
                <input
                  type="text"
                  value={yearsExp}
                  onChange={(e) => setYearsExp(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-[#122131] border border-[#1c2b3c] text-xs font-mono text-[#ffc640] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#c6c6cd] mb-1">AFFILIATION</label>
                <input
                  type="text"
                  value={affiliation}
                  onChange={(e) => setAffiliation(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-[#122131] border border-[#1c2b3c] text-xs font-mono text-[#d4e4fa] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#c6c6cd] mb-1">PATENTS</label>
                <input
                  type="text"
                  value={patents}
                  onChange={(e) => setPatents(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-[#122131] border border-[#1c2b3c] text-xs font-mono text-[#ffc640] outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-[#c6c6cd] mb-1">CITATIONS</label>
                <input
                  type="text"
                  value={citations}
                  onChange={(e) => setCitations(e.target.value)}
                  className="w-full px-3 py-2 rounded bg-[#122131] border border-[#1c2b3c] text-xs font-mono text-[#2fd9f4] outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1c2b3c]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-lg text-slate-400 hover:text-white font-mono text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 rounded-lg bg-[#ffc640] hover:bg-[#e3aa00] text-[#051424] font-bold font-mono text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'SYNCING TO FIREBASE...' : 'SAVE & PUBLISH TO FIREBASE'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
