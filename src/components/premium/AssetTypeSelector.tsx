import React from 'react';
import { cn } from '@/lib/utils';
import { 
  Image, 
  FileText, 
  Globe, 
  Share2,
  CreditCard,
  ShoppingBag,
  Film,
  Palette
} from 'lucide-react';

interface AssetType {
  id: string;
  name: string;
  icon: React.ReactNode;
  category: string;
}

interface AssetTypeSelectorProps {
  selectedType: string;
  onTypeSelect: (typeId: string) => void;
  className?: string;
}

const assetTypes: AssetType[] = [
  { id: 'logo', name: 'Logo', icon: <Palette className="w-5 h-5" />, category: 'Brand' },
  { id: 'social', name: 'Social Post', icon: <Share2 className="w-5 h-5" />, category: 'Social' },
  { id: 'story', name: 'Story', icon: <Film className="w-5 h-5" />, category: 'Social' },
  { id: 'banner', name: 'Banner', icon: <Image className="w-5 h-5" />, category: 'Digital' },
  { id: 'business-card', name: 'Business Card', icon: <CreditCard className="w-5 h-5" />, category: 'Print' },
  { id: 'flyer', name: 'Flyer', icon: <FileText className="w-5 h-5" />, category: 'Print' },
  { id: 'website', name: 'Website', icon: <Globe className="w-5 h-5" />, category: 'Digital' },
  { id: 'merch', name: 'Merchandise', icon: <ShoppingBag className="w-5 h-5" />, category: 'Product' },
];

const categories = ['All', 'Brand', 'Social', 'Digital', 'Print', 'Product'];

export const AssetTypeSelector: React.FC<AssetTypeSelectorProps> = ({
  selectedType,
  onTypeSelect,
  className = ''
}) => {
  const [selectedCategory, setSelectedCategory] = React.useState('All');
  
  const filteredTypes = selectedCategory === 'All' 
    ? assetTypes 
    : assetTypes.filter(type => type.category === selectedCategory);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Category Pills */}
      <div className="flex items-center gap-2 flex-wrap">
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={cn(
              "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
              selectedCategory === category
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Asset Type Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {filteredTypes.map((type) => (
          <button
            key={type.id}
            onClick={() => onTypeSelect(type.id)}
            className={cn(
              "group relative flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all duration-300 hover-scale",
              selectedType === type.id
                ? "bg-primary/10 border-primary shadow-lg"
                : "bg-card border-border hover:border-primary/30 hover:shadow-md"
            )}
          >
            {/* Icon Container */}
            <div className={cn(
              "w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300",
              selectedType === type.id
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
            )}>
              {type.icon}
            </div>
            
            {/* Label */}
            <span className={cn(
              "text-xs font-medium text-center transition-colors",
              selectedType === type.id
                ? "text-primary"
                : "text-foreground group-hover:text-primary"
            )}>
              {type.name}
            </span>
            
            {/* Selected Indicator */}
            {selectedType === type.id && (
              <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-primary animate-pulse" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};
