import { Review } from './types';

/**
 * Formats numbers with comma separators for better readability.
 * @param num - The number to format
 * @returns Formatted string with comma separators
 */
export const formatNumber = (num: number): string => {
    return num.toLocaleString();
};

/**
 * Calculates the total weigth for a note based on its reviews.
 * Includes both the initial review weights and all zaps.
 * @param reviews - The reviews to calculate zaps for
 * @returns Total weight (initial review weights + all zaps)
 */
export const calculateNoteZaps = (reviews: Review[]): number => {
    let total = 0;

    for (const review of reviews) {
        total += review.zapAmount;

        if (review.votes && review.votes.length > 0) {
            const amount = review.votes.reduce((sum, zap) => sum + zap.amount, 0);
            total += amount;
        }
    }

    return total;
};

/**
 * Calculates a weighted average rating for a note based on review ratings and their weigths.
 * Reviews with higher weigths have more influence on the final rating.
 * Similar to how S&P 500 companies are weighted by market capitalization.
 *
 * @param reviews - The reviews to calculate the weighted rating for
 * @returns Weighted average rating between 1 and 5, or 0 if no reviews exist
 */
export const calculateRating = (reviews: Review[]): number => {
    if (!reviews || reviews.length === 0) {
        return 0;
    }

    let weightedRating = 0;
    let totalAmount = 0;

    for (const review of reviews) {
        weightedRating += review.rating * review.zapAmount;
        totalAmount += review.zapAmount;
    }

    return weightedRating / totalAmount;
};
