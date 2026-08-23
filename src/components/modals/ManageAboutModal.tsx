import React, { useState } from 'react';
import { X, Plus, Trash2, Save, GraduationCap, Briefcase, Award, Check } from 'lucide-react';
import { localDB, StorageState } from '../../lib/db';
import { CareerMilestone, AcademicDegree, AwardItem } from '../../types';

interface ManageAboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentState: StorageState;
}

export const ManageAboutModal: React.FC<ManageAboutModalProps> = ({
  isOpen,
  onClose,
  currentState
}) => {
  const [activeTab, setActiveTab] = useState<'career' | 'academic' | 'awards'>('career');

  // Career state
  const [career, setCareer] = useState<CareerMilestone[]>(currentState.careerJourney || []);
  const [newCareer, setNewCareer] = useState<CareerMilestone>({
    period: '',
    title: '',
    institution: '',
    description: '',
    isCurrent: false
  });

  // Academic state
  const [academic, setAcademic] = useState<AcademicDegree[]>(currentState.academicFoundation || []);
  const [newDegree, setNewDegree] = useState<AcademicDegree>({
    period: '',
    degree: '',
    institution: '',
    field: '',
    description: ''
  });

  // Awards state
  const [awards, setAwards] = useState<AwardItem[]>(currentState.awards || []);
  const [newAward, setNewAward] = useState<AwardItem>({
    year: '',
    title: '',
    description: ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleAddCareer = () => {
    if (!newCareer.title || !newCareer.institution) return;
    setCareer([newCareer, ...career]);
    setNewCareer({ period: '', title: '', institution: '', description: '', isCurrent: false });
  };

  const handleDeleteCareer = (index: number) => {
    setCareer(career.filter((_, i) => i !== index));
  };

  const handleAddDegree = () => {
    if (!newDegree.degree || !newDegree.institution) return;
    setAcademic([newDegree, ...academic]);
    setNewDegree({ period: '', degree: '', institution: '', field: '', description: '' });
  };

  const handleDeleteDegree = (index: number) => {
    setAcademic(academic.filter((_, i) => i !== index));
  };

  const handleAddAward = () => {
    if (!newAward.title || !newAward.year) return;
    setAwards([newAward, ...awards]);
    setNewAward({ year: '', title: '', description: '' });
  };

  const handleDeleteAward = (index: number) => {
    setAwards(awards.filter((_, i) => i !== index));
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      if (activeTab === 'career') {
        await localDB.saveCareerMilestones(career);
      } else if (activeTab === 'academic') {
        await localDB.saveAcademicFoundation(academic);
      } else {
        await localDB.saveAwards(awards);
      }
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 700);
    } catch (err) {
      console.error('Error saving about data to Firebase:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl rounded-2xl bg-[#0d1c2d] border border-[#1c2b3c] shadow-2xl p-6 space-y-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-[#1c2b3c] pb-4">
          <div>
            <h2 className="text-lg font-serif font-bold text-[#d4e4fa]">
              Manage About Section (Firebase CMS)
            </h2>
            <p className="text-xs font-mono text-[#c6c6cd]">
              Update Career Milestones, Academic Foundation & Awards
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1c2b3c] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section Tabs */}
        <div className="flex rounded-xl bg-[#122131] p-1 border border-[#1c2b3c]">
          <button
            onClick={() => setActiveTab('career')}
            className={`flex-1 py-2 rounded-lg font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'career' ? 'bg-[#ffc640] text-[#051424] shadow' : 'text-[#c6c6cd] hover:text-white'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span>Career Milestones ({career.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('academic')}
            className={`flex-1 py-2 rounded-lg font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'academic' ? 'bg-[#ffc640] text-[#051424] shadow' : 'text-[#c6c6cd] hover:text-white'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Academic ({academic.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('awards')}
            className={`flex-1 py-2 rounded-lg font-mono text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              activeTab === 'awards' ? 'bg-[#ffc640] text-[#051424] shadow' : 'text-[#c6c6cd] hover:text-white'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Awards ({awards.length})</span>
          </button>
        </div>

        {success && (
          <div className="p-3 rounded-lg bg-emerald-950/50 border border-emerald-500/50 text-emerald-300 text-xs font-mono flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Updated successfully and synced to Firebase Firestore!</span>
          </div>
        )}

        {/* Tab 1: Career Milestones */}
        {activeTab === 'career' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#122131] border border-[#1c2b3c] space-y-3 font-mono text-xs">
              <div className="text-xs font-bold text-[#ffc640] uppercase">+ Add New Career Milestone</div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Period (e.g. 2025 — PRESENT)"
                  value={newCareer.period}
                  onChange={(e) => setNewCareer({ ...newCareer, period: e.target.value })}
                  className="px-3 py-2 rounded bg-[#051424] border border-[#1c2b3c] text-[#d4e4fa] outline-none"
                />
                <input
                  type="text"
                  placeholder="Job Title (e.g. Senior Scientist)"
                  value={newCareer.title}
                  onChange={(e) => setNewCareer({ ...newCareer, title: e.target.value })}
                  className="px-3 py-2 rounded bg-[#051424] border border-[#1c2b3c] text-[#d4e4fa] outline-none"
                />
              </div>
              <input
                type="text"
                placeholder="Institution (e.g. CSIR-IMMT)"
                value={newCareer.institution}
                onChange={(e) => setNewCareer({ ...newCareer, institution: e.target.value })}
                className="w-full px-3 py-2 rounded bg-[#051424] border border-[#1c2b3c] text-[#d4e4fa] outline-none"
              />
              <textarea
                rows={2}
                placeholder="Description & Responsibilities"
                value={newCareer.description}
                onChange={(e) => setNewCareer({ ...newCareer, description: e.target.value })}
                className="w-full px-3 py-2 rounded bg-[#051424] border border-[#1c2b3c] text-[#d4e4fa] outline-none"
              />
              <button
                type="button"
                onClick={handleAddCareer}
                className="px-4 py-2 rounded bg-[#2fd9f4] hover:bg-[#20b8cf] text-[#051424] font-bold text-xs font-mono flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Milestone</span>
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {career.map((item, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-[#122131] border border-[#1c2b3c] flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-[#d4e4fa] font-serif">{item.title} — {item.institution}</div>
                    <div className="text-[11px] font-mono text-[#2fd9f4]">{item.period}</div>
                    <div className="text-xs text-[#c6c6cd] mt-0.5 line-clamp-1">{item.description}</div>
                  </div>
                  <button
                    onClick={() => handleDeleteCareer(idx)}
                    className="p-1.5 rounded text-red-400 hover:bg-red-950/40 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Academic Degrees */}
        {activeTab === 'academic' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#122131] border border-[#1c2b3c] space-y-3 font-mono text-xs">
              <div className="text-xs font-bold text-[#ffc640] uppercase">+ Add New Academic Degree</div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Period (e.g. 2016 — 2021)"
                  value={newDegree.period}
                  onChange={(e) => setNewDegree({ ...newDegree, period: e.target.value })}
                  className="px-3 py-2 rounded bg-[#051424] border border-[#1c2b3c] text-[#d4e4fa] outline-none"
                />
                <input
                  type="text"
                  placeholder="Degree (e.g. Ph.D. in Metallurgy)"
                  value={newDegree.degree}
                  onChange={(e) => setNewDegree({ ...newDegree, degree: e.target.value })}
                  className="px-3 py-2 rounded bg-[#051424] border border-[#1c2b3c] text-[#d4e4fa] outline-none"
                />
              </div>
              <input
                type="text"
                placeholder="Institution (e.g. IIT Kharagpur)"
                value={newDegree.institution}
                onChange={(e) => setNewDegree({ ...newDegree, institution: e.target.value })}
                className="w-full px-3 py-2 rounded bg-[#051424] border border-[#1c2b3c] text-[#d4e4fa] outline-none"
              />
              <textarea
                rows={2}
                placeholder="Field & Research Description"
                value={newDegree.description}
                onChange={(e) => setNewDegree({ ...newDegree, description: e.target.value })}
                className="w-full px-3 py-2 rounded bg-[#051424] border border-[#1c2b3c] text-[#d4e4fa] outline-none"
              />
              <button
                type="button"
                onClick={handleAddDegree}
                className="px-4 py-2 rounded bg-[#2fd9f4] hover:bg-[#20b8cf] text-[#051424] font-bold text-xs font-mono flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Degree</span>
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {academic.map((item, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-[#122131] border border-[#1c2b3c] flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-[#d4e4fa] font-serif">{item.degree} — {item.institution}</div>
                    <div className="text-[11px] font-mono text-[#2fd9f4]">{item.period}</div>
                    <div className="text-xs text-[#c6c6cd] mt-0.5 line-clamp-1">{item.description}</div>
                  </div>
                  <button
                    onClick={() => handleDeleteDegree(idx)}
                    className="p-1.5 rounded text-red-400 hover:bg-red-950/40 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Awards */}
        {activeTab === 'awards' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-[#122131] border border-[#1c2b3c] space-y-3 font-mono text-xs">
              <div className="text-xs font-bold text-[#ffc640] uppercase">+ Add New Award / Honor</div>
              <div className="grid grid-cols-3 gap-3">
                <input
                  type="text"
                  placeholder="Year (e.g. 2023)"
                  value={newAward.year}
                  onChange={(e) => setNewAward({ ...newAward, year: e.target.value })}
                  className="px-3 py-2 rounded bg-[#051424] border border-[#1c2b3c] text-[#d4e4fa] outline-none"
                />
                <input
                  type="text"
                  placeholder="Award Title"
                  value={newAward.title}
                  onChange={(e) => setNewAward({ ...newAward, title: e.target.value })}
                  className="col-span-2 px-3 py-2 rounded bg-[#051424] border border-[#1c2b3c] text-[#d4e4fa] outline-none"
                />
              </div>
              <textarea
                rows={2}
                placeholder="Description / Awarding Organization"
                value={newAward.description}
                onChange={(e) => setNewAward({ ...newAward, description: e.target.value })}
                className="w-full px-3 py-2 rounded bg-[#051424] border border-[#1c2b3c] text-[#d4e4fa] outline-none"
              />
              <button
                type="button"
                onClick={handleAddAward}
                className="px-4 py-2 rounded bg-[#2fd9f4] hover:bg-[#20b8cf] text-[#051424] font-bold text-xs font-mono flex items-center gap-1.5"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Award</span>
              </button>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {awards.map((item, idx) => (
                <div key={idx} className="p-3 rounded-lg bg-[#122131] border border-[#1c2b3c] flex items-center justify-between gap-3">
                  <div>
                    <div className="text-xs font-bold text-[#d4e4fa] font-serif">{item.title} ({item.year})</div>
                    <div className="text-xs text-[#c6c6cd] mt-0.5 line-clamp-1">{item.description}</div>
                  </div>
                  <button
                    onClick={() => handleDeleteAward(idx)}
                    className="p-1.5 rounded text-red-400 hover:bg-red-950/40 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#1c2b3c]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-slate-400 hover:text-white font-mono text-xs"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handleSaveAll}
            disabled={isSaving}
            className="px-6 py-2.5 rounded-lg bg-[#ffc640] hover:bg-[#e3aa00] text-[#051424] font-bold font-mono text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'SYNCING TO FIREBASE...' : 'SAVE & SYNC TO FIREBASE'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
