export type ActiveTab = 'home' | 'about' | 'papers' | 'blog' | 'gallery' | 'settings' | 'analytics';

export type DisplayMode = 'dark' | 'light' | 'system';
export type AccentColor = 'gold' | 'cyan' | 'green' | 'purple';

export interface Publication {
  id: string;
  title: string;
  type: 'Journal' | 'Patent' | 'Conference';
  year: number;
  doi?: string;
  patentNo?: string;
  confProc?: string;
  authors: string;
  journal: string;
  abstract: string;
  tags: string[];
  citations: number;
  url: string;
  coverImage?: string;
  isSavedOffline?: boolean;
  userNotes?: string | { [userId: string]: string };
}

export interface BlogComment {
  id: string;
  userId?: string;
  userName?: string;
  authorName?: string;
  userRole?: string;
  authorRole?: string;
  text?: string;
  content?: string;
  date?: string;
  timestamp?: string;
  userAvatar?: string;
}

export interface BlogPost {
  id: string;
  logCode: string; // e.g. LOG_042_IMMT
  title: string;
  excerpt: string;
  content: string;
  date: string;
  status: 'PUBLISHED' | 'DRAFTING' | 'INTERNAL_REVIEW';
  readTime: string;
  tags: string[];
  imageUrl?: string;
  coverImage?: string;
  isFeatured?: boolean;
  isSavedOffline?: boolean;
  likesCount?: number;
  likedBy?: string[];
  comments?: BlogComment[];
}

export interface CareerMilestone {
  period: string;
  title: string;
  institution: string;
  description: string;
  isCurrent?: boolean;
}

export interface AcademicDegree {
  period: string;
  degree: string;
  institution: string;
  field: string;
  description: string;
}

export interface AwardItem {
  year: string;
  title: string;
  description: string;
}

export interface GalleryItem {
  id: string;
  title: string;
  figureNo?: string;
  category: 'Cladding' | '3D Printing' | 'Microstructure' | 'Reactor' | 'SEM Scan' | string;
  imageUrl: string;
  description: string;
  scaleBar?: string;
  userNotes?: string | { [userId: string]: string };
  isSavedOffline?: boolean;
}

export interface DatasetRequest {
  id: string;
  paperId?: string;
  paperTitle?: string;
  requesterName: string;
  requesterEmail: string;
  institution?: string;
  datasetName?: string;
  purpose: string;
  date?: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'pending' | 'approved' | 'rejected';
}

export interface TechnicalVertical {
  title: string;
  category: string;
  description: string;
  methods: string[];
}

export interface ActiveSession {
  id: string;
  device: string;
  ip: string;
  location: string;
  authorizedAt: string;
  isCurrent: boolean;
  status: 'active' | 'idle' | 'terminated';
}

export interface TaskReminder {
  id: string;
  title: string;
  category: 'Research' | 'Paper Review' | 'Lab Experiment' | 'Grant Update';
  dueTime: string;
  priority: 'High' | 'Medium' | 'Normal';
  completed: boolean;
  encryptedPayload?: string;
}

export interface TelemetryLog {
  id: string;
  action?: string;
  event?: string;
  category?: 'system' | 'auth' | 'publication' | 'blog' | 'gallery' | 'analytics' | 'settings' | string;
  type?: string;
  status: 'success' | 'warning' | 'error' | 'info';
  timestamp: string;
  details?: string;
}

export interface SystemSettings {
  displayMode: DisplayMode;
  accentColor: AccentColor;
  language: string;
  dataRegion: string;
  currency: string;
  timezone: string;
  typographyScale: number;
  highContrast: boolean;
  screenReaderOpt: boolean;
  autoPlayMedia: boolean;
  dataSaverMode: boolean;
  hardwarePasskeys: boolean;
  twoFactorAuth: boolean;
  globalDnd: boolean;
  dndSchedule: string;
  pushDms: boolean;
  pushMentions?: boolean;
  pushLikes?: boolean;
  deliveryFrequency?: string;
  publicProfile?: boolean;
  showResearchOutput?: boolean;
  cameraAccess?: boolean;
  microphoneAccess?: boolean;
  offlineSyncEnabled?: boolean;
  e2eEncryptionEnabled?: boolean;
  alertSound?: string;
  compactCards?: boolean;
  codeHighlights?: boolean;
  analyticsOptIn?: boolean;
  syncIntervalSec?: number;
  bandwidthTier?: string;
}

export interface ScientistProfile {
  name: string;
  title: string;
  organization: string;
  location: string;
  heroTagline: string;
  heroDescription: string;
  bio: string;
  avatarUrl: string;
  email: string;
  phone: string;
  scholarId: string;
  orcid: string;
  scopusId: string;
  github: string;
  linkedin: string;
  stats: {
    yearsExperience: string;
    patentsFiled: string;
    publications: string;
    citations: string;
    affiliation: string;
  };
}

export interface AnalyticsData {
  hIndex: number;
  i10Index: number;
  totalCitations: number;
  globalReaders: number;
  annualOutputs: { [year: string]: number };
}
