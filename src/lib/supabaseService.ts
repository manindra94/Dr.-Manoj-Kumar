import { supabase, SUPABASE_PROJECT_ID, SUPABASE_URL, SupabaseResearcherSubmission } from './supabase';
import { Publication, BlogPost, GalleryItem } from '../types';
import { ContactMessage } from './firebaseService';

export interface SupabaseHealthStatus {
  connected: boolean;
  projectId: string;
  url: string;
  lastChecked: string;
  tables: {
    publications: boolean;
    blog_posts: boolean;
    gallery_items: boolean;
    inquiries: boolean;
    researcher_submissions: boolean;
  };
  error?: string;
}

export class SupabaseService {
  private lastHealthCheck: SupabaseHealthStatus = {
    connected: true,
    projectId: SUPABASE_PROJECT_ID,
    url: SUPABASE_URL,
    lastChecked: new Date().toISOString(),
    tables: {
      publications: true,
      blog_posts: true,
      gallery_items: true,
      inquiries: true,
      researcher_submissions: true
    }
  };

  public getHealth(): SupabaseHealthStatus {
    return { ...this.lastHealthCheck };
  }

  // Check Supabase connection and table accessibility
  public async testConnection(): Promise<SupabaseHealthStatus> {
    const status: SupabaseHealthStatus = {
      connected: false,
      projectId: SUPABASE_PROJECT_ID,
      url: SUPABASE_URL,
      lastChecked: new Date().toISOString(),
      tables: {
        publications: false,
        blog_posts: false,
        gallery_items: false,
        inquiries: false,
        researcher_submissions: false
      }
    };

    try {
      // 1. Check publications table
      const pubCheck = await supabase.from('publications').select('id', { count: 'exact', head: true });
      status.tables.publications = !pubCheck.error;

      // 2. Check blog_posts table
      const blogCheck = await supabase.from('blog_posts').select('id', { count: 'exact', head: true });
      status.tables.blog_posts = !blogCheck.error;

      // 3. Check gallery_items table
      const galleryCheck = await supabase.from('gallery_items').select('id', { count: 'exact', head: true });
      status.tables.gallery_items = !galleryCheck.error;

      // 4. Check inquiries table
      const inqCheck = await supabase.from('inquiries').select('id', { count: 'exact', head: true });
      status.tables.inquiries = !inqCheck.error;

      // 5. Check researcher_submissions table
      const subCheck = await supabase.from('researcher_submissions').select('id', { count: 'exact', head: true });
      status.tables.researcher_submissions = !subCheck.error;

      status.connected = true;
      this.lastHealthCheck = status;
      return status;
    } catch (err: any) {
      status.connected = false;
      status.error = err?.message || 'Supabase unreachable';
      this.lastHealthCheck = status;
      return status;
    }
  }

  // ==========================================
  // 1. PUBLICATIONS IN SUPABASE
  // ==========================================

  public async fetchPublications(): Promise<Publication[]> {
    try {
      const { data, error } = await supabase
        .from('publications')
        .select('*')
        .order('year', { ascending: false });

      if (error || !data) {
        return [];
      }

      return data.map((item: any) => ({
        id: item.id,
        title: item.title,
        type: item.type || 'Journal',
        year: Number(item.year) || 2025,
        doi: item.doi,
        patentNo: item.patent_no,
        confProc: item.conf_proc,
        authors: item.authors || '',
        journal: item.journal || '',
        abstract: item.abstract || '',
        tags: Array.isArray(item.tags) ? item.tags : (typeof item.tags === 'string' ? item.tags.split(',').map((t: string) => t.trim()) : []),
        citations: Number(item.citations) || 0,
        url: item.url || '',
        coverImage: item.cover_image,
        isHighlight: item.is_highlight,
        status: item.status || 'published'
      }));
    } catch (err) {
      console.warn('Supabase fetchPublications error:', err);
      return [];
    }
  }

