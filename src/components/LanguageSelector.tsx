'use client';

import React from 'react';
import { useI18n, Locale, LOCALES } from '@/lib/i18n';

const LOCALE_LABELS: Record<Locale, string> = {
    ja: '🌐 日本語',
    en: '🌐 English',
};

/**
 * Language selector dropdown component
 */
const LanguageSelector: React.FC = () => {
    const { locale, setLocale, t } = useI18n();

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setLocale(e.target.value as Locale);
    };

    return (
        <select
            value={locale}
            onChange={handleChange}
            className="bg-app-hover hover:bg-app-border-light text-app text-xs px-2 py-1.5 rounded border-none cursor-pointer focus:outline-none focus:ring-1 focus:ring-app-accent"
            title={t('language.label')}
        >
            {LOCALES.map((loc) => (
                <option key={loc} value={loc}>
                    {LOCALE_LABELS[loc]}
                </option>
            ))}
        </select>
    );
};

export default LanguageSelector;
