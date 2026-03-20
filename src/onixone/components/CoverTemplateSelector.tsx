import React from 'react';
import { CoverTemplate, COVER_TEMPLATES, applyTemplate } from '../services/coverTemplates';
import { JacketDesign } from '../types';
import { Palette, Sparkles } from 'lucide-react';

interface CoverTemplateSelectorProps {
  currentDesign: JacketDesign;
  onApplyTemplate: (template: CoverTemplate) => void;
  className?: string;
}

const CoverTemplateSelector: React.FC<CoverTemplateSelectorProps> = ({ 
  currentDesign, 
  onApplyTemplate, 
  className = '' 
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const handleTemplateClick = (template: CoverTemplate) => {
    const updatedDesign = applyTemplate(currentDesign, template);
    onApplyTemplate(updatedDesign);
    setIsExpanded(false);
  };

  return (
    <div className={`${className}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-4 py-3 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Palette size={16} />
          <span>Cover Templates</span>
        </div>
        <span className="text-xs text-slate-500">{COVER_TEMPLATES.length} available</span>
      </button>

      {isExpanded && (
        <div className="mt-3 space-y-2 max-h-96 overflow-y-auto">
          {COVER_TEMPLATES.map((template) => (
            <div
              key={template.id}
              onClick={() => handleTemplateClick(template)}
              className="p-3 bg-white border border-slate-200 rounded-xl hover:border-indigo-300 hover:shadow-sm transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-16 rounded-lg border border-slate-200 flex-shrink-0"
                  style={{ background: template.preview }}
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                    {template.name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1">
                    {template.description}
                  </p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <Sparkles size={16} className="text-indigo-500" />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CoverTemplateSelector;