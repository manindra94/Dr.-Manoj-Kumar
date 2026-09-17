import fs from 'fs';
import path from 'path';
import {
  MANOJ_KUMAR_PROFILE,
  MOCK_HOMEPAGE_CONTENT,
  MOCK_TECHNICAL_VERTICALS,
  MOCK_PUBLICATIONS,
  MOCK_BLOG_POSTS,
  MOCK_CAREER_JOURNEY,
  MOCK_ACADEMIC_FOUNDATION,
  MOCK_AWARDS,
  MOCK_GALLERY,
  MOCK_ACTIVE_SESSIONS,
  MOCK_TASK_REMINDERS,
  DEFAULT_SETTINGS,
  MOCK_TELEMETRY,
  MOCK_ANALYTICS,
  MOCK_MESSAGES
} from './mockData';

export interface StoredPublication {
  id: string;
  title: string;
  type: string;
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
  userNotes?: string;
}

export interface StoredGalleryItem {
  id: string;
  title: string;
  figureNo?: string;
  category: string;
  imageUrl: string;
  description: string;
  scaleBar?: string;
  userNotes?: string;
  isSavedOffline?: boolean;
}

interface DatabaseSchema {
  profile: typeof MANOJ_KUMAR_PROFILE;
  homepageContent: typeof MOCK_HOMEPAGE_CONTENT;
  technicalVerticals: typeof MOCK_TECHNICAL_VERTICALS;
  publications: StoredPublication[];
  blogPosts: typeof MOCK_BLOG_POSTS;
  careerJourney: typeof MOCK_CAREER_JOURNEY;
  academicFoundation: typeof MOCK_ACADEMIC_FOUNDATION;
  awards: typeof MOCK_AWARDS;
  gallery: StoredGalleryItem[];
  sessions: typeof MOCK_ACTIVE_SESSIONS;
  tasks: typeof MOCK_TASK_REMINDERS;
  settings: typeof DEFAULT_SETTINGS;
  telemetry: typeof MOCK_TELEMETRY;
  analytics: typeof MOCK_ANALYTICS;
  messages: typeof MOCK_MESSAGES;
}

