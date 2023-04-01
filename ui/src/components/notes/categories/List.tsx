import { useMemo, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';

import { Note } from '../../../lib/types';
import { sampleNotes, sampleCategories } from '../../../data/sampleData';
import { LoadingSpinner, SearchBar } from '../../common';
import { useInfiniteScroll } from '../../../hooks';
import { ITEMS_PER_LOAD } from '../../../lib/constants';
import styles from './List.module.css';

const CategoriesList = () => {
    const [notes] = useState<Note[]>(sampleNotes);
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [displayedCount, setDisplayedCount] = useState<number>(ITEMS_PER_LOAD);

    // Calculate actual note counts for categories
    const categoriesWithCounts = useMemo(() => {
        const categoryNoteCounts = new Map<string, number>();

        notes.forEach(note => {
            note.categories.forEach(categoryPath => {
                // Count notes for the exact category path
                categoryNoteCounts.set(categoryPath, (categoryNoteCounts.get(categoryPath) || 0) + 1);

                // Also count for parent categories
                const pathParts = categoryPath.split('/');
                for (let i = 1; i < pathParts.length; i++) {
                    const parentPath = pathParts.slice(0, i).join('/');
                    categoryNoteCounts.set(parentPath, (categoryNoteCounts.get(parentPath) || 0) + 1);
                }
            });
        });

        return sampleCategories.map(category => ({
            ...category,
            actualNoteCount: categoryNoteCounts.get(category.path) || 0
        }));
    }, [notes]);

    // Get all categories in a flat list, sorted by note count
    const allCategories = useMemo(() => {
        return categoriesWithCounts
            .filter(category => category.actualNoteCount > 0)
            .sort((a, b) => b.actualNoteCount - a.actualNoteCount);
    }, [categoriesWithCounts]);

    // Filter categories based on search
    const filteredCategories = useMemo(() => {
        if (!searchQuery.trim()) {
            return allCategories;
        }

        return allCategories.filter(category =>
            category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            category.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            category.path.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [allCategories, searchQuery]);

    const loadMore = useCallback(() => {
        setDisplayedCount(prev => prev + ITEMS_PER_LOAD);
    }, []);

    const hasMore = displayedCount < filteredCategories.length;
    const { isLoading, loadMoreRef } = useInfiniteScroll(loadMore, hasMore);

    const onSearch = (query: string) => {
        setSearchQuery(query);
        setDisplayedCount(ITEMS_PER_LOAD);
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
                <div className={styles.grid}>
                    {filteredCategories.slice(0, displayedCount).map(category => (
                        <Link
                            key={category.id}
                            to={`/categories/${category.path}`}
                            className={styles.card}
                        >
                            <div className={styles.info}>
                                <h3 className={styles.name}>{category.name}</h3>
                                {category.description && (
                                    <p className={styles.description}>{category.description}</p>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>

                {filteredCategories.length === 0 && searchQuery && (
                    <div className={styles.noResults}>
                        <p>No categories found matching "{searchQuery}"</p>
                    </div>
                )}

                {/* Infinite scroll trigger */}
                {hasMore && !searchQuery && (
                    <div ref={loadMoreRef} className={styles.loadMoreTrigger}>
                        {isLoading && <LoadingSpinner />}
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoriesList;
