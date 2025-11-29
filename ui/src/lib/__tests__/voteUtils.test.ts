import { calculateRating, formatNumber, calculateNoteZaps } from '../zapUtils';
import { Review, Note } from '../types';

// Helper function to create mock review
const createMockReview = (rating: number, zapAmount: number, overrides = {}): Review => ({
    id: Math.random(),
    authorPublicKey: 'Test Author',
    avatar: 'https://example.com/avatar.jpg',
    comment: 'Test comment',
    rating,
    createdAt: new Date().toISOString(),
    zapAmount: zapAmount,
    ...overrides
});

describe('calculateWeightedRating', () => {
    describe('Basic functionality', () => {
        it('should return 0 for empty reviews array', () => {
            const result = calculateRating([]);
            expect(result).toBe(0);
        });

        it('should return 0 for null reviews', () => {
            const result = calculateRating(null as any);
            expect(result).toBe(0);
        });

        it('should return 0 for undefined reviews', () => {
            const result = calculateRating(undefined as any);
            expect(result).toBe(0);
        });

        it('should calculate simple average when all Weights are equal', () => {
            const reviews = [
                createMockReview(1, 10),
                createMockReview(5, 10),
                createMockReview(5, 10)
            ];
            const result = calculateRating(reviews);
            // (1*10 + 5*10 + 5*10) / (10 + 10 + 10) = 110/30 = 3.67
            expect(result).toBeCloseTo(3.67, 2);
        });

        it('should return the single rating when only one review exists', () => {
            const reviews = [createMockReview(4, 10)];
            const result = calculateRating(reviews);
            expect(result).toBe(4);
        });

        it('should return the single rating even with Weight of 1', () => {
            const reviews = [createMockReview(3.5, 1)];
            const result = calculateRating(reviews);
            expect(result).toBe(3.5);
        });
    });

    describe('Weighted average calculations', () => {
        it('should weight higher Weight reviews more heavily', () => {
            const reviews = [
                createMockReview(5, 100), // High weight
                createMockReview(1, 10),  // Low weight
            ];
            const result = calculateRating(reviews);
            // (5*100 + 1*10) / (100 + 10) = 510/110 = 4.636...
            expect(result).toBeCloseTo(4.636, 2);
            expect(result).toBeGreaterThan(4); // Should be closer to 5 than to 1
        });

        it('should calculate correct weighted rating with varied weights', () => {
            const reviews = [
                createMockReview(5, 100),
                createMockReview(3, 10),
                createMockReview(4, 20)
            ];
            const result = calculateRating(reviews);
            // (5*100 + 3*10 + 4*20) / (100 + 10 + 20) = 610/130 = 4.692...
            expect(result).toBeCloseTo(4.692, 2);
        });

        it('should handle fractional ratings correctly', () => {
            const reviews = [
                createMockReview(4.5, 20),
                createMockReview(3.2, 10),
                createMockReview(2.8, 5)
            ];
            const result = calculateRating(reviews);
            // (4.5*20 + 3.2*10 + 2.8*5) / (20 + 10 + 5) = 136/35 = 3.886...
            expect(result).toBeCloseTo(3.886, 2);
        });

        it('should produce result between min and max ratings when weights are equal', () => {
            const reviews = [
                createMockReview(1, 1),
                createMockReview(5, 1)
            ];
            const result = calculateRating(reviews);
            // (1*1 + 5*1) / (1 + 1) = 6/2 = 3
            expect(result).toBe(3);
        });

        it('should handle many reviews with different weights', () => {
            const reviews = [
                createMockReview(5, 50),
                createMockReview(4, 30),
                createMockReview(3, 15),
                createMockReview(2, 10),
                createMockReview(1, 5)
            ];
            const result = calculateRating(reviews);
            // (5*50 + 4*30 + 3*15 + 2*10 + 1*5) / (50+30+15+10+5) = 440/110 = 4.0
            expect(result).toBeCloseTo(4.0, 2);
        });
    });

    describe('Extreme values', () => {
        it('should handle very large weights', () => {
            const reviews = [
                createMockReview(5, Number.MAX_SAFE_INTEGER / 2),
                createMockReview(1, 1)
            ];
            const result = calculateRating(reviews);
            expect(result).toBeCloseTo(5, 1); // Should be very close to 5
            expect(result).toBeGreaterThan(4.9);
        });

        it('should handle very small weights', () => {
            const reviews = [
                createMockReview(5, 0.001),
                createMockReview(1, 0.001)
            ];
            const result = calculateRating(reviews);
            // (5*0.001 + 1*0.001) / (0.001 + 0.001) = 0.006/0.002 = 3
            expect(result).toBe(3);
        });

        it('should handle maximum rating values', () => {
            const reviews = [
                createMockReview(5, 10),
                createMockReview(5, 20),
                createMockReview(5, 30)
            ];
            const result = calculateRating(reviews);
            expect(result).toBe(5);
        });

        it('should handle minimum rating values', () => {
            const reviews = [
                createMockReview(1, 10),
                createMockReview(1, 20),
                createMockReview(1, 30)
            ];
            const result = calculateRating(reviews);
            expect(result).toBe(1);
        });
    });

    describe('Real-world scenarios', () => {
        it('should calculate correctly for a highly upvoted review dominating', () => {
            const reviews = [
                createMockReview(5, 99),  // Highly upvoted
                createMockReview(1, 1),   // Single downvote
            ];
            const result = calculateRating(reviews);
            // (5*99 + 1*1) / (99 + 1) = 496/100 = 4.96
            expect(result).toBeCloseTo(4.96, 2);
        });

        it('should calculate correctly for mixed sentiment with equal engagement', () => {
            const reviews = [
                createMockReview(5, 25),
                createMockReview(4, 25),
                createMockReview(3, 25),
                createMockReview(2, 25)
            ];
            const result = calculateRating(reviews);
            // (5*25 + 4*25 + 3*25 + 2*25) / (25*4) = 350/100 = 3.5
            expect(result).toBe(3.5);
        });

        it('should handle scenario where recent review with high engagement shifts rating', () => {
            const reviews = [
                createMockReview(3, 5),   // Old reviews with low engagement
                createMockReview(3, 5),
                createMockReview(3, 5),
                createMockReview(5, 85),  // New review with high engagement
            ];
            const result = calculateRating(reviews);
            // (3*5 + 3*5 + 3*5 + 5*85) / (5 + 5 + 5 + 85) = 470/100 = 4.7
            expect(result).toBeCloseTo(4.7, 2);
        });

        it('should match example from documentation', () => {
            const reviews = [
                createMockReview(5, 100),
                createMockReview(3, 10),
                createMockReview(4, 20)
            ];
            const result = calculateRating(reviews);
            // Example states: (5*100 + 3*10 + 4*20) / (100 + 10 + 20) = 610/130 = 4.692...
            expect(result).toBeCloseTo(4.692, 2);
        });

        it('should match second example from documentation', () => {
            const reviews = [
                createMockReview(1, 10),
                createMockReview(5, 10),
                createMockReview(5, 10)
            ];
            const result = calculateRating(reviews);
            // Example states: (1*10 + 5*10 + 5*10) / (10 + 10 + 10) = 3.67
            expect(result).toBeCloseTo(3.67, 2);
        });
    });

    describe('Array immutability', () => {
        it('should not modify the original reviews array', () => {
            const reviews = [
                createMockReview(5, 10),
                createMockReview(3, 20)
            ];
            const originalReviews = JSON.parse(JSON.stringify(reviews));

            calculateRating(reviews);

            expect(reviews).toEqual(originalReviews);
        });
    });

    describe('Performance', () => {
        it('should handle large number of reviews efficiently', () => {
            const reviews = Array.from({ length: 10000 }, (_, i) =>
                createMockReview(
                    Math.floor(Math.random() * 5) + 1,
                    Math.floor(Math.random() * 100)
                )
            );

            const start = performance.now();
            const result = calculateRating(reviews);
            const end = performance.now();

            expect(result).toBeGreaterThanOrEqual(1);
            expect(result).toBeLessThanOrEqual(5);
            expect(end - start).toBeLessThan(100); // Should complete within 100ms
        });
    });
});

