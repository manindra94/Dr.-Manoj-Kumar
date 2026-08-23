import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp
} from 'firebase/firestore';
import { firestore } from './firebase';
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

export type UserProfile = typeof MANOJ_KUMAR_PROFILE;

export interface SiteContent {
  homepage: {
    heroTagline: string;
    heroDescription: string;
    announcement?: string;
    featuredVerticals: TechnicalVertical[];
    customStats?: {
      yearsExperience?: string;
      affiliation?: string;
      patentsFiled?: string;
      citations?: string;
    };
  };
  about: {
    bioHeadline: string;
    bioDescription: string;
    affiliations: string[];
    specializations: string[];
  };
}

export interface AnalyticsData {
  totalCitations: number;
  totalPublications: number;
  totalPatents: number;
  hIndex: number;
  i10Index: number;
  grantFundingINR: string;
  industryProjects: number;
  internationalCollaborations: number;
  monthlyViews: { month: string; views: number; downloads: number }[];
  citationTrends: { year: number; citations: number }[];
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: string;
  status: 'UNREAD' | 'REVIEWED' | 'ARCHIVED';
  senderRole?: string;
}

export const DEFAULT_ANALYTICS: AnalyticsData = {
  totalCitations: 1420,
  totalPublications: 42,
  totalPatents: 8,
  hIndex: 18,
  i10Index: 26,
  grantFundingINR: "4.85 Cr",
  industryProjects: 14,
  internationalCollaborations: 6,
  monthlyViews: [
    { month: 'Jan', views: 820, downloads: 210 },
    { month: 'Feb', views: 950, downloads: 340 },
    { month: 'Mar', views: 1240, downloads: 490 },
    { month: 'Apr', views: 1100, downloads: 410 },
    { month: 'May', views: 1480, downloads: 620 },
    { month: 'Jun', views: 1650, downloads: 780 },
    { month: 'Jul', views: 1890, downloads: 890 }
  ],
  citationTrends: [
    { year: 2020, citations: 120 },
    { year: 2021, citations: 280 },
    { year: 2022, citations: 510 },
    { year: 2023, citations: 890 },
    { year: 2024, citations: 1180 },
    { year: 2025, citations: 1420 }
  ]
};

export class FirebaseBackendService {
  private isInitialized = false;

  /**
   * Seed Firestore collections if they are empty
   */
  public async initializeDatabaseSeeds() {
    if (this.isInitialized) return;
    this.isInitialized = true;

    try {
      // 1. Seed Profile / About
      const profileDoc = await getDoc(doc(firestore, 'content', 'profile'));
      if (!profileDoc.exists()) {
        await setDoc(doc(firestore, 'content', 'profile'), MANOJ_KUMAR_PROFILE);
      }

      // 2. Seed Home Page Content
      const homeDoc = await getDoc(doc(firestore, 'content', 'homepage'));
      if (!homeDoc.exists()) {
        await setDoc(doc(firestore, 'content', 'homepage'), {
          heroTagline: MANOJ_KUMAR_PROFILE.heroTagline,
          heroDescription: MANOJ_KUMAR_PROFILE.heroDescription,
          announcement: "CSIR-IMMT Advanced Materials & Laser Cladding Facility: Open for Academic & Industrial Collaborations",
          featuredVerticals: MOCK_TECHNICAL_VERTICALS,
          customStats: MANOJ_KUMAR_PROFILE.stats
        });
      }

      // 3. Seed Career Journey
      const careerDoc = await getDoc(doc(firestore, 'content', 'career'));
      if (!careerDoc.exists()) {
        await setDoc(doc(firestore, 'content', 'career'), { items: MOCK_CAREER_JOURNEY });
      }

      // 4. Seed Academic Foundation
      const academicDoc = await getDoc(doc(firestore, 'content', 'academic'));
      if (!academicDoc.exists()) {
        await setDoc(doc(firestore, 'content', 'academic'), { items: MOCK_ACADEMIC_FOUNDATION });
      }

      // 5. Seed Awards
      const awardsDoc = await getDoc(doc(firestore, 'content', 'awards'));
      if (!awardsDoc.exists()) {
        await setDoc(doc(firestore, 'content', 'awards'), { items: MOCK_AWARDS });
      }

      // 6. Seed Analytics
      const analyticsDoc = await getDoc(doc(firestore, 'analytics', 'overview'));
      if (!analyticsDoc.exists()) {
        await setDoc(doc(firestore, 'analytics', 'overview'), DEFAULT_ANALYTICS);
      }

      // 7. Seed Settings
      const settingsDoc = await getDoc(doc(firestore, 'settings', 'global'));
      if (!settingsDoc.exists()) {
        await setDoc(doc(firestore, 'settings', 'global'), DEFAULT_SETTINGS);
      }

      // 8. Seed Publications if collection is empty
      const pubSnap = await getDocs(collection(firestore, 'publications'));
      if (pubSnap.empty) {
        for (const pub of MOCK_PUBLICATIONS) {
          await setDoc(doc(firestore, 'publications', pub.id), pub);
        }
      }

      // 9. Seed Blog Posts if collection is empty
      const blogSnap = await getDocs(collection(firestore, 'blog_posts'));
      if (blogSnap.empty) {
        for (const post of MOCK_BLOG_POSTS) {
          await setDoc(doc(firestore, 'blog_posts', post.id), post);
        }
      }

      // 10. Seed Gallery if collection is empty
      const galSnap = await getDocs(collection(firestore, 'gallery_items'));
      if (galSnap.empty) {
        for (const item of MOCK_GALLERY) {
          await setDoc(doc(firestore, 'gallery_items', item.id), item);
        }
      }

      console.log('Firebase collections verified and seeded successfully.');
    } catch (err) {
      console.warn('Firebase seed initialization error (offline or read-only mode):', err);
    }
  }

