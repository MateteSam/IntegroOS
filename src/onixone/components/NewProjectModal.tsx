

import React, { useState, useCallback } from 'react';
import { X, FileUp, FileText, LayoutTemplate, Plus, Book, FileType, AlignLeft, BookOpen, GraduationCap, Palette, Loader2, Feather, Briefcase, Terminal, ArrowRight, Check, Upload, FileCode, Settings, Layers, Type, Sun } from 'lucide-react';
import * as mammoth from 'mammoth';
import { PAGE_SIZES, PageSize, TemplateStyle, TEMPLATE_STYLES, ImportFormat, ProjectCategory, ProjectData } from '../types';
import { analyzeStructure } from '../services/aiService';
import { StoryBlock, TextStoryBlock } from '../types';
import { importDocument, detectFormat } from '../services/importService';
import { parseDevotionalFolder } from '../services/devotionalService';

interface NewProjectModalProps {
  onUploadPdf: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCreateBlank: (size: PageSize, pages: number) => void;
  onImportText: (storyBlocks: StoryBlock[], size: PageSize, template: TemplateStyle) => void;
  onCancel: () => void;
}

const NewProjectModal: React.FC<NewProjectModalProps> = ({
  onUploadPdf,
  onCreateBlank,
  onImportText,
  onCancel
}) => {
  const [mode, setMode] = useState<'upload' | 'blank' | 'import'>('import');
  const [step, setStep] = useState<number>(1);
  const [selectedSize, setSelectedSize] = useState<PageSize>(PAGE_SIZES[2]);
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateStyle>(TEMPLATE_STYLES[0]);
  const [numPages, setNumPages] = useState<number>(1);
  const [textInput, setTextInput] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [loadingText, setLoadingText] = useState('Extracting...');
  const [importedBlocks, setImportedBlocks] = useState<StoryBlock[] | null>(null);
  const [detectedFormat, setDetectedFormat] = useState<ImportFormat | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ProjectCategory>('book');
  const [isDragging, setIsDragging] = useState(false);
  const [useDropCaps, setUseDropCaps] = useState(true);
  const [useJustify, setUseJustify] = useState(true);

  // Universal file handler - supports all formats
  const handleUniversalFile = async (file: File) => {
    setIsProcessing(true);
    const format = detectFormat(file);
    setDetectedFormat(format);
    setLoadingText(`Importing ${format.toUpperCase()}...`);

    try {
      const result = await importDocument(file);
      if (result.success && result.storyBlocks.length > 0) {
        setImportedBlocks(result.storyBlocks);
        // Also set text for display
        const text = result.storyBlocks
          .filter((b): b is TextStoryBlock => 'text' in b)
          .map(b => b.text)
          .join('\n\n');
        setTextInput(text);
        setLoadingText(`Imported ${result.wordCount?.toLocaleString() || 0} words`);
        console.warn("FILE IMPORT SUCCESS", { blocks: result.storyBlocks.length, format });
      } else {
        throw new Error(result.errors.join(', ') || 'No content extracted');
      }
    } catch (error) {
      console.error('Import error:', error);
      alert(`Failed to import ${format.toUpperCase()} file. Please try another format.`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleUniversalFile(file);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (selectedCategory === 'devotional') {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleDevotionalUpload(Array.from(files));
      }
    } else {
      const file = e.target.files?.[0];
      if (file) {
        handleUniversalFile(file);
      }
    }
  };

  const handleDevotionalUpload = async (files: File[]) => {
    setIsProcessing(true);
    setLoadingText(`Parsing ${files.length} Devotional Days...`);
    try {
      const blocks = await parseDevotionalFolder(files);
      setImportedBlocks(blocks);
      const text = blocks
        .filter((b): b is TextStoryBlock => 'text' in b)
        .map(b => b.text)
        .join('\n\n');
      setTextInput(text);
      setLoadingText(`Imported ${files.length} Days`);
    } catch (error) {
      console.error('Devotional import error:', error);
      alert('Failed to parse devotional folder. Ensure files are readable.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFinalGenerate = async () => {
    setIsProcessing(true);
    setLoadingText("Generating Layout...");
    try {
      // Use pre-imported blocks if available, otherwise analyze text
      let storyBlocks = importedBlocks;
      if (!storyBlocks || storyBlocks.length === 0) {
        setLoadingText("Analyzing Structure...");
        storyBlocks = await analyzeStructure(textInput);
      }
      setLoadingText("Creating Book...");
      onImportText(storyBlocks, selectedSize, selectedTemplate);
    } catch (e) {
      console.error("Failed during final generation pipeline", e);
      alert("An error occurred during processing. Please try again.");
      setIsProcessing(false);
    }
  };

  const getTemplateIcon = (tmpl: TemplateStyle) => {
    if (tmpl.id.includes('slide')) return <LayoutTemplate size={28} className="text-orange-600" />;
    if (tmpl.id.includes('news')) return <FileType size={28} className="text-emerald-600" />;
    if (tmpl.id.includes('poetry')) return <Feather size={28} className="text-pink-600" />;
    if (tmpl.id.includes('business')) return <Briefcase size={28} className="text-blue-600" />;
    if (tmpl.id.includes('scifi')) return <Terminal size={28} className="text-slate-700" />;

    switch (tmpl.category) {
      case 'novel': return <BookOpen size={28} className="text-amber-700" />;
      case 'magazine': return <LayoutTemplate size={28} className="text-indigo-600" />;
      case 'academic': return <GraduationCap size={28} className="text-slate-600" />;
      case 'children': return <Palette size={28} className="text-pink-500" />;
      case 'devotional': return <Sun size={28} className="text-amber-500" />;
      default: return <Book size={28} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 font-sans">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={onCancel} />

      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-6xl h-[800px] flex overflow-hidden animate-in fade-in zoom-in-95 duration-300 border border-slate-200/50">

        {/* Sidebar */}
        <div className="w-80 bg-slate-50 border-r border-slate-200/60 flex flex-col p-8 z-10">
          <div className="mb-12">
            <h2 className="text-3xl font-extrabold text-slate-900 flex items-center gap-4 tracking-tight">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-600/20">
                <Plus size={26} strokeWidth={3} />
              </div>
              Create
            </h2>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto pr-2 -mr-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <SidebarBtn
              icon={<FileText size={22} />}
              label="Smart Import"
              desc="From Word, PDF, or Text"
              active={mode === 'import'}
              onClick={() => { setMode('import'); setStep(1); }}
            />
            <SidebarBtn
              icon={<FileUp size={22} />}
              label="Upload PDF"
              desc="Keep Existing Layout"
              active={mode === 'upload'}
              onClick={() => setMode('upload')}
            />
            <SidebarBtn
              icon={<FileType size={22} />}
              label="Blank Canvas"
              desc="Start Fresh"
              active={mode === 'blank'}
              onClick={() => setMode('blank')}
            />

            <div className="pt-8 pb-4">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 px-4">Project Purpose</label>
            </div>

            <SidebarBtn
              icon={<Book size={20} />}
              label="Books & Novels"
              desc="Standard Reading"
              active={selectedCategory === 'book'}
              onClick={() => { setSelectedCategory('book'); setMode('import'); }}
            />
            <SidebarBtn
              icon={<LayoutTemplate size={20} />}
              label="Presentations"
              desc="Cinematic Slides"
              active={selectedCategory === 'slide'}
              onClick={() => {
                setSelectedCategory('slide');
                setMode('import');
                setSelectedSize(PAGE_SIZES.find(s => s.name === 'Slide_16_9') || PAGE_SIZES[0]);
              }}
            />
            <SidebarBtn
              icon={<FileCode size={20} />}
              label="Newsletters"
              desc="Multi-Column Post"
              active={selectedCategory === 'newsletter'}
              onClick={() => { setSelectedCategory('newsletter'); setMode('import'); }}
            />
            <SidebarBtn
              icon={<Sun size={20} />}
              label="Daily Devotional"
              desc="Folder of Days"
              active={selectedCategory === 'devotional'}
              onClick={() => {
                setSelectedCategory('devotional');
                setMode('import');
                // Auto-select the Sovereign Devotional template if it exists
                const devTemplate = TEMPLATE_STYLES.find(t => t.id === 'sovereign-devotional');
                if (devTemplate) setSelectedTemplate(devTemplate);
              }}
            />
          </div>

          <div className="mt-auto p-6 bg-gradient-to-br from-slate-700 to-slate-800 rounded-2xl text-white shadow-xl shadow-slate-800/20 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Book size={60} />
            </div>
            <div className="flex items-center gap-2 font-bold mb-3 text-slate-300 uppercase tracking-wider text-xs">
              <Layers size={14} className="text-slate-400" /> Quick Tip
            </div>
            <p className="text-sm text-white/90 leading-relaxed font-medium relative z-10">
              Use <strong>Smart Import</strong> to automatically structure your manuscript into a professional book layout.
            </p>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col relative bg-white">
          <button onClick={onCancel} className="absolute top-8 right-8 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 z-50 transition-colors">
            <X size={24} />
          </button>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
            {mode === 'upload' && (
              <div className="h-full flex flex-col items-center justify-center text-center p-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="w-32 h-32 bg-slate-50 rounded-full flex items-center justify-center mb-8 shadow-inner ring-8 ring-slate-50/50">
                  <FileUp size={48} className="text-slate-400" />
                </div>
                <h3 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">Upload Existing PDF</h3>
                <p className="text-slate-500 mb-12 max-w-lg text-lg leading-relaxed">Start with an existing PDF file and we'll help you prepare it for publishing, preserving your exact layout.</p>

                <label className="group relative bg-slate-900 hover:bg-slate-800 text-white px-12 py-5 rounded-2xl font-bold text-lg cursor-pointer transition-all hover:shadow-2xl hover:shadow-slate-900/30 hover:-translate-y-1 overflow-hidden">
                  <input type="file" accept=".pdf" className="hidden" onChange={onUploadPdf} />
                  <span className="relative z-10 flex items-center gap-3">Select PDF File <ArrowRight size={20} /></span>
                  <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </label>
              </div>
            )}

            {mode === 'blank' && (
              <div className="h-full flex flex-col items-center justify-center px-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="max-w-3xl w-full">
                  <div className="mb-12 text-center">
                    <h3 className="text-4xl font-bold text-slate-900 mb-3 tracking-tight">Blank Canvas</h3>
                    <p className="text-slate-500 text-xl font-medium">Set up your foundation specifically for your needs.</p>
                  </div>

                  <div className="bg-white p-10 rounded-[2rem] shadow-2xl shadow-slate-200/50 border border-slate-100 space-y-10">
                    <div>
                      <label className="block text-sm font-bold text-slate-400 mb-5 uppercase tracking-wider flex items-center gap-2">
                        <LayoutTemplate size={16} /> Page Format
                      </label>
                      <div className="grid grid-cols-2 gap-5">
                        {PAGE_SIZES.map(size => (
                          <button
                            key={size.name}
                            onClick={() => setSelectedSize(size)}
                            className={`p-6 border-2 rounded-2xl text-left transition-all duration-300 relative overflow-hidden group ${selectedSize.name === size.name
                              ? 'border-indigo-600 bg-indigo-50/30 shadow-lg ring-1 ring-indigo-600/20'
                              : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50'
                              }`}
                          >
                            <div className={`font-bold text-xl mb-1 ${selectedSize.name === size.name ? 'text-indigo-700' : 'text-slate-700'}`}>{size.name}</div>
                            <div className="text-sm font-medium text-slate-400">{size.label}</div>
                            {selectedSize.name === size.name && (
                              <div className="absolute top-5 right-5 w-6 h-6 bg-indigo-600 rounded-full flex items-center justify-center text-white shadow-md animate-in zoom-in">
                                <Check size={14} strokeWidth={4} />
                              </div>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-slate-400 mb-5 uppercase tracking-wider flex items-center gap-2">
                        <Book size={16} /> Page Count
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="1"
                          value={numPages}
                          onChange={(e) => setNumPages(Number(e.target.value))}
                          className="w-full p-5 pl-6 border-2 border-slate-200 rounded-2xl font-bold text-2xl text-slate-900 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all placeholder:text-slate-300"
                        />
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Pages</div>
                      </div>
                    </div>

                    <button onClick={() => onCreateBlank(selectedSize, numPages)} className="w-full bg-slate-900 text-white py-6 rounded-2xl font-bold text-xl hover:bg-slate-800 shadow-xl shadow-slate-900/20 hover:-translate-y-1 transition-all active:scale-[0.99] duration-200">
                      Create Project
                    </button>
                  </div>
                </div>
              </div>
            )}

            {mode === 'import' && (
              <div className="h-full flex flex-col">
                <div className="px-12 py-8 border-b border-slate-100 flex items-center justify-center gap-6 bg-white/80 backdrop-blur-md sticky top-0 z-20">
                  <StepIndicator number={1} label="Content Source" active={step >= 1} isCurrent={step === 1} />
                  <StepLine active={step >= 2} />
                  <StepIndicator number={2} label="Layout & Style" active={step >= 2} isCurrent={step === 2} />
                </div>

                <div className="flex-1 overflow-y-auto p-12">
                  {step === 1 && (
                    <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-8 fade-in duration-500">
                      <div className="text-center mb-12">
                        <h3 className="text-4xl font-bold text-slate-900 mb-3 tracking-tight">Import Content</h3>
                        <p className="text-slate-500 text-xl">Drop any document or paste your manuscript below.</p>
                      </div>

                      {/* Universal Drag & Drop Zone */}
                      <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`group relative border-3 border-dashed rounded-[2.5rem] p-12 text-center cursor-pointer transition-all duration-300 mb-8 overflow-hidden ${isDragging
                          ? 'border-indigo-500 bg-indigo-50/50 scale-[1.01]'
                          : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50/50'
                          }`}
                      >
                        <input
                          type="file"
                          accept=".docx,.doc,.txt,.epub,.html,.htm,.md,.markdown,.rtf,.pdf"
                          multiple={selectedCategory === 'devotional'}
                          className="absolute inset-0 opacity-0 cursor-pointer z-10"
                          onChange={handleFileChange}
                        />

                        {isProcessing ? (
                          <div className="flex flex-col items-center py-8">
                            <div className="relative w-20 h-20 mb-6">
                              <div className="absolute inset-0 rounded-full border-4 border-slate-100"></div>
                              <div className="absolute inset-0 rounded-full border-4 border-t-indigo-600 animate-spin"></div>
                              <div className="absolute inset-0 flex items-center justify-center text-indigo-600">
                                <FileText size={24} />
                              </div>
                            </div>
                            <div className="font-bold text-xl text-slate-800 mb-1">{loadingText}</div>
                            <div className="text-slate-400 text-sm">This may take a few moments</div>
                          </div>
                        ) : (
                          <>
                            <div className={`w-24 h-24 mx-auto mb-8 rounded-[2rem] flex items-center justify-center transition-all duration-300 shadow-xl shadow-indigo-100 ${isDragging ? 'bg-indigo-600 text-white scale-110 rotate-3' : 'bg-white text-indigo-600 group-hover:scale-110 group-hover:-rotate-3'
                              }`}>
                              {detectedFormat ? <Check size={48} /> : <Upload size={40} />}
                            </div>
                            <div className="font-bold text-2xl text-slate-800 mb-2">
                              {detectedFormat ? 'File Selected' : (isDragging ? 'Drop to Import' : (selectedCategory === 'devotional' ? 'Select Devotional Folder (Multiple Files)' : 'Drag & Drop Document'))}
                            </div>
                            <div className="text-slate-400 mb-8 font-medium">or click to browse files</div>

                            {/* Supported formats */}
                            <div className={`flex flex-wrap justify-center gap-3 text-xs font-semibold transition-opacity duration-300 ${detectedFormat ? 'opacity-50' : 'opacity-100'}`}>
                              {['DOCX', 'TXT', 'EPUB', 'HTML', 'MD', 'PDF'].map(fmt => (
                                <span key={fmt} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-500 shadow-sm group-hover:border-indigo-200 group-hover:text-indigo-400">
                                  {fmt}
                                </span>
                              ))}
                            </div>
                          </>
                        )}

                        {detectedFormat && textInput && !isProcessing && (
                          <div className="absolute font-medium bottom-6 left-0 right-0 flex justify-center animate-in slide-in-from-bottom-2 fade-in">
                            <span className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm flex items-center gap-2 shadow-sm">
                              <Check size={14} strokeWidth={3} />
                              Ready to import {detectedFormat.toUpperCase()} ({textInput.split(/\s+/).length.toLocaleString()} words)
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="relative group">
                        <label className="block text-sm font-bold text-slate-400 mb-4 ml-1 uppercase tracking-wider">Or Paste Content (Ctrl+V)</label>
                        <textarea
                          value={textInput}
                          onChange={(e) => { setTextInput(e.target.value); setImportedBlocks(null); }}
                          placeholder={isProcessing ? "Processing..." : "Paste your manuscript text here..."}
                          className="w-full h-64 p-8 border-2 border-slate-100 rounded-[2rem] bg-slate-50/30 resize-none font-mono text-sm leading-relaxed focus:border-indigo-500 focus:bg-white outline-none transition-all focus:shadow-xl focus:shadow-indigo-500/10 placeholder:text-slate-300"
                        />
                        {textInput && (
                          <div className="absolute bottom-6 right-6 text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
                            {textInput.split(/\s+/).length.toLocaleString()} words
                          </div>
                        )}
                      </div>

                      <div className="mt-12 flex justify-end">
                        <button
                          disabled={!textInput.trim() || isProcessing}
                          onClick={() => setStep(2)}
                          className="px-12 py-5 bg-slate-900 disabled:bg-slate-100 disabled:text-slate-300 text-white rounded-2xl font-bold text-xl hover:bg-slate-800 hover:-translate-y-1 transition-all shadow-2xl shadow-slate-900/20 flex items-center gap-3 active:scale-[0.99] duration-200"
                        >
                          Next Step <ArrowRight size={22} strokeWidth={2.5} />
                        </button>
                      </div>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="max-w-7xl mx-auto animate-in slide-in-from-right-8 fade-in duration-500">
                      <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-6">
                        <div>
                          <h3 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">Choose Layout</h3>
                          <p className="text-slate-500 text-lg">Select a professional interior design for your book.</p>
                        </div>
                        <div className="flex items-center gap-4 bg-white p-2 pr-4 rounded-xl border border-slate-200 shadow-sm">
                          <span className="text-xs font-bold text-slate-400 uppercase px-3 tracking-wider">Trim Size</span>
                          <div className="h-8 w-[1px] bg-slate-100"></div>
                          <select
                            value={selectedSize.name}
                            onChange={(e) => setSelectedSize(PAGE_SIZES.find(s => s.name === e.target.value) || PAGE_SIZES[0])}
                            className="bg-transparent text-slate-900 text-sm font-bold outline-none cursor-pointer hover:text-indigo-600 transition-colors"
                          >
                            {PAGE_SIZES.map(s => <option key={s.name} value={s.name}>{s.label}</option>)}
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                        {TEMPLATE_STYLES
                          .filter(t => selectedCategory === 'book' ? true : t.category === selectedCategory || t.category === 'general')
                          .map(tmpl => (
                            <div
                              key={tmpl.id}
                              onClick={() => setSelectedTemplate(tmpl)}
                              className={`flex h-48 rounded-[2rem] overflow-hidden cursor-pointer transition-all duration-300 group ${selectedTemplate.id === tmpl.id
                                ? 'bg-white ring-2 ring-indigo-600 ring-offset-4 shadow-2xl shadow-indigo-600/10 scale-[1.01]'
                                : 'bg-white border border-slate-100 hover:border-indigo-200 hover:shadow-xl hover:shadow-slate-200/50'
                                }`}
                            >
                              <div className="w-40 flex items-center justify-center relative transition-colors duration-300" style={{ backgroundColor: selectedTemplate.id === tmpl.id ? tmpl.thumbnailColor : '#f8fafc' }}>
                                <div className="transform group-hover:scale-110 transition-transform duration-500 drop-shadow-xl">
                                  {getTemplateIcon(tmpl)}
                                </div>
                                {selectedTemplate.id === tmpl.id && (
                                  <div className="absolute inset-0 bg-black/5 flex items-center justify-center">
                                    <div className="w-10 h-10 bg-white text-indigo-600 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in">
                                      <Check size={20} strokeWidth={4} />
                                    </div>
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 p-8 flex flex-col justify-center">
                                <div className="flex justify-between items-start mb-3">
                                  <h4 className={`font-bold text-xl ${selectedTemplate.id === tmpl.id ? 'text-indigo-900' : 'text-slate-900'}`}>{tmpl.name}</h4>
                                  <span className={`inline-block px-2 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${selectedTemplate.id === tmpl.id ? 'bg-indigo-100 text-indigo-700' : 'bg-slate-100 text-slate-500'
                                    }`}>{tmpl.category}</span>
                                </div>

                                <p className="text-sm text-slate-500 leading-relaxed mb-6 line-clamp-2">{tmpl.description}</p>

                                <div className="flex gap-6 text-xs font-bold text-slate-400 mt-auto">
                                  <div className="flex items-center gap-2 group-hover:text-slate-600 transition-colors"><Palette size={14} className="text-indigo-400" /> {tmpl.fontHeader}</div>
                                  <div className="flex items-center gap-2 group-hover:text-slate-600 transition-colors"><AlignLeft size={14} className="text-indigo-400" /> {tmpl.columns} Col</div>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>

                      {/* Layout Options */}
                      <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100">
                        <h4 className="font-bold text-slate-700 mb-5 flex items-center gap-2 text-lg">
                          <Settings size={18} className="text-slate-500" />
                          Layout Options
                        </h4>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                          <label className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group">
                            <input
                              type="checkbox"
                              checked={useDropCaps}
                              onChange={(e) => setUseDropCaps(e.target.checked)}
                              className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <div>
                              <span className="font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors block">
                                Drop Caps
                              </span>
                              <span className="text-xs text-slate-400">Large first letter</span>
                            </div>
                          </label>
                          <label className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group">
                            <input
                              type="checkbox"
                              checked={useJustify}
                              onChange={(e) => setUseJustify(e.target.checked)}
                              className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <div>
                              <span className="font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors block">
                                Justify Text
                              </span>
                              <span className="text-xs text-slate-400">Align both margins</span>
                            </div>
                          </label>
                          <label className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group">
                            <input
                              type="checkbox"
                              defaultChecked={true}
                              className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <div>
                              <span className="font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors block">
                                Table of Contents
                              </span>
                              <span className="text-xs text-slate-400">Auto-generate TOC</span>
                            </div>
                          </label>
                          <label className="flex items-center gap-3 p-4 bg-white rounded-xl border border-slate-200 cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition-all group">
                            <input
                              type="checkbox"
                              defaultChecked={true}
                              className="w-5 h-5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <div>
                              <span className="font-semibold text-slate-700 group-hover:text-indigo-600 transition-colors block">
                                Page Numbers
                              </span>
                              <span className="text-xs text-slate-400">Show on all pages</span>
                            </div>
                          </label>
                        </div>
                      </div>

                      <div className="flex justify-between border-t border-slate-100 pt-10 mt-auto">
                        <button onClick={() => setStep(1)} className="px-8 py-4 text-slate-400 font-bold hover:text-slate-600 transition-colors flex items-center gap-2">
                          <ArrowRight size={18} className="rotate-180" /> Back
                        </button>

                        <button
                          onClick={handleFinalGenerate}
                          disabled={isProcessing}
                          className="px-14 py-5 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-2xl font-bold text-xl flex items-center gap-4 hover:brightness-110 hover:-translate-y-1 transition-all shadow-2xl shadow-indigo-600/30 disabled:opacity-70 disabled:shadow-none disabled:translate-y-0 active:scale-[0.99] duration-200"
                        >
                          {isProcessing ? (
                            <><Loader2 size={24} className="animate-spin" /> {loadingText}</>
                          ) : (
                            <><ArrowRight size={24} /> Create Project</>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Refined Step Indicator
const StepIndicator: React.FC<{ number: number, label: string, active: boolean, isCurrent?: boolean }> = ({ number, label, active, isCurrent }) => (
  <div className={`flex items-center gap-4 ${active ? 'text-indigo-600' : 'text-slate-300'}`}>
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border-2 font-bold text-lg transition-all duration-300 ${active
      ? 'border-indigo-600 bg-indigo-600 text-white shadow-lg shadow-indigo-600/20 scale-100'
      : 'border-slate-200 bg-white text-slate-300'
      }`}>
      {active && !isCurrent ? <Check size={22} strokeWidth={3} /> : number}
    </div>
    <span className={`font-bold transition-all duration-300 tracking-tight ${isCurrent ? 'text-slate-900' : ''}`}>{label}</span>
  </div>
);

const StepLine: React.FC<{ active: boolean }> = ({ active }) => (
  <div className="w-24 h-1 rounded-full bg-slate-100 overflow-hidden">
    <div className={`h-full bg-indigo-600 transition-all duration-500 ease-out ${active ? 'w-full' : 'w-0'}`} />
  </div>
);

// Refined Sidebar Button
const SidebarBtn: React.FC<{ icon: React.ReactNode, label: string, desc: string, active: boolean, onClick: () => void }> = ({ icon, label, desc, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-5 p-5 rounded-2xl text-left transition-all duration-200 group relative overflow-hidden ${active
      ? 'bg-white text-indigo-600 shadow-xl shadow-slate-200/50 ring-1 ring-slate-100'
      : 'text-slate-500 hover:bg-white hover:text-slate-800 hover:shadow-lg hover:shadow-slate-200/30'
      }`}
  >
    <div className={`transition-all duration-300 p-2 rounded-xl ${active ? 'bg-indigo-50 text-indigo-600 rotate-3' : 'bg-slate-50 text-slate-400 group-hover:text-indigo-500 group-hover:bg-indigo-50'
      }`}>
      {icon}
    </div>
    <div className="relative z-10">
      <div className={`font-bold text-lg mb-0.5 tracking-tight ${active ? 'text-slate-900' : 'text-slate-700'}`}>{label}</div>
      <div className={`text-xs font-semibold ${active ? 'text-indigo-500' : 'text-slate-400'}`}>{desc}</div>
    </div>
    {active && <div className="absolute right-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-indigo-600 rounded-l-full" />}
  </button>
);

export default NewProjectModal;

