import { EventTemplate, VerifiedEvent } from 'nostr-tools';

import { NostrRelays, Signer } from './nostr';

class ExtensionSigner implements Signer {
    private readonly nostr: Signer;

    constructor() {
        this.nostr = (window as any).nostr;
    }

    async getPublicKey(): Promise<string> {
        return await this.nostr.getPublicKey();    
    }

    async getRelays(): Promise<NostrRelays> {
        return await this.nostr.getRelays();
    }
    
    async signEvent(event: EventTemplate): Promise<VerifiedEvent> {
        return await this.nostr.signEvent(event);    
    }

    disconnect() {}
};

export default ExtensionSigner;