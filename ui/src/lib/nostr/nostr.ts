
import { kinds, SimplePool } from 'nostr-tools';
import { type NostrEvent, type VerifiedEvent, type EventTemplate } from 'nostr-tools';
import { makeZapRequest } from 'nostr-tools/nip57';

import ExtensionSigner from './extension';
import KeySigner from './key';
import StoredString from '../storage';
import { ConfigKey, type Note, type Review, type Zap } from '../types';
import { parseNote, parseReview, parseTag, parseZap } from './utils';

const RELAYS = [
    'wss://relay.damus.io',
    'wss://nos.lol',
    'wss://pyramid.fiatjaf.com',
    'wss://nostr.bitcoiner.social',
    'wss://nostr.vulpem.com',
    'wss://relay.nostr.band',
    'wss://cyberspace.nostr1.com',
    'wss://relay.bitcoinpark.com',
    'wss://relay.satlantis.io',
    'wss://relay.azzamo.net',
];

type NostrRelay = { read: boolean, write: boolean };

export type NostrRelays = Record<string, NostrRelay>;

export enum SignerType {
    EXTENSION = 'extension',
    KEY = 'key'
}

export type UserMetadata = {
    name: string
    about?: string
    picture?: string
    lud16?: string
}

export interface Signer {
    getPublicKey: () => Promise<string>
    getPrivateKey(): Promise<string | undefined>
    getRelays: () => Promise<NostrRelays>
    getType: () => SignerType
    signEvent: (event: EventTemplate) => Promise<VerifiedEvent>
    disconnect: () => void
}

class NostrClient {
    private signer?: Signer;
    private signerType: StoredString<SignerType>;
    private pool: SimplePool;

    constructor() {
        // enableReconnect will be available in nostr-tools v2.18.0 (next release)
        this.pool = new SimplePool({ enablePing: true, /* enableReconnect: true */ });
        this.signerType = new StoredString(ConfigKey.SIGNER_TYPE);

        const signerType = this.signerType.get() as SignerType;
        if (signerType) {
            this.setSigner(signerType);
        }
    }

    close() {
        this.pool.close(RELAYS);
    }

    setSigner(signerType: SignerType, nsec?: string) {
        this.signerType.set(signerType);

        switch (signerType) {
            case SignerType.EXTENSION:
                this.signer = new ExtensionSigner();
                break;
            case SignerType.KEY:
                this.signer = new KeySigner(nsec);
                break;
        }
    }

    getSigner(): Signer | undefined {
        return this.signer;
    }

    disconnectSigner() {
        this.signerType.remove();
        this.signer?.disconnect()
    }

    async getUserMetadata(publicKey: string): Promise<UserMetadata | undefined> {
        const events = await this.pool.querySync(
            RELAYS,
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

    async getNote(id: string): Promise<[Note, NostrEvent]> {
        const events = await this.pool.querySync(
            RELAYS,
            {
                kinds: [kinds.LongFormArticle],
                ids: [id],
                authors: [import.meta.env.VITE_NOSTR_PUBLIC_KEY],
                limit: 1
            },
        )

        const event = events[0];
        const note = parseNote(events[0]);

        return [note, event];
    }

    async getReview(id: string): Promise<[Review, NostrEvent]> {
        const events = await this.pool.querySync(
            RELAYS,
            {
                kinds: [kinds.Zap],
                ids: [id],
                limit: 1,
            },
        )

        const event = events[0];
        const authorMetadata = await this.getUserMetadata(event.pubkey);
        const review = await parseReview(event, authorMetadata?.lud16);

        return [review, event];
    }

    async listNotes(limit?: number): Promise<Note[]> {
        // TODO: will this return duplicated notes? e.g. Notes with more than 1 revision
        const events = await this.pool.querySync(
            RELAYS,
            {
                kinds: [kinds.LongFormArticle],
                authors: [import.meta.env.VITE_NOSTR_PUBLIC_KEY],
                limit: limit
            },
        )

        return events.map((event) => parseNote(event));
    }

    async listReviews(noteIDs: string[], limit?: number): Promise<Review[]> {
        const events = await this.pool.querySync(
            RELAYS,
            {
                kinds: [kinds.Zap],
                "#e": noteIDs,
                limit: limit,
            },
        )

        const reviews: Review[] = [];
        for (const event of events) {
            const authorMetadata = await this.getUserMetadata(event.pubkey);
            const parsedReview = await parseReview(event, authorMetadata?.lud16);

            reviews.push(parsedReview);
        }
        
        return reviews;
    }

    async listUserReviews(publicKey: string, limit?: number, until?: number): Promise<Review[]> {
        const notes = await this.listNotes();
        const eventIDs = notes.map((note) => note.id);

        const events = await this.pool.querySync(
            RELAYS,
            {
                kinds: [kinds.Zap],
                authors: [publicKey],
                "#e": eventIDs,
                limit: limit,
                until: until,
            },
        )

        const reviews: Review[] = [];
        for (const event of events) {
            const authorMetadata = await this.getUserMetadata(event.pubkey);
            const parsedReview = await parseReview(event, authorMetadata?.lud16);

            reviews.push(parsedReview);
        }
        
        return reviews;
    }

    async listUserZaps(publicKey: string, limit?: number): Promise<Zap[]> {
        const events = await this.pool.querySync(
            RELAYS,
            {
                kinds: [kinds.Zap],
                authors: [publicKey],
                limit: limit,
            },
        )

        const zaps: Zap[] = [];
        for (const event of events) {
            const zapRecipient = parseTag(event, "p", true);
            const recipientMetadata = await this.getUserMetadata(zapRecipient);
            const parsedZap = await parseZap(event, recipientMetadata?.lud16);

            zaps.push(parsedZap);
        }

        return zaps;
    }

    async listZaps(eventID: string, limit?: number): Promise<Zap[]> {
        const events = await this.pool.querySync(
            RELAYS,
            {
                kinds: [kinds.Zap],
                "#e": [eventID],
                limit: limit,
            },
        )

        const zaps: Zap[] = [];
        for (const event of events) {
            const zapRecipient = parseTag(event, "p", true);
            const recipientMetadata = await this.getUserMetadata(zapRecipient);
            const parsedZap = await parseZap(event, recipientMetadata?.lud16);

            zaps.push(parsedZap);
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
            amount: amount,
            event: event,
            comment: comment,
            relays: RELAYS,
        });

        if (rating) {
            eventTemplate.tags.push(["rating", rating?.toString()]);
        }

        return await this.signer.signEvent(eventTemplate);
    }

    async publish(signedEvent: VerifiedEvent) {
        await Promise.any(this.pool.publish(RELAYS, signedEvent));
    }
};

export default NostrClient;