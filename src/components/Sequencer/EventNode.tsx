import React from 'react';
import { Event, TimeType } from '@/types/story';
import { useI18n } from '@/lib/i18n';

interface EventNodeProps {
    event: Event;
    color: string;
    isSelected?: boolean;
    onClick?: () => void;
}

// Get styling based on time_type
const getTimeTypeStyles = (timeType?: TimeType): { className: string; opacity: number } => {
    switch (timeType) {
        case 'flashback':
            return { className: 'border-dashed border-2', opacity: 0.6 };
        case 'flash_forward':
            return { className: 'border-double border-4', opacity: 0.8 };
        case 'memory':
            return { className: 'border-dotted border-2', opacity: 0.7 };
        case 'present':
        default:
            return { className: 'border-solid border', opacity: 1 };
    }
};

const EventNode: React.FC<EventNodeProps> = ({ event, color, isSelected, onClick }) => {
    const { t } = useI18n();
    const timeTypeStyles = getTimeTypeStyles(event.time_type);

    const style = {
        opacity: timeTypeStyles.opacity,
        zIndex: isSelected ? 50 : 'auto',
    };

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        onClick?.();
    };

    // Format any value to string (handles nested objects)
    const formatValue = (value: unknown): string => {
        if (value === null || value === undefined) return '';
        if (typeof value === 'object') {
            return JSON.stringify(value);
        }
        return String(value);
    };

    // Format state_change for display
    const formatStateChange = () => {
        if (!event.state_change || Object.keys(event.state_change).length === 0) {
            return null;
        }
        return Object.entries(event.state_change)
            .map(([key, value]) => `${key}: ${formatValue(value)}`)
            .join(', ');
    };

    const stateChangeText = formatStateChange();
    const hasDetails = event.dialogue || stateChangeText || event.item_changes || event.knowledge_changes || event.location;

    return (
        <div
            style={style}
            className="relative w-full h-full group"
            onClick={handleClick}
        >
            {/* Time Type Indicator */}
            {event.time_type && event.time_type !== 'present' && (
                <div className="absolute -top-1 -right-1 z-10">
                    <span className="text-[10px] bg-app-primary text-app-subtle px-1 rounded">
                        {event.time_type === 'flashback' && '過去'}
                        {event.time_type === 'flash_forward' && '未来'}
                        {event.time_type === 'memory' && '記憶'}
                    </span>
                </div>
            )}

            {/* Narrative Position Marker */}
            {event.narrative_position && (
                <div className="absolute -top-1 -right-1 z-10">
                    <span
                        className="text-[10px] bg-amber-600 text-white w-4 h-4 rounded-full flex items-center justify-center font-bold shadow"
                        title={`物語内で${event.narrative_position}番目に語られる`}
                    >
                        {event.narrative_position}
                    </span>
                </div>
            )}

            {/* Dialogue Bubble on Hover */}
            {event.dialogue && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-max max-w-[200px] z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    <div className="bg-white text-black text-xs p-2 rounded-lg shadow-lg border border-gray-300 relative">
                        「{event.dialogue}」
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-8 border-transparent border-t-white"></div>
                    </div>
                </div>
            )}

            {/* Details Panel - shown when selected */}
            {isSelected && hasDetails && (
                <div className="absolute left-full top-0 ml-2 w-48 z-[100] pointer-events-none">
                    <div className="bg-app-primary text-app-subtle text-xs p-3 rounded-lg shadow-lg border border-app-light">

                        {/* Action (Description) */}
                        <div className="font-bold text-app mb-2 border-b border-app-light pb-1">
                            {event.description}
                        </div>

                        {/* Time */}
                        {event.estimated_time && (
                            <div className="mb-1.5">
                                <span className="text-app-subtle">{t('eventDetails.time')}</span> {event.estimated_time}
                            </div>
                        )}

                        {/* Location */}
                        {event.location && (
                            <div className="mb-1.5">
                                <span className="text-app-subtle">{t('eventDetails.location')}</span> {event.location}
                            </div>
                        )}

                        {/* Dialogue */}
                        {event.dialogue && (
                            <div className="mb-1.5">
                                <span className="text-app-subtle">{t('eventDetails.dialogue')}</span>
                                <div className="ml-2 italic">「{event.dialogue}」</div>
                            </div>
                        )}

                        {/* Changes (includes state, items, knowledge changes) */}
                        {(stateChangeText || event.item_changes || event.knowledge_changes) && (
                            <div className="mb-1.5">
                                <span className="text-app-subtle">{t('eventDetails.stateChange')}</span>
                                {stateChangeText && (
                                    <div className="ml-2 text-purple-600">
                                        {t('eventDetails.state')} {stateChangeText}
                                    </div>
                                )}
                                {event.item_changes && (
                                    <div className="ml-2 text-fuchsia-600">
                                        {t('eventDetails.inventory')}
                                        {event.item_changes.add && (
                                            <span> +{event.item_changes.add.join(', ')}</span>
                                        )}
                                        {event.item_changes.remove && (
                                            <span className="text-red-500"> -{event.item_changes.remove.join(', ')}</span>
                                        )}
                                    </div>
                                )}
                                {event.knowledge_changes && (
                                    <div className="ml-2 text-lime-600">
                                        {t('eventDetails.info')}
                                        {event.knowledge_changes.add && (
                                            <span> +{event.knowledge_changes.add.join(', ')}</span>
                                        )}
                                        {event.knowledge_changes.remove && (
                                            <span className="text-red-500"> -{event.knowledge_changes.remove.join(', ')}</span>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Current State Section */}
                        {(event.cumulative_state && Object.keys(event.cumulative_state).length > 0) ||
                            (event.cumulative_inventory && event.cumulative_inventory.length > 0) ||
                            (event.cumulative_knowledge && event.cumulative_knowledge.length > 0) ? (
                            <div className="mt-2 pt-2 border-t border-app-light">
                                <div className="font-semibold text-app-subtle mb-1">{t('eventDetails.currentState')}</div>
                                {event.cumulative_state && Object.keys(event.cumulative_state).length > 0 && (
                                    <div className="ml-2 text-purple-600 mb-1">
                                        {t('eventDetails.state')} {Object.entries(event.cumulative_state).map(([key, value], idx, arr) => (
                                            <span key={key}>
                                                {key}: {formatValue(value)}
                                                {idx < arr.length - 1 ? ', ' : ''}
                                            </span>
                                        ))}
                                    </div>
                                )}
                                {event.cumulative_inventory && event.cumulative_inventory.length > 0 && (
                                    <div className="ml-2 text-fuchsia-600">
                                        {t('eventDetails.inventory')} {event.cumulative_inventory.join(', ')}
                                    </div>
                                )}
                                {event.cumulative_knowledge && event.cumulative_knowledge.length > 0 && (
                                    <div className="ml-2 text-lime-600">
                                        {t('eventDetails.info')} {event.cumulative_knowledge.join(', ')}
                                    </div>
                                )}
                            </div>
                        ) : null}
                    </div>
                </div>
            )}

            {/* Event Node */}
            <div
                className={`absolute top-1 bottom-1 left-1 right-1 rounded-md shadow-md flex items-center justify-center p-1 border-white/40 overflow-hidden cursor-pointer ${timeTypeStyles.className} ${event.time_type === 'flashback' ? 'italic' : ''} ${isSelected ? 'ring-2 ring-app-accent ring-offset-1 ring-offset-app-secondary' : ''}`}
                style={{ backgroundColor: color }}
                title="クリックで選択 / 詳細表示"
            >
                <span className="text-xs font-medium text-slate-900 text-center leading-tight line-clamp-3 select-none">
                    {event.description}
                </span>
            </div>
        </div>
    );
};

export default EventNode;
