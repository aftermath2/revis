import { Link, useLocation } from 'react-router-dom';
import { useState, useRef, useCallback } from 'react';
import HomeIcon from '@mui/icons-material/Home';
import FolderIcon from '@mui/icons-material/Folder';
import LoginIcon from '@mui/icons-material/Login';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';

import { ThemeSwitcher } from '../switchers';
import { useUserContext } from '../../contexts';
import { useThemeContext } from '../../contexts/ThemeContext';
import styles from './Sidebar.module.css';

interface SidebarProps {
    openLoginDialog: () => void;
}

const Sidebar = (props: SidebarProps) => {
    const location = useLocation();
    const { user } = useUserContext();
    const { toggleTheme } = useThemeContext();

    const [isLongPressing, setIsLongPressing] = useState(false);
    const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);

    const isActive = (path: string): boolean => {
        if (path === '/') {
            return location.pathname === '/';
        }
        return location.pathname.startsWith(path);
    };

    const onHomePress = useCallback((e: React.MouseEvent | React.TouchEvent) => {
        // Only on mobile screens (when theme switcher is hidden)
        if (window.innerWidth > 768 || !isActive('/')) return;

        e.preventDefault();
        setIsLongPressing(true);

        longPressTimerRef.current = setTimeout(() => {
            toggleTheme();
            setIsLongPressing(false);
        }, 1500);
    }, [toggleTheme, location.pathname]);

    const onHomePressEnd = useCallback(() => {
        if (longPressTimerRef.current) {
            clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
        }
        setIsLongPressing(false);
    }, []);

    const onHomeClick = useCallback((e: React.MouseEvent) => {
        // Only prevent navigation if we're long pressing on mobile
        if (window.innerWidth <= 768 && isLongPressing) {
            e.preventDefault();
        }
    }, [isLongPressing]);

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <div className={styles.header}>
                    <Link to='/' className={styles.titleLink}>
                        <h2>Revis</h2>
                    </Link>
                </div>

                <nav className={styles.nav}>
                    <Link
                        to='/'
                        className={`${styles.navItem} ${isActive('/') ? styles.active : ''} ${isLongPressing ? styles.longPressing : ''}`}
                        onMouseDown={onHomePress}
                        onMouseUp={onHomePressEnd}
                        onClick={onHomeClick}
                    >
                        <div className={styles.navIcon}>
                            <HomeIcon />
                        </div>
                        <span>Home</span>
                    </Link>

                    <Link
                        to='/categories'
                        className={`${styles.navItem} ${isActive('/categories') ? styles.active : ''}`}
                    >
                        <div className={styles.navIcon}>
                            <FolderIcon />
                        </div>
                        <span>Categories</span>
                    </Link>

                    {user.publicKey ? (
                        <Link
                            to={`/users/${user.publicKey}`}
                            className={`${styles.navItem} ${isActive('/profile') ? styles.active : ''}`}
                        >
                            <div className={styles.navIcon}>
                                <AccountCircleIcon />
                            </div>
                            <span>Profile</span>
                        </Link>
                    ) : (
                        <button
                            className={`${styles.navItem} ${styles.loginHighlight}`}
                            onClick={props.openLoginDialog}
                        >
                            <div className={styles.navIcon}>
                                <LoginIcon />
                            </div>
                            <span>Login</span>
                        </button>
                    )}
                </nav>

                <div className={styles.controls}>
                    <ThemeSwitcher />
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
