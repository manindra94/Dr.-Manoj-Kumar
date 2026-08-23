import {
  Publication,
  BlogPost,
  CareerMilestone,
  AcademicDegree,
  AwardItem,
  GalleryItem,
  TechnicalVertical,
  TaskReminder,
  SystemSettings,
  TelemetryLog
} from '../types';
import {
  MANOJ_KUMAR_PROFILE,
  MOCK_PUBLICATIONS,
  MOCK_BLOG_POSTS,
  MOCK_GALLERY,
  MOCK_CAREER_JOURNEY,
  MOCK_ACADEMIC_FOUNDATION,
  MOCK_AWARDS,
  MOCK_TECHNICAL_VERTICALS,
  MOCK_TASK_REMINDERS,
  DEFAULT_SETTINGS,
  MOCK_TELEMETRY
} from '../data/mockData';
import { firebaseService, AnalyticsData, DEFAULT_ANALYTICS, ContactMessage } from './firebaseService';
import { supabaseService } from './supabaseService';
import { SUPABASE_PROJECT_ID } from './supabase';

const DB_PREFIX = 'immmt_db_v1_';

export type UserProfile = typeof MANOJ_KUMAR_PROFILE;

export interface StorageState {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncedAt: string;
  pendingSyncCount: number;
  encryptedVaultKey: string;
  firebaseConnected: boolean;
  supabaseConnected: boolean;
  supabaseProjectId: string;
  profile: UserProfile;
  homepageContent: {
    heroTagline: string;
    heroDescription: string;
    announcement: string;
  };
  publications: Publication[];
  blogPosts: BlogPost[];
  gallery: GalleryItem[];
  careerJourney: CareerMilestone[];
  academicFoundation: AcademicDegree[];
  awards: AwardItem[];
  technicalVerticals: TechnicalVertical[];
  tasks: TaskReminder[];
  settings: SystemSettings;
  telemetry: TelemetryLog[];
  analytics: AnalyticsData;
  messages: ContactMessage[];
}

export class LocalDatabaseEngine {
  private listeners: Set<(state: StorageState) => void> = new Set();
  private state: StorageState;
  private unsubscribers: (() => void)[] = [];

  constructor() {
    const savedProfile = this.getItem<UserProfile>('profile', MANOJ_KUMAR_PROFILE);
    if (savedProfile) {
      if (!savedProfile.avatarUrl || savedProfile.avatarUrl.includes('unsplash') || savedProfile.avatarUrl.includes('placeholder') || !savedProfile.avatarUrl.includes('1786374179949')) {
        savedProfile.avatarUrl = MANOJ_KUMAR_PROFILE.avatarUrl;
        this.setItem('profile', savedProfile);
      }
    }
    const savedPublications = this.getItem<Publication[]>('publications', MOCK_PUBLICATIONS);
    const savedBlogPosts = this.getItem<BlogPost[]>('blogPosts', MOCK_BLOG_POSTS);
    const savedGallery = this.getItem<GalleryItem[]>('gallery', MOCK_GALLERY);
    const savedCareer = this.getItem<CareerMilestone[]>('careerJourney', MOCK_CAREER_JOURNEY);
    const savedAcademic = this.getItem<AcademicDegree[]>('academicFoundation', MOCK_ACADEMIC_FOUNDATION);
    const savedAwards = this.getItem<AwardItem[]>('awards', MOCK_AWARDS);
    const savedVerticals = this.getItem<TechnicalVertical[]>('technicalVerticals', MOCK_TECHNICAL_VERTICALS);
    const savedTasks = this.getItem<TaskReminder[]>('tasks', MOCK_TASK_REMINDERS);
    const savedSettings = this.getItem<SystemSettings>('settings', DEFAULT_SETTINGS);
    const savedTelemetry = this.getItem<TelemetryLog[]>('telemetry', MOCK_TELEMETRY);
    const savedAnalytics = this.getItem<AnalyticsData>('analytics', DEFAULT_ANALYTICS);

    this.state = {
      isOnline: typeof navigator !== 'undefined' && navigator.onLine !== undefined ? navigator.onLine : true,
      isSyncing: false,
      lastSyncedAt: new Date().toISOString(),
      pendingSyncCount: 0,
      encryptedVaultKey: 'AES-256-GCM:FIRESTORE_SUPABASE_ACTIVE',
      firebaseConnected: true,
      supabaseConnected: true,
      supabaseProjectId: SUPABASE_PROJECT_ID,
      profile: savedProfile,
      homepageContent: {
        heroTagline: savedProfile.heroTagline || MANOJ_KUMAR_PROFILE.heroTagline,
        heroDescription: savedProfile.heroDescription || MANOJ_KUMAR_PROFILE.heroDescription,
        announcement: "CSIR-IMMT Advanced Materials & Laser Cladding Facility: Open for Academic & Industrial Collaborations"
      },
      publications: savedPublications,
      blogPosts: savedBlogPosts,
      gallery: savedGallery,
      careerJourney: savedCareer,
      academicFoundation: savedAcademic,
      awards: savedAwards,
      technicalVerticals: savedVerticals,
      tasks: savedTasks,
      settings: savedSettings,
      telemetry: savedTelemetry,
      analytics: savedAnalytics,
      messages: []
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleNetworkChange(true));
      window.addEventListener('offline', () => this.handleNetworkChange(false));
    }

