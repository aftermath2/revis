import { useState, useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { type Review } from '../../lib/types';
import { ReviewsList } from '../reviews';
import { LoadingSpinner } from '../common';
import { useInfiniteScroll } from '../../hooks';
import { ITEMS_PER_LOAD } from '../../lib/constants';
import styles from './ReviewsList.module.css';
import { useNostrContext } from '../../contexts';

const UsersReviewsList = () => {
    const { nostrClient } = useNostrContext();
    const navigate = useNavigate();
    const { publicKey } = useParams<{ publicKey: string }>();
    
    const [reviews, setReviews] = useState<Review[]>([]);

    const loadReviews = useCallback(async (until?: number) => {
        if (!publicKey) throw new Error("publicKey not provided")

        const reviews = await nostrClient.listUserReviews(publicKey, ITEMS_PER_LOAD, until)
        // Sort from newest to oldest
        const sortedReviews = reviews.sort((a, b) => b.createdAt - a.createdAt);

        setReviews(sortedReviews);
    }, [publicKey, nostrClient]);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        void loadReviews();
    }, [loadReviews]);

    const { isLoading, loadMoreRef } = useInfiniteScroll(() => {
        return loadReviews(reviews[reviews.length -1].createdAt);
    }, true);

    const onReviewClick = (reviewID: string) => {
        void navigate(`/reviews/${reviewID}`);
    };

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <ReviewsList
                    reviews={reviews}
                    onReviewClick={onReviewClick}
                />

                {/* Infinite scroll trigger */}
                <div ref={loadMoreRef} className={styles.loadMoreTrigger}>
                    {isLoading && <LoadingSpinner />}
                </div>
            </div>
        </div>
    );
};

export default UsersReviewsList;
