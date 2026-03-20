
import React, { useEffect, useState } from 'react';
import { Annotation, DocumentSettings, PageSize, PreflightIssue } from '../types';
import { runPreflightChecks } from '../services/preflightService';
import { AlertTriangle, CheckCircle, AlertCircle, RefreshCw, ArrowRight, Printer } from 'lucide-react';

interface PreflightPanelProps {
  annotations: Annotation[];
  docSettings: DocumentSettings;
  pageSize: PageSize | null;
  onSelectAnnotation: (id: string) => void;
}

const PreflightPanel: React.FC<PreflightPanelProps> = ({
  annotations,
  docSettings,
  pageSize,
  onSelectAnnotation
}) => {
  const [issues, setIssues] = useState<PreflightIssue[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [hasChecked, setHasChecked] = useState(false);

  const performCheck = async () => {
    if (!pageSize) return;
    setIsChecking(true);
    // Simulate a slight delay for "analysis" feel
    await new Promise(resolve => setTimeout(resolve, 500));

    // Use the logical PDF dimensions (points) for the check
    const dims = { width: pageSize.widthPt, height: pageSize.heightPt };
    const results = await runPreflightChecks(annotations, dims, docSettings);

    setIssues(results);
    setHasChecked(true);
    setIsChecking(false);
  };

  // Auto-run checks when entering the tab for the first time
  useEffect(() => {
    if (!hasChecked && pageSize) {
      performCheck();
    }
  }, [pageSize]);

  const errors = issues.filter(i => i.severity === 'error');
  const warnings = issues.filter(i => i.severity === 'warning');

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6 md:space-y-8">
        <div className="text-center py-4">
          <div className="inline-flex items-center justify-center p-4 bg-white rounded-2xl mb-4 shadow-lg shadow-indigo-500/10 border border-slate-100 ring-4 ring-indigo-50/50">
            <Printer size={32} className="text-indigo-600" />
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2 tracking-tight">Preflight Check</h2>
          <p className="text-slate-500 text-base md:text-lg">Analyze your document for printing issues before export.</p>
        </div>

        <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl shadow-slate-200/50 border border-white overflow-hidden ring-1 ring-slate-900/5">
          <div className="p-4 md:p-6 border-b border-slate-200/60 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white/50 gap-4">
            <div className="flex items-center gap-4 md:gap-5">
              <div className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center shadow-sm ring-1 ring-black/5 shrink-0 ${errors.length > 0 ? 'bg-red-50 text-red-600' : (warnings.length > 0 ? 'bg-orange-50 text-orange-600' : 'bg-emerald-50 text-emerald-600')}`}>
                {isChecking ? <RefreshCw className="animate-spin" size={24} /> : (
                  errors.length > 0 ? <AlertCircle size={24} /> : (warnings.length > 0 ? <AlertTriangle size={24} /> : <CheckCircle size={24} />)
                )}
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">
                  {isChecking ? 'Analyzing Document...' : (
                    errors.length > 0 ? 'Issues Detected' : (warnings.length > 0 ? 'Warnings Found' : 'Ready for Print')
                  )}
                </h3>
                {!isChecking && (
                  <p className="text-sm font-medium text-slate-500 mt-0.5">
                    {errors.length} Errors, {warnings.length} Warnings
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={performCheck}
              disabled={isChecking}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 rounded-xl font-bold text-sm shadow-sm ring-1 ring-slate-200 transition-all hover:shadow hover:scale-[1.02] active:scale-[0.98]"
            >
              <RefreshCw size={16} className={isChecking ? 'animate-spin' : ''} />
              Re-run Checks
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {isChecking ? (
              <div className="p-16 text-center text-slate-400">
                <RefreshCw size={48} className="animate-spin mx-auto mb-4 opacity-20" />
                <p className="font-medium animate-pulse">Scanning {annotations.length} elements...</p>
              </div>
            ) : issues.length === 0 ? (
              <div className="p-16 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-50 text-emerald-500 rounded-full mb-6 ring-8 ring-emerald-50/50">
                  <CheckCircle size={40} />
                </div>
                <h4 className="text-2xl font-bold text-slate-900 mb-2">No Issues Found</h4>
                <p className="text-slate-500 max-w-sm mx-auto text-lg leading-relaxed">Your document meets all defined constraints for margins, bleed, and image resolution.</p>
              </div>
            ) : (
              issues.map(issue => (
                <div
                  key={issue.id}
                  onClick={() => issue.annotationId && onSelectAnnotation(issue.annotationId)}
                  className="p-5 hover:bg-indigo-50/50 transition-colors cursor-pointer group flex items-start gap-5 hover:pl-6 duration-200"
                >
                  <div className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 shadow-sm ${issue.severity === 'error' ? 'bg-red-500' : 'bg-orange-500'}`} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <span className={`text-[10px] font-bold uppercase px-2 py-1 rounded-md tracking-wide ${issue.severity === 'error' ? 'bg-red-100 text-red-700' : 'bg-orange-100 text-orange-700'}`}>
                        {issue.type}
                      </span>
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Page {issue.pageIndex + 1}</span>
                    </div>
                    <p className="text-sm text-slate-700 font-medium leading-relaxed">{issue.message}</p>
                  </div>
                  <div className="opacity-0 group-hover:opacity-100 text-indigo-600 transition-all transform translate-x-2 group-hover:translate-x-0">
                    <ArrowRight size={20} />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreflightPanel;
