import React, { useState, useRef } from 'react';
import {
  X,
  Send,
  FileText,
  BookOpen,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Upload,
  RefreshCw,
  Sparkles,
  Database,
  Layers,
  FlaskConical,
  Microscope,
  Info
} from 'lucide-react';
import { useAuth } from '../../lib/AuthContext';
import { localDB } from '../../lib/db';
import { supabaseService } from '../../lib/supabaseService';

interface ResearcherSubmissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialType?: 'publication' | 'blog' | 'gallery' | 'collaboration' | 'dataset_request';
}

export const ResearcherSubmissionModal: React.FC<ResearcherSubmissionModalProps> = ({
  isOpen,
  onClose,
  initialType = 'publication'
}) => {
  const { user } = useAuth();

  const [submissionType, setSubmissionType] = useState<
    'publication' | 'blog' | 'gallery' | 'collaboration' | 'dataset_request'
  >(initialType);

  // Common Researcher Details
  const [researcherName, setResearcherName] = useState(user?.displayName || '');
  const [researcherEmail, setResearcherEmail] = useState(user?.email || '');
  const [affiliation, setAffiliation] = useState(user?.affiliation || 'CSIR-IMMT / Research Institute');

  // Publication specific fields
  const [paperTitle, setPaperTitle] = useState('');
  const [paperType, setPaperType] = useState<'Journal' | 'Patent' | 'Conference'>('Journal');
  const [paperYear, setPaperYear] = useState<number>(new Date().getFullYear());
  const [paperAuthors, setPaperAuthors] = useState('');
  const [paperJournal, setPaperJournal] = useState('');
  const [paperDoi, setPaperDoi] = useState('');
  const [paperAbstract, setPaperAbstract] = useState('');
  const [paperTags, setPaperTags] = useState('Additive Manufacturing, Superalloys');
  const [paperCoverImage, setPaperCoverImage] = useState('');

  // Blog post specific fields
  const [blogTitle, setBlogTitle] = useState('');
  const [blogCategory, setBlogCategory] = useState('Lab Notes & Dispatches');
  const [blogReadTime, setBlogReadTime] = useState('4 min read');
  const [blogAbstract, setBlogAbstract] = useState('');
  const [blogContent, setBlogContent] = useState('');
  const [blogTags, setBlogTags] = useState('Research, Metallurgy, Materials');

  // Gallery item specific fields
  const [galleryTitle, setGalleryTitle] = useState('');
  const [galleryTechnique, setGalleryTechnique] = useState('Scanning Electron Microscopy (SEM)');
  const [gallerySample, setGallerySample] = useState('');
  const [galleryMagnification, setGalleryMagnification] = useState('5000x / 20 μm');
  const [galleryCaption, setGalleryCaption] = useState('');
  const [galleryImageUrl, setGalleryImageUrl] = useState('');

  // Collaboration / Proposal specific fields
  const [proposalTitle, setProposalTitle] = useState('');
  const [proposalVertical, setProposalVertical] = useState('Advanced Metallurgical Processing');
  const [proposalObjectives, setProposalObjectives] = useState('');
  const [proposalFunding, setProposalFunding] = useState('CSIR / DST / Industry Sponsored');

  // Status state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionSuccessId, setSubmissionSuccessId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file (PNG, JPG, WebP).');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        if (submissionType === 'publication') {
          setPaperCoverImage(result);
        } else if (submissionType === 'gallery') {
          setGalleryImageUrl(result);
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      if (!researcherName.trim() || !researcherEmail.trim()) {
        throw new Error('Please specify your name and researcher email address.');
      }

      let payload: any = {};
      let title = '';
      let description = '';

      if (submissionType === 'publication') {
        if (!paperTitle.trim() || !paperAuthors.trim() || !paperJournal.trim()) {
          throw new Error('Please fill in the paper title, authors, and journal/conference venue.');
        }
        title = paperTitle.trim();
        description = paperAbstract.trim();
        payload = {
          type: paperType,
          year: paperYear,
          authors: paperAuthors.trim(),
          journal: paperJournal.trim(),
          doi: paperDoi.trim(),
          abstract: paperAbstract.trim(),
          tags: paperTags.split(',').map((t) => t.trim()).filter(Boolean),
          coverImage: paperCoverImage || undefined
        };
      } else if (submissionType === 'blog') {
        if (!blogTitle.trim() || !blogContent.trim()) {
          throw new Error('Please fill in the blog title and article content.');
        }
        title = blogTitle.trim();
        description = blogAbstract.trim() || blogContent.slice(0, 150);
        payload = {
          category: blogCategory,
          readTime: blogReadTime,
          abstract: blogAbstract.trim(),
          content: blogContent.trim(),
          tags: blogTags.split(',').map((t) => t.trim()).filter(Boolean)
        };
      } else if (submissionType === 'gallery') {
        if (!galleryTitle.trim() || (!galleryImageUrl && !galleryCaption.trim())) {
          throw new Error('Please provide the micrograph title and upload an image or description.');
        }
        title = galleryTitle.trim();
        description = galleryCaption.trim();
        payload = {
          technique: galleryTechnique,
          sampleType: gallerySample.trim(),
          magnification: galleryMagnification.trim(),
          caption: galleryCaption.trim(),
          imageUrl: galleryImageUrl || 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=800'
        };
      } else {
        if (!proposalTitle.trim() || !proposalObjectives.trim()) {
          throw new Error('Please provide the proposal title and project objectives.');
        }
        title = proposalTitle.trim();
        description = proposalObjectives.trim();
        payload = {
          vertical: proposalVertical,
          funding: proposalFunding,
          objectives: proposalObjectives.trim()
        };
      }

      // 1. Submit to Supabase Database
      const supabaseRes = await supabaseService.submitResearcherForm({
        researcher_name: researcherName.trim(),
        researcher_email: researcherEmail.trim(),
        affiliation: affiliation.trim(),
        submission_type: submissionType,
        title,
        description,
        category: submissionType === 'blog' ? blogCategory : (submissionType === 'gallery' ? galleryTechnique : undefined),
        raw_payload: payload
      });

      // 2. Also register in local telemetry & message queue so admin gets notified
      await localDB.saveContactMessage({
        name: researcherName.trim(),
        email: researcherEmail.trim(),
        subject: `[Researcher Submission: ${submissionType.toUpperCase()}] ${title}`,
        message: `Submitted by: ${researcherName} (${affiliation})\nEmail: ${researcherEmail}\nSubmission Type: ${submissionType}\nTitle: ${title}\n\nSummary:\n${description}\n\nTracking ID: ${supabaseRes.id}`,
        senderRole: `Researcher (${affiliation})`
      });

      localDB.addTelemetry(
        `New researcher form submitted [${submissionType}] by ${researcherName} (Supabase ID: ${supabaseRes.id})`,
        'sync',
        'success'
      );

      setIsSubmitting(false);
      setSubmissionSuccessId(supabaseRes.id);
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMessage(err.message || 'Failed to submit form to database.');
    }
  };

  const handleReset = () => {
    setSubmissionSuccessId(null);
    setPaperTitle('');
    setPaperAbstract('');
    setBlogTitle('');
    setBlogContent('');
    setGalleryTitle('');
    setGalleryCaption('');
    setGalleryImageUrl('');
    setProposalTitle('');
    setProposalObjectives('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#051424]/90 backdrop-blur-md p-3 sm:p-4 flex items-center justify-center animate-in fade-in overflow-y-auto">
      <div className="max-w-3xl w-full bg-[#0d1c2d] border border-[#273647] rounded-3xl p-5 sm:p-7 space-y-6 relative shadow-2xl my-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-[#051424] text-slate-400 hover:text-white border border-[#273647] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Title */}
        <div className="space-y-1.5 pr-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#2fd9f4]/15 border border-[#2fd9f4]/30 text-[#2fd9f4] font-mono text-xs font-bold uppercase tracking-wider">
            <Database className="w-3.5 h-3.5" />
            <span>Supabase Researcher Submission Portal</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-serif text-[#d4e4fa]">
            Submit Research Data, Papers & Lab Notes
          </h2>
          <p className="text-xs text-slate-400 font-sans">
            Connected to Supabase Project <code className="text-[#ffc640] font-mono font-bold">gfystmvjhngmxiqgbddw</code>. Submissions are synced to the laboratory repository and reviewed by the CSIR-IMMT Admin.
          </p>
        </div>

        {submissionSuccessId ? (
          /* SUCCESS CONFIRMATION SCREEN */
          <div className="p-8 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-center space-y-4 animate-in fade-in">
            <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto animate-bounce" />
            <h3 className="font-serif font-bold text-xl text-emerald-200">
              Form Submitted to Supabase Database!
            </h3>
            <p className="text-xs font-mono text-emerald-300 max-w-lg mx-auto leading-relaxed">
              Your submission has been securely written to the Supabase database (<code className="text-[#ffc640]">researcher_submissions</code> table) and logged in the Administrator review queue.
            </p>
            <div className="inline-block px-4 py-2 rounded-xl bg-[#051424] border border-emerald-500/40 text-xs font-mono text-[#d4e4fa]">
              Tracking Reference: <span className="font-bold text-[#ffc640]">{submissionSuccessId}</span>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleReset}
                className="px-4 py-2 rounded-xl bg-emerald-800/60 hover:bg-emerald-700 text-emerald-100 font-mono text-xs font-bold transition-all"
              >
                Submit Another Form
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-[#122131] hover:bg-[#1c2b3c] text-slate-300 font-mono text-xs font-bold transition-all"
              >
                Close Portal
              </button>
            </div>
          </div>
        ) : (
          /* INTERACTIVE SUBMISSION FORM */
          <form onSubmit={handleSubmit} className="space-y-5 font-mono text-xs">
            
            {/* Form Type Selector Pills */}
            <div className="space-y-1.5">
              <label className="text-[#c6c6cd] block text-[11px] font-bold uppercase tracking-wider">
                Select Submission Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => setSubmissionType('publication')}
                  className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                    submissionType === 'publication'
                      ? 'bg-[#ffc640]/20 border-[#ffc640] text-[#ffc640] shadow-md'
                      : 'bg-[#122131] border-[#273647] text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  <span className="font-bold text-xs">Research Paper</span>
                  <span className="text-[10px] opacity-75 font-sans">Manuscript & DOI</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSubmissionType('blog')}
                  className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                    submissionType === 'blog'
                      ? 'bg-[#2fd9f4]/20 border-[#2fd9f4] text-[#2fd9f4] shadow-md'
                      : 'bg-[#122131] border-[#273647] text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span className="font-bold text-xs">Lab Dispatch</span>
                  <span className="text-[10px] opacity-75 font-sans">Blog & Findings</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSubmissionType('gallery')}
                  className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                    submissionType === 'gallery'
                      ? 'bg-purple-500/20 border-purple-400 text-purple-300 shadow-md'
                      : 'bg-[#122131] border-[#273647] text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <Microscope className="w-4 h-4" />
                  <span className="font-bold text-xs">Microscopy Image</span>
                  <span className="text-[10px] opacity-75 font-sans">SEM / TEM / XRD</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSubmissionType('collaboration')}
                  className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                    submissionType === 'collaboration'
                      ? 'bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-md'
                      : 'bg-[#122131] border-[#273647] text-slate-300 hover:border-slate-500'
                  }`}
                >
                  <FlaskConical className="w-4 h-4" />
                  <span className="font-bold text-xs">R&D Proposal</span>
                  <span className="text-[10px] opacity-75 font-sans">Joint Collaboration</span>
                </button>
              </div>
            </div>

            {/* Researcher Info Row */}
            <div className="p-3.5 rounded-2xl bg-[#122131] border border-[#273647] space-y-3">
              <div className="text-[11px] font-bold text-[#d4e4fa] uppercase flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5 text-[#ffc640]" />
                <span>Researcher Identification</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-[#c6c6cd] block mb-1">
                    Your Name <span className="text-[#ffc640]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={researcherName}
                    onChange={(e) => setResearcherName(e.target.value)}
                    placeholder="e.g. Dr. A. Sharma"
                    className="w-full px-3 py-2 rounded-lg bg-[#071727] border border-[#1c2b3c] focus:border-[#2fd9f4] text-[#d4e4fa] outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="text-[#c6c6cd] block mb-1">
                    Email Address <span className="text-[#ffc640]">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={researcherEmail}
                    onChange={(e) => setResearcherEmail(e.target.value)}
                    placeholder="e.g. a.sharma@immt.res.in"
                    className="w-full px-3 py-2 rounded-lg bg-[#071727] border border-[#1c2b3c] focus:border-[#2fd9f4] text-[#d4e4fa] outline-none text-xs"
                  />
                </div>
                <div>
                  <label className="text-[#c6c6cd] block mb-1">
                    Affiliation / Institute
                  </label>
                  <input
                    type="text"
                    value={affiliation}
                    onChange={(e) => setAffiliation(e.target.value)}
                    placeholder="e.g. CSIR-IMMT / IIT Madras"
                    className="w-full px-3 py-2 rounded-lg bg-[#071727] border border-[#1c2b3c] focus:border-[#2fd9f4] text-[#d4e4fa] outline-none text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="p-3 rounded-xl bg-red-950/60 border border-red-500/50 text-red-200 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* ========================================================= */}
            {/* DYNAMIC FIELDS: PUBLICATION */}
            {/* ========================================================= */}
            {submissionType === 'publication' && (
              <div className="space-y-3 p-4 rounded-2xl bg-[#071727] border border-[#1c2b3c]">
                <div>
                  <label className="text-[#c6c6cd] block mb-1 font-semibold">
                    Manuscript / Paper Title <span className="text-[#ffc640]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={paperTitle}
                    onChange={(e) => setPaperTitle(e.target.value)}
                    placeholder="e.g. Microstructural Characterization & Corrosion Kinetics in Laser Cladded Alloys"
                    className="w-full px-3 py-2 rounded-lg bg-[#122131] border border-[#273647] text-[#d4e4fa] focus:border-[#ffc640] outline-none text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[#c6c6cd] block mb-1">Publication Type</label>
                    <select
                      value={paperType}
                      onChange={(e) => setPaperType(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-lg bg-[#122131] border border-[#273647] text-[#ffc640] font-bold focus:border-[#ffc640] outline-none text-xs"
                    >
                      <option value="Journal">Journal Article (SCI / Scopus)</option>
                      <option value="Patent">Patent / Intellectual Property</option>
                      <option value="Conference">International Conference Paper</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[#c6c6cd] block mb-1">Publication Year</label>
                    <input
                      type="number"
                      value={paperYear}
                      onChange={(e) => setPaperYear(Number(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg bg-[#122131] border border-[#273647] text-[#d4e4fa] focus:border-[#ffc640] outline-none text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[#c6c6cd] block mb-1">DOI / Patent Number</label>
                    <input
                      type="text"
                      value={paperDoi}
                      onChange={(e) => setPaperDoi(e.target.value)}
                      placeholder="10.1016/j.actamat.2025.110293"
                      className="w-full px-3 py-2 rounded-lg bg-[#122131] border border-[#273647] text-[#d4e4fa] focus:border-[#ffc640] outline-none text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[#c6c6cd] block mb-1 font-semibold">
                      Authors List <span className="text-[#ffc640]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={paperAuthors}
                      onChange={(e) => setPaperAuthors(e.target.value)}
                      placeholder="e.g. Sharma, A., Kumar, M., Mohanty, S."
                      className="w-full px-3 py-2 rounded-lg bg-[#122131] border border-[#273647] text-[#d4e4fa] focus:border-[#ffc640] outline-none text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[#c6c6cd] block mb-1 font-semibold">
                      Target Journal / Conference <span className="text-[#ffc640]">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={paperJournal}
                      onChange={(e) => setPaperJournal(e.target.value)}
                      placeholder="e.g. Journal of Alloys and Compounds (Elsevier)"
                      className="w-full px-3 py-2 rounded-lg bg-[#122131] border border-[#273647] text-[#d4e4fa] focus:border-[#ffc640] outline-none text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[#c6c6cd] block mb-1">Scientific Abstract</label>
                  <textarea
                    rows={3}
                    value={paperAbstract}
                    onChange={(e) => setPaperAbstract(e.target.value)}
                    placeholder="Key metallurgical findings, experimental methodology, XRD/SEM observations..."
                    className="w-full px-3 py-2 rounded-lg bg-[#122131] border border-[#273647] text-[#d4e4fa] focus:border-[#ffc640] outline-none text-xs leading-relaxed resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-center">
                  <div>
                    <label className="text-[#c6c6cd] block mb-1">Keywords / Subject Tags</label>
                    <input
                      type="text"
                      value={paperTags}
                      onChange={(e) => setPaperTags(e.target.value)}
                      placeholder="Laser Cladding, Superalloys, Microhardness"
                      className="w-full px-3 py-2 rounded-lg bg-[#122131] border border-[#273647] text-[#d4e4fa] focus:border-[#ffc640] outline-none text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[#c6c6cd] block mb-1">Cover Micrograph / Figure</label>
                    <div className="flex gap-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/*"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                        className="hidden"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-2 rounded-lg bg-[#122131] hover:bg-[#1c2b3c] border border-[#273647] text-slate-300 text-xs flex items-center gap-1.5"
                      >
                        <Upload className="w-3.5 h-3.5 text-[#ffc640]" />
                        <span>Upload Figure</span>
                      </button>
                      {paperCoverImage && (
                        <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Figure Attached
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* DYNAMIC FIELDS: BLOG DISPATCH */}
            {/* ========================================================= */}
            {submissionType === 'blog' && (
              <div className="space-y-3 p-4 rounded-2xl bg-[#071727] border border-[#1c2b3c]">
                <div>
                  <label className="text-[#c6c6cd] block mb-1 font-semibold">
                    Article / Dispatch Title <span className="text-[#ffc640]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={blogTitle}
                    onChange={(e) => setBlogTitle(e.target.value)}
                    placeholder="e.g. Breakthrough in Sustainable Bio-leaching of Rare Earth Minerals"
                    className="w-full px-3 py-2 rounded-lg bg-[#122131] border border-[#273647] text-[#d4e4fa] focus:border-[#2fd9f4] outline-none text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[#c6c6cd] block mb-1">Topic Category</label>
                    <select
                      value={blogCategory}
                      onChange={(e) => setBlogCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#122131] border border-[#273647] text-[#2fd9f4] font-bold focus:border-[#2fd9f4] outline-none text-xs"
                    >
                      <option value="Lab Notes & Dispatches">Lab Notes & Dispatches</option>
                      <option value="Metallurgical Insights">Metallurgical Insights</option>
                      <option value="Clean Energy Materials">Clean Energy Materials</option>
                      <option value="Field Expedition Report">Field Expedition Report</option>
                      <option value="Young Scholar Perspectives">Young Scholar Perspectives</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[#c6c6cd] block mb-1">Estimated Read Time</label>
                    <input
                      type="text"
                      value={blogReadTime}
                      onChange={(e) => setBlogReadTime(e.target.value)}
                      placeholder="4 min read"
                      className="w-full px-3 py-2 rounded-lg bg-[#122131] border border-[#273647] text-[#d4e4fa] focus:border-[#2fd9f4] outline-none text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[#c6c6cd] block mb-1 font-semibold">
                    Full Article Content (Markdown Supported) <span className="text-[#ffc640]">*</span>
                  </label>
                  <textarea
                    rows={6}
                    required
                    value={blogContent}
                    onChange={(e) => setBlogContent(e.target.value)}
                    placeholder="Write or paste your scientific analysis, experimental observations, or laboratory methodology..."
                    className="w-full px-3 py-2 rounded-lg bg-[#122131] border border-[#273647] text-[#d4e4fa] focus:border-[#2fd9f4] outline-none text-xs leading-relaxed resize-none font-mono"
                  />
                </div>

                <div>
                  <label className="text-[#c6c6cd] block mb-1">Keywords / Topic Tags</label>
                  <input
                    type="text"
                    value={blogTags}
                    onChange={(e) => setBlogTags(e.target.value)}
                    placeholder="Bioleaching, Rare Earth, Hydro-Metallurgy"
                    className="w-full px-3 py-2 rounded-lg bg-[#122131] border border-[#273647] text-[#d4e4fa] focus:border-[#2fd9f4] outline-none text-xs"
                  />
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* DYNAMIC FIELDS: GALLERY MICROSCOPY */}
            {/* ========================================================= */}
            {submissionType === 'gallery' && (
              <div className="space-y-3 p-4 rounded-2xl bg-[#071727] border border-[#1c2b3c]">
                <div>
                  <label className="text-[#c6c6cd] block mb-1 font-semibold">
                    Micrograph Title / Specimen Identifier <span className="text-[#ffc640]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={galleryTitle}
                    onChange={(e) => setGalleryTitle(e.target.value)}
                    placeholder="e.g. Dendritic Segregation & Carbide Precipitation in IN718"
                    className="w-full px-3 py-2 rounded-lg bg-[#122131] border border-[#273647] text-[#d4e4fa] focus:border-purple-400 outline-none text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[#c6c6cd] block mb-1">Characterization Technique</label>
                    <select
                      value={galleryTechnique}
                      onChange={(e) => setGalleryTechnique(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#122131] border border-[#273647] text-purple-300 font-bold focus:border-purple-400 outline-none text-xs"
                    >
                      <option value="Scanning Electron Microscopy (SEM)">Scanning Electron Microscopy (SEM)</option>
                      <option value="Transmission Electron Microscopy (TEM)">Transmission Electron Microscopy (TEM)</option>
                      <option value="X-Ray Diffraction (XRD)">X-Ray Diffraction (XRD)</option>
                      <option value="Atomic Force Microscopy (AFM)">Atomic Force Microscopy (AFM)</option>
                      <option value="Laser Confocal 3D Profilometry">Laser Confocal 3D Profilometry</option>
                      <option value="Optical Metallography">Optical Metallography</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[#c6c6cd] block mb-1">Sample Material</label>
                    <input
                      type="text"
                      value={gallerySample}
                      onChange={(e) => setGallerySample(e.target.value)}
                      placeholder="e.g. Inconel 718 / Ti-6Al-4V"
                      className="w-full px-3 py-2 rounded-lg bg-[#122131] border border-[#273647] text-[#d4e4fa] focus:border-purple-400 outline-none text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[#c6c6cd] block mb-1">Magnification / Scale</label>
                    <input
                      type="text"
                      value={galleryMagnification}
                      onChange={(e) => setGalleryMagnification(e.target.value)}
                      placeholder="e.g. 5,000x / 20 μm scale"
                      className="w-full px-3 py-2 rounded-lg bg-[#122131] border border-[#273647] text-[#d4e4fa] focus:border-purple-400 outline-none text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[#c6c6cd] block mb-1">Micrograph Caption & Phase Details</label>
                  <textarea
                    rows={3}
                    value={galleryCaption}
                    onChange={(e) => setGalleryCaption(e.target.value)}
                    placeholder="Observed gamma-double-prime phases, grain boundaries, and dislocation densities..."
                    className="w-full px-3 py-2 rounded-lg bg-[#122131] border border-[#273647] text-[#d4e4fa] focus:border-purple-400 outline-none text-xs resize-none"
                  />
                </div>

                <div>
                  <label className="text-[#c6c6cd] block mb-1">Upload Micrograph File (or Image URL)</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-2 rounded-lg bg-[#122131] hover:bg-[#1c2b3c] border border-[#273647] text-purple-300 text-xs font-bold flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Select High-Res Micrograph</span>
                    </button>
                    {galleryImageUrl && (
                      <span className="text-[11px] text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Image Ready for Supabase
                      </span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ========================================================= */}
            {/* DYNAMIC FIELDS: COLLABORATION / PROPOSAL */}
            {/* ========================================================= */}
            {submissionType === 'collaboration' && (
              <div className="space-y-3 p-4 rounded-2xl bg-[#071727] border border-[#1c2b3c]">
                <div>
                  <label className="text-[#c6c6cd] block mb-1 font-semibold">
                    Proposal / Project Title <span className="text-[#ffc640]">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={proposalTitle}
                    onChange={(e) => setProposalTitle(e.target.value)}
                    placeholder="e.g. Joint Investigation on Corrosion Resistant High-Entropy Alloy Coatings"
                    className="w-full px-3 py-2 rounded-lg bg-[#122131] border border-[#273647] text-[#d4e4fa] focus:border-emerald-400 outline-none text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[#c6c6cd] block mb-1">Technical Research Vertical</label>
                    <select
                      value={proposalVertical}
                      onChange={(e) => setProposalVertical(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-[#122131] border border-[#273647] text-emerald-300 font-bold focus:border-emerald-400 outline-none text-xs"
                    >
                      <option value="Advanced Metallurgical Processing">Advanced Metallurgical Processing</option>
                      <option value="Laser Cladding & Direct Energy Deposition">Laser Cladding & Direct Energy Deposition</option>
                      <option value="Hydrometallurgy & Rare Earth Recovery">Hydrometallurgy & Rare Earth Recovery</option>
                      <option value="Corrosion Engineering & High-Temp Coatings">Corrosion Engineering & High-Temp Coatings</option>
                      <option value="Clean Energy Materials & Hydrogen Electrodes">Clean Energy Materials & Hydrogen Electrodes</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[#c6c6cd] block mb-1">Proposed Funding Agency / Sponsor</label>
                    <input
                      type="text"
                      value={proposalFunding}
                      onChange={(e) => setProposalFunding(e.target.value)}
                      placeholder="e.g. CSIR FTT / DST SERB / Industry Sponsor"
                      className="w-full px-3 py-2 rounded-lg bg-[#122131] border border-[#273647] text-[#d4e4fa] focus:border-emerald-400 outline-none text-xs"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[#c6c6cd] block mb-1 font-semibold">
                    Scope of Work & Objectives <span className="text-[#ffc640]">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={proposalObjectives}
                    onChange={(e) => setProposalObjectives(e.target.value)}
                    placeholder="Outline laboratory equipment required, timeline, expected deliverables, and intellectual property allocation..."
                    className="w-full px-3 py-2 rounded-lg bg-[#122131] border border-[#273647] text-[#d4e4fa] focus:border-emerald-400 outline-none text-xs resize-none leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-[#1c2b3c]">
              <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Supabase Live Sync Active (gfystmvjhngmxiqgbddw)</span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/2 sm:w-auto px-4 py-2.5 rounded-xl bg-[#122131] hover:bg-[#1c2b3c] text-slate-300 font-mono text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-1/2 sm:w-auto px-6 py-2.5 rounded-xl bg-[#2fd9f4] hover:bg-[#1ebcd4] active:scale-[0.98] text-[#051424] font-bold font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-60"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Writing to Supabase...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Submit to Database</span>
                    </>
                  )}
                </button>
              </div>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
