'use client';

import { create } from 'zustand';

interface ApiKeyState {
    apiKey: string | null;
    setApiKey: (key: string) => void;
    clearApiKey: () => void;
}

/**
 * API Key store - Memory only (no localStorage/sessionStorage)
 * User can use browser's password manager for persistence
 */
export const useApiKeyStore = create<ApiKeyState>((set) => ({
    apiKey: null,

    setApiKey: (key: string) => {
        const trimmedKey = key.trim();
        set({ apiKey: trimmedKey });
    },

    clearApiKey: () => {
        set({ apiKey: null });
    },
}));

// Helper to get API key (for use in non-component code)
export const getApiKey = (): string | null => {
    return useApiKeyStore.getState().apiKey;
};
