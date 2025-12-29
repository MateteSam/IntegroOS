import React from 'react';
import { OptimizedImage } from '@/components/OptimizedImage';
import { Button } from '@/components/ui/button';
import { Download, Heart, Eye, Share2, MessageSquare, Copy } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Asset {
  url: string;
  fallbackUrl?: string;
  type: string;
  timestamp: number;
}

interface DynamicAssetGridProps {
  assets: Asset[];
  onPreview: (asset: Asset, index: number) => void;
  onDownload: (asset: Asset) => void;
  onFavorite?: (asset: Asset, index: number) => void;
  onShare?: (asset: Asset) => void;
  onComment?: (asset: Asset) => void;
  onCompare?: (asset: Asset) => void;
  favorites?: Set<string>;
  className?: string;
}

export const DynamicAssetGrid: React.FC<DynamicAssetGridProps> = ({
  assets,
  onPreview,
  onDownload,
  onFavorite,
  onShare,
  onComment,
  onCompare,
  favorites = new Set(),
  className = ''
}) => {
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6", className)}>
      {assets.map((asset, index) => {
        const isFavorite = favorites.has(asset.url + index);

        return (
          <div
            key={asset.url + index}
            className="group relative rounded-2xl overflow-hidden bg-card border border-border hover:border-primary/30 transition-all duration-300 hover-lift"
          >
            {/* Asset Preview */}
            <div
              className="relative aspect-square overflow-hidden cursor-pointer bg-muted"
              onClick={() => onPreview(asset, index)}
            >
              <OptimizedImage
                src={asset.url}
                fallbackSrc={asset.fallbackUrl}
                alt={`Generated ${asset.type}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <div className="w-full flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{asset.type}</span>
                  <Eye className="w-4 h-4 text-foreground" />
                </div>
              </div>

              {/* Favorite Badge */}
              {isFavorite && (
                <div className="absolute top-3 right-3 bg-primary/90 backdrop-blur-sm rounded-full p-2">
                  <Heart className="w-4 h-4 text-primary-foreground fill-current" />
                </div>
              )}
            </div>

            {/* Action Buttons - Appear on Hover */}
            <div className="absolute top-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="secondary"
                  className="h-9 w-9 p-0 rounded-full glass-strong hover:bg-primary hover:text-primary-foreground"
                  onClick={(e) => {
                    e.stopPropagation();
                    onFavorite?.(asset, index);
                  }}
                >
                  <Heart className={cn("w-4 h-4", isFavorite && "fill-current")} />
                </Button>

                {onShare && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-9 w-9 p-0 rounded-full glass-strong hover:bg-primary hover:text-primary-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      onShare(asset);
                    }}
                  >
                    <Share2 className="w-4 h-4" />
                  </Button>
                )}

                {onComment && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-9 w-9 p-0 rounded-full glass-strong hover:bg-primary hover:text-primary-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      onComment(asset);
                    }}
                  >
                    <MessageSquare className="w-4 h-4" />
                  </Button>
                )}

                {onCompare && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="h-9 w-9 p-0 rounded-full glass-strong hover:bg-primary hover:text-primary-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCompare(asset);
                    }}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="p-4 flex items-center justify-between border-t border-border/50">
              <div className="flex items-center gap-2">
                <div className="text-xs text-muted-foreground">
                  {new Date(asset.timestamp).toLocaleDateString()}
                </div>
              </div>

              <Button
                size="sm"
                variant="ghost"
                className="h-8 gap-2 hover:bg-primary/10 hover:text-primary"
                onClick={(e) => {
                  e.stopPropagation();
                  onDownload(asset);
                }}
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Download</span>
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
