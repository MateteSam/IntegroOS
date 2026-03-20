import React from 'react';
import { BookMetadata } from '../types';
import { Tag, Barcode, BookOpen, User, Building2, Calendar, Globe, Pencil } from 'lucide-react';

interface MetadataEditorProps {
    metadata: BookMetadata;
    onChange: (meta: BookMetadata) => void;
}

const MetadataEditor: React.FC<MetadataEditorProps> = ({ metadata, onChange }) => {
    const handleChange = (key: keyof BookMetadata, value: any) => {
        onChange({ ...metadata, [key]: value });
    };

    const generateMockISBN = () => {
        const prefix = '978';
        const body = Array.from({length: 9}, () => Math.floor(Math.random() * 10)).join('');
        const digits = (prefix + body).split('').map(Number);
        const checksum = digits.reduce((sum, d, i) => sum + d * (i % 2 === 0 ? 1 : 3), 0);
        const checkDigit = (10 - (checksum % 10)) % 10;
        return prefix + body + checkDigit;
    };

    const lookupISBN = async () => {
        if (!metadata.isbn) return;
        try {
            const response = await fetch(`https://openlibrary.org/isbn/${metadata.isbn}.json`);
            if (!response.ok) throw new Error('Lookup failed');
            const data = await response.json();
            const updated = {
                ...metadata,
                title: data.title || metadata.title,
                subtitle: data.subtitle || metadata.subtitle,
                contributors: data.authors ? data.authors.map((a: any) => ({name: a.name, role: 'A01'})) : metadata.contributors,
                publisher: data.publishers?.[0] || metadata.publisher,
                publicationDate: data.publish_date || metadata.publicationDate,
                description: data.description?.value || metadata.description,
                // Add more mappings as needed
            };
            onChange(updated);
        } catch (e) {
            console.error('ISBN lookup failed:', e);
            // Optionally show an alert or toast
        }
    };

    return (
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-6 md:mb-10">
                    <h2 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-3">Book Metadata</h2>
                    <p className="text-slate-500 text-base md:text-lg">Define the core identity of your book for publishing.</p>
                </div>

                <div className="space-y-8">
                    {/* Core Info */}
                    <Section title="Core Information" icon={<BookOpen size={20} />}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="col-span-2 md:col-span-1">
                                <Input
                                    label="Book Title"
                                    value={metadata.title}
                                    onChange={(v) => handleChange('title', v)}
                                    placeholder="e.g. The Great Gatsby"
                                    autoFocus
                                />
                            </div>
                            <div className="col-span-2 md:col-span-1">
                                <Input
                                    label="Subtitle"
                                    value={metadata.subtitle || ''}
                                    onChange={(v) => handleChange('subtitle', v)}
                                    placeholder="Optional subtitle"
                                />
                            </div>
                            <div className="col-span-2">
                                <Input
                                    label="Contributors (Authors, Editors)"
                                    value={metadata.authors.join(', ')}
                                    onChange={(v) => handleChange('authors', v.split(',').map(s => s.trim()))}
                                    placeholder="Comma separated names"
                                    icon={<User size={18} />}
                                />
                            </div>
                        </div>
                    </Section>

                    {/* Identification */}
                    <Section title="Identification & Publishing" icon={<Barcode size={20} />}>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="flex items-end gap-2 col-span-1">
                                <div className="flex-1">
                                    <Input
                                        label="ISBN-13"
                                        value={metadata.isbn || ''}
                                        onChange={(v) => handleChange('isbn', v)}
                                        placeholder="978-..."
                                        fontMono
                                    />
                                </div>
                                <button 
                                    onClick={() => handleChange('isbn', generateMockISBN())}
                                    className="px-3 py-3 bg-indigo-600 text-white rounded-xl font-medium hover:bg-indigo-700 transition-all shadow-sm mb-0 text-sm"
                                >
                                    Generate Mock
                                </button>
                                <button 
                                    onClick={lookupISBN}
                                    className="px-3 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-all shadow-sm mb-0 text-sm"
                                >
                                    Lookup
                                </button>
                            </div>
                            <Input
                                label="Publisher"
                                value={metadata.publisher}
                                onChange={(v) => handleChange('publisher', v)}
                                placeholder="Publisher Name"
                                icon={<Building2 size={18} />}
                            />
                            <Input
                                label="Imprint"
                                value={metadata.imprint || ''}
                                onChange={(v) => handleChange('imprint', v)}
                                placeholder="Imprint Name"
                            />
                            <Input
                                label="Publication Date"
                                value={metadata.publicationDate || ''}
                                onChange={(v) => handleChange('publicationDate', v)}
                                placeholder="YYYY-MM-DD"
                                icon={<Calendar size={18} />}
                            />
                            <Input
                                label="Language Code"
                                value={metadata.language || 'eng'}
                                onChange={(v) => handleChange('language', v)}
                                placeholder="eng"
                                fontMono
                                icon={<Globe size={18} />}
                            />
                            <Input
                                label="Edition Type"
                                value={metadata.editionType || ''}
                                onChange={(v) => handleChange('editionType', v)}
                                placeholder="e.g. REV for Revised Edition"
                                fontMono
                            />
                        </div>
                    </Section>

                    {/* Discovery */}
                    <Section title="Discovery & Classification" icon={<Tag size={20} />}>
                        <div className="space-y-6">
                            <div>
                                <Label>BISAC / Thema Codes</Label>
                                <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all min-h-[60px] flex flex-wrap gap-2">
                                    {metadata.bisacCodes.map(code => (
                                        <span key={code} className="inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                                            {code}
                                            <button onClick={() => handleChange('bisacCodes', metadata.bisacCodes.filter(c => c !== code))} className="ml-2 text-indigo-400 hover:text-indigo-900 rounded-full w-4 h-4 flex items-center justify-center">×</button>
                                        </span>
                                    ))}
                                    <button onClick={() => { const c = prompt("Enter BISAC Code (e.g. FIC000000)"); if (c) handleChange('bisacCodes', [...metadata.bisacCodes, c]); }} className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-all">
                                        + Add
                                    </button>
                                </div>
                            </div>

                            <Input
                                label="Keywords"
                                value={metadata.keywords.join(', ')}
                                onChange={(v) => handleChange('keywords', v.split(',').map(s => s.trim()))}
                                placeholder="Comma separated keywords..."
                            />
                            <div>
                                <Label>Audience Codes</Label>
                                <div className="p-2 bg-white rounded-xl border border-slate-200 shadow-sm focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all min-h-[60px] flex flex-wrap gap-2">
                                    {metadata.audienceCodes?.map(code => (
                                        <span key={code} className="inline-flex items-center px-2.5 py-1 rounded-lg text-sm font-bold bg-indigo-50 text-indigo-700 border border-indigo-100">
                                            {code}
                                            <button onClick={() => handleChange('audienceCodes', metadata.audienceCodes?.filter(c => c !== code) || [])} className="ml-2 text-indigo-400 hover:text-indigo-900 rounded-full w-4 h-4 flex items-center justify-center">×</button>
                                        </span>
                                    )) || null}
                                    <button onClick={() => { const c = prompt("Enter Audience Code (e.g. 01 for General)"); if (c) handleChange('audienceCodes', [...(metadata.audienceCodes || []), c]); }} className="inline-flex items-center px-3 py-1 rounded-lg text-sm font-medium text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-all">
                                        + Add
                                    </button>
                                </div>
                            </div>

                            <div>
                                <Label>Jacket Copy (Description)</Label>
                                <textarea
                                    value={metadata.description || ''}
                                    onChange={(e) => handleChange('description', e.target.value)}
                                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-base text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all h-40 resize-none shadow-sm"
                                    placeholder="Enter the marketing description..."
                                />
                            </div>
                        </div>
                    </Section>
                </div>
            </div>
        </div>
    );
};

