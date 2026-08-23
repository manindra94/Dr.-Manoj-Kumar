import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  ChevronRight,
  Award,
  Bookmark,
  ExternalLink,
  Edit3,
  Plus,
  ShieldCheck,
  Megaphone,
  Sparkles,
  Database
} from 'lucide-react';
import { localDB, StorageState } from '../../lib/db';
import { useAuth } from '../../lib/AuthContext';
import { ActiveTab } from '../../types';
import { EditHomeModal } from '../modals/EditHomeModal';

interface HomeViewProps {
  setActiveTab: (tab: ActiveTab) => void;
  onOpenContactModal: () => void;
  onOpenEditProfileModal: () => void;
  onOpenAddPaperModal: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  setActiveTab,
  onOpenContactModal,
  onOpenEditProfileModal,
  onOpenAddPaperModal
}) => {
  const [dbState, setDbState] = useState<StorageState>(localDB.getState());
  const [showEditHomeModal, setShowEditHomeModal] = useState(false);
  const { isAdmin } = useAuth();

  useEffect(() => {
    return localDB.subscribe(setDbState);
  }, []);

  const { profile, publications, technicalVerticals, homepageContent } = dbState;
  const heroTagline = homepageContent?.heroTagline || profile.heroTagline;
  const heroDescription = homepageContent?.heroDescription || profile.heroDescription;
  const announcement = homepageContent?.announcement;

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-300">
      {/* Live Announcement Banner */}
      {announcement && (
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-[#ffc640]/15 via-[#1c2b3c] to-[#2fd9f4]/15 border border-[#ffc640]/40 flex items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-2.5 text-xs font-mono text-[#d4e4fa]">
            <Megaphone className="w-4 h-4 text-[#ffc640] shrink-0 animate-bounce" />
            <span className="font-semibold">{announcement}</span>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowEditHomeModal(true)}
              className="text-[11px] font-mono text-[#ffc640] hover:underline shrink-0"
            >
              Edit Banner
            </button>
          )}
        </div>
      )}

      {/* Hero Sector */}
      <section className="relative rounded-2xl bg-gradient-to-b from-[#0d1c2d] to-[#122131] border border-[#1c2b3c] p-6 sm:p-8 overflow-hidden shadow-2xl">
        {/* Subtle grid background effect */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1c2b3c_1px,transparent_1px),linear-gradient(to_bottom,#1c2b3c_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20 pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Appointment Badge & Edit Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#1c2b3c]/80 border border-[#2fd9f4]/30 text-[#ffc640] font-mono text-xs font-semibold tracking-wider uppercase">
              <span className="w-2 h-2 rounded-full bg-[#ffc640] animate-pulse" />
              {profile.title} | {profile.institution} ({profile.appointmentPeriod})
            </div>

            {isAdmin && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowEditHomeModal(true)}
                  className="px-3 py-1.5 rounded bg-[#ffc640] hover:bg-[#e3aa00] text-[#051424] font-mono text-xs font-bold flex items-center gap-1.5 transition-colors shadow"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>MANAGE HOME CMS</span>
                </button>
                <button
                  onClick={onOpenEditProfileModal}
                  className="px-3 py-1.5 rounded bg-[#1c2b3c] hover:bg-[#273647] text-[#2fd9f4] border border-[#2fd9f4]/40 font-mono text-xs font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>PROFILE</span>
                </button>
              </div>
            )}
          </div>

          {/* Hero Grid with Photo & Narrative */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 space-y-4">
              {/* Main Display Title */}
              <h1 className="text-3xl sm:text-5xl font-bold font-serif text-[#d4e4fa] tracking-tight leading-tight">
                {heroTagline}
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base text-[#c6c6cd] leading-relaxed max-w-2xl font-sans">
                {heroDescription}
              </p>

              {/* Primary Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => setActiveTab('papers')}
                  className="px-6 py-3 rounded-lg bg-[#ffc640] hover:bg-[#e3aa00] text-[#051424] font-bold text-xs uppercase font-mono tracking-wider transition-all shadow-lg flex items-center gap-2 group"
                >
                  <span>VIEW PUBLICATIONS ({publications.length})</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={onOpenContactModal}
                  className="px-6 py-3 rounded-lg bg-[#0d1c2d] hover:bg-[#1c2b3c] text-[#2fd9f4] border border-[#2fd9f4] font-bold text-xs uppercase font-mono tracking-wider transition-all flex items-center gap-2"
                >
                  <span>COLLABORATION PORTAL</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Profile Card / Portrait */}
            <div className="lg:col-span-4 flex justify-center lg:justify-end">
              <div 
                onClick={() => setActiveTab('about')}
                className="relative group cursor-pointer p-2 rounded-2xl bg-[#122131]/90 border border-[#273647] hover:border-[#ffc640]/60 transition-all duration-300 shadow-xl max-w-[240px] w-full"
              >
                <div className="aspect-[4/5] rounded-xl overflow-hidden relative border border-[#1c2b3c]">
                  <img
                    src={profile.avatarUrl}
                    alt={profile.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#051424] via-transparent to-transparent opacity-60" />
                </div>
                <div className="pt-2 text-center">
                  <p className="font-serif font-bold text-sm text-[#d4e4fa] group-hover:text-[#ffc640] transition-colors">
                    {profile.name}
                  </p>
                  <p className="text-[10px] font-mono text-[#ffc640] tracking-wider uppercase">
                    View Academic Profile & Bio →
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Statistics Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-[#1c2b3c]">
          <div className="space-y-0.5">
            <div className="text-2xl sm:text-3xl font-serif font-bold text-[#ffc640]">{profile.stats.yearsExperience}</div>
            <div className="text-[11px] font-mono uppercase text-[#c6c6cd] tracking-wider">YEARS EXPERTISE</div>
          </div>
          <div className="space-y-0.5">
            <div className="text-2xl sm:text-3xl font-serif font-bold text-[#d4e4fa]">{profile.stats.affiliation}</div>
            <div className="text-[11px] font-mono uppercase text-[#c6c6cd] tracking-wider">AFFILIATION</div>
          </div>
          <div className="space-y-0.5">
            <div className="text-2xl sm:text-3xl font-serif font-bold text-[#ffc640]">{profile.stats.patentsFiled}</div>
            <div className="text-[11px] font-mono uppercase text-[#c6c6cd] tracking-wider">PATENTS FILED</div>
          </div>
          <div className="space-y-0.5">
            <div className="text-2xl sm:text-3xl font-serif font-bold text-[#2fd9f4]">{profile.stats.citations}</div>
            <div className="text-[11px] font-mono uppercase text-[#c6c6cd] tracking-wider">CITATIONS</div>
          </div>
        </div>
      </section>

      {/* Technical Verticals Sector */}
      <section className="space-y-5">
        <div className="flex items-end justify-between border-b border-[#1c2b3c] pb-3">
          <div>
            <h2 className="text-2xl font-bold font-serif text-[#d4e4fa]">Technical Verticals</h2>
            <p className="text-xs text-[#c6c6cd] mt-0.5">Primary focus in advanced materials and precision manufacturing domains.</p>
          </div>
          <button
            onClick={() => setActiveTab('about')}
            className="hidden sm:flex items-center gap-1 font-mono text-xs text-[#ffc640] hover:underline uppercase tracking-wider font-semibold"
          >
            <span>LAB CAPABILITIES</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {technicalVerticals.map((vertical, idx) => (
            <div
              key={idx}
              className="rounded-xl bg-[#122131] border border-[#1c2b3c] p-5 space-y-3 hover:border-[#2fd9f4]/50 transition-all group shadow-md"
            >
              <div className="text-[10px] font-mono font-semibold text-[#ffc640] uppercase tracking-widest bg-[#1c2b3c] px-2 py-0.5 rounded w-max">
                {vertical.category}
              </div>
              <h3 className="text-lg font-bold font-serif text-[#d4e4fa] group-hover:text-[#2fd9f4] transition-colors">
                {vertical.title}
              </h3>
              <p className="text-xs text-[#c6c6cd] leading-relaxed">
                {vertical.description}
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {vertical.methods.map((method, mi) => (
                  <span key={mi} className="text-[10px] font-mono bg-[#051424] text-[#2fd9f4] px-2 py-0.5 rounded border border-[#273647]">
                    {method}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Technical Proficiencies Tags */}
      <section className="rounded-xl bg-[#122131] border border-[#1c2b3c] p-5 space-y-3 shadow-md">
        <h3 className="text-base font-bold font-serif text-[#d4e4fa]">Technical Proficiencies & Specializations</h3>
        <div className="flex flex-wrap gap-2">
          {profile.specializations.map((tag, i) => (
            <span
              key={i}
              className="px-3 py-1.5 rounded-lg bg-[#1c2b3c] text-[#2fd9f4] font-mono text-xs font-medium border border-[#273647] hover:border-[#ffc640] transition-colors cursor-default"
            >
              {tag}
            </span>
          ))}
        </div>
      </section>

      {/* Selected Research Papers Sector */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#1c2b3c] pb-3">
          <div>
            <h2 className="text-2xl font-bold font-serif text-[#d4e4fa]">Selected Research Papers</h2>
            <p className="text-xs text-[#c6c6cd]">Comprehensive peer-reviewed publications and conference proceedings</p>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <button
                onClick={onOpenAddPaperModal}
                className="px-2.5 py-1 rounded bg-[#ffc640] hover:bg-[#e3aa00] text-[#051424] font-mono text-xs font-bold flex items-center gap-1 transition-colors shadow"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>ADD PAPER</span>
              </button>
            )}
            <button
              onClick={() => setActiveTab('papers')}
              className="font-mono text-xs text-[#ffc640] hover:underline flex items-center gap-1"
            >
              <span>All ({publications.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {publications.slice(0, 3).map((pub) => (
            <div
              key={pub.id}
              className="rounded-xl bg-[#122131] border border-[#1c2b3c] p-4 space-y-2 hover:border-[#ffc640]/40 transition-all shadow-md"
            >
              <div className="flex items-center justify-between gap-2 text-[11px] font-mono">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#ffc640]" />
                  <span className="text-[#ffc640] font-bold">{pub.year}</span>
                  <span className="text-[#c6c6cd]">| {pub.journal}</span>
                </div>
                <span className="text-[#2fd9f4] bg-[#1c2b3c] px-2 py-0.5 rounded">{pub.type}</span>
              </div>

              <h3 className="text-base font-bold font-serif text-[#d4e4fa] leading-snug">
                {pub.title}
              </h3>

              <p className="text-xs text-[#c6c6cd] font-mono">
                {pub.authors}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-[#1c2b3c]/60 text-xs font-mono">
                <span className="text-slate-400">Citations: {pub.citations}</span>
                <a
                  href={pub.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[#2fd9f4] hover:underline flex items-center gap-1"
                >
                  <span>View Paper</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer Credentials */}
      <footer className="pt-8 border-t border-[#1c2b3c] space-y-4 text-center font-mono text-xs text-[#c6c6cd]">
        <div className="flex flex-wrap justify-center gap-4 text-[#2fd9f4]">
          <a href={profile.links.orcid} target="_blank" rel="noreferrer" className="hover:underline">ORCID</a>
          <a href={profile.links.googleScholar} target="_blank" rel="noreferrer" className="hover:underline">Google Scholar</a>
          <a href={profile.links.researchGate} target="_blank" rel="noreferrer" className="hover:underline">ResearchGate</a>
          <a href={profile.links.csirProfile} target="_blank" rel="noreferrer" className="hover:underline">CSIR-IMMT</a>
        </div>
        <p>© 2025 {profile.name} | {profile.institution}. All Rights Reserved.</p>
      </footer>

      {/* Edit Home Modal */}
      <EditHomeModal
        isOpen={showEditHomeModal}
        onClose={() => setShowEditHomeModal(false)}
        currentState={dbState}
      />
    </div>
  );
};
