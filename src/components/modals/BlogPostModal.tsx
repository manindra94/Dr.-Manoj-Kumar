import React, { useState, useEffect, useRef } from 'react';
import { X, Save, BookOpen, Upload, Camera, Image as ImageIcon } from 'lucide-react';
import { localDB } from '../../lib/db';
import { BlogPost } from '../../types';

interface BlogPostModalProps {
  postToEdit?: BlogPost | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BlogPostModal: React.FC<BlogPostModalProps> = ({
  postToEdit,
  isOpen,
  onClose
}) => {
  const [logCode, setLogCode] = useState('LOG_043_IMMT');
  const [title, setTitle] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [date, setDate] = useState('AUG 10, 2026');
  const [status, setStatus] = useState<'PUBLISHED' | 'DRAFTING' | 'INTERNAL_REVIEW'>('PUBLISHED');
  const [readTime, setReadTime] = useState('15 MIN');
  const [tags, setTags] = useState('#METAL-3D-PRINTING, #CSIR-IMMT');
  const [imageUrl, setImageUrl] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (postToEdit) {
      setLogCode(postToEdit.logCode);
      setTitle(postToEdit.title);
      setExcerpt(postToEdit.excerpt);
      setContent(postToEdit.content);
      setDate(postToEdit.date);
      setStatus(postToEdit.status);
      setReadTime(postToEdit.readTime);
      setTags(postToEdit.tags.join(', '));
      setImageUrl(postToEdit.imageUrl || '');
      setIsFeatured(!!postToEdit.isFeatured);
    } else {
      setLogCode(`LOG_0${Math.floor(Math.random() * 90 + 10)}_IMMT`);
      setTitle('');
      setExcerpt('');
      setContent('');
      setDate('AUG 2026');
      setStatus('PUBLISHED');
      setReadTime('12 MIN');
      setTags('#METAL-3D-PRINTING, #LAB-NOTES');
      setImageUrl('https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&q=80&w=800');
      setIsFeatured(false);
    }
  }, [postToEdit, isOpen]);

  if (!isOpen) return null;

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file (PNG, JPG, WebP, etc.).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        setImageUrl(result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const tagArray = tags.split(',').map((t) => t.trim()).filter(Boolean);

    if (postToEdit) {
      localDB.updateBlogPost(postToEdit.id, {
        logCode,
        title,
        excerpt,
        content,
        date,
        status,
        readTime,
        tags: tagArray,
        imageUrl: imageUrl || undefined,
        isFeatured
      });
    } else {
      localDB.addBlogPost({
        logCode,
        title,
        excerpt,
        content,
        date,
        status,
        readTime,
        tags: tagArray,
        imageUrl: imageUrl || undefined,
        isFeatured
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#051424]/90 backdrop-blur-md p-4 flex items-center justify-center animate-in fade-in overflow-y-auto">
      <div className="max-w-2xl w-full bg-[#122131] border border-[#273647] rounded-2xl p-6 space-y-4 relative shadow-2xl my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg bg-[#051424] text-slate-300 hover:text-white border border-[#273647]"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#1c2b3c] text-[#ffc640] font-mono text-xs font-bold uppercase">
            <BookOpen className="w-3.5 h-3.5" />
            {postToEdit ? 'EDIT LABORATORY LOG' : 'CREATE NEW LABORATORY LOG'}
          </div>
          <h2 className="text-2xl font-bold font-serif text-[#d4e4fa]">
            {postToEdit ? 'Update Research Log' : 'New Laboratory Log Entry'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 font-mono text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[#c6c6cd] block mb-1">Log Code / ID</label>
              <input
                type="text"
                required
                value={logCode}
                onChange={(e) => setLogCode(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#051424] border border-[#273647] text-[#ffc640] font-bold outline-none"
              />
            </div>

            <div>
              <label className="text-[#c6c6cd] block mb-1">Publication Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg bg-[#051424] border border-[#273647] text-[#2fd9f4] font-bold outline-none"
              >
                <option value="PUBLISHED">PUBLISHED</option>
                <option value="DRAFTING">DRAFTING</option>
                <option value="INTERNAL_REVIEW">INTERNAL REVIEW</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[#c6c6cd] block mb-1">Article Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Microstructural Characterization of Plasma Sprayed Coatings"
              className="w-full px-3 py-2 rounded-lg bg-[#051424] border border-[#273647] text-[#d4e4fa] focus:border-[#ffc640] outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[#c6c6cd] block mb-1">Log Date</label>
              <input
                type="text"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#051424] border border-[#273647] text-[#d4e4fa] outline-none"
              />
            </div>

            <div>
              <label className="text-[#c6c6cd] block mb-1">Estimated Read Time</label>
              <input
                type="text"
                required
                value={readTime}
                onChange={(e) => setReadTime(e.target.value)}
                placeholder="e.g. 15 MIN"
                className="w-full px-3 py-2 rounded-lg bg-[#051424] border border-[#273647] text-[#d4e4fa] outline-none"
              />
            </div>
          </div>

          {/* Log Figure / Graphic Upload */}
          <div className="p-3.5 rounded-xl bg-[#051424] border border-[#273647] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[#ffc640] font-bold text-[11px] uppercase flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5" />
                Featured Diagram / Figure Photo
              </span>
              <span className="text-[10px] text-[#c6c6cd]">Upload or image link</span>
            </div>

            <div className="flex items-center gap-3">
              {imageUrl && (
                <div className="w-20 h-14 rounded-lg overflow-hidden border border-[#ffc640]/40 bg-[#122131] shrink-0 relative shadow">
                  <img
                    src={imageUrl}
                    alt="Cover Preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`flex-1 p-2.5 rounded-lg border-2 border-dashed transition-all flex flex-col sm:flex-row items-center justify-between gap-2 ${
                  isDragging
                    ? 'border-[#ffc640] bg-[#1a2f44]'
                    : 'border-[#273647] hover:border-[#ffc640]/50 bg-[#122131]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileInputChange}
                />
                <div className="text-center sm:text-left">
                  <div className="text-xs font-bold text-[#d4e4fa]">Upload diagram / experiment photo</div>
                  <div className="text-[10px] text-[#c6c6cd]">Drag file here or browse device</div>
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1 rounded-md bg-[#1c2b3c] hover:bg-[#273647] text-[#2fd9f4] border border-[#273647] text-xs font-bold flex items-center gap-1.5 shrink-0"
                >
                  <Upload className="w-3.5 h-3.5 text-[#ffc640]" />
                  <span>Browse</span>
                </button>
              </div>
            </div>

            <div>
              <input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Or paste image URL (https://...)"
                className="w-full px-3 py-1.5 rounded-lg bg-[#122131] border border-[#273647] text-[#2fd9f4] outline-none text-[11px]"
              />
            </div>
          </div>

          <div>
            <label className="text-[#c6c6cd] block mb-1">Excerpt / Brief Summary</label>
            <textarea
              rows={2}
              required
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Short description for preview cards..."
              className="w-full px-3 py-2 rounded-lg bg-[#051424] border border-[#273647] text-[#d4e4fa] outline-none"
            />
          </div>

          <div>
            <label className="text-[#c6c6cd] block mb-1">Full Content / Laboratory Log Text</label>
            <textarea
              rows={5}
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Detailed technical report and laboratory observation notes..."
              className="w-full px-3 py-2 rounded-lg bg-[#051424] border border-[#273647] text-[#d4e4fa] outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[#c6c6cd] block mb-1">Hashtags / Tags (comma separated)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="#LPBF, #METALLURGY, #IMMT"
                className="w-full px-3 py-2 rounded-lg bg-[#051424] border border-[#273647] text-[#2fd9f4] outline-none"
              />
            </div>

            <div className="flex items-center gap-2 pt-5">
              <input
                type="checkbox"
                id="isFeatured"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-4 h-4 accent-[#ffc640]"
              />
              <label htmlFor="isFeatured" className="text-[#ffc640] font-bold cursor-pointer">
                Mark as Featured Log
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-[#ffc640] hover:bg-[#e3aa00] text-[#051424] font-bold text-xs uppercase font-mono tracking-wider transition-all flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{postToEdit ? 'Save Log Entry Changes' : 'Publish Laboratory Log'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
