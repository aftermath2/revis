import { SearchBar } from '../common';
import { SortOption } from '../../lib/types';
import styles from './Filters.module.css';

const SORT_OPTIONS = [
    { value: SortOption.NEWEST, label: 'Newest' },
    { value: SortOption.OLDEST, label: 'Oldest' },
    { value: SortOption.HIGHEST_RATED, label: 'Highest Rated' },
    { value: SortOption.MOST_POPULAR, label: 'Most Popular' },
    { value: SortOption.TRENDING, label: 'Trending' },
    { value: SortOption.MOST_REVIEWED, label: 'Most Reviewed' },
    { value: SortOption.CONTROVERSIAL, label: 'Controversial' },
];

interface FiltersProps {
    searchQuery: string;
    onSearch: (query: string) => void;
    sortBy: SortOption;
    onSortChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
}

const Filters = (props: FiltersProps) => {
    return (
        <div>
            <div className={styles.container}>
                <SearchBar
                    onSearch={props.onSearch}
                    value={props.searchQuery}
                    placeholder={'Search notes...'}
                />

                <div className={styles.controls}>
                    <label htmlFor='sort-select' className={styles.sortLabel}>Sort by</label>
                    <select
                        id='sort-select'
                        value={props.sortBy}
                        onChange={props.onSortChange}
                        className={styles.sortSelect}
                    >
                        {SORT_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className={styles.divider}></div>
        </div>
    );
};

export default Filters;
