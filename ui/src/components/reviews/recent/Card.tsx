import { useEffect, useState } from "react";

import { type Review } from "../../../lib/types";
import { useNostrContext } from '../../../contexts';
import { type UserMetadata } from "../../../lib/nostr/nostr";
import styles from './Card.module.css';
import { Avatar } from "../../common";

interface RecentCardProps {
    review: Review
    index: number
    onReviewClick: (reviewID: string) => void
}

const RecentCard = (props: RecentCardProps) => {
    const { nostrClient } = useNostrContext();
    
    const [userMetadata, setUserMetadata] = useState<UserMetadata>();
    
    useEffect(() => {
        async function loadUserMetadata() {
            const metadata = await nostrClient.getUserMetadata(props.review.authorPublicKey);
            setUserMetadata(metadata);
        }

        void loadUserMetadata();
    });

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
        <div className={styles.container} key={`${props.review.id}-${props.index}`}>
            <Avatar 
                url={userMetadata?.picture} 
                publicKey={props.review.authorPublicKey}
            />
            <div onClick={() => props.onReviewClick(props.review.id)}>
                <div className={styles.content}>
                    <div className={styles.header}>
                        <span className={styles.author}>
                            {props.review.authorPublicKey}
                        </span>
                        <span className={styles.timeElapsed}>
                            {formatTimeElapsed(new Date(props.review.createdAt).toISOString())}
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