import { Component, type ReactNode } from 'react';
import { Error } from '@mui/icons-material';

import styles from './ErrorBoundary.module.css';

interface ErrorFallbackProps {
    error?: Error;
}

const ErrorFallback = (props: ErrorFallbackProps) => {
    return (
        <div className={styles.fallback}>
            <div className={styles.content}>
                <div className={styles.icon}>
                    <Error />
                </div>

                <h2 className={styles.title}>
                    Application Error
                </h2>

                <p className={styles.message}>
                    {props.error ? props.error.message: 'An unexpected error occurred. Please try again.'}
                </p>

                <div className={styles.actions}>
                    <button className={styles.btn} onClick={() => window.location.pathname = '/'}>
                        Go Home
                    </button>
                </div>
            </div>
        </div>
    );
};

interface ErrorBoundaryProps {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, State> {
    constructor(props: ErrorBoundaryProps) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <ErrorFallback error={this.state.error} />
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
