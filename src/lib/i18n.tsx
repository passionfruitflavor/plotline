'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Import translations
import ja from '@/locales/ja.json';
import en from '@/locales/en.json';

// Supported locales
export const LOCALES = ['ja', 'en'] as const;
export type Locale = typeof LOCALES[number];

// Type for translation keys (nested object access)
type TranslationValue = string | { [key: string]: TranslationValue };
type Translations = { [key: string]: TranslationValue };

const translations: Record<Locale, Translations> = { ja, en };

interface LanguageContextType {
    locale: Locale;
    language: Locale; // Alias for locale, for API calls
    setLocale: (locale: Locale) => void;
    t: (key: string, params?: Record<string, string | number>) => string;
    locales: typeof LOCALES;
}

const LanguageContext = createContext<LanguageContextType | null>(null);

const STORAGE_KEY = 'story-sequencer-locale';

/**
 * Get nested value from object using dot notation
 * e.g., "toolbar.save" -> translations.toolbar.save
 */
function getNestedValue(obj: Translations, path: string): string | undefined {
    const keys = path.split('.');
    let current: TranslationValue = obj;

    for (const key of keys) {
        if (typeof current === 'object' && current !== null && key in current) {
            current = current[key];
        } else {
            return undefined;
        }
    }

    return typeof current === 'string' ? current : undefined;
}

/**
 * Replace placeholders in string with values
 * e.g., "{chars} 文字" with {chars: 100} -> "100 文字"
 */
function interpolate(str: string, params?: Record<string, string | number>): string {
    if (!params) return str;
    return str.replace(/\{(\w+)\}/g, (_, key) => String(params[key] ?? `{${key}}`));
}

interface LanguageProviderProps {
    children: ReactNode;
    defaultLocale?: Locale;
}

export function LanguageProvider({ children, defaultLocale = 'ja' }: LanguageProviderProps) {
    const [locale, setLocaleState] = useState<Locale>(defaultLocale);
    const [mounted, setMounted] = useState(false);

    // Load saved locale on mount
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY) as Locale | null;
        if (saved && LOCALES.includes(saved)) {
            setLocaleState(saved);
        }
        setMounted(true);
    }, []);

    // Persist locale changes
    const setLocale = (newLocale: Locale) => {
        setLocaleState(newLocale);
        localStorage.setItem(STORAGE_KEY, newLocale);
    };

    // Translation function
    const t = (key: string, params?: Record<string, string | number>): string => {
        const value = getNestedValue(translations[locale], key);
        if (value === undefined) {
            console.warn(`Translation missing: ${key} for locale: ${locale}`);
            // Fallback to Japanese, then to key itself
            return getNestedValue(translations.ja, key) ?? key;
        }
        return interpolate(value, params);
    };

    // Prevent hydration mismatch by rendering default until mounted
    if (!mounted) {
        return (
            <LanguageContext.Provider value={{ locale: defaultLocale, language: defaultLocale, setLocale, t, locales: LOCALES }}>
                {children}
            </LanguageContext.Provider>
        );
    }

    return (
        <LanguageContext.Provider value={{ locale, language: locale, setLocale, t, locales: LOCALES }}>
            {children}
        </LanguageContext.Provider>
    );
}

/**
 * Hook to access i18n functionality
 */
export function useI18n() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useI18n must be used within a LanguageProvider');
    }
    return context;
}

export default LanguageProvider;
