import { memo, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { OfflineBolt } from '@mui/icons-material';
import Markdown from 'react-markdown';

import Button from '../common/Button';
import { StarDisplay } from '../common';
import { type AnnotatedNote } from '../../lib/types';
import { getCategoryName } from '../../lib/categories';
import { formatNumber, calculateRating } from '../../lib/zap';
import styles from './Card.module.css';

export interface NoteProps {
    note: AnnotatedNote;
}

const NoteCard = memo((props: NoteProps) => {
    const navigate = useNavigate();

    const [showCategories, setShowCategories] = useState<boolean>(false);
    const [imageError, setImageError] = useState(false);

    const [rating, totalZaps] = calculateRating(props.note.reviewsMap);
    const categoriesRef = useRef<HTMLDivElement>(null);

    const onCategoryClick = (category: string, e: React.MouseEvent): void => {
        // Prevent triggering other click handlers
        e.stopPropagation();
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
            {props.note.image && !imageError && (
                <div className={styles.noteImage}>
                    <img
                        src={props.note.image}
                        alt={props.note.title}
                        onError={() => {
                            setImageError(true);
                        }}
                    />
                </div>
            )}
            {props.note.content && (
                <div className={styles.noteContent}>
                    <Markdown>{props.note.content}</Markdown>
                </div>
            )}
            <div className={styles.noteActions}>
                <div className={styles.noteStats}>
                    <div className={styles.ratingStats}>
                        <StarDisplay rating={rating} />
                        <span className={styles.ratingText}>
                            {rating.toFixed(1)}
                        </span>
                        {props.note.reviewsMap.size > 0 && (
                            <span className={styles.reviewCount}>
                                ({formatNumber(props.note.reviewsMap.size)})
                            </span>
                        )}
                    </div>

                    <div className={styles.weight}>
                        <OfflineBolt className={styles.weightIcon} />
                        <span className={styles.weightCount}>{formatNumber(totalZaps)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
});

export default NoteCard;
