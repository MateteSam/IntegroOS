/**
 * 📦 3D Mockup Preview — WCCCS Publishing Engine
 *
 * Interactive 3D book mockup using CSS 3D transforms.
 */

import React, { useState, useMemo } from 'react';
import { RotateCcw, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { generateMockupStyles, MockupConfig, MockupOptions, getMockupAngles, MockupAngle, MockupFinish, DEFAULT_MOCKUP_OPTIONS } from '../services/mockupGenerator';

interface MockupPreviewProps {
  title: string;
  coverFrontUrl?: string;
  coverBackUrl?: string;
  spineColor?: string;
  pageCount: number;
}

const MockupPreview: React.FC<MockupPreviewProps> = ({
  title,
  coverFrontUrl,
  coverBackUrl,
  spineColor = '#0f0f23',
  pageCount,
}) => {
  const [angle, setAngle] = useState<MockupAngle>('angled-right');
  const [finish, setFinish] = useState<MockupFinish>('glossy');
  const angles = getMockupAngles();

  const config: MockupConfig = useMemo(() => ({
    coverFrontUrl: coverFrontUrl || '',
    coverBackUrl,
    spineColor,
    title,
    pageCount,
  }), [coverFrontUrl, coverBackUrl, spineColor, title, pageCount]);

  const options: MockupOptions = useMemo(() => ({
    ...DEFAULT_MOCKUP_OPTIONS,
    angle,
    finish,
    width: 400,
    height: 500,
    backgroundColor: 'transparent',
  }), [angle, finish]);

  const styles = useMemo(() => generateMockupStyles(config, options), [config, options]);

  const currentAngleIdx = angles.findIndex(a => a.id === angle);

  const nextAngle = () => {
    const next = (currentAngleIdx + 1) % angles.length;
    setAngle(angles[next].id);
  };

  const prevAngle = () => {
    const prev = (currentAngleIdx - 1 + angles.length) % angles.length;
    setAngle(angles[prev].id);
  };

  return (
    <div className="space-y-3">
      {/* 3D Mockup Scene */}
      <div
        className="relative rounded-xl overflow-hidden bg-gradient-to-br from-slate-800/40 to-slate-900/40 border border-slate-700/30"
        style={{ perspective: '1200px', height: '280px' }}
      >
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Book */}
          <div style={styles.bookWrapper}>
            {/* Pages */}
            <div style={styles.pages} />
            {/* Spine */}
            <div style={styles.spine} />
            {/* Front Cover */}
            <div style={{
              ...styles.frontCover,
              ...(coverFrontUrl ? {} : {
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)',
              }),
            }}>
              {!coverFrontUrl && (
                <div className="text-center px-3">
                  <div className="text-[10px] font-bold text-white/80 uppercase tracking-wider">{title || 'Your Book'}</div>
                </div>
              )}
              {/* Glossy sheen */}
              {finish === 'glossy' && (
                <div
                  className="absolute inset-0 pointer-events-none rounded-r"
                  style={{
                    background: 'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 40%, rgba(255,255,255,0.08) 100%)',
                  }}
                />
              )}
            </div>
            {/* Back Cover */}
            <div style={styles.backCover} />
          </div>
        </div>

        {/* Angle Navigation */}
        <div className="absolute bottom-3 left-0 right-0 flex items-center justify-center gap-3">
          <button
            onClick={prevAngle}
            className="p-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-400 rounded-lg transition-all backdrop-blur-sm border border-slate-700/50"
            title="Previous angle"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="text-[9px] font-bold text-slate-400 bg-slate-800/80 px-3 py-1 rounded-lg backdrop-blur-sm border border-slate-700/50">
            {angles[currentAngleIdx]?.name || angle}
          </span>
          <button
            onClick={nextAngle}
            className="p-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-400 rounded-lg transition-all backdrop-blur-sm border border-slate-700/50"
            title="Next angle"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        {/* Finish Toggle */}
        <div className="flex-1 flex bg-slate-800/50 rounded-lg p-0.5 border border-slate-700/40">
          <button
            onClick={() => setFinish('glossy')}
            className={`flex-1 py-1 text-[9px] font-bold rounded transition-all ${
              finish === 'glossy' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-500'
            }`}
          >
            Glossy
          </button>
          <button
            onClick={() => setFinish('matte')}
            className={`flex-1 py-1 text-[9px] font-bold rounded transition-all ${
              finish === 'matte' ? 'bg-cyan-500/20 text-cyan-400' : 'text-slate-500'
            }`}
          >
            Matte
          </button>
        </div>

        {/* Reset */}
        <button
          onClick={() => { setAngle('angled-right'); setFinish('glossy'); }}
          className="p-1.5 bg-slate-800/50 border border-slate-700/40 rounded-lg text-slate-500 hover:text-slate-300 transition-all"
          title="Reset view"
        >
          <RotateCcw size={12} />
        </button>
      </div>
    </div>
  );
};

export default MockupPreview;
