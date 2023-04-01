import styles from './LoadingSpinner.module.css';

interface LoadingSpinnerProps {
    message?: string;
    size?: 'small' | 'medium' | 'large';
}

const LoadingSpinner = (props: LoadingSpinnerProps) => {
    const sizeClasses = {
        small: styles.spinnerSmall,
        medium: styles.spinnerMedium,
        large: styles.spinnerLarge
    };

    return (
        <div className={`${styles.loadingSpinner} ${sizeClasses[props.size || 'medium']}`}>
            <div className={styles.spinnerIcon}></div>
            <span className={styles.spinnerMessage}>
                {props.message || 'Loading...'}
            </span>
        </div>
    );
};

export default LoadingSpinner;
