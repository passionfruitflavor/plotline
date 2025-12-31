export interface Character {
    id: string;
    name: string;
    color: string;
    initial_location: string;
    initial_state: Record<string, any>;
    inventory: string[];
    knowledge: string[];
}

export type TimeType = 'present' | 'flashback' | 'flash_forward' | 'memory';

export interface Event {
    id: string;
    character_id: string;
    time_step: number;
    type: string;
    description: string;
    state_change?: Record<string, any>;
    location?: string;
    item_changes?: { add?: string[], remove?: string[] };
    knowledge_changes?: { add?: string[], remove?: string[] };
    dialogue?: string;

    // Timeline Reconstruction fields
    time_type?: TimeType;
    narrative_position?: number;  // Order in which this event was narrated (1st, 2nd, etc.)
    estimated_time?: string;      // Human-readable time reference ("5 years ago")

    // Narrative linking
    narrative_refs?: NarrativeRef[];

    // Cumulative state at this event point
    cumulative_state?: Record<string, string>;
    cumulative_inventory?: string[];
    cumulative_knowledge?: string[];
}

export interface Connection {
    id: string;
    source_event_id: string;
    target_event_id: string;
    type: string; // 'causes', 'influence', etc.
}

export interface TimeStep {
    step: number;
    label: string;
    timestamp?: string;
}

// Narrative text tracking
export interface NarrativeSection {
    id: string;
    text: string;
    startOffset: number;
    endOffset: number;
}

export interface Narrative {
    text: string;
    sections: NarrativeSection[];
}

export interface NarrativeRef {
    section_id: string;
    confidence: number;
    extracted_text: string;
}

export interface Story {
    id: string;
    title: string;
    characters: Character[];
    events: Event[];
    connections: Connection[];
    timeline: TimeStep[];

    // AI Integration fields
    narrative?: Narrative;
}
