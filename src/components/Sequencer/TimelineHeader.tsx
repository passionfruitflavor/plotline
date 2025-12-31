"use client";

import { useStoryStore } from '@/store/storyStore';
import { TimeStep } from '@/types/story';

// Format timestamp for display
const formatTimestamp = (timestamp?: string): string | null => {
    if (!timestamp) return null;
    try {
        const date = new Date(timestamp);
        if (timestamp.includes('T')) {
            return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
        }
        return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`;
    } catch {
        return null;
    }
};

// Calculate time gap between two timestamps
const getTimeGap = (prevTimestamp?: string, currTimestamp?: string): { days: number; label: string } | null => {
    if (!prevTimestamp || !currTimestamp) return null;
    try {
        const prev = new Date(prevTimestamp);
        const curr = new Date(currTimestamp);
        const diffMs = curr.getTime() - prev.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffDays >= 365) {
            return { days: diffDays, label: `${Math.floor(diffDays / 365)}年後` };
        } else if (diffDays >= 30) {
            return { days: diffDays, label: `${Math.floor(diffDays / 30)}ヶ月後` };
        } else if (diffDays >= 1) {
            return { days: diffDays, label: `${diffDays}日後` };
        }
        return null;
    } catch {
        return null;
    }
};

interface TimelineHeaderProps {
    scrollLeft: number;
}

const TimelineHeader: React.FC<TimelineHeaderProps> = ({ scrollLeft }) => {
    const timeline = useStoryStore(state => state.story.timeline);
    const cellWidth = 96;

    const stepsToRender: TimeStep[] = timeline.length > 0
        ? timeline
        : Array.from({ length: 20 }, (_, i) => ({ step: i, label: `Scene ${i + 1}` }));

    const hasTimestamps = stepsToRender.some(step => step.timestamp);

    return (
        <div className={`flex ${hasTimestamps ? 'h-14' : 'h-8'} bg-app-primary border-b border-app sticky top-0 z-20`}>
            {/* Spacer to match TrackHeader width */}
            <div className="w-48 flex-shrink-0 border-r border-app bg-app-primary"></div>

            {/* Timeline content - scrolls with grid */}
            <div className="flex-1 overflow-hidden">
                <div
                    className="flex"
                    style={{ transform: `translateX(-${scrollLeft}px)` }}
                >
                    {stepsToRender.map((step, index) => {
                        const prevStep = index > 0 ? stepsToRender[index - 1] : null;
                        const gap = prevStep ? getTimeGap(prevStep.timestamp, step.timestamp) : null;
                        const showGap = gap && gap.days >= 1;
                        const formattedTime = formatTimestamp(step.timestamp);

                        return (
                            <div
                                key={step.step}
                                className="flex-shrink-0 border-r border-app flex flex-col justify-center relative"
                                style={{ width: `${cellWidth}px` }}
                            >
                                {showGap && (
                                    <div
                                        className="absolute left-0 top-0 bottom-0 flex items-center -translate-x-1/2 z-10"
                                        title={`${gap.label}経過`}
                                    >
                                        <div className="flex flex-col items-center">
                                            <div className="w-0.5 h-2 bg-amber-500"></div>
                                            <div className="bg-amber-500 text-white text-[8px] px-1 py-0.5 rounded whitespace-nowrap font-bold shadow">
                                                {gap.label}
                                            </div>
                                            <div className="w-0.5 h-2 bg-amber-500"></div>
                                        </div>
                                    </div>
                                )}

                                {hasTimestamps && (
                                    <div className="text-[10px] text-app-dim text-center truncate px-1">
                                        {formattedTime || '-'}
                                    </div>
                                )}

                                <div className="text-xs text-app-subtle text-center truncate px-1 font-medium">
                                    {step.label}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default TimelineHeader;
