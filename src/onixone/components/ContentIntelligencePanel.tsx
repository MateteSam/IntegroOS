
import React, { useState, useEffect } from 'react';
import {
    Brain,
    AlertTriangle,
    AlertCircle,
    Info,
    Lightbulb,
    RefreshCw,
    ChevronRight,
    Sparkles,
    BookOpen,
    Target,
    Zap,
    Check,
    X,
    TrendingUp,
    Clock,
    Hash,
    FileText
} from 'lucide-react';
import { StoryBlock, ManuscriptAnalysis, ContentIssue, ContentSuggestion, TextStoryBlock } from '../types';
import { analyzeManuscript } from '../services/aiService';

interface ContentIntelligencePanelProps {
    storyBlocks: StoryBlock[];
    onApplySuggestion?: (suggestion: ContentSuggestion) => void;
    onNavigateToBlock?: (blockId: string) => void;
}

const ContentIntelligencePanel: React.FC<ContentIntelligencePanelProps> = ({
    storyBlocks,
    onApplySuggestion,
    onNavigateToBlock
}) => {
    const [analysis, setAnalysis] = useState<ManuscriptAnalysis | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [activeTab, setActiveTab] = useState<'overview' | 'issues' | 'suggestions'>('overview');
    const [expandedIssue, setExpandedIssue] = useState<string | null>(null);

    const runAnalysis = async () => {
        if (storyBlocks.length === 0) return;
        setIsAnalyzing(true);
        try {
            const result = await analyzeManuscript(storyBlocks);
            setAnalysis(result);
        } catch (error) {
            console.error('Analysis failed:', error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const getHealthColor = (score: number) => {
        if (score >= 80) return 'text-emerald-600 bg-emerald-50';
        if (score >= 60) return 'text-amber-600 bg-amber-50';
        return 'text-red-600 bg-red-50';
    };

    const getSeverityIcon = (severity: ContentIssue['severity']) => {
        switch (severity) {
            case 'error': return <AlertCircle size={16} className="text-red-500" />;
            case 'warning': return <AlertTriangle size={16} className="text-amber-500" />;
            case 'info': return <Info size={16} className="text-blue-500" />;
            case 'suggestion': return <Lightbulb size={16} className="text-purple-500" />;
        }
    };

    const getSeverityColor = (severity: ContentIssue['severity']) => {
        switch (severity) {
            case 'error': return 'bg-red-50 border-red-200 text-red-700';
            case 'warning': return 'bg-amber-50 border-amber-200 text-amber-700';
            case 'info': return 'bg-blue-50 border-blue-200 text-blue-700';
            case 'suggestion': return 'bg-purple-50 border-purple-200 text-purple-700';
        }
    };

    const getCategoryLabel = (category: ContentIssue['category']) => {
        const labels: Record<ContentIssue['category'], string> = {
            grammar: 'Grammar',
            style: 'Style',
            consistency: 'Consistency',
            structure: 'Structure',
            pacing: 'Pacing',
            voice: 'Voice',
            formatting: 'Formatting'
        };
        return labels[category] || category;
    };

    return (
        <div className="flex-1 overflow-y-auto custom-scrollbar">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-xl border-b border-slate-200/60 p-4 md:p-6">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl text-white shadow-lg shadow-indigo-500/20">
                            <Brain size={22} />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-slate-900">Content Intelligence</h2>
                            <p className="text-xs text-slate-500">AI-powered manuscript analysis</p>
                        </div>
                    </div>
                    <button
                        onClick={runAnalysis}
                        disabled={isAnalyzing || storyBlocks.length === 0}
                        className="w-full sm:w-auto justify-center flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {isAnalyzing ? (
                            <>
                                <RefreshCw size={16} className="animate-spin" />
                                Analyzing...
                            </>
                        ) : (
                            <>
                                <Sparkles size={16} />
                                Analyze
                            </>
                        )}
                    </button>
                </div>

                {/* Tabs */}
                {analysis && (
                    <div className="flex flex-wrap sm:flex-nowrap gap-1 mt-4 p-1 bg-slate-100 rounded-xl">
                        {(['overview', 'issues', 'suggestions'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all ${activeTab === tab
                                        ? 'bg-white text-slate-900 shadow-sm'
                                        : 'text-slate-500 hover:text-slate-700'
                                    }`}
                            >
                                {tab === 'overview' && 'Overview'}
                                {tab === 'issues' && `Issues (${analysis.issues.length})`}
                                {tab === 'suggestions' && `Suggestions (${analysis.suggestions.length})`}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4 md:p-6 space-y-6">
                {!analysis && !isAnalyzing && (
                    <div className="text-center py-16">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-100 text-slate-400 rounded-full mb-6">
                            <Brain size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Ready to Analyze</h3>
                        <p className="text-slate-500 max-w-sm mx-auto mb-6">
                            Click "Analyze" to run AI-powered content analysis on your manuscript.
                        </p>
                        {storyBlocks.length === 0 && (
                            <p className="text-sm text-amber-600 bg-amber-50 px-4 py-2 rounded-lg inline-block">
                                Import content first to enable analysis
                            </p>
                        )}
                    </div>
                )}

                {isAnalyzing && (
                    <div className="text-center py-16">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-indigo-50 text-indigo-600 rounded-full mb-6 animate-pulse">
                            <Brain size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">Analyzing Your Manuscript</h3>
                        <p className="text-slate-500 max-w-sm mx-auto">
                            Our AI is reading through your content and identifying areas for improvement...
                        </p>
                        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-indigo-600">
                            <RefreshCw size={16} className="animate-spin" />
                            This may take a moment
                        </div>
                    </div>
                )}

                {analysis && activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* Health Score */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide">Manuscript Health</h3>
                                <div className={`text-3xl font-black ${getHealthColor(analysis.healthScore).split(' ')[0]}`}>
                                    {analysis.healthScore}
                                </div>
                            </div>
                            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full transition-all duration-1000 rounded-full ${analysis.healthScore >= 80 ? 'bg-emerald-500' :
                                            analysis.healthScore >= 60 ? 'bg-amber-500' : 'bg-red-500'
                                        }`}
                                    style={{ width: `${analysis.healthScore}%` }}
                                />
                            </div>
                            <p className="text-sm text-slate-500 mt-3">
                                {analysis.healthScore >= 80 && "Your manuscript is in great shape! Just a few minor polish items."}
                                {analysis.healthScore >= 60 && analysis.healthScore < 80 && "Good foundation with some areas to strengthen before publishing."}
                                {analysis.healthScore < 60 && "Several issues need attention to improve reader experience."}
                            </p>
                        </div>

                        {/* Stats Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <StatCard icon={<FileText size={20} />} label="Word Count" value={analysis.wordCount.toLocaleString()} />
                            <StatCard icon={<BookOpen size={20} />} label="Chapters" value={analysis.chapterCount.toString()} />
                            <StatCard icon={<Clock size={20} />} label="Reading Time" value={`${analysis.estimatedReadingTime} min`} />
                            <StatCard icon={<Hash size={20} />} label="Avg Words/Chapter" value={analysis.averageWordsPerChapter.toLocaleString()} />
                        </div>

                        {/* Profile */}
                        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wide mb-4">Detected Profile</h3>
                            <div className="space-y-3">
                                <ProfileRow label="Genre" value={analysis.profile.genre} confidence={analysis.profile.confidence} />
                                {analysis.profile.subGenre && <ProfileRow label="Sub-genre" value={analysis.profile.subGenre} />}
                                <ProfileRow label="Tone" value={analysis.profile.tone} />
                                <ProfileRow label="Audience" value={analysis.profile.targetAudience} />
                                <ProfileRow label="Narrative Style" value={analysis.profile.narrativeStyle.replace(/_/g, ' ')} />
                                <ProfileRow label="Pacing" value={analysis.profile.pacing} />
                            </div>
                            {analysis.profile.themes.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-slate-100">
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-2">Themes</div>
                                    <div className="flex flex-wrap gap-2">
                                        {analysis.profile.themes.map((theme, i) => (
                                            <span key={i} className="px-3 py-1 bg-slate-100 text-slate-700 text-sm font-medium rounded-full">
                                                {theme}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Recommended Templates */}
                        {analysis.recommendedTemplates.length > 0 && (
                            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl border border-indigo-100 p-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <Target size={18} className="text-indigo-600" />
                                    <h3 className="text-sm font-bold text-indigo-900 uppercase tracking-wide">Recommended Templates</h3>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {analysis.recommendedTemplates.map((templateId, i) => (
                                        <span
                                            key={i}
                                            className="px-4 py-2 bg-white text-indigo-700 text-sm font-bold rounded-xl shadow-sm border border-indigo-100"
                                        >
                                            {templateId.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {analysis && activeTab === 'issues' && (
                    <div className="space-y-3">
                        {analysis.issues.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-50 text-emerald-500 rounded-full mb-4">
                                    <Check size={32} />
                                </div>
                                <h4 className="text-lg font-bold text-slate-900">No Issues Found</h4>
                                <p className="text-slate-500 text-sm">Your manuscript looks great!</p>
                            </div>
                        ) : (
                            analysis.issues.map((issue) => (
                                <div
                                    key={issue.id}
                                    className={`rounded-xl border p-4 cursor-pointer transition-all ${getSeverityColor(issue.severity)} ${expandedIssue === issue.id ? 'ring-2 ring-offset-2 ring-indigo-500' : ''
                                        }`}
                                    onClick={() => setExpandedIssue(expandedIssue === issue.id ? null : issue.id)}
                                >
                                    <div className="flex items-start gap-3">
                                        {getSeverityIcon(issue.severity)}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-bold uppercase tracking-wide opacity-60">
                                                    {getCategoryLabel(issue.category)}
                                                </span>
                                                {issue.confidence && (
                                                    <span className="text-xs opacity-40">
                                                        {Math.round(issue.confidence * 100)}% confidence
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm font-medium">{issue.message}</p>

                                            {expandedIssue === issue.id && (
                                                <div className="mt-3 pt-3 border-t border-current/10 space-y-2">
                                                    {issue.suggestion && (
                                                        <div className="text-sm opacity-80">
                                                            <strong>Suggestion:</strong> {issue.suggestion}
                                                        </div>
                                                    )}
                                                    {issue.originalText && (
                                                        <div className="text-sm">
                                                            <strong>Original:</strong>{' '}
                                                            <span className="line-through opacity-60">"{issue.originalText}"</span>
                                                        </div>
                                                    )}
                                                    {issue.suggestedText && (
                                                        <div className="text-sm">
                                                            <strong>Suggested:</strong>{' '}
                                                            <span className="font-medium text-emerald-700">"{issue.suggestedText}"</span>
                                                        </div>
                                                    )}
                                                    {issue.blockId && onNavigateToBlock && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                onNavigateToBlock(issue.blockId!);
                                                            }}
                                                            className="inline-flex items-center gap-1 text-sm font-bold text-indigo-600 hover:text-indigo-800 mt-2"
                                                        >
                                                            Go to location <ChevronRight size={14} />
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                        <ChevronRight
                                            size={18}
                                            className={`opacity-40 transition-transform ${expandedIssue === issue.id ? 'rotate-90' : ''}`}
                                        />
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {analysis && activeTab === 'suggestions' && (
                    <div className="space-y-4">
                        {analysis.suggestions.length === 0 ? (
                            <div className="text-center py-12 text-slate-200">
                                <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-800 text-teal-300 rounded-full mb-4 shadow-lg shadow-black/30 border border-slate-700">
                                    <Lightbulb size={32} />
                                </div>
                                <h4 className="text-lg font-bold text-slate-50">No Suggestions</h4>
                                <p className="text-slate-400 text-sm">Your content is already well-crafted!</p>
                            </div>
                        ) : (
                            analysis.suggestions.map((suggestion) => (
                                <div
                                    key={suggestion.id}
                                    className="relative bg-slate-900/70 backdrop-blur-xl rounded-2xl border border-slate-800 shadow-xl shadow-black/30 overflow-hidden group"
                                >
                                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-teal-500/12 via-cyan-500/8 to-emerald-400/8 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <div className="absolute inset-x-6 top-0 h-[2px] bg-gradient-to-r from-transparent via-teal-400 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />

                                    <div className="p-4 border-b border-slate-800 flex items-center justify-between relative z-10">
                                        <div className="flex items-center gap-2">
                                            <Zap size={16} className={
                                                suggestion.impact === 'high' ? 'text-amber-300' :
                                                    suggestion.impact === 'medium' ? 'text-cyan-300' : 'text-slate-400'
                                            } />
                                            <span className="text-xs font-bold uppercase tracking-wide text-slate-300">
                                                {suggestion.type.replace(/_/g, ' ')}
                                            </span>
                                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${suggestion.impact === 'high' ? 'bg-amber-500/15 text-amber-100 border border-amber-500/40' :
                                                    suggestion.impact === 'medium' ? 'bg-cyan-500/15 text-cyan-100 border border-cyan-500/40' :
                                                        'bg-slate-800 text-slate-200 border border-slate-700'
                                                }`}>
                                                {suggestion.impact} impact
                                            </span>
                                        </div>
                                    </div>

                                    <div className="p-4 space-y-3 relative z-10">
                                        <div className="bg-rose-500/10 rounded-lg p-3 border border-rose-500/30">
                                            <div className="text-xs font-bold text-rose-200 uppercase tracking-wide mb-1">Original</div>
                                            <p className="text-sm text-rose-100 line-through opacity-70">{suggestion.originalText}</p>
                                        </div>

                                        <div className="bg-emerald-500/10 rounded-lg p-3 border border-emerald-500/30">
                                            <div className="text-xs font-bold text-emerald-200 uppercase tracking-wide mb-1">Suggested</div>
                                            <p className="text-sm text-emerald-50 font-medium">{suggestion.suggestedText}</p>
                                        </div>

                                        <div className="bg-slate-800 rounded-lg p-3 border border-slate-700">
                                            <div className="text-xs font-bold text-slate-300 uppercase tracking-wide mb-1">Rationale</div>
                                            <p className="text-sm text-slate-200">{suggestion.rationale}</p>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-slate-900/80 border-t border-slate-800 flex gap-2 relative z-10">
                                        {onApplySuggestion && (
                                            <button
                                                onClick={() => onApplySuggestion(suggestion)}
                                                className="flex-1 flex items-center justify-center gap-2 py-2 bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-500 hover:to-cyan-500 text-slate-900 rounded-lg font-bold text-sm transition-colors shadow-lg shadow-cyan-400/30"
                                            >
                                                <Check size={16} />
                                                Apply Change
                                            </button>
                                        )}
                                        <button className="px-4 py-2 bg-slate-800 border border-slate-700 text-slate-200 rounded-lg font-bold text-sm hover:border-teal-400/40 hover:text-teal-200 transition-colors">
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

// Helper Components
const StatCard: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
    <div className="relative group bg-slate-900/70 backdrop-blur-xl rounded-xl border border-slate-800 shadow-xl shadow-black/30 p-4 overflow-hidden">
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-teal-500/12 via-cyan-500/8 to-emerald-400/8 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <div className="absolute inset-x-4 top-0 h-[2px] bg-gradient-to-r from-transparent via-teal-400 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
        <div className="relative z-10">
            <div className="flex items-center gap-2 text-slate-300 mb-2">
                {icon}
                <span className="text-xs font-bold uppercase tracking-wide">{label}</span>
            </div>
            <div className="text-2xl font-black text-slate-50">{value}</div>
        </div>
    </div>
);

const ProfileRow: React.FC<{ label: string; value: string; confidence?: number }> = ({ label, value, confidence }) => (
    <div className="flex justify-between items-center">
        <span className="text-sm text-slate-500">{label}</span>
        <div className="flex items-center gap-2">
            <span className="text-sm font-bold text-slate-900 capitalize">{value}</span>
            {confidence !== undefined && (
                <span className="text-xs text-slate-400">({Math.round(confidence * 100)}%)</span>
            )}
        </div>
    </div>
);

export default ContentIntelligencePanel;
