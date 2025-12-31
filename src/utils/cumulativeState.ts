import { Character, Event } from '@/types/story';

/**
 * Calculate cumulative state and inventory for each event
 * Based on initial character state + all state changes up to that point
 */
export function calculateCumulativeState(
    characters: Character[],
    events: Event[]
): void {
    // Track state per character
    const charState: Record<string, Record<string, string>> = {};
    const charInventory: Record<string, string[]> = {};
    const charKnowledge: Record<string, string[]> = {};

    // Initialize from character initial states
    characters.forEach(char => {
        charState[char.id] = { ...(char.initial_state as Record<string, string> || {}) };
        charInventory[char.id] = [...(char.inventory || [])];
        charKnowledge[char.id] = [...(char.knowledge || [])];
    });

    // Sort by time_step and apply changes cumulatively
    events
        .sort((a, b) => a.time_step - b.time_step)
        .forEach(event => {
            const charId = event.character_id;

            // Ensure character exists in tracking
            if (!charState[charId]) {
                charState[charId] = {};
                charInventory[charId] = [];
                charKnowledge[charId] = [];
            }

            // Apply state changes
            if (event.state_change) {
                charState[charId] = { ...charState[charId], ...event.state_change };
            }

            // Apply item changes (with defensive array check for AI-generated data)
            if (event.item_changes?.add) {
                const addItems = Array.isArray(event.item_changes.add)
                    ? event.item_changes.add
                    : [event.item_changes.add];
                charInventory[charId] = [...charInventory[charId], ...addItems];
            }
            if (event.item_changes?.remove) {
                const removeItems = Array.isArray(event.item_changes.remove)
                    ? event.item_changes.remove
                    : [event.item_changes.remove];
                charInventory[charId] = charInventory[charId].filter(
                    item => !removeItems.includes(item)
                );
            }

            // Apply knowledge changes (with defensive array check for AI-generated data)
            if (event.knowledge_changes?.add) {
                const addKnowledge = Array.isArray(event.knowledge_changes.add)
                    ? event.knowledge_changes.add
                    : [event.knowledge_changes.add];
                charKnowledge[charId] = [...charKnowledge[charId], ...addKnowledge];
            }
            if (event.knowledge_changes?.remove) {
                const removeKnowledge = Array.isArray(event.knowledge_changes.remove)
                    ? event.knowledge_changes.remove
                    : [event.knowledge_changes.remove];
                charKnowledge[charId] = charKnowledge[charId].filter(
                    k => !removeKnowledge.includes(k)
                );
            }

            // Store cumulative state on event
            event.cumulative_state = { ...charState[charId] };
            event.cumulative_inventory = [...charInventory[charId]];
            event.cumulative_knowledge = [...charKnowledge[charId]];
        });
}
