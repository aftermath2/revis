import React from 'react';
import { Star } from '@mui/icons-material';
import styles from './StarDisplay.module.css';

interface StarDisplayProps {
    rating: number;
    fontSize?: number; // Custom font size in pixels
}

const StarDisplay: React.FC<StarDisplayProps> = ({
    rating,
    fontSize
}) => {
    const renderStars = () => {
        const stars = [];

        for (let i = 1; i <= 5; i++) {
            const starRating = Math.min(Math.max(rating - (i - 1), 0), 1);
            const fillPercentage = Math.round(starRating * 100);

            const starStyle = fontSize ? { fontSize: `${fontSize}px` } : {};

            stars.push(
                <div
                    key={i}
                    className={styles.starContainer}
                >
                    {/* Background (empty) star */}
                    <Star
                        className={`${styles.star} ${styles.starEmpty} ${styles.starBackground}`}
                        style={starStyle}
                    />
                    {/* Foreground (filled) star with gradient */}
                    <Star
                        className={`${styles.star} ${styles.starFilled} ${styles.starForeground}`}
                        style={{
                            ...starStyle,
                            clipPath: `inset(0 ${100 - fillPercentage}% 0 0)`,
                        }}
                    />
                </div>
            );
        }

        return stars;
    };

    return (
        <div className={styles.starDisplay}>
            <div className={styles.stars}>
                {renderStars()}
            </div>
        </div>
    );
};

export default StarDisplay;
