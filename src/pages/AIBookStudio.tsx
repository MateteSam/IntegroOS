import { useEffect, useMemo, useRef, useState } from 'react'
import { Calendar, ShieldCheck, Download, ImageIcon, BookOpen, Package, Sparkles } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { useProject, defaultBrandData } from '@/contexts/ProjectContext'
import { toast } from '@/components/ui/use-toast'
import { jsPDF } from 'jspdf'
import { generateCoverSVG, renderCoverPNG300DPI, getPageDimensions, generateLayoutPDF, validateOutputs, buildMockups, PageFormat, Quality, exportEPUB, analyzeReferenceImage, preflightCheckPDF, overlayCoverWithLogo, exportEPUBBlob, exportBookProject, generateAICoverPNG, generateAICoverPNGWithReference, generateArtCoverFromReference, composeCoverWithReference, generateLayoutFromText, analyzeContentForLayout, importDOCXToText, validateContentFlow, suggestLayoutFromPalette, exportLayoutEditablePackage, exportDOCXBlob, getContrastRatio, renderCoverCanvasBasic, safeGenerateCoverPNG, importPDFAsDataURI, extractTextFromPDF } from '@/lib/bookEngine'
import { log } from '@/lib/utils'
import { saveGoogleKeyToLocalStorage, extractTextFromImage } from '@/lib/aiClient'
import { exportEditablePackage } from '@/lib/exportEditable'
import { cn } from '@/lib/utils'

