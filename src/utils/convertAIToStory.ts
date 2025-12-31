import { v4 as uuidv4 } from 'uuid';
import { Story, Character, Event, Connection, TimeStep, NarrativeSection } from '@/types/story';
import { calculateCumulativeState } from './cumulativeState';

/**
 * AI-extracted data structure from the API
 */
export interface AIExtractedData {
    characters: Array<{
        name: string;
        initial_location: string;
        initial_state: { mood?: string };
        inventory?: string[];
    }>;
    events: Array<{
        who: string;
        what: string;
        where?: string;
        dialogue?: string;
        state_change?: Record<string, string>;
        item_changes?: { add?: string[]; remove?: string[] };
        knowledge_changes?: { add?: string[]; remove?: string[] };
        narrative_position?: number;
        estimated_time?: string;
        source_text?: string;
    }>;
    connections?: Array<{
        from_event: number;
        to_event: number;
        type: 'causes' | 'enables' | 'triggers' | 'leads_to';
        description?: string;
    }>;
}

const CHARACTER_COLORS = [
    '#ef4444', '#3b82f6', '#22c55e', '#f59e0b',
    '#a855f7', '#ec4899', '#14b8a6', '#f97316'
];

/**
 * Convert AI-extracted data to Story format
 */
export function convertAIToStory(
    data: AIExtractedData,
    narrativeText: string,
    existingStory: Story
): Story {
    // Convert characters
    const characters: Character[] = data.characters.map((char, idx) => ({
        id: uuidv4(),
        name: char.name,
        color: CHARACTER_COLORS[idx % CHARACTER_COLORS.length],
        initial_location: char.initial_location || '',
        initial_state: char.initial_state || {},
        inventory: char.inventory || [],
        knowledge: [],
    }));

    // Create character name to ID mapping
    const charNameToId: Record<string, string> = {};
    characters.forEach(c => { charNameToId[c.name] = c.id; });

    // Convert events: array index = time_step (chronological order from AI)
    const events: Event[] = data.events.map((event, idx) => ({
        id: uuidv4(),
        character_id: charNameToId[event.who] || characters[0]?.id || 'unknown',
        time_step: idx,
        type: 'action',
        description: event.what,
        location: event.where,
        dialogue: event.dialogue,
        state_change: event.state_change,
        item_changes: event.item_changes,
        knowledge_changes: event.knowledge_changes,
        narrative_position: event.narrative_position,
        estimated_time: event.estimated_time,
        narrative_refs: event.source_text ? [{
            section_id: `s${idx}`,
            confidence: 0.8,
            extracted_text: event.source_text,
        }] : undefined,
        cumulative_state: {},
        cumulative_inventory: [],
    }));

    // Calculate cumulative state for all events
    calculateCumulativeState(characters, events);

    // Create timeline based on max time_step
    const maxTimeStep = Math.max(...events.map(e => e.time_step), 0);
    const timeline: TimeStep[] = Array.from({ length: maxTimeStep + 1 }, (_, idx) => {
        const eventAtStep = events.find(e => e.time_step === idx);
        return {
            step: idx,
            label: eventAtStep?.estimated_time || `Scene ${idx + 1}`,
        };
    });

    // Map narrative_position to event ID for connections
    const positionToEventId: Record<number, string> = {};
    events.forEach(event => {
        if (event.narrative_position !== undefined) {
            positionToEventId[event.narrative_position] = event.id;
        }
    });

    // Convert connections
    const connections: Connection[] = (data.connections || [])
        .filter(conn => positionToEventId[conn.from_event] && positionToEventId[conn.to_event])
        .map(conn => ({
            id: uuidv4(),
            source_event_id: positionToEventId[conn.from_event],
            target_event_id: positionToEventId[conn.to_event],
            type: conn.type || 'causes',
        }));

    // Generate narrative sections from source_text
    const sections: NarrativeSection[] = [];
    events.forEach((event, idx) => {
        if (event.narrative_refs && event.narrative_refs.length > 0) {
            const sourceText = event.narrative_refs[0].extracted_text;
            if (sourceText) {
                const startOffset = narrativeText.indexOf(sourceText);
                if (startOffset !== -1) {
                    sections.push({
                        id: `s${idx}`,
                        text: sourceText,
                        startOffset,
                        endOffset: startOffset + sourceText.length,
                    });
                }
            }
        }
    });

    return {
        ...existingStory,
        id: existingStory.id || uuidv4(),
        title: existingStory.title || 'Generated Story',
        characters,
        events,
        connections,
        timeline,
        narrative: {
            text: narrativeText,
            sections,
        },
    };
}
