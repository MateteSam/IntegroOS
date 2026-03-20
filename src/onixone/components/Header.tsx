
import React from 'react';
import {
  Save,
  LayoutGrid,
  ZoomIn,
  ZoomOut,
  MousePointer2,
  BookOpen,
  ArrowLeft,
  Share2,
  RotateCcw,
  RotateCw,
  Book,
  PenSquare,
  Tag,
  CheckSquare,
  Brain
} from 'lucide-react';

import { MainTab } from '../types';

interface HeaderProps {
  onSaveProject: () => void;
  onExport: () => void;
  onUndo: () => void;
  onRedo: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onToggleViewMode: (mode: 'single' | 'grid' | 'spread') => void;
  onPrevPage: () => void;
  onNextPage: () => void;
  canUndo: boolean;
  canRedo: boolean;
  hasFile: boolean;
  viewMode: 'single' | 'grid' | 'spread';
  scale: number;
  pageInfo: { current: number; total: number };
  activeTab: MainTab;
  onTabChange: (tab: MainTab) => void;
  onBackToDashboard: () => void;
  projectName: string;
  onJumpToPage?: (page: number) => void;
  bookmarks?: any[];
}

import { Search, ChevronDown } from 'lucide-react';

const Header: React.FC<HeaderProps> = ({
  onSaveProject,
  onUndo, onRedo,
  onZoomIn, onZoomOut,
  onToggleViewMode,
  onPrevPage, onNextPage,
  canUndo, canRedo, hasFile, viewMode, scale, pageInfo,
  activeTab, onTabChange, onBackToDashboard, projectName,
  onJumpToPage, bookmarks = []
}) => {
  const isDesignTab = activeTab === 'jacket' || activeTab === 'interior';

  const [showChapters, setShowChapters] = React.useState(false);

  return (
    <div className="flex flex-col w-full z-50 relative bg-slate-950 border-b border-white/5">
      <div className="h-16 flex items-center justify-between px-6">
        {/* Left Section: Logo & Back */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="relative w-9 h-9 bg-gradient-to-br from-cyan-500 to-teal-500 rounded-lg flex items-center justify-center text-white font-black text-lg shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 transition-all duration-300 cursor-pointer group">
              <span className="relative z-10">O</span>
              <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg" />
            </div>
          </div>

          <div className="flex items-center gap-4 h-8 border-l border-white/10 pl-6">
            <button onClick={onBackToDashboard} className="p-1.5 rounded-md hover:bg-white/5 text-slate-400 hover:text-cyan-300 transition-all" title="Back to Dashboard">
              <ArrowLeft size={18} strokeWidth={2.5} />
            </button>
            <div className="flex items-center gap-3">
              <span className="font-bold text-slate-200 text-sm tracking-tight max-w-[200px] truncate">{projectName}</span>
              <span className="text-[10px] px-1.5 py-0.5 bg-cyan-500/10 text-cyan-400 rounded-full font-bold border border-cyan-500/20 tracking-wider">LIVE</span>
            </div>
          </div>
        </div>

        {/* Center Section: Tabs */}
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 hidden md:block">
          <div className="flex items-center bg-slate-900/50 p-1 rounded-xl border border-white/5">
            <TabButton active={activeTab === 'jacket'} onClick={() => onTabChange('jacket')} icon={<Book size={15} />} label="Jacket" />
            <TabButton active={activeTab === 'interior'} onClick={() => onTabChange('interior')} icon={<PenSquare size={15} />} label="Interior" />

            <div className="w-px h-4 bg-white/10 mx-2" />

            <TabButton active={activeTab === 'metadata'} onClick={() => onTabChange('metadata')} icon={<Tag size={15} />} label="Meta" />
            <TabButton active={activeTab === 'analyze'} onClick={() => onTabChange('analyze')} icon={<Brain size={15} />} label="AI" />
            <TabButton active={activeTab === 'check'} onClick={() => onTabChange('check')} icon={<CheckSquare size={15} />} label="Check" />
            <TabButton active={activeTab === 'distribute'} onClick={() => onTabChange('distribute')} icon={<Share2 size={15} />} label="Publish" />
          </div>
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center gap-4">
          {activeTab === 'interior' && (
            <button className="p-2 text-slate-400 hover:text-cyan-400 hover:bg-white/5 rounded-lg transition-all" title="Search document">
              <Search size={18} />
            </button>
          )}

          {isDesignTab && hasFile && (
            <div className="flex items-center gap-1 mr-2 bg-slate-900/50 p-1 rounded-lg border border-white/5">
              <IconButton onClick={onUndo} icon={<RotateCcw size={15} />} disabled={!canUndo} title="Undo (Ctrl+Z)" />
              <IconButton onClick={onRedo} icon={<RotateCw size={15} />} disabled={!canRedo} title="Redo (Ctrl+Y)" />
            </div>
          )}

          {activeTab === 'interior' && hasFile && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 bg-slate-900/50 border border-white/5 rounded-lg p-1">
                <button onClick={onPrevPage} className="p-1.5 hover:bg-white/5 rounded-md disabled:opacity-30 disabled:cursor-not-allowed transition-all text-slate-400 hover:text-cyan-300" disabled={pageInfo.current <= 1}>&lt;</button>

                <div className="flex items-center gap-1 mx-1 relative">
                  <div
                    className="flex items-center gap-1 px-2 py-1 hover:bg-white/5 rounded cursor-pointer"
                    onClick={() => setShowChapters(!showChapters)}
                  >
                    <span className="text-xs font-bold text-slate-300 w-6 text-center">{pageInfo.current}</span>
                    <ChevronDown size={12} className={`text-slate-500 transition-transform ${showChapters ? 'rotate-180' : ''}`} />
                  </div>

                  {showChapters && bookmarks.length > 0 && (
                    <div className="absolute top-full mt-2 left-0 w-48 bg-slate-900 border border-white/10 rounded-xl shadow-2xl py-2 z-[60] max-h-64 overflow-y-auto custom-scrollbar">
                      {bookmarks.map((b, i) => (
                        <button
                          key={i}
                          onClick={() => {
                            onJumpToPage?.(b.pageIndex + 1);
                            setShowChapters(false);
                          }}
                          className="w-full text-left px-4 py-2 text-[10px] font-bold text-slate-400 hover:bg-cyan-500/10 hover:text-cyan-400 transition-all uppercase tracking-wider"
                        >
                          {b.title}
                        </button>
                      ))}
                    </div>
                  )}
                  <span className="text-[10px] text-slate-600 font-mono">/ {pageInfo.total}</span>
                </div>

                <button onClick={onNextPage} className="p-1.5 hover:bg-white/5 rounded-md disabled:opacity-30 disabled:cursor-not-allowed transition-all text-slate-400 hover:text-cyan-300" disabled={pageInfo.current >= pageInfo.total}>&gt;</button>
              </div>

              <div className="hidden lg:flex items-center bg-slate-900/50 border border-white/5 rounded-lg h-8 overflow-hidden">
                <button onClick={onZoomOut} className="px-2.5 h-full hover:bg-white/5 border-r border-white/5 text-slate-400 hover:text-cyan-300 transition-all"><ZoomOut size={14} /></button>
                <span className="text-xs font-bold min-w-[48px] text-center text-slate-300 select-none pb-0.5">{Math.round(scale * 100)}%</span>
                <button onClick={onZoomIn} className="px-2.5 h-full hover:bg-white/5 border-l border-white/5 text-slate-400 hover:text-cyan-300 transition-all"><ZoomIn size={14} /></button>
              </div>

              <div className="hidden xl:flex bg-slate-900/50 p-1 rounded-lg border border-white/5 gap-1">
                <ViewModeBtn active={viewMode === 'single'} onClick={() => onToggleViewMode('single')} icon={<MousePointer2 size={14} />} title="Single Page" />
                <ViewModeBtn active={viewMode === 'spread'} onClick={() => onToggleViewMode('spread')} icon={<BookOpen size={14} />} title="Spread View" />
                <ViewModeBtn active={viewMode === 'grid'} onClick={() => onToggleViewMode('grid')} icon={<LayoutGrid size={14} />} title="Grid View" />
              </div>
            </div>
          )}

          <button
            onClick={onSaveProject}
            disabled={!hasFile}
            className="flex items-center gap-2 px-5 py-2 bg-slate-100 hover:bg-white text-slate-900 text-xs font-bold rounded-lg transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save size={16} strokeWidth={2.5} />
            <span className="hidden sm:inline">Save</span>
          </button>


        </div>
      </div>

      {/* Mobile Tabs */}
      <div className="md:hidden flex items-center overflow-x-auto p-2 gap-2 border-t border-white/5 scrollbar-none bg-slate-950">
        <TabButton active={activeTab === 'jacket'} onClick={() => onTabChange('jacket')} icon={<Book size={15} />} label="Jacket" showLabel />
        <TabButton active={activeTab === 'interior'} onClick={() => onTabChange('interior')} icon={<PenSquare size={15} />} label="Interior" showLabel />
        <div className="w-px h-4 bg-white/10 mx-1 shrink-0" />
        <TabButton active={activeTab === 'metadata'} onClick={() => onTabChange('metadata')} icon={<Tag size={15} />} label="Meta" showLabel />
        <TabButton active={activeTab === 'analyze'} onClick={() => onTabChange('analyze')} icon={<Brain size={15} />} label="AI" showLabel />
        <TabButton active={activeTab === 'check'} onClick={() => onTabChange('check')} icon={<CheckSquare size={15} />} label="Check" showLabel />
        <TabButton active={activeTab === 'distribute'} onClick={() => onTabChange('distribute')} icon={<Share2 size={15} />} label="Publish" showLabel />
      </div>
    </div>
  );
};

