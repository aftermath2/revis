import { useState, useCallback, useEffect, useRef } from 'react';

import { ITEMS_PER_LOAD } from '../lib/configuration';

export interface Timestamped {
    createdAt: number;
}

export type Fetcher<T extends Timestamped> = (limit: number, until?: number) => Promise<T[]>;

interface UsePaginationReturn<T extends Timestamped> {
    items: T[];
    hasMore: boolean;
    isLoading: boolean;
    loadMore: () => Promise<T[]>;
}

export default function usePagination<T extends Timestamped>(
    fetcher: Fetcher<T>,
    limit: number = ITEMS_PER_LOAD
): UsePaginationReturn<T> {
    const [items, setItems] = useState<T[]>([]);
    const [until, setUntil] = useState<number | undefined>(undefined);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);

    const initialLoadRef = useRef(false);
    const loadMoreRef = useRef<(() => Promise<T[]>) | null>(null);

    const loadMore = useCallback(async (): Promise<T[]> => {
        if (isLoading || !hasMore) {
            return [];
        }

        setIsLoading(true);
        try {
            const newItems = await fetcher(limit, until);
            if (newItems.length === 0) {
                setHasMore(false);
                return [];
            }

            setItems(prev => [...prev, ...newItems]);
            setUntil(newItems[newItems.length - 1].createdAt);

            if (newItems.length < limit) {
                setHasMore(false);
            }

            return newItems;
        } finally {
            setIsLoading(false);
        }
    }, [fetcher, limit, until, isLoading, hasMore]);

    loadMoreRef.current = loadMore;

    useEffect(() => {
        if (!initialLoadRef.current) {
            initialLoadRef.current = true;
            void loadMoreRef.current?.();
        }
    }, []);

    return { items, hasMore, isLoading, loadMore };
}
