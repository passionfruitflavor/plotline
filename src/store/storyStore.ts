import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { temporal } from 'zundo';
import { v4 as uuidv4 } from 'uuid';
import { calculateCumulativeState } from '@/utils/cumulativeState';
import { getNextCharacterColor } from '@/utils/colors';
import { STORAGE_KEYS, HISTORY_LIMIT, DEFAULT_TIMELINE_LENGTH } from '@/lib/constants';
import { Story, Character, Event, Connection, TimeStep } from '@/types/story';

interface StoryState {
    story: Story;

    // UI State
    selectedEventId: string | null;

    // Actions
    setStory: (story: Story) => void;
    setSelectedEventId: (id: string | null) => void;
    updateNarrative: (text: string) => void;
    addCharacter: (name: string) => void;
    updateCharacter: (id: string, updates: Partial<Character>) => void;
    addEvent: (eventData: Omit<Event, 'id'> & { source_event_id?: string }) => void;
    updateEvent: (id: string, updates: Partial<Event>) => void;
    deleteEvent: (id: string) => void;

    // Persistence
    loadStory: (json: string) => void;
    exportStory: () => string;
}

// Default timeline with configurable time steps
const createDefaultTimeline = (): TimeStep[] =>
    Array.from({ length: DEFAULT_TIMELINE_LENGTH }, (_, i) => ({
        step: i,
        label: i % 5 === 0 ? `Day ${Math.floor(i / 5) + 1}` : `${10 + (i % 5)}:00`
    }));

// Empty initial story - users start fresh
const createEmptyStory = (): Story => ({
    id: 'new-story',
    title: 'Untitled Story',
    characters: [],
    events: [],
    connections: [],
    timeline: createDefaultTimeline()
});

export const useStoryStore = create<StoryState>()(
    persist(
        temporal(
            (set, get) => ({
                story: createEmptyStory(),
                selectedEventId: null,

                setStory: (story) => {
                    // Recalculate on load
                    const characters = [...story.characters];
                    const events = story.events.map(e => ({ ...e }));
                    calculateCumulativeState(characters, events);
                    set({ story: { ...story, events }, selectedEventId: null });
                },

                setSelectedEventId: (id) => set({ selectedEventId: id }),

                updateNarrative: (text) => set((state) => ({
                    story: {
                        ...state.story,
                        narrative: {
                            text,
                            sections: state.story.narrative?.sections || []
                        }
                    }
                })),

                addCharacter: (name) => set((state) => {
                    const newChar: Character = {
                        id: uuidv4(),
                        name,
                        color: getNextCharacterColor(),
                        initial_location: '',
                        initial_state: {},
                        inventory: [],
                        knowledge: []
                    };
                    const newCharacters = [...state.story.characters, newChar];
                    const events = state.story.events.map(e => ({ ...e }));

                    calculateCumulativeState(newCharacters, events);

                    return {
                        story: {
                            ...state.story,
                            characters: newCharacters,
                            events // Updated with cumulative state
                        }
                    };
                }),

                updateCharacter: (id, updates) => set((state) => {
                    const newCharacters = state.story.characters.map(c =>
                        c.id === id ? { ...c, ...updates } : c
                    );
                    const events = state.story.events.map(e => ({ ...e }));

                    calculateCumulativeState(newCharacters, events);

                    return {
                        story: { ...state.story, characters: newCharacters, events }
                    };
                }),

                addEvent: (eventData) => set((state) => {
                    const { source_event_id, ...eventFields } = eventData;
                    const newEvent: Event = {
                        id: uuidv4(),
                        ...eventFields
                    };

                    let newConnections = [...state.story.connections];
                    if (source_event_id) {
                        const newConnection: Connection = {
                            id: uuidv4(),
                            source_event_id,
                            target_event_id: newEvent.id,
                            type: 'influence'
                        };
                        newConnections.push(newConnection);
                    }

                    const newEvents = [...state.story.events, newEvent];
                    const characters = [...state.story.characters];
                    // Recalculate with new event
                    calculateCumulativeState(characters, newEvents);

                    return {
                        story: {
                            ...state.story,
                            events: newEvents,
                            connections: newConnections
                        }
                    };
                }),

                updateEvent: (id, updates) => set((state) => {
                    const newEvents = state.story.events.map(e =>
                        e.id === id ? { ...e, ...updates } : e
                    );
                    const characters = [...state.story.characters];

                    calculateCumulativeState(characters, newEvents);

                    return {
                        story: { ...state.story, events: newEvents }
                    };
                }),

                deleteEvent: (id) => set((state) => {
                    const newEvents = state.story.events.filter(e => e.id !== id);
                    const newConnections = state.story.connections.filter(
                        c => c.source_event_id !== id && c.target_event_id !== id
                    );
                    const characters = [...state.story.characters];

                    calculateCumulativeState(characters, newEvents);

                    return {
                        story: {
                            ...state.story,
                            events: newEvents,
                            connections: newConnections
                        }
                    };
                }),

                loadStory: (json) => {
                    try {
                        const parsed = JSON.parse(json);
                        set({ story: parsed });
                    } catch (e) {
                        console.error("Failed to load story", e);
                    }
                },

                exportStory: () => {
                    return JSON.stringify(get().story, null, 2);
                }
            }),
            {
                limit: HISTORY_LIMIT,
            }
        ),
        {
            name: STORAGE_KEYS.STORY,
            storage: createJSONStorage(() => localStorage),
        }
    )
);
