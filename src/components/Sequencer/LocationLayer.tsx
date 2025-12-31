import React from 'react';
import { Character, Event } from '@/types/story';

interface LocationLayerProps {
    characters: Character[];
    events: Event[];
    cellWidth: number;
    cellHeight: number; // Height of the Location sub-lane
    steps: number;
    trackHeight: number; // Total height of a track
}

const LocationLayer: React.FC<LocationLayerProps> = ({
    characters,
    events,
    cellWidth,
    cellHeight,
    steps,
    trackHeight
}) => {
    return (
        <div className="absolute inset-0 pointer-events-none">
            {characters.map((char, index) => {
                const charEvents = events
                    .filter(e => e.character_id === char.id && e.location)
                    .sort((a, b) => a.time_step - b.time_step);

                const segments = [];
                let currentLocation = char.initial_location || "(Unknown)";
                let lastTime = 0;

                charEvents.forEach(event => {
                    if (event.location) {
                        segments.push({
                            start: lastTime,
                            end: event.time_step,
                            location: currentLocation
                        });
                        currentLocation = event.location;
                        lastTime = event.time_step;
                    }
                });

                segments.push({
                    start: lastTime,
                    end: steps,
                    location: currentLocation
                });

                return (
                    <div
                        key={char.id}
                        className="absolute w-full"
                        style={{
                            top: index * trackHeight,
                            height: cellHeight,
                        }}
                    >
                        {segments.map((seg, i) => (
                            <div
                                key={i}
                                className="absolute top-0 h-full flex items-center px-2 text-xs text-app-muted overflow-hidden whitespace-nowrap"
                                style={{
                                    left: `${seg.start * cellWidth}px`,
                                    width: `${(seg.end - seg.start) * cellWidth}px`,
                                }}
                            >
                                {seg.location !== "Unknown" && seg.location}
                            </div>
                        ))}
                    </div>
                );
            })}
        </div>
    );
};

export default LocationLayer;
