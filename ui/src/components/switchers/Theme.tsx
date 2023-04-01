import { LightMode, DarkMode } from '@mui/icons-material';

import { useThemeContext } from '../../contexts/ThemeContext';
import { Theme } from '../../lib/types';
import Button from '../common/Button';
import styles from './Theme.module.css';

const ThemeSwitcher = () => {
    const { theme, toggleTheme } = useThemeContext();

    return (
        <Button
            variant='secondary'
            size='medium'
            onClick={toggleTheme}
            className={styles.themeSwitcher}
            aria-label={`Switch to ${theme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT} theme`}
        >
            {theme === Theme.LIGHT ? <DarkMode /> : <LightMode />}
            <span className={styles.themeText}>
                {theme === Theme.LIGHT ? 'Dark' : 'Light'}
            </span>
        </Button>
    );
};

export default ThemeSwitcher;
