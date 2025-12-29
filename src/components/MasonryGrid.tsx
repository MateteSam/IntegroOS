import { ReactNode, useState, useRef, useEffect } from 'react';

interface MasonryGridProps {
  children: ReactNode;
  columns?: number;
  gap?: number;
}

export const MasonryGrid = ({ children, columns = 3, gap = 16 }: MasonryGridProps) => {
  const [columnHeights, setColumnHeights] = useState<number[]>(Array(columns).fill(0));
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateLayout = () => {
      if (!containerRef.current) return;

      const items = Array.from(containerRef.current.children) as HTMLElement[];
      const heights = Array(columns).fill(0);

      items.forEach((item, index) => {
        const columnIndex = index % columns;
        const top = heights[columnIndex];
        
        item.style.position = 'absolute';
        item.style.left = `${columnIndex * (100 / columns)}%`;
        item.style.top = `${top}px`;
        item.style.width = `calc(${100 / columns}% - ${gap * (columns - 1) / columns}px)`;
        
        heights[columnIndex] += item.offsetHeight + gap;
      });

      setColumnHeights(heights);
      
      if (containerRef.current) {
        containerRef.current.style.height = `${Math.max(...heights)}px`;
      }
    };

    updateLayout();
    window.addEventListener('resize', updateLayout);
    
    // Re-layout when images load
    const images = containerRef.current?.querySelectorAll('img');
    images?.forEach(img => {
      img.addEventListener('load', updateLayout);
    });

    return () => {
      window.removeEventListener('resize', updateLayout);
      images?.forEach(img => {
        img.removeEventListener('load', updateLayout);
      });
    };
  }, [children, columns, gap]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full"
      style={{ position: 'relative' }}
    >
      {children}
    </div>
  );
};