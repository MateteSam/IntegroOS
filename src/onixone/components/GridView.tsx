
import React, { useRef, useEffect } from 'react';
import { AutoSizer, Grid } from 'react-virtualized';
import * as pdfjsLib from 'pdfjs-dist';
import { Trash2, Copy, Plus } from 'lucide-react';
import { getPage, renderPage } from '../services/pdfService';

interface GridViewProps {
    pdfDoc: pdfjsLib.PDFDocumentProxy;
    numPages: number;
    onPageClick: (pageIndex: number) => void;
    onDeletePage: (index: number) => void;
    onDuplicatePage: (index: number) => void;
    currentPage: number;
}

const GridView: React.FC<GridViewProps> = ({
    pdfDoc,
    numPages,
    onPageClick,
    onDeletePage,
    onDuplicatePage,
    currentPage
}) => {
    return (
        <div className="h-full p-4">
            <AutoSizer>
                {({ height, width }) => {
                    const columnWidth = 220;
                    const rowHeight = 320;
                    const columnCount = Math.max(1, Math.floor((width - 32) / columnWidth)); // Account for padding
                    const itemCount = numPages + 1; // Pages + add button
                    const rowCount = Math.ceil(itemCount / columnCount);

                    return (
                        <Grid
                            cellRenderer={({ columnIndex, key, rowIndex, style }) => {
                                const index = rowIndex * columnCount + columnIndex;
                                if (index >= itemCount) return null;

                                if (index === numPages) {
                                    // Add Page button
                                    return (
                                        <div
                                            key={key}
                                            style={{ ...style, padding: 8 }}
                                            className="aspect-[1/1.41] rounded-2xl border-2 border-dashed border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30 flex flex-col items-center justify-center text-slate-300 hover:text-indigo-500 transition-all cursor-pointer group"
                                        >
                                            <div className="p-3 bg-slate-50 group-hover:bg-white rounded-full mb-2 shadow-sm group-hover:shadow-md transition-all">
                                                <Plus size={24} />
                                            </div>
                                            <span className="text-xs font-bold uppercase tracking-wider">Add Page</span>
                                        </div>
                                    );
                                }

                                // Page thumbnail
                                return (
                                    <div
                                        key={key}
                                        style={{ ...style, padding: 8 }}
                                        className={`group relative bg-white rounded-2xl p-3 transition-all duration-300 cursor-pointer ${index === currentPage - 1 ? 'ring-4 ring-indigo-500/20 shadow-xl scale-[1.02]' : 'shadow-sm hover:shadow-xl hover:-translate-y-1 ring-1 ring-slate-200 hover:ring-indigo-200'}`}
                                        onClick={() => onPageClick(index + 1)}
                                    >
                                        <div className="aspect-[1/1.41] bg-slate-50 mb-3 overflow-hidden rounded-xl border border-slate-100 relative">
                                            <PageThumbnail pdfDoc={pdfDoc} pageIndex={index} />
                                            <div className="absolute inset-0 bg-indigo-900/0 group-hover:bg-indigo-900/5 transition-colors" />
                                        </div>

                                        <div className="flex items-center justify-between px-1">
                                            <span className={`text-xs font-bold uppercase tracking-wider ${index === currentPage - 1 ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`}>Page {index + 1}</span>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 duration-200">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onDuplicatePage(index); }}
                                                    className="p-1.5 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors"
                                                    title="Duplicate"
                                                >
                                                    <Copy size={14} />
                                                </button>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onDeletePage(index); }}
                                                    className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={14} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }}
                            columnCount={columnCount}
                            columnWidth={columnWidth}
                            height={height}
                            rowCount={rowCount}
                            rowHeight={rowHeight}
                            width={width}
                            overscanRowCount={5}
                        />
                    );
                }}
            </AutoSizer>
        </div>
    );
};

const PageThumbnail: React.FC<{ pdfDoc: pdfjsLib.PDFDocumentProxy; pageIndex: number }> = ({ pdfDoc, pageIndex }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const renderTaskRef = useRef<pdfjsLib.RenderTask | null>(null);

    useEffect(() => {
        let isMounted = true;
        const render = async () => {
            if (renderTaskRef.current) {
                renderTaskRef.current.cancel();
            }
            if (!canvasRef.current || !pdfDoc || typeof (pdfDoc as any).getPage !== 'function') return;
            try {
                const page = await getPage(pdfDoc, pageIndex + 1);
                if (!isMounted) return;
                const canvas = canvasRef.current;

                const viewport = page.getViewport({ scale: 0.3 });
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                const renderContext = {
                    canvasContext: canvas.getContext('2d')!,
                    viewport: viewport
                };
                renderTaskRef.current = page.render(renderContext);
                await renderTaskRef.current.promise;
            } catch (e) {
                if ((e as Error).name !== 'RenderingCancelledException') {
                    console.warn("Thumbnail render error", e);
                }
            } finally {
                if (isMounted) renderTaskRef.current = null;
            }
        };

        render();

        return () => {
            isMounted = false;
            if (renderTaskRef.current) {
                renderTaskRef.current.cancel();
            }
        };
    }, [pdfDoc, pageIndex]);

    return <canvas ref={canvasRef} className="w-full h-full object-contain block mx-auto" />;
};

export default GridView;