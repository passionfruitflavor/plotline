'use client';

import { useState, useEffect, useMemo } from 'react';
import { Event, Character } from '@/types/story';

interface EventFormData {
    description: string;
    type: string;
    dialogue: string;
    location: string;
    sourceEventId: string;
    timeStep: number;
    characterId: string;
    stateChange: string;
    itemsToAdd: string;
    itemsToRemove: string[];
}

interface UseEventFormProps {
    eventToEdit?: Event;
    initialData?: {
        time_step: number;
        character_id: string;
    };
    existingEvents: Event[];
    characters: Character[];
}

export function useEventForm({ eventToEdit, initialData, existingEvents, characters }: UseEventFormProps) {
    const [formData, setFormData] = useState<EventFormData>({
        description: '',
        type: 'action',
        dialogue: '',
        location: '',
        sourceEventId: '',
        timeStep: 0,
        characterId: '',
        stateChange: '',
        itemsToAdd: '',
        itemsToRemove: [],
    });

    // Reset form when eventToEdit or initialData changes
    useEffect(() => {
        if (eventToEdit) {
            setFormData({
                description: eventToEdit.description,
                type: eventToEdit.type,
                dialogue: eventToEdit.dialogue || '',
                location: eventToEdit.location || '',
                sourceEventId: '',
                timeStep: eventToEdit.time_step,
                characterId: eventToEdit.character_id,
                stateChange: eventToEdit.state_change ? JSON.stringify(eventToEdit.state_change) : '',
                itemsToAdd: eventToEdit.item_changes?.add?.join(', ') || '',
                itemsToRemove: eventToEdit.item_changes?.remove || [],
            });
        } else if (initialData) {
            setFormData({
                description: '',
                type: 'action',
                dialogue: '',
                location: '',
                sourceEventId: '',
                timeStep: initialData.time_step,
                characterId: initialData.character_id,
                stateChange: '',
                itemsToAdd: '',
                itemsToRemove: [],
            });
        }
    }, [eventToEdit, initialData]);

    // Compute available inventory for current character at current time step
    const availableInventory = useMemo(() => {
        const char = characters.find(c => c.id === formData.characterId);
        if (!char) return [];

        let inventory = [...char.inventory];

        // Get all events for this character up to (but not including) current event's time step
        const priorEvents = existingEvents
            .filter(e => e.character_id === formData.characterId && e.time_step < formData.timeStep)
            .sort((a, b) => a.time_step - b.time_step);

        priorEvents.forEach(event => {
            if (event.item_changes) {
                if (event.item_changes.add) {
                    inventory.push(...event.item_changes.add);
                }
                if (event.item_changes.remove) {
                    inventory = inventory.filter(i => !event.item_changes!.remove!.includes(i));
                }
            }
        });

        // Also add items being added in this event
        const itemsBeingAdded = formData.itemsToAdd.split(',').map(s => s.trim()).filter(s => s.length > 0);
        inventory.push(...itemsBeingAdded);

        return [...new Set(inventory)]; // Remove duplicates
    }, [characters, existingEvents, formData.characterId, formData.timeStep, formData.itemsToAdd]);

    // Field update helpers
    const updateField = <K extends keyof EventFormData>(field: K, value: EventFormData[K]) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const toggleItemToRemove = (item: string) => {
        setFormData(prev => ({
            ...prev,
            itemsToRemove: prev.itemsToRemove.includes(item)
                ? prev.itemsToRemove.filter(i => i !== item)
                : [...prev.itemsToRemove, item]
        }));
    };

    // Build submit data
    const getSubmitData = () => {
        // Parse state_change
        let parsedStateChange: Record<string, unknown> | undefined;
        if (formData.stateChange.trim()) {
            try {
                parsedStateChange = JSON.parse(formData.stateChange);
            } catch {
                // If not valid JSON, try simple key:value format
                parsedStateChange = { mood: formData.stateChange };
            }
        }

        // Parse item_changes
        const add = formData.itemsToAdd.split(',').map(s => s.trim()).filter(s => s.length > 0);
        const itemChanges = (add.length > 0 || formData.itemsToRemove.length > 0)
            ? { add: add.length > 0 ? add : undefined, remove: formData.itemsToRemove.length > 0 ? formData.itemsToRemove : undefined }
            : undefined;

        return {
            id: eventToEdit?.id,
            description: formData.description,
            event_type: formData.type,
            type: formData.type,
            dialogue: formData.dialogue || undefined,
            location: formData.location || undefined,
            source_event_id: formData.type === 'reaction' ? formData.sourceEventId : undefined,
            time_step: formData.timeStep,
            character_id: formData.characterId,
            state_change: parsedStateChange,
            item_changes: itemChanges,
        };
    };

    return {
        formData,
        updateField,
        toggleItemToRemove,
        availableInventory,
        getSubmitData,
    };
}
