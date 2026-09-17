import {
  Publication,
  BlogPost,
  GalleryItem,
  TaskReminder,
  TechnicalVertical,
  CareerMilestone,
  AcademicDegree,
  AwardItem,
  SystemSettings,
  TelemetryLog,
  ActiveSession
} from '../types';
import { AnalyticsData, ContactMessage } from './firebaseService';
import { UserProfile } from './db';

const API_BASE = '/api';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...options?.headers
    },
    ...options
  });

  if (!response.ok) {
    let errorMsg = `HTTP Error ${response.status}: ${response.statusText}`;
    try {
      const errJson = await response.json();
      if (errJson?.error) errorMsg = errJson.error;
    } catch {
      // ignore
    }
    throw new Error(errorMsg);
  }

  return response.json();
}

export interface BootstrapResponse {
  success: boolean;
  data: {
    profile: UserProfile;
    homepageContent: {
      heroTagline: string;
      heroDescription: string;
      announcement: string;
      featuredVerticals?: TechnicalVertical[];
    };
    technicalVerticals: TechnicalVertical[];
    publications: Publication[];
    blogPosts: BlogPost[];
    careerJourney: CareerMilestone[];
    academicFoundation: AcademicDegree[];
    awards: AwardItem[];
    gallery: GalleryItem[];
    sessions: ActiveSession[];
    tasks: TaskReminder[];
    settings: SystemSettings;
    telemetry: TelemetryLog[];
    analytics: AnalyticsData;
    messages: ContactMessage[];
  };
}

