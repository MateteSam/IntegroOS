/**
 * ✨ Text Effects Panel — WCCCS Publishing Engine
 *
 * UI for applying text effects to cover titles and headings.
 * Shows effect previews and print production specs.
 */

import React from 'react';
import { Sparkles, Printer, Info } from 'lucide-react';
import { TextEffectType, TEXT_EFFECTS, getEffectCss, getCoverEffects, getInteriorEffects, TextEffect } from '../services/textEffectsEngine';

interface TextEffectsPanelProps {
  activeEffect: TextEffectType;
  onSelectEffect: (effect: TextEffectType) => void;
  context: 'cover' | 'interior';
}

const TextEffectsPanel: React.FC<TextEffectsPanelProps> = ({
  activeEffect,
  onSelectEffect,
  context,
}) => {
  const effects = context === 'cover' ? getCoverEffects() : getInteriorEffects();
  const currentEffect = TEXT_EFFECTS[activeEffect];

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <div className="p-1.5 bg-amber-500/20 rounded-lg">
          <Sparkles size={14} className="text-amber-400" />
        </div>
        <div>
          <div className="text-xs font-bold text-slate-200">Text Effects</div>
          <div className="text-[9px] text-slate-500">{context === 'cover' ? 'Premium cover finishes' : 'Interior type effects'}</div>
        </div>
      </div>

      {/* Effect Grid */}
      <div className="grid grid-cols-2 gap-2">
        {effects.map(effect => (
          <EffectCard
            key={effect.type}
            effect={effect}
            isActive={activeEffect === effect.type}
            onClick={() => onSelectEffect(effect.type)}
          />
        ))}
      </div>

      {/* Active Effect Details */}
      {currentEffect && currentEffect.type !== 'none' && (
        <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/40 space-y-2">
          <div className="text-[10px] font-bold text-slate-300">Active: {currentEffect.name}</div>
          <div className="text-[9px] text-slate-500">{currentEffect.description}</div>

          {/* Print Production Spec */}
          {currentEffect.printSpec && (
            <div className="bg-slate-900/40 rounded-lg p-2.5 mt-2 border border-slate-700/30">
              <div className="flex items-center gap-1.5 text-amber-400 mb-1.5">
                <Printer size={10} />
                <span className="text-[9px] font-bold">Print Production</span>
              </div>
              <div className="space-y-1 text-[9px] text-slate-400">
                <div><span className="text-slate-500">Technique:</span> {currentEffect.printSpec.technique}</div>
                {currentEffect.printSpec.spotColorName && (
                  <div><span className="text-slate-500">Spot Color:</span> {currentEffect.printSpec.spotColorName}</div>
                )}
                <div className="text-[8px] text-slate-500 italic mt-1">{currentEffect.printSpec.notes}</div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const EffectCard: React.FC<{
  effect: TextEffect;
  isActive: boolean;
  onClick: () => void;
}> = ({ effect, isActive, onClick }) => (
  <button
    onClick={onClick}
    className={`p-2.5 rounded-lg border text-left transition-all ${
      isActive
        ? 'bg-amber-500/15 border-amber-500/40 ring-1 ring-amber-500/20'
        : 'bg-slate-800/30 border-slate-700/30 hover:bg-slate-800/50 hover:border-slate-600'
    }`}
  >
    {/* Preview Text */}
    <div
      className="text-sm font-bold mb-1 truncate"
      style={effect.css as React.CSSProperties}
    >
      Abc
    </div>
    <div className={`text-[9px] font-bold ${isActive ? 'text-amber-400' : 'text-slate-300'}`}>
      {effect.name}
    </div>
    <div className="text-[8px] text-slate-500 truncate">{effect.description}</div>
  </button>
);

export default TextEffectsPanel;
