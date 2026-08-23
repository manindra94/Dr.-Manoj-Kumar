import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Default Fallback Credentials for CSIR-IMMT Metallurgy Portal
const FALLBACK_PROJECT_ID = 'gfystmvjhngmxiqgbddw';
const FALLBACK_URL = 'https://gfystmvjhngmxiqgbddw.supabase.co';
const FALLBACK_ANON_KEY = 'sb_publishable_VbCiOD_xso0NtlzlvtM0yw_81xHuc5j';

function resolveSupabaseUrl(): string {
  try {
    const rawEnvUrl = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_SUPABASE_URL : undefined;
    if (typeof rawEnvUrl === 'string' && rawEnvUrl.trim()) {
      let trimmed = rawEnvUrl.trim();
      if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
        trimmed = `https://${trimmed}`;
      }
      const parsed = new URL(trimmed);
      if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
        return parsed.origin;
      }
    }

    const rawProjId = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_SUPABASE_PROJECT_ID : undefined;
    if (typeof rawProjId === 'string' && rawProjId.trim()) {
      let cleanId = rawProjId.trim();
      if (cleanId.includes('.supabase.co')) {
        return `https://${cleanId.replace(/^https?:\/\//, '')}`;
      }
      return `https://${cleanId}.supabase.co`;
    }
  } catch (err) {
    console.warn('Error resolving Supabase URL, falling back to default:', err);
  }

  return FALLBACK_URL;
}

function resolveSupabaseAnonKey(): string {
  try {
    const rawKey = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_SUPABASE_ANON_KEY : undefined;
    if (typeof rawKey === 'string' && rawKey.trim()) {
      return rawKey.trim();
    }
  } catch (err) {
    // fallback
  }
  return FALLBACK_ANON_KEY;
}

export const SUPABASE_URL: string = resolveSupabaseUrl();
export const SUPABASE_ANON_KEY: string = resolveSupabaseAnonKey();

// Extract Project ID safely
export const SUPABASE_PROJECT_ID: string = (() => {
  try {
    const urlObj = new URL(SUPABASE_URL);
    const hostParts = urlObj.hostname.split('.');
    return hostParts[0] || FALLBACK_PROJECT_ID;
  } catch {
    return FALLBACK_PROJECT_ID;
  }
})();

function initializeSupabaseClient(): SupabaseClient {
  try {
    return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
  } catch (err) {
    console.error('Failed to initialize primary Supabase client, initializing with fallback URL:', err);
    return createClient(FALLBACK_URL, FALLBACK_ANON_KEY, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false
      }
    });
  }
}

// Initialize Supabase Client safely
export const supabase: SupabaseClient = initializeSupabaseClient();

// Database Interfaces matching Supabase Schema
export interface SupabasePublication {
  id: string;
  title: string;
  type: 'Journal' | 'Patent' | 'Conference';
  year: number;
  doi?: string;
  patent_no?: string;
  conf_proc?: string;
  authors: string;
  journal: string;
  abstract: string;
  tags: string[];
  citations: number;
  url: string;
  cover_image?: string;
  is_highlight?: boolean;
  status: 'published' | 'pending_review' | 'archived';
  submitted_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SupabaseBlogPost {
  id: string;
  title: string;
  date: string;
  read_time: string;
  abstract: string;
  content: string;
  tags: string[];
  author: string;
  category: string;
  comments_count: number;
  views_count: number;
  status: 'published' | 'draft' | 'pending_review';
  submitted_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SupabaseGalleryItem {
  id: string;
  title: string;
  caption: string;
  technique: string;
  date: string;
  image_url: string;
  sample_type?: string;
  magnification?: string;
  tags: string[];
  status: 'approved' | 'pending_review';
  submitted_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface SupabaseInquiry {
  id: string;
  name: string;
  email: string;
  organization?: string;
  category: string;
  subject?: string;
  message: string;
  sender_role?: string;
  status: 'unread' | 'read' | 'archived';
  created_at?: string;
}

export interface SupabaseResearcherSubmission {
  id: string;
  researcher_name: string;
  researcher_email: string;
  affiliation: string;
  submission_type: 'publication' | 'blog' | 'gallery' | 'collaboration' | 'dataset_request';
  title: string;
  description: string;
  category?: string;
  raw_payload: any;
  status: 'pending' | 'approved' | 'rejected';
  admin_review_notes?: string;
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
}
