import React, { useState, useEffect, useRef } from 'react';
import {
  Download,
  Mail,
  Award,
  BookOpen,
  Briefcase,
  GraduationCap,
  Microscope,
  Flame,
  Search,
  Building,
  Edit3,
  Plus,
  ShieldCheck,
  Trash2,
  Sparkles,
  Upload,
  Camera,
  CheckCircle2,
  Image as ImageIcon
} from 'lucide-react';
import { localDB, StorageState } from '../../lib/db';
import { useAuth } from '../../lib/AuthContext';
import { ManageAboutModal } from '../modals/ManageAboutModal';

interface AboutViewProps {
  onOpenContactModal: () => void;
  onOpenEditProfileModal: () => void;
}

export const AboutView: React.FC<AboutViewProps> = ({ onOpenContactModal, onOpenEditProfileModal }) => {
  const [dbState, setDbState] = useState<StorageState>(localDB.getState());
  const [showManageModal, setShowManageModal] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isAdmin } = useAuth();

  useEffect(() => {
    return localDB.subscribe(setDbState);
  }, []);

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please upload a valid image file (PNG, JPG, WebP, etc.).');
      return;
    }

    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        localDB.updateProfile({ avatarUrl: result });
        setIsUploading(false);
        setUploadSuccess(true);
        setTimeout(() => setUploadSuccess(false), 3500);
      }
    };
    reader.onerror = () => {
      setIsUploading(false);
      alert('Failed to read image file. Please try again.');
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleImageFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    if (!isAdmin) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!isAdmin) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    if (!isAdmin) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleImageFile(file);
    }
  };

  const { profile, careerJourney, academicFoundation, awards } = dbState;

  const handleDownloadCV = () => {
    // Generate downloadable formatted text / curriculum vitae
    const cvText = `
CURRICULUM VITAE
${profile.name.toUpperCase()}
${profile.title}
${profile.department}
${profile.institution}

==================================================
ACADEMIC FOUNDATION:
${academicFoundation.map(a => `• ${a.period}: ${a.degree} - ${a.institution}\n  ${a.description}`).join('\n\n')}

==================================================
CAREER TRAJECTORY:
${careerJourney.map(c => `• ${c.period}: ${c.title} @ ${c.institution}\n  ${c.description}`).join('\n\n')}

==================================================
HONORS & AWARDS:
${awards.map(aw => `• ${aw.year}: ${aw.title}\n  ${aw.description}`).join('\n\n')}

==================================================
KEY RESEARCH VERTICALS & SPECIALIZATIONS:
${profile.specializations.join(', ')}

==================================================
CONTACT & LINKS:
ORCID: ${profile.links.orcid}
Google Scholar: ${profile.links.googleScholar}
ResearchGate: ${profile.links.researchGate}
CSIR-IMMT Portal: ${profile.links.csirProfile}
    `.trim();

    const blob = new Blob([cvText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CV_Dr_Manoj_Kumar_CSIR_IMMT.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDeleteCareerItem = async (index: number) => {
    if (confirm('Are you sure you want to remove this career milestone from Firebase?')) {
      await localDB.deleteCareerMilestone(index);
    }
  };

  const handleDeleteDegreeItem = async (index: number) => {
    if (confirm('Are you sure you want to remove this academic degree from Firebase?')) {
      await localDB.deleteAcademicDegree(index);
    }
  };

  const handleDeleteAwardItem = async (index: number) => {
    if (confirm('Are you sure you want to remove this award from Firebase?')) {
      await localDB.deleteAward(index);
    }
  };

  return (
    <div className="space-y-10 pb-20 animate-in fade-in duration-300">
      {/* Top Profile Header */}
      <section className="rounded-2xl bg-[#122131] border border-[#1c2b3c] p-6 space-y-5 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#1c2b3c] border border-[#2fd9f4]/30 text-[#2fd9f4] font-mono text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-[#2fd9f4] animate-pulse" />
            {profile.title} @ {profile.institution}
          </div>

          {isAdmin && (
            <div className="flex items-center gap-2">
              <button
                onClick={onOpenEditProfileModal}
                className="px-3 py-1.5 rounded bg-[#1c2b3c] hover:bg-[#273647] text-[#ffc640] border border-[#ffc640]/40 font-mono text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>EDIT PROFILE</span>
              </button>

              <button
                onClick={() => setShowManageModal(true)}
                className="px-3 py-1.5 rounded bg-[#ffc640] hover:bg-[#e3aa00] text-[#051424] font-mono text-xs font-bold flex items-center gap-1.5 transition-colors shadow"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>MANAGE MILESTONES</span>
              </button>
            </div>
          )}
        </div>

        <div>
          <h1 className="text-3xl sm:text-4xl font-bold font-serif text-[#d4e4fa]">
            {profile.name}
          </h1>
          <p className="text-sm font-mono text-[#ffc640] mt-1">
            — {profile.department}
          </p>
        </div>

        <p className="text-sm text-[#c6c6cd] leading-relaxed font-sans max-w-3xl">
          {profile.bioDescription}
        </p>

        {/* Domain Tags */}
        <div className="flex flex-wrap gap-2">
          {profile.specializations.map((spec, i) => (
            <span
              key={i}
              className="px-3 py-1 rounded-lg bg-[#051424] border border-[#273647] font-mono text-xs text-[#2fd9f4]"
            >
              {spec}
            </span>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            onClick={onOpenContactModal}
            className="flex-1 sm:flex-none px-6 py-3 rounded-lg bg-[#ffc640] hover:bg-[#e3aa00] text-[#051424] font-bold text-xs uppercase font-mono tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg"
          >
            <Mail className="w-4 h-4" />
            <span>Send Research Collaboration Inquiry</span>
          </button>

          <button
            onClick={handleDownloadCV}
            className="flex-1 sm:flex-none px-6 py-3 rounded-lg bg-[#051424] hover:bg-[#1c2b3c] text-[#d4e4fa] border border-[#273647] font-bold text-xs uppercase font-mono tracking-wider transition-all flex items-center justify-center gap-2"
          >
            <Download className="w-4 h-4 text-[#2fd9f4]" />
            <span>Download Official CV (.txt)</span>
          </button>
        </div>
      </section>

      {/* Portrait Photo & Research Expertise */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
        {/* Photo Card */}
        <div className="space-y-3">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`rounded-2xl bg-[#122131] border transition-all duration-300 p-4 overflow-hidden relative group shadow-xl ${
              isDragging
                ? 'border-[#ffc640] ring-4 ring-[#ffc640]/20 bg-[#1a2f44]'
                : 'border-[#1c2b3c] hover:border-[#273647]'
            }`}
          >
            {/* Hidden File Input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileInputChange}
            />

            <div className="aspect-[4/5] rounded-xl overflow-hidden relative border border-[#273647]">
              <img
                src={profile.avatarUrl}
                alt={profile.name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#051424] via-transparent to-transparent opacity-80" />

              {/* Admin Overlay: Drag and Drop / Quick Upload */}
              {isAdmin && (
                <div className="absolute inset-0 bg-[#051424]/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-4 text-center">
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploading}
                      className="px-4 py-2.5 rounded-lg bg-[#ffc640] hover:bg-[#e3aa00] text-[#051424] font-mono text-xs font-bold flex items-center gap-2 shadow-lg transition-transform hover:scale-105"
                    >
                      <Camera className="w-4 h-4" />
                      <span>{isUploading ? 'Uploading...' : 'Upload New Photo'}</span>
                    </button>
                    <p className="text-[11px] font-mono text-[#d4e4fa]/80">
                      or drag & drop an image here
                    </p>
                  </div>
                </div>
              )}

              {/* Dragging Active Overlay */}
              {isDragging && (
                <div className="absolute inset-0 bg-[#051424]/90 border-2 border-dashed border-[#ffc640] rounded-xl flex flex-col items-center justify-center p-4 text-center z-20">
                  <Upload className="w-8 h-8 text-[#ffc640] animate-bounce mb-2" />
                  <span className="font-mono text-xs font-bold text-[#ffc640]">
                    Drop image file to update profile portrait
                  </span>
                </div>
              )}

              {/* Bottom Caption on Portrait */}
              <div className="absolute bottom-4 left-4 right-4 text-xs font-mono text-[#d4e4fa] z-10 pointer-events-none">
                <div className="text-[#ffc640] font-bold text-sm font-serif">{profile.name}</div>
                <div className="text-[#c6c6cd]">{profile.title}, {profile.institution}</div>
              </div>
            </div>

            {/* Admin Action Bar below Photo */}
            {isAdmin && (
              <div className="mt-3 pt-3 border-t border-[#1c2b3c] flex flex-wrap items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                  className="flex-1 px-3 py-2 rounded-lg bg-[#1c2b3c] hover:bg-[#273647] text-[#2fd9f4] border border-[#273647] font-mono text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Upload className="w-3.5 h-3.5 text-[#ffc640]" />
                  <span>{isUploading ? 'Uploading...' : 'Upload Photo'}</span>
                </button>

                <button
                  type="button"
                  onClick={onOpenEditProfileModal}
                  className="px-3 py-2 rounded-lg bg-[#051424] hover:bg-[#1c2b3c] text-[#d4e4fa] border border-[#273647] font-mono text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#ffc640]" />
                  <span>Edit Profile</span>
                </button>
              </div>
            )}
          </div>

          {/* Upload Success Feedback */}
          {uploadSuccess && (
            <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-700/60 text-emerald-300 font-mono text-xs flex items-center gap-2 animate-in fade-in slide-in-from-top-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Profile image uploaded and updated successfully!</span>
            </div>
          )}
        </div>

        {/* Expertise List & Stats */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold font-serif text-[#d4e4fa]">Research Expertise</h2>

          <div className="space-y-3">
            <div className="p-3.5 rounded-xl bg-[#122131] border border-[#1c2b3c] flex items-start gap-3">
              <Flame className="w-5 h-5 text-[#ffc640] shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold font-serif text-sm text-[#d4e4fa]">Additive Manufacturing</h3>
                <p className="text-xs text-[#c6c6cd] mt-0.5 leading-relaxed">
                  In-depth study of process-structure-properties in metal AM components (DED, SLM, SLS).
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#122131] border border-[#1c2b3c] flex items-start gap-3">
              <Microscope className="w-5 h-5 text-[#2fd9f4] shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold font-serif text-sm text-[#d4e4fa]">Microstructural Analysis</h3>
                <p className="text-xs text-[#c6c6cd] mt-0.5 leading-relaxed">
                  Advanced characterization using SEM, TEM, EBSD, and XRD crystal orientation mapping.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#122131] border border-[#1c2b3c] flex items-start gap-3">
              <Flame className="w-5 h-5 text-[#ffc640] shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold font-serif text-sm text-[#d4e4fa]">Laser Processing</h3>
                <p className="text-xs text-[#c6c6cd] mt-0.5 leading-relaxed">
                  Thermal fusion dynamics and precision laser material interaction kinetics.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#122131] border border-[#1c2b3c] flex items-start gap-3">
              <Search className="w-5 h-5 text-[#2fd9f4] shrink-0 mt-0.5" />
              <div>
                <h3 className="font-bold font-serif text-sm text-[#d4e4fa]">Failure Analysis</h3>
                <p className="text-xs text-[#c6c6cd] mt-0.5 leading-relaxed">
                  Root cause analysis of structural and mechanical failures in extreme aerospace alloys.
                </p>
              </div>
            </div>
          </div>

          {/* Mini Stats */}
          <div className="grid grid-cols-2 gap-3 pt-2 font-mono">
            <div className="p-3 rounded-xl bg-[#122131] border border-[#1c2b3c] text-center">
              <div className="text-2xl font-bold text-[#ffc640]">{profile.stats.yearsExperience}</div>
              <div className="text-[10px] text-[#c6c6cd] uppercase">YEARS EXPERTISE</div>
            </div>
            <div className="p-3 rounded-xl bg-[#122131] border border-[#1c2b3c] text-center">
              <div className="text-2xl font-bold text-[#2fd9f4]">{profile.stats.citations}</div>
              <div className="text-[10px] text-[#c6c6cd] uppercase">CITATIONS</div>
            </div>
          </div>
        </div>
      </section>

      {/* Affiliations Sector */}
      <section className="rounded-2xl bg-[#122131] border border-[#1c2b3c] p-6 space-y-3 shadow-xl">
        <h2 className="text-xl font-bold font-serif text-[#d4e4fa] flex items-center gap-2">
          <Building className="w-5 h-5 text-[#ffc640]" />
          <span>Affiliations & Credentials</span>
        </h2>
        <ul className="space-y-2 text-xs font-mono text-[#c6c6cd]">
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ffc640]" />
            {profile.institution}, {profile.title}
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#2fd9f4]" />
            {profile.department}
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#ffc640]" />
            Council of Scientific & Industrial Research (CSIR) Senior Scientist
          </li>
        </ul>
      </section>

      {/* Career Journey Timeline */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#1c2b3c] pb-3">
          <div>
            <h2 className="text-2xl font-bold font-serif text-[#d4e4fa]">Career Journey</h2>
            <p className="text-xs text-[#c6c6cd]">Professional trajectory from research fellow to leading scientific research at CSIR.</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowManageModal(true)}
              className="px-2.5 py-1 rounded bg-[#ffc640] hover:bg-[#e3aa00] text-[#051424] font-mono text-xs font-bold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>MANAGE</span>
            </button>
          )}
        </div>

        <div className="relative pl-6 border-l-2 border-[#1c2b3c] space-y-6">
          {careerJourney.map((item, idx) => (
            <div key={idx} className="relative group">
              <div className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-2 ${
                item.isCurrent ? 'bg-[#ffc640] border-[#051424]' : 'bg-[#051424] border-[#273647]'
              }`} />
              <div className="p-4 rounded-xl bg-[#122131] border border-[#1c2b3c] space-y-1 relative">
                {isAdmin && (
                  <button
                    onClick={() => handleDeleteCareerItem(idx)}
                    className="absolute top-3 right-3 p-1.5 rounded bg-red-950/30 text-red-400 hover:bg-red-950/60 transition-colors"
                    title="Delete milestone from Firebase"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <div className="text-[11px] font-mono text-[#2fd9f4] font-semibold">{item.period}</div>
                <h3 className="font-bold font-serif text-base text-[#d4e4fa]">{item.title}</h3>
                <div className="text-xs font-mono text-[#ffc640]">{item.institution}</div>
                <p className="text-xs text-[#c6c6cd] mt-1 leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Academic Foundation */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#1c2b3c] pb-3">
          <div>
            <h2 className="text-2xl font-bold font-serif text-[#d4e4fa]">Academic Foundation</h2>
            <p className="text-xs text-[#c6c6cd]">Higher education, doctorates, and specialized research degrees.</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowManageModal(true)}
              className="px-2.5 py-1 rounded bg-[#ffc640] hover:bg-[#e3aa00] text-[#051424] font-mono text-xs font-bold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>MANAGE</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {academicFoundation.map((degree, i) => (
            <div key={i} className="p-5 rounded-xl bg-[#122131] border border-[#1c2b3c] space-y-2 relative">
              {isAdmin && (
                <button
                  onClick={() => handleDeleteDegreeItem(i)}
                  className="absolute top-3 right-3 p-1.5 rounded bg-red-950/30 text-red-400 hover:bg-red-950/60 transition-colors"
                  title="Delete academic degree from Firebase"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              <GraduationCap className="w-6 h-6 text-[#ffc640]" />
              <div className="text-xs font-mono text-[#2fd9f4]">{degree.period}</div>
              <h3 className="font-bold font-serif text-lg text-[#d4e4fa]">{degree.degree}</h3>
              <p className="text-xs font-mono text-[#ffc640]">{degree.institution}</p>
              <p className="text-xs text-[#c6c6cd] leading-relaxed">{degree.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Awards & Fellowships */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-[#1c2b3c] pb-3">
          <div>
            <h2 className="text-2xl font-bold font-serif text-[#d4e4fa]">Awards & Fellowships</h2>
            <p className="text-xs text-[#c6c6cd]">National scientific honors and international research fellowships.</p>
          </div>
          {isAdmin && (
            <button
              onClick={() => setShowManageModal(true)}
              className="px-2.5 py-1 rounded bg-[#ffc640] hover:bg-[#e3aa00] text-[#051424] font-mono text-xs font-bold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>MANAGE</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {awards.map((award, i) => (
            <div key={i} className="p-4 rounded-xl bg-[#122131] border border-[#1c2b3c] space-y-2 relative">
              {isAdmin && (
                <button
                  onClick={() => handleDeleteAwardItem(i)}
                  className="absolute top-3 right-3 p-1.5 rounded bg-red-950/30 text-red-400 hover:bg-red-950/60 transition-colors"
                  title="Delete award from Firebase"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
              <div className="flex items-center justify-between">
                <Award className="w-5 h-5 text-[#ffc640]" />
                <span className="px-2 py-0.5 rounded bg-[#1c2b3c] text-[#2fd9f4] font-mono text-xs font-bold">{award.year}</span>
              </div>
              <h3 className="font-bold font-serif text-base text-[#d4e4fa]">{award.title}</h3>
              <p className="text-xs text-[#c6c6cd] leading-relaxed">{award.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Manage About Modal */}
      <ManageAboutModal
        isOpen={showManageModal}
        onClose={() => setShowManageModal(false)}
        currentState={dbState}
      />
    </div>
  );
};
