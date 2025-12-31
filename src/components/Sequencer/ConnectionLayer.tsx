import React from 'react';
import { Connection, Event } from '@/types/story';

interface ConnectionLayerProps {
    connections: Connection[];
    events: Event[];
    cellWidth: number;
    cellHeight: number;
    getTrackIndex: (charId: string) => number;
}

const ConnectionLayer: React.FC<ConnectionLayerProps> = ({
    connections,
    events,
    cellWidth,
    cellHeight,
    getTrackIndex
}) => {
    const trackHeight = cellHeight * 3;
    const inset = 4;

    // Group connections by source event to offset overlapping lines
    const connectionsBySource: Record<string, number> = {};
    connections.forEach(conn => {
        connectionsBySource[conn.source_event_id] = (connectionsBySource[conn.source_event_id] || 0) + 1;
    });

    // Track how many connections we've processed per source
    const processedPerSource: Record<string, number> = {};

    return (
        <svg className="absolute inset-0 pointer-events-none w-full h-full overflow-visible">
            <defs>
                <marker id="arrowhead" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                    <polygon points="0 0, 8 3, 0 6" fill="#64748b" fillOpacity="0.8" />
                </marker>
                <marker id="arrowhead-red" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                    <polygon points="0 0, 8 3, 0 6" fill="#ef4444" fillOpacity="0.8" />
                </marker>
            </defs>

            {connections.map((conn, i) => {
                const source = events.find(e => e.id === conn.source_event_id);
                const target = events.find(e => e.id === conn.target_event_id);

                if (!source || !target) return null;

                const sourceTrack = getTrackIndex(source.character_id);
                const targetTrack = getTrackIndex(target.character_id);

                // Calculate offset for overlapping connections
                const totalFromSource = connectionsBySource[conn.source_event_id] || 1;
                processedPerSource[conn.source_event_id] = (processedPerSource[conn.source_event_id] || 0) + 1;
                const connectionIndex = processedPerSource[conn.source_event_id] - 1;

                // Offset: spread connections vertically if multiple from same source
                const offsetY = totalFromSource > 1
                    ? (connectionIndex - (totalFromSource - 1) / 2) * 8
                    : 0;

                let x1, y1, x2, y2, path;

                if (sourceTrack !== targetTrack) {
                    // Cross-track connection
                    x1 = (source.time_step * cellWidth) + (cellWidth / 2);
                    x2 = (target.time_step * cellWidth) + (cellWidth / 2);

                    if (sourceTrack < targetTrack) {
                        y1 = (sourceTrack * trackHeight) + (cellHeight * 2) - inset;
                        y2 = (targetTrack * trackHeight) + cellHeight + inset;
                    } else {
                        y1 = (sourceTrack * trackHeight) + cellHeight + inset;
                        y2 = (targetTrack * trackHeight) + (cellHeight * 2) - inset;
                    }

                    // Use curved path with offset
                    const midY = y1 + (y2 - y1) / 2 + offsetY;
                    const controlX1 = x1 + (x2 - x1) * 0.3;
                    const controlX2 = x1 + (x2 - x1) * 0.7;
                    path = `M ${x1} ${y1} C ${controlX1} ${midY}, ${controlX2} ${midY}, ${x2} ${y2}`;

                } else {
                    // Same track
                    if (source.time_step === target.time_step) {
                        x1 = (source.time_step * cellWidth) + (cellWidth / 2);
                        y1 = (sourceTrack * trackHeight) + (cellHeight * 1.5);
                        x2 = x1;
                        y2 = y1;
                        path = `M ${x1} ${y1} L ${x2} ${y2}`;
                    } else {
                        // Horizontal with curve offset
                        x1 = (source.time_step * cellWidth) + cellWidth - inset;
                        y1 = (sourceTrack * trackHeight) + (cellHeight * 1.5) + offsetY;
                        x2 = (target.time_step * cellWidth) + inset;
                        y2 = (targetTrack * trackHeight) + (cellHeight * 1.5);

                        // Curved path that arcs above/below based on offset
                        const arcHeight = 15 + Math.abs(offsetY);
                        const midX = (x1 + x2) / 2;
                        const curveY = y1 - (offsetY > 0 ? arcHeight : -arcHeight);

                        path = `M ${x1} ${y1} Q ${midX} ${curveY}, ${x2} ${y2}`;
                    }
                }

                const isBackwards = source.time_step > target.time_step;
                const strokeColor = isBackwards ? '#ef4444' : '#64748b';
                const markerId = isBackwards ? 'arrowhead-red' : 'arrowhead';

                return (
                    <g key={i}>
                        {/* Shadow for better visibility */}
                        <path
                            d={path}
                            stroke="rgba(255,255,255,0.8)"
                            strokeWidth="4"
                            fill="none"
                        />
                        {/* Main line */}
                        <path
                            d={path}
                            stroke={strokeColor}
                            strokeWidth="2"
                            fill="none"
                            markerEnd={`url(#${markerId})`}
                            className="transition-opacity hover:opacity-100"
                            style={{ opacity: isBackwards ? 0.9 : 0.7 }}
                        />
                    </g>
                );
            })}
        </svg>
    );
};

export default ConnectionLayer;
