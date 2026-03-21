// ═══════════════════════════════════════════════════════════════
// INTEGRO WEBSTUDIO — Drag Engine
// Grid & Freestyle drag-and-drop for block-based editing
// ═══════════════════════════════════════════════════════════════

import type { EditorBlock } from './editorEngine';

export type DragMode = 'grid' | 'freestyle';

// ── Drag State ──────────────────────────────────────────────
export interface DragState {
  isDragging: boolean;
  draggedBlockId: string | null;
  dragOverIndex: number | null;
  startY: number;
  currentY: number;
  mode: DragMode;
}

export const INITIAL_DRAG_STATE: DragState = {
  isDragging: false,
  draggedBlockId: null,
  dragOverIndex: null,
  startY: 0,
  currentY: 0,
  mode: 'grid',
};

// ── Grid Mode: Reorder blocks by swapping positions ─────────
export function handleGridDragStart(
  blockId: string,
  clientY: number
): Partial<DragState> {
  return {
    isDragging: true,
    draggedBlockId: blockId,
    startY: clientY,
    currentY: clientY,
  };
}

export function handleGridDragOver(
  blocks: EditorBlock[],
  clientY: number,
  containerTop: number,
  blockElements: HTMLElement[]
): number | null {
  // Find which block the cursor is over
  for (let i = 0; i < blockElements.length; i++) {
    const rect = blockElements[i].getBoundingClientRect();
    const midY = rect.top + rect.height / 2;
    if (clientY < midY) return i;
  }
  return blocks.length - 1;
}

export function handleGridDrop(
  blocks: EditorBlock[],
  draggedId: string,
  targetIndex: number
): EditorBlock[] {
  const fromIndex = blocks.findIndex(b => b.id === draggedId);
  if (fromIndex < 0 || fromIndex === targetIndex) return blocks;

  const updated = [...blocks];
  const [moved] = updated.splice(fromIndex, 1);
  updated.splice(targetIndex, 0, moved);

  return updated.map((b, i) => ({ ...b, order: i }));
}

// ── Freestyle Mode: Track absolute positions ────────────────
export interface FreestylePosition {
  blockId: string;
  x: number;
  y: number;
  width: number;
  height: number;
  zIndex: number;
}

export function handleFreestyleDrag(
  positions: FreestylePosition[],
  blockId: string,
  deltaX: number,
  deltaY: number
): FreestylePosition[] {
  return positions.map(p =>
    p.blockId === blockId
      ? { ...p, x: p.x + deltaX, y: p.y + deltaY }
      : p
  );
}

export function bringToFront(
  positions: FreestylePosition[],
  blockId: string
): FreestylePosition[] {
  const maxZ = Math.max(...positions.map(p => p.zIndex)) + 1;
  return positions.map(p =>
    p.blockId === blockId ? { ...p, zIndex: maxZ } : p
  );
}

// ── Drop Indicator Calculation ──────────────────────────────
export function getDropIndicatorPosition(
  dragOverIndex: number | null,
  blockElements: HTMLElement[]
): { top: number; visible: boolean } {
  if (dragOverIndex === null || blockElements.length === 0) {
    return { top: 0, visible: false };
  }

  if (dragOverIndex >= blockElements.length) {
    const lastRect = blockElements[blockElements.length - 1].getBoundingClientRect();
    return { top: lastRect.bottom, visible: true };
  }

  const rect = blockElements[dragOverIndex].getBoundingClientRect();
  return { top: rect.top, visible: true };
}
