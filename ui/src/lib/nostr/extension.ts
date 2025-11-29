/* eslint-disable @typescript-eslint/require-await */
import { type EventTemplate, type VerifiedEvent } from 'nostr-tools';

import { type NostrRelays, type Signer, SignerType } from './nostr';

class ExtensionSigner implements Signer {
    private readonly nostr: Signer;

    constructor() {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
        this.nostr = (window as any).nostr;
    }

    async getPublicKey(): Promise<string> {
        return await this.nostr.getPublicKey();    
    }

    async getPrivateKey(): Promise<string | undefined> {
        return undefined;
    }

    async getRelays(): Promise<NostrRelays> {
        return await this.nostr.getRelays();
    }

    getType(): SignerType {
        return SignerType.EXTENSION;
    }
    
    async signEvent(event: EventTemplate): Promise<VerifiedEvent> {
        return await this.nostr.signEvent(event);    
    }

    disconnect() {}
};

export default ExtensionSigner;