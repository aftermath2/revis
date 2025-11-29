import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { type Review } from '../../../lib/types';
import { useNostrContext } from '../../../contexts';
import styles from './RecentList.module.css';
import RecentCard from './Card';


const RecentReviews = () => {
    const { nostrClient } = useNostrContext();
    const location = useLocation();
    const navigate = useNavigate();

    const [reviews, setReviews] = useState<Review[]>([]);

    useEffect(() => {
        async function loadReviews() {
            const notes = await nostrClient.listNotes();
            let rr = await nostrClient.listReviews(notes.map((note) => note.id));
            rr = rr.sort((a, b) => b.createdAt - a.createdAt).slice(0, 10);
            setReviews(rr);
        }
        
        void loadReviews();
    })

    

    const onReviewClick = (reviewID: string) => {
        void navigate(`/reviews/${reviewID}`);
    };

    if (location.pathname !== '/') {
        return null;
    }

    if (reviews.length === 0) {
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
                {reviews.map((review, index) => (
                    <RecentCard review={review} index={index} onReviewClick={onReviewClick} />
                ))}
            </div>
        </div>
    );
};

export default RecentReviews;
