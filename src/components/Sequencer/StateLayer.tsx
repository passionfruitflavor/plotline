import React from 'react';
import { Character, Event } from '@/types/story';
import { useI18n } from '@/lib/i18n';

interface StateLayerProps {
    characters: Character[];
    events: Event[];
    cellWidth: number;
    cellHeight: number;
    steps: number;
    trackHeight: number;
}

const StateLayer: React.FC<StateLayerProps> = ({
    characters,
    events,
    cellWidth,
    cellHeight,
    steps,
    trackHeight
}) => {
    const { t } = useI18n();

    return (
        <div className="absolute inset-0 pointer-events-none">
            {characters.map((char, index) => {
                // Calculate state segments
                const segments = [];
                let currentState = { ...char.initial_state };
                let currentInventory = [...char.inventory];
                let currentKnowledge = [...char.knowledge];
                let lastTime = 0;

                // Helper to check if anything changed
                const hasChanges = (event: Event) =>
                    event.state_change || event.item_changes || event.knowledge_changes;

                // Get all events that cause changes
                const changeEvents = events
                    .filter(e => e.character_id === char.id && hasChanges(e))
                    .sort((a, b) => a.time_step - b.time_step);

                changeEvents.forEach(event => {
                    // Push previous segment
                    segments.push({
                        start: lastTime,
                        end: event.time_step,
                        state: { ...currentState },
                        inventory: [...currentInventory],
                        knowledge: [...currentKnowledge]
                    });

                    // Update state
                    if (event.state_change) currentState = { ...currentState, ...event.state_change };

                    // Update items
                    if (event.item_changes) {
                        if (event.item_changes.add) currentInventory.push(...event.item_changes.add);
                        if (event.item_changes.remove) {
                            currentInventory = currentInventory.filter(i => !event.item_changes!.remove!.includes(i));
                        }
                    }

                    // Update knowledge
                    if (event.knowledge_changes) {
                        if (event.knowledge_changes.add) currentKnowledge.push(...event.knowledge_changes.add);
                        if (event.knowledge_changes.remove) {
                            currentKnowledge = currentKnowledge.filter(k => !event.knowledge_changes!.remove!.includes(k));
                        }
                    }

                    lastTime = event.time_step;
                });

                // Add final segment
                segments.push({
                    start: lastTime,
                    end: steps,
                    state: { ...currentState },
                    inventory: [...currentInventory],
                    knowledge: [...currentKnowledge]
                });

                return (
                    <div
                        key={char.id}
                        className="absolute w-full flex items-end pb-1"
                        style={{
                            top: (index * trackHeight) + (trackHeight - cellHeight), // Position at bottom of track
                            height: cellHeight,
                        }}
                    >
                        {segments.map((seg, i) => (
                            <div
                                key={i}
                                className="absolute bottom-0 h-full flex flex-col justify-center px-2 text-[10px] text-app-muted overflow-hidden whitespace-nowrap"
                                style={{
                                    left: seg.start * cellWidth,
                                    width: (seg.end - seg.start) * cellWidth,
                                }}
                            >
                                <div className="text-purple-600 font-medium">{t('state.state')} {Object.entries(seg.state).map(([k, v]) => `${k}: ${v}`).join(', ')}</div>
                                {seg.inventory.length > 0 && <div className="text-fuchsia-600">{t('state.items')} {seg.inventory.join(', ')}</div>}
                                {seg.knowledge.length > 0 && <div className="text-lime-600">{t('state.info')} {seg.knowledge.join(', ')}</div>}
                            </div>
                        ))}
                    </div>
                );
            })}
        </div>
    );
};

export default StateLayer;
