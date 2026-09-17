import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Search,
  X,
  BookOpen,
  FileText,
  Image,
  ArrowRight,
  ExternalLink,
  Tag,
  Calendar,
  Sparkles,
  Command
} from 'lucide-react';
import { localDB, StorageState } from '../lib/db';
import { Publication, BlogPost, GalleryItem } from '../types';

interface GlobalSearchBarProps {
  onSelectPublication: (pub: Publication) => void;
  onSelectBlogPost: (post: BlogPost) => void;
  onSelectGalleryItem: (item: GalleryItem) => void;
  onViewAllInTab: (tab: 'papers' | 'blog' | 'gallery', query: string) => void;
}

type SearchCategory = 'all' | 'papers' | 'blog' | 'gallery';

export const GlobalSearchBar: React.FC<GlobalSearchBarProps> = ({
  onSelectPublication,
  onSelectBlogPost,
  onSelectGalleryItem,
  onViewAllInTab
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<SearchCategory>('all');
  const [dbState, setDbState] = useState<StorageState>(localDB.getState());
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return localDB.subscribe(setDbState);
  }, []);

  // Global Keyboard shortcuts: Ctrl+K / Cmd+K / "/" to focus, Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      } else if (e.key === '/' && document.activeElement !== inputRef.current) {
        const activeTag = document.activeElement?.tagName.toLowerCase();
        if (activeTag !== 'input' && activeTag !== 'textarea') {
          e.preventDefault();
          inputRef.current?.focus();
          setIsOpen(true);
        }
      } else if (e.key === 'Escape') {
        setIsOpen(false);
        setIsMobileExpanded(false);
        inputRef.current?.blur();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setIsMobileExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Tokenized search logic
  const queryTokens = useMemo(() => {
    return query
      .toLowerCase()
      .trim()
      .split(/\s+/)
      .filter(Boolean);
  }, [query]);

  // Filter Publications
  const matchedPublications = useMemo(() => {
    if (queryTokens.length === 0) return [];
    const publications = dbState.publications || [];

    return publications.filter((pub) => {
      const searchTarget = [
        pub.title || '',
        pub.abstract || '',
        pub.authors || '',
        pub.journal || '',
        pub.type || '',
        pub.year?.toString() || '',
        pub.doi || '',
        pub.patentNo || '',
        ...(pub.tags || [])
      ]
        .join(' ')
        .toLowerCase();

      return queryTokens.every((token) => searchTarget.includes(token));
    });
  }, [queryTokens, dbState.publications]);

  // Filter Blog Posts
  const matchedBlogPosts = useMemo(() => {
    if (queryTokens.length === 0) return [];
    const blogPosts = dbState.blogPosts || [];

    return blogPosts.filter((post) => {
      const searchTarget = [
        post.title || '',
        post.excerpt || '',
        post.content || '',
        post.logCode || '',
        ...(post.tags || [])
      ]
        .join(' ')
        .toLowerCase();

      return queryTokens.every((token) => searchTarget.includes(token));
    });
  }, [queryTokens, dbState.blogPosts]);

  // Filter Gallery Items
  const matchedGalleryItems = useMemo(() => {
    if (queryTokens.length === 0) return [];
    const gallery = dbState.gallery || [];

    return gallery.filter((item) => {
      const searchTarget = [
        item.title || '',
        item.description || '',
        item.category || '',
        item.figureNo || '',
        item.scaleBar || ''
      ]
        .join(' ')
        .toLowerCase();

      return queryTokens.every((token) => searchTarget.includes(token));
    });
  }, [queryTokens, dbState.gallery]);

  const totalResultsCount =
    matchedPublications.length + matchedBlogPosts.length + matchedGalleryItems.length;

  const handleClear = () => {
    setQuery('');
    setIsOpen(false);
    setIsMobileExpanded(false);
    inputRef.current?.focus();
  };

  const handleSelectPub = (pub: Publication) => {
    onSelectPublication(pub);
    setIsOpen(false);
    setIsMobileExpanded(false);
  };

  const handleSelectPost = (post: BlogPost) => {
    onSelectBlogPost(post);
    setIsOpen(false);
    setIsMobileExpanded(false);
  };

  const handleSelectGallery = (item: GalleryItem) => {
    onSelectGalleryItem(item);
    setIsOpen(false);
    setIsMobileExpanded(false);
  };

  // Helper to highlight matching text
  const highlightMatches = (text: string) => {
    if (!text || queryTokens.length === 0) return text;
    const escaped = queryTokens.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const regex = new RegExp(`(${escaped.join('|')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark
          key={index}
          className="bg-[#ffc640]/30 text-[#ffc640] px-0.5 rounded font-semibold"
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div ref={containerRef} className="relative flex-1 max-w-md mx-1 sm:mx-3">
      {/* Mobile trigger button when collapsed on extra small viewports */}
      <div className="sm:hidden">
        {!isMobileExpanded ? (
          <button
            onClick={() => {
              setIsMobileExpanded(true);
              setIsOpen(true);
              setTimeout(() => inputRef.current?.focus(), 50);
            }}
            className="p-2 rounded-lg bg-[#122131] hover:bg-[#1c2b3c] text-[#d4e4fa] border border-[#273647] flex items-center justify-center transition-all"
            aria-label="Open Search"
            title="Search Publications, Logs, Micrographs"
          >
            <Search className="w-4 h-4 text-[#ffc640]" />
          </button>
        ) : (
          <div className="fixed inset-x-2 top-2 z-50 bg-[#122131] border border-[#ffc640] rounded-xl shadow-2xl p-2 flex items-center gap-2">
            <Search className="w-4 h-4 text-[#ffc640] shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
              }}
              placeholder="Search papers, logs, micrographs..."
              className="w-full bg-transparent text-xs text-[#d4e4fa] placeholder-slate-400 outline-none"
            />
            {query && (
              <button onClick={() => setQuery('')} className="p-1 text-slate-400 hover:text-white">
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              onClick={() => {
                setIsMobileExpanded(false);
                setIsOpen(false);
              }}
              className="text-xs font-mono text-slate-400 px-1.5 py-1 rounded bg-[#051424]"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Main Search Input for Desktop & Tablet */}
      <div className="hidden sm:block relative">
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border transition-all ${
            isOpen && query
              ? 'bg-[#122131] border-[#ffc640] shadow-lg ring-1 ring-[#ffc640]/30'
              : 'bg-[#0b1b2d] border-[#273647] hover:border-[#384c63]'
          }`}
        >
          <Search className="w-3.5 h-3.5 text-[#ffc640] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onFocus={() => setIsOpen(true)}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            placeholder="Search papers, logs, micrographs by title or keywords..."
            className="w-full bg-transparent text-xs text-[#d4e4fa] placeholder-slate-400 outline-none font-sans"
          />

          {query ? (
            <button
              onClick={handleClear}
              className="p-0.5 rounded text-slate-400 hover:text-white hover:bg-[#1c2b3c] transition-colors"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="hidden lg:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-[#1c2b3c] border border-[#273647] text-[10px] font-mono text-slate-400 shrink-0 select-none">
              <Command className="w-2.5 h-2.5" />K
            </kbd>
          )}
        </div>
      </div>

      {/* Search Results Dropdown Popover */}
      {isOpen && query.trim().length > 0 && (
        <div className="absolute left-0 right-0 sm:left-auto sm:right-auto sm:w-[540px] top-full mt-2 bg-[#122131] border border-[#273647] rounded-2xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 font-mono">
          {/* Header Bar with Category Filters */}
          <div className="p-3 bg-[#0a1726] border-b border-[#273647] space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#ffc640]" />
                <span>
                  {totalResultsCount} result{totalResultsCount === 1 ? '' : 's'} for &ldquo;
                  <span className="text-[#ffc640]">{query}</span>&rdquo;
                </span>
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
              >
                <kbd className="px-1 py-0.5 rounded bg-[#1c2b3c] border border-[#273647] text-[9px]">ESC</kbd>
                <span>close</span>
              </button>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] pt-1">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-2.5 py-1 rounded-lg border transition-all shrink-0 ${
                  activeCategory === 'all'
                    ? 'bg-[#ffc640] text-[#051424] font-bold border-[#ffc640]'
                    : 'bg-[#122131] text-slate-300 border-[#273647] hover:border-slate-500'
                }`}
              >
                All ({totalResultsCount})
              </button>
              <button
                onClick={() => setActiveCategory('papers')}
                className={`px-2.5 py-1 rounded-lg border flex items-center gap-1 transition-all shrink-0 ${
                  activeCategory === 'papers'
                    ? 'bg-[#2fd9f4] text-[#051424] font-bold border-[#2fd9f4]'
                    : 'bg-[#122131] text-slate-300 border-[#273647] hover:border-slate-500'
                }`}
              >
                <BookOpen className="w-3 h-3" />
                <span>Publications ({matchedPublications.length})</span>
              </button>
              <button
                onClick={() => setActiveCategory('blog')}
                className={`px-2.5 py-1 rounded-lg border flex items-center gap-1 transition-all shrink-0 ${
                  activeCategory === 'blog'
                    ? 'bg-[#ffc640] text-[#051424] font-bold border-[#ffc640]'
                    : 'bg-[#122131] text-slate-300 border-[#273647] hover:border-slate-500'
                }`}
              >
                <FileText className="w-3 h-3" />
                <span>Lab Logs ({matchedBlogPosts.length})</span>
              </button>
              <button
                onClick={() => setActiveCategory('gallery')}
                className={`px-2.5 py-1 rounded-lg border flex items-center gap-1 transition-all shrink-0 ${
                  activeCategory === 'gallery'
                    ? 'bg-purple-400 text-[#051424] font-bold border-purple-400'
                    : 'bg-[#122131] text-slate-300 border-[#273647] hover:border-slate-500'
                }`}
              >
                <Image className="w-3 h-3" />
                <span>Gallery ({matchedGalleryItems.length})</span>
              </button>
            </div>
          </div>

          {/* Results List */}
          <div className="max-h-96 overflow-y-auto p-2 space-y-2">
            {totalResultsCount === 0 ? (
              <div className="py-8 px-4 text-center space-y-2">
                <Search className="w-8 h-8 text-slate-500 mx-auto" />
                <p className="text-xs text-slate-300 font-bold">
                  No matches found for &ldquo;{query}&rdquo;
                </p>
                <p className="text-[11px] text-slate-400 font-sans max-w-sm mx-auto leading-relaxed">
                  Try searching for keywords like <span className="text-[#2fd9f4] font-mono">laser</span>,{' '}
                  <span className="text-[#2fd9f4] font-mono">cladding</span>,{' '}
                  <span className="text-[#2fd9f4] font-mono">corrosion</span>,{' '}
                  <span className="text-[#2fd9f4] font-mono">Inconel</span>, or author names.
                </p>
              </div>
            ) : (
              <>
                {/* 1. Publications Section */}
                {(activeCategory === 'all' || activeCategory === 'papers') &&
                  matchedPublications.length > 0 && (
                    <div className="space-y-1.5">
                      <div className="px-2 py-1 flex items-center justify-between text-[10px] text-[#2fd9f4] font-bold uppercase tracking-wider">
                        <span className="flex items-center gap-1.5">
                          <BookOpen className="w-3 h-3" /> Publications & Patents (
                          {matchedPublications.length})
                        </span>
                        <button
                          onClick={() => {
                            onViewAllInTab('papers', query);
                            setIsOpen(false);
                            setIsMobileExpanded(false);
                          }}
                          className="hover:underline flex items-center gap-1 text-[10px]"
                        >
                          View in Papers <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      </div>

                      {matchedPublications.slice(0, activeCategory === 'papers' ? 10 : 3).map((pub) => (
                        <div
                          key={pub.id}
                          onClick={() => handleSelectPub(pub)}
                          className="p-2.5 rounded-xl bg-[#051424] hover:bg-[#1a2d42] border border-[#273647] hover:border-[#2fd9f4] cursor-pointer transition-all space-y-1 group"
                        >
                          <div className="flex items-center justify-between text-[10px] text-slate-400">
                            <span className="px-1.5 py-0.5 rounded bg-[#1c2b3c] text-[#2fd9f4] font-bold">
                              {pub.type} • {pub.year}
                            </span>
                            <span>{pub.citations} citations</span>
                          </div>

                          <h4 className="text-xs font-serif font-bold text-[#d4e4fa] group-hover:text-[#2fd9f4] transition-colors line-clamp-1">
                            {highlightMatches(pub.title)}
                          </h4>

                          <p className="text-[11px] text-slate-400 font-sans line-clamp-1">
                            {highlightMatches(pub.abstract || pub.authors)}
                          </p>

                          {pub.tags && pub.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-0.5">
                              {pub.tags.slice(0, 3).map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="text-[9px] px-1.5 py-0.2 rounded bg-[#0b1b2d] text-[#c6c6cd] border border-[#273647]"
                                >
                                  #{highlightMatches(tag)}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                {/* 2. Blog Posts Section */}
                {(activeCategory === 'all' || activeCategory === 'blog') &&
                  matchedBlogPosts.length > 0 && (
                    <div className="space-y-1.5 pt-2">
                      <div className="px-2 py-1 flex items-center justify-between text-[10px] text-[#ffc640] font-bold uppercase tracking-wider">
                        <span className="flex items-center gap-1.5">
                          <FileText className="w-3 h-3" /> Lab Logs & Blog Posts (
                          {matchedBlogPosts.length})
                        </span>
                        <button
                          onClick={() => {
                            onViewAllInTab('blog', query);
                            setIsOpen(false);
                            setIsMobileExpanded(false);
                          }}
                          className="hover:underline flex items-center gap-1 text-[10px]"
                        >
                          View in Blog <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      </div>

                      {matchedBlogPosts.slice(0, activeCategory === 'blog' ? 10 : 3).map((post) => (
                        <div
                          key={post.id}
                          onClick={() => handleSelectPost(post)}
                          className="p-2.5 rounded-xl bg-[#051424] hover:bg-[#1a2d42] border border-[#273647] hover:border-[#ffc640] cursor-pointer transition-all space-y-1 group"
                        >
                          <div className="flex items-center justify-between text-[10px] text-slate-400">
                            <span className="px-1.5 py-0.5 rounded bg-[#1c2b3c] text-[#ffc640] font-bold">
                              {post.logCode}
                            </span>
                            <span>{post.readTime} read • {post.date}</span>
                          </div>

                          <h4 className="text-xs font-serif font-bold text-[#d4e4fa] group-hover:text-[#ffc640] transition-colors line-clamp-1">
                            {highlightMatches(post.title)}
                          </h4>

                          <p className="text-[11px] text-slate-400 font-sans line-clamp-1">
                            {highlightMatches(post.excerpt || post.content)}
                          </p>

                          {post.tags && post.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-0.5">
                              {post.tags.slice(0, 3).map((tag, idx) => (
                                <span
                                  key={idx}
                                  className="text-[9px] px-1.5 py-0.2 rounded bg-[#0b1b2d] text-[#c6c6cd] border border-[#273647]"
                                >
                                  #{highlightMatches(tag)}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                {/* 3. Gallery Items Section */}
                {(activeCategory === 'all' || activeCategory === 'gallery') &&
                  matchedGalleryItems.length > 0 && (
                    <div className="space-y-1.5 pt-2">
                      <div className="px-2 py-1 flex items-center justify-between text-[10px] text-purple-400 font-bold uppercase tracking-wider">
                        <span className="flex items-center gap-1.5">
                          <Image className="w-3 h-3" /> Micrographs & Gallery (
                          {matchedGalleryItems.length})
                        </span>
                        <button
                          onClick={() => {
                            onViewAllInTab('gallery', query);
                            setIsOpen(false);
                            setIsMobileExpanded(false);
                          }}
                          className="hover:underline flex items-center gap-1 text-[10px]"
                        >
                          View in Gallery <ArrowRight className="w-2.5 h-2.5" />
                        </button>
                      </div>

                      {matchedGalleryItems.slice(0, activeCategory === 'gallery' ? 10 : 3).map((item) => (
                        <div
                          key={item.id}
                          onClick={() => handleSelectGallery(item)}
                          className="p-2.5 rounded-xl bg-[#051424] hover:bg-[#1a2d42] border border-[#273647] hover:border-purple-400 cursor-pointer transition-all flex items-center gap-3 group"
                        >
                          <div className="w-12 h-12 rounded-lg overflow-hidden border border-[#273647] bg-[#0b1b2d] shrink-0">
                            <img
                              src={item.imageUrl}
                              alt={item.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                            />
                          </div>

                          <div className="flex-1 min-w-0 space-y-0.5">
                            <div className="flex items-center justify-between text-[10px] text-slate-400">
                              <span className="px-1.5 py-0.5 rounded bg-[#1c2b3c] text-purple-400 font-bold">
                                {item.category} {item.figureNo ? `• ${item.figureNo}` : ''}
                              </span>
                              {item.scaleBar && <span>{item.scaleBar}</span>}
                            </div>

                            <h4 className="text-xs font-serif font-bold text-[#d4e4fa] group-hover:text-purple-300 transition-colors truncate">
                              {highlightMatches(item.title)}
                            </h4>

                            <p className="text-[11px] text-slate-400 font-sans line-clamp-1">
                              {highlightMatches(item.description)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
              </>
            )}
          </div>

          {/* Quick Tab Jump Footer */}
          {totalResultsCount > 0 && (
            <div className="p-2.5 bg-[#0a1726] border-t border-[#273647] flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-400">
              <span>Press enter or click a record to open directly</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    onViewAllInTab('papers', query);
                    setIsOpen(false);
                    setIsMobileExpanded(false);
                  }}
                  className="text-[#2fd9f4] hover:underline"
                >
                  Filter Papers View →
                </button>
                <button
                  onClick={() => {
                    onViewAllInTab('blog', query);
                    setIsOpen(false);
                    setIsMobileExpanded(false);
                  }}
                  className="text-[#ffc640] hover:underline"
                >
                  Filter Blog View →
                </button>
                <button
                  onClick={() => {
                    onViewAllInTab('gallery', query);
                    setIsOpen(false);
                    setIsMobileExpanded(false);
                  }}
                  className="text-purple-400 hover:underline"
                >
                  Filter Gallery View →
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
