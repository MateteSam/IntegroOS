import { render, screen } from '@testing-library/react';
import GridView from './GridView';
import * as pdfjsLib from 'pdfjs-dist';

// Mock react-virtualized components to provide dimensions and render content
jest.mock('react-virtualized', () => ({
  ...jest.requireActual('react-virtualized'),
  AutoSizer: ({ children }: { children: (size: { height: number; width: number }) => React.ReactNode }) => (
    <div style={{ height: '800px', width: '1200px' }}>
      {children({ height: 800, width: 1200 })}
    </div>
  ),
  Grid: ({ cellRenderer, columnCount, columnWidth, height, rowCount, rowHeight, width }: any) => {
    // Render a simple grid with the expected content
    const items = [];
    for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
      for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
        const index = rowIndex * columnCount + columnIndex;
        const key = `${rowIndex}-${columnIndex}`;
        const style = {
          position: 'absolute' as const,
          left: columnIndex * columnWidth,
          top: rowIndex * rowHeight,
          width: columnWidth,
          height: rowHeight
        };
        items.push(cellRenderer({ columnIndex, key, rowIndex, style, index }));
      }
    }
    return <div style={{ position: 'relative', width, height }}>{items}</div>;
  }
}));

describe('GridView component', () => {
  const mockPdfDoc = { numPages: 1 } as pdfjsLib.PDFDocumentProxy;

  it('renders without crashing', () => {
    render(
      <GridView
        pdfDoc={mockPdfDoc}
        numPages={1}
        onPageClick={jest.fn()}
        onDeletePage={jest.fn()}
        onDuplicatePage={jest.fn()}
        currentPage={1}
      />
    );
    expect(screen.getByText('Add Page')).toBeInTheDocument();
  });

  it('renders page thumbnails', () => {
    render(
      <GridView
        pdfDoc={mockPdfDoc}
        numPages={1}
        onPageClick={jest.fn()}
        onDeletePage={jest.fn()}
        onDuplicatePage={jest.fn()}
        currentPage={1}
      />
    );
    expect(screen.getByText('Page 1')).toBeInTheDocument();
  });
});