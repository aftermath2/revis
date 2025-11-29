import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { ArrowBack } from '@mui/icons-material';

import { sampleNotes } from '../../data/sampleData';
import styles from './Header.module.css';

// Helper function to get page title based on current route
export const usePageTitle = (): { title: string; showHeader: boolean } => {
    const location = useLocation();
    const params = useParams();

    if (location.pathname === '/') {
        return { title: '', showHeader: false };
    }

    if (location.pathname === '/categories') {
        return { title: 'Categories', showHeader: true };
    }

    if (location.pathname.startsWith('/categories/')) {
        const pathAfterCategories = location.pathname.slice('/categories/'.length);
        if (pathAfterCategories) {
            // Get the full category path and extract the last segment
            const categoryPath = decodeURIComponent(pathAfterCategories);
            const categorySegments = categoryPath.split('/');
            const lastSegment = categorySegments[categorySegments.length - 1];
            // Capitalize the first letter
            const categoryName = lastSegment.charAt(0).toUpperCase() + lastSegment.slice(1);
            return { title: categoryName, showHeader: true };
        }
        return { title: 'Category', showHeader: true };
    }

    if (location.pathname.startsWith('/notes/')) {
        const reviewMatch = location.pathname.match(/^\/notes\/\d+\/reviews\/\d+$/);
        if (reviewMatch) {
            return { title: 'Review', showHeader: true };
        }

        const noteID = params.id || null;
        if (noteID) {
            const note = sampleNotes.find(n => n.id === noteID);
            if (note) {
                return { title: note.title, showHeader: true };
            }
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
        navigate(-1);
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
