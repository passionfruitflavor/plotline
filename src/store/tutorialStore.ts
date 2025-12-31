'use client';

import { create } from 'zustand';
import { STORAGE_KEYS } from '@/lib/constants';

const TUTORIAL_COMPLETED_KEY = STORAGE_KEYS.TUTORIAL_COMPLETED;

export interface TutorialStep {
    id: string;
    targetSelector: string;
    titleJa: string;
    titleEn: string;
    descriptionJa: string;
    descriptionEn: string;
    position: 'top' | 'bottom' | 'left' | 'right';
}

export const TUTORIAL_STEPS: TutorialStep[] = [
    {
        id: 'narrative-panel',
        targetSelector: '[data-tutorial="narrative-panel"]',
        titleJa: 'Narrative パネル',
        titleEn: 'Narrative Panel',
        descriptionJa: 'ここにストーリーテキストを入力します。小説やシナリオを貼り付けてください。',
        descriptionEn: 'Enter your story text here. Paste your novel or script.',
        position: 'right',
    },
    {
        id: 'edit-button',
        targetSelector: '[data-tutorial="edit-button"]',
        titleJa: '編集ボタン',
        titleEn: 'Edit Button',
        descriptionJa: 'テキストを編集するにはこのボタンをクリックします。',
        descriptionEn: 'Click this button to edit the text.',
        position: 'bottom',
    },
    {
        id: 'generate-button',
        targetSelector: '[data-tutorial="generate-button"]',
        titleJa: 'シーケンス生成',
        titleEn: 'Generate Sequence',
        descriptionJa: 'AIがテキストからイベントとキャラクターを自動抽出します。',
        descriptionEn: 'AI will automatically extract events and characters from your text.',
        position: 'top',
    },
    {
        id: 'timeline',
        targetSelector: '[data-tutorial="timeline"]',
        titleJa: 'タイムライン',
        titleEn: 'Timeline',
        descriptionJa: '生成されたイベントがここに表示されます。ドラッグで移動できます。',
        descriptionEn: 'Generated events are displayed here. Drag to move them.',
        position: 'left',
    },
    {
        id: 'ai-settings',
        targetSelector: '[data-tutorial="ai-settings"]',
        titleJa: 'AI設定',
        titleEn: 'AI Settings',
        descriptionJa: 'APIキーとAIモデルの設定はここから行います。',
        descriptionEn: 'Configure your API key and AI model here.',
        position: 'bottom',
    },
];

interface TutorialState {
    isActive: boolean;
    currentStep: number;
    hasCompleted: boolean;
    startTutorial: () => void;
    nextStep: () => void;
    skipTutorial: () => void;
    checkFirstVisit: () => void;
}

export const useTutorialStore = create<TutorialState>((set, get) => ({
    isActive: false,
    currentStep: 0,
    hasCompleted: false,

    startTutorial: () => {
        set({ isActive: true, currentStep: 0 });
    },

    nextStep: () => {
        const { currentStep } = get();
        if (currentStep < TUTORIAL_STEPS.length - 1) {
            set({ currentStep: currentStep + 1 });
        } else {
            // Tutorial completed
            if (typeof window !== 'undefined') {
                localStorage.setItem(TUTORIAL_COMPLETED_KEY, 'true');
            }
            set({ isActive: false, hasCompleted: true });
        }
    },

    skipTutorial: () => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(TUTORIAL_COMPLETED_KEY, 'true');
        }
        set({ isActive: false, hasCompleted: true });
    },

    checkFirstVisit: () => {
        if (typeof window === 'undefined') return;

        const completed = localStorage.getItem(TUTORIAL_COMPLETED_KEY);
        if (!completed) {
            // First visit - start tutorial after a short delay
            setTimeout(() => {
                set({ isActive: true, currentStep: 0 });
            }, 1000);
        } else {
            set({ hasCompleted: true });
        }
    },
}));
