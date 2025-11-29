import { useState, useEffect, useCallback, useRef } from 'react';

const ROOT_MARGIN = '100px';

interface UseInfiniteScrollReturn {
    isLoading: boolean;
    loadMoreRef: React.RefObject<HTMLDivElement | null>;
}

const useInfiniteScroll = (
    callback: () => void | Promise<void>,
    hasMore: boolean,
): UseInfiniteScrollReturn => {
    const [isLoading, setIsLoading] = useState(false);
    const loadMoreRef = useRef<HTMLDivElement>(null);
    const callbackRef = useRef(callback);
    const hasMoreRef = useRef(hasMore);
    const isLoadingRef = useRef(isLoading);

    // Keep refs in sync with latest values
    useEffect(() => {
        callbackRef.current = callback;
    }, [callback]);

    useEffect(() => {
        hasMoreRef.current = hasMore;
    }, [hasMore]);

    useEffect(() => {
        isLoadingRef.current = isLoading;
    }, [isLoading]);

    const onIntersection = useCallback(async (entries: IntersectionObserverEntry[]) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMoreRef.current && !isLoadingRef.current) {
            setIsLoading(true);
            try {
                await callbackRef.current();
            } finally {
                setIsLoading(false);
            }
        }
    }, []);

    useEffect(() => {
        const observer = new IntersectionObserver(() => onIntersection, {
            rootMargin: ROOT_MARGIN,
            threshold: 0.1
        });

        const currentRef = loadMoreRef.current;
        if (currentRef) {
            observer.observe(currentRef);
        }

        return () => {
            if (currentRef) {
                observer.unobserve(currentRef);
            }
            observer.disconnect();
        };
    }, [onIntersection]);

    return { isLoading, loadMoreRef };
};


export default useInfiniteScroll;
