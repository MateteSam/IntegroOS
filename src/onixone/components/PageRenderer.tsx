import React, { useRef, useEffect, useState, useLayoutEffect } from 'react';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf';
import { Annotation, DocumentSettings, BookMetadata } from '../types';
// import { formatPageNumber } from '../services/bookLayoutEngine'; // REMOVED
import { X, Check } from 'lucide-react';
import InlineTextEditor from './InlineTextEditor';

pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface PageRendererProps {
    pdfDoc?: pdfjsLib.PDFDocumentProxy;
    pageNumber: number;
    scale: number;
    annotations: Annotation[];
    selectedIds: string[];
    inlineEditId: string | null;
    docSettings: DocumentSettings;
    metadata?: BookMetadata;
    onCanvasClick: (e: React.MouseEvent) => void;
    onAnnotationMouseDown: (e: React.MouseEvent, id: string, pageIndex: number) => void;
    onResizeMouseDown: (e: React.MouseEvent, id: string, handle: string) => void;
    onInlineChange: (id: string, val: string) => void;
    onInlineBlur: () => void;
    onSetInlineEditId: (id: string | null) => void;
    onTogglePin: (id: string) => void;
    getCssFontFamily: (font: string) => string;
    setPageDimensions?: (dims: { width: number; height: number }) => void;
    viewMode: 'single' | 'grid' | 'spread';
    isTextMode: boolean;
    isPanning: boolean;
    bookHtml?: string;
    bookCss?: string;
    pageSize?: { widthPt: number; heightPt: number };
    onPageCountChange?: (count: number) => void;
    onContextMenu?: (e: React.MouseEvent, id: string | null) => void;
}

const HtmlOverlayEditor: React.FC<{
    inlineEditId: string;
    pageIndex: number;
    scale: number;
    onSave: (id: string, val: string) => void;
    onCancel: () => void;
    pageSize: { width: number, height: number };
    marginPx: number;
    annotations: Annotation[];
}> = ({ inlineEditId, pageIndex, scale, onSave, onCancel, pageSize, marginPx, annotations }) => {
    const [style, setStyle] = useState<React.CSSProperties | null>(null);
    const ann = annotations.find(a => a.id === inlineEditId);

    useEffect(() => {
        const el = document.getElementById(inlineEditId);
        if (!el) return;

        const rect = el.getBoundingClientRect();
        const computed = window.getComputedStyle(el);

        setStyle({
            position: 'fixed',
            top: rect.top - 40, // offset for toolbar
            left: rect.left,
            width: rect.width,
            height: 'auto',
            minHeight: rect.height,
            zIndex: 1000,
        });

    }, [inlineEditId, pageIndex, scale]);

    if (!style || !ann) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/20" onClick={onCancel}>
            <div
                style={style}
                onClick={e => e.stopPropagation()}
                className="shadow-2xl"
            >
                <InlineTextEditor
                    initialValue={ann.text}
                    storyBlockId={ann.storyBlockId}
                    onSave={(sid, val) => {
                        onSave(sid, val);
                        onCancel();
                    }}
                    onCancel={onCancel}
                    style={{
                        fontSize: `calc(${ann.fontSize}pt * ${scale})`,
                        fontFamily: ann.fontFamily,
                    }}
                />
            </div>
        </div>
    );
};