describe('formatNumber', () => {
    describe('Basic formatting', () => {
        it('should format numbers with comma separators', () => {
            expect(formatNumber(1000)).toBe('1,000');
            expect(formatNumber(1000000)).toBe('1,000,000');
        });

        it('should handle small numbers without commas', () => {
            expect(formatNumber(0)).toBe('0');
            expect(formatNumber(5)).toBe('5');
            expect(formatNumber(99)).toBe('99');
            expect(formatNumber(999)).toBe('999');
        });

        it('should handle negative numbers with comma separators', () => {
            expect(formatNumber(-1000)).toBe('-1,000');
            expect(formatNumber(-1000000)).toBe('-1,000,000');
        });

        it('should handle negative small numbers', () => {
            expect(formatNumber(-5)).toBe('-5');
            expect(formatNumber(-99)).toBe('-99');
            expect(formatNumber(-999)).toBe('-999');
        });
    });

    describe('Large numbers', () => {
        it('should format thousands correctly', () => {
            expect(formatNumber(1234)).toBe('1,234');
            expect(formatNumber(9999)).toBe('9,999');
            expect(formatNumber(10000)).toBe('10,000');
            expect(formatNumber(99999)).toBe('99,999');
        });

        it('should format millions correctly', () => {
            expect(formatNumber(1234567)).toBe('1,234,567');
            expect(formatNumber(9999999)).toBe('9,999,999');
        });

        it('should format billions correctly', () => {
            expect(formatNumber(1234567890)).toBe('1,234,567,890');
        });

        it('should handle very large numbers', () => {
            expect(formatNumber(999999999999)).toBe('999,999,999,999');
            expect(formatNumber(1000000000000)).toBe('1,000,000,000,000');
        });
    });

    describe('Decimal numbers', () => {
        it('should format decimals with locale-specific formatting', () => {
            const result = formatNumber(1234.56);
            // Note: toLocaleString() may format decimals differently based on locale
            expect(result).toContain('1');
            expect(result).toContain('234');
        });

        it('should handle small decimals', () => {
            const result = formatNumber(0.5);
            expect(result).toContain('0');
        });

        it('should handle negative decimals', () => {
            const result = formatNumber(-1234.56);
            expect(result).toContain('-');
            expect(result).toContain('1');
            expect(result).toContain('234');
        });
    });

    describe('Edge cases', () => {
        it('should handle zero', () => {
            expect(formatNumber(0)).toBe('0');
        });

        it('should handle negative zero', () => {
            // In JavaScript, -0 is preserved by toLocaleString()
            expect(formatNumber(-0)).toBe('-0');
        });

        it('should handle 1', () => {
            expect(formatNumber(1)).toBe('1');
        });

        it('should handle -1', () => {
            expect(formatNumber(-1)).toBe('-1');
        });

        it('should handle Number.MAX_SAFE_INTEGER', () => {
            const result = formatNumber(Number.MAX_SAFE_INTEGER);
            expect(result).toContain('9');
            expect(result.includes(',')).toBe(true);
        });

        it('should handle very small positive number', () => {
            const result = formatNumber(0.001);
            expect(result).toContain('0');
        });

        it('should handle Infinity', () => {
            const result = formatNumber(Infinity);
            expect(typeof result).toBe('string');
        });

        it('should handle -Infinity', () => {
            const result = formatNumber(-Infinity);
            expect(typeof result).toBe('string');
        });

        it('should handle NaN', () => {
            const result = formatNumber(NaN);
            expect(typeof result).toBe('string');
        });
    });

    describe('Consistency', () => {
        it('should return string type', () => {
            expect(typeof formatNumber(0)).toBe('string');
            expect(typeof formatNumber(1000)).toBe('string');
            expect(typeof formatNumber(-5000)).toBe('string');
        });

        it('should be idempotent for same input', () => {
            const num = 123456;
            const result1 = formatNumber(num);
            const result2 = formatNumber(num);
            expect(result1).toBe(result2);
        });
    });

    describe('Real-world scenarios', () => {
        it('should format typical upvote counts', () => {
            expect(formatNumber(42)).toBe('42');
            expect(formatNumber(157)).toBe('157');
            expect(formatNumber(1234)).toBe('1,234');
            expect(formatNumber(98765)).toBe('98,765');
        });

        it('should format user counts', () => {
            expect(formatNumber(5000)).toBe('5,000');
            expect(formatNumber(25000)).toBe('25,000');
            expect(formatNumber(1000000)).toBe('1,000,000');
        });

        it('should format view counts', () => {
            expect(formatNumber(10000)).toBe('10,000');
            expect(formatNumber(500000)).toBe('500,000');
            expect(formatNumber(2500000)).toBe('2,500,000');
        });
    });
});

describe('calculateNoteVotes', () => {
    const createMockNote = (reviews: Review[]): Note => ({
        id: 1,
        title: 'Test Note',
        content: 'Test content',
        createdAt: new Date().toISOString(),
        categories: ['test'],
        reviews
    });

    it('should calculate total upvotes from reviews', () => {
        const note = createMockNote([
            createMockReview(5, 10),
            createMockReview(4, 20),
            createMockReview(3, 5)
        ]);

        const upvotes = calculateNoteZaps(note.reviews);
        expect(upvotes).toBe(35);
    });

    it('should return 0 upvotes for note with no reviews', () => {
        const note = createMockNote([]);
        const upvotes = calculateNoteZaps(note.reviews);
        expect(upvotes).toBe(0);
    });

    it('should ignore negative weights', () => {
        const note = createMockNote([
            createMockReview(5, 10),
            createMockReview(4, -5),
            createMockReview(3, 20)
        ]);

        const upvotes = calculateNoteZaps(note.reviews);
        expect(upvotes).toBe(30);
    });
});