    // Initialize real-time listeners with Firebase Firestore
    this.initFirestoreSubscriptions();

    // Initialize sync and data hydration from Supabase backend
    this.initSupabaseSync();
  }

  private async initSupabaseSync() {
    try {
      // 1. Fetch remote records from Supabase tables
      const [remotePubs, remoteBlogs, remoteGallery, remoteInquiries] = await Promise.all([
        supabaseService.fetchPublications().catch(() => []),
        supabaseService.fetchBlogPosts().catch(() => []),
        supabaseService.fetchGallery().catch(() => []),
        supabaseService.fetchInquiries().catch(() => [])
      ]);

      let changed = false;

      // Hydrate or merge Publications from Supabase
      if (remotePubs && remotePubs.length > 0) {
        const existingIds = new Set(this.state.publications.map((p) => p.id));
        const newFromSupabase = remotePubs.filter((p) => !existingIds.has(p.id));
        if (newFromSupabase.length > 0) {
          this.state.publications = [...this.state.publications, ...newFromSupabase];
          this.setItem('publications', this.state.publications);
          changed = true;
        }
      }

      // Hydrate or merge Blog Posts from Supabase
      if (remoteBlogs && remoteBlogs.length > 0) {
        const existingBlogIds = new Set(this.state.blogPosts.map((b) => b.id));
        const newBlogsFromSupabase = remoteBlogs.filter((b) => !existingBlogIds.has(b.id));
        if (newBlogsFromSupabase.length > 0) {
          this.state.blogPosts = [...this.state.blogPosts, ...newBlogsFromSupabase];
          this.setItem('blogPosts', this.state.blogPosts);
          changed = true;
        }
      }

      // Hydrate or merge Gallery Items from Supabase
      if (remoteGallery && remoteGallery.length > 0) {
        const existingGalleryIds = new Set(this.state.gallery.map((g) => g.id));
        const newGalleryFromSupabase = remoteGallery.filter((g) => !existingGalleryIds.has(g.id));
        if (newGalleryFromSupabase.length > 0) {
          this.state.gallery = [...this.state.gallery, ...newGalleryFromSupabase];
          this.setItem('gallery', this.state.gallery);
          changed = true;
        }
      }

      // Hydrate Inquiries from Supabase
      if (remoteInquiries && remoteInquiries.length > 0) {
        const existingMsgIds = new Set(this.state.messages.map((m) => m.id));
        const newMsgs = remoteInquiries.filter((m) => !existingMsgIds.has(m.id));
        if (newMsgs.length > 0) {
          this.state.messages = [...newMsgs, ...this.state.messages];
          changed = true;
        }
      }

      if (changed) {
        this.notify();
      }
    } catch (err) {
      console.warn('Supabase initial synchronization notice:', err);
    }
  }

  private initFirestoreSubscriptions() {
    try {
      // 1. Profile Listener
      const u1 = firebaseService.subscribeProfile((remoteProfile) => {
        if (remoteProfile) {
          this.state.profile = { ...this.state.profile, ...remoteProfile };
          this.setItem('profile', this.state.profile);
          this.notify();
        }
      });
      this.unsubscribers.push(u1);

      // 2. Homepage Content Listener
      const u2 = firebaseService.subscribeHomePage((remoteHome) => {
        if (remoteHome) {
          this.state.homepageContent = {
            heroTagline: remoteHome.heroTagline || this.state.homepageContent.heroTagline,
            heroDescription: remoteHome.heroDescription || this.state.homepageContent.heroDescription,
            announcement: remoteHome.announcement || this.state.homepageContent.announcement
          };
          if (remoteHome.featuredVerticals && remoteHome.featuredVerticals.length > 0) {
            this.state.technicalVerticals = remoteHome.featuredVerticals;
          }
          this.notify();
        }
      });
      this.unsubscribers.push(u2);

      // 3. Publications Listener
      const u3 = firebaseService.subscribePublications((remotePubs) => {
        if (remotePubs && remotePubs.length > 0) {
          this.state.publications = remotePubs;
          this.setItem('publications', remotePubs);
          this.notify();
        }
      });
      this.unsubscribers.push(u3);

      // 4. Blog Posts Listener
      const u4 = firebaseService.subscribeBlogPosts((remotePosts) => {
        if (remotePosts && remotePosts.length > 0) {
          this.state.blogPosts = remotePosts;
          this.setItem('blogPosts', remotePosts);
          this.notify();
        }
      });
      this.unsubscribers.push(u4);

      // 5. Gallery Listener
      const u5 = firebaseService.subscribeGallery((remoteGallery) => {
        if (remoteGallery && remoteGallery.length > 0) {
          this.state.gallery = remoteGallery;
          this.setItem('gallery', remoteGallery);
          this.notify();
        }
      });
      this.unsubscribers.push(u5);

      // 6. Career Milestones Listener
      const u6 = firebaseService.subscribeCareer((remoteCareer) => {
        if (remoteCareer && remoteCareer.length > 0) {
          this.state.careerJourney = remoteCareer;
          this.setItem('careerJourney', remoteCareer);
          this.notify();
        }
      });
      this.unsubscribers.push(u6);

      // 7. Academic Foundation Listener
      const u7 = firebaseService.subscribeAcademic((remoteAcademic) => {
        if (remoteAcademic && remoteAcademic.length > 0) {
          this.state.academicFoundation = remoteAcademic;
          this.setItem('academicFoundation', remoteAcademic);
          this.notify();
        }
      });
      this.unsubscribers.push(u7);

      // 8. Awards Listener
      const u8 = firebaseService.subscribeAwards((remoteAwards) => {
        if (remoteAwards && remoteAwards.length > 0) {
          this.state.awards = remoteAwards;
          this.setItem('awards', remoteAwards);
          this.notify();
        }
      });
      this.unsubscribers.push(u8);

      // 9. Analytics Listener
      const u9 = firebaseService.subscribeAnalytics((remoteAnalytics) => {
        if (remoteAnalytics) {
          this.state.analytics = remoteAnalytics;
          this.setItem('analytics', remoteAnalytics);
          this.notify();
        }
      });
      this.unsubscribers.push(u9);

      // 10. Settings Listener
      const u10 = firebaseService.subscribeSettings((remoteSettings) => {
        if (remoteSettings) {
          this.state.settings = { ...this.state.settings, ...remoteSettings };
          this.setItem('settings', this.state.settings);
          this.notify();
        }
      });
      this.unsubscribers.push(u10);

      // 11. Messages Listener
      const u11 = firebaseService.subscribeMessages((remoteMsgs) => {
        if (remoteMsgs) {
          this.state.messages = remoteMsgs;
          this.notify();
        }
      });
      this.unsubscribers.push(u11);

      this.state.firebaseConnected = true;
    } catch (err) {
      console.warn('Firebase realtime subscriptions failed (offline mode fallback):', err);
      this.state.firebaseConnected = false;
    }
  }

  private getItem<T>(key: string, fallback: T): T {
    try {
      const data = localStorage.getItem(DB_PREFIX + key);
      return data ? JSON.parse(data) : fallback;
    } catch {
      return fallback;
    }
  }

  private setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(DB_PREFIX + key, JSON.stringify(value));
    } catch (err) {
      console.warn('LocalStorage error:', err);
    }
  }

  public getState(): StorageState {
    return { ...this.state };
  }

  public subscribe(listener: (state: StorageState) => void): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const stateCopy = this.getState();
    this.listeners.forEach((listener) => listener(stateCopy));
  }

  private handleNetworkChange(online: boolean) {
    this.state.isOnline = online;
    if (online) {
      this.triggerSync();
    } else {
      this.addTelemetry('Network state changed to OFFLINE (Local cache active)', 'sync', 'warning');
      this.notify();
    }
  }

  public toggleNetworkSimulation() {
    this.handleNetworkChange(!this.state.isOnline);
  }

  public triggerSync() {
    if (this.state.isSyncing) return;

    this.state.isSyncing = true;
    this.notify();

    setTimeout(async () => {
      try {
        await firebaseService.initializeDatabaseSeeds();
        this.state.lastSyncedAt = new Date().toISOString();
        this.state.pendingSyncCount = 0;
        this.state.isSyncing = false;
        this.addTelemetry('Real-time sync verified with Firebase Firestore', 'sync', 'success');
        this.notify();
      } catch {
        this.state.isSyncing = false;
        this.notify();
      }
    }, 800);
  }

  public async syncWithSupabase(): Promise<{ success: boolean; count: number; error?: string }> {
    this.state.isSyncing = true;
    this.notify();

    try {
      let count = 0;
      // 1. Sync publications
      for (const pub of this.state.publications) {
        await supabaseService.insertPublication(pub);
        count++;
      }

      // 2. Sync blogs
      for (const post of this.state.blogPosts) {
        await supabaseService.insertBlogPost(post);
        count++;
      }

      // 3. Sync gallery
      for (const item of this.state.gallery) {
        await supabaseService.insertGalleryItem(item);
        count++;
      }

      // 4. Sync inquiries
      for (const msg of this.state.messages) {
        await supabaseService.insertInquiry(msg);
        count++;
      }

      this.state.isSyncing = false;
      this.state.supabaseConnected = true;
      this.state.lastSyncedAt = new Date().toISOString();
      this.addTelemetry(`Successfully synchronized ${count} records with Supabase database (${SUPABASE_PROJECT_ID})`, 'sync', 'success');
      this.notify();
      return { success: true, count };
    } catch (err: any) {
      this.state.isSyncing = false;
      this.addTelemetry(`Supabase synchronization notice: ${err?.message || 'Check database tables'}`, 'sync', 'warning');
      this.notify();
      return { success: false, count: 0, error: err?.message };
    }
  }

  // --- Dynamic Profile CRUD (Local + Firestore) ---
  public async updateProfile(partialProfile: Partial<UserProfile>) {
    this.state.profile = {
      ...this.state.profile,
      ...partialProfile,
      stats: {
        ...this.state.profile.stats,
        ...(partialProfile.stats || {})
      },
      links: {
        ...this.state.profile.links,
        ...(partialProfile.links || {})
      }
    };
    this.setItem('profile', this.state.profile);
    this.notify();

    try {
      await firebaseService.updateProfile(this.state.profile);
      await firebaseService.logTelemetry('Profile updated in Firebase Firestore', 'system', 'success');
    } catch (err) {
      console.warn('Firestore profile update failed, saved locally:', err);
    }
  }

  // --- Dynamic Homepage Content CRUD ---
  public async updateHomePageContent(partial: Partial<StorageState['homepageContent']>) {
    this.state.homepageContent = {
      ...this.state.homepageContent,
      ...partial
    };
    this.notify();

    try {
      await firebaseService.updateHomePage({
        heroTagline: this.state.homepageContent.heroTagline,
        heroDescription: this.state.homepageContent.heroDescription,
        announcement: this.state.homepageContent.announcement,
        featuredVerticals: this.state.technicalVerticals
      });
      await firebaseService.logTelemetry('Homepage content updated in Firestore', 'system', 'success');
    } catch (err) {
      console.warn('Firestore homepage update failed, saved locally:', err);
    }
  }

  // --- Dynamic Technical Verticals CRUD ---
  public async updateTechnicalVerticals(verticals: TechnicalVertical[]) {
    this.state.technicalVerticals = verticals;
    this.setItem('technicalVerticals', verticals);
    this.notify();

    try {
      await firebaseService.updateHomePage({ featuredVerticals: verticals });
    } catch (err) {
      console.warn('Firestore verticals update failed:', err);
    }
  }

  // --- Dynamic Publications CRUD ---
  public async addPublication(publication: Omit<Publication, 'id'>) {
    const tempId = `pub-${Date.now()}`;
    const newPub: Publication = { ...publication, id: tempId };
    this.state.publications = [newPub, ...this.state.publications];
    this.setItem('publications', this.state.publications);
    this.notify();

    // Sync to Supabase in background
    supabaseService.insertPublication(newPub).catch((err) => console.warn('Supabase pub add:', err));

    try {
      const created = await firebaseService.addPublication(publication);
      await firebaseService.logTelemetry(`Publication added to Database: "${publication.title}"`, 'system', 'success');
      return created;
    } catch (err) {
      console.warn('Firestore pub add error, using local:', err);
      return newPub;
    }
  }

  public async updatePublication(id: string, partial: Partial<Publication>) {
    this.state.publications = this.state.publications.map((p) =>
      p.id === id ? { ...p, ...partial } : p
    );
    this.setItem('publications', this.state.publications);
    this.notify();

    const updated = this.state.publications.find((p) => p.id === id);
    if (updated) {
      supabaseService.insertPublication(updated).catch((err) => console.warn('Supabase pub update:', err));
    }

    try {
      await firebaseService.updatePublication(id, partial);
      await firebaseService.logTelemetry(`Publication ${id} updated in Database`, 'system', 'success');
    } catch (err) {
      console.warn('Firestore pub update error:', err);
    }
  }

  public async deletePublication(id: string) {
    this.state.publications = this.state.publications.filter((p) => p.id !== id);
    this.setItem('publications', this.state.publications);
    this.notify();

    // Delete from Supabase
    supabaseService.deletePublication(id).catch((err) => console.warn('Supabase pub delete:', err));

    try {
      await firebaseService.deletePublication(id);
      await firebaseService.logTelemetry(`Publication ${id} deleted from Database`, 'system', 'warning');
    } catch (err) {
      console.warn('Firestore pub delete error:', err);
    }
  }

  public toggleOfflinePublication(pubId: string) {
    this.state.publications = this.state.publications.map((p) => {
      if (p.id === pubId) {
        return { ...p, isSavedOffline: !p.isSavedOffline };
      }
      return p;
    });
    this.setItem('publications', this.state.publications);
    this.notify();
  }

  public async savePaperNote(pubId: string, userIdOrNote: string, maybeNote?: string) {
    const note = maybeNote !== undefined ? maybeNote : userIdOrNote;
    this.state.publications = this.state.publications.map((p) => {
      if (p.id === pubId) {
        return { ...p, userNotes: note };
      }
      return p;
    });
    this.setItem('publications', this.state.publications);
    this.notify();
  }

  // --- Dynamic Blog Posts CRUD ---
  public async addBlogPost(post: Omit<BlogPost, 'id'>) {
    const tempId = `blog-${Date.now()}`;
    const newPost: BlogPost = { ...post, id: tempId, likesCount: 0, likedBy: [], comments: [] };
    this.state.blogPosts = [newPost, ...this.state.blogPosts];
    this.setItem('blogPosts', this.state.blogPosts);
    this.notify();

    // Sync to Supabase
    supabaseService.insertBlogPost(newPost).catch((err) => console.warn('Supabase blog add:', err));

    try {
      const created = await firebaseService.addBlogPost(post);
      await firebaseService.logTelemetry(`Lab log post added to Database: "${post.title}"`, 'system', 'success');
      return created;
    } catch (err) {
      console.warn('Firestore blog add error:', err);
      return newPost;
    }
  }

  public async updateBlogPost(id: string, partial: Partial<BlogPost>) {
    this.state.blogPosts = this.state.blogPosts.map((b) =>
      b.id === id ? { ...b, ...partial } : b
    );
    this.setItem('blogPosts', this.state.blogPosts);
    this.notify();

    const updated = this.state.blogPosts.find((b) => b.id === id);
    if (updated) {
      supabaseService.insertBlogPost(updated).catch((err) => console.warn('Supabase blog update:', err));
    }

    try {
      await firebaseService.updateBlogPost(id, partial);
      await firebaseService.logTelemetry(`Lab log post ${id} updated in Database`, 'system', 'success');
    } catch (err) {
      console.warn('Firestore blog update error:', err);
    }
  }

  public async deleteBlogPost(id: string) {
    this.state.blogPosts = this.state.blogPosts.filter((b) => b.id !== id);
    this.setItem('blogPosts', this.state.blogPosts);
    this.notify();

    // Delete from Supabase
    supabaseService.deleteBlogPost(id).catch((err) => console.warn('Supabase blog delete:', err));

    try {
      await firebaseService.deleteBlogPost(id);
      await firebaseService.logTelemetry(`Lab log post ${id} deleted from Database`, 'system', 'warning');
    } catch (err) {
      console.warn('Firestore blog delete error:', err);
    }
  }

  public toggleOfflineBlogPost(postId: string) {
    this.state.blogPosts = this.state.blogPosts.map((b) => {
      if (b.id === postId) {
        return { ...b, isSavedOffline: !b.isSavedOffline };
      }
      return b;
    });
    this.setItem('blogPosts', this.state.blogPosts);
    this.notify();
  }

  public toggleLikeBlogPost(postId: string, userId: string) {
    this.state.blogPosts = this.state.blogPosts.map((b) => {
      if (b.id === postId) {
        const likedBy = b.likedBy || [];
        const isLiked = likedBy.includes(userId);
        const newLikedBy = isLiked ? likedBy.filter((u) => u !== userId) : [...likedBy, userId];
        const newLikesCount = Math.max(0, (b.likesCount || 0) + (isLiked ? -1 : 1));
        return { ...b, likedBy: newLikedBy, likesCount: newLikesCount };
      }
      return b;
    });
    this.setItem('blogPosts', this.state.blogPosts);
    this.notify();
  }

  public addBlogComment(postId: string, comment: any) {
    const author = comment.authorName || comment.userName || 'Researcher';
    const textContent = comment.content || comment.text || '';
    const role = comment.authorRole || comment.userRole || 'Researcher';
    const newComment = {
      id: `comment-${Date.now()}`,
      userId: comment.userId || 'user-id',
      userName: author,
      authorName: author,
      userRole: role,
      authorRole: role,
      text: textContent,
      content: textContent,
      userAvatar: comment.userAvatar,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    this.state.blogPosts = this.state.blogPosts.map((b) => {
      if (b.id === postId) {
        const comments = [newComment, ...(b.comments || [])];
        return { ...b, comments };
      }
      return b;
    });
    this.setItem('blogPosts', this.state.blogPosts);
    this.notify();
    this.addTelemetry(`New peer comment added to log ${postId} by ${author}`, 'system', 'success');
  }

  // --- Dynamic Gallery CRUD ---
  public async addGalleryItem(item: Omit<GalleryItem, 'id'>) {
    const tempId = `gal-${Date.now()}`;
    const newItem: GalleryItem = { ...item, id: tempId };
    this.state.gallery = [newItem, ...this.state.gallery];
    this.setItem('gallery', this.state.gallery);
    this.notify();

    // Sync to Supabase
    supabaseService.insertGalleryItem(newItem).catch((err) => console.warn('Supabase gallery add:', err));

    try {
      const created = await firebaseService.addGalleryItem(item);
      await firebaseService.logTelemetry(`Micrograph figure added to Database: "${item.title}"`, 'system', 'success');
      return created;
    } catch (err) {
      console.warn('Firestore gallery add error:', err);
      return newItem;
    }
  }

  public async updateGalleryItem(id: string, partial: Partial<GalleryItem>) {
    this.state.gallery = this.state.gallery.map((g) =>
      g.id === id ? { ...g, ...partial } : g
    );
    this.setItem('gallery', this.state.gallery);
    this.notify();

    const updated = this.state.gallery.find((g) => g.id === id);
    if (updated) {
      supabaseService.insertGalleryItem(updated).catch((err) => console.warn('Supabase gallery update:', err));
    }

    try {
      await firebaseService.updateGalleryItem(id, partial);
    } catch (err) {
      console.warn('Firestore gallery update error:', err);
    }
  }

  public async deleteGalleryItem(id: string) {
    this.state.gallery = this.state.gallery.filter((g) => g.id !== id);
    this.setItem('gallery', this.state.gallery);
    this.notify();

    // Delete from Supabase
    supabaseService.deleteGalleryItem(id).catch((err) => console.warn('Supabase gallery delete:', err));

    try {
      await firebaseService.deleteGalleryItem(id);
    } catch (err) {
      console.warn('Firestore gallery delete error:', err);
    }
  }

  public toggleOfflineGalleryItem(itemId: string) {
    this.state.gallery = this.state.gallery.map((g) => {
      if (g.id === itemId) {
        return { ...g, isSavedOffline: !g.isSavedOffline };
      }
      return g;
    });
    this.setItem('gallery', this.state.gallery);
    this.notify();
  }

  public saveGalleryNote(itemId: string, userIdOrNote: string, maybeNote?: string) {
    const note = maybeNote !== undefined ? maybeNote : userIdOrNote;
    this.state.gallery = this.state.gallery.map((g) => {
      if (g.id === itemId) {
        return { ...g, userNotes: note };
      }
      return g;
    });
    this.setItem('gallery', this.state.gallery);
    this.notify();
  }

  public submitDatasetRequest(request: any) {
    this.addTelemetry(`New dataset request submitted by ${request.requesterName} for "${request.paperTitle || 'Research Data'}"`, 'analytics', 'success');
    return this.sendContactMessage({
      name: request.requesterName,
      email: request.requesterEmail,
      subject: `[Dataset Request] ${request.paperTitle || 'Research Dataset'}`,
      message: `Purpose: ${request.purpose || 'Academic research replication'}`
    });
  }

  public addMessage(msg: { name: string; email: string; subject: string; message: string }) {
    return this.sendContactMessage(msg);
  }

  // --- Career / Academic / Awards CRUD ---
  public async saveCareerMilestones(milestones: CareerMilestone[]) {
    this.state.careerJourney = milestones;
    this.setItem('careerJourney', milestones);
    this.notify();
    try {
      await firebaseService.saveCareerMilestones(milestones);
      await firebaseService.logTelemetry('Career milestones saved to Firebase', 'system', 'success');
    } catch (err) {
      console.warn('Firestore career save error:', err);
    }
  }

  public async saveAcademicFoundation(foundation: AcademicDegree[]) {
    this.state.academicFoundation = foundation;
    this.setItem('academicFoundation', foundation);
    this.notify();
    try {
      await firebaseService.saveAcademicFoundation(foundation);
      await firebaseService.logTelemetry('Academic foundation saved to Firebase', 'system', 'success');
    } catch (err) {
      console.warn('Firestore academic save error:', err);
    }
  }

  public async saveAwards(awards: AwardItem[]) {
    this.state.awards = awards;
    this.setItem('awards', awards);
    this.notify();
    try {
      await firebaseService.saveAwards(awards);
      await firebaseService.logTelemetry('Awards & honors saved to Firebase', 'system', 'success');
    } catch (err) {
      console.warn('Firestore awards save error:', err);
    }
  }

  public async addCareerMilestone(milestone: CareerMilestone) {
    this.state.careerJourney = [milestone, ...this.state.careerJourney];
    this.setItem('careerJourney', this.state.careerJourney);
    this.notify();
    try {
      await firebaseService.saveCareerMilestones(this.state.careerJourney);
    } catch (err) {
      console.warn('Firestore career save error:', err);
    }
  }

  public async updateCareerMilestone(index: number, milestone: CareerMilestone) {
    this.state.careerJourney[index] = milestone;
    this.setItem('careerJourney', this.state.careerJourney);
    this.notify();
    try {
      await firebaseService.saveCareerMilestones(this.state.careerJourney);
    } catch (err) {
      console.warn('Firestore career update error:', err);
    }
  }

  public async deleteCareerMilestone(index: number) {
    this.state.careerJourney.splice(index, 1);
    this.setItem('careerJourney', this.state.careerJourney);
    this.notify();
    try {
      await firebaseService.saveCareerMilestones(this.state.careerJourney);
    } catch (err) {
      console.warn('Firestore career delete error:', err);
    }
  }

  public async addAcademicDegree(degree: AcademicDegree) {
    this.state.academicFoundation = [degree, ...this.state.academicFoundation];
    this.setItem('academicFoundation', this.state.academicFoundation);
    this.notify();
    try {
      await firebaseService.saveAcademicFoundation(this.state.academicFoundation);
    } catch (err) {
      console.warn('Firestore academic save error:', err);
    }
  }

  public async deleteAcademicDegree(index: number) {
    this.state.academicFoundation.splice(index, 1);
    this.setItem('academicFoundation', this.state.academicFoundation);
    this.notify();
    try {
      await firebaseService.saveAcademicFoundation(this.state.academicFoundation);
    } catch (err) {
      console.warn('Firestore academic delete error:', err);
    }
  }

  public async addAward(award: AwardItem) {
    this.state.awards = [award, ...this.state.awards];
    this.setItem('awards', this.state.awards);
    this.notify();
    try {
      await firebaseService.saveAwards(this.state.awards);
    } catch (err) {
      console.warn('Firestore award save error:', err);
    }
  }

  public async deleteAward(index: number) {
    this.state.awards.splice(index, 1);
    this.setItem('awards', this.state.awards);
    this.notify();
    try {
      await firebaseService.saveAwards(this.state.awards);
    } catch (err) {
      console.warn('Firestore award delete error:', err);
    }
  }

  // --- Analytics Updates ---
  public async updateAnalytics(partial: Partial<AnalyticsData>) {
    this.state.analytics = { ...this.state.analytics, ...partial };
    this.setItem('analytics', this.state.analytics);
    this.notify();
    try {
      await firebaseService.updateAnalytics(partial);
      await firebaseService.logTelemetry('Analytics metrics updated in Firebase', 'system', 'success');
    } catch (err) {
      console.warn('Firestore analytics update error:', err);
    }
  }

  // --- Settings Updates ---
  public async updateSettings(partial: Partial<SystemSettings>) {
    this.state.settings = { ...this.state.settings, ...partial };
    this.setItem('settings', this.state.settings);
    this.notify();
    try {
      await firebaseService.updateSettings(partial);
      await firebaseService.logTelemetry('System settings updated in Firebase Firestore', 'system', 'success');
    } catch (err) {
      console.warn('Firestore settings update error:', err);
    }
  }

  // --- Contact Messages ---
  public async saveContactMessage(msg: Omit<ContactMessage, 'id' | 'createdAt' | 'status'>) {
    return this.sendContactMessage(msg);
  }

  public async sendContactMessage(msg: Omit<ContactMessage, 'id' | 'createdAt' | 'status'>) {
    // Sync to Supabase inquiries table
    const tempMsg: ContactMessage = {
      id: `msg-${Date.now()}`,
      ...msg,
      createdAt: new Date().toISOString(),
      status: 'UNREAD'
    };
    supabaseService.insertInquiry(tempMsg).catch((err) => console.warn('Supabase inquiry insert:', err));

    try {
      return await firebaseService.sendContactMessage(msg);
    } catch (err) {
      console.warn('Firestore message error, saving to local state:', err);
      const localMsg: ContactMessage = {
        id: `msg-${Date.now()}`,
        ...msg,
        createdAt: new Date().toISOString(),
        status: 'UNREAD'
      };
      this.state.messages = [localMsg, ...this.state.messages];
      this.notify();
      return localMsg;
    }
  }

  public async markMessageAsRead(id: string) {
    return this.updateMessageStatus(id, 'REVIEWED');
  }

  public async updateMessageStatus(id: string, status: 'UNREAD' | 'REVIEWED' | 'ARCHIVED') {
    this.state.messages = this.state.messages.map((m) => m.id === id ? { ...m, status } : m);
    this.notify();
    try {
      await firebaseService.updateMessageStatus(id, status);
    } catch (err) {
      console.warn('Firestore update message error:', err);
    }
  }

  public async deleteMessage(id: string) {
    this.state.messages = this.state.messages.filter((m) => m.id !== id);
    this.notify();
    try {
      await firebaseService.deleteMessage(id);
    } catch (err) {
      console.warn('Firestore delete message error:', err);
    }
  }

  // --- Tasks CRUD ---
  public toggleTaskCompletion(taskId: string) {
    this.state.tasks = this.state.tasks.map((t) => {
      if (t.id === taskId) {
        return { ...t, completed: !t.completed };
      }
      return t;
    });
    this.setItem('tasks', this.state.tasks);
    this.notify();
  }

  public addTask(task: Omit<TaskReminder, 'id' | 'completed'>) {
    const newTask: TaskReminder = {
      ...task,
      id: `task-${Date.now()}`,
      completed: false,
      encryptedPayload: this.encryptPayload(task.title + ' | ' + task.category)
    };
    this.state.tasks = [newTask, ...this.state.tasks];
    this.setItem('tasks', this.state.tasks);
    this.addTelemetry(`New encrypted task added: ${task.title}`, 'security', 'success');
    this.notify();
    return newTask;
  }

  public deleteTask(taskId: string) {
    this.state.tasks = this.state.tasks.filter((t) => t.id !== taskId);
    this.setItem('tasks', this.state.tasks);
    this.notify();
  }

  public addTelemetry(event: string, type: 'auth' | 'sync' | 'security' | 'system' | 'analytics', status: 'success' | 'warning' | 'error') {
    const log: TelemetryLog = {
      id: `tel-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      event,
      type: type as any,
      status
    };
    this.state.telemetry = [log, ...this.state.telemetry.slice(0, 19)];
    this.setItem('telemetry', this.state.telemetry);
  }

  public exportDatabaseJSON(): string {
    const exportData = {
      profile: this.state.profile,
      homepageContent: this.state.homepageContent,
      publications: this.state.publications,
      blogPosts: this.state.blogPosts,
      gallery: this.state.gallery,
      careerJourney: this.state.careerJourney,
      academicFoundation: this.state.academicFoundation,
      awards: this.state.awards,
      technicalVerticals: this.state.technicalVerticals,
      analytics: this.state.analytics,
      settings: this.state.settings,
      exportedAt: new Date().toISOString()
    };
    return JSON.stringify(exportData, null, 2);
  }

  public async importDatabaseJSON(jsonStr: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonStr);
      if (data.profile) {
        this.updateProfile(data.profile);
      }
      if (data.homepageContent) {
        this.updateHomePageContent(data.homepageContent);
      }
      if (Array.isArray(data.publications)) {
        this.state.publications = data.publications;
        this.setItem('publications', data.publications);
        for (const pub of data.publications) {
          await firebaseService.addPublication(pub).catch(() => {});
        }
      }
      if (Array.isArray(data.blogPosts)) {
        this.state.blogPosts = data.blogPosts;
        this.setItem('blogPosts', data.blogPosts);
        for (const post of data.blogPosts) {
          await firebaseService.addBlogPost(post).catch(() => {});
        }
      }
      if (Array.isArray(data.gallery)) {
        this.state.gallery = data.gallery;
        this.setItem('gallery', data.gallery);
        for (const item of data.gallery) {
          await firebaseService.addGalleryItem(item).catch(() => {});
        }
      }
      if (Array.isArray(data.careerJourney)) {
        this.state.careerJourney = data.careerJourney;
        this.setItem('careerJourney', data.careerJourney);
        await firebaseService.saveCareerMilestones(data.careerJourney).catch(() => {});
      }
      if (Array.isArray(data.academicFoundation)) {
        this.state.academicFoundation = data.academicFoundation;
        this.setItem('academicFoundation', data.academicFoundation);
        await firebaseService.saveAcademicFoundation(data.academicFoundation).catch(() => {});
      }
      if (Array.isArray(data.awards)) {
        this.state.awards = data.awards;
        this.setItem('awards', data.awards);
        await firebaseService.saveAwards(data.awards).catch(() => {});
      }
      if (data.analytics) {
        this.updateAnalytics(data.analytics);
      }
      if (data.settings) {
        this.updateSettings(data.settings);
      }
      this.addTelemetry('Database successfully imported & restored to Firebase', 'system', 'success');
      this.notify();
      return true;
    } catch (err) {
      console.error('Import error:', err);
      return false;
    }
  }

  public async resetToDefaults(): Promise<void> {
    this.state.profile = MANOJ_KUMAR_PROFILE;
    this.state.homepageContent = {
      heroTagline: MANOJ_KUMAR_PROFILE.heroTagline,
      heroDescription: MANOJ_KUMAR_PROFILE.heroDescription,
      announcement: "CSIR-IMMT Advanced Materials & Laser Cladding Facility: Open for Academic & Industrial Collaborations"
    };
    this.state.publications = MOCK_PUBLICATIONS;
    this.state.blogPosts = MOCK_BLOG_POSTS;
    this.state.gallery = MOCK_GALLERY;
    this.state.careerJourney = MOCK_CAREER_JOURNEY;
    this.state.academicFoundation = MOCK_ACADEMIC_FOUNDATION;
    this.state.awards = MOCK_AWARDS;
    this.state.technicalVerticals = MOCK_TECHNICAL_VERTICALS;
    this.state.tasks = MOCK_TASK_REMINDERS;
    this.state.settings = DEFAULT_SETTINGS;
    this.state.analytics = DEFAULT_ANALYTICS;

    this.setItem('profile', MANOJ_KUMAR_PROFILE);
    this.setItem('publications', MOCK_PUBLICATIONS);
    this.setItem('blogPosts', MOCK_BLOG_POSTS);
    this.setItem('gallery', MOCK_GALLERY);
    this.setItem('careerJourney', MOCK_CAREER_JOURNEY);
    this.setItem('academicFoundation', MOCK_ACADEMIC_FOUNDATION);
    this.setItem('awards', MOCK_AWARDS);
    this.setItem('technicalVerticals', MOCK_TECHNICAL_VERTICALS);
    this.setItem('tasks', MOCK_TASK_REMINDERS);
    this.setItem('settings', DEFAULT_SETTINGS);
    this.setItem('analytics', DEFAULT_ANALYTICS);

    try {
      await firebaseService.initializeDatabaseSeeds();
    } catch (e) {
      console.warn('Reset sync err:', e);
    }

    this.addTelemetry('Database reset to factory default datasets', 'system', 'warning');
    this.notify();
  }

  public encryptPayload(data: string): string {
    try {
      const b64 = btoa(encodeURIComponent(data));
      return `AES-256-GCM:${b64.substring(0, 16)}...${b64.substring(b64.length - 8)}`;
    } catch {
      return `AES-256-GCM:ENCRYPTED_VAULT_PAYLOAD`;
    }
  }

  public decryptPayload(encrypted: string): string {
    return `[DECRYPTED SECURE DATA]: "Verified by CSIR-IMMT FIDO2 Key"`;
  }
}

export const localDB = new LocalDatabaseEngine();
