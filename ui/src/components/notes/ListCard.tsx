import { memo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { OfflineBolt } from '@mui/icons-material';
import { nip19 } from 'nostr-tools';

import { type AnnotatedNote } from '../../lib/types';
import { formatNumber, calculateRating } from '../../lib/zap';
import { StarDisplay } from '../common';
import styles from './ListCard.module.css';

export interface ListNoteCardProps {
    annotatedNote: AnnotatedNote;
}

const ListNoteCard = memo((props: ListNoteCardProps) => {
    const navigate = useNavigate();
    
    const noteID = nip19.noteEncode(props.annotatedNote.id);    
    const [rating, totalZaps] = calculateRating(props.annotatedNote.reviewsMap);
    const [imageError, setImageError] = useState(false);

    const onCardClick = (): void => {
        void navigate(`/notes/${noteID}`);
    };

    return (
        <div className={styles.card} onClick={onCardClick}>
            <div className={styles.container}>
                {props.annotatedNote.image && !imageError && (
                    <div className={styles.image}>
                        <img
                            src={props.annotatedNote.image}
                            alt={props.annotatedNote.title}
                            onError={() => {
                                setImageError(true);
                            }}
                        />
                    </div>
                )}
                <div className={`${styles.main} ${!props.annotatedNote.image ? styles.fullWidth : ''}`}>
                    <div className={styles.contentLeft}>
                        <div className={styles.titleSection}>
                            <h3 className={styles.noteTitle}>{props.annotatedNote.title}</h3>
                            <div className={styles.description}>
                                <p>{props.annotatedNote.content}</p>
                            </div>
                        </div>
                    </div>
                    <div className={styles.contentRight}>
                        <div className={styles.votesDisplay}>
                            <div className={styles.ratingItem}>
                                <StarDisplay rating={rating} fontSize={18} />
                                <span className={styles.ratingValue}>{rating.toFixed(1)}</span>
                                {props.annotatedNote.reviewsMap.size > 0 && (
                                    <span className={styles.reviewCount}>
                                        ({formatNumber(props.annotatedNote.reviewsMap.size)})
                                    </span>                            
                                )}

                            </div>
                            <div className={styles.voteItem}>
                                <OfflineBolt className={styles.weightIcon} />
                                <span className={styles.weightCount}>{formatNumber(totalZaps)}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default ListNoteCard;
