import { memo } from 'react';
import { useNavigate } from 'react-router-dom';
import { OfflineBolt } from '@mui/icons-material';

import { Note } from '../../lib/types';
import { formatNumber, calculateNoteZaps, calculateRating } from '../../lib/zapUtils';
import { StarDisplay } from '../common';
import styles from './ListCard.module.css';

export interface FeedNoteCardProps {
    note: Note;
}

const FeedNoteCard = memo((props: FeedNoteCardProps) => {
    const navigate = useNavigate();

    const upvotes = calculateNoteZaps(props.note.reviews);
    const rating = calculateRating(props.note.reviews);

    const onCardClick = (): void => {
        navigate(`/notes/${props.note.id}`);
    };

    return (
        <div className={styles.card} onClick={onCardClick}>
            <div className={styles.container}>
                {props.note.image && (
                    <div className={styles.image}>
                        <img
                            src={props.note.image}
                            alt={props.note.title}
                            crossOrigin='anonymous'
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                            }}
                        />
                    </div>
                )}
                <div className={`${styles.main} ${!props.note.image ? styles.fullWidth : ''}`}>
                    <div className={styles.contentLeft}>
                        <div className={styles.titleSection}>
                            <h3 className={styles.noteTitle}>{props.note.title}</h3>
                            <div className={styles.description}>
                                <p>{props.note.content}</p>
                            </div>
                        </div>
                    </div>
                    <div className={styles.contentRight}>
                        <div className={styles.votesDisplay}>
                            {rating > 0 && (
                                <div className={styles.ratingItem}>
                                    <StarDisplay rating={rating} fontSize={18} />
                                    <span className={styles.ratingValue}>{rating.toFixed(1)}</span>
                                    <span className={styles.reviewCount}>({formatNumber(props.note.reviews?.length)})</span>
                                </div>
                            )}
                            <div className={styles.voteItem}>
                                <OfflineBolt className={styles.weightIcon} />
                                <span className={styles.weightCount}>{formatNumber(upvotes)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default FeedNoteCard;
