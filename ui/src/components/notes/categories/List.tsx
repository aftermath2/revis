import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import InfiniteScroll from 'react-infinite-scroll-component';

import { LoadingSpinner, SearchBar } from '../../common';
import { useNostrContext } from '../../../contexts';
import { getCategoryName, getCategoryPaths } from '../../../lib/categories';
import { usePagination } from '../../../hooks';
import styles from './List.module.css';

const CategoriesList = () => {
    const { nostrClient } = useNostrContext();

    const [categories, setCategories] = useState<Set<string>>(new Set());
    const [searchQuery, setSearchQuery] = useState<string>('');

    const loadCategories = async (limit: number, until?: number) => {
        const noteList = await nostrClient.listNotes(limit, until);
        const categoriesSet = getCategoryPaths(noteList);
        setCategories(new Set([...categories, ...categoriesSet]));
        return noteList;
    };

    const { items, hasMore, loadMore } = usePagination(loadCategories);

    // Filter categories based on search
    const filteredCategories = useMemo(() => {
        if (!searchQuery.trim()) {
            return Array.from(categories);
        }

        if (categories.size === 0) {
            return [];
        }

        return Array.from(categories).filter(category =>
            category.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [categories, searchQuery]);

    const onSearch = (query: string) => {
        setSearchQuery(query);
    };

    return (
        <div className={styles.container}>
            <div className={styles.searchContainer}>
                <SearchBar
                    onSearch={onSearch}
                    placeholder='Search categories...'
                    value={searchQuery}
                />
            </div>

            <div className={styles.categoriesContainer}>
                    <InfiniteScroll
                        dataLength={items.length}
                        hasMore={hasMore}
                        next={loadMore}
                        loader={<LoadingSpinner />}
                        className={styles.list}
                    >
                        {filteredCategories.map(category => (
                            <Link
                                key={category}
                                to={`/categories/${category}`}
                                className={styles.card}
                            >
                                <div className={styles.info}>
                                    <h3 className={styles.name}>{getCategoryName(category)}</h3>
                                </div>
                            </Link>
                        ))}
                    </InfiniteScroll>

                {filteredCategories.length === 0 && searchQuery && (
                    <div className={styles.noResults}>
                        <p>No categories found matching "{searchQuery}"</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoriesList;