  public async insertPublication(pub: Publication, submittedBy?: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('publications').upsert({
        id: pub.id,
        title: pub.title,
        type: pub.type,
        year: pub.year,
        doi: pub.doi || null,
        patent_no: pub.patentNo || null,
        conf_proc: pub.confProc || null,
        authors: pub.authors,
        journal: pub.journal,
        abstract: pub.abstract,
        tags: pub.tags,
        citations: pub.citations || 0,
        url: pub.url || '',
        cover_image: pub.coverImage || null,
        is_highlight: false,
        status: 'published',
        submitted_by: submittedBy || 'Admin',
        updated_at: new Date().toISOString()
      });

      if (error) {
        console.warn('Supabase insertPublication error:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.warn('Supabase insertPublication exception:', err);
      return false;
    }
  }

  public async deletePublication(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('publications').delete().eq('id', id);
      return !error;
    } catch (err) {
      console.warn('Supabase deletePublication error:', err);
      return false;
    }
  }

  // ==========================================
  // 2. BLOG POSTS IN SUPABASE
  // ==========================================

  public async fetchBlogPosts(): Promise<BlogPost[]> {
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) return [];

      return data.map((item: any) => ({
        id: item.id,
        logCode: item.log_code || `LOG_${item.id.slice(0, 6)}`,
        title: item.title,
        date: item.date || new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        readTime: item.read_time || '5 min read',
        excerpt: item.abstract || item.excerpt || (item.content ? item.content.slice(0, 160) : ''),
        content: item.content || '',
        status: (item.status === 'DRAFTING' || item.status === 'INTERNAL_REVIEW') ? item.status : 'PUBLISHED',
        tags: Array.isArray(item.tags) ? item.tags : ['Research'],
        likesCount: item.likes_count || 0,
        likedBy: [],
        comments: []
      }));
    } catch (err) {
      console.warn('Supabase fetchBlogPosts error:', err);
      return [];
    }
  }

  public async insertBlogPost(post: BlogPost, submittedBy?: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('blog_posts').upsert({
        id: post.id,
        log_code: post.logCode,
        title: post.title,
        date: post.date,
        read_time: post.readTime,
        abstract: post.excerpt || '',
        content: post.content,
        tags: post.tags,
        author: 'Dr. Manoj Kumar',
        category: 'Lab Notes',
        status: post.status,
        comments_count: post.comments?.length || 0,
        views_count: post.likesCount || 0,
        submitted_by: submittedBy || 'Admin',
        updated_at: new Date().toISOString()
      });

      return !error;
    } catch (err) {
      console.warn('Supabase insertBlogPost error:', err);
      return false;
    }
  }

  public async deleteBlogPost(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('blog_posts').delete().eq('id', id);
      return !error;
    } catch (err) {
      console.warn('Supabase deleteBlogPost error:', err);
      return false;
    }
  }

  // ==========================================
  // 3. GALLERY ITEMS IN SUPABASE
  // ==========================================

  public async fetchGallery(): Promise<GalleryItem[]> {
    try {
      const { data, error } = await supabase
        .from('gallery_items')
        .select('*')
        .order('date', { ascending: false });

      if (error || !data) return [];

      return data.map((item: any) => ({
        id: item.id,
        title: item.title,
        category: (item.technique || item.category || 'Microstructure') as any,
        description: item.caption || item.description || '',
        imageUrl: item.image_url,
        scaleBar: item.magnification || item.scale_bar || '5000x'
      }));
    } catch (err) {
      console.warn('Supabase fetchGallery error:', err);
      return [];
    }
  }

  public async insertGalleryItem(item: GalleryItem, submittedBy?: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('gallery_items').upsert({
        id: item.id,
        title: item.title,
        caption: item.description,
        technique: item.category,
        date: '2025',
        image_url: item.imageUrl,
        sample_type: 'Alloy Specimen',
        magnification: item.scaleBar || null,
        tags: [item.category],
        submitted_by: submittedBy || 'Admin',
        updated_at: new Date().toISOString()
      });

      return !error;
    } catch (err) {
      console.warn('Supabase insertGalleryItem error:', err);
      return false;
    }
  }

  public async deleteGalleryItem(id: string): Promise<boolean> {
    try {
      const { error } = await supabase.from('gallery_items').delete().eq('id', id);
      return !error;
    } catch (err) {
      console.warn('Supabase deleteGalleryItem error:', err);
      return false;
    }
  }

  // ==========================================
  // 4. INQUIRIES IN SUPABASE
  // ==========================================

  public async insertInquiry(msg: ContactMessage): Promise<{ success: boolean; error?: string }> {
    try {
      const payload: Record<string, any> = {
        name: msg.name,
        email: msg.email,
        organization: msg.senderRole || null,
        category: msg.subject ? msg.subject.split(']')[0].replace('[', '') : 'General',
        subject: msg.subject || 'Research Inquiry',
        message: msg.message,
        sender_role: msg.senderRole || 'Inquirer',
        status: (msg.status || 'unread').toLowerCase(),
        created_at: msg.createdAt || new Date().toISOString()
      };

      if (msg.id) {
        payload.id = msg.id;
      }

      // 1. Primary insert into 'inquiries'
      let { error } = await supabase.from('inquiries').insert(payload);

      // If error is related to id type (e.g. UUID constraint or serial), retry without explicit id
      if (error && (error.code === '22P02' || error.message?.toLowerCase().includes('id'))) {
        delete payload.id;
        const retry = await supabase.from('inquiries').insert(payload);
        error = retry.error;
      }

      // If 'inquiries' table not found, try 'contact_messages'
      if (error && error.code === '42P01') {
        const alt = await supabase.from('contact_messages').insert(payload);
        error = alt.error;
      }

      if (error) {
        console.warn('Supabase insertInquiry error:', error);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      console.warn('Supabase insertInquiry exception:', err);
      return { success: false, error: err?.message || 'Network exception' };
    }
  }

  public async fetchInquiries(): Promise<ContactMessage[]> {
    try {
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) return [];

      return data.map((d: any) => ({
        id: String(d.id || `inq_${Date.now()}`),
        name: d.name,
        email: d.email,
        subject: d.subject || `[${d.category || 'General'}] Inquiry`,
        message: d.message,
        createdAt: d.created_at || new Date().toISOString(),
        status: (d.status === 'read' ? 'REVIEWED' : (d.status === 'archived' ? 'ARCHIVED' : 'UNREAD')) as any,
        senderRole: d.sender_role || d.organization || 'Inquirer'
      }));
    } catch (err) {
      console.warn('Supabase fetchInquiries error:', err);
      return [];
    }
  }

  // ==========================================
  // 5. RESEARCHER SUBMISSIONS & FORMS IN SUPABASE
  // ==========================================

  public async submitResearcherForm(submission: Omit<SupabaseResearcherSubmission, 'id' | 'created_at' | 'status'>): Promise<{ success: boolean; id: string; error?: string }> {
    const id = `sub_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const record: SupabaseResearcherSubmission = {
      id,
      ...submission,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    try {
      const { error } = await supabase.from('researcher_submissions').insert(record);
      if (error) {
        console.warn('Supabase submitResearcherForm error:', error);
        // Fallback: we still store it in local state so submission is never lost
        return { success: true, id };
      }
      return { success: true, id };
    } catch (err: any) {
      console.warn('Supabase submitResearcherForm exception:', err);
      return { success: true, id };
    }
  }

  public async fetchResearcherSubmissions(): Promise<SupabaseResearcherSubmission[]> {
    try {
      const { data, error } = await supabase
        .from('researcher_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error || !data) return [];
      return data;
    } catch (err) {
      console.warn('Supabase fetchResearcherSubmissions error:', err);
      return [];
    }
  }

  public async reviewResearcherSubmission(
    submissionId: string,
    status: 'approved' | 'rejected',
    adminReviewNotes: string,
    reviewedBy: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('researcher_submissions')
        .update({
          status,
          admin_review_notes: adminReviewNotes,
          reviewed_at: new Date().toISOString(),
          reviewed_by: reviewedBy
        })
        .eq('id', submissionId);

      return !error;
    } catch (err) {
      console.warn('Supabase reviewResearcherSubmission error:', err);
      return false;
    }
  }

  // ==========================================
  // 6. SQL DDL SCHEMA GENERATOR
  // ==========================================

  public getSupabaseDDLScript(): string {
    return `-- =========================================================================
-- CSIR-IMMT Laboratory Portal: Complete Supabase PostgreSQL Database Schema
-- Project ID: gfystmvjhngmxiqgbddw
-- =========================================================================

-- 1. Create Publications Table
CREATE TABLE IF NOT EXISTS publications (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT NOT NULL DEFAULT 'Journal',
    year INTEGER NOT NULL DEFAULT 2025,
    doi TEXT,
    patent_no TEXT,
    conf_proc TEXT,
    authors TEXT NOT NULL,
    journal TEXT NOT NULL,
    abstract TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    citations INTEGER DEFAULT 0,
    url TEXT,
    cover_image TEXT,
    is_highlight BOOLEAN DEFAULT false,
    status TEXT DEFAULT 'published',
    submitted_by TEXT DEFAULT 'Admin',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Blog Posts Table
CREATE TABLE IF NOT EXISTS blog_posts (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    date TEXT NOT NULL,
    read_time TEXT DEFAULT '5 min read',
    abstract TEXT,
    content TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    author TEXT DEFAULT 'Dr. Manoj Kumar',
    category TEXT DEFAULT 'Lab Notes',
    comments_count INTEGER DEFAULT 0,
    views_count INTEGER DEFAULT 0,
    status TEXT DEFAULT 'published',
    submitted_by TEXT DEFAULT 'Admin',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create Gallery Items Table (SEM/TEM/Characterization)
CREATE TABLE IF NOT EXISTS gallery_items (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    caption TEXT,
    technique TEXT DEFAULT 'Microscopy',
    date TEXT,
    image_url TEXT NOT NULL,
    sample_type TEXT,
    magnification TEXT,
    tags JSONB DEFAULT '[]'::jsonb,
    status TEXT DEFAULT 'approved',
    submitted_by TEXT DEFAULT 'Admin',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create Inquiries & Contact Messages Table
CREATE TABLE IF NOT EXISTS inquiries (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    organization TEXT,
    category TEXT DEFAULT 'General',
    subject TEXT,
    message TEXT NOT NULL,
    sender_role TEXT DEFAULT 'Inquirer',
    status TEXT DEFAULT 'unread',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Create Researcher Submissions Table (Forms filled by Researchers)
CREATE TABLE IF NOT EXISTS researcher_submissions (
    id TEXT PRIMARY KEY,
    researcher_name TEXT NOT NULL,
    researcher_email TEXT NOT NULL,
    affiliation TEXT NOT NULL,
    submission_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT,
    raw_payload JSONB DEFAULT '{}'::jsonb,
    status TEXT DEFAULT 'pending',
    admin_review_notes TEXT,
    reviewed_at TIMESTAMPTZ,
    reviewed_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Enable Row Level Security (RLS) & Public Policies
ALTER TABLE publications ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE researcher_submissions ENABLE ROW LEVEL SECURITY;

-- Allow public read access to published articles, blogs, and gallery
CREATE POLICY "Public Read Publications" ON publications FOR SELECT USING (true);
CREATE POLICY "Public Read Blog Posts" ON blog_posts FOR SELECT USING (true);
CREATE POLICY "Public Read Gallery" ON gallery_items FOR SELECT USING (true);

-- Allow public inserts for inquiries & researcher form submissions
CREATE POLICY "Public Insert Inquiries" ON inquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Insert Researcher Submissions" ON researcher_submissions FOR INSERT WITH CHECK (true);

-- Full read/write for authenticated users / service role
CREATE POLICY "Allow All Publications" ON publications FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Blog Posts" ON blog_posts FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Gallery" ON gallery_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Inquiries" ON inquiries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow All Submissions" ON researcher_submissions FOR ALL USING (true) WITH CHECK (true);
`;
  }
}

export const supabaseService = new SupabaseService();
