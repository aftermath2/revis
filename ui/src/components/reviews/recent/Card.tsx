import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { kinds, nip19 } from 'nostr-tools';

import { Avatar } from '../../common';
import { type UserMetadata, type Review } from '../../../lib/types';
import { useNostrContext } from '../../../contexts';
import styles from './Card.module.css';

interface RecentCardProps {
    review: Review
}

const RecentCard = (props: RecentCardProps) => {
    const navigate = useNavigate();
    const { nostrClient } = useNostrContext();
    
    const [userMetadata, setUserMetadata] = useState<UserMetadata>();
    
    useEffect(() => {
        async function loadUserMetadata() {
            const metadata = await nostrClient.getUserMetadata(props.review.authorPublicKey);
            setUserMetadata(metadata);
        }

        void loadUserMetadata();
    }, [nostrClient, props.review.authorPublicKey]);

    const onCommentClick = () => {
        const nevent = nip19.neventEncode({
            id: props.review.id,
            author: props.review.authorPublicKey,
            kind: kinds.Zap,
        })
        void navigate(`/reviews/${nevent}`);
    }

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

    return (
        <div className={styles.container}>
            <Avatar 
                url={userMetadata?.picture} 
                publicKey={props.review.authorPublicKey}
            />
            <div onClick={onCommentClick}>
                <div className={styles.content}>
                    <div className={styles.header}>
                        <span className={styles.author}>
                            {props.review.authorPublicKey}
                        </span>
                        <span className={styles.timeElapsed}>
                            {formatTimeElapsed(new Date(props.review.createdAt * 1000).toISOString())}
                        </span>
                    </div>

                    <p className={styles.comment}>
                        {props.review.comment}
                    </p>
                </div>
            </div>
        </div>
    )
}

export default RecentCard;