import { useEffect, useState, useRef } from 'react';
import { useLocation } from 'react-router-dom';

import { type Review } from '../../../lib/types';
import { useNostrContext } from '../../../contexts';
import styles from './List.module.css';
import RecentCard from './Card';
import { LoadingSpinner } from '../../common';

const RecentReviews = () => {
    const { nostrClient } = useNostrContext();
    const location = useLocation();

    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const loadedRef = useRef(false);

    useEffect(() => {
        if (location.pathname !== '/') {
            return;
        }

        if (loadedRef.current) return;
        loadedRef.current = true;

        async function loadReviews() {
            const notes = await nostrClient.listNotes();
            const noteIDs = notes.map((note) => note.id);

            // Loading unlimited reviews, then splicing to use the same queries as in notes/List.tsx
            // and take advantage of cached queries.
            const reviewList = await nostrClient.listReviews(noteIDs);
            setReviews(reviewList.sort((a, b) => b.createdAt - a.createdAt).splice(0, 10));
            setIsLoading(false);
        }
        
        void loadReviews();
    }, [nostrClient, location])

    if (location.pathname !== '/') {
        return;
    }

    if (reviews.length === 0) {
        if (isLoading) {
            return <LoadingSpinner />
        }

        return (
            <p className={styles.noReviews}>No recent reviews</p>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3>Recent Reviews</h3>
            </div>

            <div className={styles.list}>
                {reviews.map((review) => (
                    <RecentCard review={review} key={review.id} />
                ))}
            </div>
        </div>
    );
};

export default RecentReviews;
