'use client';

import { create } from 'zustand';

export interface AIModel {
    id: string;
    name: string;
    description: string;
}

export const AI_MODELS: AIModel[] = [
    {
        id: 'gemini-2.5-flash',
        name: 'Gemini 2.5 Flash',
        description: '高速・推奨'
    },
    {
        id: 'gemini-2.5-pro',
        name: 'Gemini 2.5 Pro',
        description: '高品質・クォータ制限あり'
    },
    {
        id: 'gemini-2.5-flash-lite',
        name: 'Gemini 2.5 Flash Lite',
        description: '最速・最軽量'
    },
    {
        id: 'gemini-3-pro-preview',
        name: 'Gemini 3 Pro (Preview)',
        description: '最新・最高性能'
    },
    {
        id: 'gemini-3-flash-preview',
        name: 'Gemini 3 Flash (Preview)',
        description: '最新・高速'
    }
];

export const DEFAULT_MODEL_ID = 'gemini-2.5-flash';

interface AIModelState {
    selectedModelId: string;
    setSelectedModelId: (modelId: string) => void;
}

export const useAIModelStore = create<AIModelState>((set) => ({
    selectedModelId: DEFAULT_MODEL_ID,
    setSelectedModelId: (modelId: string) => set({ selectedModelId: modelId }),
}));

// Helper to get current model ID
export const getSelectedModelId = (): string => {
    return useAIModelStore.getState().selectedModelId;
};
