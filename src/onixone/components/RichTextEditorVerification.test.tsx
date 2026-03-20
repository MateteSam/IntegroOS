
import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import RichTextEditor from './RichTextEditor';

// Mock dependencies
jest.mock('@hocuspocus/provider', () => ({
  HocuspocusProvider: jest.fn().mockImplementation(() => ({
    document: {},
    destroy: jest.fn(),
  })),
}));

jest.mock('yjs', () => ({
  Doc: jest.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock window.prompt
window.prompt = jest.fn();

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  Bold: () => <span>BoldIcon</span>,
  Italic: () => <span>ItalicIcon</span>,
  List: () => <span>ListIcon</span>,
  ListOrdered: () => <span>ListOrderedIcon</span>,
  Undo: () => <span>UndoIcon</span>,
  Redo: () => <span>RedoIcon</span>,
  Sparkles: () => <span>SparklesIcon</span>,
  X: () => <span>XIcon</span>,
  Wand2: () => <span>Wand2Icon</span>,
  History: () => <span>HistoryIcon</span>,
  Heading1: () => <span>Heading1Icon</span>,
  Heading2: () => <span>Heading2Icon</span>,
  Heading3: () => <span>Heading3Icon</span>,
  Quote: () => <span>QuoteIcon</span>,
  Check: () => <span>CheckIcon</span>,
  ChevronDown: () => <span>ChevronDownIcon</span>,
  AlignLeft: () => <span>AlignLeftIcon</span>,
  AlignCenter: () => <span>AlignCenterIcon</span>,
  AlignRight: () => <span>AlignRightIcon</span>,
  Type: () => <span>TypeIcon</span>,
  Maximize2: () => <span>Maximize2Icon</span>,
  Minimize2: () => <span>Minimize2Icon</span>,
  Palette: () => <span>PaletteIcon</span>,
  FileText: () => <span>FileTextIcon</span>,
  Underline: () => <span>UnderlineIcon</span>,
  Link: () => <span>LinkIcon</span>,
  Image: () => <span>ImageIcon</span>,
  AlignJustify: () => <span>AlignJustifyIcon</span>,
  Users: () => <span>UsersIcon</span>,
  Highlighter: () => <span>HighlighterIcon</span>,
}));

// Mock Tiptap
jest.mock('@tiptap/react', () => ({
  useEditor: jest.fn(() => ({
    chain: () => ({
      focus: () => ({
        undo: () => ({ run: jest.fn() }),
        redo: () => ({ run: jest.fn() }),
        toggleBold: () => ({ run: jest.fn() }),
        toggleItalic: () => ({ run: jest.fn() }),
        toggleUnderline: () => ({ run: jest.fn() }),
        toggleHighlight: () => ({ run: jest.fn() }),
        run: jest.fn(),
        setFontFamily: () => ({ run: jest.fn() }),
        setColor: () => ({ run: jest.fn() }),
      }),
    }),
    can: () => ({
      undo: () => true,
      redo: () => true,
    }),
    isActive: () => false,
    getAttributes: () => ({}),
    getText: () => 'Test content',
    getHTML: () => '<p>Test content</p>',
    on: jest.fn(),
    off: jest.fn(),
    commands: {
      setContent: jest.fn(),
    },
  })),
  useCurrentEditor: jest.fn(() => ({
    editor: {
      chain: () => ({ focus: () => ({ run: jest.fn() }) }),
      can: () => ({ undo: () => true, redo: () => true }),
      isActive: () => false,
      getAttributes: () => ({}),
    }
  })),
  EditorContent: () => <div>Editor Content</div>,
  BubbleMenu: ({ children }: any) => <div>{children}</div>,
  FloatingMenu: ({ children }: any) => <div>{children}</div>,
}));

// Mock Tiptap menus to avoid plugin wiring in tests
jest.mock('@tiptap/react/menus', () => ({
  BubbleMenu: ({ children }: any) => <div>{children}</div>,
  FloatingMenu: ({ children }: any) => <div>{children}</div>,
}));

// Mock randomcolor
jest.mock('randomcolor', () => ({
  __esModule: true,
  default: jest.fn(() => '#123456'),
}));

describe('RichTextEditor Verification', () => {
  it('renders without crashing', async () => {
    render(
      <RichTextEditor 
        value="<p>Test content</p>" 
        onChange={() => {}} 
      />
    );
    
    // Check if editor content is present
    expect(screen.getByText('Editor Content')).toBeInTheDocument();
  });

  it('renders toolbar with new features', async () => {
    render(
      <RichTextEditor 
        value="" 
        onChange={() => {}} 
      />
    );

    // Check for Highlight button (using title attribute)
    const highlightBtn = screen.getByTitle('Highlight');
    expect(highlightBtn).toBeInTheDocument();

    // Check for Font dropdown label showing the active font
    expect(screen.getAllByText('Plus Jakarta Sans').length).toBeGreaterThan(0);
  });

  it('initializes collaboration provider when ID is passed', async () => {
    const { HocuspocusProvider } = require('@hocuspocus/provider');
    
    render(
      <RichTextEditor 
        value="" 
        onChange={() => {}} 
        collaborationId="test-doc-id"
      />
    );

    // Verify HocuspocusProvider was instantiated
    expect(HocuspocusProvider).toHaveBeenCalledWith(expect.objectContaining({
      name: 'test-doc-id',
      url: expect.stringContaining('ws://'),
    }));
  });
});
