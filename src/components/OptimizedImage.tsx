import { useState, useEffect } from 'react';
import { useLazyImage } from '@/hooks/useImageOptimization';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface OptimizedImageProps {
  src: string;
  fallbackSrc?: string;
  alt: string;
  className?: string;
  onClick?: () => void;
}

export const OptimizedImage = ({ src, fallbackSrc, alt, className, onClick }: OptimizedImageProps) => {
  const { imageSrc: lazyLoadedSrc, isLoaded, setIsLoaded, imgRef } = useLazyImage(src);
  const [currentSrc, setCurrentSrc] = useState<string | null>(null);
  const [errorCount, setErrorCount] = useState(0);

  // Sync currentSrc with the lazy-loaded result
  useEffect(() => {
    if (lazyLoadedSrc) {
      setCurrentSrc(lazyLoadedSrc);
    }
  }, [lazyLoadedSrc]);

  // Reset if src prop changes
  useEffect(() => {
    setErrorCount(0);
    setIsLoaded(false);
  }, [src, setIsLoaded]);

  const handleError = () => {
    console.warn('Image load failed, attempting fallback:', currentSrc);
    if (errorCount === 0 && fallbackSrc) {
      setCurrentSrc(fallbackSrc);
      setErrorCount(1);
    } else {
      // Final fallback is a clean Sovereign SVG data URI
      const finalFallback = `data:image/svg+xml;base64,${btoa(`<svg width="800" height="800" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#1e293b"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="system-ui" font-size="24" fill="#f59e0b">Sovereign Asset</text></svg>`)}`;
      setCurrentSrc(finalFallback);
      setErrorCount(3);
    }
    setIsLoaded(false); // Force re-triggering of onLoad for the next source
  };

  return (
    <div ref={imgRef} className={cn("relative overflow-hidden", className)} onClick={onClick}>
      {!isLoaded && <Skeleton className="w-full h-full absolute inset-0" />}
      {currentSrc && (
        <img
          src={currentSrc}
          alt={alt}
          className={cn(
            "w-full h-full object-cover transition-opacity duration-300",
            isLoaded ? 'opacity-100' : 'opacity-0'
          )}
          onLoad={() => setIsLoaded(true)}
          onError={handleError}
          loading="lazy"
        />
      )}
    </div>
  );
};
