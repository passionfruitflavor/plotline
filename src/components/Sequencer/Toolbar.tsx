"use client";

import React, { useRef, useState } from 'react';
import { useStoryStore } from '@/store/storyStore';
import { useTutorialStore } from '@/store/tutorialStore';
import { useI18n } from '@/lib/i18n';
import { STORAGE_KEYS } from '@/lib/constants';
import LanguageSelector from '@/components/LanguageSelector';
import ApiKeySettings from '@/components/ApiKeySettings';

const Toolbar: React.FC = () => {
    const { t } = useI18n();
    const exportStory = useStoryStore(state => state.exportStory);
    const loadStory = useStoryStore(state => state.loadStory);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);

    const handleExport = () => {
        const json = exportStory();
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `story-${new Date().toISOString().slice(0, 10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            if (content) {
                loadStory(content);
            }
        };
        reader.readAsText(file);
        e.target.value = '';
    };

    const handleReset = () => {
        if (confirm(t('toolbar.resetConfirm'))) {
            localStorage.removeItem(STORAGE_KEYS.STORY);
            window.location.reload();
        }
    };

    return (
        <div className="h-12 bg-app-secondary border-b border-app flex items-center px-4 space-x-4">
            <div className="mr-4">
                <h1 className="text-app font-bold text-base leading-tight">{t('toolbar.title')}</h1>
                <p className="text-app-muted text-[10px] leading-tight">{t('toolbar.subtitle')}</p>
            </div>

            <button
                onClick={handleExport}
                className="px-3 py-1.5 bg-app-hover hover:bg-app-border-light text-app text-xs rounded transition-colors"
            >
                {t('toolbar.save')}
            </button>
            <button
                onClick={handleImportClick}
                className="px-3 py-1.5 bg-app-hover hover:bg-app-border-light text-app text-xs rounded transition-colors"
            >
                {t('toolbar.open')}
            </button>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json"
                className="hidden"
            />

            <div className="flex-1"></div>

            <button
                data-tutorial="ai-settings"
                onClick={() => setIsSettingsOpen(true)}
                className="px-3 py-1.5 bg-app-hover hover:bg-app-border-light text-app text-xs rounded transition-colors"
                title={t('settings.apiKey')}
            >
                ⚙️ {t('settings.title')}
            </button>

            <button
                onClick={() => useTutorialStore.getState().startTutorial()}
                className="px-3 py-1.5 bg-app-hover hover:bg-app-border-light text-app text-xs rounded transition-colors"
                title={t('toolbar.help')}
            >
                ❓ Help
            </button>

            <LanguageSelector />

            <button
                onClick={handleReset}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors shadow-sm"
            >
                {t('toolbar.resetData')}
            </button>

            <ApiKeySettings isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
        </div>
    );
};

export default Toolbar;
