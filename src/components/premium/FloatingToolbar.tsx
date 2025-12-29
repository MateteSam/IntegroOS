import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Download, 
  Trash2, 
  Copy, 
  Share2, 
  ZoomIn,
  Grid3x3,
  Layers,
  Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloatingToolbarProps {
  selectedCount?: number;
  onDownloadAll?: () => void;
  onDeleteSelected?: () => void;
  onCompareSelected?: () => void;
  onShareSelected?: () => void;
  onZoom?: () => void;
  onViewChange?: (view: 'grid' | 'list') => void;
  onFilterToggle?: () => void;
  className?: string;
}

export const FloatingToolbar: React.FC<FloatingToolbarProps> = ({
  selectedCount = 0,
  onDownloadAll,
  onDeleteSelected,
  onCompareSelected,
  onShareSelected,
  onZoom,
  onViewChange,
  onFilterToggle,
  className = ''
}) => {
  const hasSelection = selectedCount > 0;
  
  return (
    <div className={cn(
      "fixed bottom-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-300",
      hasSelection ? "translate-y-0" : "translate-y-32",
      className
    )}>
      <div className="glass-strong rounded-2xl shadow-xl border-2 border-border/50 p-2 backdrop-blur-2xl">
        <div className="flex items-center gap-2">
          {/* Selection Counter */}
          {hasSelection && (
            <>
              <div className="px-4 py-2 text-sm font-medium text-foreground">
                {selectedCount} selected
              </div>
              <Separator orientation="vertical" className="h-8" />
            </>
          )}
          
          {/* Actions */}
          <div className="flex items-center gap-1">
            {hasSelection ? (
              <>
                {onDownloadAll && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-10 w-10 p-0 hover:bg-primary/10 hover:text-primary"
                    onClick={onDownloadAll}
                    title="Download All"
                  >
                    <Download className="w-5 h-5" />
                  </Button>
                )}
                
                {onCompareSelected && selectedCount > 1 && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-10 w-10 p-0 hover:bg-primary/10 hover:text-primary"
                    onClick={onCompareSelected}
                    title="Compare"
                  >
                    <Copy className="w-5 h-5" />
                  </Button>
                )}
                
                {onShareSelected && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-10 w-10 p-0 hover:bg-primary/10 hover:text-primary"
                    onClick={onShareSelected}
                    title="Share"
                  >
                    <Share2 className="w-5 h-5" />
                  </Button>
                )}
                
                <Separator orientation="vertical" className="h-8 mx-1" />
                
                {onDeleteSelected && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-10 w-10 p-0 hover:bg-destructive/10 hover:text-destructive"
                    onClick={onDeleteSelected}
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </Button>
                )}
              </>
            ) : (
              <>
                {onViewChange && (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-10 w-10 p-0 hover:bg-primary/10 hover:text-primary"
                      onClick={() => onViewChange('grid')}
                      title="Grid View"
                    >
                      <Grid3x3 className="w-5 h-5" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-10 w-10 p-0 hover:bg-primary/10 hover:text-primary"
                      onClick={() => onViewChange('list')}
                      title="List View"
                    >
                      <Layers className="w-5 h-5" />
                    </Button>
                  </>
                )}
                
                {onZoom && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-10 w-10 p-0 hover:bg-primary/10 hover:text-primary"
                    onClick={onZoom}
                    title="Zoom"
                  >
                    <ZoomIn className="w-5 h-5" />
                  </Button>
                )}
                
                {onFilterToggle && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-10 w-10 p-0 hover:bg-primary/10 hover:text-primary"
                    onClick={onFilterToggle}
                    title="Filters"
                  >
                    <Filter className="w-5 h-5" />
                  </Button>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
