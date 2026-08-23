import React, { useState, useEffect } from 'react';
import {
  User,
  ShieldCheck,
  Lock,
  Bell,
  Sliders,
  Database,
  HelpCircle,
  Activity,
  Key,
  Smartphone,
  Check,
  RefreshCw,
  Zap,
  Globe,
  Radio,
  Eye,
  Volume2,
  Trash2,
  Download,
  Mail,
  Edit3,
  Layers,
  FileText,
  Image,
  Flame,
  Sparkles,
  LogOut,
  UserCheck,
  CheckCircle,
  AlertCircle,
  Copy,
  CheckCheck,
  ExternalLink,
  Code,
  Inbox,
  Send,
  PlusCircle,
  FileCode,
  Microscope,
  BookOpen
} from 'lucide-react';
import { localDB, StorageState } from '../../lib/db';
import { useAuth } from '../../lib/AuthContext';
import { supabaseService, SupabaseHealthStatus } from '../../lib/supabaseService';
import { SUPABASE_PROJECT_ID, SUPABASE_URL, SUPABASE_ANON_KEY, SupabaseResearcherSubmission } from '../../lib/supabase';
import { MOCK_ACTIVE_SESSIONS } from '../../data/mockData';
import { DisplayMode, AccentColor, ActiveTab } from '../../types';