  // --- Real-time Listeners ---

  public subscribeProfile(callback: (profile: UserProfile) => void) {
    return onSnapshot(doc(firestore, 'content', 'profile'), (snap) => {
      if (snap.exists()) {
        callback(snap.data() as UserProfile);
      }
    }, (err) => {
      console.warn('Error listening to profile in Firestore:', err);
    });
  }

  public subscribeHomePage(callback: (data: SiteContent['homepage']) => void) {
    return onSnapshot(doc(firestore, 'content', 'homepage'), (snap) => {
      if (snap.exists()) {
        callback(snap.data() as SiteContent['homepage']);
      }
    }, (err) => {
      console.warn('Error listening to homepage in Firestore:', err);
    });
  }

  public subscribeCareer(callback: (items: CareerMilestone[]) => void) {
    return onSnapshot(doc(firestore, 'content', 'career'), (snap) => {
      if (snap.exists() && snap.data().items) {
        callback(snap.data().items as CareerMilestone[]);
      }
    });
  }

  public subscribeAcademic(callback: (items: AcademicDegree[]) => void) {
    return onSnapshot(doc(firestore, 'content', 'academic'), (snap) => {
      if (snap.exists() && snap.data().items) {
        callback(snap.data().items as AcademicDegree[]);
      }
    });
  }

  public subscribeAwards(callback: (items: AwardItem[]) => void) {
    return onSnapshot(doc(firestore, 'content', 'awards'), (snap) => {
      if (snap.exists() && snap.data().items) {
        callback(snap.data().items as AwardItem[]);
      }
    });
  }

  public subscribePublications(callback: (pubs: Publication[]) => void) {
    const q = collection(firestore, 'publications');
    return onSnapshot(q, (snap) => {
      const pubs: Publication[] = [];
      snap.forEach((docSnap) => {
        pubs.push({ id: docSnap.id, ...docSnap.data() } as Publication);
      });
      // Sort by year desc
      pubs.sort((a, b) => b.year - a.year);
      callback(pubs);
    }, (err) => {
      console.warn('Error listening to publications in Firestore:', err);
    });
  }

  public subscribeBlogPosts(callback: (posts: BlogPost[]) => void) {
    const q = collection(firestore, 'blog_posts');
    return onSnapshot(q, (snap) => {
      const posts: BlogPost[] = [];
      snap.forEach((docSnap) => {
        posts.push({ id: docSnap.id, ...docSnap.data() } as BlogPost);
      });
      callback(posts);
    }, (err) => {
      console.warn('Error listening to blog_posts in Firestore:', err);
    });
  }

