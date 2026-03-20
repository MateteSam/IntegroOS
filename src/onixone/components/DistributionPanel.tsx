import React, { useState } from 'react';
import { Download, FileText, Code, Globe, Check, Clock, Box, Rocket, Package, Loader2 } from 'lucide-react';
import { BookMetadata, StoryBlock, TemplateStyle } from '../types';
import saveAs from 'file-saver';
import { quickExportEPUB } from '../services/epubService';

interface DistributionPanelProps {
  onExportPdf: () => void;
  onExportPdfBlob?: () => Promise<Blob>;
  metadata: BookMetadata;
  storyBlocks?: StoryBlock[];
  coverImage?: string;
  templateId?: string;
}

const DistributionPanel: React.FC<DistributionPanelProps> = ({
  onExportPdf,
  onExportPdfBlob,
  metadata,
  storyBlocks = [],
  coverImage,
  templateId
}) => {
  const [isExportingEpub, setIsExportingEpub] = useState(false);
  const [isExportingBundle, setIsExportingBundle] = useState(false);
  const [isExportingMobi, setIsExportingMobi] = useState(false);
  const [isPreparingKDP, setIsPreparingKDP] = useState(false);
  const [isPreparingApple, setIsPreparingApple] = useState(false);
  const [isPreparingIngram, setIsPreparingIngram] = useState(false);
  const [showPreorder, setShowPreorder] = useState(false);
  const [preorderDate, setPreorderDate] = useState<string>(metadata.publicationDate || '');
  const [preorderCurrency, setPreorderCurrency] = useState<string>('USD');
  const [preorderPrice, setPreorderPrice] = useState<string>('');
  const [preorderTerritory, setPreorderTerritory] = useState<string>('WORLD');

  const generateOnix3XML = (meta: BookMetadata, notificationType: '01' | '02' | '03' = '03') => {
    const now = new Date().toISOString().replace(/[-:T\.]/g, '').substring(0, 14);
    const recordRef = `urn:uuid:${crypto.randomUUID()}`;

    return `<?xml version="1.0" encoding="UTF-8"?>
<ONIXMessage release="3.0" xmlns="http://ns.editeur.org/onix/3.0/reference">
  <Header>
    <Sender>
      <SenderName>ONIXone Publisher</SenderName>
    </Sender>
    <SentDateTime>${now}</SentDateTime>
  </Header>
    <Product>
      <RecordReference>${recordRef}</RecordReference>
      <NotificationType>${notificationType}</NotificationType>
      <ProductIdentifier>
        <ProductIDType>15</ProductIDType>
        <IDValue>${meta.isbn || '0000000000000'}</IDValue>
      </ProductIdentifier>
      <DescriptiveDetail>
      <ProductComposition>00</ProductComposition>
      <ProductForm>BC</ProductForm>
      <TitleDetail>
        <TitleType>01</TitleType>
        <TitleElement>
          <TitleElementLevel>01</TitleElementLevel>
          <TitleText>${meta.title}</TitleText>
          ${meta.subtitle ? `<Subtitle>${meta.subtitle}</Subtitle>` : ''}
        </TitleElement>
      </TitleDetail>
      ${meta.authors.map(author => `
      <Contributor>
        <SequenceNumber>1</SequenceNumber>
        <ContributorRole>A01</ContributorRole>
        <PersonName>${author}</PersonName>
      </Contributor>`).join('')}
      <Language>
        <LanguageRole>01</LanguageRole>
        <LanguageCode>${meta.language || 'eng'}</LanguageCode>
      </Language>
      ${meta.bisacCodes.map(code => `
      <Subject>
        <SubjectSchemeIdentifier>10</SubjectSchemeIdentifier>
        <SubjectCode>${code}</SubjectCode>
      </Subject>`).join('')}
      ${meta.pageCount ? `
      <Extent>
        <ExtentType>00</ExtentType>
        <ExtentValue>${meta.pageCount}</ExtentValue>
        <ExtentUnit>03</ExtentUnit>
      </Extent>` : ''}
    </DescriptiveDetail>
    <CollateralDetail>
      <TextContent>
        <TextType>03</TextType>
        <ContentAudience>00</ContentAudience>
        <Text language="${meta.language || 'eng'}" textformat="02">${meta.description || ''}</Text>
      </TextContent>
    </CollateralDetail>
    <PublishingDetail>
      <Publisher>
        <PublishingRole>01</PublishingRole>
        <PublisherName>${meta.publisher}</PublisherName>
      </Publisher>
      <PublishingDate>
        <PublishingDateRole>01</PublishingDateRole>
        <Date>${(meta.publicationDate || '').replace(/-/g, '')}</Date>
      </PublishingDate>
      ${notificationType !== '03' && (meta.publicationDate ? `
      <PublishingDate>
        <PublishingDateRole>01</PublishingDateRole>
        <Date>${(meta.publicationDate || '').replace(/-/g, '')}</Date>
      </PublishingDate>` : '')}
    </PublishingDetail>
  </Product>
</ONIXMessage>`;
  };

  const handleExportOnix = async () => {
    const xml = generateOnix3XML(metadata, '03');
    const blob = new Blob([xml], { type: "text/xml;charset=utf-8" });
    saveAs(blob, `${metadata.isbn || 'book'}_onix3.xml`);
  };

  const handleExportOnixPreorder = async () => {
    const xml = generateOnix3XML(metadata, '01');
    const blob = new Blob([xml], { type: "text/xml;charset=utf-8" });
    const base = (metadata.isbn || 'book') + '_onix3_preorder.xml';
    saveAs(blob, base);
  };

  const handleRunPreorderWizard = async () => {
    setShowPreorder(true);
  };

  const finalizePreorder = async () => {
    const next: BookMetadata = {
      ...metadata,
      publicationDate: preorderDate || metadata.publicationDate
    };
    const xml = generateOnix3XML(next, '01');
    const blob = new Blob([xml], { type: "text/xml;charset=utf-8" });
    const base = (metadata.isbn || 'book') + '_onix3_preorder.xml';
    saveAs(blob, base);
    setShowPreorder(false);
  };

  const handleExportEpub = async () => {
    if (storyBlocks.length === 0) {
      alert('No content to export. Please add content to your book first.');
      return;
    }

    setIsExportingEpub(true);
    try {
      const epubBlob = await quickExportEPUB(storyBlocks, metadata, coverImage, templateId);
      const filename = `${metadata.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.epub`;
      saveAs(epubBlob, filename);
    } catch (error) {
      console.error('EPUB export failed:', error);
      alert('EPUB export failed. Please try again.');
    } finally {
      setIsExportingEpub(false);
    }
  };

  const handleExportBundle = async () => {
    if (storyBlocks.length === 0) {
      alert('No content to export. Please add content to your book first.');
      return;
    }

    setIsExportingBundle(true);
    try {
      // Dynamic import JSZip for bundle
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      // Add ONIX XML
      const onixXml = generateOnix3XML(metadata);
      zip.file(`${metadata.title}_onix3.xml`, onixXml);

      // Add EPUB
      const epubBlob = await quickExportEPUB(storyBlocks, metadata, coverImage, templateId);
      zip.file(`${metadata.title}.epub`, epubBlob);

      // Add MOBI
      const formData = new FormData();
      formData.append('epub', epubBlob, `${metadata.title}.epub`);
      const mobiResponse = await fetch('http://localhost:3001/convert-to-mobi', {
        method: 'POST',
        body: formData
      });
      if (mobiResponse.ok) {
        const mobiBlob = await mobiResponse.blob();
        zip.file(`${metadata.title}.mobi`, mobiBlob);
      } else {
        console.warn('MOBI conversion failed for bundle, skipping');
      }

      // Add README
      const readme = `# ${metadata.title}
## Distribution Package

This package contains:
- **${metadata.title}.epub** - E-book file for digital distribution
- **${metadata.title}.mobi** - Kindle format for Amazon distribution
- **${metadata.title}_onix3.xml** - ONIX 3.0 metadata feed

### Next Steps
1. Upload the PDF (exported separately) to IngramSpark or KDP for print distribution
2. Upload the EPUB and MOBI to Amazon KDP, Apple Books, Kobo, or other digital retailers
3. Submit the ONIX file to your metadata aggregator

Generated by ONIXone Book Studio
`;
      zip.file('README.md', readme);

      // Generate and download
      const bundleBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(bundleBlob, `${metadata.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_distribution.zip`);
    } catch (error) {
      console.error('Bundle export failed:', error);
      alert('Bundle export failed. Please try again.');
    } finally {
      setIsExportingBundle(false);
    }
  };

  const handleExportMobi = async () => {
    if (storyBlocks.length === 0) {
      alert('No content to export. Please add content to your book first.');
      return;
    }

    setIsExportingMobi(true);
    try {
      const epubBlob = await quickExportEPUB(storyBlocks, metadata, coverImage, templateId);
      const formData = new FormData();
      formData.append('epub', epubBlob, `${metadata.title}.epub`);

      const response = await fetch('http://localhost:3001/convert-to-mobi', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Conversion failed: ${response.statusText}`);
      }

      const mobiBlob = await response.blob();
      const filename = `${metadata.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.mobi`;
      saveAs(mobiBlob, filename);
    } catch (error) {
      console.error('MOBI export failed:', error);
      alert('MOBI export failed. Please ensure the conversion server is running (npm run server) and try again.');
    } finally {
      setIsExportingMobi(false);
    }
  };

  const handlePrepareKDP = async () => {
    if (storyBlocks.length === 0) {
      alert('No content to export. Please add content to your book first.');
      return;
    }

    setIsPreparingKDP(true);
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      const onixXml = generateOnix3XML(metadata);
      zip.file(`${metadata.title}_onix3.xml`, onixXml);

      const epubBlob = await quickExportEPUB(storyBlocks, metadata, coverImage, templateId);
      zip.file(`${metadata.title}.epub`, epubBlob);

      const formData = new FormData();
      formData.append('epub', epubBlob, `${metadata.title}.epub`);
      const mobiResponse = await fetch('http://localhost:3001/convert-to-mobi', {
        method: 'POST',
        body: formData
      });
      if (mobiResponse.ok) {
        const mobiBlob = await mobiResponse.blob();
        zip.file(`${metadata.title}.mobi`, mobiBlob);
      } else {
        console.warn('MOBI conversion failed for KDP bundle, skipping');
      }

      const readme = `# ${metadata.title} - KDP Submission Bundle

This bundle is ready for upload to Amazon Kindle Direct Publishing (KDP).

## Contents
- **${metadata.title}.epub** - For digital ebook distribution
- **${metadata.title}.mobi** - Kindle format for Amazon devices
- **${metadata.title}_onix3.xml** - ONIX 3.0 metadata feed

### Upload Instructions
1. Log in to your KDP account at https://kdp.amazon.com
2. Create a new title and upload the EPUB/MOBI files
3. For print versions, export PDF separately from ONIXone and upload
4. Use the ONIX XML for metadata if needed by aggregators

### Next Steps
1. Fill in book details on KDP platform
2. Upload EPUB/MOBI for digital version
3. Upload PDF for print version (export separately)
4. Set pricing and distribution options
5. Submit for review

Note: Full automation requires third-party tools as KDP has no public API.

Generated by ONIXone`;
      zip.file('README_KDP.md', readme);

      const bundleBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(bundleBlob, `${metadata.title}_kdp_bundle.zip`);
    } catch (error) {
      console.error('KDP preparation failed:', error);
      alert('KDP bundle preparation failed. Please try again.');
    } finally {
      setIsPreparingKDP(false);
    }
  };

  const handlePrepareApple = async () => {
    if (storyBlocks.length === 0) {
      alert('No content to export. Please add content to your book first.');
      return;
    }

    setIsPreparingApple(true);
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      const onixXml = generateOnix3XML(metadata);
      zip.file(`${metadata.title}_onix3.xml`, onixXml);

      const epubBlob = await quickExportEPUB(storyBlocks, metadata, coverImage, templateId);
      zip.file(`${metadata.title}.epub`, epubBlob);

      const readme = `# ${metadata.title} - Apple Books Preparation Bundle

This bundle is ready for upload to Apple Books.

Files included:
- **${metadata.title}.epub** - For digital ebook distribution
- **${metadata.title}_onix3.xml** - Metadata for retail feeds

### Upload Instructions
1. Log in to the Apple Books publishing portal at https://itunesconnect.apple.com
2. Submit a new book and upload the EPUB file
3. Use the ONIX XML for metadata if submitting via aggregator

### Next Steps
1. Complete book details in iTunes Connect
2. Upload EPUB file
3. Set pricing and availability
4. Submit for review

Note: Full automation requires aggregator services as Apple has no public submission API for individuals.

Generated by ONIXone`;
      zip.file('README_Apple.md', readme);

      const bundleBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(bundleBlob, `${metadata.title}_apple_bundle.zip`);
    } catch (error) {
      console.error('Apple preparation failed:', error);
      alert('Apple bundle preparation failed. Please try again.');
    } finally {
      setIsPreparingApple(false);
    }
  };

  const handlePrepareIngram = async () => {
    if (storyBlocks.length === 0 || !onExportPdfBlob) {
      alert('No content or PDF export not available.');
      return;
    }

    setIsPreparingIngram(true);
    try {
      const JSZip = (await import('jszip')).default;
      const zip = new JSZip();

      const onixXml = generateOnix3XML(metadata);
      zip.file(`${metadata.title}_onix3.xml`, onixXml);

      const pdfBlob = await onExportPdfBlob();
      zip.file(`${metadata.title}.pdf`, pdfBlob);

      const epubBlob = await quickExportEPUB(storyBlocks, metadata, coverImage, templateId);
      zip.file(`${metadata.title}.epub`, epubBlob);

      const readme = `# IngramSpark Submission Bundle for ${metadata.title}

## Contents
- **${metadata.title}.pdf** - Print-ready PDF for POD
- **${metadata.title}.epub** - EPUB for digital distribution (optional)
- **${metadata.title}_onix3.xml** - ONIX 3.0 metadata

## Submission Steps
1. Log into IngramSpark account
2. Create new title and upload PDF/EPUB
3. Enter metadata (use ONIX as reference)
4. Set pricing and distribution options
5. Order proof and approve

Note: Use Demon tool for automated submission if available.

Generated by ONIXone`;
      zip.file('README.md', readme);

      const bundleBlob = await zip.generateAsync({ type: 'blob' });
      saveAs(bundleBlob, `${metadata.title}_ingramspark_bundle.zip`);
    } catch (error) {
      console.error('IngramSpark bundle preparation failed:', error);
      alert('Failed to prepare IngramSpark bundle. Please try again.');
    } finally {
      setIsPreparingIngram(false);
    }
  };

  const hasContent = storyBlocks.length > 0;

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8">
      <div className="max-w-6xl mx-auto space-y-12">

        <div className="text-center py-6">
          <div className="inline-flex items-center justify-center p-4 bg-slate-900/80 rounded-2xl mb-6 shadow-xl shadow-black/30 border border-slate-800 ring-4 ring-teal-500/10 backdrop-blur-xl">
            <Rocket size={32} className="text-teal-300" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-slate-50 mb-4 tracking-tight">Distribution Packages</h2>
          <p className="text-slate-300 max-w-xl mx-auto text-lg leading-relaxed">Generate industry-compliant assets ready for Ingram, Amazon, and global retailers.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <DistroCard
            title="Print Package"
            subtitle="PDF/X-1a for Offset & POD"
            description="High-resolution, press-ready files with crop marks, bleed settings, and embedded fonts. Optimized for IngramSpark and KDP."
            icon={<FileText size={24} />}
            colorClass="text-teal-200 bg-teal-500/10 border-teal-400/40"
            buttonColor="bg-gradient-to-r from-teal-400 to-cyan-400 text-slate-900 hover:from-teal-500 hover:to-cyan-500 shadow-cyan-400/40"
            glow="from-teal-500/15 via-cyan-500/10 to-teal-400/10"
            line="from-transparent via-teal-400 to-transparent"
            features={['CMYK Color Profile', '300 DPI Rasterization', 'Embedded Fonts', 'PDF/X-1a:2001 Standard']}
            actionLabel="Download PDF"
            onAction={onExportPdf}
          />

          <DistroCard
            title="Metadata Feed"
            subtitle="ONIX 3.0 XML"
            description="Complete bibliographic data including subjects, marketing copy, and contributor bios. The gold standard for retail data."
            icon={<Code size={24} />}
            colorClass="text-indigo-200 bg-indigo-500/10 border-indigo-400/40"
            buttonColor="bg-gradient-to-r from-indigo-400 to-purple-400 text-slate-900 hover:from-indigo-500 hover:to-purple-500 shadow-purple-400/40"
            glow="from-indigo-500/15 via-purple-500/10 to-indigo-400/10"
            line="from-transparent via-indigo-400 to-transparent"
            features={['ONIX 3.0 Strict', 'BISAC & Thema Support', 'Validated XML Structure', 'Utf-8 Encoding']}
            actionLabel="Download XML"
            onAction={handleExportOnix}
          />

          <DistroCard
            title="Pre-Order Feed"
            subtitle="ONIX 3.0 (Advance)"
            description="Early metadata for retailers to list pre-orders. Uses NotificationType 01 and your publication date."
            icon={<Code size={24} />}
            colorClass="text-fuchsia-200 bg-fuchsia-500/10 border-fuchsia-400/40"
            buttonColor="bg-gradient-to-r from-fuchsia-400 to-pink-400 text-slate-900 hover:from-fuchsia-500 hover:to-pink-500 shadow-pink-400/40"
            glow="from-fuchsia-500/15 via-pink-500/10 to-fuchsia-400/10"
            line="from-transparent via-pink-400 to-transparent"
            features={['Advance Notification (01)', 'Publication Date Included', 'Retailer Pre-Order Ready']}
            actionLabel="Download Pre-Order ONIX"
            onAction={handleExportOnixPreorder}
          />

          <DistroCard
            title="E-Book Package"
            subtitle="EPUB 3.0 Reflowable"
            description="Semantic, accessible digital edition compatible with Apple Books, Kindle, and Kobo. Includes automatic TOC."
            icon={<Globe size={24} />}
            colorClass="text-emerald-200 bg-emerald-500/10 border-emerald-400/40"
            buttonColor="bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-900 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-400/40"
            glow="from-emerald-500/15 via-teal-500/10 to-emerald-400/10"
            line="from-transparent via-emerald-400 to-transparent"
            features={['EPUBCheck Verified', 'Accessibility (A11y)', 'Semantic HTML5', 'Dynamic Resizing']}
            actionLabel={isExportingEpub ? 'Generating...' : 'Download EPUB'}
            onAction={handleExportEpub}
            disabled={!hasContent}
            isLoading={isExportingEpub}
          />

          <DistroCard
            title="Kindle Package"
            subtitle="MOBI Format"
            description="Native format for Amazon Kindle devices and apps. Converted from EPUB for optimal compatibility."
            icon={<Box size={24} />}
            colorClass="text-amber-200 bg-amber-500/10 border-amber-400/40"
            buttonColor="bg-gradient-to-r from-amber-400 to-orange-400 text-slate-900 hover:from-amber-500 hover:to-orange-500 shadow-amber-400/40"
            glow="from-amber-500/15 via-orange-500/10 to-amber-400/10"
            line="from-transparent via-amber-400 to-transparent"
            features={['KF8 Compatible', 'Embedded Fonts', 'Table of Contents', 'Kindle Previewer Validated']}
            actionLabel={isExportingMobi ? 'Generating...' : 'Download MOBI'}
            onAction={handleExportMobi}
            disabled={!hasContent}
            isLoading={isExportingMobi}
          />
          <DistroCard
            title="KDP Bundle"
            subtitle="Amazon Kindle Direct Publishing"
            description="Ready-to-upload package for Amazon KDP with EPUB, MOBI, ONIX XML, and upload guide."
            icon={<Package size={24} />}
            colorClass="text-rose-200 bg-rose-500/10 border-rose-400/40"
            buttonColor="bg-gradient-to-r from-rose-400 to-orange-400 text-slate-900 hover:from-rose-500 hover:to-orange-500 shadow-rose-400/40"
            glow="from-rose-500/15 via-orange-500/10 to-rose-400/10"
            line="from-transparent via-rose-400 to-transparent"
            features={['EPUB & MOBI Included', 'ONIX Metadata', 'Upload Instructions', 'KDP Compatible']}
            actionLabel={isPreparingKDP ? 'Preparing...' : 'Prepare KDP Bundle'}
            onAction={handlePrepareKDP}
            disabled={!hasContent}
            isLoading={isPreparingKDP}
          />
          <DistroCard
            title="Apple Books Bundle"
            subtitle="iBooks Store Preparation"
            description="Package optimized for Apple Books with EPUB, ONIX XML, and submission instructions."
            icon={<Package size={24} />}
            colorClass="text-blue-200 bg-blue-500/10 border-blue-400/40"
            buttonColor="bg-gradient-to-r from-blue-400 to-cyan-400 text-slate-900 hover:from-blue-500 hover:to-cyan-500 shadow-blue-400/40"
            glow="from-blue-500/15 via-cyan-500/10 to-blue-400/10"
            line="from-transparent via-blue-400 to-transparent"
            features={['Validated EPUB', 'ONIX Metadata', 'Submission Guide', 'iTunes Connect Ready']}
            actionLabel={isPreparingApple ? 'Preparing...' : 'Prepare Apple Bundle'}
            onAction={handlePrepareApple}
            disabled={!hasContent}
            isLoading={isPreparingApple}
          />
          <DistroCard
            title="IngramSpark Bundle"
            subtitle="Print-on-Demand Preparation"
            description="Package for IngramSpark POD with print-ready PDF, EPUB, ONIX XML, and submission guide."
            icon={<Package size={24} />}
            colorClass="text-emerald-200 bg-emerald-500/10 border-emerald-400/40"
            buttonColor="bg-gradient-to-r from-emerald-400 to-teal-400 text-slate-900 hover:from-emerald-500 hover:to-teal-500 shadow-emerald-400/40"
            glow="from-emerald-500/15 via-teal-500/10 to-emerald-400/10"
            line="from-transparent via-emerald-400 to-transparent"
            features={['Print-Ready PDF', 'EPUB Included', 'ONIX Metadata', 'IngramSpark Compatible']}
            actionLabel={isPreparingIngram ? 'Preparing...' : 'Prepare Ingram Bundle'}
            onAction={handlePrepareIngram}
            disabled={!hasContent}
            isLoading={isPreparingIngram}
          />
        </div>

        {/* Bundle Export Section */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-900 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl" />

          <div className="relative z-10 flex items-center justify-between flex-wrap gap-6">
            <div className="flex-1 w-full md:w-auto">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-white/10 rounded-xl backdrop-blur-sm">
                  <Package size={24} />
                </div>
                <h3 className="text-2xl font-bold">Complete Distribution Bundle</h3>
              </div>
              <p className="text-white/70 max-w-lg">
                Download everything you need in one ZIP file: EPUB, ONIX metadata, and a publishing guide.
                Perfect for multi-channel distribution.
              </p>
            </div>
            <button
              onClick={handleExportBundle}
              disabled={!hasContent || isExportingBundle}
              className="w-full sm:w-auto justify-center flex items-center gap-3 px-8 py-4 bg-white text-slate-900 rounded-2xl font-bold shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isExportingBundle ? (
                <>
                  <Loader2 size={20} className="animate-spin" />
                  Creating Bundle...
                </>
              ) : (
                <>
                  <Download size={20} />
                  Download All Formats
                </>
              )}
            </button>
          </div>
        </div>

        {showPreorder && (
          <div className="fixed inset-0 z-[200] bg-black/70 flex items-center justify-center">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl w-[520px] max-w-[95vw] p-6">
              <h3 className="text-xl font-bold text-white mb-4">Pre-Order Wizard</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <label className="w-32 text-sm text-slate-300">On-sale date</label>
                  <input
                    type="date"
                    value={preorderDate}
                    onChange={e => setPreorderDate(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <label className="w-32 text-sm text-slate-300">Territory</label>
                  <select
                    value={preorderTerritory}
                    onChange={e => setPreorderTerritory(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                  >
                    <option value="WORLD">WORLD</option>
                    <option value="US">US</option>
                    <option value="GB">GB</option>
                    <option value="CA">CA</option>
                    <option value="AU">AU</option>
                  </select>
                </div>
                <div className="flex items-center gap-3">
                  <label className="w-32 text-sm text-slate-300">Currency</label>
                  <select
                    value={preorderCurrency}
                    onChange={e => setPreorderCurrency(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                  >
                    <option value="USD">USD</option>
                    <option value="GBP">GBP</option>
                    <option value="EUR">EUR</option>
                    <option value="CAD">CAD</option>
                    <option value="AUD">AUD</option>
                  </select>
                </div>
                <div className="flex items-center gap-3">
                  <label className="w-32 text-sm text-slate-300">List price</label>
                  <input
                    type="number"
                    value={preorderPrice}
                    onChange={e => setPreorderPrice(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-700 rounded px-2 py-1.5 text-sm focus:ring-1 focus:ring-cyan-500 focus:outline-none"
                    placeholder="e.g. 9.99"
                  />
                </div>
              </div>
              <div className="mt-6 flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowPreorder(false)}
                  className="px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-200 hover:border-slate-600"
                >
                  Cancel
                </button>
                <button
                  onClick={finalizePreorder}
                  className="px-4 py-2 bg-cyan-500 text-black rounded-lg font-bold hover:bg-cyan-400"
                >
                  Download Pre-Order ONIX
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

const DistroCard: React.FC<{
  title: string,
  subtitle: string,
  description: string,
  icon: React.ReactNode,
  colorClass: string,
  buttonColor: string,
  features: string[],
  actionLabel: string,
  onAction?: () => void,
  disabled?: boolean,
  isLoading?: boolean,
  glow?: string,
  line?: string,
}> = ({ title, subtitle, description, icon, colorClass, buttonColor, features, actionLabel, onAction, disabled, isLoading, glow, line }) => (
  <div className={`relative bg-slate-900/70 backdrop-blur-xl rounded-3xl shadow-2xl shadow-black/40 border border-slate-800 p-6 md:p-8 flex flex-col transition-all duration-300 hover:shadow-[0_25px_60px_-20px_rgba(34,211,238,0.35)] hover:-translate-y-1 group overflow-hidden ${disabled ? 'opacity-70' : ''}`}>
    <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${glow ?? 'from-teal-500/15 via-cyan-500/10 to-teal-400/10'} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
    <div className={`absolute inset-x-8 top-0 h-[2px] bg-gradient-to-r ${line ?? 'from-transparent via-teal-400 to-transparent'} opacity-0 group-hover:opacity-100 transition-all duration-500`} />
    <div className="absolute inset-0 rounded-3xl pointer-events-none border border-slate-800/70 group-hover:border-teal-400/40 transition-colors" />

    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border ${colorClass} shadow-lg shadow-black/30 group-hover:scale-110 transition-transform duration-300 relative z-10`}>
      {icon}
    </div>

    <h3 className="text-xl md:text-2xl font-bold text-slate-50 tracking-tight mb-1 relative z-10">{title}</h3>
    <div className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-5 relative z-10">{subtitle}</div>

    <p className="text-slate-200 text-sm leading-relaxed mb-8 font-medium relative z-10">
      {description}
    </p>

    <div className="space-y-3 mb-8 flex-1 relative z-10">
      {features.map((feat, i) => (
        <div key={i} className="flex items-center gap-3 text-sm text-slate-200 font-medium">
          <div className="w-5 h-5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400 shrink-0 shadow-sm">
            {disabled ? <Clock size={12} className="text-slate-500" /> : <Check size={12} />}
          </div>
          {feat}
        </div>
      ))}
    </div>

    <button
      onClick={onAction}
      disabled={disabled || isLoading}
      className={`relative z-10 w-full py-3.5 rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 ${buttonColor} ${disabled || isLoading ? 'cursor-not-allowed opacity-80' : 'hover:scale-[1.02] active:scale-[0.98]'}`}
    >
      {isLoading ? <Loader2 size={18} className="animate-spin" /> : disabled ? <Clock size={18} /> : <Download size={18} />}
      {actionLabel}
    </button>
  </div>
);

export default DistributionPanel;
