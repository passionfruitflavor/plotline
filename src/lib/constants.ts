/**
 * Application-wide constants
 */

// Timeline
export const DEFAULT_TIMELINE_LENGTH = 20;
export const DEFAULT_TIME_STEP_HEIGHT = 40;  // pixels
export const DEFAULT_TRACK_WIDTH = 150;      // pixels

// Panel dimensions
export const PANEL_MIN_WIDTH = 200;
export const PANEL_MAX_WIDTH = 600;
export const PANEL_DEFAULT_WIDTH = 320;

// Rate limiting
export const MIN_REQUEST_INTERVAL_MS = 5000;

// Character colors palette (vibrant, distinct colors)
export const CHARACTER_COLORS = [
    '#ef4444', // red
    '#f97316', // orange
    '#eab308', // yellow
    '#22c55e', // green
    '#14b8a6', // teal
    '#3b82f6', // blue
    '#8b5cf6', // violet
    '#ec4899', // pink
    '#06b6d4', // cyan
    '#84cc16', // lime
] as const;

// Storage keys
export const STORAGE_KEYS = {
    STORY: 'plotline-storage',
    TUTORIAL_COMPLETED: 'plotline_tutorial_completed',
} as const;

// History
export const HISTORY_LIMIT = 50;

// Text limits
export const MAX_NARRATIVE_LENGTH = 10000;