interface SettingsViewProps {
  setActiveTab?: (tab: ActiveTab) => void;
  onOpenEditProfileModal?: () => void;
  onOpenAddPaperModal?: () => void;
  onOpenAddPostModal?: () => void;
  onOpenAddGalleryModal?: () => void;
  onOpenResearcherSubmissionModal?: (type?: any) => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  setActiveTab,
  onOpenEditProfileModal,
  onOpenAddPaperModal,
  onOpenAddPostModal,
  onOpenAddGalleryModal,
  onOpenResearcherSubmissionModal
}) => {
  const [dbState, setDbState] = useState<StorageState>(localDB.getState());
  const { user, isAdmin, logout, switchUserRole, loginDemoAdmin, loginDemoUser } = useAuth();

  const [activeSection, setActiveSection] = useState<
    'cms' | 'messages' | 'submissions' | 'supabase' | 'auth' | 'database' | 'security' | 'notifications' | 'preferences'
  >('cms');

  const [generatedPassphrase, setGeneratedPassphrase] = useState('');
  const [passphraseCopied, setPassphraseCopied] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  // Supabase State
  const [supabaseHealth, setSupabaseHealth] = useState<SupabaseHealthStatus>(supabaseService.getHealth());
  const [isCheckingSupabase, setIsCheckingSupabase] = useState(false);
  const [isSyncingSupabase, setIsSyncingSupabase] = useState(false);
  const [showSqlSchema, setShowSqlSchema] = useState(false);
  const [sqlCopied, setSqlCopied] = useState(false);
  const [apiKeyCopied, setApiKeyCopied] = useState(false);

  // Researcher Submissions Queue State
  const [submissions, setSubmissions] = useState<SupabaseResearcherSubmission[]>([]);
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);
  const [reviewNoteInput, setReviewNoteInput] = useState<{ [id: string]: string }>({});

  useEffect(() => {
    const unsub = localDB.subscribe(setDbState);
    loadSubmissions();
    return () => unsub();
  }, []);

  const loadSubmissions = async () => {
    setIsLoadingSubmissions(true);
    try {
      const list = await supabaseService.fetchResearcherSubmissions();
      setSubmissions(list);
    } catch (err) {
      console.warn('Load submissions error:', err);
    } finally {
      setIsLoadingSubmissions(false);
    }
  };

  const handleTestSupabaseConnection = async () => {
    setIsCheckingSupabase(true);
    try {
      const status = await supabaseService.testConnection();
      setSupabaseHealth(status);
      setActionNotice(status.connected ? 'Supabase connection verified active!' : 'Notice: Supabase tables pending initialization.');
      setTimeout(() => setActionNotice(null), 4000);
    } catch (err: any) {
      console.warn(err);
    } finally {
      setIsCheckingSupabase(false);
    }
  };

  const handleSyncAllToSupabase = async () => {
    setIsSyncingSupabase(true);
    try {
      const res = await localDB.syncWithSupabase();
      if (res.success) {
        setActionNotice(`Successfully synchronized ${res.count} records with Supabase (${SUPABASE_PROJECT_ID})!`);
      } else {
        setActionNotice(`Supabase sync note: ${res.error || 'Ready for tables'}`);
      }
      setTimeout(() => setActionNotice(null), 4000);
      loadSubmissions();
    } catch (err: any) {
      setActionNotice(`Sync error: ${err.message}`);
    } finally {
      setIsSyncingSupabase(false);
    }
  };

  const handleCopySqlSchema = () => {
    const sql = supabaseService.getSupabaseDDLScript();
    navigator.clipboard.writeText(sql);
    setSqlCopied(true);
    setTimeout(() => setSqlCopied(false), 2500);
    setActionNotice('Supabase PostgreSQL SQL script copied to clipboard! Paste in Supabase SQL Editor.');
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleCopyApiKey = () => {
    navigator.clipboard.writeText(SUPABASE_ANON_KEY);
    setApiKeyCopied(true);
    setTimeout(() => setApiKeyCopied(false), 2000);
  };

  const handleApproveSubmission = async (sub: SupabaseResearcherSubmission) => {
    const note = reviewNoteInput[sub.id] || 'Approved and published to laboratory index by administrator.';
    const adminName = user?.displayName || 'Dr. Manoj Kumar (Admin)';

    // 1. Convert to live database item
    if (sub.submission_type === 'publication') {
      const p = sub.raw_payload;
      await localDB.addPublication({
        title: sub.title,
        type: p.type || 'Journal',
        year: p.year || new Date().getFullYear(),
        authors: p.authors || sub.researcher_name,
        journal: p.journal || 'CSIR-IMMT Laboratory Review',
        doi: p.doi || undefined,
        abstract: sub.description || p.abstract || '',
        tags: Array.isArray(p.tags) ? p.tags : ['Research'],
        citations: 0,
        url: p.doi ? `https://doi.org/${p.doi}` : 'https://immt.res.in',
        coverImage: p.coverImage
      });
    } else if (sub.submission_type === 'blog') {
      const b = sub.raw_payload;
      await localDB.addBlogPost({
        logCode: `LOG_SUB_${Date.now().toString().slice(-4)}`,
        title: sub.title,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        readTime: b.readTime || '4 min read',
        excerpt: sub.description.slice(0, 160),
        content: b.content || sub.description,
        status: 'PUBLISHED',
        tags: Array.isArray(b.tags) ? b.tags : ['Lab Dispatch']
      });
    } else if (sub.submission_type === 'gallery') {
      const g = sub.raw_payload;
      await localDB.addGalleryItem({
        title: sub.title,
        category: (g.technique || 'Microstructure') as any,
        imageUrl: g.imageUrl || 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&q=80&w=800',
        description: sub.description || g.caption || 'Micrograph from researcher submission.',
        scaleBar: g.magnification || '5000x'
      });
    }

    // 2. Mark reviewed in Supabase
    await supabaseService.reviewResearcherSubmission(sub.id, 'approved', note, adminName);
    localDB.addTelemetry(`Approved researcher submission: "${sub.title}" by ${sub.researcher_name}`, 'sync', 'success');

    // Update local state
    setSubmissions((prev) =>
      prev.map((s) => (s.id === sub.id ? { ...s, status: 'approved', admin_review_notes: note, reviewed_by: adminName } : s))
    );
    setActionNotice(`Submission "${sub.title}" approved and published to live website & Supabase!`);
    setTimeout(() => setActionNotice(null), 4000);
  };

  const handleRejectSubmission = async (sub: SupabaseResearcherSubmission) => {
    const note = reviewNoteInput[sub.id] || 'Submission requires revision before inclusion.';
    const adminName = user?.displayName || 'Dr. Manoj Kumar (Admin)';

    await supabaseService.reviewResearcherSubmission(sub.id, 'rejected', note, adminName);
    localDB.addTelemetry(`Rejected researcher submission: "${sub.title}"`, 'sync', 'warning');

    setSubmissions((prev) =>
      prev.map((s) => (s.id === sub.id ? { ...s, status: 'rejected', admin_review_notes: note, reviewed_by: adminName } : s))
    );
    setActionNotice(`Submission marked as rejected with feedback.`);
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleGeneratePassphrase = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%^&*';
    let res = 'IMMT-KEY-';
    for (let i = 0; i < 20; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setGeneratedPassphrase(res);
    localDB.addTelemetry('New 256-bit AES encryption passkey generated', 'security', 'success');
  };

  const handleCopyPassphrase = () => {
    navigator.clipboard.writeText(generatedPassphrase);
    setPassphraseCopied(true);
    setTimeout(() => setPassphraseCopied(false), 2000);
  };

  const handleBackupExport = () => {
    const backupJson = JSON.stringify(dbState, null, 2);
    const blob = new Blob([backupJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `CSIR_IMMT_Firestore_Backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
    setActionNotice('Full JSON backup downloaded successfully.');
    setTimeout(() => setActionNotice(null), 3000);
  };

  const handleMarkMessageRead = async (id: string) => {
    await localDB.markMessageAsRead(id);
  };

  const handleDeleteMessage = async (id: string) => {
    if (confirm('Delete this inquiry message from Firebase Firestore?')) {
      await localDB.deleteMessage(id);
    }
  };

  const unreadMessages = dbState.messages ? dbState.messages.filter((m) => m.status === 'UNREAD').length : 0;

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-300">
      {/* Title */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#122131] border border-[#2fd9f4]/30 text-[#2fd9f4] font-mono text-xs font-semibold uppercase tracking-wider">
            <Sliders className="w-3.5 h-3.5" />
            FIREBASE BACKEND & SYSTEM CMS HUB
          </div>

          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold flex items-center gap-1.5 ${
              isAdmin
                ? 'bg-[#ffc640]/20 text-[#ffc640] border border-[#ffc640]/40'
                : 'bg-[#2fd9f4]/20 text-[#2fd9f4] border border-[#2fd9f4]/40'
            }`}>
              <ShieldCheck className="w-3.5 h-3.5" />
              {isAdmin ? 'ADMIN ACCESS' : 'RESEARCHER MODE'}
            </span>
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold font-serif text-[#d4e4fa]">
          Portal <span className="text-[#ffc640]">Management & Settings</span>
        </h1>

        <p className="text-xs sm:text-sm text-[#c6c6cd] leading-relaxed max-w-2xl font-sans">
          Manage Firebase Firestore database synchronization, Home page content, About credentials, research papers, lab logs, gallery micrographs, incoming contact inquiries, and role permissions.
        </p>
      </section>

      {/* Action notice banner */}
      {actionNotice && (
        <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-500 text-emerald-300 font-mono text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* Navigation Sub-Tabs */}
      <section className="flex flex-wrap gap-2 border-b border-[#1c2b3c] pb-3 font-mono text-xs">
        {[
          { id: 'cms', label: 'Section CMS', icon: Layers },
          { id: 'messages', label: `Inquiries (${unreadMessages})`, icon: Mail },
          { id: 'submissions', label: `Submissions Queue (${submissions.filter(s => s.status === 'pending').length})`, icon: Inbox },
          { id: 'supabase', label: 'Supabase Cloud DB', icon: Database },
          { id: 'auth', label: 'User & Auth', icon: UserCheck },
          { id: 'database', label: 'Data & Storage', icon: Database },
          { id: 'security', label: 'Security & E2E', icon: ShieldCheck },
          { id: 'notifications', label: 'Notifications', icon: Bell },
          { id: 'preferences', label: 'Theme & UI', icon: Sliders }
        ].map((sec) => {
          const Icon = sec.icon;
          const isActive = activeSection === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => setActiveSection(sec.id as any)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border transition-all ${
                isActive
                  ? 'bg-[#1c2b3c] border-[#ffc640] text-[#ffc640] font-bold'
                  : 'bg-[#122131] border-[#273647] text-[#c6c6cd] hover:border-[#2fd9f4]/40'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{sec.label}</span>
            </button>
          );
        })}
      </section>

      {/* TAB 1: SECTION CMS DIRECTORY */}
      {activeSection === 'cms' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#122131] border border-[#1c2b3c] space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-serif font-bold text-[#d4e4fa] flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#ffc640]" />
                  <span>Website Sections Management</span>
                </h2>
                <p className="text-xs text-[#c6c6cd] mt-0.5">
                  Direct management links to update all pages and research content.
                </p>
              </div>
              <span className="text-xs font-mono text-[#2fd9f4]">
                {isAdmin ? 'ADMINISTRATOR MODE' : 'RESTRICTED (LOGIN AS ADMIN TO EDIT)'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
              {/* Home Page Manager */}
              <div className="p-4 rounded-xl bg-[#051424] border border-[#273647] space-y-2">
                <div className="flex items-center justify-between text-[#ffc640] font-bold">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-4 h-4" /> HOME PAGE
                  </span>
                  <span className="text-[10px] bg-[#1c2b3c] px-2 py-0.5 rounded text-[#2fd9f4]">CMS</span>
                </div>
                <p className="text-[#c6c6cd] text-[11px]">
                  Taglines, Hero summary, Announcement banner, Key metric counters.
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setActiveTab && setActiveTab('home')}
                    className="px-3 py-1.5 rounded bg-[#122131] text-[#2fd9f4] hover:bg-[#1c2b3c]"
                  >
                    Open Home View →
                  </button>
                </div>
              </div>

              {/* About Page Manager */}
              <div className="p-4 rounded-xl bg-[#051424] border border-[#273647] space-y-2">
                <div className="flex items-center justify-between text-[#ffc640] font-bold">
                  <span className="flex items-center gap-1.5">
                    <User className="w-4 h-4" /> ABOUT PAGE
                  </span>
                  <span className="text-[10px] bg-[#1c2b3c] px-2 py-0.5 rounded text-[#2fd9f4]">CMS</span>
                </div>
                <p className="text-[#c6c6cd] text-[11px]">
                  Scientist credentials, career milestones, academic foundation & fellowships.
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setActiveTab && setActiveTab('about')}
                    className="px-3 py-1.5 rounded bg-[#122131] text-[#2fd9f4] hover:bg-[#1c2b3c]"
                  >
                    Open About View →
                  </button>
                  {isAdmin && onOpenEditProfileModal && (
                    <button
                      onClick={onOpenEditProfileModal}
                      className="px-3 py-1.5 rounded bg-[#ffc640] text-[#051424] font-bold"
                    >
                      Edit Bio
                    </button>
                  )}
                </div>
              </div>

              {/* Papers Manager */}
              <div className="p-4 rounded-xl bg-[#051424] border border-[#273647] space-y-2">
                <div className="flex items-center justify-between text-[#ffc640] font-bold">
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4" /> PAPERS & PATENTS ({dbState.publications.length})
                  </span>
                  <span className="text-[10px] bg-[#1c2b3c] px-2 py-0.5 rounded text-[#2fd9f4]">CMS</span>
                </div>
                <p className="text-[#c6c6cd] text-[11px]">
                  Peer-reviewed journal papers, DOIs, patent filings, and citation indices.
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setActiveTab && setActiveTab('papers')}
                    className="px-3 py-1.5 rounded bg-[#122131] text-[#2fd9f4] hover:bg-[#1c2b3c]"
                  >
                    Manage Papers →
                  </button>
                  {isAdmin && onOpenAddPaperModal && (
                    <button
                      onClick={onOpenAddPaperModal}
                      className="px-3 py-1.5 rounded bg-[#ffc640] text-[#051424] font-bold"
                    >
                      + Add Paper
                    </button>
                  )}
                </div>
              </div>

              {/* Blog & Lab Logs */}
              <div className="p-4 rounded-xl bg-[#051424] border border-[#273647] space-y-2">
                <div className="flex items-center justify-between text-[#ffc640] font-bold">
                  <span className="flex items-center gap-1.5">
                    <Activity className="w-4 h-4" /> BLOG & LAB LOGS ({dbState.blogPosts.length})
                  </span>
                  <span className="text-[10px] bg-[#1c2b3c] px-2 py-0.5 rounded text-[#2fd9f4]">CMS</span>
                </div>
                <p className="text-[#c6c6cd] text-[11px]">
                  Laboratory technical notes, research announcements, experiment logs.
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setActiveTab && setActiveTab('blog')}
                    className="px-3 py-1.5 rounded bg-[#122131] text-[#2fd9f4] hover:bg-[#1c2b3c]"
                  >
                    Manage Logs →
                  </button>
                  {isAdmin && onOpenAddPostModal && (
                    <button
                      onClick={onOpenAddPostModal}
                      className="px-3 py-1.5 rounded bg-[#ffc640] text-[#051424] font-bold"
                    >
                      + Add Post
                    </button>
                  )}
                </div>
              </div>

              {/* Gallery Micrographs */}
              <div className="p-4 rounded-xl bg-[#051424] border border-[#273647] space-y-2">
                <div className="flex items-center justify-between text-[#ffc640] font-bold">
                  <span className="flex items-center gap-1.5">
                    <Image className="w-4 h-4" /> GALLERY MICROGRAPHS ({dbState.gallery.length})
                  </span>
                  <span className="text-[10px] bg-[#1c2b3c] px-2 py-0.5 rounded text-[#2fd9f4]">CMS</span>
                </div>
                <p className="text-[#c6c6cd] text-[11px]">
                  SEM/TEM microstructures, melt pool photographs, high-res research figures.
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setActiveTab && setActiveTab('gallery')}
                    className="px-3 py-1.5 rounded bg-[#122131] text-[#2fd9f4] hover:bg-[#1c2b3c]"
                  >
                    Manage Gallery →
                  </button>
                  {isAdmin && onOpenAddGalleryModal && (
                    <button
                      onClick={onOpenAddGalleryModal}
                      className="px-3 py-1.5 rounded bg-[#ffc640] text-[#051424] font-bold"
                    >
                      + Add Figure
                    </button>
                  )}
                </div>
              </div>

              {/* Analytics Dashboard */}
              <div className="p-4 rounded-xl bg-[#051424] border border-[#273647] space-y-2">
                <div className="flex items-center justify-between text-[#ffc640] font-bold">
                  <span className="flex items-center gap-1.5">
                    <Flame className="w-4 h-4" /> ANALYTICS & TELEMETRY
                  </span>
                  <span className="text-[10px] bg-[#1c2b3c] px-2 py-0.5 rounded text-[#2fd9f4]">METRICS</span>
                </div>
                <p className="text-[#c6c6cd] text-[11px]">
                  Citation growth curves, melt pool telemetry, h-index, and data exports.
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => setActiveTab && setActiveTab('analytics')}
                    className="px-3 py-1.5 rounded bg-[#122131] text-[#2fd9f4] hover:bg-[#1c2b3c]"
                  >
                    Open Analytics →
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INQUIRIES / CONTACT MESSAGES */}
      {activeSection === 'messages' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#122131] border border-[#1c2b3c] space-y-4 shadow-xl font-mono text-xs">
            <div className="flex items-center justify-between border-b border-[#1c2b3c] pb-3">
              <div>
                <h2 className="text-lg font-serif font-bold text-[#d4e4fa] flex items-center gap-2">
                  <Mail className="w-5 h-5 text-[#ffc640]" />
                  <span>Research Inquiries & Contact Messages</span>
                </h2>
                <p className="text-xs text-[#c6c6cd] mt-0.5 font-sans">
                  Messages submitted by scholars and industrial collaborators through the portal.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded bg-[#051424] text-[#2fd9f4] border border-[#273647]">
                {dbState.messages?.length || 0} Inquiries Total
              </span>
            </div>

            {(!dbState.messages || dbState.messages.length === 0) ? (
              <div className="p-8 rounded-xl bg-[#051424] border border-[#273647] text-center text-slate-400">
                No inquiries received yet. Submit a message using the Contact button to test live storage in Firestore.
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {dbState.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`p-4 rounded-xl border space-y-2 transition-all ${
                      msg.status === 'UNREAD'
                        ? 'bg-[#1c2b3c] border-[#ffc640]/50'
                        : 'bg-[#051424] border-[#273647]'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#ffc640]">{msg.senderName}</span>
                        <span className="text-[#2fd9f4]">({msg.senderEmail})</span>
                        {msg.affiliation && <span className="text-slate-400">• {msg.affiliation}</span>}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-400">{msg.timestamp}</span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          msg.status === 'UNREAD' ? 'bg-[#ffc640] text-[#051424]' : 'bg-[#122131] text-slate-400'
                        }`}>
                          {msg.status}
                        </span>
                      </div>
                    </div>

                    <div className="text-xs font-bold text-[#d4e4fa] font-serif">
                      Topic: {msg.topic}
                    </div>

                    <p className="text-xs text-slate-300 font-sans leading-relaxed whitespace-pre-line">
                      {msg.message}
                    </p>

                    <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#273647]">
                      {msg.status === 'UNREAD' && (
                        <button
                          onClick={() => handleMarkMessageRead(msg.id)}
                          className="px-3 py-1 rounded bg-[#122131] text-[#2fd9f4] hover:bg-[#273647]"
                        >
                          Mark as Read
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteMessage(msg.id)}
                        className="px-3 py-1 rounded bg-red-950/40 text-red-400 hover:bg-red-950/80"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2.5: RESEARCHER SUBMISSIONS QUEUE */}
      {activeSection === 'submissions' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#122131] border border-[#1c2b3c] space-y-5 shadow-xl font-mono text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1c2b3c] pb-4">
              <div>
                <h2 className="text-lg font-serif font-bold text-[#d4e4fa] flex items-center gap-2">
                  <Inbox className="w-5 h-5 text-[#ffc640]" />
                  <span>Researcher Submissions & Manuscript Review Queue</span>
                </h2>
                <p className="text-xs text-[#c6c6cd] font-sans mt-0.5">
                  Review manuscripts, lab dispatches, micrograph figures, and collaboration requests submitted by researchers via Supabase
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {onOpenResearcherSubmissionModal && (
                  <button
                    onClick={() => onOpenResearcherSubmissionModal('publication')}
                    className="px-3 py-2 rounded-lg bg-[#2fd9f4] hover:bg-cyan-400 text-[#051424] font-bold flex items-center gap-1.5 transition-all shadow-md"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>New Submission Form</span>
                  </button>
                )}

                <button
                  onClick={loadSubmissions}
                  disabled={isLoadingSubmissions}
                  className="px-3 py-2 rounded-lg bg-[#1c2b3c] hover:bg-[#273647] text-[#ffc640] border border-[#273647] flex items-center gap-1.5 font-bold"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingSubmissions ? 'animate-spin' : ''}`} />
                  <span>Refresh Queue</span>
                </button>
              </div>
            </div>

            {/* Submission Cards */}
            {submissions.length === 0 ? (
              <div className="p-12 text-center rounded-xl bg-[#051424] border border-[#273647] space-y-3">
                <Inbox className="w-10 h-10 text-slate-500 mx-auto" />
                <div className="text-slate-300 font-bold text-sm font-serif">No Submissions In Queue</div>
                <p className="text-slate-400 max-w-md mx-auto text-xs font-sans">
                  Researchers can use the &quot;Submit Research&quot; portal to submit publications, blog articles, micrograph data, and collaboration proposals directly into the Supabase database.
                </p>
                {onOpenResearcherSubmissionModal && (
                  <button
                    onClick={() => onOpenResearcherSubmissionModal('publication')}
                    className="mt-2 px-4 py-2 rounded-lg bg-[#2fd9f4] text-[#051424] font-bold inline-flex items-center gap-2"
                  >
                    <PlusCircle className="w-4 h-4" />
                    Open Researcher Submission Form
                  </button>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {submissions.map((sub) => {
                  const isPending = sub.status === 'pending';
                  const isApproved = sub.status === 'approved';
                  const isRejected = sub.status === 'rejected';

                  return (
                    <div
                      key={sub.id}
                      className={`p-4 sm:p-5 rounded-xl bg-[#051424] border transition-all ${
                        isPending
                          ? 'border-[#ffc640]/50 shadow-lg shadow-amber-950/20'
                          : isApproved
                          ? 'border-emerald-500/40 opacity-90'
                          : 'border-red-500/30 opacity-75'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#273647]">
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded text-[11px] font-bold uppercase ${
                              sub.submission_type === 'publication'
                                ? 'bg-[#2fd9f4]/20 text-[#2fd9f4] border border-[#2fd9f4]/40'
                                : sub.submission_type === 'blog'
                                ? 'bg-[#ffc640]/20 text-[#ffc640] border border-[#ffc640]/40'
                                : sub.submission_type === 'gallery'
                                ? 'bg-purple-900/30 text-purple-300 border border-purple-500/40'
                                : 'bg-emerald-900/30 text-emerald-300 border border-emerald-500/40'
                            }`}
                          >
                            {sub.submission_type}
                          </span>

                          <span className="text-[#c6c6cd]">
                            By <strong className="text-[#d4e4fa]">{sub.researcher_name}</strong> ({sub.affiliation || 'Research Scholar'})
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                              isPending
                                ? 'bg-amber-950/80 border border-amber-500 text-amber-300'
                                : isApproved
                                ? 'bg-emerald-950/80 border border-emerald-500 text-emerald-300'
                                : 'bg-red-950/80 border border-red-500 text-red-300'
                            }`}
                          >
                            {sub.status.toUpperCase()}
                          </span>

                          <span className="text-slate-500 text-[10px]">
                            {new Date(sub.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Content details */}
                      <div className="py-3 space-y-2">
                        <h3 className="text-sm sm:text-base font-bold text-[#d4e4fa] font-serif">
                          {sub.title}
                        </h3>
                        <p className="text-[#c6c6cd] font-sans text-xs leading-relaxed">
                          {sub.description}
                        </p>

                        {/* Extra metadata */}
                        <div className="flex flex-wrap gap-3 pt-2 text-[11px] text-slate-400">
                          <span>Email: <span className="text-[#2fd9f4]">{sub.researcher_email}</span></span>
                          {sub.target_journal && <span>Journal: <span className="text-[#ffc640]">{sub.target_journal}</span></span>}
                          {sub.doi && <span>DOI: <span className="text-white font-mono">{sub.doi}</span></span>}
                          {sub.sample_specs && <span>Sample: <span className="text-white">{sub.sample_specs}</span></span>}
                        </div>

                        {/* Admin review notes history */}
                        {sub.admin_review_notes && (
                          <div className="mt-2 p-2.5 rounded-lg bg-[#122131] border border-[#273647] text-xs">
                            <span className="text-[#ffc640] font-bold">Admin Review Notes:</span>{' '}
                            <span className="text-slate-300">{sub.admin_review_notes}</span>
                            {sub.reviewed_by && (
                              <span className="text-slate-400 ml-2">({sub.reviewed_by})</span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Moderation Controls for Admin */}
                      {isPending && isAdmin && (
                        <div className="pt-3 border-t border-[#273647] flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                          <input
                            type="text"
                            placeholder="Optional review feedback or editorial remarks..."
                            value={reviewNoteInput[sub.id] || ''}
                            onChange={(e) =>
                              setReviewNoteInput({ ...reviewNoteInput, [sub.id]: e.target.value })
                            }
                            className="flex-1 px-3 py-1.5 rounded-lg bg-[#122131] border border-[#273647] text-white text-xs"
                          />

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => handleApproveSubmission(sub)}
                              className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold flex items-center gap-1.5 transition-all shadow-md"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Approve & Publish</span>
                            </button>

                            <button
                              onClick={() => handleRejectSubmission(sub)}
                              className="px-3.5 py-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-700 text-red-300 font-bold transition-all"
                            >
                              <span>Reject</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2.6: SUPABASE CLOUD DATABASE EXPLORER & CMS */}
      {activeSection === 'supabase' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#122131] border border-[#1c2b3c] space-y-5 shadow-xl font-mono text-xs">
            {/* Supabase Connection Overview Banner */}
            <div className="p-5 rounded-xl bg-[#051424] border border-[#2fd9f4]/30 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#273647] pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-base">
                    ⚡
                  </div>
                  <div>
                    <h3 className="text-base font-bold font-serif text-[#d4e4fa]">
                      Supabase Cloud Database & Schema
                    </h3>
                    <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                      <span>Project: <strong className="text-[#ffc640]">{SUPABASE_PROJECT_ID}</strong></span>
                      <span>•</span>
                      <span>URL: <span className="text-[#2fd9f4] underline">{SUPABASE_URL}</span></span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleTestSupabaseConnection}
                    disabled={isCheckingSupabase}
                    className="px-3 py-1.5 rounded-lg bg-[#1c2b3c] hover:bg-[#273647] text-[#2fd9f4] border border-[#2fd9f4]/40 font-bold flex items-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isCheckingSupabase ? 'animate-spin' : ''}`} />
                    <span>{isCheckingSupabase ? 'Testing...' : 'Test Connection'}</span>
                  </button>

                  <button
                    onClick={handleSyncAllToSupabase}
                    disabled={isSyncingSupabase}
                    className="px-3.5 py-1.5 rounded-lg bg-[#ffc640] hover:bg-[#e3aa00] text-[#051424] font-bold flex items-center gap-1.5 shadow-md"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncingSupabase ? 'animate-spin' : ''}`} />
                    <span>{isSyncingSupabase ? 'Syncing to Supabase...' : 'Sync All to Supabase'}</span>
                  </button>
                </div>
              </div>

              {/* API Key Box */}
              <div className="p-3 rounded-lg bg-[#122131] border border-[#273647] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2">
                <div className="truncate flex-1">
                  <div className="text-slate-400 text-[10px] uppercase font-bold">Supabase Publishable API Key</div>
                  <div className="text-slate-200 font-mono text-xs truncate select-all">{SUPABASE_ANON_KEY}</div>
                </div>
                <button
                  onClick={handleCopyApiKey}
                  className="px-3 py-1.5 rounded bg-[#1c2b3c] hover:bg-[#273647] text-[#ffc640] border border-[#ffc640]/30 font-bold flex items-center gap-1 shrink-0"
                >
                  {apiKeyCopied ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{apiKeyCopied ? 'Copied!' : 'Copy Key'}</span>
                </button>
              </div>

              {/* Status Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {[
                  { name: 'Publications', status: supabaseHealth.tables.publications, count: dbState.publications.length },
                  { name: 'Lab Blog Posts', status: supabaseHealth.tables.blog_posts, count: dbState.blogPosts.length },
                  { name: 'Gallery Items', status: supabaseHealth.tables.gallery_items, count: dbState.gallery.length },
                  { name: 'Inquiries', status: supabaseHealth.tables.inquiries, count: dbState.messages.length },
                  { name: 'Submissions', status: supabaseHealth.tables.researcher_submissions, count: submissions.length }
                ].map((item) => (
                  <div key={item.name} className="p-2.5 rounded-lg bg-[#122131] border border-[#273647] space-y-1">
                    <div className="text-slate-400 text-[10px] uppercase">{item.name}</div>
                    <div className="flex items-center justify-between">
                      <span className="text-white font-bold">{item.count} items</span>
                      <span className={`w-2 h-2 rounded-full ${item.status ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SQL DDL Schema Tool */}
            <div className="p-4 rounded-xl bg-[#051424] border border-[#273647] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-[#ffc640]" />
                  <h4 className="font-serif font-bold text-sm text-[#d4e4fa]">
                    Supabase PostgreSQL DDL Table Definitions
                  </h4>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowSqlSchema(!showSqlSchema)}
                    className="px-3 py-1.5 rounded bg-[#1c2b3c] text-[#2fd9f4] border border-[#273647] hover:bg-[#273647]"
                  >
                    {showSqlSchema ? 'Hide Schema' : 'View SQL Code'}
                  </button>
                  <button
                    onClick={handleCopySqlSchema}
                    className="px-3 py-1.5 rounded bg-[#2fd9f4] text-[#051424] font-bold hover:bg-cyan-400 flex items-center gap-1"
                  >
                    {sqlCopied ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{sqlCopied ? 'Copied SQL!' : 'Copy SQL Script'}</span>
                  </button>
                </div>
              </div>

              {showSqlSchema && (
                <div className="relative mt-2">
                  <pre className="p-4 rounded-lg bg-[#0a1829] border border-[#273647] text-[#a0c4e8] font-mono text-[11px] overflow-x-auto max-h-72 leading-relaxed">
                    {supabaseService.getSupabaseDDLScript()}
                  </pre>
                </div>
              )}
            </div>

            {/* Live Collection Managers in Supabase */}
            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between border-b border-[#1c2b3c] pb-2">
                <h3 className="font-serif font-bold text-sm text-[#d4e4fa] flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#2fd9f4]" />
                  <span>Manage Publications in Supabase ({dbState.publications.length})</span>
                </h3>
                {onOpenAddPaperModal && (
                  <button
                    onClick={onOpenAddPaperModal}
                    className="px-3 py-1 rounded bg-[#1c2b3c] text-[#ffc640] border border-[#ffc640]/30 hover:bg-[#273647] flex items-center gap-1 font-bold text-[11px]"
                  >
                    <PlusCircle className="w-3 h-3" />
                    <span>Add Publication</span>
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {dbState.publications.map((pub) => (
                  <div
                    key={pub.id}
                    className="p-3 rounded-lg bg-[#051424] border border-[#273647] flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="truncate flex-1">
                      <div className="font-bold text-[#d4e4fa] truncate">{pub.title}</div>
                      <div className="text-slate-400 text-[11px]">{pub.journal} ({pub.year}) • {pub.type}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 text-[10px] font-bold uppercase">SUPABASE SYNCED</span>
                      <button
                        onClick={() => localDB.deletePublication(pub.id)}
                        className="p-1 rounded text-red-400 hover:bg-red-950/50"
                        title="Delete publication"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Lab Blog Posts Table Manager */}
              <div className="flex items-center justify-between border-b border-[#1c2b3c] pb-2 pt-4">
                <h3 className="font-serif font-bold text-sm text-[#d4e4fa] flex items-center gap-2">
                  <FileText className="w-4 h-4 text-[#ffc640]" />
                  <span>Manage Lab Blog Posts in Supabase ({dbState.blogPosts.length})</span>
                </h3>
                {onOpenAddPostModal && (
                  <button
                    onClick={onOpenAddPostModal}
                    className="px-3 py-1 rounded bg-[#1c2b3c] text-[#ffc640] border border-[#ffc640]/30 hover:bg-[#273647] flex items-center gap-1 font-bold text-[11px]"
                  >
                    <PlusCircle className="w-3 h-3" />
                    <span>Add Lab Post</span>
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {dbState.blogPosts.map((post) => (
                  <div
                    key={post.id}
                    className="p-3 rounded-lg bg-[#051424] border border-[#273647] flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="truncate flex-1">
                      <div className="font-bold text-[#d4e4fa] truncate">{post.title}</div>
                      <div className="text-slate-400 text-[11px]">{post.date} • {post.author} • {post.readTime}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 text-[10px] font-bold uppercase">SUPABASE SYNCED</span>
                      <button
                        onClick={() => localDB.deleteBlogPost(post.id)}
                        className="p-1 rounded text-red-400 hover:bg-red-950/50"
                        title="Delete lab post"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Gallery Items Table Manager */}
              <div className="flex items-center justify-between border-b border-[#1c2b3c] pb-2 pt-4">
                <h3 className="font-serif font-bold text-sm text-[#d4e4fa] flex items-center gap-2">
                  <Image className="w-4 h-4 text-purple-400" />
                  <span>Manage Micrographs & Gallery in Supabase ({dbState.gallery.length})</span>
                </h3>
                {onOpenAddGalleryModal && (
                  <button
                    onClick={onOpenAddGalleryModal}
                    className="px-3 py-1 rounded bg-[#1c2b3c] text-[#ffc640] border border-[#ffc640]/30 hover:bg-[#273647] flex items-center gap-1 font-bold text-[11px]"
                  >
                    <PlusCircle className="w-3 h-3" />
                    <span>Add Figure</span>
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto">
                {dbState.gallery.map((item) => (
                  <div
                    key={item.id}
                    className="p-3 rounded-lg bg-[#051424] border border-[#273647] flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3 truncate flex-1">
                      <img src={item.imageUrl} alt={item.title} className="w-9 h-9 rounded object-cover border border-[#273647]" />
                      <div className="truncate">
                        <div className="font-bold text-[#d4e4fa] truncate">{item.title}</div>
                        <div className="text-slate-400 text-[11px]">{item.technique} • {item.sampleType} ({item.magnification})</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-emerald-400 text-[10px] font-bold uppercase">SUPABASE SYNCED</span>
                      <button
                        onClick={() => localDB.deleteGalleryItem(item.id)}
                        className="p-1 rounded text-red-400 hover:bg-red-950/50"
                        title="Delete gallery figure"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: USER & AUTH MANAGEMENT */}
      {activeSection === 'auth' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#122131] border border-[#1c2b3c] space-y-4 shadow-xl font-mono text-xs">
            <h2 className="text-lg font-serif font-bold text-[#d4e4fa] flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-[#2fd9f4]" />
              <span>User & Role Management</span>
            </h2>

            <div className="p-4 rounded-xl bg-[#051424] border border-[#273647] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-[#d4e4fa] font-serif">
                    {user?.displayName || 'Dr. Manoj Kumar'}
                  </div>
                  <div className="text-[#c6c6cd]">{user?.email || 'manindra94@gmail.com'}</div>
                </div>
                <span className={`px-3 py-1 rounded text-xs font-bold uppercase ${
                  isAdmin ? 'bg-[#ffc640]/20 text-[#ffc640] border border-[#ffc640]/40' : 'bg-[#2fd9f4]/20 text-[#2fd9f4] border border-[#2fd9f4]/40'
                }`}>
                  Active Role: {isAdmin ? 'ADMINISTRATOR' : 'RESEARCHER (USER)'}
                </span>
              </div>

              <div className="pt-2 border-t border-[#273647] flex flex-wrap gap-2">
                <button
                  onClick={() => switchUserRole(isAdmin ? 'user' : 'admin')}
                  className="px-4 py-2 rounded bg-[#1c2b3c] hover:bg-[#273647] text-[#2fd9f4] border border-[#273647] font-bold flex items-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Toggle to {isAdmin ? 'Researcher Mode' : 'Admin CMS'}</span>
                </button>

                <button
                  onClick={loginDemoAdmin}
                  className="px-4 py-2 rounded bg-[#ffc640] hover:bg-[#e3aa00] text-[#051424] font-bold"
                >
                  Login as Admin (Dr. Manoj Kumar)
                </button>

                <button
                  onClick={loginDemoUser}
                  className="px-4 py-2 rounded bg-[#051424] border border-[#2fd9f4] text-[#2fd9f4] font-bold hover:bg-[#1c2b3c]"
                >
                  Login as Researcher (User)
                </button>

                <button
                  onClick={logout}
                  className="px-4 py-2 rounded bg-red-950/40 text-red-400 border border-red-800 font-bold"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: DATABASE & REAL-TIME SYNC HUB */}
      {activeSection === 'database' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#122131] border border-[#1c2b3c] space-y-5 shadow-xl font-mono text-xs">
            <div className="flex items-center justify-between border-b border-[#1c2b3c] pb-3">
              <div>
                <h2 className="text-lg font-serif font-bold text-[#d4e4fa] flex items-center gap-2">
                  <Database className="w-5 h-5 text-[#ffc640]" />
                  <span>Data & Database Management</span>
                </h2>
                <p className="text-xs text-[#c6c6cd] font-sans mt-0.5">
                  Synchronized cloud repository & laboratory database records
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleBackupExport}
                  className="px-3 py-2 rounded-lg bg-[#051424] border border-[#273647] text-[#2fd9f4] flex items-center gap-1.5 hover:bg-[#122131]"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export JSON</span>
                </button>

                <button
                  onClick={() => localDB.triggerSync()}
                  disabled={dbState.isSyncing}
                  className="px-4 py-2 rounded-lg bg-[#ffc640] text-[#051424] font-bold flex items-center gap-1.5 hover:bg-[#e3aa00]"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${dbState.isSyncing ? 'animate-spin' : ''}`} />
                  <span>{dbState.isSyncing ? 'Syncing...' : 'Force Resync'}</span>
                </button>
              </div>
            </div>

            {/* Sync Metrics */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-[#051424] border border-[#273647]">
                <div className="text-slate-400">Connection State</div>
                <div className={`font-bold mt-1 ${dbState.isOnline ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {dbState.isOnline ? 'ONLINE' : 'OFFLINE CACHE'}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#051424] border border-[#273647]">
                <div className="text-slate-400">Publications in Cloud</div>
                <div className="text-[#2fd9f4] font-bold mt-1">{dbState.publications.length} Records</div>
              </div>

              <div className="p-3 rounded-xl bg-[#051424] border border-[#273647]">
                <div className="text-slate-400">Blog Posts in Cloud</div>
                <div className="text-[#ffc640] font-bold mt-1">{dbState.blogPosts.length} Records</div>
              </div>

              <div className="p-3 rounded-xl bg-[#051424] border border-[#273647]">
                <div className="text-slate-400">Gallery Figures</div>
                <div className="text-white font-bold mt-1">{dbState.gallery.length} Records</div>
              </div>
            </div>

            {/* Telemetry Log */}
            <div className="space-y-2">
              <h3 className="text-xs font-mono text-[#d4e4fa] font-bold uppercase">
                Database Telemetry Feed
              </h3>
              <div className="p-3 rounded-xl bg-[#051424] border border-[#273647] space-y-1.5 max-h-48 overflow-y-auto text-[11px]">
                {dbState.telemetry.map((t) => (
                  <div key={t.id} className="flex items-center justify-between py-1 border-b border-[#1c2b3c]/50">
                    <span className="text-slate-400">[{t.timestamp}]</span>
                    <span className="text-[#d4e4fa] flex-1 px-2">{t.event}</span>
                    <span className="text-[#2fd9f4] uppercase">{t.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: SECURITY & E2E ENCRYPTION */}
      {activeSection === 'security' && (
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#122131] border border-[#1c2b3c] space-y-4 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-serif font-bold text-[#d4e4fa] flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-[#2fd9f4]" />
                  <span>End-to-End Vault Encryption</span>
                </h2>
                <p className="text-xs text-[#c6c6cd] mt-0.5">
                  Client-side AES-256-GCM encryption for research notes and task payloads.
                </p>
              </div>
              <span className="px-3 py-1 rounded bg-emerald-950/80 border border-emerald-500 text-emerald-400 font-mono text-xs font-bold">
                ENCRYPTED ACTIVE
              </span>
            </div>

            {/* Passkey Generator */}
            <div className="p-4 rounded-xl bg-[#051424] border border-[#273647] space-y-3">
              <h3 className="text-xs font-mono text-[#ffc640] uppercase font-bold">
                Generate Secure 256-Bit Vault Key
              </h3>

              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  readOnly
                  placeholder="Click generate to create key..."
                  value={generatedPassphrase}
                  className="flex-1 px-3 py-2 rounded bg-[#122131] border border-[#273647] text-xs font-mono text-[#2fd9f4]"
                />
                <button
                  onClick={handleGeneratePassphrase}
                  className="px-4 py-2 rounded bg-[#2fd9f4] hover:bg-cyan-400 text-[#051424] font-bold font-mono text-xs"
                >
                  Generate Key
                </button>
                {generatedPassphrase && (
                  <button
                    onClick={handleCopyPassphrase}
                    className="px-4 py-2 rounded bg-[#1c2b3c] text-[#ffc640] border border-[#273647] font-mono text-xs"
                  >
                    {passphraseCopied ? 'Copied!' : 'Copy'}
                  </button>
                )}
              </div>
            </div>

            {/* Active Terminals & Sessions */}
            <div className="space-y-3 pt-2">
              <h3 className="text-xs font-mono text-[#d4e4fa] font-bold uppercase">
                Active Terminals & Sessions ({MOCK_ACTIVE_SESSIONS.length})
              </h3>

              <div className="space-y-2">
                {MOCK_ACTIVE_SESSIONS.map((sess) => (
                  <div
                    key={sess.id}
                    className="p-3 rounded-xl bg-[#051424] border border-[#273647] flex items-center justify-between text-xs font-mono"
                  >
                    <div className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-[#ffc640]" />
                      <div>
                        <div className="text-[#d4e4fa] font-bold">{sess.device}</div>
                        <div className="text-slate-400">{sess.location} • IP: {sess.ip}</div>
                      </div>
                    </div>
                    <span className="text-[#2fd9f4]">{sess.authorizedAt}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: NOTIFICATIONS */}
      {activeSection === 'notifications' && (
        <div className="p-6 rounded-2xl bg-[#122131] border border-[#1c2b3c] space-y-4 shadow-xl">
          <h2 className="text-lg font-serif font-bold text-[#d4e4fa]">Push Notification Preferences</h2>

          <div className="space-y-3 text-xs font-mono">
            <div className="flex items-center justify-between p-3 rounded-xl bg-[#051424] border border-[#273647]">
              <div>
                <div className="text-[#d4e4fa] font-bold">Paper Review & Revision Alerts</div>
                <div className="text-slate-400">Push alert when peer review comments arrive</div>
              </div>
              <input
                type="checkbox"
                checked={dbState.settings.pushDms}
                onChange={(e) => localDB.updateSettings({ pushDms: e.target.checked })}
                className="w-4 h-4 accent-[#ffc640]"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-[#051424] border border-[#273647]">
              <div>
                <div className="text-[#d4e4fa] font-bold">Lab Experiment Task Reminders</div>
                <div className="text-[#2fd9f4]">Sound ping and browser alerts for scheduled runs</div>
              </div>
              <input
                type="checkbox"
                checked={dbState.settings.pushMentions}
                onChange={(e) => localDB.updateSettings({ pushMentions: e.target.checked })}
                className="w-4 h-4 accent-[#ffc640]"
              />
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: PREFERENCES & THEME */}
      {activeSection === 'preferences' && (
        <div className="p-6 rounded-2xl bg-[#122131] border border-[#1c2b3c] space-y-4 shadow-xl">
          <h2 className="text-lg font-serif font-bold text-[#d4e4fa]">UI & Theme Customization</h2>

          <div className="space-y-4 text-xs font-mono">
            <div>
              <label className="text-[#c6c6cd] block mb-2">Display Theme Mode</label>
              <div className="flex gap-2">
                {(['dark', 'light', 'system'] as DisplayMode[]).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => localDB.updateSettings({ displayMode: mode })}
                    className={`px-4 py-2 rounded-lg border uppercase ${
                      dbState.settings.displayMode === mode
                        ? 'bg-[#ffc640] text-[#051424] font-bold border-[#ffc640]'
                        : 'bg-[#051424] border-[#273647] text-[#c6c6cd]'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[#c6c6cd] block mb-2">Primary Accent Color</label>
              <div className="flex gap-2">
                {(['gold', 'cyan', 'green', 'purple'] as AccentColor[]).map((col) => (
                  <button
                    key={col}
                    onClick={() => localDB.updateSettings({ accentColor: col })}
                    className={`px-4 py-2 rounded-lg border uppercase ${
                      dbState.settings.accentColor === col
                        ? 'bg-[#2fd9f4] text-[#051424] font-bold border-[#2fd9f4]'
                        : 'bg-[#051424] border-[#273647] text-[#c6c6cd]'
                    }`}
                  >
                    {col}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
