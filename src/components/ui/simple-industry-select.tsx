import React, { useState, useMemo } from 'react';
import { industries } from '@/lib/industries';
import { cn } from '@/lib/utils';
import { ChevronDown, Search } from 'lucide-react';

interface SimpleIndustrySelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  mlmOnly?: boolean;
}

/**
 * Simple, reliable industry selection component using native HTML select
 */
export const SimpleIndustrySelect: React.FC<SimpleIndustrySelectProps> = ({
  value,
  onValueChange,
  placeholder = "Select your industry",
  className,
  mlmOnly = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Get the appropriate industry list
  const industryList = useMemo(() => {
    if (mlmOnly) {
      return industries.filter(industry => 
        industry.includes('MLM') || 
        industry.includes('Network Marketing') ||
        industry.includes('Direct Sales') ||
        industry.includes('Health & Wellness') ||
        industry.includes('Beauty') ||
        industry.includes('Nutrition') ||
        industry.includes('Financial Services') ||
        industry.includes('Travel')
      );
    }
    return industries;
  }, [mlmOnly]);

  // Filter industries based on search term
  const filteredIndustries = useMemo(() => {
    if (!searchTerm.trim()) return industryList;
    return industryList.filter(industry => 
      industry.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, industryList]);

  const handleSelect = (selectedValue: string) => {
    if (onValueChange) {
      onValueChange(selectedValue);
    }
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex h-11 w-full items-center justify-between px-4 py-3 text-sm font-medium",
          "rounded-lg border-2 border-white/20 bg-white/5 backdrop-blur-sm text-white",
          "transition-all duration-300",
          "focus:outline-none focus:border-white/40 focus:bg-white/10 focus:shadow-lg focus:shadow-white/10",
          "hover:border-white/30 hover:bg-white/8",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-white/5",
          className
        )}
      >
        <span className={value ? "text-white" : "text-gray-400"}>
          {value || placeholder}
        </span>
        <ChevronDown className={cn(
          "h-4 w-4 text-gray-400 transition-transform duration-200",
          isOpen && "rotate-180"
        )} />
      </button>

      {/* Dropdown Content */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-black/80 backdrop-blur-xl border border-white/10 rounded-lg shadow-2xl max-h-80 overflow-hidden">
          {/* Search Input */}
          <div className="p-3 border-b border-white/10">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search industries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                autoFocus
              />
            </div>
          </div>

          {/* Industry List */}
          <div className="max-h-60 overflow-y-auto">
            {filteredIndustries.length > 0 ? (
              filteredIndustries.map((industry) => (
                <button
                  key={industry}
                  type="button"
                  onClick={() => handleSelect(industry)}
                  className={cn(
                    "w-full px-4 py-3 text-left text-sm text-white hover:bg-white/10 transition-colors duration-200",
                    "focus:outline-none focus:bg-white/10",
                    value === industry && "bg-white/10 text-blue-400"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <span>{industry}</span>
                    {mlmOnly && industry.includes('MLM') && (
                      <span className="ml-2 px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded">
                        MLM
                      </span>
                    )}
                  </div>
                </button>
              ))
            ) : (
              <div className="p-4 text-center text-gray-400 text-sm">
                No industries found matching "{searchTerm}"
              </div>
            )}
          </div>

          {/* Add Custom Option */}
          {searchTerm && filteredIndustries.length === 0 && (
            <div className="p-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => handleSelect(searchTerm)}
                className="w-full px-3 py-2 text-left text-sm bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors duration-200"
              >
                Add "{searchTerm}" as custom industry
              </button>
            </div>
          )}
        </div>
      )}

      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default SimpleIndustrySelect;