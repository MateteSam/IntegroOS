/**
 * 🚀 Export Panel — WCCCS Publishing Engine
 *
 * Multi-format export UI with job tracking, progress bars, and download links.
 */

import React, { useState, useEffect, useCallback } from 'react';
import {
  Download, FileText, BookOpen, Image, Package, Globe,
  Loader2, CheckCircle, AlertCircle, ChevronRight, Play
} from 'lucide-react';
import {
  ExportFormat,
  ExportOptions,
  ExportJob,
  startExport,
  getExportStatus,
  getAvailableFormats,
  getAllExportJobs,
} from '../services/distributionPipeline';
import { BookMetadata, StoryBlock, Annotation, Bookmark, DocumentSettings } from '../types';

interface ExportPanelProps {
  metadata: BookMetadata;
  storyBlocks: StoryBlock[];
  annotations: Annotation[];
  bookmarks: Bookmark[];
  docSettings: DocumentSettings;
  coverFrontUrl?: string;
}

const ExportPanel: React.FC<ExportPanelProps> = ({
  metadata,
  storyBlocks,
  annotations,
  bookmarks,
  docSettings,
  coverFrontUrl,
}) => {
  const [activeJobs, setActiveJobs] = useState<ExportJob[]>([]);
  const [selectedFormats, setSelectedFormats] = useState<Set<ExportFormat>>(new Set());
  const formats = getAvailableFormats();

  // Poll active jobs
  useEffect(() => {
    const interval = setInterval(() => {
      const jobs = getAllExportJobs();
      setActiveJobs([...jobs]);
    }, 500);
    return () => clearInterval(interval);
  }, []);

  const toggleFormat = (format: ExportFormat) => {
    setSelectedFormats(prev => {
      const next = new Set(prev);
      if (next.has(format)) next.delete(format);
      else next.add(format);
      return next;
    });
  };

  const handleExport = async (format: ExportFormat) => {
    const options: ExportOptions = {
      format,
      metadata,
      storyBlocks,
      annotations,
      bookmarks,
      quality: 'standard',
      includeBleed: format === 'print-pdf' || format === 'kdp-package',
      includeCropMarks: format === 'print-pdf',
      colorProfile: format === 'print-pdf' ? 'CMYK-Fogra39' : 'sRGB',
      coverFrontUrl,
    };

    await startExport(options);
  };

  const handleExportAll = async () => {
    for (const format of selectedFormats) {
      await handleExport(format);
    }
  };

  const getFormatIcon = (format: ExportFormat) => {
    if (format.includes('pdf')) return <FileText size={14} />;
    if (format.includes('epub')) return <BookOpen size={14} />;
    if (format.includes('cover')) return <Image size={14} />;
    if (format.includes('package')) return <Package size={14} />;
    if (format.includes('html')) return <Globe size={14} />;
    return <FileText size={14} />;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-500/20 rounded-lg">
            <Download size={14} className="text-emerald-400" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-200">Export & Distribute</div>
            <div className="text-[9px] text-slate-500">Publish to any format</div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-slate-800/40 border border-slate-700/40 rounded-lg p-2 text-center">
          <div className="text-[9px] text-slate-500">Blocks</div>
          <div className="text-sm font-bold text-cyan-400">{storyBlocks.length}</div>
        </div>
        <div className="bg-slate-800/40 border border-slate-700/40 rounded-lg p-2 text-center">
          <div className="text-[9px] text-slate-500">Pages</div>
          <div className="text-sm font-bold text-amber-400">{annotations.length > 0 ? Math.max(...annotations.map(a => a.pageIndex + 1)) : 0}</div>
        </div>
        <div className="bg-slate-800/40 border border-slate-700/40 rounded-lg p-2 text-center">
          <div className="text-[9px] text-slate-500">Cover</div>
          <div className="text-sm font-bold text-emerald-400">{coverFrontUrl ? '✓' : '—'}</div>
        </div>
      </div>

      {/* Format Grid */}
      <div className="space-y-1.5">
        {formats.map(fmt => {
          const isSelected = selectedFormats.has(fmt.format);
          const job = activeJobs.find(j => j.format === fmt.format);

          return (
            <div
              key={fmt.format}
              className={`flex items-center gap-3 p-2.5 rounded-lg border transition-all ${
                isSelected
                  ? 'bg-emerald-500/10 border-emerald-500/30'
                  : 'bg-slate-800/30 border-slate-700/30 hover:bg-slate-800/50'
              }`}
            >
              {/* Checkbox */}
              <button
                onClick={() => toggleFormat(fmt.format)}
                className={`w-4 h-4 rounded border flex items-center justify-center transition-all flex-shrink-0 ${
                  isSelected ? 'bg-emerald-500 border-emerald-500' : 'border-slate-600 hover:border-slate-400'
                }`}
              >
                {isSelected && <CheckCircle size={10} className="text-white" />}
              </button>

              {/* Icon + Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-slate-400">{getFormatIcon(fmt.format)}</span>
                  <span className="text-[10px] font-bold text-slate-200">{fmt.name}</span>
                </div>
                <div className="text-[8px] text-slate-500 truncate">{fmt.description}</div>
              </div>

              {/* Export button or status */}
              {job && job.status === 'processing' ? (
                <div className="flex items-center gap-1.5">
                  <Loader2 size={12} className="animate-spin text-cyan-400" />
                  <span className="text-[9px] text-cyan-400">{job.progress}%</span>
                </div>
              ) : job && job.status === 'complete' ? (
                <a
                  href={job.outputUrl}
                  download={job.outputFilename}
                  className="p-1.5 bg-emerald-500/20 hover:bg-emerald-500/40 rounded-lg transition-all"
                  title="Download"
                >
                  <Download size={12} className="text-emerald-400" />
                </a>
              ) : job && job.status === 'error' ? (
                <div title={job.error} className="p-1.5">
                  <AlertCircle size={12} className="text-red-400" />
                </div>
              ) : (
                <button
                  onClick={() => handleExport(fmt.format)}
                  className="p-1.5 bg-slate-700/50 hover:bg-cyan-500/20 rounded-lg transition-all group"
                  title={`Export ${fmt.name}`}
                >
                  <Play size={12} className="text-slate-400 group-hover:text-cyan-400" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Batch Export */}
      {selectedFormats.size > 0 && (
        <button
          onClick={handleExportAll}
          className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-cyan-600 text-white text-xs font-bold rounded-lg hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/20"
        >
          <Package size={14} />
          Export {selectedFormats.size} Format{selectedFormats.size > 1 ? 's' : ''}
        </button>
      )}
    </div>
  );
};

export default ExportPanel;
