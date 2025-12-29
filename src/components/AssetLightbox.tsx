import { useEffect } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, ChevronLeft, ChevronRight, Download, ZoomIn, ZoomOut } from 'lucide-react';
import { useState } from 'react';

interface Asset {
  id: string;
  title: string;
  data: { url?: string; imageUrl?: string };
}

interface AssetLightboxProps {
  assets: Asset[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export const AssetLightbox = ({ assets, currentIndex, isOpen, onClose, onNavigate }: AssetLightboxProps) => {
  const [zoom, setZoom] = useState(100);
  const currentAsset = assets[currentIndex];

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      if (e.key === 'ArrowLeft' && currentIndex > 0) {
        onNavigate(currentIndex - 1);
      } else if (e.key === 'ArrowRight' && currentIndex < assets.length - 1) {
        onNavigate(currentIndex + 1);
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentIndex, assets.length, onNavigate, onClose]);

  const handleDownload = () => {
    const imageUrl = currentAsset?.data?.url || currentAsset?.data?.imageUrl;
    if (!imageUrl) return;

    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${currentAsset.title}.png`;
    link.click();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95">
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
            onClick={onClose}
          >
            <X className="w-6 h-6" />
          </Button>

          {/* Navigation buttons */}
          {currentIndex > 0 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20"
              onClick={() => onNavigate(currentIndex - 1)}
            >
              <ChevronLeft className="w-8 h-8" />
            </Button>
          )}

          {currentIndex < assets.length - 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20"
              onClick={() => onNavigate(currentIndex + 1)}
            >
              <ChevronRight className="w-8 h-8" />
            </Button>
          )}

          {/* Zoom controls */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => setZoom(Math.max(50, zoom - 25))}
            >
              <ZoomOut className="w-5 h-5" />
            </Button>
            <span className="text-white px-4 py-2 bg-black/50 rounded-md">
              {zoom}%
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={() => setZoom(Math.min(200, zoom + 25))}
            >
              <ZoomIn className="w-5 h-5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={handleDownload}
            >
              <Download className="w-5 h-5" />
            </Button>
          </div>

          {/* Image */}
          {currentAsset && (
            <div className="flex items-center justify-center p-8 w-full h-full">
              <img
                src={currentAsset.data?.url || currentAsset.data?.imageUrl}
                alt={currentAsset.title}
                className="max-w-full max-h-full object-contain transition-transform duration-200"
                style={{ transform: `scale(${zoom / 100})` }}
              />
            </div>
          )}

          {/* Image counter */}
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50 text-white bg-black/50 px-4 py-2 rounded-md">
            {currentIndex + 1} / {assets.length}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};