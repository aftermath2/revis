import { describe, it, expect } from 'vitest';
import {
    calculateWilsonScore,
    calculateEngagementScore,
    calculateTrendingScore,
    calculateControversyScore,
    sortingAlgorithms
} from '../sortingAlgorithms';
import { Note, Review, Vote, SortOption } from '../types';

// Helper to create mock votes
const createMockVote = (weight: number = 1): Vote => ({
    id: Math.random(),
    username: 'testuser',
    avatar: '',
    weight,
    timestamp: new Date().toISOString()
});

// Helper to create mock reviews
const createMockReview = (overrides: Partial<Review> = {}): Review => ({
    id: Math.random(),
    authorPublicKey: 'testuser',
    comment: 'Test review',
    rating: 4,
    weight: 1,
    createdAt: new Date().toISOString(),
    votes: [],
    ...overrides
});

// Helper to create mock notes
const createMockNote = (overrides: Partial<Note> = {}): Note => ({
    id: Math.random(),
    title: 'Test Note',
    content: 'Test content',
    categories: [],
    createdAt: new Date().toISOString(),
    reviews: [],
    ...overrides
});

describe('Wilson Score Calculation', () => {
    it('should return 0 for no votes', () => {
        expect(calculateWilsonScore(0, 0)).toBe(0);
    });

    it('should return positive score for all upvotes', () => {
        const score = calculateWilsonScore(10, 10);
        expect(score).toBeGreaterThan(0);
        expect(score).toBeLessThanOrEqual(1);
    });

    it('should return lower score with fewer votes', () => {
        const scoreMany = calculateWilsonScore(100, 100);
        const scoreFew = calculateWilsonScore(10, 10);
        expect(scoreMany).toBeGreaterThan(scoreFew);
    });
});

describe('Engagement Score Calculation', () => {
    it('should return 0 for note with no reviews', () => {
        const note = createMockNote({ reviews: [] });
        expect(calculateEngagementScore(note)).toBe(0);
    });

    it('should increase with more reviews', () => {
        const noteOne = createMockNote({ reviews: [createMockReview()] });
        const noteTwo = createMockNote({ reviews: [createMockReview(), createMockReview()] });
        
        expect(calculateEngagementScore(noteTwo)).toBeGreaterThan(calculateEngagementScore(noteOne));
    });

    it('should increase with higher votes', () => {
        const noteLow = createMockNote({ 
            reviews: [createMockReview({ votes: [createMockVote(1)] })] 
        });
        const noteHigh = createMockNote({ 
            reviews: [createMockReview({ votes: Array(10).fill(null).map(() => createMockVote(1)) })] 
        });
        
        expect(calculateEngagementScore(noteHigh)).toBeGreaterThan(calculateEngagementScore(noteLow));
    });
});

describe('Trending Score Calculation', () => {
    it('should return 0 for note with no activity', () => {
        const note = createMockNote({ reviews: [] });
        expect(calculateTrendingScore(note)).toBe(0);
    });

    it('should favor recent notes', () => {
        const oldNote = createMockNote({
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            reviews: [createMockReview()]
        });
        const newNote = createMockNote({
            createdAt: new Date().toISOString(),
            reviews: [createMockReview()]
        });
        
        expect(calculateTrendingScore(newNote)).toBeGreaterThan(calculateTrendingScore(oldNote));
    });
});

describe('Controversy Score Calculation', () => {
    it('should return 0 for notes with less than 3 reviews', () => {
        const note = createMockNote({ reviews: [createMockReview(), createMockReview()] });
        expect(calculateControversyScore(note)).toBe(0);
    });

    it('should increase with rating variance', () => {
        const consensusNote = createMockNote({
            reviews: [
                createMockReview({ rating: 5 }),
                createMockReview({ rating: 5 }),
                createMockReview({ rating: 5 })
            ]
        });
        const divisiveNote = createMockNote({
            reviews: [
                createMockReview({ rating: 1 }),
                createMockReview({ rating: 5 }),
                createMockReview({ rating: 1 })
            ]
        });
        
        expect(calculateControversyScore(divisiveNote)).toBeGreaterThan(calculateControversyScore(consensusNote));
    });
});

