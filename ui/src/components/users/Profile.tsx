import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import SettingsIcon from '@mui/icons-material/Settings';

import { sampleNotes } from '../../data/sampleData';
import { Review } from '../../lib/types';
import { formatNumber } from '../../lib/zapUtils';
import { useNostrContext } from '../../contexts';
import { ReviewsList } from '../reviews';
import { Avatar, Button } from '../common';
import styles from './Profile.module.css';
import { SignerType } from '../../lib/nostr/nostr';

const Profile = () => {
    const { nostrClient, setShowLoginModal } = useNostrContext();
    const [isCopied, setIsCopied] = useState(false);
    const navigate = useNavigate();
    const { username } = useParams<{ username: string }>();

    const isCurrentUser = !username; // If no username param, it's current user's profile
    const displayUsername = username || 'You';
    // TODO: get from nostrClient.signer
    let privateKey = '';

    // Mask the private key with asterisks
    const maskedPrivateKey = useMemo(() => {
        if (!privateKey) return '';
        return '•'.repeat(privateKey.length);
    }, [privateKey]);

    // Only show private key if authenticated with privateKey method
    const shouldShowPrivateKey = nostrClient.getSignerType() === SignerType.KEY && privateKey;

    // Get user's reviews from all notes
    const userReviews = useMemo(() => {
        const reviews: Review[] = [];
        sampleNotes.forEach(note => {
            if (note.reviews) {
                note.reviews.forEach(review => {
                    if (review.author === username) {
                        reviews.push(review);
                    }
                });
            }
        });
        return reviews.sort((a, b) => {
            if (!a.createdAt || !b.createdAt) return 0;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
    }, [username]);

    // Limit displayed reviews to 3
    const displayedReviews = userReviews.slice(0, 3);
    const hasMoreReviews = userReviews.length > 3;

    // Get user's avatar (use first available avatar from their reviews)
    const userAvatar = userReviews.find(review => review.avatar)?.avatar;

    const onReviewClick = (reviewID: string) => {
        // Find which note contains this review
        // TODO: review item will have the note ID, no need to search for it
        const noteWithReview = sampleNotes.find(note =>
            note.reviews?.some(review => review.id === reviewID)
        );
        if (noteWithReview) {
            navigate(`/notes/${noteWithReview.id}/reviews/${reviewID}`);
        }
    };

    const onViewMoreReviews = () => {
        navigate(`/users/${username}/reviews`);
    };

    const onOpenSettings = () => {
        setShowLoginModal(true);
    };

    const onCopyPrivateKey = async () => {
        if (privateKey) {
            try {
                await navigator.clipboard.writeText(privateKey);
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000);
            } catch (err) {
                throw new Error('Failed to copy to clipboard: ' + err);
            }
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                {/* Header with Account Details */}
                <div className={styles.profileHeader}>
                    {isCurrentUser && (
                        <button
                            className={styles.settingsButton}
                            onClick={onOpenSettings}
                            title="Account Settings"
                            aria-label="Account Settings"
                        >
                            <SettingsIcon />
                        </button>
                    )}
                    <div className={styles.profileContent}>
                        <Avatar 
                            username={displayUsername}
                            url={userAvatar}
                            width='120px'
                        />
                        <div className={styles.profileInfo}>
                            <h1 className={styles.profileName}>{displayUsername}</h1>
                            <p className={styles.profileDescription}>User description</p>
                            <div className={styles.profileStats}>
                                <span className={styles.statItem}>
                                    <strong>{formatNumber(userReviews.length)}</strong> review{userReviews.length !== 1 ? 's' : ''}
                                </span>
                            </div>
                        </div>

                        {isCurrentUser && shouldShowPrivateKey && (
                            <div className={styles.accountDetails}>
                                <div className={styles.infoItem}>
                                    <label>Private Key:</label>
                                    <div className={styles.privateKeyContainer}>
                                        <div className={styles.privateKey}>
                                            {maskedPrivateKey}
                                            <button
                                                className={styles.copyButton}
                                                onClick={onCopyPrivateKey}
                                                title={isCopied ? 'Copied!' : 'Copy private key to clipboard'}
                                            >
                                                {isCopied ? <CheckIcon /> : <ContentCopyIcon />}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className={styles.section}>
                    <ReviewsList
                        reviews={displayedReviews}
                        title="Reviews"
                        emptyMessage={isCurrentUser
                            ? 'Your reviews will appear here once you start writing them.'
                            : `${displayUsername} hasn't written any reviews yet.`
                        }
                        onReviewClick={onReviewClick}
                    />
                    {hasMoreReviews && (
                        <div className={styles.viewMoreWrapper}>
                            <Button
                                variant='secondary'
                                size='medium'
                                onClick={onViewMoreReviews}
                                className={styles.viewMoreButton}
                            >
                                View All
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
