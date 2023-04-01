import { useState, useMemo, useCallback, memo, useEffect } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

import { ListNoteCard, Filters } from './';
import { LoadingSpinner } from '../common';
import { useNostrContext } from '../../contexts';
import { type AnnotatedNote, SortOption } from '../../lib/types';
import { sortingAlgorithms } from '../../lib/sortingAlgorithms';
import { ITEMS_PER_LOAD } from '../../lib/configuration';
import styles from './List.module.css';

export interface NotesFeedProps {
    preloadedNotes?: AnnotatedNote[];
}

const NotesList = memo((props: NotesFeedProps) => {
    const { nostrClient } = useNostrContext();

    const [notes, setNotes] = useState<AnnotatedNote[] | undefined>();
    const [sortBy, setSortBy] = useState<SortOption>(SortOption.MOST_POPULAR);
    const [searchQuery, setSearchQuery] = useState('');
    const [visibleNotesCount, setVisibleNotesCount] = useState(ITEMS_PER_LOAD);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadNotes() {
            const noteList = props.preloadedNotes || await nostrClient.listAnnotatedNotes();
            
            setNotes(noteList);
            setIsLoading(false);
        }

        void loadNotes();
    }, [nostrClient, props.preloadedNotes])

    const processedNotes = useMemo(() => {
        if (!notes) return [];

        const sorted = sortingAlgorithms.sortNotes(notes, sortBy);

        if (!searchQuery.trim()) return sorted;

        const query = searchQuery.toLowerCase().trim();
        return sorted.filter(note =>
            note.title.toLowerCase().includes(query) ||
            note.content.toLowerCase().includes(query) ||
            note.categories.some(c => c.toLowerCase().includes(query))
        );
    }, [notes, sortBy, searchQuery]);

    // Infinite scrolling in this component is just delaying the visibility of the notes
    // that were already loaded at startup. This is because we need to pull as much notes 
    // as possible in one shot to accurately sort them.
    const visibleNotes = processedNotes.slice(0, visibleNotesCount);
    const hasMore = visibleNotesCount < processedNotes.length;

    const loadMore = useCallback(() => {
        setVisibleNotesCount(prev => prev + ITEMS_PER_LOAD);
    }, []);

    const onSearch = useCallback((query: string) => {
        setSearchQuery(query);
    }, []);

    const onSortChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
        setSortBy(e.target.value as SortOption);
    }, []);

    return (
        <div className={styles.notesListContainer}>
            <Filters
                searchQuery={searchQuery}
                onSearch={onSearch}
                sortBy={sortBy}
                onSortChange={onSortChange}
            />

            {isLoading ? <LoadingSpinner /> : (
                <div>
                    {processedNotes.length === 0 && searchQuery ? (
                    <div className={styles.list}>
                        <div className={styles.listEmpty}>
                            <p>No notes found matching "{searchQuery}".</p>
                        </div>
                    </div>
                    ) : (
                        <InfiniteScroll
                            dataLength={visibleNotesCount}
                            hasMore={hasMore}
                            next={loadMore}
                            loader={<LoadingSpinner />}
                            className={styles.list}
                        >
                            {visibleNotes.map((note: AnnotatedNote) => (
                                <div key={note.id}>
                                    <ListNoteCard
                                        annotatedNote={note}
                                    />
                                </div>
                            ))}
                        </InfiniteScroll>
                    )}
                </div>
            )}
        </div>
    );
});

export default NotesList;
