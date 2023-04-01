/**
 * Advanced sorting algorithms for notes
 * Provides multiple sophisticated ranking algorithms for different use cases
 */

import { Note, SortOption } from './types';
import { calculateNoteZaps, calculateRating } from './zapUtils';

export interface SortingAlgorithms {
    // Time-based sorting
    newest: (notes: Note[]) => Note[];
    oldest: (notes: Note[]) => Note[];

    // Quality-based sorting
    highestRated: (notes: Note[]) => Note[];

    // Popularity-based sorting  
    mostPopular: (notes: Note[]) => Note[];

    // Engagement-based sorting
    mostReviewed: (notes: Note[]) => Note[];

    // Advanced sorting algorithms
    controversial: (notes: Note[]) => Note[];
    trending: (notes: Note[]) => Note[];

    // Universal sorting method
    sortNotes: (notes: Note[], sortOption: SortOption) => Note[];
}

/** Wilson Score Interval - Statistical confidence interval for ratings */
export const calculateWilsonScore = (zaps: number, totalZaps: number = zaps): number => {
    if (totalZaps === 0) return 0;

    const p = zaps / totalZaps; // proportion of positive ratings
    const z = 1.96; // 95% confidence interval (z-score)

    // Wilson score lower bound formula
    const numerator = p + (z * z) / (2 * totalZaps) - z * Math.sqrt(((p * (1 - p)) + (z * z) / (4 * totalZaps)) / totalZaps);
    const denominator = 1 + (z * z) / totalZaps;

    return numerator / denominator;
};

/**
 * Engagement Score - Comprehensive activity measurement
 * 
 * Combines zaps, reviews, and time factors
 */
export const calculateEngagementScore = (note: Note): number => {
    const zaps = calculateNoteZaps(note.reviews);
    const { reviews, createdAt } = note;

    // Zap component (logarithmic to prevent dominance)
    const zapScore = Math.log(zaps + 1);

    // Review component (weighted by recency and depth)
    const reviewScore = reviews.reduce((sum, review) => {
        const reviewAge = (Date.now() - new Date(review.createdAt || createdAt).getTime()) / (1000 * 60 * 60 * 24);
        const timeDecay = Math.exp(-reviewAge / 7); // 7-day half-life
        const reviewEngagement = Math.log(review.zapAmount + 1);
        return sum + timeDecay * (1 + reviewEngagement);
    }, 0);

    // Time factor (slight bonus for recent content)
    const hoursAge = (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60);
    const timeFactor = hoursAge < 24 ? 1.2 : hoursAge < 168 ? 1.1 : 1.0; // 24h and 7d bonuses

    return (zapScore + reviewScore * 2) * timeFactor;
};

/**
 * Trending Algorithm - Combination of quality, recency, and velocity
 * 
 * Considers rate of engagement over time windows
 */
export const calculateTrendingScore = (note: Note): number => {
    const zaps = calculateNoteZaps(note.reviews);
    const { reviews, createdAt } = note;
    const now = Date.now();
    const noteAge = (now - new Date(createdAt).getTime()) / (1000 * 60 * 60); // hours

    // Recent engagement (last 24 hours)
    const recentReviews = reviews.filter(review => {
        const reviewAge = (now - new Date(review.createdAt || createdAt).getTime()) / (1000 * 60 * 60);
        return reviewAge <= 24;
    });

    // Velocity metrics
    const totalEngagement = zaps + reviews.length;
    const recentEngagement = recentReviews.length;
    const velocity = noteAge > 0 ? totalEngagement / Math.max(noteAge, 1) : totalEngagement;

    // Quality component
    const quality = zaps > 0 ? Math.log(zaps + 1) / Math.log(10) : 0;

    // Trending score combines velocity and quality with recency bias
    const recencyBonus = Math.exp(-noteAge / 48); // 48-hour half-life

    return (velocity * 0.6 + quality * 0.4) * (1 + recencyBonus) * (1 + recentEngagement * 0.1);
};

/**
 * Controversy Score - Measures divisive content
 * 
 * Controversy is measured by high engagement with mixed ratings.
 */
export const calculateControversyScore = (note: Note): number => {
    const { reviews } = note;

    if (reviews.length < 3) return 0; // Need enough reviews to be controversial

    // Calculate rating variance as a measure of controversy
    const ratings = reviews.map(r => r.rating);
    const averageRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
    const variance = ratings.reduce((sum, rating) => sum + Math.pow(rating - averageRating, 2), 0) / ratings.length;

    // High engagement with high rating variance indicates controversy
    const engagementScore = reviews.reduce((sum, review) => sum + review.zapAmount + 1, 0);

    return variance * Math.log(engagementScore + 1);
};

/**
 * Complete sorting algorithms implementation
 */
export const sortingAlgorithms: SortingAlgorithms = {
    newest: (notes: Note[]) =>
        [...notes].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),

    oldest: (notes: Note[]) =>
        [...notes].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()),

    highestRated: (notes: Note[]) =>
        [...notes].sort((a, b) => {
            // Use weighted average rating with confidence weighting
            const aRating = calculateRating(a.reviews);
            const bRating = calculateRating(b.reviews);
            return bRating - aRating;
        }),

    mostPopular: (notes: Note[]) =>
        [...notes].sort((a, b) => {
            const aScore = calculateEngagementScore(a);
            const bScore = calculateEngagementScore(b);
            return bScore - aScore;
        }),

    mostReviewed: (notes: Note[]) =>
        [...notes].sort((a, b) => {
            return b.reviews.length - a.reviews.length;
        }),

    controversial: (notes: Note[]) =>
        [...notes].sort((a, b) => calculateControversyScore(b) - calculateControversyScore(a)),

    trending: (notes: Note[]) =>
        [...notes].sort((a, b) => calculateTrendingScore(b) - calculateTrendingScore(a)),

    // Universal sorting method that maps SortOption to the appropriate algorithm
    sortNotes: (notes: Note[], sortOption: SortOption): Note[] => {
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
