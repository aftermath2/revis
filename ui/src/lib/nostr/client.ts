import { kinds, SimplePool, type NostrEvent, type VerifiedEvent, type EventTemplate, type Filter } from 'nostr-tools';
import { makeZapRequest } from 'nostr-tools/nip57';

import { INVOICE_TIMEOUT, REVIS_PUBLIC_KEY } from '../configuration';
import {
    ConfigKey,
    type UserMetadata,
    type Note,
    type Review,
    type Zap,
    SignerType,
    type NostrRelays,
    type AnnotatedNote
} from '../types';
import { EncryptedStoredString, StoredString } from '../storage';
import ExtensionSigner from './extension';
import KeySigner from './key';
import { parseNote, parseReview, parseTag, parseZap, nostrRelaysToList, zapRecipientKeySelector, eventIDKeySelector } from './utils';
import NostrCache from './cache';

const DEFAULT_RELAYS = [
	'wss://relay.primal.net',
	'wss://nos.lol',
	'wss://nostr.vulpem.com',
	'wss://relay.bitcoinpark.com',
	'wss://wot.nostr.party',
];

export interface Signer {
    getPublicKey: () => Promise<string>
    getPrivateKey(): Promise<string | undefined>
    getRelays: () => Promise<NostrRelays>
    getType: () => SignerType
    signEvent: (event: EventTemplate) => Promise<VerifiedEvent>
    disconnect: () => void
}

interface GetNoteResponse {
    note: Note;
    event: NostrEvent;
}

interface GetFullNoteResponse {
    annotatedNote: AnnotatedNote;
    event: NostrEvent;
}

interface GetReviewResponse {
    review: Review;
    event: NostrEvent;
}

class NostrClient {
    private signer?: Signer;
    private signerType: StoredString<SignerType>;
    private nsec: EncryptedStoredString<string>;
    private pool: SimplePool;
    private relays: string[] = DEFAULT_RELAYS;
    private cache: NostrCache;

    constructor() {
        this.pool = new SimplePool({ enablePing: true, enableReconnect: true });
        this.signerType = new StoredString(ConfigKey.SIGNER_TYPE);
        this.nsec = new EncryptedStoredString(ConfigKey.PRIVATE_KEY);
        this.cache = new NostrCache(this.pool, this.relays);

        const signerType = this.signerType.get() as SignerType;
        if (signerType) {
            if (signerType === SignerType.EXTENSION) {
                this.setSigner(signerType);
                return;   
            }

            const storedNsec = this.nsec.get();
            if (!storedNsec) {
                throw new Error('Couldn\'t load nostr signer');
            }
            this.setSigner(signerType, storedNsec);
        }
    }

    async loadSignerRelays() {
        if (this.signer?.getType() === SignerType.EXTENSION) {
            const signerRelays = await this.signer?.getRelays();
            const relays = nostrRelaysToList(signerRelays);
            this.relays.push(...relays);
        }
    }

    close() {
        this.pool.close(this.relays);
    }

    setSigner(signerType: SignerType, nsec?: string) {
        switch (signerType) {
            case SignerType.EXTENSION:
                this.signer = new ExtensionSigner();
                break;
            case SignerType.KEY:
                if (!nsec) {
                    throw new Error('No private key was provided');
                }
                this.signer = new KeySigner(nsec);
                break;
        }

        this.signerType.set(signerType);
    }

    getSigner(): Signer | undefined {
        return this.signer;
    }

    disconnectSigner() {
        this.signer?.disconnect();
        this.signer = undefined;
        this.signerType.remove();
    }

    async getUserMetadata(publicKey: string): Promise<UserMetadata | undefined> {
        const events = await this.pool.querySync(
            this.relays,
            {
                kinds: [kinds.Metadata],
                authors: [publicKey],
                limit: 1,
            },
        )

        if (events.length === 0) {
            return;
        }
        
        return JSON.parse(events[0].content) as UserMetadata;
    }

    async getNote(id: string): Promise<GetNoteResponse> {
        const events = await this.pool.querySync(
            this.relays,
            {
                kinds: [kinds.LongFormArticle],
                ids: [id],
                authors: [REVIS_PUBLIC_KEY],
                limit: 1
            },
        )

        const event = events[0];
        const note = parseNote(event);

        return {
            note: note,
            event: event,
        };
    }

    async getAnnotatedNote(id: string): Promise<GetFullNoteResponse> {
        const resp = await this.getNote(id);
        
        const reviews = await this.listReviews([resp.note.id]);
        const reviewIDs = reviews?.map((review) => review.id);
        const zaps = await this.listZaps(reviewIDs);
        
        const reviewsMap = new Map<Review, Zap[]>();
        for (const review of reviews) {
            const reviewZaps = zaps.filter((zap) => zap.eventID === review.id)
            reviewsMap.set(review, reviewZaps);
        }

        return {
            annotatedNote: {
                ...resp.note,
                reviewsMap: reviewsMap,
            },
            event: resp.event,
        };
    }

    async getReview(id: string): Promise<GetReviewResponse | undefined> {
        const events = await this.pool.querySync(
            this.relays,
            {
                kinds: [kinds.Zap],
                ids: [id],
                limit: 1,
            },
        )

        const event = events[0];
        const review = await parseReview(event);
        if (!review) {
            return;
        }

        return {
            review: review, 
            event: event,
        };
    }

