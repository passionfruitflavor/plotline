"use client";

import React, { useState } from 'react';
import { Character } from '@/types/story';
import { useStoryStore } from '@/store/storyStore';

interface CharacterEditModalProps {
    isOpen: boolean;
    onClose: () => void;
    character: Character;
}

const CharacterEditModal: React.FC<CharacterEditModalProps> = ({
    isOpen,
    onClose,
    character
}) => {
    const updateCharacter = useStoryStore(state => state.updateCharacter);

    const [name, setName] = useState(character.name);
    const [color, setColor] = useState(character.color);
    const [initialLocation, setInitialLocation] = useState(character.initial_location);
    const [initialState, setInitialState] = useState(JSON.stringify(character.initial_state, null, 2));
    const [inventory, setInventory] = useState(character.inventory.join(', '));

    if (!isOpen) return null;

    const handleSave = () => {
        let parsedState = {};
        try {
            parsedState = JSON.parse(initialState);
        } catch (e) {
            // Keep as empty object if invalid JSON
        }

        updateCharacter(character.id, {
            name,
            color,
            initial_location: initialLocation,
            initial_state: parsedState,
            inventory: inventory.split(',').map(s => s.trim()).filter(s => s.length > 0)
        });

        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
            <div className="bg-app-primary rounded-lg shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold text-white mb-4">Edit Character</h2>

                <div className="space-y-4">
                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-app-subtle mb-1">Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            className="w-full px-3 py-2 bg-app-tertiary text-app rounded border border-app-light focus:border-app-accent focus:outline-none"
                        />
                    </div>

                    {/* Color */}
                    <div>
                        <label className="block text-sm font-medium text-app-subtle mb-1">Color</label>
                        <div className="flex items-center space-x-2">
                            <input
                                type="color"
                                value={color}
                                onChange={e => setColor(e.target.value)}
                                className="w-10 h-10 rounded cursor-pointer"
                            />
                            <input
                                type="text"
                                value={color}
                                onChange={e => setColor(e.target.value)}
                                className="flex-1 px-3 py-2 bg-app-tertiary text-app rounded border border-app-light focus:border-app-accent focus:outline-none"
                            />
                        </div>
                    </div>

                    {/* Initial Location */}
                    <div>
                        <label className="block text-sm font-medium text-app-subtle mb-1">Initial Location</label>
                        <input
                            type="text"
                            value={initialLocation}
                            onChange={e => setInitialLocation(e.target.value)}
                            placeholder="e.g., Home, Office, Park"
                            className="w-full px-3 py-2 bg-app-tertiary text-app rounded border border-app-light focus:border-app-accent focus:outline-none"
                        />
                    </div>

                    {/* Initial State (JSON) */}
                    <div>
                        <label className="block text-sm font-medium text-app-subtle mb-1">Initial State (JSON)</label>
                        <textarea
                            value={initialState}
                            onChange={e => setInitialState(e.target.value)}
                            rows={3}
                            placeholder='{"mood": "happy"}'
                            className="w-full px-3 py-2 bg-app-tertiary text-app rounded border border-app-light focus:border-app-accent focus:outline-none font-mono text-sm"
                        />
                    </div>

                    {/* Inventory */}
                    <div>
                        <label className="block text-sm font-medium text-app-subtle mb-1">Inventory (comma-separated)</label>
                        <input
                            type="text"
                            value={inventory}
                            onChange={e => setInventory(e.target.value)}
                            placeholder="e.g., wallet, keys, phone"
                            className="w-full px-3 py-2 bg-app-tertiary text-app rounded border border-app-light focus:border-app-accent focus:outline-none"
                        />
                    </div>
                </div>

                {/* Buttons */}
                <div className="flex justify-end space-x-3 mt-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-app-tertiary hover:bg-app-hover text-app rounded transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded transition-colors"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CharacterEditModal;
