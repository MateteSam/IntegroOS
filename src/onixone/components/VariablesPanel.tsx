import React, { useState } from 'react';
import { Plus, X, Tag } from 'lucide-react';

interface VariablesPanelProps {
    variables: Record<string, string>;
    onUpdateVariables: (variables: Record<string, string>) => void;
}

const VariablesPanel: React.FC<VariablesPanelProps> = ({ variables, onUpdateVariables }) => {
    const [newKey, setNewKey] = useState('');
    const [newVal, setNewVal] = useState('');

    const handleAdd = () => {
        if (!newKey) return;
        // Clean key name to be alphanumeric
        const cleanKey = newKey.replace(/[^a-zA-Z0-9]/g, '');
        onUpdateVariables({ ...variables, [cleanKey]: newVal });
        setNewKey('');
        setNewVal('');
    };

    const handleDelete = (key: string) => {
        const next = { ...variables };
        delete next[key];
        onUpdateVariables(next);
    };

    return (
        <div className="flex flex-col h-full animate-in fade-in slide-in-from-left-4 duration-300 overflow-hidden">
            <div className="p-4 border-b border-white/5 bg-slate-900/40">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-cyan-400 mb-3 flex items-center gap-2">
                    <Tag size={12} /> Global Variables
                </h3>
                <p className="text-[10px] text-slate-400 leading-relaxed mb-4">
                    Values placed here can be inserted using <code className="bg-slate-800 px-1 rounded text-cyan-500 font-mono">{"{{Key}}"}</code>.
                </p>

                <div className="flex items-center bg-slate-900 border border-white/10 rounded-lg p-1 gap-1 focus-within:border-cyan-500/50 focus-within:ring-1 focus-within:ring-cyan-500/20 transition-all">
                    <input
                        type="text"
                        placeholder="Key"
                        value={newKey}
                        onChange={(e) => setNewKey(e.target.value)}
                        className="flex-1 bg-transparent px-2 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 outline-none min-w-[60px]"
                    />
                    <div className="w-px h-4 bg-white/10" />
                    <input
                        type="text"
                        placeholder="Value"
                        value={newVal}
                        onChange={(e) => setNewVal(e.target.value)}
                        className="flex-[2] bg-transparent px-2 py-1.5 text-xs text-slate-200 placeholder:text-slate-600 outline-none min-w-[80px]"
                    />
                    <button
                        onClick={handleAdd}
                        disabled={!newKey}
                        className="p-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-900 rounded-md disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Plus size={14} strokeWidth={3} />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                {Object.entries(variables).map(([key, val]) => (
                    <div key={key} className="group relative bg-slate-800/30 hover:bg-slate-800/60 border border-white/5 rounded-lg p-2.5 transition-all">
                        <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] font-bold text-cyan-500/70 font-mono">{"{{"}{key}{"}}"}</span>
                            <button
                                onClick={() => handleDelete(key)}
                                className="text-slate-600 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <X size={12} />
                            </button>
                        </div>
                        <input
                            type="text"
                            value={val}
                            onChange={(e) => onUpdateVariables({ ...variables, [key]: e.target.value })}
                            className="w-full bg-transparent text-xs text-slate-300 placeholder:text-slate-600 outline-none border-b border-transparent focus:border-cyan-500/50 pb-0.5 transition-colors"
                        />
                    </div>
                ))}

                {Object.keys(variables).length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-600">
                        <div className="w-12 h-12 rounded-full bg-slate-800/50 flex items-center justify-center mb-3 border border-white/5">
                            <Tag size={20} className="text-slate-500" />
                        </div>
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">No Variables</div>
                        <div className="text-[10px] text-slate-600 mt-1">Add one above to get started</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VariablesPanel;
