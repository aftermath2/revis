import React, { useState } from 'react';
import { Star } from '@mui/icons-material';
import styles from './StarRatingInput.module.css';

interface StarRatingInputProps {
    rating: number;
    onRatingChange: (rating: number) => void;
    size?: 'small' | 'medium' | 'large';
}

const StarRatingInput: React.FC<StarRatingInputProps> = ({
    rating,
    onRatingChange,
    size = 'large',
}) => {
    const parsedSize = size.charAt(0).toUpperCase() + size.slice(1);
    const [hoverRating, setHoverRating] = useState(0);

    const onStarClick = (rating: number) => {
        onRatingChange(rating);
    };

    const onStarHover = (rating: number) => {
        setHoverRating(rating);
    };

    const onMouseLeave = () => {
        setHoverRating(0);
    };

    const renderStar = (index: number) => {
        const starNumber = index + 1;
        const isActive = starNumber <= (hoverRating || rating);

        return (
            <div
                key={index}
                className={`${styles.starInputWrapper} ${styles[`star${parsedSize}`]}`}
                onClick={() => onStarClick(starNumber)}
                onMouseEnter={() => onStarHover(starNumber)}
                onMouseLeave={onMouseLeave}
            >
                <div className={styles.starContainer}>
                    {/* Background (empty) star */}
                    <Star
                        className={`${styles.star} ${styles.starEmpty} ${styles.starBackground} ${styles[`star${parsedSize}`]}`}
                    />
                    {/* Foreground (filled) star */}
                    {isActive && (
                        <Star
                            className={`${styles.star} ${styles.starFilled} ${styles.starForeground} ${styles[`star${parsedSize}`]}`}
                        />
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className={`${styles.starRatingInput} ${styles[`starRating${parsedSize}`]}`}>
            <div className={styles.starsInput} onMouseLeave={onMouseLeave}>
                {[0, 1, 2, 3, 4].map(renderStar)}
            </div>
        </div>
    );
};

export default StarRatingInput;
