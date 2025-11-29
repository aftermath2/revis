import { memo, useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { OfflineBolt } from '@mui/icons-material';

import Button from '../common/Button';
import { StarDisplay } from '../common';
import { type Review, type Note } from '../../lib/types';
import { getCategoryName } from '../../lib/categories';
import { formatNumber, calculateNoteZaps, calculateRating } from '../../lib/zapUtils';
import styles from './Card.module.css';
import { useNostrContext } from '../../contexts';

export interface NoteProps {
    note: Note;
}

const NoteCard = memo((props: NoteProps) => {
    const { nostrClient } = useNostrContext();
    const navigate = useNavigate();

    const [showCategories, setShowCategories] = useState<boolean>(false);
    const [reviews, setReviews] = useState<Review[]>([]);

    useEffect(() => {
        async function loadReviews() {
            const reviewList = await nostrClient.listReviews([props.note.id]);
            setReviews(reviewList);
        }

        void loadReviews();
    })

    const upvotes = calculateNoteZaps(reviews);
    const rating = calculateRating(reviews);
    const categoriesRef = useRef<HTMLDivElement>(null);

    const onCategoryClick = (category: string, e: React.MouseEvent): void => {
        e.stopPropagation(); // Prevent triggering other click handlers
        void navigate(`/categories/${category}`);
    };

    const onToggleCategories = (e?: React.MouseEvent): void => {
        if (e) e.stopPropagation();
        setShowCategories(!showCategories);
    };

    // Modern approach: handle clicks via onBlur and relative focus management
    const onBlur = (e: React.FocusEvent) => {
        // Check if the new focus target is outside the categories section
        if (!categoriesRef.current?.contains(e.relatedTarget as Node)) {
            setShowCategories(false);
        }
    };

    return (
        <div className={styles.detailMain}>
            <div className={styles.noteHeader}>
                <div className={styles.titleSection}>
                    <h1 className={styles.noteTitle}>{props.note.title}</h1>
                </div>
                <div 
                    className={styles.categoriesSection} 
                    ref={categoriesRef}
                    onBlur={onBlur}
                >
                    <Button
                        variant='tertiary'
                        size='small'
                        onClick={onToggleCategories}
                    >
                        Categories
                    </Button>
                    {showCategories && (
                        <div className={styles.categoriesDropdown}>
                            {props.note.categories && props.note.categories.length > 0 ? (
                                props.note.categories.map((category, index) => (
                                    <Button
                                        key={index}
                                        variant='primary'
                                        size='small'
                                        onClick={(e) => onCategoryClick(category, e)}
                                        title={category}
                                    >
                                        {getCategoryName(category)}
                                    </Button>
                                ))
                            ) : (
                                <span className={styles.noCategories}>
                                    No categories assigned
                                </span>
                            )}
                        </div>
                    )}
                </div>
            </div>
            {props.note.image && (
                <div className={styles.noteImage}>
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
            {props.note.content && (
                <div className={styles.noteContent}>
                    <p>{props.note.content}</p>
                </div>
            )}
            <div className={styles.noteActions}>
                <div className={styles.noteStats}>
                    {reviews && reviews.length > 0 && (
                        <div className={styles.ratingStats}>
                            <StarDisplay rating={rating} />
                            <span className={styles.ratingText}>
                                {rating > 0
                                    ? rating.toFixed(1)
                                    : 'Not rated'
                                }
                            </span>
                            <span className={styles.reviewCount}>
                                ({formatNumber(reviews.length)})
                            </span>
                        </div>
                    )}

                    <div className={styles.weight}>
                        <OfflineBolt className={styles.weightIcon} />
                        <span className={styles.weightCount}>{formatNumber(upvotes)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default NoteCard;
