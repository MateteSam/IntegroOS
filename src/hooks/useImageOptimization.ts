import { useEffect, useRef, useState } from 'react';

export const useImageOptimization = () => {
  const [supportsWebP, setSupportsWebP] = useState(true);

  useEffect(() => {
    const img = new Image();
    img.onload = () => setSupportsWebP(true);
    img.onerror = () => setSupportsWebP(false);
    img.src = 'data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=';
  }, []);

  const convertToWebP = async (imageUrl: string): Promise<string> => {
    if (!supportsWebP) return imageUrl;

    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0);
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(URL.createObjectURL(blob));
            } else {
              resolve(imageUrl);
            }
          }, 'image/webp', 0.9);
        };
        img.onerror = () => resolve(imageUrl);
        img.src = URL.createObjectURL(blob);
      });
    } catch {
      return imageUrl;
    }
  };

  return { supportsWebP, convertToWebP };
};

export const useLazyImage = (src: string, threshold = 0.1) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (!imgRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setImageSrc(src);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold }
    );

    observer.observe(imgRef.current);

    return () => {
      if (imgRef.current) {
        observer.unobserve(imgRef.current);
      }
    };
  }, [src, threshold]);

  return { imageSrc, isLoaded, setIsLoaded, imgRef };
};
