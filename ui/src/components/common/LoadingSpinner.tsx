import styles from './LoadingSpinner.module.css';

interface LoadingSpinnerProps {
    message?: string;
    size?: 'small' | 'medium' | 'large';
}

const LoadingSpinner = (props: LoadingSpinnerProps) => {
    const sizeClasses = {
        small: styles.small,
        medium: styles.medium,
        large: styles.large
    };

    return (
        <div className={`${styles.container} ${sizeClasses[props.size || 'medium']}`}>
            <div className={styles.icon}></div>
            <span className={styles.message}>
                {props.message || 'Loading...'}
            </span>
        </div>
    );
};

export default LoadingSpinner;
