"use client";

import React from 'react';
import { Event, Character } from '@/types/story';
import EventNode from './EventNode';
import ConnectionLayer from './ConnectionLayer';
import StateLayer from './StateLayer';
import LocationLayer from './LocationLayer';

import { useStoryStore } from '@/store/storyStore';

const Grid: React.FC = () => {
    const story = useStoryStore(state => state.story);
    const selectedEventId = useStoryStore(state => state.selectedEventId);
    const setSelectedEventId = useStoryStore(state => state.setSelectedEventId);

    const cellWidth = 96; // 6rem = 96px
    const cellHeight = 48; // Height of a single sub-lane (Location, Action, State)
    const trackHeight = cellHeight * 3; // Total height for one character track

    if (!story) return <div className="p-4 text-white">Loading...</div>;

    const tracks = story.characters.length;
    const steps = story.timeline && story.timeline.length > 0 ? story.timeline.length : 20;

    const getTrackIndex = (charId: string) => story.characters.findIndex((c: Character) => c.id === charId);

    return (
        <div className="relative bg-app-secondary min-w-[max-content] min-h-full">
            <div
                className="grid relative"
                style={{
                    gridTemplateColumns: `repeat(${steps}, ${cellWidth}px)`,
                    gridTemplateRows: `repeat(${tracks}, ${trackHeight}px)`,
                }}
            >
                {/* Background Grid */}
                {Array.from({ length: tracks * steps }).map((_, i) => (
                    <div
                        key={i}
                        className="border-r border-b"
                        style={{
                            borderRightColor: '#e2e8f0',
                            borderBottomColor: '#cbd5e1'
                        }}
                    ></div>
                ))}

                {/* Location Layer (Top Lane) */}
                <LocationLayer
                    characters={story.characters}
                    events={story.events}
                    cellWidth={cellWidth}
                    cellHeight={cellHeight}
                    steps={steps}
                    trackHeight={trackHeight}
                />

                {/* State Layer (Bottom Lane) */}
                <StateLayer
                    characters={story.characters}
                    events={story.events}
                    cellWidth={cellWidth}
                    cellHeight={cellHeight}
                    steps={steps}
                    trackHeight={trackHeight}
                />

                {/* Connection Lines */}
                <ConnectionLayer
                    connections={story.connections}
                    events={story.events}
                    cellWidth={cellWidth}
                    cellHeight={cellHeight}
                    getTrackIndex={getTrackIndex}
                />

                {/* Events (Middle Lane) - Read-only, selection only */}
                {story.events.map(event => {
                    const trackIndex = getTrackIndex(event.character_id);
                    const character = story.characters.find(c => c.id === event.character_id);

                    if (trackIndex === -1 || !character) return null;

                    return (
                        <div
                            key={event.id}
                            className="absolute cursor-pointer"
                            style={{
                                left: event.time_step * cellWidth,
                                top: (trackIndex * trackHeight) + cellHeight, // Middle lane
                                width: cellWidth,
                                height: cellHeight,
                            }}
                            onClick={() => setSelectedEventId(
                                selectedEventId === event.id ? null : event.id
                            )}
                        >
                            <EventNode
                                event={event}
                                color={character.color}
                                isSelected={selectedEventId === event.id}
                                onClick={() => setSelectedEventId(
                                    selectedEventId === event.id ? null : event.id
                                )}
                            />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Grid;
