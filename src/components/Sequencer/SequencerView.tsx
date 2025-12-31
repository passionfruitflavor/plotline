'use client';

import React, { useState, useRef, useCallback } from 'react';
import TimelineHeader from './TimelineHeader';
import TrackHeader from './TrackHeader';
import Grid from './Grid';
import Toolbar from './Toolbar';
import NarrativeEditor from './NarrativeEditor';

const SequencerView: React.FC = () => {
    const [showNarrativeEditor, setShowNarrativeEditor] = useState(true);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [scrollTop, setScrollTop] = useState(0);
    const gridContainerRef = useRef<HTMLDivElement>(null);

    const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
        setScrollLeft(e.currentTarget.scrollLeft);
        setScrollTop(e.currentTarget.scrollTop);
    }, []);

    return (
        <div className="flex flex-col h-full">
            <Toolbar />
            <div className="flex-1 flex overflow-hidden">
                {/* Narrative Editor Panel */}
                <NarrativeEditor
                    isOpen={showNarrativeEditor}
                    onToggle={() => setShowNarrativeEditor(!showNarrativeEditor)}
                />

                {/* Main Sequencer Area */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Timeline Header - synced with horizontal scroll */}
                    <TimelineHeader scrollLeft={scrollLeft} />

                    {/* Track Headers + Grid */}
                    <div className="flex-1 flex overflow-hidden">
                        <TrackHeader scrollTop={scrollTop} />
                        <div
                            ref={gridContainerRef}
                            data-tutorial="timeline"
                            className="flex-1 overflow-auto bg-app-secondary"
                            onScroll={handleScroll}
                        >
                            <Grid />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SequencerView;