describe('Sorting Algorithms', () => {
    const notes = [
        createMockNote({
            id: 1,
            createdAt: new Date('2025-01-01').toISOString(),
            reviews: [createMockReview({ 
                rating: 5, 
                votes: Array(10).fill(null).map(() => createMockVote(1)) 
            })]
        }),
        createMockNote({
            id: 2,
            createdAt: new Date('2025-10-01').toISOString(),
            reviews: [createMockReview({ 
                rating: 3, 
                votes: Array(5).fill(null).map(() => createMockVote(1)) 
            })]
        }),
        createMockNote({
            id: 3,
            createdAt: new Date('2025-06-01').toISOString(),
            reviews: [
                createMockReview({ 
                    rating: 4, 
                    votes: Array(8).fill(null).map(() => createMockVote(1)) 
                }),
                createMockReview({ 
                    rating: 4, 
                    votes: Array(7).fill(null).map(() => createMockVote(1)) 
                })
            ]
        })
    ];

    it('should sort by newest first', () => {
        const sorted = sortingAlgorithms.newest(notes);
        expect(sorted[0].id).toBe(2); // October note
        expect(sorted[2].id).toBe(1); // January note
    });

    it('should sort by oldest first', () => {
        const sorted = sortingAlgorithms.oldest(notes);
        expect(sorted[0].id).toBe(1); // January note
        expect(sorted[2].id).toBe(2); // October note
    });

    it('should sort by highest rated', () => {
        const sorted = sortingAlgorithms.highestRated(notes);
        expect(sorted[0].id).toBe(1); // Rating 5
    });

    it('should sort by most reviewed', () => {
        const sorted = sortingAlgorithms.mostReviewed(notes);
        expect(sorted[0].id).toBe(3); // 2 reviews
        expect(sorted[sorted.length - 1].reviews.length).toBeLessThanOrEqual(sorted[0].reviews.length);
    });

    it('should handle empty array', () => {
        expect(sortingAlgorithms.newest([])).toEqual([]);
        expect(sortingAlgorithms.oldest([])).toEqual([]);
        expect(sortingAlgorithms.highestRated([])).toEqual([]);
    });

    it('should not mutate original array', () => {
        const original = [...notes];
        sortingAlgorithms.newest(notes);
        expect(notes).toEqual(original);
    });
});

describe('Universal sortNotes method', () => {
    const notes = [
        createMockNote({ id: 1, createdAt: new Date('2025-01-01').toISOString() }),
        createMockNote({ id: 2, createdAt: new Date('2025-10-01').toISOString() })
    ];

    it('should sort by NEWEST option', () => {
        const sorted = sortingAlgorithms.sortNotes(notes, SortOption.NEWEST);
        expect(sorted[0].id).toBe(2);
    });

    it('should sort by OLDEST option', () => {
        const sorted = sortingAlgorithms.sortNotes(notes, SortOption.OLDEST);
        expect(sorted[0].id).toBe(1);
    });

    it('should sort by HIGHEST_RATED option', () => {
        const sorted = sortingAlgorithms.sortNotes(notes, SortOption.HIGHEST_RATED);
        expect(sorted).toHaveLength(2);
    });

    it('should sort by MOST_POPULAR option', () => {
        const sorted = sortingAlgorithms.sortNotes(notes, SortOption.MOST_POPULAR);
        expect(sorted).toHaveLength(2);
    });

    it('should sort by MOST_REVIEWED option', () => {
        const sorted = sortingAlgorithms.sortNotes(notes, SortOption.MOST_REVIEWED);
        expect(sorted).toHaveLength(2);
    });

    it('should sort by CONTROVERSIAL option', () => {
        const sorted = sortingAlgorithms.sortNotes(notes, SortOption.CONTROVERSIAL);
        expect(sorted).toHaveLength(2);
    });

    it('should sort by TRENDING option', () => {
        const sorted = sortingAlgorithms.sortNotes(notes, SortOption.TRENDING);
        expect(sorted).toHaveLength(2);
    });

    it('should sort by HOT_SCORE option', () => {
        const sorted = sortingAlgorithms.sortNotes(notes, SortOption.HOT_SCORE);
        expect(sorted).toHaveLength(2);
    });
});
