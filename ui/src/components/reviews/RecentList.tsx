import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { Review } from '../../lib/types';
import { sampleNotes } from '../../data/sampleData';
import { Avatar } from '../common';
import styles from './RecentList.module.css';

interface ReviewWithMetadata extends Review {
    noteID: string;
    noteTitle: string;
}

const RecentReviews = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Extract all reviews from all notes and sort by creation date, taking only the most recent 15
    const recentReviews = useMemo(() => {
        const allReviews: ReviewWithMetadata[] = [];

        // TODO: pull most recent reviews by note kind ID
        sampleNotes.forEach(note => {
            if (note.reviews && note.reviews.length > 0) {
                note.reviews.forEach(review => {
                    allReviews.push({
                        ...review,
                        noteID: note.id,
                        noteTitle: note.title
                    });
                });
            }
        });

        // Sort by creation date, most recent first, and take only the top 10
        return allReviews
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 10);
    }, []);

    const formatTimeElapsed = (dateString: string): string => {
        const now = new Date();
        const reviewDate = new Date(dateString);
        const diffInSeconds = Math.floor((now.getTime() - reviewDate.getTime()) / 1000);

        if (diffInSeconds < 60) {
            return 'now';
        }

        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) {
            return `${diffInMinutes}m`;
        }

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) {
            return `${diffInHours}h`;
        }

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 30) {
            return `${diffInDays}d`;
        }

        const diffInMonths = Math.floor(diffInDays / 30);
        return `${diffInMonths}mo`;
    };

    const onReviewClick = (noteID: string, reviewID: string) => {
        navigate(`/notes/${noteID}/reviews/${reviewID}`);
    };

    if (location.pathname !== '/') {
        return null;
    }

    if (recentReviews.length === 0) {
        return (
            <p className={styles.noReviews}>No recent reviews.</p>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3>Recent Reviews</h3>
            </div>

            <div className={styles.list}>
                {recentReviews.map((review, index) => (
                    <div className={styles.item} key={`${review.id}-${index}`}>
                        <Avatar url={review.avatar} username={review.author} />
                        <div
                            onClick={() => onReviewClick(review.noteID, review.id)}
                        >
                            <div className={styles.itemContent}>
                                <div className={styles.itemHeader}>
                                    <span className={styles.itemAuthor}>
                                        {review.author}
                                    </span>
                                    <span className={styles.itemTimeElapsed}>
                                        {formatTimeElapsed(review.createdAt)}
                                    </span>
                                </div>

                                <p className={styles.itemComment}>
                                    {review.comment}
                                </p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RecentReviews;
