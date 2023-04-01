import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroll-component';
import { nip19, type NostrEvent } from 'nostr-tools';
import { OfflineBolt } from '@mui/icons-material';

import { ReviewCard, ZapCard } from '.';
import { Button, LoadingSpinner } from '../common';
import { useNostrContext, useWalletContext } from '../../contexts';
import { usePagination } from '../../hooks';
import { type Note, type Review, type Zap } from '../../lib/types';
import { zap, type ZapResponse } from '../../lib/zap';
import styles from './Detail.module.css';

const ReviewDetail = () => {
    const navigate = useNavigate();

    const { reviewID: encReviewID } = useParams<{ reviewID: string }>();
    const reviewID = nip19.decode(encReviewID!) as nip19.DecodedNevent;

    const { nostrClient } = useNostrContext();
    const { wallet } = useWalletContext();

    const [review, setReview] = useState<Review>();
    const [reviewEvent, setReviewEvent] = useState<NostrEvent>();
    const [note, setNote] = useState<Note>();
    const [isLoading, setIsLoading] = useState(true);

    const loadZaps = useCallback(async (limit?: number, until?: number) =>  {
        return await nostrClient.listZaps([reviewID.data.id], limit, until);
    }, [nostrClient, reviewID])

    const {items: zaps, loadMore, hasMore } = usePagination(loadZaps);

    useEffect(() => {
        async function loadReview() {    
            const resp = await nostrClient.getReview(reviewID.data.id);
            setReview(resp?.review);
            setReviewEvent(resp?.event);
        }

        async function loadNote() {
            const resp = await nostrClient.getNote(review!.noteID);
            setNote(resp.note);
            setIsLoading(false);
        }

        void loadReview();
        void loadNote();
    }, [nostrClient, review, reviewID]);

    const onZapSubmit = async (
        reviewID: string,
        amount: number,
        lud16: string,
        comment?: string,
    ): Promise<ZapResponse> => {
        const resp = await zap(nostrClient, wallet, reviewEvent, amount, comment, undefined, lud16);

        const inlineZap: Zap = {
            id: Date.now().toString(),
            eventID: reviewID,
            authorPublicKey: await nostrClient.getSigner()?.getPublicKey() || 'Anonymous',
            recipient: review?.authorPublicKey || '',
            amount: amount,
            comment: comment,
            createdAt: Date.now()
        };
        // Add the zap to the top of the list
        zaps.unshift(inlineZap);

        return resp;
    };

    const onNoteClick = () => {
        const noteID = nip19.noteEncode(review!.noteID);
        void navigate(`/notes/${noteID}`);
    };

    if (!review) {
        if (isLoading) {
            return <LoadingSpinner />
        }

        return (
            <div className={styles.container}>
                <div className={styles.notFound}>
                    <h2>Review not found</h2>
                    <p>The review you're looking for doesn't exist or has been removed.</p>
                    <Button
                        variant='secondary'
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

            {zaps.length > 0 && (
                <div className={styles.zapsSection}>
                    <div className={styles.zapsSectionHeader}>
                        <h3>Zaps</h3>
                    </div>

                    <InfiniteScroll 
                        dataLength={zaps.length}
                        next={loadMore}
                        hasMore={hasMore}
                        loader={<LoadingSpinner />}
                        className={styles.zapsList}
                    >
                        {zaps.map((zap) => (
                            <ZapCard key={zap.id} zap={zap} />
                        ))}
                    </InfiniteScroll>
                </div>
            )}
        </div>
    );
};

export default ReviewDetail;
