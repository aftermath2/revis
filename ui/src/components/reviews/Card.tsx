import { memo, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { OfflineBolt } from '@mui/icons-material';

import { Review } from '../../lib/types';
import { formatNumber } from '../../lib/zapUtils';
import { ZapForm } from './';
import { Avatar, StarDisplay } from '../common';
import { useNostrContext } from '../../contexts';
import styles from './Card.module.css';

interface ReviewCardProps {
    review: Review;
    isUserCreated: boolean;
    onReviewClick?: (reviewID: string) => void;
    onZapSubmit?: (reviewID: string, amount: number, comment?: string) => Promise<void>;
    disableTruncation?: boolean;
}

const ReviewCard = memo((props: ReviewCardProps) => {
    const navigate = useNavigate();
    const { nostrClient, setShowLoginModal } = useNostrContext();
    const [isAnimating, setIsAnimating] = useState(false);
    const [showZapForm, setShowZapForm] = useState(false);
    const [isZapped, setIsZapped] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [showExpandButton, setShowExpandButton] = useState(false);

    const onUserClick = () => {
        navigate(`/users/${encodeURIComponent(props.review.author)}`);
    };

    const totalZaps = props.review.zapAmount + (props.review.zaps?.reduce((sum, zap) => sum + zap.amount, 0) || 0);

    // Check if content is long enough to potentially need truncation
    const commentRef = useCallback((node: HTMLParagraphElement | null) => {
        if (node && !isExpanded && !props.disableTruncation) {
            // Use requestAnimationFrame to ensure layout is complete
            requestAnimationFrame(() => {
                // Check if content is overflowing (scrollHeight > clientHeight)
                // Add a small buffer (1px) to account for subpixel rendering
                const isOverflowing = node.scrollHeight > node.clientHeight + 1;
                setShowExpandButton(isOverflowing);
            });
        }
    }, [isExpanded, props.disableTruncation]);

    const onAmountClick = useCallback(() => {
        if (!nostrClient.getSigner()) {
            setShowLoginModal(true);
            return;
        }

        setIsAnimating(true);
        setShowZapForm(prev => !prev);
        setTimeout(() => setIsAnimating(false), 1000); // Match animation duration
    }, []);

    const onZapSubmit = useCallback((amount: number, comment?: string) => {
        if (props.onZapSubmit && props.review.id) {
            props.onZapSubmit(props.review.id, amount, comment);
        }
        setShowZapForm(false);

        // Trigger shine animation
        setIsZapped(true);
        setTimeout(() => setIsZapped(false), 1000); // Duration of shine animation
    }, [props.onZapSubmit, props.review.id]);

    const onZapCancel = useCallback(() => {
        setShowZapForm(false);
    }, []);

    const onCommentClick = useCallback(() => {
        if (props.onReviewClick && props.review.id) {
            props.onReviewClick(props.review.id);
        }
    }, [props.onReviewClick, props.review.id]);

    const toggleExpanded = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setIsExpanded(prev => !prev);
    }, []);

    return (
        <div
            id={`review-${props.review.id}`}
            className={`${styles.item} ${props.isUserCreated ? styles.itemUserCreated : ''}`}
        >
            <div className={styles.header}>
                <Avatar url={props.review.avatar} username={props.review.author} />

                <div className={styles.meta}>
                    <div className={styles.authorRow}>
                        <span
                            className={`${styles.author} ${styles.clickableAuthor}`}
                            onClick={onUserClick}
                        >
                            {props.review.author}
                            {props.isUserCreated && <span className={styles.userCreatedBadge}> (You)</span>}
                        </span>
                    </div>
                    <div className={styles.dateRow}>
                        <span
                            className={styles.date}
                            title={new Date(props.review.createdAt).toLocaleString()}
                        >
                            {new Date(props.review.createdAt).toLocaleDateString()}
                        </span>
                    </div>
                </div>
                <div className={styles.ratings}>
                    <StarDisplay
                        rating={props.review.rating}
                        fontSize={18}
                    />
                </div>
            </div>
            <div
                className={`${styles.comment} ${props.onReviewClick ? styles.clickableComment : ''}`}
                onClick={onCommentClick}
            >
                <p
                    ref={commentRef}
                    className={!isExpanded && !props.disableTruncation ? styles.commentTruncated : ''}
                >
                    {props.review.comment}
                </p>
                {showExpandButton && !props.disableTruncation && (
                    <button
                        className={styles.showMoreButton}
                        onClick={toggleExpanded}
                    >
                        {isExpanded ? 'Show less' : 'Show more'}
                    </button>
                )}
            </div>
            <div className={styles.actions}>
                <button
                    className={`${styles.amountButton} ${isAnimating ? styles.amountButtonClicked : ''} ${isZapped ? styles.amountButtonZapped : ''}`}
                    onClick={onAmountClick}
                >
                    <OfflineBolt className={styles.amountIcon} />
                    <span className={styles.amountCount}>{formatNumber(totalZaps)}</span>
                </button>
            </div>

            {showZapForm && (
                <ZapForm
                    onSubmit={onZapSubmit}
                    onCancel={onZapCancel}
                />
            )}
        </div>
    );
});

export default ReviewCard;
