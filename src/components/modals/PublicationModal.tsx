import React, { useState, useEffect, useRef } from 'react';
import { X, Save, FileText, Plus, Upload, Camera, Image as ImageIcon } from 'lucide-react';
import { localDB } from '../../lib/db';
import { Publication } from '../../types';

interface PublicationModalProps {
  publicationToEdit?: Publication | null;
  isOpen: boolean;
  onClose: () => void;
}

export const PublicationModal: React.FC<PublicationModalProps> = ({
  publicationToEdit,
  isOpen,
  onClose
}) => {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'Journal' | 'Patent' | 'Conference'>('Journal');
  const [year, setYear] = useState<number>(2025);
  const [doi, setDoi] = useState('');
  const [patentNo, setPatentNo] = useState('');
  const [confProc, setConfProc] = useState('');
  const [authors, setAuthors] = useState('');
  const [journal, setJournal] = useState('');
  const [abstract, setAbstract] = useState('');
  const [tags, setTags] = useState('');
  const [citations, setCitations] = useState<number>(0);
  const [url, setUrl] = useState('');
  const [coverImage, setCoverImage] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (publicationToEdit) {
      setTitle(publicationToEdit.title);
      setType(publicationToEdit.type);
      setYear(publicationToEdit.year);
      setDoi(publicationToEdit.doi || '');
      setPatentNo(publicationToEdit.patentNo || '');
      setConfProc(publicationToEdit.confProc || '');
      setAuthors(publicationToEdit.authors);
      setJournal(publicationToEdit.journal);
      setAbstract(publicationToEdit.abstract);
      setTags(publicationToEdit.tags.join(', '));
      setCitations(publicationToEdit.citations);
      setUrl(publicationToEdit.url);
      setCoverImage(publicationToEdit.coverImage || '');
    } else {
      setTitle('');
      setType('Journal');
      setYear(2025);
      setDoi('');
      setPatentNo('');
      setConfProc('');
      setAuthors('Kumar, M., et al.');
      setJournal('Additive Manufacturing & Surface Tech');
      setAbstract('');
      setTags('DED, SLM, Superalloys');
      setCitations(0);
      setUrl('https://doi.org');
      setCoverImage('');
    }
  }, [publicationToEdit, isOpen]);

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
        setCoverImage(result);
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

    if (publicationToEdit) {
      localDB.updatePublication(publicationToEdit.id, {
        title,
        type,
        year,
        doi: doi || undefined,
        patentNo: patentNo || undefined,
        confProc: confProc || undefined,
        authors,
        journal,
        abstract,
        tags: tagArray,
        citations,
        url,
        coverImage: coverImage || undefined
      });
    } else {
      localDB.addPublication({
        title,
        type,
        year,
        doi: doi || undefined,
        patentNo: patentNo || undefined,
        confProc: confProc || undefined,
        authors,
        journal,
        abstract,
        tags: tagArray,
        citations,
        url,
        coverImage: coverImage || undefined
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
            <FileText className="w-3.5 h-3.5" />
            {publicationToEdit ? 'EDIT PUBLICATION RECORD' : 'ADD NEW RESEARCH PUBLICATION'}
          </div>
          <h2 className="text-2xl font-bold font-serif text-[#d4e4fa]">
            {publicationToEdit ? 'Update Publication' : 'New Research Output'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 font-mono text-xs">
          <div>
            <label className="text-[#c6c6cd] block mb-1">Paper Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Microstructural Evolution during DED Processing of Superalloys"
              className="w-full px-3 py-2 rounded-lg bg-[#051424] border border-[#273647] text-[#d4e4fa] focus:border-[#ffc640] outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[#c6c6cd] block mb-1">Publication Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg bg-[#051424] border border-[#273647] text-[#ffc640] font-bold focus:border-[#ffc640] outline-none"
              >
                <option value="Journal">Journal Article</option>
                <option value="Patent">Patent</option>
                <option value="Conference">Conference Paper</option>
              </select>
            </div>

            <div>
              <label className="text-[#c6c6cd] block mb-1">Year</label>
              <input
                type="number"
                required
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value) || 2025)}
                className="w-full px-3 py-2 rounded-lg bg-[#051424] border border-[#273647] text-[#d4e4fa] focus:border-[#ffc640] outline-none"
              />
            </div>

            <div>
              <label className="text-[#c6c6cd] block mb-1">Citations Count</label>
              <input
                type="number"
                value={citations}
                onChange={(e) => setCitations(parseInt(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-lg bg-[#051424] border border-[#273647] text-[#2fd9f4] focus:border-[#ffc640] outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[#c6c6cd] block mb-1">Journal / Publisher</label>
              <input
                type="text"
                required
                value={journal}
                onChange={(e) => setJournal(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#051424] border border-[#273647] text-[#d4e4fa] focus:border-[#ffc640] outline-none"
              />
            </div>

            <div>
              <label className="text-[#c6c6cd] block mb-1">Authors</label>
              <input
                type="text"
                required
                value={authors}
                onChange={(e) => setAuthors(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#051424] border border-[#273647] text-[#d4e4fa] focus:border-[#ffc640] outline-none"
              />
            </div>
          </div>

          {type === 'Journal' && (
            <div>
              <label className="text-[#c6c6cd] block mb-1">DOI Number</label>
              <input
                type="text"
                value={doi}
                onChange={(e) => setDoi(e.target.value)}
                placeholder="e.g. 10.1016/j.surfcoat.2025.100"
                className="w-full px-3 py-2 rounded-lg bg-[#051424] border border-[#273647] text-[#2fd9f4] focus:border-[#ffc640] outline-none"
              />
            </div>
          )}

          {type === 'Patent' && (
            <div>
              <label className="text-[#c6c6cd] block mb-1">Patent Registration Number</label>
              <input
                type="text"
                value={patentNo}
                onChange={(e) => setPatentNo(e.target.value)}
                placeholder="e.g. US Patent 11,482,903 B2"
                className="w-full px-3 py-2 rounded-lg bg-[#051424] border border-[#273647] text-[#ffc640] focus:border-[#ffc640] outline-none"
              />
            </div>
          )}

          {type === 'Conference' && (
            <div>
              <label className="text-[#c6c6cd] block mb-1">Conference Proceedings</label>
              <input
                type="text"
                value={confProc}
                onChange={(e) => setConfProc(e.target.value)}
                placeholder="e.g. Proc. MS&T 2025"
                className="w-full px-3 py-2 rounded-lg bg-[#051424] border border-[#273647] text-[#2fd9f4] focus:border-[#ffc640] outline-none"
              />
            </div>
          )}

          {/* Schematic / Figure Image Upload */}
          <div className="p-3.5 rounded-xl bg-[#051424] border border-[#273647] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[#ffc640] font-bold text-[11px] uppercase flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5" />
                Publication Schematic / Graphical Abstract
              </span>
              <span className="text-[10px] text-[#c6c6cd]">Optional visual figure</span>
            </div>

            <div className="flex items-center gap-3">
              {coverImage && (
                <div className="w-20 h-14 rounded-lg overflow-hidden border border-[#ffc640]/40 bg-[#122131] shrink-0 relative shadow">
                  <img
                    src={coverImage}
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
                  <div className="text-xs font-bold text-[#d4e4fa]">Upload schematic or diagram</div>
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
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                placeholder="Or paste graphic URL (https://...)"
                className="w-full px-3 py-1.5 rounded-lg bg-[#122131] border border-[#273647] text-[#2fd9f4] outline-none text-[11px]"
              />
            </div>
          </div>

          <div>
            <label className="text-[#c6c6cd] block mb-1">Abstract</label>
            <textarea
              rows={3}
              required
              value={abstract}
              onChange={(e) => setAbstract(e.target.value)}
              placeholder="Summary of research findings and material processing results..."
              className="w-full px-3 py-2 rounded-lg bg-[#051424] border border-[#273647] text-[#d4e4fa] focus:border-[#ffc640] outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[#c6c6cd] block mb-1">Tags (comma separated)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#051424] border border-[#273647] text-[#2fd9f4] focus:border-[#ffc640] outline-none"
              />
            </div>

            <div>
              <label className="text-[#c6c6cd] block mb-1">External Link / URL</label>
              <input
                type="url"
                required
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[#051424] border border-[#273647] text-[#2fd9f4] focus:border-[#ffc640] outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-[#ffc640] hover:bg-[#e3aa00] text-[#051424] font-bold text-xs uppercase font-mono tracking-wider transition-all flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{publicationToEdit ? 'Save Publication Changes' : 'Create Publication Entry'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
