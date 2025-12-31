import React from 'react';
import { Event, Character } from '@/types/story';
import { useEventForm } from '@/hooks/useEventForm';

interface EventCreationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: ReturnType<ReturnType<typeof useEventForm>['getSubmitData']>) => void;
    onDelete?: (id: string) => void;
    initialData?: {
        time_step: number;
        character_id: string;
    };
    eventToEdit?: Event;
    existingEvents: Event[];
    characters: Character[];
}

const EventCreationModal: React.FC<EventCreationModalProps> = ({
    isOpen,
    onClose,
    onSubmit,
    onDelete,
    initialData,
    eventToEdit,
    existingEvents,
    characters
}) => {
    const { formData, updateField, toggleItemToRemove, availableInventory, getSubmitData } = useEventForm({
        eventToEdit,
        initialData,
        existingEvents,
        characters,
    });

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(getSubmitData());
        onClose();
    };

    const handleDelete = () => {
        if (eventToEdit && onDelete) {
            if (confirm('Are you sure you want to delete this event?')) {
                onDelete(eventToEdit.id);
                onClose();
            }
        }
    };

    // Filter potential source events
    const potentialSources = existingEvents || [];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-app-primary p-6 rounded-lg shadow-xl w-[450px] max-h-[90vh] overflow-y-auto border border-app">
                <h2 className="text-lg font-bold text-white mb-4">
                    {eventToEdit ? 'Edit Event' : 'Create New Event'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs text-app-muted mb-1">Description</label>
                        <input
                            type="text"
                            value={formData.description}
                            onChange={e => updateField('description', e.target.value)}
                            className="w-full bg-app-secondary border border-app rounded p-2 text-sm text-app focus:outline-none focus:border-app-accent"
                            required
                            autoFocus
                        />
                    </div>

                    {/* Allow moving (Time/Character) only if editing */}
                    {eventToEdit && (
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-xs text-app-muted mb-1">Time Step</label>
                                <input
                                    type="number"
                                    value={formData.timeStep}
                                    onChange={e => updateField('timeStep', parseInt(e.target.value))}
                                    className="w-full bg-app-secondary border border-app rounded p-2 text-sm text-app focus:outline-none focus:border-app-accent"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-app-muted mb-1">Character</label>
                                <select
                                    value={formData.characterId}
                                    onChange={e => updateField('characterId', e.target.value)}
                                    className="w-full bg-app-secondary border border-app rounded p-2 text-sm text-app focus:outline-none focus:border-app-accent"
                                >
                                    {characters.map(c => (
                                        <option key={c.id} value={c.id}>{c.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs text-app-muted mb-1">Type</label>
                        <select
                            value={formData.type}
                            onChange={e => updateField('type', e.target.value)}
                            className="w-full bg-app-secondary border border-app rounded p-2 text-sm text-app focus:outline-none focus:border-app-accent"
                        >
                            <option value="action">Action</option>
                            <option value="reaction">Reaction</option>
                        </select>
                    </div>

                    {formData.type === 'reaction' && !eventToEdit && (
                        <div>
                            <label className="block text-xs text-app-muted mb-1">Reacts To</label>
                            <select
                                value={formData.sourceEventId}
                                onChange={e => updateField('sourceEventId', e.target.value)}
                                className="w-full bg-app-secondary border border-app rounded p-2 text-sm text-app focus:outline-none focus:border-app-accent"
                                required={!eventToEdit}
                            >
                                <option value="">Select an event...</option>
                                {potentialSources.map(evt => {
                                    const char = characters?.find(c => c.id === evt.character_id);
                                    return (
                                        <option key={evt.id} value={evt.id}>
                                            {char?.name}: {evt.description}
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs text-app-muted mb-1">Dialogue (Optional)</label>
                        <textarea
                            value={formData.dialogue}
                            onChange={e => updateField('dialogue', e.target.value)}
                            className="w-full bg-app-secondary border border-app rounded p-2 text-sm text-app focus:outline-none focus:border-app-accent h-16 resize-none"
                        />
                    </div>

                    <div>
                        <label className="block text-xs text-app-muted mb-1">Location Change (Optional)</label>
                        <input
                            type="text"
                            value={formData.location}
                            onChange={e => updateField('location', e.target.value)}
                            className="w-full bg-app-secondary border border-app rounded p-2 text-sm text-app focus:outline-none focus:border-app-accent"
                            placeholder="e.g. Park, Home"
                        />
                    </div>

                    {/* State/Inventory Changes Section */}
                    <div className="border-t border-app pt-4">
                        <h3 className="text-xs font-semibold text-app-subtle mb-3">State/Inventory Changes</h3>

                        <div className="space-y-3">
                            <div>
                                <label className="block text-xs text-app-muted mb-1">State Change (JSON or mood)</label>
                                <input
                                    type="text"
                                    value={formData.stateChange}
                                    onChange={e => updateField('stateChange', e.target.value)}
                                    className="w-full bg-app-secondary border border-app rounded p-2 text-sm text-app focus:outline-none focus:border-app-accent"
                                    placeholder='e.g. {"mood": "happy"} or just: happy'
                                />
                            </div>

                            <div>
                                <label className="block text-xs text-app-muted mb-1">Items to Add (comma-separated)</label>
                                <input
                                    type="text"
                                    value={formData.itemsToAdd}
                                    onChange={e => updateField('itemsToAdd', e.target.value)}
                                    className="w-full bg-app-secondary border border-app rounded p-2 text-sm text-app focus:outline-none focus:border-app-accent"
                                    placeholder="e.g. sword, shield"
                                />
                            </div>

                            <div>
                                <label className="block text-xs text-app-muted mb-1">Items to Remove</label>
                                {availableInventory.length > 0 ? (
                                    <div className="flex flex-wrap gap-2">
                                        {availableInventory.map(item => (
                                            <label key={item} className="flex items-center space-x-1 bg-app-tertiary px-2 py-1 rounded cursor-pointer hover:bg-app-hover">
                                                <input
                                                    type="checkbox"
                                                    checked={formData.itemsToRemove.includes(item)}
                                                    onChange={() => toggleItemToRemove(item)}
                                                    className="accent-red-500"
                                                />
                                                <span className="text-xs text-app">{item}</span>
                                            </label>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-xs text-app-dim italic">No items in inventory</div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between pt-2">
                        {eventToEdit ? (
                            <button
                                type="button"
                                onClick={handleDelete}
                                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
                            >
                                Delete
                            </button>
                        ) : <div></div>}

                        <div className="flex space-x-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-3 py-1.5 text-xs text-app-muted hover:text-app transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded transition-colors"
                            >
                                {eventToEdit ? 'Save' : 'Create'}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EventCreationModal;
