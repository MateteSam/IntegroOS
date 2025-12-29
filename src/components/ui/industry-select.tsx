import React, { useState, useMemo } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Input } from './input';
import { Badge } from './badge';
import { industries, getIndustriesByCategory, searchIndustries } from '@/lib/industries';
import { Search, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IndustrySelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  showCategories?: boolean;
  mlmOnly?: boolean;
  allowCustom?: boolean;
}

/**
 * Enhanced industry selection component with search and categorization
 */
export const IndustrySelect: React.FC<IndustrySelectProps> = ({
  value,
  onValueChange,
  placeholder = "Select your industry",
  className,
  showCategories = false,
  mlmOnly = false,
  allowCustom = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [customIndustry, setCustomIndustry] = useState('');

  // Get the appropriate industry list
  const industryList = useMemo(() => {
    if (mlmOnly) {
      const categories = getIndustriesByCategory();
      return [
        ...categories['Network Marketing & MLM'],
        ...categories['Healthcare & Medical'].filter(ind => 
          ind.includes('Wellness') || ind.includes('Nutrition') || ind.includes('Supplements')
        ),
        ...categories['Retail & E-commerce'].filter(ind => 
          ind.includes('Beauty') || ind.includes('Fashion')
        )
      ];
    }
    return industries;
  }, [mlmOnly]);

  // Filter industries based on search term
  const filteredIndustries = useMemo(() => {
    if (!searchTerm.trim()) return industryList;
    return searchIndustries(searchTerm).filter(industry => 
      industryList.includes(industry)
    );
  }, [searchTerm, industryList]);

  // Group industries by category if requested
  const categorizedIndustries = useMemo(() => {
    if (!showCategories) return { 'All Industries': filteredIndustries };
    
    const categories = getIndustriesByCategory();
    const result: Record<string, string[]> = {};
    
    Object.entries(categories).forEach(([category, categoryIndustries]) => {
      const filtered = categoryIndustries.filter(industry => 
        filteredIndustries.includes(industry)
      );
      if (filtered.length > 0) {
        result[category] = filtered;
      }
    });
    
    return result;
  }, [showCategories, filteredIndustries]);

  const handleCustomIndustrySubmit = () => {
    if (customIndustry.trim() && onValueChange) {
      onValueChange(customIndustry.trim());
      setCustomIndustry('');
      setIsOpen(false);
    }
  };

  const clearSelection = () => {
    if (onValueChange) {
      onValueChange('');
    }
  };

  return (
    <div className="relative">
      <Select 
        value={value} 
        onValueChange={onValueChange}
        open={isOpen}
        onOpenChange={setIsOpen}
      >
        <SelectTrigger className={cn("group", className)}>
          <SelectValue placeholder={placeholder} />
          {value && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                clearSelection();
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/10 rounded"
            >
              <X className="h-3 w-3" />
            </button>
          )}
        </SelectTrigger>
        <SelectContent className="max-h-80">
          {/* Search Input */}
          <div className="p-2 border-b border-white/10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search industries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-8 text-sm bg-white/5 border-white/20"
              />
            </div>
          </div>

          {/* Industry Options */}
          <div className="max-h-60 overflow-y-auto">
            {Object.entries(categorizedIndustries).map(([category, categoryIndustries]) => (
              <div key={category}>
                {showCategories && categoryIndustries.length > 0 && (
                  <div className="px-2 py-1 text-xs font-semibold text-gray-400 bg-white/5 sticky top-0">
                    {category}
                  </div>
                )}
                {categoryIndustries.map((industry) => (
                  <SelectItem key={industry} value={industry} className="text-sm">
                    <div className="flex items-center justify-between w-full">
                      <span>{industry}</span>
                      {mlmOnly && industry.includes('MLM') && (
                        <Badge className="ml-2 bg-yellow-500/20 text-yellow-400 text-xs">
                          MLM
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </div>
            ))}

            {filteredIndustries.length === 0 && (
              <div className="p-4 text-center text-gray-400 text-sm">
                No industries found matching "{searchTerm}"
                {allowCustom && (
                  <div className="mt-2">
                    <button
                      onClick={() => {
                        setCustomIndustry(searchTerm);
                        handleCustomIndustrySubmit();
                      }}
                      className="text-blue-400 hover:text-blue-300 underline"
                    >
                      Add "{searchTerm}" as custom industry
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Custom Industry Input */}
          {allowCustom && (
            <div className="p-2 border-t border-white/10">
              <div className="flex space-x-2">
                <Input
                  placeholder="Enter custom industry..."
                  value={customIndustry}
                  onChange={(e) => setCustomIndustry(e.target.value)}
                  className="flex-1 h-8 text-sm bg-white/5 border-white/20"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleCustomIndustrySubmit();
                    }
                  }}
                />
                <button
                  onClick={handleCustomIndustrySubmit}
                  disabled={!customIndustry.trim()}
                  className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Add
                </button>
              </div>
            </div>
          )}
        </SelectContent>
      </Select>
    </div>
  );
};

export default IndustrySelect;