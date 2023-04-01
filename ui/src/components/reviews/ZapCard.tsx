import { OfflineBolt } from '@mui/icons-material';

import Avatar from '../common/Avatar';
import { Zap } from '../../lib/types';
import styles from './ZapCard.module.css';

interface ZapCardProps {
    zap: Zap;
}

const ZapCard = ({ zap }: ZapCardProps) => {
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
                <Avatar url={zap.avatar} username={zap.username} />

                <div className={styles.userInfo}>
                    <span className={styles.username}>{zap.username}</span>
                    <span className={styles.date}>{formatDate(zap.timestamp)}</span>
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
