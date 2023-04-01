import { useState, memo, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { type NostrEvent } from 'nostr-tools';
import toast from 'react-hot-toast';

import { AddReviewForm, ReviewCard } from './';
import { Button, LoadingSpinner } from '../common';
import { useNostrContext, useUserContext, useWalletContext } from '../../contexts';
import { type Review, type Zap } from '../../lib/types';
import { zap, type ZapResponse } from '../../lib/zap';
import { usePagination, type Fetcher } from '../../hooks';
import styles from './List.module.css';

interface ReviewsListProps {
    loadReviews: Fetcher<Review>
    noteID?: string,
    noteEvent?: NostrEvent,
    emptyMessage?: string;
}

export const ReviewsList = memo((props: ReviewsListProps) => {
    const { nostrClient, setShowLoginModal } = useNostrContext();
    const { wallet } = useWalletContext();
    const { setInvoiceQRCode } = useWalletContext();
    const { user } = useUserContext();
    
    const [zaps, setZaps] = useState<Zap[]>();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [sortedReviews, setSortedReviews] = useState<Review[]>([]);
    const [isAddingReview, setIsAddingReview] = useState<boolean>(false);

    const { items: reviews, loadMore, hasMore } = usePagination(props.loadReviews);

    const getReviewZaps = (zaps: Zap[], reviewID: string): number => {
        return zaps
            .filter((zap) => zap.eventID === reviewID)
            .map((zap) => zap.amount)
            .reduce((sum, amount) => sum + amount, 0);
    }
    
    useEffect(() => {
        const loadZaps = async () => {
            const reviewIDs = sortedReviews.map((review) => review.id);
            const zaps = await nostrClient.listZaps(reviewIDs);
            setZaps(zaps);
            
            const sortedList = reviews.sort((a, b) => {
                const aZapsTotal = getReviewZaps(zaps, a.id);
                const bZapsTotal = getReviewZaps(zaps, b.id);
                return (a.zapAmount + aZapsTotal) - (b.zapAmount + bZapsTotal);
            })
            
            setSortedReviews(sortedList);
            setIsLoading(false);
        }
        
        void loadZaps();
    }, [nostrClient, reviews]);

    const onAddReviewClick = () => {
        if (!nostrClient.getSigner()) {
            setShowLoginModal(true);
            return;
        }

        setIsAddingReview(true);
    }

    const onAddReview = async (review: Review) => {
        if (!nostrClient.getSigner()) {
            setShowLoginModal(true);
            return;
        }

        const zapResponse = await zap(
            nostrClient,
            wallet,
            props.noteEvent,
            review.zapAmount,
            review.comment,
            review.rating,
        );

        setIsAddingReview(false);

        if (zapResponse.preimage) {
            setSortedReviews([...[review], ...sortedReviews]);
        } else if (zapResponse.invoice) {
            setInvoiceQRCode({
                show: true,
                title: 'Pay the invoice to publish your review',
                value: zapResponse.invoice
            })

            const found = await nostrClient.waitForZap(user.publicKey!, props.noteID!);
            if (found) {
                setTimeout(() => setInvoiceQRCode({show: false}), 2000);
                toast.success('Invoice paid', {
                    iconTheme: {
                        primary: '#f7931a',
                        secondary: 'white'
                    },
                });
                setSortedReviews([...[review], ...sortedReviews]);
            }
        }
    };

    const onCancelReview = () => {
        setIsAddingReview(false);
    };

    const onZapSubmit = async (
        reviewID: string,
        amount: number,
        lud16: string,
        comment?: string,
    ): Promise<ZapResponse> => {
        const resp = await nostrClient.getReview(reviewID);
        return await zap(nostrClient, wallet, resp?.event, amount, comment, undefined, lud16);
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h3>Reviews</h3>
                {props.noteID && !isAddingReview && (
                    <Button
                        variant='primary'
                        size='small'
                        onClick={onAddReviewClick}
                    >
                        Add Review
                    </Button>
                )}
            </div>

            {props.noteID && isAddingReview && (
                <AddReviewForm
                    noteID={props.noteID}
                    onAddReview={onAddReview}
                    onCancel={onCancelReview}
                />
            )}

            {isLoading ? <LoadingSpinner /> : 
                sortedReviews.length === 0 ? <p className={styles.noReviews}>{props.emptyMessage}</p> : (
                    <InfiniteScroll
                        dataLength={sortedReviews.length}
                        next={loadMore}
                        hasMore={hasMore}
                        loader={<LoadingSpinner />}
                        endMessage={
                            <div className={styles.endMessage}>
                                <p>You've seen all reviews!</p>
                            </div>
                        }
                        className={styles.list}
                    >
                        {sortedReviews.map((review) => (
                            <ReviewCard
                                key={review.id}
                                review={review}
                                zaps={zaps?.filter((zap) => zap.eventID === review.id)}
                                onZapSubmit={onZapSubmit}
                            />
                        ))}
                    </InfiniteScroll>
            )}
        </div>
    );
});

export default ReviewsList;