const PageRenderer: React.FC<PageRendererProps> = ({
    pdfDoc, pageNumber, scale, annotations, selectedIds, inlineEditId,
    docSettings, metadata,
    onCanvasClick, onAnnotationMouseDown, onResizeMouseDown, onInlineChange, onInlineBlur, onSetInlineEditId,
    setPageDimensions, viewMode, isPanning, bookHtml, bookCss, onPageCountChange, onContextMenu,
    pageSize: propPageSize
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const renderTaskRef = useRef<any>(null);

    useEffect(() => {
        if (!pdfDoc) {
            const w = (docSettings?.widthMm || 148) * 2.835;
            const h = (docSettings?.heightMm || 210) * 2.835;
            if (setPageDimensions) setPageDimensions({ width: w * scale, height: h * scale });
            return;
        }

        const renderPage = async () => {
            if (!canvasRef.current || !pdfDoc) return;
            try {
                const page = await pdfDoc.getPage(pageNumber);
                if (renderTaskRef.current) renderTaskRef.current.cancel();

                const viewport = page.getViewport({ scale });
                if (setPageDimensions) setPageDimensions({ width: viewport.width, height: viewport.height });

                const canvas = canvasRef.current;
                const context = canvas.getContext('2d');
                if (!context) return;

                canvas.height = viewport.height;
                canvas.width = viewport.width;

                const renderContext = { canvasContext: context, viewport: viewport };
                const renderTask = page.render(renderContext);
                renderTaskRef.current = renderTask;
                await renderTask.promise;
            } catch (error: any) {
                if (error.name !== 'RenderingCancelledException') {
                    console.error('Render error:', error);
                }
            }
        };

        renderPage();
        return () => { if (renderTaskRef.current) renderTaskRef.current.cancel(); };
    }, [pdfDoc, pageNumber, scale, setPageDimensions, docSettings]);

    const widthPt = propPageSize?.widthPt || (docSettings?.widthMm ? docSettings.widthMm * 2.835 : 419.53); // Default A5
    const heightPt = propPageSize?.heightPt || (docSettings?.heightMm ? docSettings.heightMm * 2.835 : 595.28);
    const pageSize = { width: widthPt * scale, height: heightPt * scale };
    const marginPx = (docSettings?.marginMm || 20) * 2.835 * scale;
    const pageIndex = pageNumber - 1;

    // Check if using Parchments theme for special background effects
    const isParchmentsTheme = metadata?.category === 'devotional' || true; // Layout engine completely wiped out
    
    // Generate parchment texture background style
    const getBackgroundStyle = () => {
        const baseColor = '#fafaf9';
        
        return {
            backgroundImage: 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.4) 0%, transparent 100%), url("https://www.transparenttextures.com/patterns/paper.png")',
            backgroundColor: baseColor
        };
    };

    return (
        <div
            className="relative shadow-[0_20px_50px_rgba(0,0,0,0.3),0_0_0_1px_rgba(0,0,0,0.05)] transition-transform duration-200 ease-out select-none overflow-hidden"
            style={{
                width: pageSize.width,
                height: pageSize.height,
                ...getBackgroundStyle()
            }}
            onMouseDown={onCanvasClick}
            onContextMenu={(e) => onContextMenu && onContextMenu(e, null)}
        >
            {/* Parchment faded border effect */}
            {isParchmentsTheme && (
                <div 
                    className="absolute inset-0 pointer-events-none z-[1]"
                    style={{
                        boxShadow: 'inset 0 0 60px 20px rgba(139, 90, 43, 0.08)',
                    }}
                />
            )}
            
            <div className="absolute inset-0 pointer-events-none z-[1]" style={{
                boxShadow: 'inset 0 0 100px rgba(0,0,0,0.02), inset 0 0 20px rgba(0,0,0,0.05)',
                mixBlendMode: 'multiply'
            }} />
            {pdfDoc && <canvas ref={canvasRef} className="absolute inset-0 z-0" />}

            {!pdfDoc && (
                <div className="absolute inset-0 overflow-hidden" style={{ pointerEvents: 'auto' }}>
                    <div
                        style={{
                            width: `${widthPt}px`,
                            height: `${heightPt}px`,
                            transform: `scale(${scale})`,
                            transformOrigin: 'top left',
                        }}
                    >
                        {annotations.filter(a => a.pageIndex === pageIndex).map((ann) => {
                            const isSelected = selectedIds.includes(ann.id);

                            if (ann.type === 'text') {
                                return (
                                    <div
                                        key={ann.id}
                                        id={ann.id}
                                        className="onix-text-annotation"
                                        onClick={(e) => {
                                            if (isPanning) return;
                                            onAnnotationMouseDown(e, ann.id, pageIndex);
                                            if (ann.id.startsWith('sb-') || ann.id.startsWith('p-') || ann.id.startsWith('head-')) {
                                                onSetInlineEditId(ann.id);
                                            }
                                        }}
                                        onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); onContextMenu && onContextMenu(e, ann.id); }}
                                        style={{
                                            position: 'absolute',
                                            top: `${ann.y}px`,
                                            left: `${ann.x}px`,
                                            width: `${ann.width}px`,
                                            height: `${ann.height}px`,
                                            fontFamily: ann.fontFamily,
                                            fontSize: `${ann.fontSize}px`,
                                            color: ann.color,
                                            textAlign: ann.textAlign as any,
                                            textAlignLast: (ann as any).textAlignLast,
                                            lineHeight: ann.lineHeight || 1.6,
                                            letterSpacing: ann.letterSpacing ? `${ann.letterSpacing}px` : undefined,
                                            whiteSpace: 'pre-wrap',
                                            overflowWrap: 'break-word',
                                            wordBreak: 'break-word',
                                            overflow: 'hidden', // Changed from visible to hide shifted text
                                            textOverflow: 'clip',
                                            textTransform: (ann as any).textTransform,
                                            cursor: 'text',
                                            zIndex: ann.zIndex || 10,
                                            outline: isSelected ? '1px solid #3b82f6' : 'none',
                                            transform: `rotate(${ann.rotation || 0}deg)`,
                                            opacity: ann.hidden ? 0 : (ann.opacity ?? 1),
                                            pointerEvents: ann.locked ? 'none' : 'auto'
                                        }}
                                    >
                                        <div 
                                            style={{ marginTop: ann.yOffset ? `-${ann.yOffset}px` : 0 }}
                                            dangerouslySetInnerHTML={{ __html: ann.text }}
                                        />
                                    </div>
                                );
                            }

                            if (ann.type === 'image') {
                                const imgAnn = ann as any; // Access Canva-like props
                                return (
                                    <div
                                        key={ann.id}
                                        id={ann.id}
                                        onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); onContextMenu && onContextMenu(e, ann.id); }}
                                        style={{
                                            position: 'absolute',
                                            top: `${ann.y}px`,
                                            left: `${ann.x}px`,
                                            width: `${ann.width}px`,
                                            height: `${ann.height}px`,
                                            zIndex: ann.zIndex || 5,
                                            outline: isSelected ? '2px solid #3b82f6' : 'none',
                                            transform: `rotate(${imgAnn.frameRotation || ann.rotation || 0}deg)`,
                                            opacity: ann.hidden ? 0 : (ann.opacity ?? 1),
                                            pointerEvents: ann.locked ? 'none' : 'auto',
                                            boxShadow: imgAnn.shadow
                                                ? `${imgAnn.shadow.offsetX}px ${imgAnn.shadow.offsetY}px ${imgAnn.shadow.blur}px ${imgAnn.shadow.color}`
                                                : 'none',
                                            overflow: 'hidden',
                                        }}
                                        onMouseDown={(e) => onAnnotationMouseDown(e, ann.id, pageIndex)}
                                    >
                                        <img
                                            src={ann.imageBase64}
                                            alt=""
                                            style={{
                                                width: '100%', height: '100%',
                                                objectFit: imgAnn.objectFit || 'cover',
                                                borderRadius: ann.borderRadius,
                                                filter: ann.filter && ann.filter !== 'none' ? ann.filter : undefined,
                                            }}
                                        />
                                    </div>
                                );
                            }

                            if (['rect', 'circle', 'line'].includes(ann.type)) {
                                return (
                                    <div
                                        key={ann.id}
                                        onContextMenu={(e) => { e.preventDefault(); e.stopPropagation(); onContextMenu && onContextMenu(e, ann.id); }}
                                        onMouseDown={(e) => onAnnotationMouseDown(e, ann.id, pageIndex)}
                                        style={{
                                            position: 'absolute',
                                            top: `${ann.y}px`,
                                            left: `${ann.x}px`,
                                            width: `${ann.width}px`,
                                            height: `${ann.height}px`,
                                            backgroundColor: ann.type === 'circle' ? 'transparent'
                                                : (ann as any).fillGradient
                                                    ? undefined
                                                    : ann.fillColor,
                                            background: (ann as any).fillGradient
                                                ? `linear-gradient(${(ann as any).fillGradient.angle || 180}deg, ${(ann as any).fillGradient.start}, ${(ann as any).fillGradient.end})`
                                                : undefined,
                                            opacity: ann.hidden ? 0 : (ann.opacity ?? 1),
                                            border: `${ann.strokeWidth || 0}px solid ${ann.strokeColor || 'transparent'}`,
                                            borderRadius: ann.type === 'circle' ? '50%' : (ann.borderRadius || 0),
                                            zIndex: ann.zIndex || 1,
                                            transform: `rotate(${ann.rotation || 0}deg)`,
                                            pointerEvents: ann.locked ? 'none' : 'auto',
                                            outline: isSelected ? '2px solid #3b82f6' : 'none',
                                            overflow: 'hidden'
                                        }}
                                    >
                                        {ann.type === 'circle' && (
                                            <div style={{ width: '100%', height: '100%', backgroundColor: ann.fillColor }} />
                                        )}
                                        {ann.type === 'line' && (() => {
                                            const isVertical = ann.height > ann.width;
                                            if (isVertical) {
                                                return <div style={{ width: ann.strokeWidth || 1, height: '100%', backgroundColor: ann.strokeColor || ann.fillColor, marginLeft: (ann.width - (ann.strokeWidth || 1)) / 2 }} />;
                                            }
                                            return <div style={{ width: '100%', height: ann.strokeWidth || 1, backgroundColor: ann.strokeColor || ann.fillColor, marginTop: (ann.height - (ann.strokeWidth || 1)) / 2 }} />;
                                        })()}
                                    </div>
                                );
                            }
                            return null;
                        })}
                    </div>
                </div>
            )}

            {inlineEditId && (
                <HtmlOverlayEditor
                    inlineEditId={inlineEditId}
                    pageIndex={pageIndex}
                    scale={scale}
                    onSave={onInlineChange}
                    onCancel={onInlineBlur}
                    pageSize={pageSize}
                    marginPx={marginPx}
                    annotations={annotations}
                />
            )}

            {!pdfDoc && docSettings && (
                <div className="absolute pointer-events-none border border-cyan-400/20 border-dashed z-20 rounded-sm"
                    style={{
                        top: marginPx,
                        left: marginPx,
                        right: marginPx,
                        bottom: marginPx,
                    }}
                >
                    <div className="absolute -top-5 right-0 px-2 py-0.5 rounded-full bg-cyan-500/10 text-[7px] text-cyan-400/60 font-mono tracking-tighter uppercase backdrop-blur-sm border border-cyan-400/10">Content Safe Zone</div>
                </div>
            )}
        </div >
    );
};

export default PageRenderer;