  public subscribeGallery(callback: (items: GalleryItem[]) => void) {
    const q = collection(firestore, 'gallery_items');
    return onSnapshot(q, (snap) => {
      const items: GalleryItem[] = [];
      snap.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() } as GalleryItem);
      });
      callback(items);
    }, (err) => {
      console.warn('Error listening to gallery_items in Firestore:', err);
    });
  }

  public subscribeAnalytics(callback: (analytics: AnalyticsData) => void) {
    return onSnapshot(doc(firestore, 'analytics', 'overview'), (snap) => {
      if (snap.exists()) {
        callback(snap.data() as AnalyticsData);
      }
    }, (err) => {
      console.warn('Error listening to analytics in Firestore:', err);
    });
  }

  public subscribeSettings(callback: (settings: SystemSettings) => void) {
    return onSnapshot(doc(firestore, 'settings', 'global'), (snap) => {
      if (snap.exists()) {
        callback(snap.data() as SystemSettings);
      }
    }, (err) => {
      console.warn('Error listening to settings in Firestore:', err);
    });
  }

  public subscribeMessages(callback: (messages: ContactMessage[]) => void) {
    const q = collection(firestore, 'messages');
    return onSnapshot(q, (snap) => {
      const msgs: ContactMessage[] = [];
      snap.forEach((docSnap) => {
        msgs.push({ id: docSnap.id, ...docSnap.data() } as ContactMessage);
      });
      msgs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      callback(msgs);
    }, (err) => {
      console.warn('Error listening to messages in Firestore:', err);
    });
  }

  // --- Profile & About Page Mutations ---

  public async updateProfile(partial: Partial<UserProfile>) {
    const ref = doc(firestore, 'content', 'profile');
    await setDoc(ref, partial, { merge: true });
  }

  public async updateHomePage(partial: Partial<SiteContent['homepage']>) {
    const ref = doc(firestore, 'content', 'homepage');
    await setDoc(ref, partial, { merge: true });
  }

  public async saveCareerMilestones(items: CareerMilestone[]) {
    await setDoc(doc(firestore, 'content', 'career'), { items });
  }

  public async saveAcademicFoundation(items: AcademicDegree[]) {
    await setDoc(doc(firestore, 'content', 'academic'), { items });
  }

  public async saveAwards(items: AwardItem[]) {
    await setDoc(doc(firestore, 'content', 'awards'), { items });
  }

  // --- Publications CRUD ---

  public async addPublication(publication: Omit<Publication, 'id'>) {
    const id = `pub-${Date.now()}`;
    const pubWithId: Publication = { ...publication, id };
    await setDoc(doc(firestore, 'publications', id), pubWithId);
    return pubWithId;
  }

  public async updatePublication(id: string, partial: Partial<Publication>) {
    await updateDoc(doc(firestore, 'publications', id), partial);
  }

  public async deletePublication(id: string) {
    await deleteDoc(doc(firestore, 'publications', id));
  }

  // --- Blog Posts CRUD ---

  public async addBlogPost(post: Omit<BlogPost, 'id'>) {
    const id = `blog-${Date.now()}`;
    const postWithId: BlogPost = { ...post, id };
    await setDoc(doc(firestore, 'blog_posts', id), postWithId);
    return postWithId;
  }

  public async updateBlogPost(id: string, partial: Partial<BlogPost>) {
    await updateDoc(doc(firestore, 'blog_posts', id), partial);
  }

  public async deleteBlogPost(id: string) {
    await deleteDoc(doc(firestore, 'blog_posts', id));
  }

  // --- Gallery Items CRUD ---

  public async addGalleryItem(item: Omit<GalleryItem, 'id'>) {
    const id = `gal-${Date.now()}`;
    const itemWithId: GalleryItem = { ...item, id };
    await setDoc(doc(firestore, 'gallery_items', id), itemWithId);
    return itemWithId;
  }

  public async updateGalleryItem(id: string, partial: Partial<GalleryItem>) {
    await updateDoc(doc(firestore, 'gallery_items', id), partial);
  }

  public async deleteGalleryItem(id: string) {
    await deleteDoc(doc(firestore, 'gallery_items', id));
  }

  // --- Analytics Updates ---

  public async updateAnalytics(partial: Partial<AnalyticsData>) {
    await setDoc(doc(firestore, 'analytics', 'overview'), partial, { merge: true });
  }

  // --- Settings Updates ---

  public async updateSettings(partial: Partial<SystemSettings>) {
    await setDoc(doc(firestore, 'settings', 'global'), partial, { merge: true });
  }

  // --- Contact Messages ---

  public async sendContactMessage(msg: Omit<ContactMessage, 'id' | 'createdAt' | 'status'>) {
    const newMsg: Omit<ContactMessage, 'id'> = {
      ...msg,
      createdAt: new Date().toISOString(),
      status: 'UNREAD'
    };
    const docRef = await addDoc(collection(firestore, 'messages'), newMsg);
    return { id: docRef.id, ...newMsg };
  }

  public async updateMessageStatus(id: string, status: 'UNREAD' | 'REVIEWED' | 'ARCHIVED') {
    await updateDoc(doc(firestore, 'messages', id), { status });
  }

  public async deleteMessage(id: string) {
    await deleteDoc(doc(firestore, 'messages', id));
  }

  // --- Audit Telemetry Log ---

  public async logTelemetry(event: string, type: 'auth' | 'sync' | 'security' | 'system', status: 'success' | 'warning' | 'error') {
    try {
      await addDoc(collection(firestore, 'telemetry_logs'), {
        event,
        type,
        status,
        timestamp: new Date().toISOString()
      });
    } catch (e) {
      console.warn('Could not record telemetry in Firestore:', e);
    }
  }
}

export const firebaseService = new FirebaseBackendService();