const Section: React.FC<{ title: string, icon: React.ReactNode, children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="bg-white/60 backdrop-blur-md rounded-2xl border border-white shadow-xl shadow-slate-200/50 p-8 hover:shadow-2xl hover:shadow-slate-200/60 transition-all">
        <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-white rounded-xl shadow-sm text-indigo-600 border border-slate-100">{icon}</div>
            <h3 className="text-xl font-bold text-slate-900 tracking-tight">{title}</h3>
        </div>
        {children}
    </div>
);

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (<label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">{children}</label>);

const Input: React.FC<{ label: string, value: string, onChange: (val: string) => void, placeholder?: string, icon?: React.ReactNode, fontMono?: boolean, autoFocus?: boolean }> = ({ label, value, onChange, placeholder, icon, fontMono, autoFocus }) => (
    <div className="group">
        <Label>{label}</Label>
        <div className="relative">
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                autoFocus={autoFocus}
                className={`w-full ${icon ? 'pl-11' : 'pl-4'} pr-4 py-3 bg-white border border-slate-200 rounded-xl text-base text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm ${fontMono ? 'font-mono' : 'font-sans'}`}
                placeholder={placeholder}
            />
            {icon && <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none group-focus-within:text-indigo-500 transition-colors">{icon}</div>}
        </div>
    </div>
);

export default MetadataEditor;