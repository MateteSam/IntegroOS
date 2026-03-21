// ═══════════════════════════════════════════════════════════════
// INTEGRO WEBSTUDIO — Media Manager
// Image upload, library, and replacement utilities
// ═══════════════════════════════════════════════════════════════

export interface MediaItem {
  id: string;
  src: string;          // URL, blob URL, or base64
  name: string;
  type: 'image' | 'logo' | 'icon';
  width?: number;
  height?: number;
  size?: number;        // bytes
  uploadedAt: string;
}

// ── In-memory media library ─────────────────────────────────
let mediaLibrary: MediaItem[] = [];

export function getMediaLibrary(): MediaItem[] {
  return [...mediaLibrary];
}

export function addToMediaLibrary(item: MediaItem): void {
  mediaLibrary = [item, ...mediaLibrary];
}

export function removeFromMediaLibrary(id: string): void {
  mediaLibrary = mediaLibrary.filter(m => m.id !== id);
}

export function clearMediaLibrary(): void {
  mediaLibrary = [];
}

// ── File → base64 converter ────────────────────────────────
export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ── Image upload handler ────────────────────────────────────
export async function uploadImage(file: File): Promise<MediaItem> {
  // For now: local base64 conversion (Supabase/R2 upload can be added later)
  const base64 = await fileToBase64(file);
  
  // Get image dimensions
  const dims = await getImageDimensions(base64);
  
  const item: MediaItem = {
    id: 'media_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 6),
    src: base64,
    name: file.name,
    type: file.name.toLowerCase().includes('logo') ? 'logo' : 'image',
    width: dims.width,
    height: dims.height,
    size: file.size,
    uploadedAt: new Date().toISOString(),
  };

  addToMediaLibrary(item);
  return item;
}

// ── Get image dimensions ────────────────────────────────────
function getImageDimensions(src: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => resolve({ width: 0, height: 0 });
    img.src = src;
  });
}

// ── Image compression (basic) ───────────────────────────────
export async function compressImage(file: File, maxWidth = 1200, quality = 0.8): Promise<string> {
  return new Promise((resolve) => {
    const img = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    
    img.onload = () => {
      let { width, height } = img;
      if (width > maxWidth) {
        height = (maxWidth / width) * height;
        width = maxWidth;
      }
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/webp', quality));
    };
    img.onerror = () => fileToBase64(file).then(resolve);
    img.src = URL.createObjectURL(file);
  });
}

// ── Format file size ────────────────────────────────────────
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
}
