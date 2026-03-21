// ═══════════════════════════════════════════════════════════════
// INTEGRO WEBSTUDIO — Block UI Components
// Toolbar overlays and insert buttons for block-based editing
// ═══════════════════════════════════════════════════════════════

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronUp, ChevronDown, Copy, Trash2, Eye, EyeOff,
  GripVertical, Plus, Settings2, Lock, Unlock
} from 'lucide-react';
import type { EditorBlock, BlockType } from '../../lib/webstudio/editorEngine';
import { BLOCK_LIBRARY } from '../../lib/webstudio/editorEngine';
import './BlockUI.css';

// ── Block Toolbar (appears on hover) ────────────────────────
interface BlockToolbarProps {
  block: EditorBlock;
  isFirst: boolean;
  isLast: boolean;
  onMove: (dir: 'up' | 'down') => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onToggleVisibility: () => void;
  onSelect: () => void;
}

export const BlockToolbar: React.FC<BlockToolbarProps> = ({
  block, isFirst, isLast, onMove, onDuplicate, onDelete, onToggleVisibility, onSelect
}) => (
  <motion.div
    className="block-toolbar"
    initial={{ opacity: 0, y: -8 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -8 }}
    transition={{ duration: 0.15 }}
  >
    <div className="block-toolbar-label">
      <GripVertical size={14} />
      <span>{block.label}</span>
    </div>
    <div className="block-toolbar-actions">
      <button onClick={() => onMove('up')} disabled={isFirst} title="Move Up"><ChevronUp size={14} /></button>
      <button onClick={() => onMove('down')} disabled={isLast} title="Move Down"><ChevronDown size={14} /></button>
      <button onClick={onDuplicate} title="Duplicate"><Copy size={14} /></button>
      <button onClick={onToggleVisibility} title={block.visible ? 'Hide' : 'Show'}>
        {block.visible ? <Eye size={14} /> : <EyeOff size={14} />}
      </button>
      <button onClick={onSelect} title="Settings"><Settings2 size={14} /></button>
      <button onClick={onDelete} className="block-toolbar-delete" title="Delete"><Trash2 size={14} /></button>
    </div>
  </motion.div>
);

// ── Block Insert Button (between blocks) ────────────────────
interface BlockInsertButtonProps {
  onInsert: (type: BlockType) => void;
}

export const BlockInsertButton: React.FC<BlockInsertButtonProps> = ({ onInsert }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="block-insert-zone">
      <button className="block-insert-trigger" onClick={() => setOpen(!open)} title="Add Section">
        <Plus size={16} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="block-insert-menu"
            initial={{ opacity: 0, scale: 0.9, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -8 }}
          >
            <div className="block-insert-menu-header">Add Section</div>
            <div className="block-insert-menu-grid">
              {BLOCK_LIBRARY.map(item => (
                <button
                  key={item.type}
                  className="block-insert-item"
                  onClick={() => { onInsert(item.type); setOpen(false); }}
                >
                  <span className="block-insert-icon">{item.icon}</span>
                  <span className="block-insert-label">{item.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ── Block Wrapper (wraps each section with hover detection) ──
interface BlockWrapperProps {
  block: EditorBlock;
  index: number;
  total: number;
  onMove: (id: string, dir: 'up' | 'down') => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onSelect: (id: string) => void;
  onInsert: (type: BlockType, afterIndex: number) => void;
  isPreviewMode: boolean;
  selectedBlockId: string | null;
  children: React.ReactNode;
}

export const BlockWrapper: React.FC<BlockWrapperProps> = ({
  block, index, total, onMove, onDuplicate, onDelete, onToggleVisibility, onSelect, onInsert, isPreviewMode, selectedBlockId, children
}) => {
  const [hovered, setHovered] = useState(false);

  if (!block.visible && isPreviewMode) return null;

  return (
    <>
      <div
        className={`block-wrapper ${!block.visible ? 'block-hidden' : ''} ${selectedBlockId === block.id ? 'block-selected' : ''} ${isPreviewMode ? 'block-preview' : ''}`}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        data-block-id={block.id}
        data-block-type={block.type}
      >
        {!isPreviewMode && (
          <AnimatePresence>
            {hovered && (
              <BlockToolbar
                block={block}
                isFirst={index === 0}
                isLast={index === total - 1}
                onMove={(dir) => onMove(block.id, dir)}
                onDuplicate={() => onDuplicate(block.id)}
                onDelete={() => onDelete(block.id)}
                onToggleVisibility={() => onToggleVisibility(block.id)}
                onSelect={() => onSelect(block.id)}
              />
            )}
          </AnimatePresence>
        )}
        <div className={`block-content ${!block.visible ? 'block-content-hidden' : ''}`}>
          {children}
        </div>
      </div>
      {!isPreviewMode && (
        <BlockInsertButton onInsert={(type) => onInsert(type, index)} />
      )}
    </>
  );
};
