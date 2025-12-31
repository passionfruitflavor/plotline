'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useStoryStore } from '@/store/storyStore';
import { useNarrativeGeneration } from '@/hooks/useNarrativeGeneration';
import { usePanelResize } from '@/hooks/usePanelResize';
import { useI18n } from '@/lib/i18n';
import ApiKeySettings from '@/components/ApiKeySettings';

interface NarrativeEditorProps {
    isOpen: boolean;
    onToggle: () => void;
}

const NarrativeEditor: React.FC<NarrativeEditorProps> = ({ isOpen, onToggle }) => {
    const story = useStoryStore(state => state.story);
    const selectedEventId = useStoryStore(state => state.selectedEventId);
    const updateNarrative = useStoryStore(state => state.updateNarrative);
    const events = story.events;

    // Use the extracted hook for AI generation
    const { isGenerating, error, isApiKeyError, generateSequence } = useNarrativeGeneration();
    const { t } = useI18n();
    const [isApiKeySettingsOpen, setIsApiKeySettingsOpen] = useState(false);

    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState('');
    const { panelWidth, handleResizeStart } = usePanelResize({ initialWidth: 320 });

    const highlightRef = useRef<HTMLSpanElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const narrativeText = story.narrative?.text || '';
    const hasNarrative = narrativeText.length > 0;
    const selectedEvent = events.find(e => e.id === selectedEventId);

    // Auto-scroll to highlighted section when event is selected
    useEffect(() => {
        if (highlightRef.current && contentRef.current) {
            highlightRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [selectedEventId]);

    // Start editing
    const handleStartEdit = () => {
        setEditText(narrativeText);
        setIsEditing(true);
        setTimeout(() => textareaRef.current?.focus(), 0);
    };

    // Save narrative
    const handleSave = () => {
        updateNarrative(editText);
        setIsEditing(false);
    };

    // Cancel editing
    const handleCancel = () => {
        setIsEditing(false);
        setEditText('');
    };

    // Highlight text based on selected event's narrative_refs
    const getHighlightedText = () => {
        if (!narrativeText || !selectedEvent?.narrative_refs?.length) {
            return <span className="text-app-muted">{narrativeText || t('narrative.placeholder')}</span>;
        }

        const refs = [...selectedEvent.narrative_refs].sort((a, b) => {
            const sectionA = story.narrative?.sections.find(s => s.id === a.section_id);
            const sectionB = story.narrative?.sections.find(s => s.id === b.section_id);
            return (sectionA?.startOffset || 0) - (sectionB?.startOffset || 0);
        });

        const parts: React.ReactNode[] = [];
        let lastEnd = 0;

        refs.forEach((ref, idx) => {
            const section = story.narrative?.sections.find(s => s.id === ref.section_id);
            if (!section) return;

            if (section.startOffset > lastEnd) {
                parts.push(
                    <span key={`text-${idx}`}>
                        {narrativeText.slice(lastEnd, section.startOffset)}
                    </span>
                );
            }

            parts.push(
                <span key={`highlight-${idx}`} ref={idx === 0 ? highlightRef : undefined}>
                    <mark
                        className="bg-yellow-300/50 px-0.5 rounded"
                        title={`Confidence: ${Math.round(ref.confidence * 100)}%`}
                    >
                        {narrativeText.slice(section.startOffset, section.endOffset)}
                    </mark>
                </span>
            );

            lastEnd = section.endOffset;
        });

        if (lastEnd < narrativeText.length) {
            parts.push(
                <span key="text-end">{narrativeText.slice(lastEnd)}</span>
            );
        }

        return parts;
    };

    if (!isOpen) {
        return (
            <button
                onClick={onToggle}
                className="h-full w-8 bg-app-primary hover:bg-app-hover text-app flex items-center justify-center flex-shrink-0 transition-all duration-200 border-r border-app-light hover:w-10 group"
                title={t('narrative.openPanel')}
            >
                <span
                    className="text-sm font-semibold tracking-wider group-hover:scale-110 transition-transform"
                    style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
                >
                    📖 {t('narrative.title')}
                </span>
            </button>
        );
    }

    return (
        <>
            <div
                data-tutorial="narrative-panel"
                className="bg-app-primary border-r border-app flex flex-col h-full flex-shrink-0 relative shadow-[4px_0_12px_-2px_rgba(0,0,0,0.1)] z-10"
                style={{ width: panelWidth }}
            >
                {/* Resize Handle */}
                <div
                    onMouseDown={handleResizeStart}
                    className="absolute right-0 top-0 bottom-0 w-1.5 cursor-ew-resize bg-app-tertiary hover:bg-blue-400 transition-colors z-20 flex flex-col justify-center items-center gap-1 opacity-80 hover:opacity-100"
                    title={t('narrative.dragToResize')}
                >
                    {/* Grip indicator dots */}
                    <div className="w-0.5 h-0.5 rounded-full bg-app-muted/50" />
                    <div className="w-0.5 h-0.5 rounded-full bg-app-muted/50" />
                    <div className="w-0.5 h-0.5 rounded-full bg-app-muted/50" />
                </div>
                {/* Header */}
                <div className="flex items-center justify-between p-3 border-b border-app">
                    <span className="text-sm font-semibold text-app">{t('narrative.title')}</span>
                    <div className="flex gap-1">
                        {!isEditing && (
                            <button
                                data-tutorial="edit-button"
                                onClick={handleStartEdit}
                                className="text-[10px] bg-app-hover hover:bg-app-border-light text-app px-2 py-1 rounded flex items-center gap-1"
                                title="Edit narrative"
                            >
                                {t('narrative.edit')}
                            </button>
                        )}
                        <button
                            onClick={onToggle}
                            className="text-[10px] bg-app-hover hover:bg-app-border-light text-app-muted hover:text-app px-2 py-1 rounded"
                            title="パネルを隠す"
                        >
                            {t('narrative.hidePanel')}
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div ref={contentRef} className="flex-1 overflow-auto p-3">

                    {isEditing ? (
                        <div className="flex flex-col gap-2 h-full">
                            <textarea
                                ref={textareaRef}
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="flex-1 min-h-[200px] bg-app-secondary text-app-subtle text-sm p-2 rounded border border-app-light resize-none focus:outline-none focus:border-app-accent"
                                placeholder={t('narrative.textareaPlaceholder')}
                            />
                            <div className="flex gap-2 justify-end">
                                <button
                                    onClick={handleCancel}
                                    className="text-xs bg-app-hover hover:bg-app-border-light text-app px-3 py-1 rounded"
                                >
                                    {t('common.cancel')}
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="text-xs bg-green-600 hover:bg-green-500 text-white px-3 py-1 rounded"
                                >
                                    {t('common.save')}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="text-sm text-app-subtle whitespace-pre-wrap leading-relaxed">
                            {getHighlightedText()}
                        </div>
                    )}
                </div>

                {/* AI Generate Button (Moved to Bottom) */}
                {!isEditing && (
                    <div className="p-2 border-t border-app bg-app-tertiary/10">
                        <button
                            data-tutorial="generate-button"
                            onClick={generateSequence}
                            disabled={isGenerating || !hasNarrative}
                            className={`w-full py-2 px-3 rounded text-sm font-medium flex items-center justify-center gap-2 ${isGenerating || !hasNarrative
                                ? 'bg-app-tertiary text-app-muted cursor-not-allowed opacity-50'
                                : 'bg-app-accent hover:bg-app-accent-hover text-app shadow-sm'
                                }`}
                        >
                            {isGenerating ? (
                                <>
                                    <span className="animate-spin">⏳</span>
                                    {t('narrative.generating')}
                                </>
                            ) : (
                                <>
                                    {t('narrative.generateSequence')}
                                </>
                            )}
                        </button>
                        {error && (
                            <div className="mt-2 text-xs text-red-400 bg-red-900/30 p-2 rounded">
                                <p>{error}</p>
                                {isApiKeyError && (
                                    <button
                                        onClick={() => setIsApiKeySettingsOpen(true)}
                                        className="mt-2 px-3 py-1 bg-app-accent hover:bg-app-accent-hover text-white rounded text-xs"
                                    >
                                        🔑 {t('settings.apiKey')}
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* Footer with stats */}
                <div className="px-2 py-1 border-t border-app text-[10px] text-app-muted flex justify-between">
                    {hasNarrative ? (
                        <span>{t('narrative.stats', { chars: narrativeText.length, sections: story.narrative?.sections.length || 0 })}</span>
                    ) : (
                        <span>{t('narrative.enterText')}</span>
                    )}
                </div>
            </div>

            {/* API Key Settings Modal - Rendered outside panel for proper z-index */}
            <ApiKeySettings isOpen={isApiKeySettingsOpen} onClose={() => setIsApiKeySettingsOpen(false)} />
        </>
    );
};

export default NarrativeEditor;
