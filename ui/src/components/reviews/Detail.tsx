import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { OfflineBolt } from '@mui/icons-material';

import { type Note, type Review, type Zap } from '../../lib/types';
import { ReviewCard, ZapCard } from '.';
import { Button } from '../common';
import { useNostrContext } from '../../contexts';
import { ITEMS_PER_LOAD } from '../../lib/constants';
import { type NostrEvent } from 'nostr-tools';
import styles from './Detail.module.css';

const ReviewDetail = () => {
    const { nostrClient } = useNostrContext();
    const navigate = useNavigate();
    const { reviewID } = useParams<{ reviewID: string }>();

    const [review, setReview] = useState<Review>();
    const [reviewEvent, setReviewEvent] = useState<NostrEvent>();
    const [note, setNote] = useState<Note>();
    const [zaps, setZaps] = useState<Zap[]>([]);

    useEffect(() => {
        async function loadReview() {
            if (!reviewID) throw new Error("reviewID not provided");
    
            const [reviewObj, reviewEvent] = await nostrClient.getReview(reviewID);
            setReview(reviewObj);
            setReviewEvent(reviewEvent)
        }

        async function loadNote() {
            const [note] = await nostrClient.getNote(review?.noteID || "");
            setNote(note);
        }

        async function loadZaps() {
            if (!reviewID) throw new Error("reviewID not provided");

            const zapList = await nostrClient.listZaps(reviewID, ITEMS_PER_LOAD);
            zapList.sort((a, b) => b.createdAt - a.createdAt);
            setZaps(zapList);
        }

        void loadReview();
        void loadNote();
        void loadZaps();
    });

    const onZapSubmit = async (reviewID: string, amount: number, comment?: string) => {
        if (!reviewEvent) throw new Error("Review event not found");

        const zapRequest = await nostrClient.createZapRequest(reviewEvent, amount, comment);
        await nostrClient.publish(zapRequest);

        const zap: Zap = {
            id: Date.now().toString(),
            eventID: reviewID,
            authorPublicKey: await nostrClient.getSigner()?.getPublicKey() || "Anonymous",
            recipient: review?.authorPublicKey || "",
            amount: amount,
            comment: comment,
            createdAt: Date.now()
        };
        // Add the zap to the top of the list
        setZaps([...[zap], ...zaps]);
    };

    const onNoteClick = () => {
        void navigate(`/notes/${review?.noteID}`);
    };

    if (!review) {
        return (
            <div className={styles.container}>
                <div className={styles.notFound}>
                    <h2>Review not found</h2>
                    <p>The review you're looking for doesn't exist or has been removed.</p>
                    <Button
                        variant="secondary"
                        onClick={() => void navigate('/')}
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
                            {note?.title}
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

            {zaps && zaps.length > 0 && (
                <div className={styles.zapsSection}>
                    <div className={styles.zapsSectionHeader}>
                        <h3>Zaps</h3>
                    </div>
                    <div className={styles.zapsList}>
                        {zaps
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
