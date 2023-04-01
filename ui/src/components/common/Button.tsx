import React from 'react';

import styles from './Button.module.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'tertiary' | 'danger';
    size?: 'small' | 'medium' | 'large';
    fullWidth?: boolean;
    loading?: boolean;
    children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
    variant = 'primary',
    size = 'medium',
    fullWidth = false,
    loading = false,
    className = '',
    disabled,
    children,
    ...props
}) => {
    const classNames = [
        styles.button,
        styles[variant],
        styles[size],
        fullWidth ? styles.fullWidth : '',
        loading ? styles.loading : '',
        className
    ].filter(Boolean).join(' ');

    return (
        <button
            className={classNames}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <span className={styles.spinner}></span>
            ) : (
                children
            )}
        </button>
    );
};

export default Button;