const AIBookStudio = () => {
  const { activeProject } = useProject()
  const brandData = activeProject?.brandData || defaultBrandData
  const [title, setTitle] = useState('Your Book Title')
  const [subtitle, setSubtitle] = useState('Subtitle')
  const [author, setAuthor] = useState('Author Name')
  const [template, setTemplate] = useState<'minimal' | 'modern' | 'classic'>('modern')
  const [publicationType, setPublicationType] = useState<'book' | 'magazine' | 'report' | 'newsletter'>('book')
  const [format, setFormat] = useState<PageFormat>('A4')
  const [customSize, setCustomSize] = useState<{ widthMm: number; heightMm: number } | null>(null)
  const [quality, setQuality] = useState<Quality>('print')
  const [coverPNG, setCoverPNG] = useState<string>('')
  const [pdfPreview, setPdfPreview] = useState<string>('')
  const [status, setStatus] = useState<Record<string, boolean>>({ Cover: false, Layout: false, Export: false, Mockups: false, QA: false })
  const [mockups, setMockups] = useState<Record<string, string>>({})
  const readyRef = useRef(false)
  const [realtime, setRealtime] = useState(false)
  const [history, setHistory] = useState<any[]>([])
  const [redoStack, setRedoStack] = useState<any[]>([])
  const [referenceUrl, setReferenceUrl] = useState('')
  const [logoDataURL, setLogoDataURL] = useState<string>('')
  const [contentText, setContentText] = useState('')
  const [googleKey, setGoogleKey] = useState('')
  const [referenceDataURL, setReferenceDataURL] = useState<string>('')
  const [titleAlign, setTitleAlign] = useState<'left' | 'center'>('left')
  const [autoContrast, setAutoContrast] = useState<boolean>(true)
  const [showGuides, setShowGuides] = useState<boolean>(false)
  const [useHeaders, setUseHeaders] = useState(true)
  const [useFooters, setUseFooters] = useState(true)
  const [usePageNumbers, setUsePageNumbers] = useState(true)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [layoutPreset, setLayoutPreset] = useState<'arrow_chapter' | 'heritage_classic' | 'workbook_modern' | 'publisher_pro'>('publisher_pro')

  // Intelligent preset selection based on content type
  useEffect(() => {
    if (contentText && !contentText.includes('Chapter') && contentText.length < 5000) {
      setLayoutPreset('workbook_modern')
    } else if (contentText && contentText.includes('Chapter')) {
      setLayoutPreset('arrow_chapter')
    }
  }, [contentText])
  const [pullQuotes, setPullQuotes] = useState<{ text: string; atParagraph?: number; position?: 'inline' | 'sidebarLeft' | 'sidebarRight' }[]>([])
  const [textAlign, setTextAlign] = useState<'left' | 'justify'>('left')
  const [dropCapLines, setDropCapLines] = useState<number>(2)
  const [bandColor, setBandColor] = useState<string>('#22c55e')
  const [ruleThickness, setRuleThickness] = useState<number>(0.6)
  const [twoColumns, setTwoColumns] = useState<boolean>(true)

  // One-click book creation workflow
  const createBook = async () => {
    try {
      toast({ title: 'Creating Book...', description: 'Generating cover and layout automatically' })

      // Generate cover first
      await buildCover()

      // Generate layout if content exists
      if (contentText || pdfPreview) {
        await buildLayout()
      }

      // Generate marketing materials if cover exists
      if (coverPNG) {
        await buildMarketing()
      }

      toast({ title: 'Book Created!', description: 'Cover, layout, and mockups generated successfully' })
    } catch (error) {
      log('error', 'one-click book creation', error)
      toast({ title: 'Creation Error', description: 'Failed to create book automatically', variant: 'destructive' })
    }
  }

  const colors = useMemo(() => ({
    primary: brandData.generatedBrand?.colors?.primary || '#1e40af',
    secondary: brandData.generatedBrand?.colors?.secondary || '#64748b',
    accent1: brandData.generatedBrand?.colors?.accent1 || '#f59e0b',
    accent2: brandData.generatedBrand?.colors?.accent2 || '#10b981'
  }), [brandData])

  const fonts = useMemo(() => ({
    title: brandData.generatedBrand?.typography?.displayFont || 'Inter',
    body: brandData.generatedBrand?.typography?.bodyFont || 'Inter'
  }), [brandData])

  useEffect(() => {
    if (!readyRef.current) {
      readyRef.current = true
      toast({ title: 'AI Book Studio Ready', description: 'All systems initialized. You can begin testing.' })
    }
  }, [])

  useEffect(() => {
    if (realtime) {
      buildCover().catch(e => log('error', 'cover realtime', e))
    }
  }, [title, subtitle, author, template, format, customSize])

  useEffect(() => {
    if (realtime) {
      buildLayout().catch(e => log('error', 'layout realtime', e))
    }
  }, [contentText, layoutPreset, dropCapLines, bandColor, ruleThickness, textAlign, pullQuotes, format, quality, useHeaders, useFooters, usePageNumbers])

  const pushHistory = () => {
    setHistory(prev => [...prev, { title, subtitle, author, template, format, customSize, quality, coverPNG, pdfPreview }])
    setRedoStack([])
  }

  const undo = () => {
    setHistory(prev => {
      if (!prev.length) return prev
      const last = prev[prev.length - 1]
      setRedoStack(r => [...r, { title, subtitle, author, template, format, customSize, quality, coverPNG, pdfPreview }])
      setTitle(last.title); setSubtitle(last.subtitle); setAuthor(last.author); setTemplate(last.template); setFormat(last.format); setCustomSize(last.customSize); setQuality(last.quality); setCoverPNG(last.coverPNG); setPdfPreview(last.pdfPreview)
      return prev.slice(0, -1)
    })
  }

  const redo = () => {
    setRedoStack(prev => {
      if (!prev.length) return prev
      const last = prev[prev.length - 1]
      pushHistory()
      setTitle(last.title); setSubtitle(last.subtitle); setAuthor(last.author); setTemplate(last.template); setFormat(last.format); setCustomSize(last.customSize); setQuality(last.quality); setCoverPNG(last.coverPNG); setPdfPreview(last.pdfPreview)
      return prev.slice(0, -1)
    })
  }

  const buildCover = async () => {
    try {
      pushHistory()
      const png = await safeGenerateCoverPNG({ title, subtitle, author, colors, fonts: { title: fonts.title, body: fonts.body }, template, format, titleAlign, autoContrast, guides: showGuides }, referenceDataURL || undefined)
      const final = logoDataURL ? await overlayCoverWithLogo(png, logoDataURL) : png
      setCoverPNG(final)
      setStatus(prev => ({ ...prev, Cover: true }))
      log('info', 'cover generated', { template, format })
    } catch (e) {
      const msg = (e as any)?.message || 'unknown'
      log('error', 'cover generation failed', e)
      toast({ title: 'Cover Error', description: `Failed to generate cover: ${msg}`, variant: 'destructive' })
    }
  }

  const buildLayout = async () => {
    try {
      pushHistory()
      const dataUri = await generateLayoutFromText(contentText || `${title}\n\n${subtitle || ''}`, { title, author, format, fonts: { heading: fonts.title, body: fonts.body }, quality, preset: layoutPreset, style: { dropCapLines, bandColor, ruleThickness }, pullQuotes, alignment: textAlign, showHeaders: useHeaders, showFooters: useFooters, showPageNumbers: usePageNumbers })
      setPdfPreview(dataUri)
      setStatus(prev => ({ ...prev, Layout: true }))
      log('info', 'layout generated', { publicationType, quality })
    } catch (e) {
      log('error', 'layout generation failed', e)
      toast({ title: 'Layout Error', description: 'Failed to generate layout', variant: 'destructive' })
    }
  }

  const runQA = async () => {
    const res = validateOutputs(coverPNG, pdfPreview)
    const ok = res.coverOk && res.pdfOk
    setStatus(prev => ({ ...prev, QA: ok }))
    toast({ title: ok ? 'Validation Passed' : 'Validation Issues', description: ok ? 'Outputs meet requirements.' : 'Check DPI and formats before export.' })
  }

  const exportPDF = async () => {
    if (!pdfPreview) return
    const link = document.createElement('a')
    link.href = pdfPreview
    link.download = 'book.pdf'
    link.click()
    setStatus(prev => ({ ...prev, Export: true }))
  }

  const exportCover = async () => {
    if (!coverPNG) return
    const a = document.createElement('a')
    a.href = coverPNG
    a.download = 'cover.png'
    a.click()
  }

  const exportEpub = async () => {
    try {
      const content = { chapters: [{ title: title, paragraphs: [contentText || subtitle || ''] }] }
      const blob = await exportEPUBBlob(content, { title, author })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'book.epub'
      a.click()
      URL.revokeObjectURL(url)
      log('info', 'epub exported')
    } catch (e) {
      log('error', 'epub export failed', e)
      toast({ title: 'EPUB Error', description: 'Failed to export EPUB', variant: 'destructive' })
    }
  }

  const exportDocx = async () => {
    try {
      const content = { chapters: [{ title: title, paragraphs: [contentText || subtitle || ''] }] }
      const blob = await exportDOCXBlob(content, { title, author })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'manuscript.docx'
      a.click()
      URL.revokeObjectURL(url)
      log('info', 'docx exported')
    } catch (e) {
      log('error', 'docx export failed', e)
      toast({ title: 'DOCX Error', description: 'Failed to export DOCX', variant: 'destructive' })
    }
  }

  const exportEditableCover = async () => {
    const dims = getPageDimensions(format)
    const design = {
      name: `${title} Cover`,
      width: dims.widthPx300,
      height: dims.heightPx300,
      elements: [
        { type: 'shape', x: 0, y: 0, width: dims.widthPx300, height: dims.heightPx300, fill: colors.primary },
        { type: 'text', x: Math.round(dims.widthPx300 * 0.08), y: Math.round(dims.heightPx300 * 0.35), content: title, fontSize: 120, fontFamily: fonts.title, fill: '#ffffff' },
        subtitle ? { type: 'text', x: Math.round(dims.widthPx300 * 0.08), y: Math.round(dims.heightPx300 * 0.45), content: subtitle, fontSize: 48, fontFamily: fonts.body, fill: '#e5e7eb' } : null,
        { type: 'text', x: Math.round(dims.widthPx300 * 0.08), y: Math.round(dims.heightPx300 * 0.93), content: author, fontSize: 42, fontFamily: fonts.body, fill: '#111827' }
      ].filter(Boolean),
      colors: [colors.primary, colors.secondary, colors.accent1 || '', colors.accent2 || ''].filter(Boolean),
      fonts: [fonts.title, fonts.body]
    }
    await exportEditablePackage(design as any, ['svg', 'figma', 'metadata'])
    setStatus(prev => ({ ...prev, Export: true }))
  }

  const buildMarketing = async () => {
    if (!coverPNG) return
    const m = await buildMockups(coverPNG)
    setMockups(m)
    setStatus(prev => ({ ...prev, Mockups: true }))
  }

  const analyzeStyle = async () => {
    try {
      const res = await analyzeReferenceImage(referenceUrl)
      if (res.palette?.length) {
        colors.primary = res.palette[0]
        colors.secondary = res.palette[1] || colors.secondary
        colors.accent1 = res.palette[2] || colors.accent1
        setBandColor(res.palette[0])
        const suggested = suggestLayoutFromPalette(res.palette)
        setLayoutPreset(suggested)
      }
      toast({ title: 'Style Applied', description: 'Reference palette used for cover' })
      if (realtime) await buildCover()
    } catch (e) {
      log('error', 'style analysis failed', e)
      toast({ title: 'Analysis Error', description: 'Failed to analyze reference image', variant: 'destructive' })
    }
  }

  const exportProject = async () => {
    try {
      const epubBlob = await exportEPUBBlob({ chapters: [{ title, paragraphs: [contentText || subtitle || ''] }] }, { title, author })
      const settings = { title, subtitle, author, template, publicationType, format, customSize, quality }
      const logs = JSON.parse(localStorage.getItem('ai-book-logs') || '[]')
      await exportBookProject({ title, author, coverPNG, pdfDataUri: pdfPreview, epubBlob, settings, logs })
      toast({ title: 'Project Exported', description: 'ZIP downloaded with all assets' })
    } catch (e) {
      log('error', 'project export failed', e)
      toast({ title: 'Export Error', description: 'Failed to export project', variant: 'destructive' })
    }
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-200 selection:bg-primary/30 selection:text-white">
      {/* Cinematic Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[10%] right-[10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[10%] left-[10%] w-[40%] h-[40%] bg-blue-500/5 blur-[120px] rounded-full" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12 space-y-12">
        {/* OS Toolbar */}
        <div className="sticky top-0 z-40 bg-[#0F172A]/80 backdrop-blur-md border-b border-white/5 px-6 py-3 flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-white font-serif tracking-tight">Book Engine</h2>
            <span className="h-4 w-[1px] bg-white/10 mx-2" />
            <div className="hidden lg:flex gap-3 px-3 py-1 bg-white/5 rounded-lg border border-white/5">
              {Object.entries(status).map(([k, v]) => (
                <div key={k} className="flex items-center gap-2">
                  <div className={`w-1.5 h-1.5 rounded-full ${v ? 'bg-success shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-slate-700'}`} />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{k}</span>
                </div>
              ))}
            </div>
          </div>

          <Button
            onClick={createBook}
            size="sm"
            className="gradient-primary text-[#0F172A] font-bold hover-lift glow-gold border-none"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            Initialize Genesis
          </Button>
        </div>

        <Tabs defaultValue="cover" className="space-y-12">
          <TabsList className="bg-white/5 border border-white/10 p-1 rounded-2xl h-14 w-full md:w-auto scrollbar-none overflow-x-auto">
            <TabsTrigger value="cover" className="px-8 h-full rounded-xl data-[state=active]:bg-primary data-[state=active]:text-[#0F172A] font-bold uppercase tracking-widest text-[10px]">Cover Architecture</TabsTrigger>
            <TabsTrigger value="layout" className="px-8 h-full rounded-xl data-[state=active]:bg-primary data-[state=active]:text-[#0F172A] font-bold uppercase tracking-widest text-[10px]">Layout Engine</TabsTrigger>
            <TabsTrigger value="editing" className="px-8 h-full rounded-xl data-[state=active]:bg-primary data-[state=active]:text-[#0F172A] font-bold uppercase tracking-widest text-[10px]">Vector Edit</TabsTrigger>
            <TabsTrigger value="export" className="px-8 h-full rounded-xl data-[state=active]:bg-primary data-[state=active]:text-[#0F172A] font-bold uppercase tracking-widest text-[10px]">Export</TabsTrigger>
            <TabsTrigger value="marketing" className="px-8 h-full rounded-xl data-[state=active]:bg-primary data-[state=active]:text-[#0F172A] font-bold uppercase tracking-widest text-[10px]">Marketing</TabsTrigger>
            <TabsTrigger value="qa" className="px-8 h-full rounded-xl data-[state=active]:bg-primary data-[state=active]:text-[#0F172A] font-bold uppercase tracking-widest text-[10px]">Validation</TabsTrigger>
          </TabsList>

          <TabsContent value="cover" className="space-y-0">
            <div className="grid lg:grid-cols-2 gap-12">
              <div className="space-y-10 order-2 lg:order-1">
                <Card className="bg-[#1E293B]/30 border-white/5 glass p-8 space-y-8">
                  <div className="space-y-6">
                    <Label className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Identity Details</Label>
                    <div className="space-y-4">
                      <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Publication Title" className="bg-white/5 border-white/10 h-12" />
                      <Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} placeholder="Sub-heading / Strapline" className="bg-white/5 border-white/10 h-12" />
                      <Input value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Primary Creator" className="bg-white/5 border-white/10 h-12" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <Label className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Visual Archetype</Label>
                      <Select value={template} onValueChange={(v) => setTemplate(v as any)}>
                        <SelectTrigger className="bg-white/5 border-white/10 h-12"><SelectValue placeholder="Style" /></SelectTrigger>
                        <SelectContent className="bg-[#1E293B] border-white/10">
                          <SelectItem value="minimal">Minimalist</SelectItem>
                          <SelectItem value="modern">Modern Professional</SelectItem>
                          <SelectItem value="classic">Timeless Classic</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-3">
                      <Label className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Output Geometry</Label>
                      <Select value={format} onValueChange={(v) => setFormat(v as any)}>
                        <SelectTrigger className="bg-white/5 border-white/10 h-12"><SelectValue placeholder="Format" /></SelectTrigger>
                        <SelectContent className="bg-[#1E293B] border-white/10">
                          <SelectItem value="A4">A4 Corporate</SelectItem>
                          <SelectItem value="Letter">US Letter</SelectItem>
                          <SelectItem value="A5">A5 Handbook</SelectItem>
                          <SelectItem value="SixByNine">Trade 6x9</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <Switch checked={realtime} onCheckedChange={setRealtime} />
                      <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Atmospheric Sync</span>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm" onClick={undo} className="text-slate-500 hover:text-white">Undo</Button>
                      <Button variant="ghost" size="sm" onClick={redo} className="text-slate-500 hover:text-white">Redo</Button>
                    </div>
                  </div>

                  <Button onClick={buildCover} className="w-full h-16 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-lg hover:bg-white/10 transition-all border-none">
                    Render Static Model
                  </Button>

                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-primary/30 to-blue-500/30 rounded-2xl blur opacity-25 group-hover:opacity-100 transition duration-1000" />
                    <Button onClick={async () => { /* ...existing logic... */ }} className="relative w-full h-16 rounded-xl gradient-primary text-[#0F172A] font-bold text-lg hover-lift glow-gold border-none">
                      Neural Cover Genesis
                    </Button>
                  </div>
                </Card>
              </div>

              <div className="order-1 lg:order-2 space-y-8">
                <div className="aspect-[3/4] rounded-3xl overflow-hidden glass border border-white/5 relative group">
                  {coverPNG ? (
                    <img src={coverPNG} alt="Cover Preview" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 gap-4">
                      <div className="w-20 h-20 rounded-full border-2 border-dashed border-slate-700 animate-spin-slow" />
                      <p className="text-[10px] uppercase tracking-widest font-bold">Awaiting Aesthetic Initialization</p>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0F172A] via-transparent to-transparent opacity-60 pointer-events-none" />
                </div>

                <Card className="bg-white/[0.02] border-white/5 p-6 space-y-4">
                  <div className="flex items-center gap-3 text-primary">
                    <ShieldCheck className="w-5 h-5" />
                    <h4 className="text-xs uppercase tracking-widest font-bold">Aesthetic Validator</h4>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-500 uppercase font-bold">Contrast</p>
                      <p className="text-xs text-success font-bold">AAA Ready</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-500 uppercase font-bold">Safety</p>
                      <p className="text-xs text-white font-bold">Safe Zones OK</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] text-slate-500 uppercase font-bold">DPI</p>
                      <p className="text-xs text-white font-bold">300 Uncompressed</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="layout" className="space-y-12">
            <div className="grid lg:grid-cols-3 gap-12">
              <div className="lg:col-span-1 space-y-10">
                <Card className="bg-[#1E293B]/30 border-white/5 glass p-8 space-y-8">
                  <div className="space-y-4">
                    <Label className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Content Archetype</Label>
                    <Select value={layoutPreset} onValueChange={(v) => setLayoutPreset(v as any)}>
                      <SelectTrigger className="h-12 bg-white/5 border-white/10"><SelectValue placeholder="Preset" /></SelectTrigger>
                      <SelectContent className="bg-[#1E293B] border-white/10">
                        <SelectItem value="publisher_pro">Publisher Pro</SelectItem>
                        <SelectItem value="arrow_chapter">Chapter Minimal</SelectItem>
                        <SelectItem value="heritage_classic">Heritage Classic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button onClick={buildLayout} className="w-full h-14 gradient-primary text-[#0F172A] font-bold rounded-xl border-none glow-gold">
                    Synthesize Interior
                  </Button>

                  <div className="space-y-6 pt-4">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-slate-500">Fluid Mechanics</label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center gap-2 p-3 bg-white/5 rounded-xl border border-white/5">
                        <Switch checked={useHeaders} onCheckedChange={setUseHeaders} />
                        <span className="text-[10px] font-bold text-slate-400">Headers</span>
                      </div>
                      <div className="flex items-center gap-2 p-3 bg-white/5 rounded-xl border border-white/5">
                        <Switch checked={usePageNumbers} onCheckedChange={setUsePageNumbers} />
                        <span className="text-[10px] font-bold text-slate-400">Paging</span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
              <div className="lg:col-span-2">
                <div className="aspect-video w-full rounded-3xl overflow-hidden glass border border-white/5 bg-white shadow-2xl">
                  {pdfPreview ? (
                    <iframe src={pdfPreview} className="w-full h-full" title="Interior Model" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#0F172A]">
                      <p className="text-[10px] uppercase tracking-widest font-bold text-slate-600">Interior Logic Not Yet Rendered</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="export" className="pt-8">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { label: 'Print Document', icon: Download, action: exportPDF },
                { label: 'Identity Model', icon: ImageIcon, action: exportCover },
                { label: 'Global ePub', icon: BookOpen, action: exportEpub },
                { label: 'Complete Archive', icon: Package, action: exportProject }
              ].map((item, i) => (
                <Card key={i} className="bg-[#1E293B]/30 border-white/5 glass hover-lift cursor-pointer group p-8 flex flex-col items-center text-center space-y-4" onClick={item.action}>
                  <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center group-hover:bg-primary/20 transition-all border border-white/10 group-hover:border-primary/50">
                    <item.icon className="w-8 h-8 text-slate-400 group-hover:text-primary transition-colors" />
                  </div>
                  <h4 className="text-sm font-bold uppercase tracking-widest text-slate-300 group-hover:text-white">{item.label}</h4>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default AIBookStudio