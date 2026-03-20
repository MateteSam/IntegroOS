/**
 * 🧠 Design Brain Panel — WCCCS Publishing Engine
 *
 * UI Panel for the AI Design Brain in the left sidebar "Layout" sub-tab.
 * Shows design presets, AI recommendation, and one-click design application.
 */

import React, { useState, useEffect } from 'react';
import { BookOpen, Wand2, Loader2, Check, ChevronRight, Palette, Sparkles, Layout } from 'lucide-react';
import { DESIGN_PRESETS, DesignPreset, getPresetsForCategory, recommendDesign } from '../services/designBrain';
import { BookMetadata, StoryBlock, ProjectCategory } from '../types';

interface DesignBrainPanelProps {
  metadata: BookMetadata;
  storyBlocks: StoryBlock[];
  category: ProjectCategory;
  activePresetId?: string;
  onApplyPreset: (preset: DesignPreset) => void;
}

const DesignBrainPanel: React.FC<DesignBrainPanelProps> = ({
  metadata,
  storyBlocks,
  category,
  activePresetId,
  onApplyPreset,
}) => {
  const [recommendedPreset, setRecommendedPreset] = useState<DesignPreset | null>(null);
  const [recommendReason, setRecommendReason] = useState('');
  const [isRecommending, setIsRecommending] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(category);

  // Group presets by decorative style
  const presetGroups = [
    { label: '📚 Books', presets: DESIGN_PRESETS.filter(p => p.category === 'book') },
    { label: '📰 Reports & Docs', presets: DESIGN_PRESETS.filter(p => ['report', 'newsletter'].includes(p.category)) },
    { label: '🖥️ Slides', presets: DESIGN_PRESETS.filter(p => p.category === 'slide') },
    { label: '🙏 Devotionals', presets: DESIGN_PRESETS.filter(p => p.category === 'devotional') },
  ].filter(g => g.presets.length > 0);

  const handleRecommend = async () => {
    setIsRecommending(true);
    try {
      const result = await recommendDesign(storyBlocks, metadata, category);
      setRecommendedPreset(result.preset);
      setRecommendReason(result.reason);
    } catch {
      setRecommendReason('Failed to get AI recommendation');
    } finally {
      setIsRecommending(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* AI Recommendation */}
      <div className="bg-gradient-to-br from-purple-500/10 to-cyan-500/10 border border-purple-500/20 rounded-xl p-3 space-y-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-purple-500/20 rounded-lg">
            <Sparkles size={14} className="text-purple-400" />
          </div>
          <div>
            <div className="text-xs font-bold text-slate-200">AI Design Recommendation</div>
            <div className="text-[9px] text-slate-500">Let AI choose the perfect design for your content</div>
          </div>
        </div>

        {recommendedPreset && !isRecommending && (
          <div className="bg-slate-800/60 rounded-lg p-2.5 border border-slate-700/40">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-cyan-400">{recommendedPreset.name}</span>
              <span className="text-[8px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded font-bold">AI Pick</span>
            </div>
            <div className="text-[9px] text-slate-400 mb-2">{recommendReason}</div>
            <button
              onClick={() => onApplyPreset(recommendedPreset)}
              className="w-full py-1.5 bg-purple-600/30 hover:bg-purple-600/50 text-purple-300 text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-1.5"
            >
              <Check size={10} />
              Apply This Design
            </button>
          </div>
        )}

        <button
          onClick={handleRecommend}
          disabled={isRecommending}
          className="w-full py-2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white text-[10px] font-bold rounded-lg hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isRecommending ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
          {isRecommending ? 'Analyzing Content...' : 'Get AI Recommendation'}
        </button>
      </div>

      {/* Design Presets Library */}
      <div className="space-y-2">
        <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
          <Layout size={10} />
          Design Presets
        </div>

        {presetGroups.map(group => (
          <div key={group.label} className="space-y-1">
            <button
              onClick={() => setExpandedCategory(expandedCategory === group.label ? null : group.label)}
              className="w-full flex items-center justify-between px-2 py-1.5 bg-slate-800/40 hover:bg-slate-800/60 rounded-lg text-[10px] font-bold text-slate-300 transition-all"
            >
              <span>{group.label}</span>
              <ChevronRight
                size={12}
                className={`text-slate-500 transition-transform ${expandedCategory === group.label ? 'rotate-90' : ''}`}
              />
            </button>

            {expandedCategory === group.label && (
              <div className="space-y-1 pl-1">
                {group.presets.map(preset => (
                  <button
                    key={preset.id}
                    onClick={() => onApplyPreset(preset)}
                    className={`w-full text-left p-2.5 rounded-lg border transition-all group ${
                      activePresetId === preset.id
                        ? 'bg-cyan-500/15 border-cyan-500/40'
                        : 'bg-slate-800/30 border-slate-700/30 hover:bg-slate-800/50 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className={`text-[10px] font-bold ${activePresetId === preset.id ? 'text-cyan-400' : 'text-slate-200'}`}>
                        {preset.name}
                      </span>
                      {activePresetId === preset.id && <Check size={10} className="text-cyan-400" />}
                    </div>
                    <div className="text-[9px] text-slate-500 leading-tight">{preset.description}</div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[8px] bg-slate-700/60 text-slate-400 px-1.5 py-0.5 rounded">{preset.paperTone}</span>
                      <span className="text-[8px] bg-slate-700/60 text-slate-400 px-1.5 py-0.5 rounded">{preset.decorativeStyle}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DesignBrainPanel;
