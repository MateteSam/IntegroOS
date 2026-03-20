/**
 * 📚 KDP Export Panel
 * 
 * One-click Amazon KDP export with:
 * - Automatic trim size recommendations
 * - Spine calculation based on page count
 * - Cover template generation
 * - Interior PDF with proper bleed/margins
 * - Metadata validation
 * - Upload-ready package download
 */

import React, { useState, useMemo } from 'react';
import { 
  Upload, BookOpen, FileText, CheckCircle, AlertTriangle, 
  Download, Package, Settings, ChevronDown, ChevronRight,
  Ruler, Palette, Barcode, Info
} from 'lucide-react';
import { BookMetadata } from '../types';
import {
  KDP_TRIM_SIZES,
  KDP_SPECS,
  calculateSpine,
  createCoverSpec,
  createInteriorSpec,
  generateKDPMetadata,
  validateForKDP,
  getKDPRecommendations,
  COMMON_BISAC_CATEGORIES,
  KDPExportPackage,
} from '../services/kdpExportEngine';

interface KDPExportPanelProps {
  metadata: BookMetadata;
  pageCount: number;
  annotations: any[];
  onExport: () => void;
}

const KDPExportPanel: React.FC<KDPExportPanelProps> = ({
  metadata,
  pageCount,
  annotations,
  onExport,
}) => {
  const [selectedTrimSize, setSelectedTrimSize] = useState(KDP_TRIM_SIZES[0]);
  const [paperType, setPaperType] = useState<'white' | 'cream'>('white');
  const [coverFinish, setCoverFinish] = useState<'glossy' | 'matte'>('matte');
  const [expandedSections, setExpandedSections] = useState({
    specs: true,
    cover: false,
    validation: false,
  });
  const [isExporting, setIsExporting] = useState(false);

  // Calculate spine based on page count
  const spineCalc = useMemo(() => 
    calculateSpine(pageCount, selectedTrimSize, paperType),
    [pageCount, selectedTrimSize, paperType]
  );

  // Get recommendations based on genre
  const recommendations = useMemo(() => {
    const genre = (metadata as any).genre || 'fiction';
    return getKDPRecommendations(genre);
  }, [metadata]);

  // Validate for KDP
  const validation = useMemo(() => 
    validateForKDP(pageCount, selectedTrimSize, metadata),
    [pageCount, selectedTrimSize, metadata]
  );

  // Generate cover spec
  const coverSpec = useMemo(() => 
    createCoverSpec(pageCount, selectedTrimSize, paperType),
    [pageCount, selectedTrimSize, paperType]
  );

  const toggleSection = (key: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleAutoConfigure = () => {
    setSelectedTrimSize(recommendations.trimSize);
    setPaperType(recommendations.paperType);
    setCoverFinish(recommendations.finish);
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      // TODO: Implement actual PDF generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      onExport();
    } finally {
      setIsExporting(false);
    }
  };

  const SectionHeader: React.FC<{
    title: string;
    icon: React.ReactNode;
    sectionKey: keyof typeof expandedSections;
    badge?: string;
    badgeColor?: string;
  }> = ({ title, icon, sectionKey, badge, badgeColor = 'bg-cyan-500/20 text-cyan-400' }) => (
    <button
      onClick={() => toggleSection(sectionKey)}
      className="w-full flex items-center justify-between px-3 py-2.5 bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700/40 rounded-lg transition-all group"
    >
      <div className="flex items-center gap-2 text-slate-200">
        <span className="text-cyan-400">{icon}</span>
        <span className="text-xs font-semibold">{title}</span>
        {badge && (
          <span className={`px-1.5 py-0.5 ${badgeColor} text-[9px] font-bold rounded`}>
            {badge}
          </span>
        )}
      </div>
      {expandedSections[sectionKey] ? (
        <ChevronDown size={14} className="text-slate-500" />
      ) : (
        <ChevronRight size={14} className="text-slate-500" />
      )}
    </button>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Panel Header */}
      <div className="h-[72px] flex items-center justify-between px-4 border-b border-slate-800 bg-slate-900/60 backdrop-blur-md">
        <div className="flex items-center gap-2 text-slate-100">
          <div className="p-2 bg-gradient-to-br from-orange-500 to-amber-600 rounded-lg">
            <Upload size={16} strokeWidth={2.5} className="text-white" />
          </div>
          <div>
            <span className="font-bold text-sm">KDP Export</span>
            <div className="text-[10px] text-slate-400">Amazon Print-Ready</div>
          </div>
        </div>
        <button
          onClick={handleAutoConfigure}
          className="flex items-center gap-1.5 px-2 py-1.5 bg-slate-800 border border-slate-700 text-slate-300 rounded-lg text-[10px] font-bold hover:bg-slate-700 transition-all"
        >
          <Settings size={10} />
          Auto-Configure
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
        
        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-slate-800/40 border border-slate-700/40 rounded-lg p-2 text-center">
            <div className="text-[10px] text-slate-500 mb-1">Pages</div>
            <div className="text-lg font-bold text-cyan-400">{pageCount}</div>
          </div>
          <div className="bg-slate-800/40 border border-slate-700/40 rounded-lg p-2 text-center">
            <div className="text-[10px] text-slate-500 mb-1">Spine</div>
            <div className="text-lg font-bold text-amber-400">
              {spineCalc.spineWidthInches.toFixed(2)}"
            </div>
          </div>
          <div className="bg-slate-800/40 border border-slate-700/40 rounded-lg p-2 text-center">
            <div className="text-[10px] text-slate-500 mb-1">Trim Size</div>
            <div className="text-xs font-bold text-slate-200">
              {selectedTrimSize.widthInches}"×{selectedTrimSize.heightInches}"
            </div>
          </div>
        </div>

        {/* Validation Status */}
        {!validation.passed ? (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 text-red-400 mb-2">
              <AlertTriangle size={14} />
              <span className="text-xs font-bold">Validation Errors</span>
            </div>
            <ul className="space-y-1">
              {validation.errors.map((error, i) => (
                <li key={i} className="text-[10px] text-red-300 flex items-start gap-1">
                  <span className="text-red-500">•</span>
                  {error}
                </li>
              ))}
            </ul>
          </div>
        ) : validation.warnings.length > 0 ? (
          <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
            <div className="flex items-center gap-2 text-amber-400 mb-2">
              <Info size={14} />
              <span className="text-xs font-bold">Recommendations</span>
            </div>
            <ul className="space-y-1">
              {validation.warnings.map((warning, i) => (
                <li key={i} className="text-[10px] text-amber-300 flex items-start gap-1">
                  <span className="text-amber-500">•</span>
                  {warning}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3 flex items-center gap-2">
            <CheckCircle size={16} className="text-green-400" />
            <span className="text-xs text-green-400 font-semibold">Ready for KDP Upload</span>
          </div>
        )}

        {/* Specifications Section */}
        <SectionHeader
          title="Print Specifications"
          icon={<Ruler size={14} />}
          sectionKey="specs"
          badge={selectedTrimSize.id}
        />

        {expandedSections.specs && (
          <div className="px-2 py-3 space-y-4 bg-slate-800/20 rounded-lg border border-slate-700/30">
            {/* Trim Size Selection */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">
                Trim Size
              </label>
              <div className="grid grid-cols-2 gap-2">
                {KDP_TRIM_SIZES.map((size) => (
                  <button
                    key={size.id}
                    onClick={() => setSelectedTrimSize(size)}
                    className={`p-2 rounded-lg border text-left transition-all ${
                      selectedTrimSize.id === size.id
                        ? 'bg-cyan-500/20 border-cyan-500/50'
                        : 'bg-slate-800/40 border-slate-700/40 hover:border-slate-600'
                    }`}
                  >
                    <div className="text-[10px] font-bold text-slate-200">{size.name}</div>
                    <div className="text-[9px] text-slate-500">
                      {size.widthInches}" × {size.heightInches}"
                    </div>
                    {size.popular && (
                      <span className="inline-block mt-1 px-1 py-0.5 bg-amber-500/20 text-amber-400 text-[8px] rounded">
                        Popular
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Paper Type */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">
                Paper Type
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setPaperType('white')}
                  className={`flex-1 py-2 rounded-lg border text-sm font-bold transition-all ${
                    paperType === 'white'
                      ? 'bg-cyan-500 text-white border-cyan-500'
                      : 'bg-slate-800/40 text-slate-300 border-slate-700/40'
                  }`}
                >
                  White Paper
                </button>
                <button
                  onClick={() => setPaperType('cream')}
                  className={`flex-1 py-2 rounded-lg border text-sm font-bold transition-all ${
                    paperType === 'cream'
                      ? 'bg-amber-600 text-white border-amber-600'
                      : 'bg-slate-800/40 text-slate-300 border-slate-700/40'
                  }`}
                >
                  Cream Paper
                </button>
              </div>
              <p className="mt-1 text-[9px] text-slate-500">
                {paperType === 'cream' 
                  ? 'Cream paper is recommended for fiction, memoirs, and literary works.'
                  : 'White paper is recommended for non-fiction, textbooks, and color images.'}
              </p>
            </div>

            {/* Cover Finish */}
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase mb-2">
                Cover Finish
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => setCoverFinish('matte')}
                  className={`flex-1 py-2 rounded-lg border text-sm font-bold transition-all ${
                    coverFinish === 'matte'
                      ? 'bg-slate-600 text-white border-slate-600'
                      : 'bg-slate-800/40 text-slate-300 border-slate-700/40'
                  }`}
                >
                  Matte
                </button>
                <button
                  onClick={() => setCoverFinish('glossy')}
                  className={`flex-1 py-2 rounded-lg border text-sm font-bold transition-all ${
                    coverFinish === 'glossy'
                      ? 'bg-cyan-500 text-white border-cyan-500'
                      : 'bg-slate-800/40 text-slate-300 border-slate-700/40'
                  }`}
                >
                  Glossy
                </button>
              </div>
            </div>

            {/* Bleed Info */}
            <div className="bg-slate-800/60 rounded-lg p-3">
              <div className="flex items-center gap-2 text-slate-300 mb-2">
                <Info size={12} />
                <span className="text-[10px] font-bold">Bleed Settings</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[9px] text-slate-400">
                <div>Bleed: {KDP_SPECS.BLEED_INCHES}" ({KDP_SPECS.BLEED_MM}mm)</div>
                <div>Safe Margin: {KDP_SPECS.SAFE_MARGIN_INCHES}"</div>
              </div>
            </div>
          </div>
        )}

        {/* Cover Template Section */}
        <SectionHeader
          title="Cover Template"
          icon={<Palette size={14} />}
          sectionKey="cover"
          badge={`${spineCalc.spineWidthInches.toFixed(2)}" spine`}
          badgeColor="bg-amber-500/20 text-amber-400"
        />

        {expandedSections.cover && (
          <div className="px-2 py-3 space-y-3 bg-slate-800/20 rounded-lg border border-slate-700/30">
            {/* Cover Dimensions */}
            <div className="bg-slate-900/60 rounded-lg p-3">
              <div className="text-[10px] font-bold text-slate-400 mb-2">Full Cover Dimensions</div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-800/60 rounded p-2">
                  <div className="text-[9px] text-slate-500">Width</div>
                  <div className="font-bold text-cyan-400">
                    {spineCalc.fullCoverWidthInches.toFixed(3)}"
                  </div>
                  <div className="text-[9px] text-slate-600">
                    ({Math.round(spineCalc.fullCoverWidthPt)} pt)
                  </div>
                </div>
                <div className="bg-slate-800/60 rounded p-2">
                  <div className="text-[9px] text-slate-500">Height</div>
                  <div className="font-bold text-cyan-400">
                    {spineCalc.fullCoverHeightInches.toFixed(3)}"
                  </div>
                  <div className="text-[9px] text-slate-600">
                    ({Math.round(spineCalc.fullCoverHeightPt)} pt)
                  </div>
                </div>
              </div>
            </div>

            {/* Cover Preview Diagram */}
            <div className="relative bg-slate-900/40 rounded-lg p-4 overflow-hidden">
              <div className="text-[10px] font-bold text-slate-400 mb-2 text-center">Cover Layout</div>
              
              {/* Schematic representation */}
              <div className="flex justify-center">
                <div 
                  className="relative border-2 border-dashed border-slate-600 bg-slate-800/30"
                  style={{
                    width: '100%',
                    maxWidth: '280px',
                    aspectRatio: `${spineCalc.fullCoverWidthInches} / ${spineCalc.fullCoverHeightInches}`,
                  }}
                >
                  {/* Back cover */}
                  <div className="absolute left-0 top-0 bottom-0 bg-slate-700/30 border-r border-slate-600"
                    style={{ width: `${(selectedTrimSize.widthInches / spineCalc.fullCoverWidthInches) * 100}%` }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[8px] text-slate-500 rotate-90">BACK</span>
                    </div>
                  </div>
                  
                  {/* Spine */}
                  <div 
                    className="absolute top-0 bottom-0 bg-amber-600/20 border-x border-amber-500/50"
                    style={{ 
                      left: `${(selectedTrimSize.widthInches / spineCalc.fullCoverWidthInches) * 100}%`,
                      width: `${(spineCalc.spineWidthInches / spineCalc.fullCoverWidthInches) * 100}%`,
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[8px] text-amber-400 rotate-90 whitespace-nowrap">SPINE</span>
                    </div>
                  </div>
                  
                  {/* Front cover */}
                  <div 
                    className="absolute right-0 top-0 bottom-0 bg-slate-700/30 border-l border-slate-600"
                    style={{ width: `${(selectedTrimSize.widthInches / spineCalc.fullCoverWidthInches) * 100}%` }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[8px] text-slate-500 rotate-90">FRONT</span>
                    </div>
                  </div>

                  {/* Bleed indicators */}
                  <div className="absolute inset-0 border border-dashed border-red-500/30 pointer-events-none" 
                    style={{ margin: '4px' }} 
                  />
                </div>
              </div>

              {/* Barcode placement note */}
              <div className="mt-3 flex items-center gap-2 text-[9px] text-slate-400">
                <Barcode size={12} />
                <span>Barcode will be placed on back cover (bottom right)</span>
              </div>
            </div>

            {/* Download Template Button */}
            <button
              className="w-full py-2.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-sm font-bold transition-all flex items-center justify-center gap-2"
              onClick={() => {
                // TODO: Generate cover template PNG/PDF
                alert('Cover template download coming soon!');
              }}
            >
              <Download size={14} />
              Download Cover Template
            </button>
          </div>
        )}

        {/* Metadata Section */}
        <div className="bg-slate-800/40 border border-slate-700/40 rounded-lg p-3">
          <div className="flex items-center gap-2 text-slate-300 mb-3">
            <FileText size={14} />
            <span className="text-xs font-bold">Metadata Summary</span>
          </div>
          
          <div className="space-y-2 text-[10px]">
            <div className="flex justify-between">
              <span className="text-slate-500">Title:</span>
              <span className="text-slate-300 truncate max-w-[150px]">{metadata.title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Author:</span>
              <span className="text-slate-300">{metadata.authors?.[0] || 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">ISBN:</span>
              <span className="text-slate-300">{metadata.isbn || 'Amazon-assigned'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Categories:</span>
              <span className="text-slate-300">{metadata.bisacCodes?.length || 0} selected</span>
            </div>
          </div>
        </div>

        {/* Genre Recommendations */}
        <div className="bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-lg p-3">
          <div className="flex items-center gap-2 text-amber-400 mb-2">
            <BookOpen size={14} />
            <span className="text-xs font-bold">Recommended for Your Genre</span>
          </div>
          <div className="text-[10px] text-slate-300 space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Trim:</span>
              <span>{recommendations.trimSize.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Paper:</span>
              <span className="capitalize">{recommendations.paperType}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-slate-500">Finish:</span>
              <span className="capitalize">{recommendations.finish}</span>
            </div>
          </div>
          <button
            onClick={handleAutoConfigure}
            className="mt-2 w-full py-1.5 bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 text-[10px] font-bold rounded transition-all"
          >
            Apply Recommendations
          </button>
        </div>

        {/* Export Button */}
        <button
          onClick={handleExport}
          disabled={!validation.passed || isExporting}
          className={`w-full py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${
            validation.passed
              ? 'bg-gradient-to-r from-orange-500 to-amber-600 text-white hover:brightness-110 shadow-lg shadow-orange-900/20'
              : 'bg-slate-700 text-slate-500 cursor-not-allowed'
          }`}
        >
          {isExporting ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating KDP Package...
            </>
          ) : (
            <>
              <Package size={16} />
              Export KDP Package
            </>
          )}
        </button>

        {!validation.passed && (
          <p className="text-[9px] text-center text-red-400">
            Fix validation errors before exporting
          </p>
        )}
      </div>
    </div>
  );
};

export default KDPExportPanel;
