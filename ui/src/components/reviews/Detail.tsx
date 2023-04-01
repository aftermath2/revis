import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { OfflineBolt } from '@mui/icons-material';

import { Note, Review, Zap } from '../../lib/types';
import { sampleNotes } from '../../data/sampleData';
import { ReviewCard, ZapCard } from '.';
import { Button } from '../common';
import { useNostrContext } from '../../contexts';
import styles from './Detail.module.css';

const ReviewDetail = () => {
    const { noteID, reviewId } = useParams<{ noteID: string; reviewId: string }>();
    const navigate = useNavigate();
    const { nostrClient } = useNostrContext();
    const [note, setNote] = useState<Note | null>(null);
    const [review, setReview] = useState<Review | null>(null);

    useEffect(() => {
        const foundNote = sampleNotes.find(n => n.id === noteID);
        if (foundNote) {
            setNote(foundNote);
            const foundReview = foundNote.reviews?.find(r => r.id === reviewId);
            setReview(foundReview || null);
        }
    }, [noteID, reviewId]);

    const onZapSubmit = async (reviewID: string, amount: number, comment?: string) => {
        const zap: Zap = {
            id: Date.now().toString(),
            eventID: reviewID,
            username: await nostrClient.getSigner()?.getPublicKey() || 'Anonymous',
            avatar: 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&s=40',
            amount: amount,
            comment: comment,
            timestamp: new Date().toISOString()
        };

        // Update the review with the new zap
        if (review) {
            const updatedReview = {
                ...review,
                zaps: [...(review.zaps || []), zap]
            };
            setReview(updatedReview);
        }
    };

    const onNoteClick = () => {
        navigate(`/notes/${noteID}`);
    };

    if (!note || !review) {
        return (
            <div className={styles.container}>
                <div className={styles.notFound}>
                    <h2>Review not found</h2>
                    <p>The review you're looking for doesn't exist or has been removed.</p>
                    <Button
                        variant="secondary"
                        onClick={() => navigate('/')}
                    >
                        Go Home
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <div className={styles.noteSection}>
                <div className={styles.compactNoteHeader}>
                    <div className={styles.noteInfo}>
                        <span className={styles.reviewingLabel}>Reviewing:</span>
                        <span
                            className={styles.noteTitle}
                            onClick={onNoteClick}
                        >
                            {note.title}
                        </span>
                    </div>
                </div>
            </div>

            <div className={styles.reviewSection}>
                <ReviewCard
                    review={review}
                    isUserCreated={false}
                    onZapSubmit={onZapSubmit}
                    disableTruncation={true}
                />
            </div>

            <div className={styles.initialZapSection}>
                <div className={styles.initialZapContent}>
                    <span className={styles.initialZapLabel}>Reviewer zap</span>
                </div>
                <div className={styles.initialZapValue}>
                    <OfflineBolt className={styles.initialZapIcon} />
                    <span className={styles.initialZapAmount}>{review.zapAmount.toLocaleString()}</span>
                </div>
            </div>

            {review.zaps && review.zaps.length > 0 && (
                <div className={styles.zapsSection}>
                    <div className={styles.zapsSectionHeader}>
                        <h3>Zaps</h3>
                    </div>
                    <div className={styles.zapsList}>
                        {[...review.zaps]
                            .sort((a, b) => {
                                const aTime = new Date(a.timestamp).getTime();
                                const bTime = new Date(b.timestamp).getTime();
                                return bTime - aTime; // Newest first
                            })
                            .map((zap) => (
                                <ZapCard key={zap.id} zap={zap} />
                            ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ReviewDetail;
