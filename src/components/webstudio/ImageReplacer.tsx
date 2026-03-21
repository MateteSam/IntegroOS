// ═══════════════════════════════════════════════════════════════
// INTEGRO WEBSTUDIO — Image Replacer Component
// Hover overlay on images for instant replacement
// ═══════════════════════════════════════════════════════════════

import React, { useRef, useState } from 'react';
import { Camera, Upload, X, Image as ImageIcon, Trash2 } from 'lucide-react';
import { uploadImage, compressImage, formatFileSize, getMediaLibrary, type MediaItem } from '../../lib/webstudio/mediaManager';
import './ImageReplacer.css';

interface ImageReplacerProps {
  currentSrc: string;
  onReplace: (newSrc: string) => void;
  onRemove?: () => void;
  aspectRatio?: string;
  label?: string;
  className?: string;
}

export const ImageReplacer: React.FC<ImageReplacerProps> = ({
  currentSrc, onReplace, onRemove, aspectRatio, label, className
}) => {
  const [hovered, setHovered] = useState(false);
  const [showLibrary, setShowLibrary] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const compressed = await compressImage(file, 1600, 0.85);
      const item = await uploadImage(file);
      onReplace(compressed);
    } catch {
      // Fallback: use raw file
      const reader = new FileReader();
      reader.onload = () => onReplace(reader.result as string);
      reader.readAsDataURL(file);
    }
    setUploading(false);
    setShowLibrary(false);
  };

  const library = getMediaLibrary();

  return (
    <div
      className={`image-replacer ${className || ''}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setShowLibrary(false); }}
      style={{ aspectRatio }}
    >
      {currentSrc ? (
        <img src={currentSrc} alt={label || 'Image'} className="image-replacer-img" />
      ) : (
        <div className="image-replacer-placeholder">
          <ImageIcon size={32} />
          <span>{label || 'Add Image'}</span>
        </div>
      )}

      {hovered && !uploading && (
        <div className="image-replacer-overlay">
          <div className="image-replacer-actions">
            <button onClick={() => fileRef.current?.click()} className="image-replacer-btn primary" title="Upload new image">
              <Upload size={16} />
              <span>Replace</span>
            </button>
            {library.length > 0 && (
              <button onClick={() => setShowLibrary(!showLibrary)} className="image-replacer-btn" title="Choose from library">
                <ImageIcon size={16} />
                <span>Library</span>
              </button>
            )}
            {onRemove && currentSrc && (
              <button onClick={onRemove} className="image-replacer-btn danger" title="Remove image">
                <Trash2 size={16} />
              </button>
            )}
          </div>
        </div>
      )}

      {uploading && (
        <div className="image-replacer-overlay">
          <div className="image-replacer-loading">
            <div className="image-replacer-spinner" />
            <span>Processing...</span>
          </div>
        </div>
      )}

      {showLibrary && library.length > 0 && (
        <div className="image-replacer-library">
          <div className="image-replacer-library-header">
            <span>Media Library</span>
            <button onClick={() => setShowLibrary(false)}><X size={14} /></button>
          </div>
          <div className="image-replacer-library-grid">
            {library.map(item => (
              <button
                key={item.id}
                className="image-replacer-library-item"
                onClick={() => { onReplace(item.src); setShowLibrary(false); setHovered(false); }}
                title={`${item.name} (${item.width}×${item.height})`}
              >
                <img src={item.src} alt={item.name} />
              </button>
            ))}
          </div>
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        style={{ display: 'none' }}
      />
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════
// Logo Uploader — Specialized for nav/footer logo slots
// ═══════════════════════════════════════════════════════════════
interface LogoUploaderProps {
  currentLogo: string;
  siteName: string;
  onUpload: (src: string) => void;
  primaryColor: string;
}

export const LogoUploader: React.FC<LogoUploaderProps> = ({
  currentLogo, siteName, onUpload, primaryColor
}) => {
  const fileRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const compressed = await compressImage(file, 400, 0.9);
    onUpload(compressed);
  };

  return (
    <div className="logo-uploader">
      <div className="logo-uploader-preview" onClick={() => fileRef.current?.click()}>
        {currentLogo ? (
          <img src={currentLogo} alt="Logo" className="logo-uploader-img" />
        ) : (
          <div className="logo-uploader-text" style={{ color: primaryColor }}>
            {siteName}
          </div>
        )}
        <div className="logo-uploader-overlay">
          <Camera size={16} />
          <span>{currentLogo ? 'Change Logo' : 'Upload Logo'}</span>
        </div>
      </div>
      <input ref={fileRef} type="file" accept="image/*" onChange={handleUpload} style={{ display: 'none' }} />
    </div>
  );
};
