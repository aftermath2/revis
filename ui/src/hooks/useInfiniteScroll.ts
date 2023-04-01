import { useState, useEffect, useCallback, useRef } from 'react';

const ROOT_MARGIN = '100px'

interface UseInfiniteScrollReturn {
    isLoading: boolean;
    loadMoreRef: React.RefObject<HTMLDivElement | null>;
}

const useInfiniteScroll = (
    callback: () => void,
    hasMore: boolean,
): UseInfiniteScrollReturn => {
    const [isLoading, setIsLoading] = useState(false);
    const loadMoreRef = useRef<HTMLDivElement>(null);

    const onIntersection = useCallback((entries: IntersectionObserverEntry[]) => {
        const [entry] = entries;
        if (entry.isIntersecting && hasMore && !isLoading) {
            setIsLoading(true);
        }
    }, [hasMore, isLoading]);

    useEffect(() => {
        const observer = new IntersectionObserver(onIntersection, {
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
    }, [onIntersection, ROOT_MARGIN]);

    useEffect(() => {
        if (!isLoading) return;
        callback();
        setIsLoading(false);
    }, [isLoading, callback]);

    return { isLoading, loadMoreRef };
};


export default useInfiniteScroll;
