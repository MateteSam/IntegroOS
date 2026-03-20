import React, { useState, useEffect, Suspense, lazy, useMemo } from 'react';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useProject } from '../hooks/useProject';
import { ProjectData, MainTab, StoryBlock, StoryBlockType, Annotation } from '../types';
import Header from './Header';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';
import Toolbar from './Toolbar';
import ExportPanel from './ExportPanel';
import MockupPreview from './MockupPreview';
import { generateBarcodeDataURL } from '../services/registrationEngine';
import { Loader2, Plus, Trash2, Copy, MoveUp, MoveDown, Lock, Unlock, Eye, EyeOff, RotateCcw, LayoutGrid, ChevronLeft, ChevronRight } from 'lucide-react';
import ContextMenu, { ContextMenuOption } from './ContextMenu';

const JacketEditor = lazy(() => import('./JacketEditor'));
const PageRenderer = lazy(() => import('./PageRenderer'));

interface ProjectWorkspaceProps {
    projectData: ProjectData;
    onBackToDashboard: () => void;
}

const ProjectWorkspace: React.FC<ProjectWorkspaceProps> = ({ projectData, onBackToDashboard }) => {
    const {
        pdfDoc, numPages, storyBlocks, annotations, metadata, docSettings, pageSize, templateStyle, jacketDesign, designTheme,
        isLoading, isExporting, isGeneratingTheme, isGeneratingImages,
        selectedBlockId, inlineEditId, selectedJacketElement, activeJacketZone,
        history, historyStep, generatedImages, bookHtml, bookCss, variables, category, bookmarks, actions
    } = useProject(projectData);

    const [activeTab, setActiveTab] = useState<MainTab>('interior');
    const [viewMode, setViewMode] = useState<'single' | 'grid' | 'spread'>('single');
    const [scale, setScale] = useState(1.0);
    const [pageNum, setPageNum] = useState(1);
    const [pageDimensions, setPageDimensions] = useState<{ width: number; height: number } | null>(null);
    const [contextMenu, setContextMenu] = useState<{ x: number, y: number, id: string | null } | null>(null);
    const [showDocSetup, setShowDocSetup] = useState(false);
    const computedSpineWidthPt = useMemo(() => Math.max(12, numPages * 0.15), [numPages]);
    const isSlideMode = category === 'slide';

    // Initial load effect
    useEffect(() => {
        if (numPages > 0 && pageNum > numPages) setPageNum(numPages);
        // Force single view for slides
        if (isSlideMode && viewMode !== 'single') setViewMode('single');
    }, [numPages, pageNum, isSlideMode, viewMode]);

    // --- Handlers ---
    const handleInsertSection = (sectionType: string) => {
        const newBlock: StoryBlock = {
            id: `sb-section-${Date.now()}`,
            type: sectionType === 'chapter' ? 'chapter' :
                sectionType === 'block-quote' ? 'quote' :
                    sectionType === 'image-section' ? 'image' as any :
                        sectionType.includes('break') ? 'break' as any :
                            'heading',
            ...(sectionType === 'image-section' ? { url: '', caption: '' } : { text: "New Section" })
        } as StoryBlock;
        actions.updateStoryBlocks(prev => [...prev, newBlock]);
        actions.setSelectedBlockId(newBlock.id);
    };

    const handleInlineChange = (storyBlockId: string, newText: string) => {
        actions.updateStoryBlocks(prev => prev.map(b => b.id === storyBlockId && 'text' in b ? { ...b, text: newText } : b));
    };

    const handleAnnotationMouseDown = (e: React.MouseEvent, annotationId: string, pageIndex: number) => {
        const ann = annotations.find(a => a.id === annotationId);
        if (ann) actions.setSelectedBlockId(ann.storyBlockId);
    };

    // --- Navigation Handlers ---
    const handleNextPage = () => {
        if (viewMode === 'spread') {
            // If Cover (1), go to 2 (Spread Start: 2-3)
            if (pageNum === 1) setPageNum(2);
            else setPageNum(p => Math.min(numPages, p + 2));
        } else {
            setPageNum(p => Math.min(numPages, p + 1));
        }
    };

    const handlePrevPage = () => {
        if (viewMode === 'spread') {
            // If at 2 or 3, go to 1 (Cover)
            if (pageNum <= 3) setPageNum(1);
            else setPageNum(p => Math.max(1, p - 2));
        } else {
            setPageNum(p => Math.max(1, p - 1));
        }
    };

    const handleContextMenu = (e: React.MouseEvent, id: string | null) => {
        e.preventDefault();
        setContextMenu({ x: e.clientX, y: e.clientY, id });
    };

    const contextOptions: ContextMenuOption[] = useMemo(() => {
        if (!contextMenu) return [];
        const options: ContextMenuOption[] = [];
        if (contextMenu.id) {
            options.push(
                {
                    label: 'Delete Element', icon: <Trash2 size={14} />, onClick: () => {
                        actions.updateStoryBlocks(prev => prev.filter(b => b.id !== contextMenu.id));
                        actions.setSelectedBlockId(null);
                    }, danger: true
                },
                {
                    label: 'Duplicate', icon: <Copy size={14} />, onClick: () => {
                        const block = storyBlocks.find(b => b.id === contextMenu.id);
                        if (block) actions.updateStoryBlocks(prev => [...prev.slice(0, storyBlocks.indexOf(block) + 1), { ...block, id: `sb-${Date.now()}` }, ...prev.slice(storyBlocks.indexOf(block) + 1)]);
                    }
                }
            );
        } else {
            options.push(
                { label: 'Insert Chapter', icon: <Plus size={14} />, onClick: () => handleInsertSection('chapter') },
                { label: 'Insert Paragraph', icon: <Plus size={14} />, onClick: () => handleInsertSection('paragraph') },
                { label: 'Insert Image', icon: <Plus size={14} />, onClick: () => handleInsertSection('image') },
                { divider: true },
                { label: 'Reset Layout', icon: <RotateCcw size={14} />, onClick: () => actions.handleGenerateTheme() }
            );
        }
        return options;
    }, [contextMenu, storyBlocks, actions]);

    // ... rest of state

    // RENDER LOGIC
    const renderPage = (pNum: number, isSide: 'left' | 'right' | 'single' = 'single') => (
        <PageRenderer
            key={pNum}
            pdfDoc={pdfDoc}
            pageNumber={pNum}
            scale={scale}
            annotations={annotations}
            isTextMode={false}
            selectedIds={selectedBlockId ? [annotations.find(a => a.storyBlockId === selectedBlockId)?.id || ''] : []}
            inlineEditId={inlineEditId}
            docSettings={docSettings}
            isPanning={false}
            onCanvasClick={() => actions.setSelectedBlockId(null)}
            onAnnotationMouseDown={handleAnnotationMouseDown}
            onResizeMouseDown={(e, id) => {
                // Mark annotation as being resized - basic drag resize
                const ann = annotations.find(a => a.id === id);
                if (ann && 'width' in ann) {
                    actions.setSelectedBlockId(ann.storyBlockId);
                }
            }}
            onInlineChange={handleInlineChange}
            onInlineBlur={() => actions.setInlineEditId(null)}
            onSetInlineEditId={actions.setInlineEditId}
            onTogglePin={(id) => {
                const ann = annotations.find(a => a.id === id);
                if (ann) {
                    actions.updateAnnotation(id, { locked: !ann.locked });
                }
            }}
            getCssFontFamily={(f) => f}
            setPageDimensions={setPageDimensions}
            viewMode={viewMode}
            bookHtml={bookHtml}
            bookCss={bookCss}
            templateStyle={templateStyle as any}
            metadata={metadata}
            onPageCountChange={actions.setTotalPages}
            pageSize={pageSize}
            onContextMenu={handleContextMenu}
        />
    );

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="flex flex-col h-screen bg-slate-950 text-slate-300 font-sans overflow-hidden selection:bg-cyan-500/30">
                <Header
                    onSaveProject={actions.handleSaveProject}
                    onExport={actions.handleExport}
                    onUndo={actions.undo} onRedo={actions.redo}
                    onZoomIn={() => setScale(s => Math.min(3, s + 0.1))} onZoomOut={() => setScale(s => Math.max(0.5, s - 0.1))}
                    onToggleViewMode={(m) => setViewMode(m as any)}
                    onPrevPage={handlePrevPage} onNextPage={handleNextPage}
                    canUndo={historyStep > 1} canRedo={historyStep < history.length - 1}
                    hasFile={true} viewMode={viewMode} scale={scale} pageInfo={{ current: pageNum, total: numPages }}
                    activeTab={activeTab} onTabChange={setActiveTab} onBackToDashboard={onBackToDashboard} projectName={metadata.title}
                    onJumpToPage={(p) => setPageNum(p)}
                    bookmarks={bookmarks}
                />

                <div className="flex-1 flex overflow-hidden relative">
                    <LeftSidebar
                        activeTab={activeTab}
                        storyBlocks={storyBlocks}
                        selectedBlockId={selectedBlockId}
                        onSelectBlock={actions.setSelectedBlockId}
                        designTheme={designTheme}
                        jacketDesign={jacketDesign}
                        onGenerateTheme={actions.handleGenerateTheme}
                        onGenerateImages={() => actions.handleGenerateImages({ zone: activeJacketZone })}
                        onUpdateJacket={actions.setJacketDesign}
                        isGeneratingTheme={isGeneratingTheme}
                        isGeneratingImages={isGeneratingImages}
                        generatedImages={generatedImages}
                        activeJacketZone={activeJacketZone}
                        onActiveZoneChange={actions.setActiveJacketZone}
                        onReorderBlocks={(fromIdx: number, toIdx: number) => {
                            actions.updateStoryBlocks(prev => {
                                const next = [...prev];
                                const [moved] = next.splice(fromIdx, 1);
                                next.splice(toIdx, 0, moved);
                                return next;
                            });
                        }}
                        onInsertSection={handleInsertSection}
                        onRecommendPersonality={actions.handleRecommendPersonality}
                        isGeneratingPersonality={isLoading}
                        category={category}
                        variables={variables}
                        onUpdateVariables={actions.updateVariables}
                        metadata={metadata}
                        annotations={annotations}
                        selectedIds={selectedBlockId ? [annotations.find(a => a.storyBlockId === selectedBlockId)?.id || ''] : []}
                        onAnnotationSelect={(id, multi) => {
                            const ann = annotations.find(a => a.id === id);
                            if (ann?.storyBlockId) actions.setSelectedBlockId(ann.storyBlockId);
                        }}
                        onUpdateAnnotation={actions.updateAnnotation}
                        onDeleteAnnotation={actions.deleteAnnotation}
                    />

                    <div className="flex-1 relative flex flex-col bg-slate-900/50 overflow-hidden">
                        {activeTab === 'interior' && (
                            <Toolbar
                                onInsertBlock={(t) => handleInsertSection(t)}
                                activeTab="interior"
                                selectedBlock={storyBlocks.find(b => b.id === selectedBlockId) || null}
                                onUpdateBlock={(id, u) => actions.updateStoryBlocks(prev => prev.map(b => b.id === id ? { ...b, ...u } : b))}
                                onDeleteBlock={(id) => actions.updateStoryBlocks(prev => prev.filter(b => b.id !== id))}
                                onDuplicateBlock={(id: string) => {
                                    const block = storyBlocks.find(b => b.id === id);
                                    if (block) {
                                        const idx = storyBlocks.indexOf(block);
                                        actions.updateStoryBlocks(prev => [
                                            ...prev.slice(0, idx + 1),
                                            { ...block, id: `sb-dup-${Date.now()}` },
                                            ...prev.slice(idx + 1)
                                        ]);
                                    }
                                }}
                                onMoveBlock={(id: string, direction: 'up' | 'down') => {
                                    actions.updateStoryBlocks(prev => {
                                        const idx = prev.findIndex(b => b.id === id);
                                        if (idx < 0) return prev;
                                        const targetIdx = direction === 'up' ? idx - 1 : idx + 1;
                                        if (targetIdx < 0 || targetIdx >= prev.length) return prev;
                                        const next = [...prev];
                                        [next[idx], next[targetIdx]] = [next[targetIdx], next[idx]];
                                        return next;
                                    });
                                }}
                            />
                        )}

                        <div className="flex-1 overflow-auto relative custom-scrollbar flex items-start justify-center p-8 md:p-12 bg-slate-950">
                            {activeTab === 'interior' ? (
                                <Suspense fallback={<div className="flex items-center justify-center h-full"><Loader2 className="animate-spin text-cyan-500" /></div>}>
                                {viewMode === 'spread' && pageNum > 1 ? (
                                        <div className="flex gap-0 shadow-2xl">
                                            {/* Force even page on Left logic. If pageNum is Odd (e.g 3), we want 2-3. If Even (2), 2-3. */}
                                            {renderPage(pageNum % 2 === 0 ? pageNum : pageNum - 1, 'left')}
                                            {/* Right page. But check if it exists (e.g. last page might be single left) */}
                                            {(pageNum % 2 === 0 ? pageNum + 1 : pageNum) <= numPages && renderPage(pageNum % 2 === 0 ? pageNum + 1 : pageNum, 'right')}
                                        </div>
                                    ) : (
                                        // Single view or Cover Page (Page 1) in Spread Mode
                                        renderPage(pageNum, 'single')
                                    )}

                                    {/* Slide Navigator Strip — only for presentations */}
                                    {isSlideMode && numPages > 0 && (
                                        <div className="w-full mt-6 px-4">
                                            <div className="flex items-center gap-2 overflow-x-auto py-3 px-2 bg-slate-900/60 backdrop-blur rounded-xl border border-white/5 custom-scrollbar">
                                                {Array.from({ length: numPages }, (_, i) => (
                                                    <button
                                                        key={i}
                                                        onClick={() => setPageNum(i + 1)}
                                                        className={`flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-all ${
                                                            pageNum === i + 1
                                                                ? 'bg-cyan-500/20 border border-cyan-500/50 shadow-lg shadow-cyan-500/10'
                                                                : 'bg-slate-800/50 border border-white/5 hover:bg-slate-700/50 hover:border-white/10'
                                                        }`}
                                                    >
                                                        <div className={`w-20 h-11 rounded flex items-center justify-center text-xs font-mono ${
                                                            pageNum === i + 1 ? 'bg-cyan-500/10 text-cyan-400' : 'bg-slate-800 text-slate-500'
                                                        }`}>
                                                            <LayoutGrid size={14} className="mr-1" />
                                                            {i + 1}
                                                        </div>
                                                        <span className={`text-[9px] font-medium tracking-wider uppercase ${
                                                            pageNum === i + 1 ? 'text-cyan-400' : 'text-slate-600'
                                                        }`}>
                                                            Slide {i + 1}
                                                        </span>
                                                    </button>
                                                ))}
                                                {/* Add Slide button */}
                                                <button
                                                    onClick={() => {
                                                        const pageBreak = { id: `sb-break-${Date.now()}`, type: 'break' as const, breakType: 'page' as const };
                                                        const newHeading = { id: `sb-heading-${Date.now()}`, type: 'heading' as const, text: 'New Slide' };
                                                        actions.updateStoryBlocks(prev => [...prev, pageBreak as any, newHeading as any]);
                                                    }}
                                                    className="flex-shrink-0 flex flex-col items-center gap-1 px-3 py-2 rounded-lg bg-slate-800/30 border border-dashed border-white/10 hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all"
                                                >
                                                    <div className="w-20 h-11 rounded flex items-center justify-center text-slate-500">
                                                        <Plus size={18} />
                                                    </div>
                                                    <span className="text-[9px] font-medium tracking-wider uppercase text-slate-600">Add Slide</span>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </Suspense>
                            ) : activeTab === 'jacket' ? (
                                <Suspense fallback={<div>Loading Jacket...</div>}>
                                    <JacketEditor
                                        jacketDesign={jacketDesign}
                                        pageSize={pageSize}
                                        spineWidth={computedSpineWidthPt || 10}
                                        scale={0.6}
                                        docSettings={docSettings}
                                        onDesignChange={actions.setJacketDesign}
                                        onElementSelect={actions.setSelectedJacketElement}
                                        selectedElement={selectedJacketElement}
                                        onTypographyChange={actions.updateJacketTypography}
                                        onPreviewBook={() => setActiveTab('interior')}
                                        activeZone={activeJacketZone}
                                        onZoneChange={actions.setActiveJacketZone}
                                        numPages={numPages}
                                        generatedImages={generatedImages}
                                        isGeneratingImages={isGeneratingImages}
                                        onGenerateImages={actions.handleGenerateImages}
                                        onApplyGeneratedImage={(url: string) => { if (jacketDesign) actions.setJacketDesign({ ...jacketDesign, frontCoverUrl: url }) }}
                                        storyBlocks={storyBlocks}
                                        metadata={metadata}
                                        onAnalyzeManuscript={actions.handleAnalyzeManuscript}
                                        variables={variables}
                                    />
                                </Suspense>
                            ) : activeTab === 'distribute' ? (
                                <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
                                    {/* Left: 3D Mockup */}
                                    <div className="space-y-4">
                                        <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Book Preview</div>
                                        <MockupPreview
                                            title={metadata.title}
                                            coverFrontUrl={jacketDesign?.frontCoverUrl}
                                            spineColor={jacketDesign?.backgroundColor || '#0f0f23'}
                                            pageCount={numPages}
                                        />
                                        {/* ISBN Barcode Preview */}
                                        {metadata.isbn && (
                                            <div className="bg-slate-900/40 border border-white/5 rounded-xl p-4">
                                                <div className="text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-2">ISBN Barcode</div>
                                                <div className="bg-white rounded-lg p-3 flex items-center justify-center">
                                                    <img
                                                        src={generateBarcodeDataURL(metadata.isbn!, 250, 100)}
                                                        alt="ISBN Barcode"
                                                        className="max-h-20"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Right: Export Panel */}
                                    <div className="bg-slate-900/40 border border-white/5 rounded-xl p-6">
                                        <ExportPanel
                                            metadata={metadata}
                                            storyBlocks={storyBlocks}
                                            annotations={annotations}
                                            bookmarks={bookmarks}
                                            docSettings={docSettings}
                                            coverFrontUrl={jacketDesign?.frontCoverUrl}
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="text-slate-500 font-mono mt-20">Select a mode to begin</div>
                            )}
                        </div>
                    </div>

                    <RightSidebar
                        activeTab={activeTab}
                        selectedJacketElement={selectedJacketElement}
                        jacketDesign={jacketDesign}
                        onJacketDesignChange={actions.setJacketDesign}
                        onJacketTypographyChange={actions.updateJacketTypography}
                        selectedAnnotations={selectedBlockId ? annotations.filter(a => a.storyBlockId === selectedBlockId) : []}
                        docSettings={docSettings}
                        onOpenSetup={() => setShowDocSetup(true)}
                        pageDimensions={pageDimensions}
                        activeJacketZone={activeJacketZone}
                        onGenerateAICover={(zone) => actions.handleGenerateImages({ zone })}
                    />
                </div>

                {contextMenu && (
                    <ContextMenu
                        x={contextMenu.x}
                        y={contextMenu.y}
                        options={contextOptions}
                        onClose={() => setContextMenu(null)}
                    />
                )}

                {(isLoading || isExporting) && (
                    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center">
                        <div className="flex flex-col items-center">
                            <Loader2 className="w-10 h-10 text-cyan-500 animate-spin mb-4" />
                            <p className="text-cyan-400 font-mono tracking-widest">{isExporting ? 'PROCESSING ASSETS...' : 'SYSTEM LOADING...'}</p>
                        </div>
                    </div>
                )}
            </div>
        </DndProvider>
    );
};

export default ProjectWorkspace;
