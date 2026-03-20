import React, { useState } from 'react';
import OutlinePanel from './OutlinePanel';
import VariablesPanel from './VariablesPanel';
import LayersPanel from './LayersPanel';
import DesignBrainPanel from './DesignBrainPanel';
import { Annotation, StoryBlock, DesignTheme, JacketDesign, MainTab, BookMetadata, ProjectCategory } from '../types';
import { Layout, Palette, Wand2, Loader2, Type, Check, BookOpen, List, Tag, Layers, Image as ImageIcon } from 'lucide-react';
import { DesignPreset } from '../services/designBrain';

interface LeftSidebarProps {
  activeTab: MainTab;
  storyBlocks: StoryBlock[];
  selectedBlockId: string | null;
  onSelectBlock: (id: string | null) => void;
  onReorderBlocks: (dragId: string, dropId: string) => void;
  designTheme: DesignTheme | null;
  jacketDesign: JacketDesign | null;
  onGenerateTheme: () => void;
  onGenerateImages: () => void;
  onUpdateJacket: (updates: Partial<JacketDesign>) => void;
  isGeneratingTheme: boolean;
  isGeneratingImages: boolean;
  generatedImages: string[];
  activeJacketZone: 'front' | 'back' | 'spine';
  onActiveZoneChange: (zone: 'front' | 'back' | 'spine') => void;
  onInsertSection: (type: string) => void;
  onRecommendPersonality: () => void;
  isGeneratingPersonality?: boolean;
  category?: ProjectCategory;
  metadata: BookMetadata;
  variables: Record<string, string>;
  onUpdateVariables: (vars: Record<string, string>) => void;
  onApplyDesignPreset?: (preset: DesignPreset) => void;
  annotations: Annotation[];
  selectedIds: string[];
  onAnnotationSelect: (id: string, multi: boolean) => void;
  onUpdateAnnotation: (id: string, updates: Partial<Annotation>) => void;
  onDeleteAnnotation: (id: string) => void;
}

