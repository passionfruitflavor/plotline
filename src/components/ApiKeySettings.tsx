'use client';

import React, { useState, useEffect } from 'react';
import { useApiKeyStore } from '@/store/apiKeyStore';
import { useAIModelStore, AI_MODELS } from '@/store/aiModelStore';
import { testApiKey } from '@/lib/aiClient';
import { useI18n } from '@/lib/i18n';

interface ApiKeySettingsProps {
    isOpen: boolean;
    onClose: () => void;
}

const ApiKeySettings: React.FC<ApiKeySettingsProps> = ({ isOpen, onClose }) => {
    const { t } = useI18n();
    const { apiKey, setApiKey, clearApiKey } = useApiKeyStore();
    const { selectedModelId, setSelectedModelId } = useAIModelStore();

    const [inputKey, setInputKey] = useState('');
    const [isTesting, setIsTesting] = useState(false);
    const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

    useEffect(() => {
        if (isOpen) {
            setInputKey(apiKey || '');
        }
    }, [apiKey, isOpen]);

    if (!isOpen) return null;

    const handleSave = () => {
        if (inputKey.trim()) {
            setApiKey(inputKey.trim());
            setTestResult({ success: true, message: t('settings.saved') || 'Saved!' });
        }
    };

    const handleTest = async () => {
        if (!inputKey.trim()) return;

        setIsTesting(true);
        setTestResult(null);

        const result = await testApiKey(inputKey.trim());

        setIsTesting(false);
        setTestResult({
            success: result.valid,
            message: result.valid ? (t('settings.testSuccess') || '✓ Valid') : (result.error || 'Invalid key'),
        });
    };

    const handleDelete = () => {
        clearApiKey();
        setInputKey('');
        setTestResult(null);
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]"
            onClick={handleBackdropClick}
        >
            <div className="bg-app-primary rounded-lg shadow-xl w-full max-w-md mx-4 p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold text-app">
                        ⚙️ {t('settings.title')}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-app-muted hover:text-app text-xl"
                    >
                        ×
                    </button>
                </div>

                {/* API Key Input - Form for password manager */}
                <form onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
                    {/* Hidden username field for password manager */}
                    <input
                        type="text"
                        name="username"
                        defaultValue="Plotline-APIKey"
                        autoComplete="username"
                        style={{ position: 'absolute', left: '-9999px' }}
                        tabIndex={-1}
                        aria-hidden="true"
                    />
                    <label className="block text-sm font-medium text-app mb-2">
                        {t('settings.apiKey')}
                    </label>
                    <div className="mb-2">
                        <input
                            type="password"
                            value={inputKey}
                            onChange={(e) => setInputKey(e.target.value)}
                            placeholder={t('settings.apiKeyPlaceholder')}
                            autoComplete="current-password"
                            className="w-full px-3 py-2 bg-app-secondary border border-app-light rounded text-app text-sm focus:outline-none focus:border-app-accent"
                        />
                    </div>

                    {/* Help Link - Right below input */}
                    <div className="mb-4">
                        <a
                            href="https://aistudio.google.com/app/apikey"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-app-accent hover:underline flex items-center gap-1"
                        >
                            🔗 {t('settings.apiKeyHelp')}
                        </a>
                    </div>

                    {/* Test Result */}
                    {testResult && (
                        <div className={`mb-4 p-2 rounded text-sm ${testResult.success
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                            }`}>
                            {testResult.message}
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 mb-4">
                        <button
                            type="button"
                            onClick={handleTest}
                            disabled={!inputKey.trim() || isTesting}
                            className="flex-1 px-3 py-2 bg-app-hover hover:bg-app-border-light text-app text-sm rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isTesting ? '...' : t('settings.testConnection')}
                        </button>
                        <button
                            type="submit"
                            disabled={!inputKey.trim()}
                            className="flex-1 px-3 py-2 bg-app-accent hover:bg-app-accent-hover text-white text-sm rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {t('settings.setApiKey')}
                        </button>
                    </div>
                </form>

                {/* Delete Button */}
                {apiKey && (
                    <button
                        onClick={handleDelete}
                        className="w-full px-3 py-2 text-red-600 hover:bg-red-50 text-sm rounded border border-red-200"
                    >
                        🗑️ {t('settings.deleteApiKey')}
                    </button>
                )}

                {/* Model Selection */}
                <div className="mt-4 pt-4 border-t border-app-light">
                    <label className="block text-sm font-medium text-app mb-2">
                        {t('settings.model')}
                    </label>
                    <select
                        value={selectedModelId}
                        onChange={(e) => setSelectedModelId(e.target.value)}
                        className="w-full px-3 py-2 bg-app-secondary border border-app-light rounded text-app text-sm focus:outline-none focus:border-app-accent"
                    >
                        {AI_MODELS.map((model) => (
                            <option key={model.id} value={model.id}>
                                {model.name} - {model.description}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Privacy Notice */}
                <div className="mt-4 pt-4 border-t border-app-light">
                    <p className="text-sm font-medium text-app mb-2">
                        {t('settings.privacyTitle')}
                    </p>
                    <p className="text-xs text-app-muted mb-2">
                        {t('settings.privacyNotice1')}
                    </p>
                    <p className="text-xs text-app-muted mb-3">
                        {t('settings.privacyNotice2')}
                    </p>
                    <p className="text-xs text-app-accent">
                        💡 {t('settings.privacyHint')}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ApiKeySettings;
