import React, { useState, useRef } from 'react';
import { X, Save, UserCheck, Upload, Camera, Image as ImageIcon } from 'lucide-react';
import { localDB, UserProfile } from '../../lib/db';

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose }) => {
  const currentProfile = localDB.getState().profile;

  const [name, setName] = useState(currentProfile.name);
  const [title, setTitle] = useState(currentProfile.title);
  const [department, setDepartment] = useState(currentProfile.department);
  const [institution, setInstitution] = useState(currentProfile.institution);
  const [appointmentPeriod, setAppointmentPeriod] = useState(currentProfile.appointmentPeriod);
  const [bioHeadline, setBioHeadline] = useState(currentProfile.bioHeadline);
  const [bioDescription, setBioDescription] = useState(currentProfile.bioDescription);
  const [heroTagline, setHeroTagline] = useState(currentProfile.heroTagline);
  const [heroDescription, setHeroDescription] = useState(currentProfile.heroDescription);
  const [avatarUrl, setAvatarUrl] = useState(currentProfile.avatarUrl);
  const [specializations, setSpecializations] = useState(currentProfile.specializations.join(', '));
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Stats
  const [yearsExperience, setYearsExperience] = useState(currentProfile.stats.yearsExperience);
  const [affiliation, setAffiliation] = useState(currentProfile.stats.affiliation);
  const [patentsFiled, setPatentsFiled] = useState(currentProfile.stats.patentsFiled);
  const [citations, setCitations] = useState(currentProfile.stats.citations);

  if (!isOpen) return null;

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, WebP, etc.).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setAvatarUrl(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    localDB.updateProfile({
      name,
      title,
      department,
      institution,
      appointmentPeriod,
      bioHeadline,
      bioDescription,
      heroTagline,
      heroDescription,
      avatarUrl,
      specializations: specializations.split(',').map((s) => s.trim()).filter(Boolean),
      stats: {
        ...currentProfile.stats,
        yearsExperience,
        affiliation,
        patentsFiled,
        citations
      }
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#051424]/90 backdrop-blur-md p-4 flex items-center justify-center animate-in fade-in overflow-y-auto">
      <div className="max-w-2xl w-full bg-[#122131] border border-[#273647] rounded-2xl p-6 space-y-5 relative shadow-2xl my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg bg-[#051424] text-slate-300 hover:text-white border border-[#273647]"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#1c2b3c] text-[#ffc640] font-mono text-xs font-bold uppercase">
            <UserCheck className="w-3.5 h-3.5" />
            DYNAMIC PROFILE EDITOR
          </div>
          <h2 className="text-2xl font-bold font-serif text-[#d4e4fa]">Edit Researcher Profile</h2>
          <p className="text-xs text-[#c6c6cd]">
            Update scientist credentials, bio, headline taglines, statistics, and avatar photo dynamically.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 font-mono text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[#c6c6cd] block mb-1">Full Name</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#051424] border border-[#273647] text-[#d4e4fa] focus:border-[#ffc640] outline-none"
              />
            </div>

            <div>
              <label className="text-[#c6c6cd] block mb-1">Title / Role</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#051424] border border-[#273647] text-[#ffc640] focus:border-[#ffc640] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[#c6c6cd] block mb-1">Department</label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#051424] border border-[#273647] text-[#d4e4fa] focus:border-[#ffc640] outline-none"
              />
            </div>

            <div>
              <label className="text-[#c6c6cd] block mb-1">Institution</label>
              <input
                type="text"
                value={institution}
                onChange={(e) => setInstitution(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#051424] border border-[#273647] text-[#2fd9f4] focus:border-[#ffc640] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[#c6c6cd] block mb-1">Appointment Period</label>
              <input
                type="text"
                value={appointmentPeriod}
                onChange={(e) => setAppointmentPeriod(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#051424] border border-[#273647] text-[#d4e4fa] focus:border-[#ffc640] outline-none"
              />
            </div>

            <div>
              <label className="text-[#c6c6cd] block mb-1">Avatar Image (Upload or URL)</label>
              <div className="space-y-2">
                <input
                  type="text"
                  required
                  value={avatarUrl}
                  onChange={(e) => setAvatarUrl(e.target.value)}
                  placeholder="Paste image URL or upload below..."
                  className="w-full px-3 py-2 rounded-lg bg-[#051424] border border-[#273647] text-[#2fd9f4] focus:border-[#ffc640] outline-none text-[11px]"
                />
              </div>
            </div>
          </div>

          {/* Profile Photo Uploader & Live Preview */}
          <div className="p-3.5 rounded-xl bg-[#051424] border border-[#273647] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[#ffc640] font-bold text-[11px] uppercase flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5" />
                Profile Photo Upload & Preview
              </span>
              <span className="text-[10px] text-[#c6c6cd]">Supports PNG, JPG, WebP</span>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-16 h-20 rounded-lg overflow-hidden border-2 border-[#ffc640] bg-[#122131] shrink-0 relative shadow-md">
                <img
                  src={avatarUrl}
                  alt="Avatar Preview"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`flex-1 p-3 rounded-lg border-2 border-dashed transition-all flex flex-col sm:flex-row items-center justify-between gap-2 ${
                  isDragging
                    ? 'border-[#ffc640] bg-[#1a2f44]'
                    : 'border-[#273647] hover:border-[#ffc640]/50 bg-[#122131]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileInputChange}
                />
                <div className="text-center sm:text-left">
                  <div className="text-xs font-bold text-[#d4e4fa]">Choose local photo or drag here</div>
                  <div className="text-[10px] text-[#c6c6cd]">Will be immediately encoded and saved</div>
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-md bg-[#1c2b3c] hover:bg-[#273647] text-[#2fd9f4] border border-[#273647] text-xs font-bold flex items-center gap-1.5 shrink-0"
                >
                  <Upload className="w-3.5 h-3.5 text-[#ffc640]" />
                  <span>Browse Device</span>
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="text-[#c6c6cd] block mb-1">Hero Tagline</label>
            <input
              type="text"
              value={heroTagline}
              onChange={(e) => setHeroTagline(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#051424] border border-[#273647] text-[#ffc640] font-bold focus:border-[#ffc640] outline-none"
            />
          </div>

          <div>
            <label className="text-[#c6c6cd] block mb-1">Hero Description</label>
            <textarea
              rows={2}
              value={heroDescription}
              onChange={(e) => setHeroDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#051424] border border-[#273647] text-[#d4e4fa] focus:border-[#ffc640] outline-none"
            />
          </div>

          <div>
            <label className="text-[#c6c6cd] block mb-1">Bio Description</label>
            <textarea
              rows={3}
              value={bioDescription}
              onChange={(e) => setBioDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#051424] border border-[#273647] text-[#d4e4fa] focus:border-[#ffc640] outline-none"
            />
          </div>

          <div>
            <label className="text-[#c6c6cd] block mb-1">Specializations (comma separated)</label>
            <input
              type="text"
              value={specializations}
              onChange={(e) => setSpecializations(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[#051424] border border-[#273647] text-[#2fd9f4] focus:border-[#ffc640] outline-none"
            />
          </div>

          {/* Quick Stats Grid */}
          <div className="p-3 rounded-xl bg-[#051424] border border-[#273647] space-y-2">
            <h3 className="text-[#ffc640] font-bold uppercase text-[11px]">Key Metric Stats</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div>
                <label className="text-[#c6c6cd] text-[10px]">Years Exp.</label>
                <input
                  type="text"
                  value={yearsExperience}
                  onChange={(e) => setYearsExperience(e.target.value)}
                  className="w-full px-2 py-1 rounded bg-[#122131] border border-[#273647] text-[#d4e4fa]"
                />
              </div>
              <div>
                <label className="text-[#c6c6cd] text-[10px]">Affiliation</label>
                <input
                  type="text"
                  value={affiliation}
                  onChange={(e) => setAffiliation(e.target.value)}
                  className="w-full px-2 py-1 rounded bg-[#122131] border border-[#273647] text-[#d4e4fa]"
                />
              </div>
              <div>
                <label className="text-[#c6c6cd] text-[10px]">Patents Filed</label>
                <input
                  type="text"
                  value={patentsFiled}
                  onChange={(e) => setPatentsFiled(e.target.value)}
                  className="w-full px-2 py-1 rounded bg-[#122131] border border-[#273647] text-[#ffc640]"
                />
              </div>
              <div>
                <label className="text-[#c6c6cd] text-[10px]">Citations</label>
                <input
                  type="text"
                  value={citations}
                  onChange={(e) => setCitations(e.target.value)}
                  className="w-full px-2 py-1 rounded bg-[#122131] border border-[#273647] text-[#2fd9f4]"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-[#ffc640] hover:bg-[#e3aa00] text-[#051424] font-bold text-xs uppercase font-mono tracking-wider transition-all flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Profile Changes</span>
          </button>
        </form>
      </div>
    </div>
  );
};
