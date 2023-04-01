import { generateSecretKey, getPublicKey, finalizeEvent, VerifiedEvent, EventTemplate, nip19 } from 'nostr-tools';

import { NostrRelays, Signer } from './nostr';
import { ConfigKey } from '../types';
import StoredString from '../storage';

class KeySigner implements Signer {
    private privateKey: Uint8Array;
    private nsec: StoredString<string>;

    // TODO: take passphrase to encrypt the value
    constructor(nsec?: string) {
        this.nsec = new StoredString(ConfigKey.PRIVATE_KEY);

        const storedNsec = this.nsec.get();
        if (storedNsec) {
            nsec = storedNsec;
        }

        if (!nsec) {
            this.privateKey = this.generateKey();
            this.nsec.set(nip19.nsecEncode(this.privateKey));
            return;
        }
        
        const { data } = nip19.decode(nsec);
        const privateKey = data as Uint8Array;

        try {
            getPublicKey(privateKey);
        } catch {
            throw new Error('Invalid private key');
        }

        this.privateKey = privateKey;
        this.nsec.set(nsec);
    }

    private generateKey(): Uint8Array {
        return generateSecretKey();
    }

    async getPublicKey(): Promise<string> {
        return getPublicKey(this.privateKey);
    }

    async getRelays(): Promise<NostrRelays> {
        return {};
    }
    
    async signEvent(event: EventTemplate): Promise<VerifiedEvent> {
        return finalizeEvent(event, this.privateKey);
    }

    disconnect() {
        this.nsec.remove();
    }
};

export default KeySigner;