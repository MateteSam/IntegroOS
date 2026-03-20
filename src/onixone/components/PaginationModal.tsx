
import React, { useState } from 'react';
import { X, Hash, ArrowRight } from 'lucide-react';
import { FontFamily } from '../types';

interface PaginationModalProps {
  totalPages: number;
  onGenerate: (settings: { startPage: number; position: string; fontSize: number; fontFamily: FontFamily; color: string }) => void;
  onCancel: () => void;
}

const PaginationModal: React.FC<PaginationModalProps> = ({
  totalPages,
  onGenerate,
  onCancel
}) => {
  const [startPage, setStartPage] = useState<number>(1);
  const [position, setPosition] = useState<string>('bottom-center');
  const [fontSize, setFontSize] = useState<number>(10);
  const [fontFamily, setFontFamily] = useState<FontFamily>('Roboto');
  const [color, setColor] = useState<string>('#000000');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 text-indigo-700">
             <Hash size={24} />
             <h3 className="text-lg font-bold">Auto Pagination</h3>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Apply from Page</label>
                <div className="flex items-center gap-2">
                    <input 
                        type="number" 
                        min="1" 
                        max={totalPages} 
                        value={startPage} 
                        onChange={(e) => setStartPage(Number(e.target.value))}
                        className="w-20 px-3 py-2.5 border border-gray-200 rounded-lg text-gray-900 bg-white"
                    />
                    <span className="text-sm text-gray-500">to {totalPages}</span>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                <select 
                    value={position} 
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-900"
                >
                    <option value="bottom-center">Bottom Center</option>
                    <option value="bottom-left">Bottom Left</option>
                    <option value="bottom-right">Bottom Right</option>
                    <option value="top-center">Top Center</option>
                    <option value="top-right">Top Right</option>
                </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Font Size</label>
                    <input 
                        type="number" 
                        value={fontSize} 
                        onChange={(e) => setFontSize(Number(e.target.value))}
                        className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-gray-900 bg-white"
                    />
                </div>
                <div>
                     <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                     <div className="flex items-center gap-2 h-10">
                        <input
                        type="color"
                        value={color}
                        onChange={(e) => setColor(e.target.value)}
                        className="h-full w-full p-1 border border-gray-300 rounded cursor-pointer"
                        />
                    </div>
                </div>
            </div>
             
             <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Font Family</label>
                <select
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value as FontFamily)}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white text-gray-900"
                >
                    <option value="Roboto">Roboto</option>
                    <option value="Helvetica">Helvetica</option>
                    <option value="Times-Roman">Times New Roman</option>
                    <option value="Courier">Courier</option>
                    <option value="Open Sans">Open Sans</option>
                    <option value="Dancing Script">Dancing Script</option>
                    <option value="Playfair Display">Playfair Display</option>
                </select>
             </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
             <button onClick={onCancel} className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2">
                 Cancel
             </button>
             <button 
                onClick={() => onGenerate({ startPage, position, fontSize, fontFamily, color })}
                className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md shadow-sm text-sm font-medium"
             >
                 Generate Numbers <ArrowRight size={14} />
             </button>
        </div>
      </div>
    </div>
  );
};

export default PaginationModal;
