import { useState, useMemo, memo } from 'react';

import { Review, Zap } from '../../lib/types';
import { calculateWilsonScore } from '../../lib/sortingAlgorithms';
import { AddReviewForm, ReviewCard } from './';
import { Button, LoadingSpinner } from '../common';
import { ITEMS_PER_LOAD } from '../../lib/constants';
import { useInfiniteScroll } from '../../hooks';
import { useNostrContext } from '../../contexts';
import styles from './List.module.css';

interface ReviewsListProps {
    reviews: Review[];
    onAddReview?: (review: Review) => void;
    onReviewClick?: (reviewID: string) => void;
    showAddButton?: boolean;
    title?: string;
    emptyMessage?: string;
}

export const ReviewsList = memo((props: ReviewsListProps) => {
    const {
        reviews,
        onAddReview,
        onReviewClick,
        showAddButton = false,
        title = "Reviews",
        emptyMessage = "No reviews yet. Be the first to add a review!"
    } = props;

    const { nostrClient, setShowLoginModal } = useNostrContext();
    
    const [sortedReviews, setSortedReviews] = useState<Review[]>([]);
    const [visibleReviews, setVisibleReviews] = useState(ITEMS_PER_LOAD / 2);
    const [isAddingReview, setIsAddingReview] = useState(false);
    const [userCreatedReviews, setUserCreatedReviews] = useState<Set<string>>(new Set());
    const hasMoreReviews = visibleReviews < sortedReviews.length;

    // Sort reviews by initial Wilson score for stable ordering
    useMemo(() => {
        const scores: Record<string, number> = {};
        reviews.forEach(review => {
            scores[review.id] = calculateWilsonScore(review.zapAmount);
        });

        const sortedList = [...reviews].sort((a, b) => {
            const aIsUserCreated = userCreatedReviews.has(a.id!);
            const bIsUserCreated = userCreatedReviews.has(b.id!);

            if (aIsUserCreated && !bIsUserCreated) return -1;
            if (!aIsUserCreated && bIsUserCreated) return 1;

            // For existing reviews, use initial Wilson scores for stable ordering
            const aScore = scores[a.id!] ?? 0;
            const bScore = scores[b.id!] ?? 0;

            if (aScore !== bScore) {
                return bScore - aScore; // Sort by initial Wilson score descending
            }

            // For new reviews, use creation time
            const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;

            return bTime - aTime; // Newest first
        });

        setSortedReviews(sortedList);
    }, [reviews, userCreatedReviews]);

    const loadMoreReviews = () => {
        setVisibleReviews(prev => Math.min(prev + ITEMS_PER_LOAD, sortedReviews.length));
    };

    const { isLoading, loadMoreRef } = useInfiniteScroll(loadMoreReviews, hasMoreReviews);

    const onAddReviewClick = () => {
        if (!nostrClient.getSigner()) {
            setShowLoginModal(true);
            return;
        }

        setIsAddingReview(true);
    }

    const handleAddReview = (review: Review) => {
        if (onAddReview) {
            onAddReview(review);
        }
        setUserCreatedReviews(prev => new Set(prev).add(review.id!));
        setIsAddingReview(false);
    };

    const onCancelReview = () => {
        setIsAddingReview(false);
    };

    const onZapSubmit = async (reviewID: string, amount: number, comment?: string) => {
        const pubKey = await nostrClient.getSigner()?.getPublicKey();
        const newZap: Zap = {
            id: Date.now().toString(),
            eventID: '',
            username: pubKey || 'Anonymous',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${pubKey || 'anonymous'}`,
            amount: amount,
            comment: comment,
            timestamp: new Date().toISOString()
        };

        // Update the reviews array with the new zap
        setSortedReviews(prevReviews => {
            return prevReviews.map(review => {
                if (review.id === reviewID) {
                    const updatedZaps = [...(review.zaps || []), newZap];
                    return {
                        ...review,
                        zaps: updatedZaps
                    };
                }
                return review;
            });
        });
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3>{title}</h3>
                {showAddButton && !isAddingReview && (
                    <Button
                        variant='primary'
                        size='small'
                        onClick={onAddReviewClick}
                    >
                        Add Review
                    </Button>
                )}
            </div>

            {showAddButton && isAddingReview && (
                <AddReviewForm
                    onAddReview={handleAddReview}
                    onCancel={onCancelReview}
                />
            )}

            {sortedReviews.length === 0 ? (
                <p className={styles.noReviews}>{emptyMessage}</p>
            ) : (
                <div>
                    <div className={styles.list}>
                        {sortedReviews.slice(0, visibleReviews).map((review) => (
                            <ReviewCard
                                key={review.id}
                                review={review}
                                isUserCreated={userCreatedReviews.has(review.id!)}
                                onReviewClick={onReviewClick}
                                onZapSubmit={onZapSubmit}
                            />
                        ))}
                    </div>

                    {hasMoreReviews && isLoading && (
                        <LoadingSpinner message='Loading more reviews...' />
                    )}

                    {!hasMoreReviews && (
                        <div className={styles.endMessage}>
                            <p>You've seen all reviews!</p>
                        </div>
                    )}

                    <div ref={loadMoreRef} />
                </div>
            )}
        </div>
    );
});

export default ReviewsList;
