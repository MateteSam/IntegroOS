import React, { useEffect, useRef } from 'react';
import { Copy, Trash2, Layers, ArrowUp, ArrowDown, Lock, Unlock, Eye, EyeOff, Edit3, Scissors } from 'lucide-react';

export interface ContextMenuOption {
    label?: string;
    icon?: React.ReactNode;
    onClick?: () => void;
    danger?: boolean;
    disabled?: boolean;
    divider?: boolean;
}

interface ContextMenuProps {
    x: number;
    y: number;
    options: ContextMenuOption[];
    onClose: () => void;
}

const ContextMenu: React.FC<ContextMenuProps> = ({ x, y, options, onClose }) => {
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    // Ensure menu stays within viewport
    const adjustedX = Math.min(x, window.innerWidth - 220);
    const adjustedY = Math.min(y, window.innerHeight - (options.length * 40 + 20));

    return (
        <div
            ref={menuRef}
            className="fixed z-[1000] min-w-[220px] bg-slate-900 border border-slate-700/50 shadow-2xl rounded-lg py-1.5 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
            style={{ top: adjustedY, left: adjustedX }}
        >
            {options.map((option, index) => (
                <React.Fragment key={index}>
                    {option.divider && <div className="h-px bg-white/5 my-1 mx-2" />}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (!option.disabled && option.onClick) {
                                option.onClick();
                                onClose();
                            }
                        }}
                        disabled={option.disabled}
                        className={`w-full flex items-center gap-2.5 px-3 py-1.5 text-xs font-medium transition-colors
                            ${option.disabled ? 'opacity-40 cursor-not-allowed' :
                                option.danger ? 'text-rose-400 hover:bg-rose-500/10 hover:text-rose-300' : 'text-slate-300 hover:bg-cyan-500/10 hover:text-cyan-400'}`}
                    >
                        <span className="shrink-0 opacity-70">{option.icon}</span>
                        <span className="flex-1 text-left">{option.label}</span>
                    </button>
                </React.Fragment>
            ))}
        </div>
    );
};

export default ContextMenu;
