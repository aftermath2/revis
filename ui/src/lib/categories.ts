import { type Note } from './types';

const CAMEL_CASE_SHORT_NAMES: { [id: string]: number; } = {
    'ark': 0,
    'web': 0,
};
const SEPARATOR = '_';


export const getCategoryName = (path: string): string => {
    const segments = path.split('/');
    const name = segments[segments.length - 1] || path;

    // Tags with less than 4 characters will be shown in all uppercase (e.g. LND, CLN, AI, LLM)
    if (name.length < 4 && !(name in CAMEL_CASE_SHORT_NAMES)) {
        return name.toUpperCase();
    }

    // Tags such as "murray_rothbard" should be displayed as "Murray Rothbard"
    if (name.includes(SEPARATOR)) {
        return name.split(SEPARATOR).map(word => {
            if (word === 'von') {
                return word
            }
            return word.charAt(0).toUpperCase() + word.slice(1)
        }).join(' ');
    }

    return name.charAt(0).toUpperCase() + name.slice(1);
}

export function getCategoryPaths(notes: Note[]): Set<string> {
    const categoryCounts: Record<string, number> = {};

    for (const note of notes) {
        for (const category of note.categories) {
            categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        }
    }

    const sortedCategories = Object.entries(categoryCounts)
        .sort(([, a], [, b]) => b - a)
        .map(([category]) => category);

    return new Set(sortedCategories);
}