

import React, { useState } from 'react';
import { X, BookPlus } from 'lucide-react';

interface InsertPageModalProps {
  totalPages: number;
  currentPage: number;
  onConfirm: (position: 'start' | 'end' | 'current') => void;
  onCancel: () => void;
}

const InsertPageModal: React.FC<InsertPageModalProps> = ({
  totalPages,
  currentPage,
  onConfirm,
  onCancel
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 text-indigo-700">
             <BookPlus size={24} />
             <h3 className="text-lg font-bold">Insert Blank Page</h3>
          </div>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <X size={20} />
          </button>
        </div>

        <p className="text-gray-600 mb-6 text-sm">
          Where would you like to insert a new blank page?
        </p>

        <div className="space-y-3">
          <button
            onClick={() => onConfirm('start')}
            className="w-full py-3.5 px-4 border border-gray-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-300 text-left flex items-center justify-between group transition-all"
          >
            <span className="font-medium text-gray-700 group-hover:text-indigo-700">At the Beginning</span>
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded group-hover:bg-white">Page 1</span>
          </button>

          <button
            onClick={() => onConfirm('current')}
            className="w-full py-3.5 px-4 border border-gray-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-300 text-left flex items-center justify-between group transition-all"
          >
             <span className="font-medium text-gray-700 group-hover:text-indigo-700">After Current Page</span>
             <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded group-hover:bg-white">Page {currentPage + 1}</span>
          </button>

          <button
            onClick={() => onConfirm('end')}
            className="w-full py-3.5 px-4 border border-gray-200 rounded-xl hover:bg-indigo-50 hover:border-indigo-300 text-left flex items-center justify-between group transition-all"
          >
             <span className="font-medium text-gray-700 group-hover:text-indigo-700">At the End</span>
             <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded group-hover:bg-white">Page {totalPages + 1}</span>
          </button>
        </div>

        <div className="mt-6 flex justify-end">
             <button onClick={onCancel} className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2">
                 Cancel
             </button>
        </div>
      </div>
    </div>
  );
};

export default InsertPageModal;