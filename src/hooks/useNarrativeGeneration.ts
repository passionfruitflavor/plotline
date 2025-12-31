'use client';

import { useState } from 'react';
import { useStoryStore } from '@/store/storyStore';
import { AIExtractedData, convertAIToStory } from '@/utils/convertAIToStory';
import { extractTimeline } from '@/lib/aiClient';
import { useI18n } from '@/lib/i18n';

interface UseNarrativeGenerationResult {
    isGenerating: boolean;
    error: string | null;
    isApiKeyError: boolean;
    generateSequence: () => Promise<void>;
    clearError: () => void;
}

/**
 * Hook for AI-powered narrative to sequence generation
 * Uses client-side AI calls (BYOK - Bring Your Own Key)
 */
export function useNarrativeGeneration(): UseNarrativeGenerationResult {
    const story = useStoryStore(state => state.story);
    const setStory = useStoryStore(state => state.setStory);
    const { language, t } = useI18n();

    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isApiKeyError, setIsApiKeyError] = useState(false);

    const narrativeText = story.narrative?.text || '';

    const generateSequence = async () => {
        if (!narrativeText.trim()) {
            setError(t('narrative.enterText'));
            setIsApiKeyError(false);
            return;
        }

        setIsGenerating(true);
        setError(null);
        setIsApiKeyError(false);

        try {
            // Use client-side AI call (direct browser to Google AI)
            const result = await extractTimeline(narrativeText, language);

            if (!result.success || !result.data) {
                // Handle specific error types
                if (result.error?.type === 'NO_API_KEY') {
                    setIsApiKeyError(true);
                    throw new Error(t('settings.apiKeyRequired'));
                }
                throw new Error(result.error?.message || 'Unknown error');
            }

            const data: AIExtractedData = result.data as AIExtractedData;
            const newStory = convertAIToStory(data, narrativeText, story);
            setStory(newStory);

        } catch (err) {
            console.error('Generation error:', err);
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setIsGenerating(false);
        }
    };

    const clearError = () => {
        setError(null);
        setIsApiKeyError(false);
    };

    return {
        isGenerating,
        error,
        isApiKeyError,
        generateSequence,
        clearError,
    };
}
