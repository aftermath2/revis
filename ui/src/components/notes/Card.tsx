import { memo, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { OfflineBolt } from '@mui/icons-material';

import Button from '../common/Button';
import { StarDisplay } from '../common';
import { Note } from '../../lib/types';
import { formatNumber, calculateNoteZaps, calculateRating } from '../../lib/zapUtils';
import styles from './Card.module.css';

export interface NoteProps {
    note: Note;
}

const NoteCard = memo((props: NoteProps) => {
    const navigate = useNavigate();
    const [showCategories, setShowCategories] = useState<boolean>(false);

    const upvotes = calculateNoteZaps(props.note.reviews);
    const rating = calculateRating(props.note.reviews);
    const categoriesRef = useRef<HTMLDivElement>(null);

    // Helper function to extract category name from path
    const getCategoryName = (categoryPath: string): string => {
        const segments = categoryPath.split('/');
        const categoryName = segments[segments.length - 1] || categoryPath;
        return categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
    };

    const onCategoryClick = (category: string, e: React.MouseEvent): void => {
        e.stopPropagation(); // Prevent triggering other click handlers
        navigate(`/categories/${category}`);
    };

    const onToggleCategories = (e?: React.MouseEvent): void => {
        if (e) e.stopPropagation();
        setShowCategories(!showCategories);
    };

    useEffect(() => {
        // Function to handle clicks outside of the categories dropdown
        const onClickOutside = (event: MouseEvent) => {
            if (categoriesRef.current && !categoriesRef.current.contains(event.target as Node) && showCategories) {
                setShowCategories(false);
            }
        };

        // Add event listener when showCategories is true
        if (showCategories) {
            document.addEventListener('mousedown', onClickOutside);
        }

        // Cleanup the event listener
        return () => {
            document.removeEventListener('mousedown', onClickOutside);
        };
    }, [showCategories]);

    return (
        <div className={styles.detailMain}>
            <div className={styles.noteHeader}>
                <div className={styles.titleSection}>
                    <h1 className={styles.noteTitle}>{props.note.title}</h1>
                </div>
                <div className={styles.categoriesSection} ref={categoriesRef}>
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
                    {props.note.reviews && props.note.reviews.length > 0 && (
                        <div className={styles.ratingStats}>
                            <StarDisplay rating={rating} />
                            <span className={styles.ratingText}>
                                {rating > 0
                                    ? rating.toFixed(1)
                                    : 'Not rated'
                                }
                            </span>
                            <span className={styles.reviewCount}>
                                ({formatNumber(props.note.reviews.length)})
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
