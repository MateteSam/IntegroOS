
import React from 'react';
import { X, Settings, Ruler, Columns } from 'lucide-react';
import { DocumentSettings } from '../types';

interface DocumentSetupModalProps {
  settings: DocumentSettings;
  onSave: (settings: DocumentSettings) => void;
  onCancel: () => void;
}

const DocumentSetupModal: React.FC<DocumentSetupModalProps> = ({
  settings,
  onSave,
  onCancel
}) => {
  const [localSettings, setLocalSettings] = React.useState<DocumentSettings>(settings);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(localSettings);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 text-indigo-700">
             <Settings size={24} />
             <h3 className="text-lg font-bold">Document Setup</h3>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-indigo-50 p-4 rounded-md text-sm text-indigo-800 mb-4">
                These settings define the safe zones, layout grid, and printing requirements for your document.
            </div>

            <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                        <Ruler size={14} /> Safe Margin (mm)
                    </label>
                    <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={localSettings.marginMm}
                        onChange={(e) => setLocalSettings({ ...localSettings, marginMm: Number(e.target.value) })}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">Rec: 12.7mm (0.5")</p>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bleed (mm)</label>
                    <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={localSettings.bleedMm}
                        onChange={(e) => setLocalSettings({ ...localSettings, bleedMm: Number(e.target.value) })}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">Rec: 3.175mm (0.125")</p>
                </div>

                <div className="col-span-2 h-px bg-gray-100 my-1" />

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                        <Columns size={14} /> Columns
                    </label>
                    <input
                        type="number"
                        min="1"
                        max="12"
                        step="1"
                        value={localSettings.columnCount || 1}
                        onChange={(e) => setLocalSettings({ ...localSettings, columnCount: Math.max(1, parseInt(e.target.value)) })}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Gutter (mm)</label>
                    <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={localSettings.gutterMm || 5}
                        onChange={(e) => setLocalSettings({ ...localSettings, gutterMm: Number(e.target.value) })}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
                    />
                    <p className="text-xs text-gray-500 mt-1">Gap between columns</p>
                </div>

                <div className="col-span-2 h-px bg-gray-100 my-1" />

                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Crop Marks</label>
                    <div className="flex items-center gap-3">
                        <input
                            type="checkbox"
                            checked={localSettings.showCropMarks ?? true} // Default to true if undefined
                            onChange={(e) => setLocalSettings({ ...localSettings, showCropMarks: e.target.checked })}
                            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <span className="text-sm text-gray-700">Show Crop Marks in Export</span>
                    </div>
                </div>

                {localSettings.showCropMarks && (
                    <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Crop Mark Length (mm)</label>
                        <input
                            type="number"
                            min="0"
                            step="0.1"
                            value={localSettings.cropMarkMm !== undefined ? localSettings.cropMarkMm : localSettings.bleedMm}
                            onChange={(e) => setLocalSettings({ ...localSettings, cropMarkMm: Number(e.target.value) })}
                            className="w-full px-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900 bg-white"
                        />
                    </div>
                )}

                <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Image DPI</label>
                    <select
                        value={localSettings.targetDpi}
                        onChange={(e) => setLocalSettings({ ...localSettings, targetDpi: Number(e.target.value) })}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-indigo-500 text-gray-900"
                    >
                        <option value={72}>72 DPI (Screen)</option>
                        <option value={150}>150 DPI (Basic Print)</option>
                        <option value={300}>300 DPI (High Quality)</option>
                        <option value={450}>450 DPI (Commercial)</option>
                    </select>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md font-medium"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md font-medium shadow-sm"
                >
                    Save Settings
                </button>
            </div>
        </form>
      </div>
    </div>
  );
};

export default DocumentSetupModal;
