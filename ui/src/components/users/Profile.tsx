import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import SettingsIcon from '@mui/icons-material/Settings';

import { type Review } from '../../lib/types';
import { formatNumber } from '../../lib/zapUtils';
import { useNostrContext, useUserContext } from '../../contexts';
import { ReviewsList } from '../reviews';
import { Avatar, Button } from '../common';
import styles from './Profile.module.css';
import { SignerType, type UserMetadata } from '../../lib/nostr/nostr';
import { ITEMS_PER_LOAD } from '../../lib/constants';

const Profile = () => {
    const { nostrClient } = useNostrContext();
    const { user, setShowLoginModal } = useUserContext();
    const { publicKey } = useParams<{ publicKey: string }>();
    const navigate = useNavigate();
    
    const [userMetadata, setUserMetadata] = useState<UserMetadata>();
    const [isCopied, setIsCopied] = useState(false);
    const [isCurrentUser] = useState(user.publicKey === publicKey);
    const [reviews, setReviews] = useState<Review[]>([])

    useEffect(() => {
        async function loadUser() {
            if (isCurrentUser) {
                setUserMetadata(user.metadata)
            } else {
                setUserMetadata(await nostrClient.getUserMetadata(publicKey || ''))
            }
        }

        void loadUser();
    })

    const userReviews = useCallback(async () => {
        if (!publicKey) throw new Error("publicKey not provided")

        const reviews = await nostrClient.listUserReviews(publicKey, ITEMS_PER_LOAD+1);
        // Sort from newest to oldest
        const sortedReviews = reviews.sort((a, b) => b.createdAt - a.createdAt);
        setReviews(sortedReviews);
    }, [publicKey, nostrClient]);

    const showPrivateKey = nostrClient.getSigner()?.getType() === SignerType.KEY && user?.privateKey;

    const onReviewClick = (reviewID: string) => {
        void navigate(`/reviews/${reviewID}`);
    };

    const onViewMoreReviews = () => {
        void navigate(`/users/${publicKey}/reviews`);
    };

    const onOpenSettings = () => {
        setShowLoginModal(true);
    };

    const onCopyPrivateKey = async () => {
        if (user?.privateKey) {
            try {
                await navigator.clipboard.writeText(user?.privateKey);
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000);
            } catch (err) {
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                throw new Error(`Failed to copy to clipboard: ${err}`);
            }
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <div className={styles.profileHeader}>
                    {isCurrentUser && (
                        <button
                            className={styles.settingsButton}
                            onClick={onOpenSettings}
                            title='Account Settings'
                            aria-label='Account Settings'
                        >
                            <SettingsIcon />
                        </button>
                    )}
                    <div className={styles.profileContent}>
                        <Avatar 
                            publicKey={publicKey || ''}
                            url={userMetadata?.picture}
                            width='120px'
                        />
                        <div className={styles.profileInfo}>
                            <h1 className={styles.profileName}>{isCurrentUser ? 'You' : userMetadata?.name}</h1>
                            <p className={styles.profileDescription}>{userMetadata?.about}</p>
                            <div className={styles.profileStats}>
                                <span className={styles.statItem}>
                                    <strong>{formatNumber(userReviews.length)}</strong> review{userReviews.length !== 1 ? 's' : ''}
                                </span>
                            </div>
                        </div>

                        {isCurrentUser && showPrivateKey && (
                            <div className={styles.accountDetails}>
                                <div className={styles.infoItem}>
                                    <label>Private Key:</label>
                                    <div className={styles.privateKeyContainer}>
                                        <div className={styles.privateKey}>
                                            {'•'.repeat(10)}
                                            <button
                                                className={styles.copyButton}
                                                onClick={void onCopyPrivateKey}
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
                        reviews={reviews}
                        emptyMessage={isCurrentUser
                            ? 'Your reviews will appear here once you start writing them.'
                            : `${userMetadata?.name} hasn't written any reviews yet.`
                        }
                        onReviewClick={onReviewClick}
                    />
                    {reviews.length > ITEMS_PER_LOAD && (
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
