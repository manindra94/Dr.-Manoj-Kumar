import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  ExternalLink,
  BookOpen,
  Mail,
  MapPin,
  Sparkles,
  CheckCircle2,
  KeyRound,
  Send,
  Building,
  Phone,
  Clock,
  MessageSquare,
  AlertCircle,
  RefreshCw,
  Home,
  User,
  FileText,
  Image,
  Activity,
  Settings,
  ChevronRight,
  FilePlus2,
  Globe2,
  Atom
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import { localDB } from '../lib/db';
import { ActiveTab } from '../types';

interface FooterProps {
  setActiveTab: (tab: ActiveTab) => void;
  onOpenAuthModal: () => void;
  onOpenSubmissionModal?: (type?: 'publication' | 'blog' | 'gallery' | 'collaboration') => void;
}

export const Footer: React.FC<FooterProps> = ({ setActiveTab, onOpenAuthModal, onOpenSubmissionModal }) => {
  const { user, isAdmin, logout } = useAuth();

  // Contact form state in footer
  const [inquiryData, setInquiryData] = useState({
    name: '',
    email: '',
    organization: '',
    category: 'Industrial R&D & Consultancy',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSendInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setIsSubmitting(true);

    try {
      if (!inquiryData.name.trim() || !inquiryData.email.trim() || !inquiryData.message.trim()) {
        throw new Error('Please provide your name, email, and inquiry message.');
      }

      await localDB.saveContactMessage({
        name: inquiryData.name.trim(),
        email: inquiryData.email.trim(),
        subject: `[${inquiryData.category}] ${inquiryData.organization ? `from ${inquiryData.organization}` : ''}`,
        message: inquiryData.organization
          ? `[Affiliation / Organization: ${inquiryData.organization}]\n[Category: ${inquiryData.category}]\n\n${inquiryData.message}`
          : `[Category: ${inquiryData.category}]\n\n${inquiryData.message}`,
        senderRole: inquiryData.organization || 'Inquirer'
      });

      setIsSubmitting(false);
      setSubmitSuccess(true);
      setInquiryData({
        name: '',
        email: '',
        organization: '',
        category: 'Industrial R&D & Consultancy',
        message: ''
      });

      setTimeout(() => {
        setSubmitSuccess(false);
      }, 5000);
    } catch (err: any) {
      setIsSubmitting(false);
      setSubmitError(err.message || 'Failed to submit inquiry. Please try again.');
    }
  };

  return (
    <footer className="mt-16 border-t border-[#1c2b3c] bg-[#071727] text-slate-300 font-sans pb-24 md:pb-16 pt-10 px-4 sm:px-6 lg:px-8 rounded-t-3xl shadow-2xl">
      <div className="max-w-6xl mx-auto space-y-12">
        
        {/* ========================================================= */}
        {/* 1. CONTACT & INQUIRY SECTION */}
        {/* ========================================================= */}
        <div className="rounded-2xl bg-[#0d1c2d] border border-[#1c2b3c] p-6 sm:p-8 shadow-xl relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-[#ffc640]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#2fd9f4]/5 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left side: Information & Coordinates */}
            <div className="lg:col-span-5 space-y-5">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ffc640]/10 border border-[#ffc640]/30 text-[#ffc640] text-xs font-mono font-bold tracking-wider uppercase">
                  <Mail className="w-3.5 h-3.5" />
                  <span>Research Inquiries & Contact</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold font-serif text-[#d4e4fa]">
                  Connect with the Laboratory
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">
                  Submit scientific inquiries, industrial consultancy proposals, materials characterization requests, or academic collaboration inquiries directly to Dr. Manoj Kumar and the research team.
                </p>
              </div>

              {/* Direct Info Cards */}
              <div className="space-y-2.5 font-mono text-xs text-[#c6c6cd]">
                <div className="flex items-start gap-3 p-3 rounded-xl bg-[#122131] border border-[#1c2b3c]">
                  <MapPin className="w-4 h-4 text-[#ffc640] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-[#d4e4fa] font-semibold block">Laboratory Address</span>
                    <span>Hydro & Electrometallurgy Division, CSIR-IMMT, Acharya Vihar, Bhubaneswar, Odisha 751013, India</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#122131] border border-[#1c2b3c]">
                    <Mail className="w-4 h-4 text-[#2fd9f4] shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[#d4e4fa] font-semibold block">Direct Emails</span>
                      <a href="mailto:dir@immt.res.in" className="hover:text-[#2fd9f4] block">dir@immt.res.in</a>
                      <a href="mailto:manojkumar@immt.res.in" className="hover:text-[#2fd9f4] block">manoj@immt.res.in</a>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#122131] border border-[#1c2b3c]">
                    <Phone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-[#d4e4fa] font-semibold block">Phone / EPABX</span>
                      <span>+91-674-237-9400</span>
                      <span className="block text-[10px] text-slate-400">Ext: 401 / 425</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#122131]/60 border border-[#1c2b3c] text-[11px]">
                  <Clock className="w-3.5 h-3.5 text-[#ffc640]" />
                  <span>Lab Hours: Monday – Friday, 09:00 AM – 05:30 PM IST</span>
                </div>
              </div>
            </div>

            {/* Right side: Interactive Inquiry Form */}
            <div className="lg:col-span-7 bg-[#122131] border border-[#273647] rounded-xl p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-[#1c2b3c] pb-3">
                <div className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#2fd9f4]" />
                  <h4 className="text-sm font-bold font-mono text-[#d4e4fa] uppercase tracking-wide">
                    Send an Inquiry Message
                  </h4>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1c2b3c] text-[#c6c6cd]">
                  Direct Dispatch
                </span>
              </div>

              {submitSuccess ? (
                <div className="p-6 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-center space-y-3 animate-in fade-in">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto animate-bounce" />
                  <h5 className="font-serif font-bold text-base text-emerald-200">
                    Inquiry Successfully Transmitted!
                  </h5>
                  <p className="text-xs font-mono text-emerald-300/90 max-w-md mx-auto leading-relaxed">
                    Thank you for your message. Your inquiry has been securely logged in the CSIR-IMMT portal database and forwarded to the laboratory research desk.
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitSuccess(false)}
                    className="mt-2 px-4 py-1.5 rounded-lg bg-emerald-800/60 hover:bg-emerald-700/60 text-emerald-100 font-mono text-xs font-semibold"
                  >
                    Send Another Inquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSendInquiry} className="space-y-3.5 font-mono text-xs">
                  {submitError && (
                    <div className="p-3 rounded-lg bg-red-950/60 border border-red-500/50 text-red-200 text-xs flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                      <span>{submitError}</span>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[#c6c6cd] mb-1 font-semibold">
                        YOUR NAME <span className="text-[#ffc640]">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={inquiryData.name}
                        onChange={(e) => setInquiryData({ ...inquiryData, name: e.target.value })}
                        placeholder="e.g. Dr. Priya Patel / Researcher"
                        className="w-full px-3 py-2 rounded-lg bg-[#071727] border border-[#1c2b3c] focus:border-[#2fd9f4] text-[#d4e4fa] outline-none placeholder:text-slate-600 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[#c6c6cd] mb-1 font-semibold">
                        EMAIL ADDRESS <span className="text-[#ffc640]">*</span>
                      </label>
                      <input
                        type="email"
                        required
                        value={inquiryData.email}
                        onChange={(e) => setInquiryData({ ...inquiryData, email: e.target.value })}
                        placeholder="e.g. p.patel@university.edu"
                        className="w-full px-3 py-2 rounded-lg bg-[#071727] border border-[#1c2b3c] focus:border-[#2fd9f4] text-[#d4e4fa] outline-none placeholder:text-slate-600 text-xs"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[#c6c6cd] mb-1">
                        ORGANIZATION / INSTITUTION
                      </label>
                      <input
                        type="text"
                        value={inquiryData.organization}
                        onChange={(e) => setInquiryData({ ...inquiryData, organization: e.target.value })}
                        placeholder="e.g. Tata Steel / IIT Bombay"
                        className="w-full px-3 py-2 rounded-lg bg-[#071727] border border-[#1c2b3c] focus:border-[#2fd9f4] text-[#d4e4fa] outline-none placeholder:text-slate-600 text-xs"
                      />
                    </div>

                    <div>
                      <label className="block text-[#c6c6cd] mb-1 font-semibold">
                        INQUIRY CATEGORY <span className="text-[#ffc640]">*</span>
                      </label>
                      <select
                        value={inquiryData.category}
                        onChange={(e) => setInquiryData({ ...inquiryData, category: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-[#071727] border border-[#1c2b3c] focus:border-[#2fd9f4] text-[#d4e4fa] outline-none text-xs"
                      >
                        <option value="Industrial R&D & Consultancy">Industrial R&D & Consultancy</option>
                        <option value="Ph.D. / Postdoc Research Supervision">Ph.D. / Postdoc Research Supervision</option>
                        <option value="Materials Characterization & SEM Testing">Materials Characterization & SEM Testing</option>
                        <option value="Paper Reprint & Scientific Data Request">Paper Reprint & Scientific Data Request</option>
                        <option value="Academic Collaboration / Keynote Invitation">Academic Collaboration / Keynote Invitation</option>
                        <option value="General Scientific Inquiry">General Scientific Inquiry</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[#c6c6cd] mb-1 font-semibold">
                      INQUIRY MESSAGE & DETAILS <span className="text-[#ffc640]">*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={inquiryData.message}
                      onChange={(e) => setInquiryData({ ...inquiryData, message: e.target.value })}
                      placeholder="Please outline the scope of your inquiry, metallurgical requirements, sample details, or collaboration interests..."
                      className="w-full px-3 py-2 rounded-lg bg-[#071727] border border-[#1c2b3c] focus:border-[#2fd9f4] text-[#d4e4fa] outline-none placeholder:text-slate-600 resize-none text-xs leading-relaxed"
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <p className="text-[11px] text-emerald-400 font-mono hidden sm:flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>Connected to Supabase Table `inquiries` (gfystmvjhngmxiqgbddw)</span>
                    </p>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#2fd9f4] hover:bg-[#1ebcd4] active:scale-[0.98] text-[#051424] font-bold font-mono text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all disabled:opacity-60"
                    >
                      {isSubmitting ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Saving to Supabase...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Submit Inquiry</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 2. INSTITUTE & QUICK LINKS GRID */}
        {/* ========================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pt-4">
          {/* Column 1: Institute Info */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-[#ffc640]/20 border border-[#ffc640]/40 flex items-center justify-center text-[#ffc640] font-bold font-serif text-sm shadow-inner">
                CSIR
              </div>
              <div>
                <h3 className="text-sm font-bold font-serif text-[#d4e4fa]">
                  CSIR - Institute of Minerals and Materials Technology
                </h3>
                <p className="text-[11px] font-mono text-[#c6c6cd]">
                  Council of Scientific & Industrial Research, Govt. of India
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed font-sans max-w-lg">
              Advanced Research Portfolio & Materials Engineering Laboratory. Pioneering sustainable mineral processing, clean energy materials, hydrometallurgical recovery, and interfacial kinetics.
            </p>

            <div className="flex flex-wrap gap-4 text-xs font-mono text-[#c6c6cd] pt-1">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#ffc640]" />
                <span>Bhubaneswar, Odisha, India - 751013</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#2fd9f4]" />
                <span>dir@immt.res.in</span>
              </div>
            </div>
          </div>

          {/* Column 2: Sections & Portfolio */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold text-[#d4e4fa] uppercase tracking-wider flex items-center gap-1.5">
              <Atom className="w-3.5 h-3.5 text-[#ffc640]" />
              <span>Sections & Portfolio</span>
            </h4>
            <ul className="space-y-1 text-xs font-mono">
              <li>
                <button
                  onClick={() => setActiveTab('home')}
                  className="w-full text-left py-1 px-1.5 rounded-md text-slate-400 hover:text-[#ffc640] hover:bg-[#122131] transition-all flex items-center justify-between group"
                >
                  <span className="flex items-center gap-2">
                    <Home className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#ffc640] transition-colors shrink-0" />
                    <span>Overview & Highlights</span>
                  </span>
                  <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-[#ffc640] group-hover:translate-x-0.5 transition-all" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('about')}
                  className="w-full text-left py-1 px-1.5 rounded-md text-slate-400 hover:text-[#ffc640] hover:bg-[#122131] transition-all flex items-center justify-between group"
                >
                  <span className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#ffc640] transition-colors shrink-0" />
                    <span>Scientist Biography & Career</span>
                  </span>
                  <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-[#ffc640] group-hover:translate-x-0.5 transition-all" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('papers')}
                  className="w-full text-left py-1 px-1.5 rounded-md text-slate-400 hover:text-[#ffc640] hover:bg-[#122131] transition-all flex items-center justify-between group"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-[#ffc640]/70 group-hover:text-[#ffc640] transition-colors shrink-0" />
                    <span>Publications & Patents</span>
                  </span>
                  <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-[#ffc640] group-hover:translate-x-0.5 transition-all" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('blog')}
                  className="w-full text-left py-1 px-1.5 rounded-md text-slate-400 hover:text-[#2fd9f4] hover:bg-[#122131] transition-all flex items-center justify-between group"
                >
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5 text-[#2fd9f4]/70 group-hover:text-[#2fd9f4] transition-colors shrink-0" />
                    <span>Laboratory Logs & Preprints</span>
                  </span>
                  <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-[#2fd9f4] group-hover:translate-x-0.5 transition-all" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('gallery')}
                  className="w-full text-left py-1 px-1.5 rounded-md text-slate-400 hover:text-purple-400 hover:bg-[#122131] transition-all flex items-center justify-between group"
                >
                  <span className="flex items-center gap-2">
                    <Image className="w-3.5 h-3.5 text-purple-400/70 group-hover:text-purple-400 transition-colors shrink-0" />
                    <span>Micrograph & Material Gallery</span>
                  </span>
                  <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-purple-400 group-hover:translate-x-0.5 transition-all" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('analytics')}
                  className="w-full text-left py-1 px-1.5 rounded-md text-slate-400 hover:text-emerald-400 hover:bg-[#122131] transition-all flex items-center justify-between group"
                >
                  <span className="flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-emerald-400/70 group-hover:text-emerald-400 transition-colors shrink-0" />
                    <span>Scientometrics & Analytics</span>
                  </span>
                  <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('settings')}
                  className="w-full text-left py-1 px-1.5 rounded-md text-slate-400 hover:text-[#ffc640] hover:bg-[#122131] transition-all flex items-center justify-between group"
                >
                  <span className="flex items-center gap-2">
                    <Settings className="w-3.5 h-3.5 text-slate-500 group-hover:text-[#ffc640] transition-colors shrink-0" />
                    <span>Laboratory CMS & Settings</span>
                  </span>
                  <ChevronRight className="w-3 h-3 text-slate-600 group-hover:text-[#ffc640] group-hover:translate-x-0.5 transition-all" />
                </button>
              </li>
              {onOpenSubmissionModal && (
                <li className="pt-1.5 border-t border-[#1c2b3c]/60">
                  <button
                    onClick={() => onOpenSubmissionModal('publication')}
                    className="w-full py-1.5 px-2 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 transition-all font-bold flex items-center justify-between group text-[11px]"
                  >
                    <span className="flex items-center gap-1.5">
                      <FilePlus2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Submit Research Paper</span>
                    </span>
                    <Sparkles className="w-3 h-3 text-emerald-400 group-hover:rotate-12 transition-transform" />
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Column 3: Administration & Staff Access */}
          <div className="space-y-3">
            <h4 className="text-xs font-mono font-bold text-[#ffc640] uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Administrative Portal</span>
            </h4>
            <p className="text-xs text-slate-400">
              CMS controls for site editors, publication management, and laboratory settings.
            </p>

            <div className="pt-1">
              {isAdmin ? (
                <div className="p-3 rounded-xl bg-[#ffc640]/10 border border-[#ffc640]/30 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold font-mono text-[#ffc640]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Administrator Mode Active</span>
                  </div>
                  <p className="text-[11px] font-mono text-slate-300 truncate">
                    Logged in: {user?.displayName || user?.email}
                  </p>
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <button
                      onClick={() => setActiveTab('settings')}
                      className="px-2 py-1 rounded bg-[#ffc640] text-[#051424] font-mono text-[10px] font-bold hover:bg-[#e3aa00] transition-colors"
                    >
                      CMS Hub
                    </button>
                    <button
                      onClick={() => setActiveTab('home')}
                      className="px-2 py-1 rounded bg-[#1c2b3c] hover:bg-[#273647] text-white font-mono text-[10px] transition-colors"
                    >
                      Edit Home
                    </button>
                    <button
                      onClick={() => setActiveTab('about')}
                      className="px-2 py-1 rounded bg-[#1c2b3c] hover:bg-[#273647] text-white font-mono text-[10px] transition-colors"
                    >
                      Edit About
                    </button>
                    <button
                      onClick={logout}
                      className="px-2 py-1 rounded bg-rose-950/40 text-rose-300 border border-rose-800/40 font-mono text-[10px] hover:bg-rose-900/60 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <button
                    onClick={onOpenAuthModal}
                    className="w-full py-2.5 px-3.5 rounded-xl bg-[#ffc640]/15 hover:bg-[#ffc640]/25 text-[#ffc640] border border-[#ffc640]/50 font-mono text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-md group hover:border-[#ffc640]"
                  >
                    <Lock className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                    <span>Administrative Portal Login</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ========================================================= */}
        {/* 3. BOTTOM BAR */}
        {/* ========================================================= */}
        <div className="pt-6 border-t border-[#1c2b3c] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] font-mono text-[#c6c6cd]">
          <div>
            © {new Date().getFullYear()} CSIR-IMMT Laboratory Portfolio. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span>Govt. of India Research Portal</span>
            <span className="text-[#1c2b3c]">•</span>
            <button
              onClick={onOpenAuthModal}
              className="text-[#ffc640] hover:underline flex items-center gap-1 font-semibold"
            >
              <KeyRound className="w-3 h-3" />
              <span>Admin Access</span>
            </button>
          </div>
        </div>

      </div>
    </footer>
  );
};
