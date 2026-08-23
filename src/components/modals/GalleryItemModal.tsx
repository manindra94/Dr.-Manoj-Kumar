import React, { useState, useEffect, useRef } from 'react';
import { X, Save, Image as ImageIcon, Plus, Upload, Camera } from 'lucide-react';
import { localDB } from '../../lib/db';
import { GalleryItem } from '../../types';

interface GalleryItemModalProps {
  itemToEdit?: GalleryItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const GalleryItemModal: React.FC<GalleryItemModalProps> = ({
  itemToEdit,
  isOpen,
  onClose
}) => {
  const [title, setTitle] = useState('');
  const [figureNo, setFigureNo] = useState('FIG 1');
  const [category, setCategory] = useState<'Cladding' | '3D Printing' | 'Microstructure' | 'Reactor' | 'SEM Scan'>('Microstructure');
  const [imageUrl, setImageUrl] = useState('');
  const [description, setDescription] = useState('');
  const [scaleBar, setScaleBar] = useState('Mag: 500x | 50 µm');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (itemToEdit) {
      setTitle(itemToEdit.title);
      setFigureNo(itemToEdit.figureNo || 'FIG 1');
      setCategory(itemToEdit.category);
      setImageUrl(itemToEdit.imageUrl);
      setDescription(itemToEdit.description);
      setScaleBar(itemToEdit.scaleBar || '');
    } else {
      setTitle('');
      setFigureNo(`FIG ${Math.floor(Math.random() * 20 + 1)}`);
      setCategory('Microstructure');
      setImageUrl('https://images.unsplash.com/photo-1507668077129-56e32842fceb?auto=format&fit=crop&q=80&w=800');
      setDescription('');
      setScaleBar('Scale: 50 µm');
    }
  }, [itemToEdit, isOpen]);

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

    if (itemToEdit) {
      localDB.updateGalleryItem(itemToEdit.id, {
        title,
        figureNo,
        category,
        imageUrl,
        description,
        scaleBar
      });
    } else {
      localDB.addGalleryItem({
        title,
        figureNo,
        category,
        imageUrl,
        description,
        scaleBar
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#051424]/90 backdrop-blur-md p-4 flex items-center justify-center animate-in fade-in overflow-y-auto">
      <div className="max-w-xl w-full bg-[#122131] border border-[#273647] rounded-2xl p-6 space-y-4 relative shadow-2xl my-8">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-lg bg-[#051424] text-slate-300 hover:text-white border border-[#273647]"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-[#1c2b3c] text-[#ffc640] font-mono text-xs font-bold uppercase">
            <ImageIcon className="w-3.5 h-3.5" />
            {itemToEdit ? 'EDIT GALLERY FIGURE' : 'ADD NEW GALLERY FIGURE'}
          </div>
          <h2 className="text-2xl font-bold font-serif text-[#d4e4fa]">
            {itemToEdit ? 'Update Gallery Item' : 'New Research Micrograph / Photo'}
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 font-mono text-xs">
          <div>
            <label className="text-[#c6c6cd] block mb-1">Figure Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Gamma-Double-Prime Phase Precipitate in Inconel 718"
              className="w-full px-3 py-2 rounded-lg bg-[#051424] border border-[#273647] text-[#d4e4fa] focus:border-[#ffc640] outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-[#c6c6cd] block mb-1">Figure Number</label>
              <input
                type="text"
                value={figureNo}
                onChange={(e) => setFigureNo(e.target.value)}
                placeholder="e.g. FIG 1"
                className="w-full px-3 py-2 rounded-lg bg-[#051424] border border-[#273647] text-[#ffc640] font-bold outline-none"
              />
            </div>

            <div>
              <label className="text-[#c6c6cd] block mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
                className="w-full px-3 py-2 rounded-lg bg-[#051424] border border-[#273647] text-[#2fd9f4] font-bold outline-none"
              >
                <option value="Cladding">Cladding</option>
                <option value="3D Printing">3D Printing</option>
                <option value="Microstructure">Microstructure</option>
                <option value="Reactor">Reactor</option>
                <option value="SEM Scan">SEM Scan</option>
              </select>
            </div>
          </div>

          {/* Micrograph Image Upload & Preview */}
          <div className="p-3.5 rounded-xl bg-[#051424] border border-[#273647] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[#ffc640] font-bold text-[11px] uppercase flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5" />
                Upload Micrograph Image or Provide URL
              </span>
              <span className="text-[10px] text-[#c6c6cd]">PNG, JPG, WebP</span>
            </div>

            <div className="flex items-center gap-3">
              {imageUrl && (
                <div className="w-20 h-20 rounded-lg overflow-hidden border border-[#ffc640]/40 bg-[#122131] shrink-0 relative shadow">
                  <img
                    src={imageUrl}
                    alt="Preview"
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`flex-1 p-3 rounded-lg border-2 border-dashed transition-all flex flex-col sm:flex-row items-center justify-between gap-2 ${
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
                  <div className="text-xs font-bold text-[#d4e4fa]">Upload micrograph file</div>
                  <div className="text-[10px] text-[#c6c6cd]">Drag & drop or browse local device</div>
                </div>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 rounded-md bg-[#1c2b3c] hover:bg-[#273647] text-[#2fd9f4] border border-[#273647] text-xs font-bold flex items-center gap-1.5 shrink-0"
                >
                  <Upload className="w-3.5 h-3.5 text-[#ffc640]" />
                  <span>Choose File</span>
                </button>
              </div>
            </div>

            <div>
              <label className="text-[#c6c6cd] block mb-1 text-[10px]">Image URL / Data String</label>
              <input
                type="text"
                required
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://... or data:image/..."
                className="w-full px-3 py-1.5 rounded-lg bg-[#122131] border border-[#273647] text-[#2fd9f4] outline-none text-[11px]"
              />
            </div>
          </div>

          <div>
            <label className="text-[#c6c6cd] block mb-1">Scale Bar / Parameter Legend</label>
            <input
              type="text"
              value={scaleBar}
              onChange={(e) => setScaleBar(e.target.value)}
              placeholder="e.g. Power: 2.4 kW | Mag: 500x"
              className="w-full px-3 py-2 rounded-lg bg-[#051424] border border-[#273647] text-[#d4e4fa] outline-none"
            />
          </div>

          <div>
            <label className="text-[#c6c6cd] block mb-1">Micrograph / Image Description</label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Technical description of the figure or microstructural scan..."
              className="w-full px-3 py-2 rounded-lg bg-[#051424] border border-[#273647] text-[#d4e4fa] outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-[#ffc640] hover:bg-[#e3aa00] text-[#051424] font-bold text-xs uppercase font-mono tracking-wider transition-all flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            <span>{itemToEdit ? 'Save Gallery Item Changes' : 'Add to Gallery Archive'}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
