import React, { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IndustryButtonSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  industries: string[];
}

/**
 * Button-based industry selector with dropdown
 */
export const IndustryButtonSelect: React.FC<IndustryButtonSelectProps> = ({
  value,
  onValueChange,
  placeholder = "Select your industry",
  className,
  industries
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (industry: string) => {
    if (onValueChange) {
      onValueChange(industry);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Button Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full h-12 px-4 py-2 bg-gray-800 border-2 border-gray-600 rounded-lg text-white text-base focus:border-blue-500 focus:outline-none",
          "flex items-center justify-between",
          "hover:bg-gray-700 transition-colors duration-200",
          className
        )}
      >
        <span className={value ? "text-white" : "text-gray-400"}>
          {value || placeholder}
        </span>
        <ChevronDown 
          className={cn(
            "h-5 w-5 text-gray-400 transition-transform duration-200",
            isOpen && "rotate-180"
          )} 
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown Content */}
          <div className="absolute z-50 w-full mt-1 bg-gray-800 border-2 border-gray-600 rounded-lg shadow-2xl max-h-60 overflow-y-auto">
            {industries.map((industry) => (
              <button
                key={industry}
                type="button"
                onClick={() => handleSelect(industry)}
                className={cn(
                  "w-full px-4 py-3 text-left text-white hover:bg-gray-700 transition-colors duration-200",
                  "flex items-center justify-between",
                  "first:rounded-t-lg last:rounded-b-lg",
                  value === industry && "bg-blue-600 hover:bg-blue-700"
                )}
              >
                <span>{industry}</span>
                {value === industry && (
                  <Check className="h-4 w-4 text-white" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default IndustryButtonSelect;