const LeftSidebar: React.FC<LeftSidebarProps> = (props) => {
  const [interiorSubTab, setInteriorSubTab] = useState<'outline' | 'layout' | 'variables' | 'layers'>('outline');
  const isVisible = props.activeTab === 'interior' || props.activeTab === 'jacket';

  if (!isVisible) return null;

  return (
    <div className={`w-72 h-full flex flex-col z-20 shrink-0 bg-slate-900 border-r border-white/5 md:flex hidden`}>


      {/* Content Layer */}
      <div className="relative z-10 flex flex-col h-full">
        {props.activeTab === 'interior' && (
          <>
            {/* Sub-Tab Switcher */}
            <div className="h-12 flex items-center px-3 border-b border-white/5 bg-slate-900/40">
              <div className="flex gap-1 w-full bg-slate-800/50 rounded-lg p-0.5 border border-white/5">
                <button
                  onClick={() => setInteriorSubTab('outline')}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${interiorSubTab === 'outline'
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                    }`}
                >
                  <List size={14} />
                  Outline
                </button>
                <button
                  onClick={() => setInteriorSubTab('layout')}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${interiorSubTab === 'layout'
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                    }`}
                >
                  <BookOpen size={14} />
                  Layout
                </button>
                <button
                  onClick={() => setInteriorSubTab('variables')}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${interiorSubTab === 'variables'
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                    }`}
                >
                  <Tag size={14} />
                  Vars
                </button>
                <button
                  onClick={() => setInteriorSubTab('layers')}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-2 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider transition-all ${interiorSubTab === 'layers'
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                    }`}
                >
                  <Layers size={14} />
                  Layers
                </button>
              </div>
            </div>

            {/* Outline Panel */}
            {interiorSubTab === 'outline' && (
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <OutlinePanel
                  storyBlocks={props.storyBlocks}
                  onSelectBlock={props.onSelectBlock}
                  onReorder={props.onReorderBlocks}
                  selectedBlockId={props.selectedBlockId}
                />
              </div>
            )}

            {/* Design Brain Panel (Layout tab) */}
            {interiorSubTab === 'layout' && (
              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <DesignBrainPanel
                  metadata={props.metadata}
                  storyBlocks={props.storyBlocks}
                  category={props.category || 'book'}
                  onApplyPreset={(preset) => props.onApplyDesignPreset?.(preset)}
                />
              </div>
            )}



            {/* Variables Panel */}
            {interiorSubTab === 'variables' && (
              <div className="flex-1 overflow-hidden p-4">
                <VariablesPanel
                  variables={props.variables}
                  onUpdateVariables={props.onUpdateVariables}
                />
              </div>
            )}

            {/* Layers Panel */}
            {interiorSubTab === 'layers' && (
              <div className="flex-1 overflow-hidden">
                <LayersPanel
                  annotations={props.annotations}
                  selectedIds={props.selectedIds}
                  onSelect={props.onAnnotationSelect}
                  onToggleVisibility={(id) => props.onUpdateAnnotation(id, { hidden: !props.annotations.find(a => a.id === id)?.hidden })}
                  onToggleLock={(id) => props.onUpdateAnnotation(id, { locked: !props.annotations.find(a => a.id === id)?.locked })}
                  onDelete={props.onDeleteAnnotation}
                  onReorder={(dragIdx, hoverIdx) => {
                    // Swap z-index ordering of annotations
                    const sorted = [...props.annotations].sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0));
                    if (dragIdx < 0 || hoverIdx < 0 || dragIdx >= sorted.length || hoverIdx >= sorted.length) return;
                    const dragAnn = sorted[dragIdx];
                    const hoverAnn = sorted[hoverIdx];
                    if (dragAnn && hoverAnn) {
                      props.onUpdateAnnotation(dragAnn.id, { zIndex: hoverAnn.zIndex || 0 });
                      props.onUpdateAnnotation(hoverAnn.id, { zIndex: dragAnn.zIndex || 0 });
                    }
                  }}
                />
              </div>
            )}
          </>
        )}

        {props.activeTab === 'jacket' && (
          <>
            <div className="h-12 flex items-center px-4 border-b border-white/5 bg-slate-900/40">
              <div className="flex items-center gap-2 text-slate-100">
                <div className="p-1.5 bg-slate-800 text-purple-400 rounded-lg"><Palette size={14} /></div>
                <span className="font-bold text-xs">Jacket Theme</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-3 space-y-3">
              {/* Generate Theme Button */}
              {!props.designTheme ? (
                <button
                  onClick={props.onGenerateTheme}
                  disabled={props.isGeneratingTheme}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg text-xs font-bold hover:brightness-110 transition-all disabled:opacity-50"
                >
                  {props.isGeneratingTheme ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
                  Analyze & Generate
                </button>
              ) : (
                <>
                  {/* Compact Palette Display */}
                  <div className="bg-slate-800/50 rounded-lg p-2.5 border border-slate-700/50">
                    <div className="text-[9px] font-bold text-slate-500 uppercase mb-2">Palette</div>
                    <div className="flex gap-1.5">
                      {Object.values(props.designTheme.palette).map((c, i) => (
                        <button
                          key={i}
                          onClick={() => props.onUpdateJacket({ backgroundColor: c })}
                          className="w-6 h-6 rounded border border-white/10 hover:scale-110 transition-transform relative group/c"
                          style={{ backgroundColor: c }}
                          title={`Apply ${c}`}
                        >
                          {props.jacketDesign?.backgroundColor === c && (
                            <Check size={10} className="absolute inset-0 m-auto text-white drop-shadow-lg" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Compact Typography */}
                  <div className="bg-slate-800/50 rounded-lg p-2.5 border border-slate-700/50">
                    <div className="text-[9px] font-bold text-slate-500 uppercase mb-2 flex items-center gap-1">
                      <Type size={10} /> Fonts
                    </div>
                    <div className="space-y-1">
                      <div className="text-xs font-bold text-slate-200 truncate" style={{ fontFamily: props.designTheme.fonts.header }}>
                        {props.designTheme.fonts.header}
                      </div>
                      <div className="text-[10px] text-slate-400 truncate" style={{ fontFamily: props.designTheme.fonts.body }}>
                        {props.designTheme.fonts.body}
                      </div>
                    </div>
                  </div>

                  {/* Regenerate Theme */}
                  <button
                    onClick={props.onGenerateTheme}
                    disabled={props.isGeneratingTheme}
                    className="w-full flex items-center justify-center gap-1.5 px-2 py-1.5 bg-slate-800 border border-slate-700 text-slate-400 rounded-lg text-[10px] font-medium hover:text-white hover:border-slate-600 transition-all disabled:opacity-50"
                  >
                    {props.isGeneratingTheme ? <Loader2 size={10} className="animate-spin" /> : <Wand2 size={10} />}
                    Regenerate Theme
                  </button>

                  <div className="h-px bg-white/5 my-2" />

                  {/* Generate AI Images */}
                  <button
                    onClick={() => props.onGenerateImages()}
                    disabled={props.isGeneratingImages}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg text-xs font-bold hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-cyan-900/20 disabled:opacity-50"
                  >
                    {props.isGeneratingImages ? <Loader2 size={14} className="animate-spin" /> : <ImageIcon size={14} />}
                    Generate AI Covers
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LeftSidebar;