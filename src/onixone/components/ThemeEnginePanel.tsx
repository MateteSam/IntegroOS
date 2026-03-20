
import React, { useRef } from 'react';
import { DesignTheme, JacketDesign } from '../types';
import { Palette, Type, Image as ImageIcon, Wand2, Loader2, Check, Layout, Upload, Trash2 } from 'lucide-react';

interface ThemeEnginePanelProps {
  designTheme: DesignTheme | null;
  jacketDesign: JacketDesign | null;
  onGenerateTheme: () => void;
  onGenerateImages: (prompt?: string) => void;
  onUpdateJacket: (updates: Partial<JacketDesign>) => void;
  isGeneratingTheme: boolean;
  isGeneratingImages: boolean;
  generatedImages: string[];
  activeJacketZone: 'front' | 'back' | 'spine';
  onActiveZoneChange: (zone: 'front' | 'back' | 'spine') => void;
}

const ThemeEnginePanel: React.FC<ThemeEnginePanelProps> = ({
  designTheme,
  jacketDesign,
  onGenerateTheme,
  onGenerateImages,
  onUpdateJacket,
  isGeneratingTheme,
  isGeneratingImages,
  generatedImages,
  activeJacketZone,
  onActiveZoneChange
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleApplyImage = (url: string) => {
    if (activeJacketZone === 'front') {
      onUpdateJacket({ frontCoverUrl: url });
    } else if (activeJacketZone === 'back') {
      onUpdateJacket({ backCoverUrl: url });
    } else {
      onUpdateJacket({ spineUrl: url });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          handleApplyImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const currentZoneUrl = activeJacketZone === 'front' ? jacketDesign?.frontCoverUrl : (activeJacketZone === 'back' ? jacketDesign?.backCoverUrl : jacketDesign?.spineUrl);

  return (
    <div className="p-4 space-y-6">
      {!designTheme ? (
        <div className="text-center py-10 px-2">
          <div className="p-4 bg-white rounded-2xl shadow-lg shadow-indigo-500/10 inline-block mb-6 ring-1 ring-slate-100">
            <Wand2 size={28} className="text-indigo-600" />
          </div>
          <h3 className="font-bold text-slate-900 mb-2">AI Creative Director</h3>
          <p className="text-sm text-slate-500 mb-8 leading-relaxed">Analyze your manuscript to generate a complete design system including typography, color palettes, and imagery.</p>
          <button onClick={onGenerateTheme} disabled={isGeneratingTheme} className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-indigo-600 text-white font-bold rounded-xl shadow-lg hover:bg-indigo-700 hover:shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:bg-slate-300 disabled:shadow-none disabled:cursor-not-allowed">
            {isGeneratingTheme ? <Loader2 size={18} className="animate-spin" /> : <Wand2 size={18} />}
            Generate Theme
          </button>
        </div>
      ) : (
        <>
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1 mb-2 block">Active Zone</label>
            <div className="flex p-1 bg-white/50 backdrop-blur-sm rounded-xl border border-slate-200/60 shadow-sm">
              {['back', 'spine', 'front'].map(zone => (
                <button
                  key={zone}
                  onClick={() => onActiveZoneChange(zone as any)}
                  className={`flex-1 py-1.5 text-xs font-bold uppercase rounded-lg transition-all ${activeJacketZone === zone ? 'bg-white text-indigo-600 shadow-sm ring-1 ring-black/5' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                >
                  {zone}
                </button>
              ))}
            </div>
          </div>

          <ThemeModule title={`${activeJacketZone} Image`} icon={<ImageIcon size={14} />}>
            <div className="space-y-4">
              {currentZoneUrl ? (
                <div className="relative aspect-[2/3] w-full rounded-lg overflow-hidden group shadow-md ring-1 ring-black/5">
                  <img src={currentZoneUrl} className="w-full h-full object-cover" alt="Active zone" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                    <button onClick={() => handleApplyImage('')} className="bg-white text-red-600 p-3 rounded-full hover:bg-red-50 transition-colors shadow-lg hover:scale-110 active:scale-90">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="aspect-[2/3] rounded-xl border-2 border-dashed border-slate-300/60 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50 hover:bg-slate-50 transition-colors group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                  <div className="p-3 bg-white rounded-full shadow-sm mb-3 group-hover:scale-110 transition-transform">
                    <ImageIcon size={20} className="text-slate-300 group-hover:text-indigo-500 transition-colors" />
                  </div>
                  <span className="text-xs font-bold text-slate-500 group-hover:text-indigo-600">Select Image</span>
                </div>
              )}

              <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept="image/*" className="hidden" />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center justify-center gap-2 py-2.5 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow active:translate-y-0.5"
              >
                <Upload size={14} /> Upload Custom
              </button>
            </div>
          </ThemeModule>

          <ThemeModule title="Color Palette" icon={<Palette size={14} />} onShuffle={() => {
            if (!designTheme) return;
            const vals = Object.values(designTheme.palette);
            // Rotate palette by random offset (1 to N-1)
            const offset = 1 + Math.floor(Math.random() * (vals.length - 1));
            const rotated = [...vals.slice(offset), ...vals.slice(0, offset)];
            const keys = Object.keys(designTheme.palette);
            const newPalette: Record<string, string> = {};
            keys.forEach((k, i) => { newPalette[k] = rotated[i] as string; });
            onUpdateJacket({ backgroundColor: rotated[0] });
          }}>
            <div className="flex flex-wrap gap-3 justify-center py-2">
              {Object.values(designTheme.palette).map(c => (
                <div key={c} className="w-10 h-10 rounded-full border-2 border-white shadow-md ring-1 ring-black/5 cursor-pointer hover:scale-110 active:scale-90 transition-all relative group"
                  style={{ backgroundColor: c }}
                  onClick={() => onUpdateJacket({ backgroundColor: c })}
                  title={`Set background to ${c}`}
                >
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    {/* Dot indicator */}
                  </div>
                </div>
              ))}
            </div>
          </ThemeModule>

          <ThemeModule title="Typography" icon={<Type size={14} />} onShuffle={() => {
            const pairings = [
              { header: 'Playfair Display', body: 'Lora' },
              { header: 'Merriweather', body: 'Source Serif Pro' },
              { header: 'Cormorant Garamond', body: 'Proza Libre' },
              { header: 'Libre Baskerville', body: 'Open Sans' },
              { header: 'Crimson Text', body: 'Work Sans' },
              { header: 'Spectral', body: 'Karla' },
              { header: 'DM Serif Display', body: 'DM Sans' },
            ];
            const current = designTheme?.fonts?.header || '';
            const others = pairings.filter(p => p.header !== current);
            const pick = others[Math.floor(Math.random() * others.length)];
            if (jacketDesign) {
              onUpdateJacket({
                title: { ...jacketDesign.title, font: pick.header as any },
                author: { ...jacketDesign.author, font: pick.body as any },
              } as any);
            }
          }}>
            <div className="text-center py-2 space-y-2">
              <div style={{ fontFamily: designTheme.fonts.header }} className="text-2xl font-bold text-slate-800 leading-none">{designTheme.fonts.header}</div>
              <div className="h-px bg-slate-100 w-1/2 mx-auto"></div>
              <div style={{ fontFamily: designTheme.fonts.body }} className="text-sm text-slate-500">{designTheme.fonts.body}</div>
            </div>
          </ThemeModule>

          <ThemeModule
            title={`Generative Assets`}
            icon={<Wand2 size={14} />}
            onShuffle={() => onGenerateImages()}
            isShuffling={isGeneratingImages}
          >
            <p className="text-[10px] text-slate-400 font-medium text-center mb-3 px-2">"{designTheme.imageryStyle}"</p>
            <div className="grid grid-cols-2 gap-2">
              {generatedImages.map((url, i) => (
                <div key={i} onClick={() => handleApplyImage(url)} className={`aspect-[2/3] bg-slate-100 rounded-lg overflow-hidden cursor-pointer relative group border-2 transition-all ${currentZoneUrl === url ? 'border-indigo-600 ring-2 ring-indigo-200' : 'border-transparent hover:border-indigo-300'}`}>
                  <img src={url} className="w-full h-full object-cover" />
                  {currentZoneUrl === url && (
                    <div className="absolute inset-0 bg-indigo-600/40 flex items-center justify-center backdrop-blur-[1px]">
                      <div className="bg-white p-1 rounded-full shadow-md">
                        <Check size={16} className="text-indigo-600" />
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  {currentZoneUrl !== url && (
                    <div className="absolute bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm text-indigo-900 border-t border-indigo-100 text-[9px] font-bold py-1.5 text-center opacity-0 group-hover:opacity-100 transition-opacity translate-y-1 group-hover:translate-y-0">
                      Apply to {activeJacketZone}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ThemeModule>
        </>
      )}
    </div>
  );
};

const ThemeModule: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode; onShuffle?: () => void; isShuffling?: boolean }> = ({ title, icon, children, onShuffle, isShuffling }) => (
  <div>
    <div className="flex justify-between items-center mb-3 px-1">
      <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
        {icon} {title}
      </h4>
      {onShuffle && (
        <button onClick={onShuffle} disabled={isShuffling} className="p-1.5 rounded-lg hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 transition-colors disabled:opacity-50">
          {isShuffling ? <Loader2 size={12} className="animate-spin" /> : <Wand2 size={12} />}
        </button>
      )}
    </div>
    <div className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-white shadow-md shadow-slate-200/50 hover:shadow-lg hover:shadow-slate-200/60 transition-shadow">
      {children}
    </div>
  </div>
);

export default ThemeEnginePanel;
