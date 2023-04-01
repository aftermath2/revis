import { memo, useState, useCallback, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { OfflineBolt } from '@mui/icons-material';
import toast from 'react-hot-toast';
import { kinds, nip19 } from 'nostr-tools';

import { type Zap, type Review, type UserMetadata } from '../../lib/types';
import { formatNumber, type ZapResponse } from '../../lib/zap';
import { ZapForm } from './';
import { Avatar, StarDisplay } from '../common';
import { useNostrContext, useUserContext, useWalletContext } from '../../contexts';
import { ITEMS_PER_LOAD } from '../../lib/configuration';
import styles from './Card.module.css';

interface ReviewCardProps {
    review: Review;
    zaps?: Zap[];
    onZapSubmit?: (reviewID: string, amount: number, lud16: string, comment?: string) => Promise<ZapResponse>;
    disableTruncation?: boolean;
}

const ReviewCard = memo((props: ReviewCardProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { nostrClient, setShowLoginModal } = useNostrContext();
    const { setInvoiceQRCode } = useWalletContext();
    const { user } = useUserContext();

    const [zapsAmount, setZapsAmount] = useState<number>();
    const [userMetadata, setUserMetadata] = useState<UserMetadata>();
    const [isAnimating, setIsAnimating] = useState(false);
    const [showZapForm, setShowZapForm] = useState(false);
    const [isUserZapped, setIsUserZapped] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [showExpandButton, setShowExpandButton] = useState(false);

    const isUserCreated = user.publicKey === props.review.authorPublicKey;
    // x1000 to convert to seconds
    const date = new Date(props.review.createdAt*1000).toLocaleString();
    
    const onUserClick = () => {
        const nprofile = nip19.nprofileEncode({pubkey: props.review.authorPublicKey});
        void navigate(`/users/${nprofile}`);
    };

    useEffect(() => {
        async function loadZaps() {
            const zaps = props.zaps || await nostrClient.listZaps([props.review.id], ITEMS_PER_LOAD);

            let zapsAmount = 0;
            for (const zap of zaps) {
                if (zap.authorPublicKey === user.publicKey) {
                    setIsUserZapped(true);
                }
                zapsAmount = zapsAmount + zap.amount;
            }
            setZapsAmount(zapsAmount);
        }

        async function loadUserMetadata() {
            const metadata = await nostrClient.getUserMetadata(props.review.authorPublicKey);
            setUserMetadata(metadata);
        }

        void loadZaps();
        void loadUserMetadata();
    }, [nostrClient, props.review, props.zaps, user.publicKey])

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

    const onAmountClick = () => {
        if (!nostrClient.getSigner()) {
            setShowLoginModal(true);
            return;
        }

        setIsAnimating(true);
        setShowZapForm(prev => !prev);
        setTimeout(() => setIsAnimating(false), 1000); // Match animation duration
    };

    const onZapSubmit = async (amount: number, comment?: string) => {
        if (!userMetadata?.lud16) throw new Error('Can\'t zap user with no LUD16');

        if (!props.onZapSubmit) {
            return;
        }

        const resp = await props.onZapSubmit(props.review.id, amount, userMetadata?.lud16, comment);
        if (resp.invoice) {
            setInvoiceQRCode({
                show: true,
                title: 'Pay the invoice to publish your review',
                value: resp.invoice
            })

            const found = await nostrClient.waitForZap(user.publicKey!, props.review.id);
            if (found) {
                toast.success('Invoice paid', {
                    iconTheme: {
                        primary: '#f7931a',
                        secondary: 'white'
                    },
                });
                setTimeout(() => setInvoiceQRCode({show: false}), 2000);
            }
        }

        setShowZapForm(false);

        if (!isUserZapped) {
            setIsUserZapped(true);
        }
    };

    const onZapCancel = useCallback(() => {
        setShowZapForm(false);
    }, []);

    const toggleExpanded = useCallback((e: React.MouseEvent) => {
        e.stopPropagation();
        setIsExpanded(prev => !prev);
    }, []);


    const onCommentClick = () => {
        const nevent = nip19.neventEncode({
            id: props.review.id,
            author: props.review.authorPublicKey,
            kind: kinds.Zap,
        })

        const path = `/reviews/${nevent}`;
        if (location.pathname === path) return;

        void navigate(path);
    };

    return (
        <div
            id={`review-${props.review.id}`}
            className={`${styles.item} ${isUserCreated ? styles.itemUserCreated : ''}`}
        >
            <div className={styles.header}>
                <Avatar url={userMetadata?.picture} publicKey={props.review.authorPublicKey} />

                <div className={styles.meta}>
                    <div className={styles.authorRow}>
                        <span
                            className={`${styles.author} ${styles.clickableAuthor}`}
                            onClick={onUserClick}
                        >
                            {props.review.authorPublicKey}
                            {isUserCreated && <span className={styles.userCreatedBadge}> (You)</span>}
                        </span>
                    </div>
                    <div className={styles.dateRow}>
                        <span
                            className={styles.date}
                            title={date}
                        >
                            {date}
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
                className={`${styles.comment} ${styles.clickableComment}`}
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
                    className={`${styles.amountButton} ${isAnimating ? styles.amountButtonClicked : ''} ${isUserZapped ? styles.amountButtonZapped : ''}`}
                    onClick={onAmountClick}
                >
                    <OfflineBolt className={styles.amountIcon} />
                    <span className={styles.amountCount}>{formatNumber(zapsAmount || 0)}</span>
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
