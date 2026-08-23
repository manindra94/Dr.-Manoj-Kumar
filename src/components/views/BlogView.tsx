import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Clock,
  ArrowRight,
  Tag,
  Bookmark,
  Mail,
  CheckCircle2,
  Plus,
  Edit3,
  Trash2,
  ShieldCheck,
  Heart,
  MessageSquare,
  Send,
  User,
  Share2
} from 'lucide-react';
import { localDB, StorageState } from '../../lib/db';
import { useAuth } from '../../lib/AuthContext';
import { BlogPost } from '../../types';

interface BlogViewProps {
  onOpenAddPostModal?: () => void;
  onOpenEditPostModal?: (post: BlogPost) => void;
}

export const BlogView: React.FC<BlogViewProps> = ({
  onOpenAddPostModal,
  onOpenEditPostModal
}) => {
  const [dbState, setDbState] = useState<StorageState>(localDB.getState());
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(dbState.blogPosts[0] || null);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [commentText, setCommentText] = useState('');

  const { user, isAdmin } = useAuth();

  useEffect(() => {
    return localDB.subscribe((state) => {
      setDbState(state);
      if (selectedPost) {
        const updated = state.blogPosts.find((p) => p.id === selectedPost.id);
        if (updated) setSelectedPost(updated);
      } else if (state.blogPosts.length > 0) {
        setSelectedPost(state.blogPosts[0]);
      }
    });
  }, [selectedPost]);

  const handleDelete = async (e: React.MouseEvent, id: string, title: string) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete lab log: "${title}"?`)) {
      await localDB.deleteBlogPost(id);
      if (selectedPost?.id === id) {
        setSelectedPost(null);
      }
    }
  };

  const handleLike = (e: React.MouseEvent, postId: string) => {
    e.stopPropagation();
    const userId = user?.id || 'guest-user';
    localDB.toggleLikeBlogPost(postId, userId);
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPost || !commentText.trim()) return;

    localDB.addBlogComment(selectedPost.id, {
      authorName: user?.displayName || 'Visiting Researcher',
      authorRole: isAdmin ? 'Admin' : 'Researcher',
      content: commentText.trim(),
      userAvatar: user?.avatarUrl
    });

    setCommentText('');
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (newsletterEmail) {
      setSubscribed(true);
      localDB.addTelemetry(`Newsletter subscription registered for ${newsletterEmail}`, 'system', 'success');
      setTimeout(() => setSubscribed(false), 4000);
      setNewsletterEmail('');
    }
  };

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-300">
      {/* Header */}
      <section className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#122131] border border-[#ffc640]/30 text-[#ffc640] font-mono text-xs font-semibold uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-[#ffc640] animate-pulse" />
            CSIR-IMMT LABORATORY LOGS ({dbState.blogPosts.length} POSTS)
          </div>

          <div className="flex items-center gap-2">
            {isAdmin && onOpenAddPostModal && (
              <button
                onClick={onOpenAddPostModal}
                className="px-4 py-2 rounded-lg bg-[#ffc640] hover:bg-[#e3aa00] text-[#051424] font-mono text-xs font-bold uppercase flex items-center gap-1.5 transition-all shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>NEW LAB LOG ENTRY</span>
              </button>
            )}
          </div>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold font-serif text-[#d4e4fa]">
          Research <span className="text-[#ffc640]">Blog & Lab Logs</span>
        </h1>

        <p className="text-xs sm:text-sm text-[#c6c6cd] leading-relaxed max-w-2xl font-sans">
          Official laboratory logs, microstructural insights, and technical briefs from CSIR-Institute of Minerals and Materials Technology.
        </p>
      </section>

      {/* Featured Article Hero Card */}
      {selectedPost && (
        <section className="rounded-2xl bg-gradient-to-br from-[#122131] to-[#1c2b3c] border border-[#273647] p-6 space-y-5 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-2 font-mono text-xs text-[#2fd9f4]">
            <span className="px-2.5 py-1 rounded bg-[#051424] border border-[#273647] font-bold">
              {selectedPost.logCode}
            </span>
            <div className="flex items-center gap-3 text-[#c6c6cd]">
              <span>{selectedPost.date}</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-[#ffc640]" />
                {selectedPost.readTime} READ
              </span>
            </div>
          </div>

          {/* Cover image if available */}
          {selectedPost.coverImage && (
            <div className="w-full h-64 rounded-xl overflow-hidden border border-[#273647] bg-[#051424] relative shadow-inner">
              <img
                src={selectedPost.coverImage}
                alt={selectedPost.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-[#051424]/80 text-[10px] font-mono text-[#ffc640] border border-[#273647]">
                TECHNICAL LAB FIGURE
              </div>
            </div>
          )}

          <h2 className="text-2xl sm:text-3xl font-bold font-serif text-[#d4e4fa] leading-tight">
            {selectedPost.title}
          </h2>

          <p className="text-xs sm:text-sm text-[#c6c6cd] leading-relaxed whitespace-pre-line font-sans">
            {selectedPost.content}
          </p>

          <div className="flex flex-wrap gap-2 pt-2 font-mono text-xs">
            {selectedPost.tags.map((tag, idx) => (
              <span key={idx} className="px-2.5 py-1 rounded bg-[#051424] text-[#2fd9f4] border border-[#273647]">
                {tag}
              </span>
            ))}
          </div>

          {/* Interaction Bar */}
          <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-[#273647] font-mono text-xs">
            <div className="flex items-center gap-2">
              {/* Like Button */}
              <button
                onClick={(e) => handleLike(e, selectedPost.id)}
                className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition-all ${
                  selectedPost.likedBy?.includes(user?.id || '')
                    ? 'bg-rose-950/60 border-rose-500 text-rose-400 font-bold'
                    : 'bg-[#051424] border-[#273647] text-[#c6c6cd] hover:text-rose-400'
                }`}
                title="Like this research log"
              >
                <Heart className={`w-3.5 h-3.5 ${selectedPost.likedBy?.includes(user?.id || '') ? 'fill-rose-400 text-rose-400' : ''}`} />
                <span>{selectedPost.likesCount || 0} Likes</span>
              </button>

              {/* Bookmark */}
              <button
                onClick={() => localDB.toggleOfflineBlogPost(selectedPost.id)}
                className={`px-3 py-1.5 rounded-lg border flex items-center gap-1.5 transition-all ${
                  selectedPost.isSavedOffline
                    ? 'bg-emerald-950/60 border-emerald-500 text-emerald-400 font-bold'
                    : 'bg-[#051424] border-[#273647] text-[#c6c6cd] hover:text-[#d4e4fa]'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5 text-[#ffc640]" />
                <span>{selectedPost.isSavedOffline ? 'Saved Offline' : 'Bookmark Log'}</span>
              </button>

              {isAdmin && onOpenEditPostModal && (
                <button
                  onClick={() => onOpenEditPostModal(selectedPost)}
                  className="px-3 py-1.5 rounded-lg bg-[#1c2b3c] hover:bg-[#273647] text-[#ffc640] border border-[#ffc640]/40 font-bold flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Log</span>
                </button>
              )}
            </div>

            <div className="text-xs text-[#ffc640] font-bold">
              STATUS: {selectedPost.status}
            </div>
          </div>

          {/* Interactive Peer Discussion & Comment Section */}
          <div className="pt-4 border-t border-[#273647] space-y-4">
            <div className="flex items-center gap-2 font-mono text-xs text-[#d4e4fa] font-bold">
              <MessageSquare className="w-4 h-4 text-[#2fd9f4]" />
              <span>PEER DISCUSSION & LAB COMMENTS ({selectedPost.comments?.length || 0})</span>
            </div>

            {/* Comment List */}
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1 font-mono text-xs">
              {(!selectedPost.comments || selectedPost.comments.length === 0) ? (
                <div className="p-3 rounded-lg bg-[#051424] border border-[#273647] text-slate-400 text-center text-xs">
                  No comments yet. Be the first researcher to contribute insights!
                </div>
              ) : (
                selectedPost.comments.map((comm) => (
                  <div
                    key={comm.id}
                    className="p-3 rounded-xl bg-[#051424] border border-[#273647] space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-[#d4e4fa]">{comm.authorName}</span>
                        <span className={`px-1.5 py-0.2 rounded text-[9px] uppercase font-bold ${
                          comm.authorRole === 'Admin' ? 'bg-[#ffc640]/20 text-[#ffc640]' : 'bg-[#2fd9f4]/20 text-[#2fd9f4]'
                        }`}>
                          {comm.authorRole}
                        </span>
                      </div>
                      <span className="text-[#c6c6cd] text-[10px]">{comm.timestamp}</span>
                    </div>
                    <p className="text-slate-300 font-sans text-xs leading-relaxed">{comm.content}</p>
                  </div>
                ))
              )}
            </div>

            {/* Add Comment Form for Researcher/Admin */}
            <form onSubmit={handleAddComment} className="flex gap-2">
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Share your scientific comment, experimental insight, or question..."
                className="flex-1 px-3 py-2 rounded-lg bg-[#051424] border border-[#273647] text-xs font-mono text-[#d4e4fa] focus:border-[#2fd9f4] outline-none"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-[#2fd9f4] hover:bg-[#1ebcd4] text-[#051424] font-bold font-mono text-xs flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Post</span>
              </button>
            </form>
          </div>
        </section>
      )}

      {/* Grid of Other Laboratory Logs */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold font-serif text-[#d4e4fa]">
          All Laboratory Logs & Briefs
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dbState.blogPosts.map((post) => (
            <article
              key={post.id}
              onClick={() => setSelectedPost(post)}
              className={`p-5 rounded-2xl bg-[#122131] border transition-all cursor-pointer space-y-3 shadow-md ${
                selectedPost?.id === post.id
                  ? 'border-[#ffc640] shadow-lg'
                  : 'border-[#1c2b3c] hover:border-[#ffc640]/40'
              }`}
            >
              <div className="flex items-center justify-between text-xs font-mono text-[#2fd9f4]">
                <span>{post.logCode}</span>
                <span className="text-[#c6c6cd]">{post.date}</span>
              </div>

              {post.coverImage && (
                <div className="w-full h-32 rounded-lg overflow-hidden border border-[#273647] bg-[#051424]">
                  <img
                    src={post.coverImage}
                    alt={post.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <h3 className="font-serif font-bold text-lg text-[#d4e4fa] hover:text-[#ffc640] transition-colors leading-snug">
                {post.title}
              </h3>

              <p className="text-xs text-[#c6c6cd] line-clamp-2 leading-relaxed font-sans">
                {post.content}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-[#1c2b3c] text-xs font-mono text-[#ffc640]">
                <div className="flex items-center gap-3">
                  <span>{post.readTime} read</span>
                  <span className="text-[#c6c6cd]">•</span>
                  <span className="text-rose-400 flex items-center gap-1">
                    <Heart className="w-3 h-3" /> {post.likesCount || 0}
                  </span>
                  <span className="text-[#2fd9f4] flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" /> {post.comments?.length || 0}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {isAdmin && (
                    <button
                      onClick={(e) => handleDelete(e, post.id, post.title)}
                      className="p-1 rounded bg-[#051424] text-rose-400 hover:bg-rose-950/80"
                      title="Delete post"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <span className="flex items-center gap-1 font-bold text-[#ffc640]">
                    Read Brief <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Newsletter / Collaboration Subscription */}
      <section className="p-6 rounded-2xl bg-gradient-to-r from-[#122131] to-[#051424] border border-[#273647] space-y-4">
        <div className="max-w-xl space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono text-[#ffc640] font-bold">
            <Mail className="w-4 h-4" />
            <span>METALLURGICAL RESEARCH DISPATCH</span>
          </div>
          <h2 className="text-xl font-serif font-bold text-[#d4e4fa]">
            Subscribe to Monthly Lab Technical Bulletins
          </h2>
          <p className="text-xs text-[#c6c6cd] font-sans">
            Receive monthly briefs on laser additive manufacturing microstructures, corrosion testing datasets, and pre-print releases.
          </p>
        </div>

        {subscribed ? (
          <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 font-mono text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Subscribed successfully! Updates will be dispatched to your inbox.</span>
          </div>
        ) : (
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2 max-w-md">
            <input
              type="email"
              required
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="researcher@university.edu"
              className="flex-1 px-4 py-2.5 rounded-lg bg-[#051424] border border-[#273647] text-xs font-mono text-[#d4e4fa] focus:border-[#ffc640] outline-none"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-lg bg-[#ffc640] hover:bg-[#e3aa00] text-[#051424] font-bold font-mono text-xs uppercase tracking-wider"
            >
              Subscribe
            </button>
          </form>
        )}
      </section>
    </div>
  );
};
