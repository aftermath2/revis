import { type EventTemplate, type VerifiedEvent } from 'nostr-tools';

import { type Signer } from './client';
import { SignerType, type NostrRelays } from '../../lib/types';

interface NostrExtension {
    getPublicKey(): Promise<string>;
    getRelays(): Promise<NostrRelays>;
    signEvent(event: EventTemplate): Promise<VerifiedEvent>;
}

declare global {
    interface Window {
        nostr?: NostrExtension;
    }
}

class ExtensionSigner implements Signer {
    private nostrPromise: Promise<NostrExtension>;
    private timeout: number  = 3000; // 3 seconds
    private interval: number = 50; // 50ms

    constructor() {
        this.nostrPromise = this.createNostrPromise();
    }

    private createNostrPromise(): Promise<NostrExtension> {
        return new Promise<NostrExtension>((resolve, reject) => {
            const checkNostr = () => {
                if (window.nostr) {
                    clearInterval(intervalId);
                    clearTimeout(timeoutId);
                    resolve(window.nostr);
                }
            };

            let intervalId: NodeJS.Timeout;
            let timeoutId: NodeJS.Timeout;

            // Check immediately
            checkNostr();

            // If not available, set up an interval to retry periodically
            if (!window.nostr) {
                intervalId = setInterval(checkNostr, this.interval);
                timeoutId = setTimeout(() => {
                    clearInterval(intervalId);
                    reject(new Error('Nostr extension not available. Please install a Nostr extension.'));
                }, this.timeout);
            }
        });
    }

    private async getNostr(): Promise<NostrExtension> {
        return await this.nostrPromise;
    }

    async getPublicKey(): Promise<string> {
        const nostr = await this.getNostr();
        return await nostr.getPublicKey();
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async getPrivateKey(): Promise<string | undefined> {
        return undefined;
    }

    async getRelays(): Promise<NostrRelays> {        
        const nostr = await this.getNostr();
        return await nostr.getRelays();
    }

    getType(): SignerType {
        return SignerType.EXTENSION;
    }

    async signEvent(event: EventTemplate): Promise<VerifiedEvent> {
        const nostr = await this.getNostr();
        return await nostr.signEvent(event);
    }

    disconnect() {}
};

export default ExtensionSigner;