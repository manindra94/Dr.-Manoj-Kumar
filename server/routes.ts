import { Router, Request, Response } from 'express';
import { backendStorage } from './storage';

export const apiRouter = Router();

// Health Check
apiRouter.get('/health', (_req: Request, res: Response) => {
  res.json({
    status: 'ok',
    service: 'Dr. Manoj Kumar CSIR-IMMT Research Portfolio API',
    timestamp: new Date().toISOString()
  });
});

// Full Bootstrap Data Payload
apiRouter.get('/bootstrap', (_req: Request, res: Response) => {
  try {
    const data = backendStorage.getBootstrapData();
    res.json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Bootstrap error' });
  }
});

// Factory Reset
apiRouter.post('/reset', (_req: Request, res: Response) => {
  try {
    const fresh = backendStorage.resetToDefaults();
    res.json({ success: true, message: 'All portfolio datasets reset to scientific initial state', data: fresh });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message || 'Reset error' });
  }
});

// ==========================================
// 1. Profile Endpoints
// ==========================================
apiRouter.get('/profile', (_req: Request, res: Response) => {
  try {
    const profile = backendStorage.getProfile();
    res.json({ success: true, data: profile });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

apiRouter.put('/profile', (req: Request, res: Response) => {
  try {
    const updated = backendStorage.updateProfile(req.body);
    backendStorage.addTelemetry('Scientist profile updated via REST API', 'system', 'success');
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

// ==========================================
// 2. Homepage Content Endpoints
// ==========================================
apiRouter.get('/homepage', (_req: Request, res: Response) => {
  try {
    const homepage = backendStorage.getHomepageContent();
    res.json({ success: true, data: homepage });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

apiRouter.put('/homepage', (req: Request, res: Response) => {
  try {
    const updated = backendStorage.updateHomepageContent(req.body);
    backendStorage.addTelemetry('Homepage announcement and banner updated', 'system', 'success');
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

// ==========================================
// 3. Technical Verticals Endpoints
// ==========================================
apiRouter.get('/technical-verticals', (_req: Request, res: Response) => {
  try {
    const verticals = backendStorage.getTechnicalVerticals();
    res.json({ success: true, data: verticals });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

apiRouter.put('/technical-verticals', (req: Request, res: Response) => {
  try {
    const updated = backendStorage.updateTechnicalVerticals(req.body);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

// ==========================================
// 4. Publications Endpoints
// ==========================================
apiRouter.get('/publications', (req: Request, res: Response) => {
  try {
    const { type, tag, search, year } = req.query;
    const publications = backendStorage.getPublications({
      type: type as string,
      tag: tag as string,
      search: search as string,
      year: year ? Number(year) : undefined
    });
    res.json({ success: true, count: publications.length, data: publications });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

apiRouter.get('/publications/:id', (req: Request, res: Response) => {
  try {
    const pub = backendStorage.getPublicationById(req.params.id);
    if (!pub) {
      res.status(404).json({ success: false, error: 'Publication not found' });
      return;
    }
    res.json({ success: true, data: pub });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

apiRouter.post('/publications', (req: Request, res: Response) => {
  try {
    if (!req.body.title) {
      res.status(400).json({ success: false, error: 'Publication title is required' });
      return;
    }
    const created = backendStorage.addPublication(req.body);
    backendStorage.addTelemetry(`New publication registered: "${created.title}"`, 'publication', 'success');
    res.status(201).json({ success: true, data: created });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

apiRouter.put('/publications/:id', (req: Request, res: Response) => {
  try {
    const updated = backendStorage.updatePublication(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ success: false, error: 'Publication not found' });
      return;
    }
    backendStorage.addTelemetry(`Publication "${updated.title}" updated`, 'publication', 'success');
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

apiRouter.delete('/publications/:id', (req: Request, res: Response) => {
  try {
    const ok = backendStorage.deletePublication(req.params.id);
    if (!ok) {
      res.status(404).json({ success: false, error: 'Publication not found' });
      return;
    }
    backendStorage.addTelemetry(`Publication ${req.params.id} deleted`, 'publication', 'warning');
    res.json({ success: true, message: 'Publication deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

apiRouter.post('/publications/:id/note', (req: Request, res: Response) => {
  try {
    const { note } = req.body;
    const updated = backendStorage.setPublicationNote(req.params.id, note || '');
    if (!updated) {
      res.status(404).json({ success: false, error: 'Publication not found' });
      return;
    }
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

// ==========================================
// 5. Blog Posts & Lab Logs Endpoints
// ==========================================
apiRouter.get('/blog-posts', (req: Request, res: Response) => {
  try {
    const { status, tag, search } = req.query;
    const posts = backendStorage.getBlogPosts({
      status: status as string,
      tag: tag as string,
      search: search as string
    });
    res.json({ success: true, count: posts.length, data: posts });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

apiRouter.get('/blog-posts/:id', (req: Request, res: Response) => {
  try {
    const post = backendStorage.getBlogPostById(req.params.id);
    if (!post) {
      res.status(404).json({ success: false, error: 'Blog post not found' });
      return;
    }
    res.json({ success: true, data: post });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

apiRouter.post('/blog-posts', (req: Request, res: Response) => {
  try {
    if (!req.body.title) {
      res.status(400).json({ success: false, error: 'Title is required' });
      return;
    }
    const created = backendStorage.addBlogPost(req.body);
    backendStorage.addTelemetry(`New lab log posted: "${created.title}"`, 'blog', 'success');
    res.status(201).json({ success: true, data: created });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

apiRouter.put('/blog-posts/:id', (req: Request, res: Response) => {
  try {
    const updated = backendStorage.updateBlogPost(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ success: false, error: 'Blog post not found' });
      return;
    }
    backendStorage.addTelemetry(`Lab log "${updated.title}" modified`, 'blog', 'success');
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

apiRouter.delete('/blog-posts/:id', (req: Request, res: Response) => {
  try {
    const ok = backendStorage.deleteBlogPost(req.params.id);
    if (!ok) {
      res.status(404).json({ success: false, error: 'Blog post not found' });
      return;
    }
    backendStorage.addTelemetry(`Lab log ${req.params.id} removed`, 'blog', 'warning');
    res.json({ success: true, message: 'Blog post removed' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

apiRouter.post('/blog-posts/:id/like', (req: Request, res: Response) => {
  try {
    const { userId } = req.body;
    const result = backendStorage.likeBlogPost(req.params.id, userId || 'anonymous');
    if (!result) {
      res.status(404).json({ success: false, error: 'Blog post not found' });
      return;
    }
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

apiRouter.post('/blog-posts/:id/comments', (req: Request, res: Response) => {
  try {
    const comment = backendStorage.addBlogComment(req.params.id, req.body);
    if (!comment) {
      res.status(404).json({ success: false, error: 'Blog post not found' });
      return;
    }
    res.status(201).json({ success: true, data: comment });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

// ==========================================
// 6. Micrograph & Material Gallery Endpoints
// ==========================================
apiRouter.get('/gallery', (req: Request, res: Response) => {
  try {
    const { category, search } = req.query;
    const items = backendStorage.getGallery({
      category: category as string,
      search: search as string
    });
    res.json({ success: true, count: items.length, data: items });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

apiRouter.get('/gallery/:id', (req: Request, res: Response) => {
  try {
    const item = backendStorage.getGalleryById(req.params.id);
    if (!item) {
      res.status(404).json({ success: false, error: 'Gallery item not found' });
      return;
    }
    res.json({ success: true, data: item });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

apiRouter.post('/gallery', (req: Request, res: Response) => {
  try {
    if (!req.body.title) {
      res.status(400).json({ success: false, error: 'Figure title is required' });
      return;
    }
    const created = backendStorage.addGalleryItem(req.body);
    backendStorage.addTelemetry(`Micrograph uploaded to gallery: "${created.title}"`, 'gallery', 'success');
    res.status(201).json({ success: true, data: created });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

apiRouter.put('/gallery/:id', (req: Request, res: Response) => {
  try {
    const updated = backendStorage.updateGalleryItem(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ success: false, error: 'Gallery item not found' });
      return;
    }
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

apiRouter.delete('/gallery/:id', (req: Request, res: Response) => {
  try {
    const ok = backendStorage.deleteGalleryItem(req.params.id);
    if (!ok) {
      res.status(404).json({ success: false, error: 'Gallery item not found' });
      return;
    }
    res.json({ success: true, message: 'Gallery item deleted' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

apiRouter.post('/gallery/:id/note', (req: Request, res: Response) => {
  try {
    const { note } = req.body;
    const updated = backendStorage.setGalleryNote(req.params.id, note || '');
    if (!updated) {
      res.status(404).json({ success: false, error: 'Gallery item not found' });
      return;
    }
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

// ==========================================
// 7. Career Milestones Endpoints
// ==========================================
apiRouter.get('/career-journey', (_req: Request, res: Response) => {
  try {
    const journey = backendStorage.getCareerJourney();
    res.json({ success: true, data: journey });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

apiRouter.post('/career-journey', (req: Request, res: Response) => {
  try {
    const updated = backendStorage.addCareerMilestone(req.body);
    res.status(201).json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

apiRouter.put('/career-journey/:index', (req: Request, res: Response) => {
  try {
    const idx = parseInt(req.params.index, 10);
    const updated = backendStorage.updateCareerMilestone(idx, req.body);
    if (!updated) {
      res.status(404).json({ success: false, error: 'Milestone not found' });
      return;
    }
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

apiRouter.delete('/career-journey/:index', (req: Request, res: Response) => {
  try {
    const idx = parseInt(req.params.index, 10);
    const ok = backendStorage.deleteCareerMilestone(idx);
    if (!ok) {
      res.status(404).json({ success: false, error: 'Milestone not found' });
      return;
    }
    res.json({ success: true, message: 'Career milestone deleted' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

// ==========================================
// 8. Academic Foundation Endpoints
// ==========================================
apiRouter.get('/academic-foundation', (_req: Request, res: Response) => {
  try {
    const degrees = backendStorage.getAcademicFoundation();
    res.json({ success: true, data: degrees });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

apiRouter.post('/academic-foundation', (req: Request, res: Response) => {
  try {
    const updated = backendStorage.addAcademicDegree(req.body);
    res.status(201).json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

apiRouter.put('/academic-foundation/:index', (req: Request, res: Response) => {
  try {
    const idx = parseInt(req.params.index, 10);
    const updated = backendStorage.updateAcademicDegree(idx, req.body);
    if (!updated) {
      res.status(404).json({ success: false, error: 'Degree not found' });
      return;
    }
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

apiRouter.delete('/academic-foundation/:index', (req: Request, res: Response) => {
  try {
    const idx = parseInt(req.params.index, 10);
    const ok = backendStorage.deleteAcademicDegree(idx);
    if (!ok) {
      res.status(404).json({ success: false, error: 'Degree not found' });
      return;
    }
    res.json({ success: true, message: 'Academic degree removed' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

// ==========================================
// 9. Awards & Honors Endpoints
// ==========================================
apiRouter.get('/awards', (_req: Request, res: Response) => {
  try {
    const awards = backendStorage.getAwards();
    res.json({ success: true, data: awards });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

apiRouter.post('/awards', (req: Request, res: Response) => {
  try {
    const updated = backendStorage.addAward(req.body);
    res.status(201).json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

apiRouter.put('/awards/:index', (req: Request, res: Response) => {
  try {
    const idx = parseInt(req.params.index, 10);
    const updated = backendStorage.updateAward(idx, req.body);
    if (!updated) {
      res.status(404).json({ success: false, error: 'Award not found' });
      return;
    }
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

apiRouter.delete('/awards/:index', (req: Request, res: Response) => {
  try {
    const idx = parseInt(req.params.index, 10);
    const ok = backendStorage.deleteAward(idx);
    if (!ok) {
      res.status(404).json({ success: false, error: 'Award not found' });
      return;
    }
    res.json({ success: true, message: 'Award removed' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

// ==========================================
// 10. Lab Tasks & Reminders Endpoints
// ==========================================
apiRouter.get('/tasks', (_req: Request, res: Response) => {
  try {
    const tasks = backendStorage.getTasks();
    res.json({ success: true, count: tasks.length, data: tasks });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

apiRouter.post('/tasks', (req: Request, res: Response) => {
  try {
    if (!req.body.title) {
      res.status(400).json({ success: false, error: 'Task title is required' });
      return;
    }
    const created = backendStorage.addTask(req.body);
    res.status(201).json({ success: true, data: created });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

apiRouter.put('/tasks/:id', (req: Request, res: Response) => {
  try {
    const updated = backendStorage.updateTask(req.params.id, req.body);
    if (!updated) {
      res.status(404).json({ success: false, error: 'Task not found' });
      return;
    }
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

apiRouter.delete('/tasks/:id', (req: Request, res: Response) => {
  try {
    const ok = backendStorage.deleteTask(req.params.id);
    if (!ok) {
      res.status(404).json({ success: false, error: 'Task not found' });
      return;
    }
    res.json({ success: true, message: 'Task deleted' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

// ==========================================
// 11. Scientometrics & Analytics Endpoints
// ==========================================
apiRouter.get('/analytics', (_req: Request, res: Response) => {
  try {
    const analytics = backendStorage.getAnalytics();
    res.json({ success: true, data: analytics });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

apiRouter.put('/analytics', (req: Request, res: Response) => {
  try {
    const updated = backendStorage.updateAnalytics(req.body);
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

// ==========================================
// 12. Inquiries & Contact Messages Endpoints
// ==========================================
apiRouter.get('/messages', (_req: Request, res: Response) => {
  try {
    const messages = backendStorage.getMessages();
    res.json({ success: true, count: messages.length, data: messages });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

apiRouter.post('/messages', (req: Request, res: Response) => {
  try {
    if (!req.body.name || !req.body.message) {
      res.status(400).json({ success: false, error: 'Name and message are required' });
      return;
    }
    const created = backendStorage.addMessage(req.body);
    backendStorage.addTelemetry(`New scientific collaboration inquiry from ${created.name}`, 'system', 'info');
    res.status(201).json({ success: true, data: created });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

apiRouter.patch('/messages/:id/status', (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const updated = backendStorage.updateMessageStatus(req.params.id, status);
    if (!updated) {
      res.status(404).json({ success: false, error: 'Message not found' });
      return;
    }
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

apiRouter.delete('/messages/:id', (req: Request, res: Response) => {
  try {
    const ok = backendStorage.deleteMessage(req.params.id);
    if (!ok) {
      res.status(404).json({ success: false, error: 'Message not found' });
      return;
    }
    res.json({ success: true, message: 'Message removed' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

// ==========================================
// 13. Active Sessions Endpoints
// ==========================================
apiRouter.get('/sessions', (_req: Request, res: Response) => {
  try {
    const sessions = backendStorage.getSessions();
    res.json({ success: true, data: sessions });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

apiRouter.delete('/sessions/:id', (req: Request, res: Response) => {
  try {
    const ok = backendStorage.deleteSession(req.params.id);
    if (!ok) {
      res.status(404).json({ success: false, error: 'Session not found' });
      return;
    }
    res.json({ success: true, message: 'Session revoked' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

// ==========================================
// 14. System Settings Endpoints
// ==========================================
apiRouter.get('/settings', (_req: Request, res: Response) => {
  try {
    const settings = backendStorage.getSettings();
    res.json({ success: true, data: settings });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

apiRouter.put('/settings', (req: Request, res: Response) => {
  try {
    const updated = backendStorage.updateSettings(req.body);
    backendStorage.addTelemetry('System preferences saved via API', 'system', 'success');
    res.json({ success: true, data: updated });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

// ==========================================
// 15. Telemetry Logs Endpoints
// ==========================================
apiRouter.get('/telemetry', (_req: Request, res: Response) => {
  try {
    const logs = backendStorage.getTelemetry();
    res.json({ success: true, count: logs.length, data: logs });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});

apiRouter.post('/telemetry', (req: Request, res: Response) => {
  try {
    const { event, type, status } = req.body;
    const log = backendStorage.addTelemetry(event || 'Generic Event', type || 'system', status || 'info');
    res.status(201).json({ success: true, data: log });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err?.message });
  }
});
