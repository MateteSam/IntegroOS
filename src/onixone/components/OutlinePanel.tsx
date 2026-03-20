import React from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { StoryBlock, TextStoryBlock } from '../types';
import { Type, Image as ImageIcon, Pilcrow, Heading1, Heading2, GripVertical } from 'lucide-react';

interface OutlinePanelProps {
  storyBlocks: StoryBlock[];
  onSelectBlock: (id: string) => void;
  onReorder: (dragId: string, dropId: string) => void;
  selectedBlockId?: string | null;
}

const getIconForBlock = (block: StoryBlock) => {
  switch (block.type) {
    case 'chapter':
      return <Heading1 size={14} className="text-indigo-500" />;
    case 'heading':
      return <Heading2 size={14} className="text-slate-500" />;
    case 'paragraph':
      return <Pilcrow size={14} className="text-slate-400" />;
    case 'quote':
      return <Pilcrow size={14} className="text-slate-400" />;
    case 'image':
      return <ImageIcon size={14} className="text-purple-500" />;
    default:
      return <Type size={14} className="text-slate-400" />;
  }
};

const getTitleForBlock = (block: StoryBlock): string => {
  switch (block.type) {
    case 'chapter':
    case 'heading':
    case 'paragraph':
    case 'quote':
    case 'note':
      return (block as TextStoryBlock).text.substring(0, 50) +
        ((block as TextStoryBlock).text.length > 50 ? '...' : '');
    case 'image':
      return 'Image Block';
    case 'break':
      return 'Page Break';
    default:
      return 'Unknown Block';
  }
};

// ─── Isolated sub-component so hooks are always called at the top level ───────
interface DraggableBlockProps {
  block: StoryBlock;
  isSelected: boolean;
  onSelectBlock: (id: string) => void;
  onReorder: (dragId: string, dropId: string) => void;
}

const DraggableBlock: React.FC<DraggableBlockProps> = ({
  block,
  isSelected,
  onSelectBlock,
  onReorder,
}) => {
  const [, drop] = useDrop<{ id: string }, void, unknown>({
    accept: 'OUTLINE_BLOCK',
    hover(item) {
      if (item.id !== block.id) {
        onReorder(item.id, block.id);
      }
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: 'OUTLINE_BLOCK',
    item: { id: block.id },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  return (
    <div
      ref={(node) => { drag(drop(node)); }}
      onClick={() => onSelectBlock(block.id)}
      className={`group flex items-center gap-3 px-3 py-2 rounded-lg border text-xs cursor-pointer transition-all duration-150
        ${isSelected
          ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-50'
          : 'bg-slate-800/40 border-transparent hover:bg-slate-800 text-slate-400 hover:text-slate-200'
        }
        ${isDragging ? 'opacity-50 scale-95' : ''}
      `}
    >
      <div className={`mt-0.5 shrink-0 ${isSelected ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-400'}`}>
        {getIconForBlock(block)}
      </div>
      <span
        className={`flex-1 truncate font-mono ${block.type === 'chapter' ? 'font-bold uppercase tracking-wider' :
            block.type === 'heading' ? 'font-semibold' : ''
          }`}
      >
        {getTitleForBlock(block)}
      </span>
      <GripVertical size={12} className="text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity" />
    </div>
  );
};

// ─── Main panel ───────────────────────────────────────────────────────────────
const OutlinePanel: React.FC<OutlinePanelProps> = ({
  storyBlocks,
  onSelectBlock,
  onReorder,
  selectedBlockId,
}) => {
  return (
    <div className="space-y-1">
      {storyBlocks.length === 0 && (
        <div className="text-center py-10 text-slate-400 text-sm italic">
          No content. Start by importing a file.
        </div>
      )}
      {storyBlocks.map((block) => (
        <DraggableBlock
          key={block.id}
          block={block}
          isSelected={selectedBlockId === block.id}
          onSelectBlock={onSelectBlock}
          onReorder={onReorder}
        />
      ))}
    </div>
  );
};

export default OutlinePanel;