    async listUserMetadata(
        publicKeys: string[],
        keySelector: (event: NostrEvent) => string = eventIDKeySelector
    ): Promise<Map<string, UserMetadata | undefined>> {
        if (publicKeys.length === 0) {
            return new Map();
        }

        const uniqueKeys = [...new Set(publicKeys)];
        const events = await this.pool.querySync(
            this.relays,
            {
                kinds: [kinds.Metadata],
                authors: uniqueKeys,
            },
        )

        const metadataMap = new Map<string, UserMetadata | undefined>();
        for (const event of events) {
            const metadata = JSON.parse(event.content) as UserMetadata;
            const key = keySelector(event);
            metadataMap.set(key, metadata);
        }

        return metadataMap;
    }

    // listNotes fetches a list of notes from Revis' feed. If `categories` is defined, the notes are filtered by their
    // tags.
    async listNotes(limit?: number, until?: number, categories?: string[]): Promise<Note[]> {
        const filters: Filter = {
            kinds: [kinds.LongFormArticle],
            authors: [REVIS_PUBLIC_KEY],
            limit: limit,
            until: until,
        };

        if (categories && categories.length > 0) {
            filters['#t'] = categories;
        }

        const events = await this.cache.querySync(filters);
        
        // Remove duplicate events and leave only the most recent one
        const uniqueEvents = new Map<string, NostrEvent>();
        for (const event of events) {
            const d = parseTag(event, 'd', true);
            
            const existing = uniqueEvents.get(d);
            if (!existing || event.created_at > existing.created_at) {
                uniqueEvents.set(d, event);
            }
        }

        return Array.from(uniqueEvents.values()).map((event) => parseNote(event));
    }

    // listAnnotatedNotes list notes along with their reviews and corresponding zaps.
    async listAnnotatedNotes(limit?: number, until?: number, categories?: string[]): Promise<AnnotatedNote[]> {
        const notes = await this.listNotes(limit, until, categories);
        const annotatedNotes: AnnotatedNote[] = [];
        const noteIDs = notes.map((note) => note.id);

        const reviews = await this.listReviews(noteIDs);
        const reviewIDs = reviews.map((review) => review.id)
        const zaps = await this.listZaps(reviewIDs);
        
        for (const note of notes) {
            const noteReviews = reviews.filter((review) => review.noteID === note.id);
            const reviewsMap = new Map<Review, Zap[]>();
            for (const review of noteReviews) {
                const reviewZaps = zaps.filter((zap) => zap.eventID === review.id);
                reviewsMap.set(review, reviewZaps);
            }
            
            annotatedNotes.push({
                ...note,
                reviewsMap
            })
        }
        
        return annotatedNotes;
    }

    async listReviews(noteIDs: string[], limit?: number, until?: number): Promise<Review[]> {
        if (noteIDs.length === 0) {
            return [];
        }

        const filters = {
            kinds: [kinds.Zap],
            '#e': noteIDs,
            limit: limit,
            until: until,
        };
        const events = await this.cache.querySync(filters);

        const reviews: Review[] = [];
        for (const event of events) {
            const review = await parseReview(event);
            if (review) {
                reviews.push(review);
            }
        }

        return reviews;
    }

    async listUserReviews(publicKey: string, limit?: number, until?: number): Promise<Review[]> {
        const notes = await this.listNotes();
        const eventIDs = notes.map((note) => note.id);

        const events = await this.pool.querySync(
            this.relays,
            {
                kinds: [kinds.Zap],
                '#e': eventIDs,
                '#P': [publicKey],
                limit: limit,
                until: until,
            },
        )

        const reviews: Review[] = [];
        for (const event of events) {
            const review = await parseReview(event);
            if (review) {
                reviews.push(review);
            }
        }
        
        return reviews;
    }

    async listZaps(eventIDs: string[], limit?: number, until?: number): Promise<Zap[]> {
        const filters = {
            kinds: [kinds.Zap],
            '#e': eventIDs,
            limit: limit,
            until: until,
        };
        const events = await this.cache.querySync(filters);

        // Fetch all metadata at once
        const recipients = events.map((event) => parseTag(event, 'p', true));
        const metadata = await this.listUserMetadata(recipients, zapRecipientKeySelector)

        const zaps: Zap[] = [];
        for (const event of events) {
            const zapRecipient = parseTag(event, 'p', true);
            const zapRecipientMetadata = metadata.get(zapRecipient);
            try {
                const parsedZap = await parseZap(event, zapRecipientMetadata?.lud16);
                zaps.push(parsedZap);
            } catch (e) {
                console.error(e);
            }
        }

        return zaps;
    }

    // rating is only used for reviews, and not in votes on reviews
    async createZapRequest(event: NostrEvent, amount: number, comment?: string, rating?: number): Promise<VerifiedEvent> {
        if (!this.signer) {
            throw new Error('No nostr signer is configured');
        }

        // Appendix G is omitted because notes and reviews don't use "zap" tags
        // https://github.com/nostr-protocol/nips/blob/master/57.md#appendix-g-zap-tag-on-other-events
        const eventTemplate = makeZapRequest({
            amount: amount * 1000, // Amount should be in millisatoshis
            event: event,
            comment: comment,
            relays: this.relays,
        });

        if (rating) {
            eventTemplate.tags.push(['rating', rating?.toString()]);
        }

        return await this.signer.signEvent(eventTemplate);
    }

    async publish(signedEvent: VerifiedEvent) {
        await Promise.any(this.pool.publish(this.relays, signedEvent));
    }

    waitForZap(userPublicKey: string, eventID: string): Promise<boolean> {
        return new Promise((resolve) => {
            this.pool.subscribeEose(this.relays, {
                kinds: [kinds.Zap],
                '#e': [eventID],
                '#P': [userPublicKey],
            }, {
                // Milliseconds
                maxWait: INVOICE_TIMEOUT * 1000,
                onevent: () => {
                    resolve(true);
                },
                onclose: () => {
                    resolve(false);
                }
            });
        });
    }
};

export default NostrClient;