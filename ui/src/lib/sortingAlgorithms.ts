/**
 * Advanced sorting algorithms for notes
 * Provides multiple sophisticated ranking algorithms for different use cases
 */

import { type AnnotatedNote, SortOption } from './types';
import { calculateRating } from './zap';

export interface SortingAlgorithms {
    // Time-based sorting
    newest: (notes: AnnotatedNote[]) => AnnotatedNote[];
    oldest: (notes: AnnotatedNote[]) => AnnotatedNote[];

    // Quality-based sorting
    highestRated: (notes: AnnotatedNote[]) => AnnotatedNote[];

    // Popularity-based sorting
    mostPopular: (notes: AnnotatedNote[]) => AnnotatedNote[];

    // Engagement-based sorting
    mostReviewed: (notes: AnnotatedNote[]) => AnnotatedNote[];

    // Advanced sorting algorithms
    controversial: (notes: AnnotatedNote[]) => AnnotatedNote[];
    trending: (notes: AnnotatedNote[]) => AnnotatedNote[];

    // Universal sorting method
    sortNotes: (notes: AnnotatedNote[], sortOption: SortOption) => AnnotatedNote[];
}

/**
 * Engagement Score - Comprehensive activity measurement
 *
 * Combines zaps, reviews, and time factors
 */
export const calculateEngagementScore = (note: AnnotatedNote): number => {
    const [_, zaps] = calculateRating(note.reviewsMap);

    // Zap component (logarithmic to prevent dominance)
    const zapScore = Math.log(zaps + 1);

    // Review component (weighted by recency and depth)
    const reviewScore = Array.from(note.reviewsMap.keys()).reduce((sum, review) => {
        const reviewAge = (Date.now() - new Date(review.createdAt).getTime()) / (1000 * 60 * 60 * 24);
        const timeDecay = Math.exp(-reviewAge / 7); // 7-day time constant
        const reviewEngagement = Math.log(review.zapAmount + 1);
        return sum + timeDecay * (1 + reviewEngagement);
    }, 0);

    // Time factor (slight bonus for recent content)
    const hoursAge = (Date.now() - new Date(note.createdAt).getTime()) / (1000 * 60 * 60);
    const timeFactor = hoursAge < 24 ? 1.2 : hoursAge < 168 ? 1.1 : 1.0; // 24h and 7d bonuses

    return (zapScore + reviewScore * 2) * timeFactor;
};

/**
 * Trending Algorithm - Combination of quality, recency, and velocity
 *
 * Considers rate of engagement over time windows
 */
export const calculateTrendingScore = (note: AnnotatedNote): number => {
    const [_, zaps] = calculateRating(note.reviewsMap);
    const now = Date.now();
    const noteAge = (now - new Date(note.createdAt).getTime()) / (1000 * 60 * 60); // hours

    // Recent engagement (last 24 hours)
    const recentReviews = Array.from(note.reviewsMap.keys()).filter(review => {
        const reviewAge = (now - new Date(review.createdAt).getTime()) / (1000 * 60 * 60);
        return reviewAge <= 24;
    });
    
    // Velocity metrics
    const totalEngagement = zaps + note.reviewsMap.size;
    const recentEngagement = recentReviews.length;
    const velocity = noteAge > 0 ? totalEngagement / Math.max(noteAge, 1) : totalEngagement;

    // Quality component
    const quality = zaps > 0 ? Math.log(zaps + 1) / Math.log(10) : 0;

    // Trending score combines velocity and quality with recency bias
    const recencyBonus = Math.exp(-noteAge / 48); // 48-hour time constant

    return (velocity * 0.6 + quality * 0.4) * (1 + recencyBonus) * (1 + recentEngagement * 0.1);
};

/**
 * Controversy Score - Measures divisive content
 *
 * Controversy is measured by high engagement with mixed ratings.
 */
export const calculateControversyScore = (note: AnnotatedNote): number => {
    if (note.reviewsMap.size < 3) return 0; // Need enough reviews to be controversial

    const reviewList = Array.from(note.reviewsMap.keys());

    // Calculate rating variance as a measure of controversy
    const ratings = reviewList.map(r => r.rating);
    const averageRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
    const variance = ratings.reduce((sum, rating) => sum + Math.pow(rating - averageRating, 2), 0) / ratings.length;

    // High engagement with high rating variance indicates controversy
    const engagementScore = reviewList.reduce((sum, review) => sum + review.zapAmount + 1, 0);

    return variance * Math.log(engagementScore + 1);
};

/**
 * Complete sorting algorithms implementation
 */
export const sortingAlgorithms: SortingAlgorithms = {
    newest: (notes: AnnotatedNote[]) =>
        [...notes].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),

    oldest: (notes: AnnotatedNote[]) =>
        [...notes].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),

    highestRated: (notes: AnnotatedNote[]) =>
        [...notes].sort((a, b) => {
            const [aRating] = calculateRating(a.reviewsMap);
            const [bRating] = calculateRating(b.reviewsMap);
            return bRating - aRating;
        }),

    mostPopular: (notes: AnnotatedNote[]) =>
        [...notes].sort((a, b) => {
            const aScore = calculateEngagementScore(a);
            const bScore = calculateEngagementScore(b);
            return bScore - aScore;
        }),

    mostReviewed: (notes: AnnotatedNote[]) =>
        [...notes].sort((a, b) => {
            return b.reviewsMap.size - a.reviewsMap.size;
        }),

    controversial: (notes: AnnotatedNote[]) =>
        [...notes].sort((a, b) => calculateControversyScore(b) - calculateControversyScore(a)),

    trending: (notes: AnnotatedNote[]) =>
        [...notes].sort((a, b) => calculateTrendingScore(b) - calculateTrendingScore(a)),

    // Universal sorting method that maps SortOption to the appropriate algorithm
    sortNotes: (notes: AnnotatedNote[], sortOption: SortOption): AnnotatedNote[] => {
        switch (sortOption) {
            case SortOption.NEWEST:
                return sortingAlgorithms.newest(notes);
            case SortOption.OLDEST:
                return sortingAlgorithms.oldest(notes);
            case SortOption.HIGHEST_RATED:
                return sortingAlgorithms.highestRated(notes);
            case SortOption.MOST_POPULAR:
                return sortingAlgorithms.mostPopular(notes);
            case SortOption.MOST_REVIEWED:
                return sortingAlgorithms.mostReviewed(notes);
            case SortOption.CONTROVERSIAL:
                return sortingAlgorithms.controversial(notes);
            case SortOption.TRENDING:
                return sortingAlgorithms.trending(notes);
            case SortOption.HOT_SCORE:
                return sortingAlgorithms.trending(notes); // Use trending algorithm for hot score
            default:
                return [...notes];
        }
    }
};

export default sortingAlgorithms;