class BackendStorageEngine {
  private data: DatabaseSchema;
  private storageFilePath: string;
  private saveTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.storageFilePath = path.join(process.cwd(), '.server-data.json');
    this.data = this.loadInitialData();
  }

  private loadInitialData(): DatabaseSchema {
    try {
      if (fs.existsSync(this.storageFilePath)) {
        const raw = fs.readFileSync(this.storageFilePath, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          profile: parsed.profile || { ...MANOJ_KUMAR_PROFILE },
          homepageContent: parsed.homepageContent || { ...MOCK_HOMEPAGE_CONTENT },
          technicalVerticals: parsed.technicalVerticals || [...MOCK_TECHNICAL_VERTICALS],
          publications: parsed.publications || [...MOCK_PUBLICATIONS],
          blogPosts: parsed.blogPosts || [...MOCK_BLOG_POSTS],
          careerJourney: parsed.careerJourney || [...MOCK_CAREER_JOURNEY],
          academicFoundation: parsed.academicFoundation || [...MOCK_ACADEMIC_FOUNDATION],
          awards: parsed.awards || [...MOCK_AWARDS],
          gallery: parsed.gallery || [...MOCK_GALLERY],
          sessions: parsed.sessions || [...MOCK_ACTIVE_SESSIONS],
          tasks: parsed.tasks || [...MOCK_TASK_REMINDERS],
          settings: parsed.settings || { ...DEFAULT_SETTINGS },
          telemetry: parsed.telemetry || [...MOCK_TELEMETRY],
          analytics: parsed.analytics || { ...MOCK_ANALYTICS },
          messages: parsed.messages || [...MOCK_MESSAGES]
        };
      }
    } catch (err) {
      console.warn('[Storage] Failed to read cached data, falling back to defaults:', err);
    }

    return {
      profile: { ...MANOJ_KUMAR_PROFILE },
      homepageContent: { ...MOCK_HOMEPAGE_CONTENT },
      technicalVerticals: [...MOCK_TECHNICAL_VERTICALS],
      publications: [...MOCK_PUBLICATIONS],
      blogPosts: [...MOCK_BLOG_POSTS],
      careerJourney: [...MOCK_CAREER_JOURNEY],
      academicFoundation: [...MOCK_ACADEMIC_FOUNDATION],
      awards: [...MOCK_AWARDS],
      gallery: [...MOCK_GALLERY],
      sessions: [...MOCK_ACTIVE_SESSIONS],
      tasks: [...MOCK_TASK_REMINDERS],
      settings: { ...DEFAULT_SETTINGS },
      telemetry: [...MOCK_TELEMETRY],
      analytics: { ...MOCK_ANALYTICS },
      messages: [...MOCK_MESSAGES]
    };
  }

  private scheduleSave(): void {
    if (this.saveTimeout) clearTimeout(this.saveTimeout);
    this.saveTimeout = setTimeout(() => {
      try {
        fs.writeFileSync(this.storageFilePath, JSON.stringify(this.data, null, 2), 'utf-8');
      } catch (err) {
        console.warn('[Storage] Could not write to server file (in-memory remains active):', err);
      }
    }, 200);
  }

  // --- Bootstrap Full Payload ---
  public getBootstrapData() {
    return { ...this.data };
  }

  public resetToDefaults() {
    this.data = {
      profile: { ...MANOJ_KUMAR_PROFILE },
      homepageContent: { ...MOCK_HOMEPAGE_CONTENT },
      technicalVerticals: [...MOCK_TECHNICAL_VERTICALS],
      publications: [...MOCK_PUBLICATIONS],
      blogPosts: [...MOCK_BLOG_POSTS],
      careerJourney: [...MOCK_CAREER_JOURNEY],
      academicFoundation: [...MOCK_ACADEMIC_FOUNDATION],
      awards: [...MOCK_AWARDS],
      gallery: [...MOCK_GALLERY],
      sessions: [...MOCK_ACTIVE_SESSIONS],
      tasks: [...MOCK_TASK_REMINDERS],
      settings: { ...DEFAULT_SETTINGS },
      telemetry: [
        {
          id: `tel-${Date.now()}`,
          timestamp: new Date().toISOString(),
          event: "Database reset to factory scientific initial state",
          type: "system",
          status: "info"
        },
        ...MOCK_TELEMETRY
      ],
      analytics: { ...MOCK_ANALYTICS },
      messages: [...MOCK_MESSAGES]
    };
    this.scheduleSave();
    return this.data;
  }

  // --- Profile ---
  public getProfile() {
    return this.data.profile;
  }

  public updateProfile(patch: Partial<typeof MANOJ_KUMAR_PROFILE>) {
    this.data.profile = {
      ...this.data.profile,
      ...patch,
      stats: {
        ...this.data.profile.stats,
        ...(patch.stats || {})
      },
      links: {
        ...this.data.profile.links,
        ...(patch.links || {})
      }
    };
    this.scheduleSave();
    return this.data.profile;
  }

  // --- Homepage Content ---
  public getHomepageContent() {
    return {
      ...this.data.homepageContent,
      featuredVerticals: this.data.technicalVerticals
    };
  }

  public updateHomepageContent(patch: Partial<typeof MOCK_HOMEPAGE_CONTENT>) {
    this.data.homepageContent = {
      ...this.data.homepageContent,
      ...patch
    };
    this.scheduleSave();
    return this.data.homepageContent;
  }

  // --- Technical Verticals ---
  public getTechnicalVerticals() {
    return this.data.technicalVerticals;
  }

  public updateTechnicalVerticals(verticals: typeof MOCK_TECHNICAL_VERTICALS) {
    this.data.technicalVerticals = verticals;
    this.scheduleSave();
    return this.data.technicalVerticals;
  }

  // --- Publications ---
  public getPublications(filter?: { type?: string; tag?: string; search?: string; year?: number }) {
    let list = [...this.data.publications];
    if (filter?.type && filter.type !== 'All') {
      list = list.filter((p) => p.type.toLowerCase() === filter.type!.toLowerCase());
    }
    if (filter?.tag) {
      list = list.filter((p) => p.tags.some((t) => t.toLowerCase() === filter.tag!.toLowerCase()));
    }
    if (filter?.year) {
      list = list.filter((p) => p.year === Number(filter.year));
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter((p) =>
        p.title.toLowerCase().includes(q) ||
        p.abstract.toLowerCase().includes(q) ||
        p.authors.toLowerCase().includes(q) ||
        p.journal.toLowerCase().includes(q)
      );
    }
    return list;
  }

  public getPublicationById(id: string) {
    return this.data.publications.find((p) => p.id === id);
  }

  public addPublication(item: any) {
    const id = item.id || `pub-${Date.now()}`;
    const newPub = {
      id,
      title: item.title || 'Untitled Publication',
      type: item.type || 'Journal',
      year: item.year || new Date().getFullYear(),
      doi: item.doi || '',
      patentNo: item.patentNo || '',
      confProc: item.confProc || '',
      authors: item.authors || 'Dr. Manoj Kumar',
      journal: item.journal || 'Materials & Additive Manufacturing Review',
      abstract: item.abstract || '',
      tags: item.tags || ['Additive Manufacturing'],
      citations: item.citations || 0,
      url: item.url || (item.doi ? `https://doi.org/${item.doi}` : 'https://doi.org'),
      coverImage: item.coverImage,
      isSavedOffline: item.isSavedOffline || false,
      userNotes: item.userNotes || ''
    };
    this.data.publications.unshift(newPub);
    this.scheduleSave();
    return newPub;
  }

  public updatePublication(id: string, patch: any) {
    const idx = this.data.publications.findIndex((p) => p.id === id);
    if (idx === -1) return null;
    this.data.publications[idx] = {
      ...this.data.publications[idx],
      ...patch
    };
    this.scheduleSave();
    return this.data.publications[idx];
  }

  public deletePublication(id: string) {
    const idx = this.data.publications.findIndex((p) => p.id === id);
    if (idx === -1) return false;
    this.data.publications.splice(idx, 1);
    this.scheduleSave();
    return true;
  }

  public setPublicationNote(id: string, note: string) {
    const pub = this.getPublicationById(id);
    if (!pub) return null;
    pub.userNotes = note;
    this.scheduleSave();
    return pub;
  }

  // --- Blog Posts ---
  public getBlogPosts(filter?: { status?: string; tag?: string; search?: string }) {
    let list = [...this.data.blogPosts];
    if (filter?.status && filter.status !== 'ALL') {
      list = list.filter((b) => b.status === filter.status);
    }
    if (filter?.tag) {
      list = list.filter((b) => b.tags.some((t) => t.toLowerCase() === filter.tag!.toLowerCase()));
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter((b) =>
        b.title.toLowerCase().includes(q) ||
        b.excerpt.toLowerCase().includes(q) ||
        b.content.toLowerCase().includes(q)
      );
    }
    return list;
  }

  public getBlogPostById(id: string) {
    return this.data.blogPosts.find((b) => b.id === id);
  }

  public addBlogPost(item: any) {
    const id = item.id || `blog-${Date.now()}`;
    const newPost = {
      id,
      logCode: item.logCode || `LOG_${Math.floor(100 + Math.random() * 900)}_IMMT`,
      title: item.title || 'Untitled Research Log',
      excerpt: item.excerpt || '',
      content: item.content || '',
      date: item.date || new Date().toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }).toUpperCase(),
      status: item.status || 'PUBLISHED',
      readTime: item.readTime || '10 MIN',
      tags: item.tags || ['#RESEARCH'],
      imageUrl: item.imageUrl || '',
      isFeatured: Boolean(item.isFeatured),
      isSavedOffline: Boolean(item.isSavedOffline),
      likesCount: item.likesCount || 0,
      likedBy: item.likedBy || [],
      comments: item.comments || []
    };
    this.data.blogPosts.unshift(newPost);
    this.scheduleSave();
    return newPost;
  }

  public updateBlogPost(id: string, patch: any) {
    const idx = this.data.blogPosts.findIndex((b) => b.id === id);
    if (idx === -1) return null;
    this.data.blogPosts[idx] = {
      ...this.data.blogPosts[idx],
      ...patch
    };
    this.scheduleSave();
    return this.data.blogPosts[idx];
  }

  public deleteBlogPost(id: string) {
    const idx = this.data.blogPosts.findIndex((b) => b.id === id);
    if (idx === -1) return false;
    this.data.blogPosts.splice(idx, 1);
    this.scheduleSave();
    return true;
  }

  public likeBlogPost(id: string, userId: string) {
    const post = this.getBlogPostById(id);
    if (!post) return null;
    const likedBy = post.likedBy || [];
    const isLiked = likedBy.includes(userId);
    if (isLiked) {
      post.likedBy = likedBy.filter((u) => u !== userId);
      post.likesCount = Math.max(0, (post.likesCount || 1) - 1);
    } else {
      post.likedBy = [...likedBy, userId];
      post.likesCount = (post.likesCount || 0) + 1;
    }
    this.scheduleSave();
    return { post, isLiked: !isLiked };
  }

  public addBlogComment(id: string, comment: any) {
    const post = this.getBlogPostById(id);
    if (!post) return null;
    const newComment = {
      id: comment.id || `c-${Date.now()}`,
      userName: comment.userName || comment.authorName || 'Visiting Researcher',
      authorRole: comment.authorRole || comment.userRole || 'Materials Engineer',
      text: comment.text || comment.content || '',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };
    if (!post.comments) post.comments = [];
    post.comments.unshift(newComment);
    this.scheduleSave();
    return newComment;
  }

  // --- Gallery ---
  public getGallery(filter?: { category?: string; search?: string }) {
    let list = [...this.data.gallery];
    if (filter?.category && filter.category !== 'All') {
      list = list.filter((g) => g.category.toLowerCase() === filter.category!.toLowerCase());
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      list = list.filter((g) =>
        g.title.toLowerCase().includes(q) ||
        g.description.toLowerCase().includes(q)
      );
    }
    return list;
  }

  public getGalleryById(id: string) {
    return this.data.gallery.find((g) => g.id === id);
  }

  public addGalleryItem(item: any) {
    const id = item.id || `gal-${Date.now()}`;
    const newItem = {
      id,
      title: item.title || 'Micrograph Figure',
      figureNo: item.figureNo || `FIG ${this.data.gallery.length + 1}`,
      category: item.category || 'Cladding',
      imageUrl: item.imageUrl || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800',
      description: item.description || '',
      scaleBar: item.scaleBar || 'Power: 2.0 kW',
      userNotes: item.userNotes || '',
      isSavedOffline: Boolean(item.isSavedOffline)
    };
    this.data.gallery.unshift(newItem);
    this.scheduleSave();
    return newItem;
  }

  public updateGalleryItem(id: string, patch: any) {
    const idx = this.data.gallery.findIndex((g) => g.id === id);
    if (idx === -1) return null;
    this.data.gallery[idx] = {
      ...this.data.gallery[idx],
      ...patch
    };
    this.scheduleSave();
    return this.data.gallery[idx];
  }

  public deleteGalleryItem(id: string) {
    const idx = this.data.gallery.findIndex((g) => g.id === id);
    if (idx === -1) return false;
    this.data.gallery.splice(idx, 1);
    this.scheduleSave();
    return true;
  }

  public setGalleryNote(id: string, note: string) {
    const item = this.getGalleryById(id);
    if (!item) return null;
    item.userNotes = note;
    this.scheduleSave();
    return item;
  }

  // --- Career Journey ---
  public getCareerJourney() {
    return this.data.careerJourney;
  }

  public addCareerMilestone(milestone: any) {
    this.data.careerJourney.push(milestone);
    this.scheduleSave();
    return this.data.careerJourney;
  }

  public updateCareerMilestone(index: number, milestone: any) {
    if (index >= 0 && index < this.data.careerJourney.length) {
      this.data.careerJourney[index] = milestone;
      this.scheduleSave();
      return this.data.careerJourney;
    }
    return null;
  }

  public deleteCareerMilestone(index: number) {
    if (index >= 0 && index < this.data.careerJourney.length) {
      this.data.careerJourney.splice(index, 1);
      this.scheduleSave();
      return true;
    }
    return false;
  }

  // --- Academic Foundation ---
  public getAcademicFoundation() {
    return this.data.academicFoundation;
  }

  public addAcademicDegree(degree: any) {
    this.data.academicFoundation.push(degree);
    this.scheduleSave();
    return this.data.academicFoundation;
  }

  public updateAcademicDegree(index: number, degree: any) {
    if (index >= 0 && index < this.data.academicFoundation.length) {
      this.data.academicFoundation[index] = degree;
      this.scheduleSave();
      return this.data.academicFoundation;
    }
    return null;
  }

  public deleteAcademicDegree(index: number) {
    if (index >= 0 && index < this.data.academicFoundation.length) {
      this.data.academicFoundation.splice(index, 1);
      this.scheduleSave();
      return true;
    }
    return false;
  }

  // --- Awards ---
  public getAwards() {
    return this.data.awards;
  }

  public addAward(award: any) {
    this.data.awards.unshift(award);
    this.scheduleSave();
    return this.data.awards;
  }

  public updateAward(index: number, award: any) {
    if (index >= 0 && index < this.data.awards.length) {
      this.data.awards[index] = award;
      this.scheduleSave();
      return this.data.awards;
    }
    return null;
  }

  public deleteAward(index: number) {
    if (index >= 0 && index < this.data.awards.length) {
      this.data.awards.splice(index, 1);
      this.scheduleSave();
      return true;
    }
    return false;
  }

  // --- Task Reminders ---
  public getTasks() {
    return this.data.tasks;
  }

  public addTask(task: any) {
    const id = task.id || `task-${Date.now()}`;
    const newTask = {
      id,
      title: task.title || 'Untitled Lab Task',
      category: task.category || 'Research',
      dueTime: task.dueTime || 'Tomorrow',
      priority: task.priority || 'Medium',
      completed: Boolean(task.completed),
      encryptedPayload: task.encryptedPayload || ''
    };
    this.data.tasks.unshift(newTask);
    this.scheduleSave();
    return newTask;
  }

  public updateTask(id: string, patch: any) {
    const idx = this.data.tasks.findIndex((t) => t.id === id);
    if (idx === -1) return null;
    this.data.tasks[idx] = {
      ...this.data.tasks[idx],
      ...patch
    };
    this.scheduleSave();
    return this.data.tasks[idx];
  }

  public deleteTask(id: string) {
    const idx = this.data.tasks.findIndex((t) => t.id === id);
    if (idx === -1) return false;
    this.data.tasks.splice(idx, 1);
    this.scheduleSave();
    return true;
  }

  // --- Scientometrics & Analytics ---
  public getAnalytics() {
    return this.data.analytics;
  }

  public updateAnalytics(patch: Partial<typeof MOCK_ANALYTICS>) {
    this.data.analytics = {
      ...this.data.analytics,
      ...patch,
      annualOutputs: {
        ...this.data.analytics.annualOutputs,
        ...(patch.annualOutputs || {})
      }
    };
    this.scheduleSave();
    return this.data.analytics;
  }

  // --- Messages & Inquiries ---
  public getMessages() {
    return this.data.messages;
  }

  public addMessage(msg: any) {
    const id = msg.id || `msg-${Date.now()}`;
    const newMsg = {
      id,
      name: msg.name || 'Anonymous Researcher',
      email: msg.email || '',
      organization: msg.organization || '',
      subject: msg.subject || 'Scientific Inquiry',
      message: msg.message || '',
      date: msg.date || new Date().toISOString().split('T')[0],
      timestamp: msg.timestamp || new Date().toISOString(),
      status: msg.status || 'unread'
    };
    this.data.messages.unshift(newMsg);
    this.scheduleSave();
    return newMsg;
  }

  public updateMessageStatus(id: string, status: string) {
    const msg = this.data.messages.find((m) => m.id === id);
    if (!msg) return null;
    msg.status = status;
    this.scheduleSave();
    return msg;
  }

  public deleteMessage(id: string) {
    const idx = this.data.messages.findIndex((m) => m.id === id);
    if (idx === -1) return false;
    this.data.messages.splice(idx, 1);
    this.scheduleSave();
    return true;
  }

  // --- Sessions ---
  public getSessions() {
    return this.data.sessions;
  }

  public deleteSession(id: string) {
    const idx = this.data.sessions.findIndex((s) => s.id === id);
    if (idx === -1) return false;
    this.data.sessions.splice(idx, 1);
    this.scheduleSave();
    return true;
  }

  // --- System Settings ---
  public getSettings() {
    return this.data.settings;
  }

  public updateSettings(patch: Partial<typeof DEFAULT_SETTINGS>) {
    this.data.settings = {
      ...this.data.settings,
      ...patch
    };
    this.scheduleSave();
    return this.data.settings;
  }

  // --- Telemetry ---
  public getTelemetry() {
    return this.data.telemetry;
  }

  public addTelemetry(event: string, type: string = 'system', status: string = 'info') {
    const log = {
      id: `tel-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      event,
      type,
      status
    };
    this.data.telemetry.unshift(log);
    if (this.data.telemetry.length > 50) {
      this.data.telemetry = this.data.telemetry.slice(0, 50);
    }
    this.scheduleSave();
    return log;
  }
}

export const backendStorage = new BackendStorageEngine();
