import { useState, useMemo, useEffect, useCallback, memo } from 'react';

import { FeedNoteCard, Filters } from './';
import { LoadingSpinner } from '../common';
import { useInfiniteScroll } from '../../hooks';
import { Note, SortOption } from '../../lib/types';
import { sampleNotes } from '../../data/sampleData';
import { sortingAlgorithms } from '../../lib/sortingAlgorithms';
import { ITEMS_PER_LOAD } from '../../lib/constants';
import styles from './List.module.css';


export interface NotesFeedProps {
    filteredNotes?: Note[]; // Optional pre-filtered notes
}

const NotesList = memo((props: NotesFeedProps) => {
    const [notes] = useState<Note[]>(sampleNotes);
    const [sortBy, setSortBy] = useState<SortOption>(SortOption.MOST_POPULAR);
    const [searchQuery, setSearchQuery] = useState('');
    const [visibleNotesCount, setVisibleNotesCount] = useState(ITEMS_PER_LOAD);

    // Use filtered notes if provided, otherwise use local notes
    const baseNotes = props.filteredNotes || notes;

    const sortedNotes = useMemo(() => {
        return sortingAlgorithms.sortNotes(baseNotes, sortBy);
    }, [baseNotes, sortBy]);

    const searchFilteredNotes = useMemo(() => {
        if (!searchQuery.trim()) {
            return sortedNotes;
        }

        const query = searchQuery.toLowerCase().trim();
        return sortedNotes.filter(note => {
            return (
                note.title.toLowerCase().includes(query) ||
                note.content.toLowerCase().includes(query)
            );
        });
    }, [sortedNotes, searchQuery]);

    const visibleNotes = useMemo(() =>
        searchFilteredNotes.slice(0, visibleNotesCount),
        [searchFilteredNotes, visibleNotesCount]
    );
    const hasMore = visibleNotesCount < searchFilteredNotes.length;

    useEffect(() => {
        setVisibleNotesCount(ITEMS_PER_LOAD);
    }, [searchFilteredNotes.length, sortBy, searchQuery]);

    const loadMore = useCallback(() => {
        if (hasMore) {
            setVisibleNotesCount(prev => Math.min(prev + ITEMS_PER_LOAD, searchFilteredNotes.length));
        }
    }, [hasMore, searchFilteredNotes.length]);

    const onSearch = useCallback((query: string) => {
        setSearchQuery(query);
    }, []);

    const onSortChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setSortBy(e.target.value as SortOption);
    }, []);

    const { isLoading, loadMoreRef } = useInfiniteScroll(loadMore, hasMore);

    return (
        <div className={styles.notesListContainer}>
            <Filters
                searchQuery={searchQuery}
                onSearch={onSearch}
                sortBy={sortBy}
                onSortChange={onSortChange}
            />

            <div className={styles.list}>
                {searchFilteredNotes.length === 0 && searchQuery.trim() ? (
                    <div className={styles.listEmpty}>
                        <p>No notes found matching your search.</p>
                    </div>
                ) : (
                    <>
                        {visibleNotes.map((note: Note) => (
                            <div
                                key={note.id}
                                className={styles.noteCardWrapper}
                            >
                                <FeedNoteCard note={note} />
                            </div>
                        ))}
                    </>
                )}
            </div>

            {/* Infinite scroll trigger and loading indicator */}
            {hasMore && (
                <div ref={loadMoreRef} className={styles.loadMoreTrigger}>
                    {isLoading && (
                        <LoadingSpinner
                            message='Loading more notes...'
                            size='medium'
                        />
                    )}
                </div>
            )}
        </div>
    );
});

export default NotesList;
