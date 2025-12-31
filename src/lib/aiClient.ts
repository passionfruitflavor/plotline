'use client';

import { GoogleGenAI } from '@google/genai';
import { getApiKey } from '@/store/apiKeyStore';
import { getSelectedModelId } from '@/store/aiModelStore';
import { PROMPTS } from '@/lib/prompts';

// Rate limiting: Track last request time
let lastRequestTime = 0;
const MIN_REQUEST_INTERVAL = 5000; // 5 seconds between requests

export interface AIClientError {
    type: 'NO_API_KEY' | 'RATE_LIMITED' | 'TEXT_TOO_LONG' | 'QUOTA_EXCEEDED' | 'API_ERROR';
    message: string;
    waitTime?: number;
}

export interface ExtractResult {
    success: boolean;
    data?: {
        characters: unknown[];
        events: unknown[];
        connections: unknown[];
    };
    error?: AIClientError;
}

/**
 * Extract timeline data from narrative text using Google AI
 * This runs directly in the browser, no server involved
 */
export async function extractTimeline(text: string, language: 'ja' | 'en' = 'ja'): Promise<ExtractResult> {
    const apiKey = getApiKey();

    if (!apiKey) {
        return {
            success: false,
            error: {
                type: 'NO_API_KEY',
                message: 'API key not configured. Please set your Google AI API key in settings.',
            },
        };
    }

    // Rate limiting check
    const now = Date.now();
    if (now - lastRequestTime < MIN_REQUEST_INTERVAL) {
        const waitTime = Math.ceil((MIN_REQUEST_INTERVAL - (now - lastRequestTime)) / 1000);
        return {
            success: false,
            error: {
                type: 'RATE_LIMITED',
                message: `Please wait ${waitTime} seconds before trying again.`,
                waitTime,
            },
        };
    }

    // Check text length
    if (text.length > 10000) {
        return {
            success: false,
            error: {
                type: 'TEXT_TOO_LONG',
                message: 'Text too long. Please limit to 10,000 characters.',
            },
        };
    }

    lastRequestTime = now;

    try {
        const ai = new GoogleGenAI({ apiKey });

        const response = await ai.models.generateContent({
            model: getSelectedModelId(),
            contents: [
                {
                    role: 'user',
                    parts: [
                        { text: PROMPTS.TIMELINE_EXTRACTION.system },
                        { text: PROMPTS.TIMELINE_EXTRACTION.user(text, language) }
                    ]
                }
            ],
            config: {
                responseMimeType: 'application/json',
                temperature: 0.2,
            }
        });

        const responseText = response.text || '';

        // Parse JSON response
        let jsonData;
        try {
            const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/);
            if (jsonMatch) {
                jsonData = JSON.parse(jsonMatch[1]);
            } else {
                jsonData = JSON.parse(responseText);
            }
        } catch {
            // Try to extract JSON from the response
            const startIndex = responseText.indexOf('{');
            const endIndex = responseText.lastIndexOf('}');
            if (startIndex !== -1 && endIndex !== -1) {
                jsonData = JSON.parse(responseText.slice(startIndex, endIndex + 1));
            } else {
                throw new Error('Could not parse AI response as JSON');
            }
        }

        return {
            success: true,
            data: {
                characters: jsonData.characters || [],
                events: jsonData.events || [],
                connections: jsonData.connections || [],
            },
        };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

        // Check for quota exceeded error
        if (errorMessage.includes('RESOURCE_EXHAUSTED') ||
            errorMessage.includes('quota') ||
            errorMessage.includes('429') ||
            errorMessage.includes('rate limit')) {
            return {
                success: false,
                error: {
                    type: 'QUOTA_EXCEEDED',
                    message: 'API quota exceeded. Please try a different model (e.g., Flash Lite) or wait a few minutes.',
                },
            };
        }

        return {
            success: false,
            error: {
                type: 'API_ERROR',
                message: errorMessage,
            },
        };
    }
}

/**
 * Test API key validity by making a simple request
 */
export async function testApiKey(apiKey: string): Promise<{ valid: boolean; error?: string }> {
    try {
        const ai = new GoogleGenAI({ apiKey });

        // Simple test request
        await ai.models.generateContent({
            model: getSelectedModelId(),
            contents: [{ role: 'user', parts: [{ text: 'test' }] }],
            config: { maxOutputTokens: 1 }
        });

        return { valid: true };
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Invalid API key';
        return { valid: false, error: errorMessage };
    }
}