const TabButton: React.FC<{ active: boolean, onClick: () => void, icon: React.ReactNode, label: string, showLabel?: boolean }> = ({ active, onClick, icon, label, showLabel }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all shrink-0 ${active
      ? 'bg-slate-800 text-cyan-400 border border-cyan-500/20 shadow-sm'
      : 'text-slate-500 hover:text-slate-300 hover:bg-white/5 border border-transparent'
      }`}
  >
    {icon}
    <span className={`${showLabel ? 'inline' : 'hidden xl:inline'}`}>{label}</span>
  </button>
);

const IconButton: React.FC<{ onClick: () => void, icon: React.ReactNode, disabled?: boolean, title?: string }> = ({ onClick, icon, disabled, title }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`p-1.5 rounded transition-all ${disabled
      ? 'text-slate-700 cursor-not-allowed'
      : 'text-slate-400 hover:bg-white/5 hover:text-cyan-400'
      }`}
  >
    {icon}
  </button>
);

const ViewModeBtn: React.FC<{ active: boolean, onClick: () => void, icon: React.ReactNode, title: string }> = ({ active, onClick, icon, title }) => (
  <button
    onClick={onClick}
    className={`p-1.5 rounded transition-all ${active
      ? 'bg-slate-800 text-cyan-400 shadow-sm'
      : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
      }`}
    title={title}
  >
    {icon}
  </button>
);

export default Header;
