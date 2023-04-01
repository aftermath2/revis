import { useState } from 'react';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

import Button from './Button';
import styles from './SearchBar.module.css';

interface SearchBarProps {
    onSearch: (query: string) => void;
    placeholder?: string;
    value?: string;
}

const SearchBar = (props: SearchBarProps) => {
    const [inputValue, setInputValue] = useState(props.value || '');

    const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setInputValue(query);
        props.onSearch(query);
    };

    const onClear = () => {
        setInputValue('');
        props.onSearch('');
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Escape') {
            onClear();
        }
    };

    return (
        <div className={styles.searchBar}>
            <div className={styles.searchInputContainer}>
                <SearchIcon className={styles.searchIcon} />
                <input
                    type='text'
                    value={inputValue}
                    onChange={onInputChange}
                    onKeyDown={onKeyDown}
                    placeholder={props.placeholder || 'Search notes...'}
                    className={styles.searchInput}
                    aria-label='Search notes'
                />
                {inputValue && (
                    <Button
                        variant='tertiary'
                        size='small'
                        onClick={onClear}
                        aria-label='Clear search'
                        type='button'
                        className={styles.searchClear}
                    >
                        <ClearIcon />
                    </Button>
                )}
            </div>
        </div>
    );
};

export default SearchBar;
