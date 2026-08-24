import React from 'react';
import {
  Lock,
  ShieldCheck,
  BookOpen,
  FileText,
  Image,
  Activity,
  Home,
  CheckCircle2,
  LogIn,
  UserPlus
} from 'lucide-react';
import { ActiveTab } from '../types';

interface RestrictedAccessGateProps {
  targetTab: 'papers' | 'blog' | 'gallery' | 'analytics';
  onOpenAuthModal: (role?: 'admin' | 'user', mode?: 'login' | 'signup') => void;
  onGoHome: () => void;
}

export const RestrictedAccessGate: React.FC<RestrictedAccessGateProps> = ({
  targetTab,
  onOpenAuthModal,
  onGoHome
}) => {
  const tabDetails = {
    papers: {
      title: 'Scientific Publications & Patent Archives',
      icon: FileText,
      badge: 'Peer-Reviewed Repository',
      accentColor: 'text-[#ffc640]',
      borderColor: 'border-[#ffc640]/40',
      description:
        'Access 42+ peer-reviewed journal papers, industrial patents, full-text abstract viewer, BibTeX/APA/IEEE citation generator, dataset replication requests, and local offline reading libraries.',
      features: [
        'Full papers & conference proceedings search',
        'Direct BibTeX / APA / IEEE citation exporter',
        'Industrial patent filings & methodology blueprints',
        'Academic dataset & replication access requests'
      ]
    },
    blog: {
      title: 'Laboratory Logs & Technical Preprints',
      icon: BookOpen,
      badge: 'CSIR-IMMT Research Logs',
      accentColor: 'text-[#2fd9f4]',
      borderColor: 'border-[#2fd9f4]/40',
      description:
        'Explore live laboratory logs, experimental observations on Laser Cladding & Metal 3D Printing (DED/SLM), metallurgical notes, and peer-to-peer scholarly discussions.',
      features: [
        'Real-time lab experiment logs & parameter logs',
        'Peer discussion threads & scientific commenting',
        'Offline bookmarking for field & lab reading',
        'Direct email newsletter notifications for preprints'
      ]
    },
    gallery: {
      title: 'Micrographs & Material Characterization Gallery',
      icon: Image,
      badge: 'High-Resolution Figures',
      accentColor: 'text-[#a78bfa]',
      borderColor: 'border-[#a78bfa]/40',
      description:
        'High-resolution scanning electron micrographs (SEM), optical metallography scans, laser cladding melt pool cross-sections, and 3D printing microstructure figures.',
      features: [
        'Full-resolution optical & SEM micrograph viewer',
        'Category filters (Cladding, 3D Printing, SEM Scan, Reactor)',
        'Private researcher annotation notes on figures',
        'Offline caching for high-magnification analysis'
      ]
    },
    analytics: {
      title: 'Scientometrics & Impact Telemetry Dashboard',
      icon: Activity,
      badge: 'Research Impact & Live Telemetry',
      accentColor: 'text-emerald-400',
      borderColor: 'border-emerald-500/40',
      description:
        'Scientometric impact metrics including h-index, i10-index, citation velocity charts, CSIR-IMMT laser thermal load telemetry, and Supabase & Firestore cloud sync health.',
      features: [
        'Interactive citation trends & annual outputs charts',
        'In-situ melt pool thermal load telemetry monitors',
        'Custom researcher citation simulation calculator',
        'Exportable CSV scientometrics report & collaboration hub'
      ]
    }
  }[targetTab];

  const IconComponent = tabDetails.icon;

  return (
    <div className="max-w-3xl mx-auto py-8 sm:py-12 space-y-8 animate-in fade-in duration-300">
      {/* Top Banner / Card */}
      <div className={`relative rounded-3xl bg-gradient-to-b from-[#0d1c2d] to-[#122131] border ${tabDetails.borderColor} p-6 sm:p-10 shadow-2xl overflow-hidden`}>
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1c2b3c_1px,transparent_1px),linear-gradient(to_bottom,#1c2b3c_1px,transparent_1px)] bg-[size:24px_24px] opacity-15 pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Badge & Lock Icon */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1c2b3c]/80 border border-[#273647] text-xs font-mono text-[#d4e4fa]">
              <Lock className="w-3.5 h-3.5 text-[#ffc640]" />
              <span>RESEARCHER AUTHENTICATION REQUIRED</span>
            </div>

            <span className={`text-xs font-mono px-3 py-1 rounded-full bg-[#051424] border ${tabDetails.borderColor} ${tabDetails.accentColor} font-bold`}>
              {tabDetails.badge}
            </span>
          </div>

          {/* Heading */}
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#1c2b3c] border border-[#273647] flex items-center justify-center text-[#ffc640] shadow-inner">
                <IconComponent className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold font-serif text-[#d4e4fa] tracking-tight">
                  {tabDetails.title}
                </h1>
                <p className="text-xs font-mono text-[#c6c6cd]">
                  CSIR-IMMT Laboratory Repository Access Gate
                </p>
              </div>
            </div>
            <p className="text-sm sm:text-base text-[#c6c6cd] font-sans leading-relaxed pt-2">
              {tabDetails.description}
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {tabDetails.features.map((feat, idx) => (
              <div
                key={idx}
                className="flex items-start gap-2.5 p-3 rounded-xl bg-[#051424]/60 border border-[#1c2b3c] text-xs text-slate-300 font-mono"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{feat}</span>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-[#1c2b3c] space-y-4">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Primary Sign In Button */}
              <button
                type="button"
                onClick={() => onOpenAuthModal('user', 'login')}
                className="flex-1 py-3.5 px-5 rounded-xl bg-[#2fd9f4] hover:bg-[#1ebcd4] text-[#051424] font-mono text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <LogIn className="w-4 h-4" />
                <span>Sign In with Email or Google</span>
              </button>

              {/* Register Account Button */}
              <button
                type="button"
                onClick={() => onOpenAuthModal('user', 'signup')}
                className="py-3.5 px-5 rounded-xl bg-[#1c2b3c] hover:bg-[#273647] text-[#d4e4fa] border border-[#273647] font-mono text-xs sm:text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all"
              >
                <UserPlus className="w-4 h-4" />
                <span>Create Researcher Account</span>
              </button>
            </div>

            {/* Return to Home / Public */}
            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={onGoHome}
                className="text-xs font-mono text-[#c6c6cd] hover:text-[#d4e4fa] flex items-center gap-1.5 transition-colors"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Return to Public Home</span>
              </button>

              <button
                type="button"
                onClick={() => onOpenAuthModal('admin', 'login')}
                className="text-xs font-mono text-[#ffc640] hover:underline flex items-center gap-1.5 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>CSIR-IMMT Administrator Portal</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
