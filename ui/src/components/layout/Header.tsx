import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowBack } from '@mui/icons-material';

import styles from './Header.module.css';
import { getCategoryName } from '../../lib/categories';

// Helper function to get page title based on current route
const usePageTitle = (): { title: string; showHeader: boolean } => {
    const location = useLocation();

    if (location.pathname === '/') {
        return { title: '', showHeader: false };
    }

    if (location.pathname === '/categories') {
        return { title: 'Categories', showHeader: true };
    }

    if (location.pathname.startsWith('/categories/')) {
        const pathAfterCategories = location.pathname.slice('/categories/'.length);
        if (pathAfterCategories) {
            const categoryPath = decodeURIComponent(pathAfterCategories);
            return { title: getCategoryName(categoryPath), showHeader: true };
        }
        return { title: 'Category', showHeader: true };
    }

    if (location.pathname.startsWith('/notes/')) {
        const reviewMatch = location.pathname.match(/^\/notes\/\d+\/reviews\/\d+$/);
        if (reviewMatch) {
            return { title: 'Review', showHeader: true };
        }

        return { title: 'Note', showHeader: true };
    }

    if (location.pathname.startsWith('/users/')) {
         const pathSegments = location.pathname.split('/');

        if (pathSegments[3] === 'reviews') {
            return { title: 'Reviews', showHeader: true };
        }

        return { title: 'Profile', showHeader: true };
    }

    return { title: 'Page', showHeader: true };
};

const Header = () => {
    const navigate = useNavigate();
    const { title, showHeader } = usePageTitle();

    const onBackClick = () => {
        // Go back to the previous page
        void navigate(-1);
    };

    if (!showHeader) {
        return null;
    }

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.headerContent}>
                    <button
                        className={styles.backButton}
                        onClick={onBackClick}
                        aria-label='Go back'
                    >
                        <ArrowBack />
                    </button>
                    <h1 className={styles.title}>{title}</h1>
                </div>
            </div>
        </div>
    );
};

export default Header;
