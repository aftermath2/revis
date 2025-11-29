import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';

import { ConfigKey, Theme } from '../lib/types';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useThemeContext = (): ThemeContextType => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useThemeContext must be used within a ThemeProvider');
    }
    return context;
};

interface ThemeProviderProps {
    children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = (props) => {
    const getStoredTheme = (): Theme => {
        try {
            const savedTheme = localStorage.getItem(ConfigKey.THEME);
            if (savedTheme === Theme.LIGHT || savedTheme === Theme.DARK) {
                return savedTheme as Theme;
            }

            // If no saved theme, check system preference
            if (typeof window !== 'undefined' && window.matchMedia) {
                const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                return systemPrefersDark ? Theme.DARK : Theme.LIGHT;
            }

            return Theme.LIGHT;
        } catch (error) {
            console.warn('Failed to load theme from localStorage:', error);
            return Theme.LIGHT;
        }
    };

    const [theme, setTheme] = useState<Theme>(getStoredTheme);

    const toggleTheme = () => {
        setTheme(prevTheme => {
            const newTheme = prevTheme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT;

            try {
                localStorage.setItem(ConfigKey.THEME, newTheme);
            } catch (error) {
                console.warn('Failed to save theme to localStorage:', error);
            }

            return newTheme;
        });
    };

    useEffect(() => {
        document.body.className = theme;
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {props.children}
        </ThemeContext.Provider>
    );
};
