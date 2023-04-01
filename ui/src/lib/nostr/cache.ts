import { type SimplePool, type NostrEvent, type Filter } from 'nostr-tools';

import { NOSTR_CACHE_TTL, QUERY_TIMEOUT } from '../configuration';

interface CacheEntry {
    data: NostrEvent[];
    timestamp: number;
}

class NostrCache {
    // Milliseconds
    private static TTL = NOSTR_CACHE_TTL * 1000;
    private pool: SimplePool;
    private relays: string[];
    private cache = new Map<string, CacheEntry>();
    private pendingRequests = new Map<string, Promise<NostrEvent[]>>();

    constructor(pool: SimplePool, relays: string[]) {
        this.pool = pool;
        this.relays = relays;
        setInterval(() => this.cleanup(), NostrCache.TTL);
    }

    private getCacheKey(filters: Record<string, unknown>): string {
        const serialized = JSON.stringify(filters);
        let hash = 0;
        for (let i = 0; i < serialized.length; i++) {
            const char = serialized.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(36);
    }

    private cleanup(): void {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.timestamp > NostrCache.TTL) {
                this.cache.delete(key);
            }
        }
    }

    async querySync(
        filters: Filter
    ): Promise<NostrEvent[]> {
        const key = this.getCacheKey(filters);
        const entry = this.cache.get(key);

        if (entry) {
            return Promise.resolve(entry.data);
        }

        const pending = this.pendingRequests.get(key);
        if (pending) {
            return pending;
        }

        const request = this.pool.querySync(this.relays, filters, {maxWait: QUERY_TIMEOUT * 1000}).then(events => {
            this.cache.set(key, {
                data: events,
                timestamp: Date.now()
            });
            this.pendingRequests.delete(key);
            return events;
        });

        this.pendingRequests.set(key, request);
        return request;
    }
}

export default NostrCache;
