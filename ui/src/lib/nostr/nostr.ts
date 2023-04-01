
import { SimplePool } from 'nostr-tools';
import { NostrEvent, VerifiedEvent, EventTemplate } from 'nostr-tools';
import { makeZapRequest, validateZapRequest } from 'nostr-tools/nip57';

import ExtensionSigner from './extension';
import KeySigner from './key';
import StoredString from '../storage';
import { ConfigKey } from '../types';

const RELAYS = [
    'wss://relay.damus.io',
    'wss://nos.lol',
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

export interface Signer {
    getPublicKey: () => Promise<string>
    getRelays: () => Promise<NostrRelays>
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

    getSignerType(): SignerType | undefined {
        return this.signerType.get();
    }

    disconnectSigner() {
        this.signerType.remove();
        this.signer?.disconnect()
    }

    async listNotes(limit?: number): Promise<NostrEvent[]> {
        const events = await this.pool.querySync(
            RELAYS,
            {
                kinds: [30023],
                authors: [process.env.REACT_APP_NOSTR_PUBLIC_KEY || ''],
                limit: limit
            },
        )
        return events;
    }

    async listReviews(note: NostrEvent): Promise<NostrEvent[]> {
        const events = await this.pool.querySync(
            RELAYS,
            {
                kinds: [9735],
                ids: [note.id],
            },
        )
        // TODO: take content field, and amount and e tags only
        return events;
    }

    async listUserZaps(publicKey: string, limit?: number): Promise<NostrEvent[]> {
        const events = await this.pool.querySync(
            RELAYS,
            {
                kinds: [9735],
                authors: [publicKey],
                limit: limit,
            },
        )
        // TODO: 
        // - filter by event IDs somehow
        // - take content field, and amount and e tags only
        return events;
    }

    async createZapRequest(event: NostrEvent, amount: number, comment: string): Promise<VerifiedEvent> {
        if (!this.signer) {
            throw new Error('No nostr signer is configured')
        }

        const eventTemplate = makeZapRequest({
            amount: amount,
            event: event,
            comment: comment,
            relays: RELAYS,
        });

        return await this.signer.signEvent(eventTemplate);
    }

    async publish(signedEvent: VerifiedEvent) {
        await Promise.any(this.pool.publish(RELAYS, signedEvent));
    }

    validateZap(zapRequestString: string) {
        const error = validateZapRequest(zapRequestString);
        if (error) {
            throw new Error(error);
        }
    }
};

export default NostrClient;