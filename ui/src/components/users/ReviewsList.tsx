import { useMemo, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { sampleNotes } from '../../data/sampleData';
import { Review } from '../../lib/types';
import { ReviewsList } from '../reviews';
import { LoadingSpinner } from '../common';
import { useInfiniteScroll } from '../../hooks';
import { ITEMS_PER_LOAD } from '../../lib/constants';
import styles from './ReviewsList.module.css';

const UsersReviewsList = () => {
    const navigate = useNavigate();
    const { username } = useParams<{ username: string }>();
    const [displayedCount, setDisplayedCount] = useState(ITEMS_PER_LOAD);
    const displayUsername = username || 'User';

    // Get all user's reviews from all notes
    const allUserReviews = useMemo(() => {
        // TODO: fetch reviews specifically for the user
        const reviews: Review[] = [];
        sampleNotes.forEach(note => {
            if (note.reviews) {
                note.reviews.forEach(review => {
                    if (review.author === username) {
                        reviews.push(review);
                    }
                });
            }
        });

        return reviews.sort((a, b) => {
            if (!a.createdAt || !b.createdAt) return 0;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
    }, [username]);

    // Get displayed reviews based on current count
    const displayedReviews = useMemo(() => {
        return allUserReviews.slice(0, displayedCount);
    }, [allUserReviews, displayedCount]);

    const hasMore = displayedCount < allUserReviews.length;

    const loadMore = useCallback(() => {
        setDisplayedCount(prev => prev + ITEMS_PER_LOAD);
    }, []);

    const { isLoading, loadMoreRef } = useInfiniteScroll(loadMore, hasMore);

    const onReviewClick = (reviewID: string) => {
        // Find which note contains this review
        // TODO: review item will have the note ID, no need to search for it
        const note = sampleNotes.find(note =>
            note.reviews?.some(review => review.id === reviewID)
        );
        if (note) {
            navigate(`/notes/${note.id}/reviews/${reviewID}`);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <ReviewsList
                    reviews={displayedReviews}
                    title={`${displayUsername}'s Reviews`}
                    emptyMessage={`${displayUsername} hasn't written any reviews yet.`}
                    onReviewClick={onReviewClick}
                />

                {/* Infinite scroll trigger */}
                {hasMore && (
                    <div ref={loadMoreRef} className={styles.loadMoreTrigger}>
                        {isLoading && <LoadingSpinner />}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UsersReviewsList;
