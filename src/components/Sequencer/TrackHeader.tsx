"use client";

import React from 'react';
import { useStoryStore } from '@/store/storyStore';
import { useI18n } from '@/lib/i18n';

interface TrackHeaderProps {
    scrollTop?: number;
}

const TrackHeader: React.FC<TrackHeaderProps> = ({ scrollTop = 0 }) => {
    const { t } = useI18n();
    const characters = useStoryStore(state => state.story.characters);

    return (
        <div className="w-48 flex-shrink-0 bg-app-primary border-r border-app flex flex-col overflow-hidden">
            {/* Track content - synced with vertical scroll */}
            <div
                className="flex-1"
                style={{ transform: `translateY(-${scrollTop}px)` }}
            >
                {characters.map((char) => (
                    <div
                        key={char.id}
                        className="h-[144px] border-b border-app flex flex-col justify-center px-4 text-sm font-medium text-app-subtle"
                    >
                        <div className="flex items-center mb-2">
                            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: char.color }}></div>
                            <span className="flex-1">{char.name}</span>
                        </div>
                        <div className="text-[10px] text-app-subtle flex flex-col space-y-[32px]">
                            <div>{t('track.location')}</div>
                            <div>{t('track.action')}</div>
                            <div>{t('track.stateInvInfo')}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default TrackHeader;

