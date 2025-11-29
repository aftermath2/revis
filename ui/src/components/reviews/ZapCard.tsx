import { OfflineBolt } from '@mui/icons-material';

import Avatar from '../common/Avatar';
import { type Zap } from '../../lib/types';
import styles from './ZapCard.module.css';
import { useNostrContext } from '../../contexts';
import { useEffect, useState } from 'react';
import { type UserMetadata } from '../../lib/nostr/nostr';

interface ZapCardProps {
    zap: Zap;
}

const ZapCard = ({ zap }: ZapCardProps) => {
    const { nostrClient } = useNostrContext();

    const [userMetadata, setUserMetadata] = useState<UserMetadata>();

    useEffect(() => {
        async function loadUserMetadata() {
            const metadata = await nostrClient.getUserMetadata(zap.authorPublicKey);
            setUserMetadata(metadata);
        }

        void loadUserMetadata();
    })

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className={styles.zapCard}>
            <div className={styles.header}>
                <Avatar url={userMetadata?.picture} publicKey={zap.authorPublicKey} />

                <div className={styles.userInfo}>
                    <span className={styles.publicKey}>{zap.authorPublicKey}</span>
                    <span className={styles.date}>{formatDate(zap.createdAt.toString())}</span>
                </div>

                <div className={styles.amountIndicator}>
                    <OfflineBolt className={styles.boltIcon} />
                    <span className={styles.amount}>
                        {zap.amount}
                    </span>
                </div>
            </div>

            {zap.comment && (
                <div className={styles.comment}>
                    <p>{zap.comment}</p>
                </div>
            )}
        </div>
    );
};

export default ZapCard;
