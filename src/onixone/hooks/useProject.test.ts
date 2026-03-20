import { renderHook, act } from '@testing-library/react';
import { useProject } from './useProject';
import { BookLayoutEngine } from '../services/bookLayoutEngine';
import { TEMPLATE_STYLES } from '../types';

// Mock localStorage for testing
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock as any;

describe('useProject hook', () => {
  beforeEach(() => {
    localStorageMock.getItem.mockReturnValue(null);
  });

  it('initializes with default metadata', async () => {
    let result: any;
    await act(async () => {
      const hookResult = renderHook(() => useProject());
      result = hookResult.result;
      // Wait for initial async operations to complete
      await new Promise(resolve => setTimeout(resolve, 100));
    });
    
    expect(result.current.metadata).toEqual({
      title: 'Untitled Project',
      authors: [],
      publisher: '',
      bisacCodes: [],
      keywords: [],
      language: 'eng'
    });
  });

  it('initializes with default document settings', async () => {
    let result: any;
    await act(async () => {
      const hookResult = renderHook(() => useProject());
      result = hookResult.result;
      // Wait for initial async operations to complete
      await new Promise(resolve => setTimeout(resolve, 100));
    });
    
    expect(result.current.docSettings).toEqual({
      marginMm: 20,
      bleedMm: 3.175,
      cropMarkMm: 3.175,
      targetDpi: 300,
      showCropMarks: true,
      columnCount: 1,
      gutterMm: 5
    });
  });

  it('updates docSettings when setLayoutTheme is called', async () => {
    let result: any;
    await act(async () => {
      const hookResult = renderHook(() => useProject());
      result = hookResult.result;
      await new Promise(resolve => setTimeout(resolve, 50));
    });
    const classic = BookLayoutEngine.themes.find(t => t.id === 'classic-literary')!;
    await act(async () => {
      result.current.actions.setLayoutTheme(classic);
      await new Promise(resolve => setTimeout(resolve, 10));
    });
    expect(result.current.docSettings.marginMm).toBe(18);
    expect(result.current.docSettings.columnCount).toBe(1);
    expect(result.current.docSettings.gutterMm).toBe(4);
  });

  it('initializes docSettings from templateStyle preset', async () => {
    const tpl = TEMPLATE_STYLES.find(t => t.id === 'magazine-modern')!;
    let result: any;
    await act(async () => {
      const hookResult = renderHook(() => useProject({ templateStyle: tpl } as any));
      result = hookResult.result;
      await new Promise(resolve => setTimeout(resolve, 50));
    });
    expect(result.current.docSettings.marginMm).toBe(tpl.marginMm);
    expect(result.current.docSettings.columnCount).toBe(tpl.columns);
    expect(result.current.docSettings.gutterMm).toBe(tpl.columnGapMm);
  });
});
