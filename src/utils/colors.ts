import { CHARACTER_COLORS } from '@/lib/constants';

let colorIndex = 0;

/**
 * Get the next color from the palette for a new character
 * Cycles through the palette to ensure distinct colors
 */
export function getNextCharacterColor(): string {
    const color = CHARACTER_COLORS[colorIndex % CHARACTER_COLORS.length];
    colorIndex++;
    return color;
}

/**
 * Generate a random hex color
 * @deprecated Use getNextCharacterColor for better color consistency
 */
export function getRandomColor(): string {
    return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

/**
 * Reset the color index (useful for testing or when clearing all data)
 */
export function resetColorIndex(): void {
    colorIndex = 0;
}