export const portfolioApi = {
  // Bootstrap & Reset
  async getBootstrap(): Promise<BootstrapResponse['data']> {
    const res = await request<BootstrapResponse>('/bootstrap');
    return res.data;
  },

  async resetData(): Promise<BootstrapResponse['data']> {
    const res = await request<{ success: boolean; data: BootstrapResponse['data'] }>('/reset', {
      method: 'POST'
    });
    return res.data;
  },

  // Health
  async checkHealth(): Promise<{ status: string; timestamp: string }> {
    return request('/health');
  },

  // Profile
  async getProfile(): Promise<UserProfile> {
    const res = await request<{ success: boolean; data: UserProfile }>('/profile');
    return res.data;
  },

  async updateProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
    const res = await request<{ success: boolean; data: UserProfile }>('/profile', {
      method: 'PUT',
      body: JSON.stringify(profile)
    });
    return res.data;
  },

  // Homepage Content
  async getHomepage(): Promise<{ heroTagline: string; heroDescription: string; announcement: string }> {
    const res = await request<{ success: boolean; data: any }>('/homepage');
    return res.data;
  },

  async updateHomepage(data: { heroTagline?: string; heroDescription?: string; announcement?: string }): Promise<any> {
    const res = await request<{ success: boolean; data: any }>('/homepage', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    return res.data;
  },

  // Technical Verticals
  async getTechnicalVerticals(): Promise<TechnicalVertical[]> {
    const res = await request<{ success: boolean; data: TechnicalVertical[] }>('/technical-verticals');
    return res.data;
  },

  async updateTechnicalVerticals(verticals: TechnicalVertical[]): Promise<TechnicalVertical[]> {
    const res = await request<{ success: boolean; data: TechnicalVertical[] }>('/technical-verticals', {
      method: 'PUT',
      body: JSON.stringify(verticals)
    });
    return res.data;
  },

  // Publications
  async getPublications(query?: { type?: string; tag?: string; search?: string; year?: number }): Promise<Publication[]> {
    const params = new URLSearchParams();
    if (query?.type) params.set('type', query.type);
    if (query?.tag) params.set('tag', query.tag);
    if (query?.search) params.set('search', query.search);
    if (query?.year) params.set('year', String(query.year));
    const qs = params.toString();
    const res = await request<{ success: boolean; data: Publication[] }>(`/publications${qs ? `?${qs}` : ''}`);
    return res.data;
  },

  async getPublicationById(id: string): Promise<Publication> {
    const res = await request<{ success: boolean; data: Publication }>(`/publications/${id}`);
    return res.data;
  },

  async addPublication(pub: Partial<Publication>): Promise<Publication> {
    const res = await request<{ success: boolean; data: Publication }>('/publications', {
      method: 'POST',
      body: JSON.stringify(pub)
    });
    return res.data;
  },

  async updatePublication(id: string, pub: Partial<Publication>): Promise<Publication> {
    const res = await request<{ success: boolean; data: Publication }>(`/publications/${id}`, {
      method: 'PUT',
      body: JSON.stringify(pub)
    });
    return res.data;
  },

  async deletePublication(id: string): Promise<void> {
    await request(`/publications/${id}`, { method: 'DELETE' });
  },

  async setPublicationNote(id: string, note: string): Promise<Publication> {
    const res = await request<{ success: boolean; data: Publication }>(`/publications/${id}/note`, {
      method: 'POST',
      body: JSON.stringify({ note })
    });
    return res.data;
  },

  // Blog Posts
  async getBlogPosts(query?: { status?: string; tag?: string; search?: string }): Promise<BlogPost[]> {
    const params = new URLSearchParams();
    if (query?.status) params.set('status', query.status);
    if (query?.tag) params.set('tag', query.tag);
    if (query?.search) params.set('search', query.search);
    const qs = params.toString();
    const res = await request<{ success: boolean; data: BlogPost[] }>(`/blog-posts${qs ? `?${qs}` : ''}`);
    return res.data;
  },

  async getBlogPostById(id: string): Promise<BlogPost> {
    const res = await request<{ success: boolean; data: BlogPost }>(`/blog-posts/${id}`);
    return res.data;
  },

  async addBlogPost(post: Partial<BlogPost>): Promise<BlogPost> {
    const res = await request<{ success: boolean; data: BlogPost }>('/blog-posts', {
      method: 'POST',
      body: JSON.stringify(post)
    });
    return res.data;
  },

  async updateBlogPost(id: string, post: Partial<BlogPost>): Promise<BlogPost> {
    const res = await request<{ success: boolean; data: BlogPost }>(`/blog-posts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(post)
    });
    return res.data;
  },

  async deleteBlogPost(id: string): Promise<void> {
    await request(`/blog-posts/${id}`, { method: 'DELETE' });
  },

  async likeBlogPost(id: string, userId?: string): Promise<{ post: BlogPost; isLiked: boolean }> {
    const res = await request<{ success: boolean; data: { post: BlogPost; isLiked: boolean } }>(`/blog-posts/${id}/like`, {
      method: 'POST',
      body: JSON.stringify({ userId })
    });
    return res.data;
  },

  async addBlogComment(id: string, comment: any): Promise<any> {
    const res = await request<{ success: boolean; data: any }>(`/blog-posts/${id}/comments`, {
      method: 'POST',
      body: JSON.stringify(comment)
    });
    return res.data;
  },

  // Gallery
  async getGallery(query?: { category?: string; search?: string }): Promise<GalleryItem[]> {
    const params = new URLSearchParams();
    if (query?.category) params.set('category', query.category);
    if (query?.search) params.set('search', query.search);
    const qs = params.toString();
    const res = await request<{ success: boolean; data: GalleryItem[] }>(`/gallery${qs ? `?${qs}` : ''}`);
    return res.data;
  },

  async getGalleryById(id: string): Promise<GalleryItem> {
    const res = await request<{ success: boolean; data: GalleryItem }>(`/gallery/${id}`);
    return res.data;
  },

  async addGalleryItem(item: Partial<GalleryItem>): Promise<GalleryItem> {
    const res = await request<{ success: boolean; data: GalleryItem }>('/gallery', {
      method: 'POST',
      body: JSON.stringify(item)
    });
    return res.data;
  },

  async updateGalleryItem(id: string, item: Partial<GalleryItem>): Promise<GalleryItem> {
    const res = await request<{ success: boolean; data: GalleryItem }>(`/gallery/${id}`, {
      method: 'PUT',
      body: JSON.stringify(item)
    });
    return res.data;
  },

  async deleteGalleryItem(id: string): Promise<void> {
    await request(`/gallery/${id}`, { method: 'DELETE' });
  },

  async setGalleryNote(id: string, note: string): Promise<GalleryItem> {
    const res = await request<{ success: boolean; data: GalleryItem }>(`/gallery/${id}/note`, {
      method: 'POST',
      body: JSON.stringify({ note })
    });
    return res.data;
  },

  // Tasks
  async getTasks(): Promise<TaskReminder[]> {
    const res = await request<{ success: boolean; data: TaskReminder[] }>('/tasks');
    return res.data;
  },

  async addTask(task: Partial<TaskReminder>): Promise<TaskReminder> {
    const res = await request<{ success: boolean; data: TaskReminder }>('/tasks', {
      method: 'POST',
      body: JSON.stringify(task)
    });
    return res.data;
  },

  async updateTask(id: string, patch: Partial<TaskReminder>): Promise<TaskReminder> {
    const res = await request<{ success: boolean; data: TaskReminder }>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(patch)
    });
    return res.data;
  },

  async deleteTask(id: string): Promise<void> {
    await request(`/tasks/${id}`, { method: 'DELETE' });
  },

  // Analytics
  async getAnalytics(): Promise<AnalyticsData> {
    const res = await request<{ success: boolean; data: AnalyticsData }>('/analytics');
    return res.data;
  },

  async updateAnalytics(analytics: Partial<AnalyticsData>): Promise<AnalyticsData> {
    const res = await request<{ success: boolean; data: AnalyticsData }>('/analytics', {
      method: 'PUT',
      body: JSON.stringify(analytics)
    });
    return res.data;
  },

  // Messages / Inquiries
  async getMessages(): Promise<ContactMessage[]> {
    const res = await request<{ success: boolean; data: ContactMessage[] }>('/messages');
    return res.data;
  },

  async sendMessage(msg: Partial<ContactMessage>): Promise<ContactMessage> {
    const res = await request<{ success: boolean; data: ContactMessage }>('/messages', {
      method: 'POST',
      body: JSON.stringify(msg)
    });
    return res.data;
  },

  async updateMessageStatus(id: string, status: string): Promise<ContactMessage> {
    const res = await request<{ success: boolean; data: ContactMessage }>(`/messages/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    return res.data;
  },

  async deleteMessage(id: string): Promise<void> {
    await request(`/messages/${id}`, { method: 'DELETE' });
  },

  // Settings
  async getSettings(): Promise<SystemSettings> {
    const res = await request<{ success: boolean; data: SystemSettings }>('/settings');
    return res.data;
  },

  async updateSettings(settings: Partial<SystemSettings>): Promise<SystemSettings> {
    const res = await request<{ success: boolean; data: SystemSettings }>('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings)
    });
    return res.data;
  },

  // Telemetry
  async getTelemetry(): Promise<TelemetryLog[]> {
    const res = await request<{ success: boolean; data: TelemetryLog[] }>('/telemetry');
    return res.data;
  },

  async logTelemetry(event: string, type: string = 'system', status: string = 'info'): Promise<TelemetryLog> {
    const res = await request<{ success: boolean; data: TelemetryLog }>('/telemetry', {
      method: 'POST',
      body: JSON.stringify({ event, type, status })
    });
    return res.data;
  },

  // Career, Academics, Awards
  async getCareer(): Promise<CareerMilestone[]> {
    const res = await request<{ success: boolean; data: CareerMilestone[] }>('/career-journey');
    return res.data;
  },

  async getAcademic(): Promise<AcademicDegree[]> {
    const res = await request<{ success: boolean; data: AcademicDegree[] }>('/academic-foundation');
    return res.data;
  },

  async getAwards(): Promise<AwardItem[]> {
    const res = await request<{ success: boolean; data: AwardItem[] }>('/awards');
    return res.data;
  }
};
