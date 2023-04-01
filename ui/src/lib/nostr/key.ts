import { 
    getPublicKey,
    finalizeEvent,
    type VerifiedEvent,
    type EventTemplate,
    nip19
} from 'nostr-tools';

import { type Signer } from './client';
import { ConfigKey, SignerType, type NostrRelays } from '../types';
import { EncryptedStoredString } from '../storage';

class KeySigner implements Signer {
    private privateKey: Uint8Array;
    private nsec: EncryptedStoredString<string>;

    constructor(nsec: string) {
        this.nsec = new EncryptedStoredString(ConfigKey.PRIVATE_KEY);

        const storedNsec = this.nsec.get();
        if (storedNsec) {
            nsec = storedNsec;
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

    /* eslint-disable @typescript-eslint/require-await */
    async getPublicKey(): Promise<string> {
        return getPublicKey(this.privateKey);
    }

    async getPrivateKey(): Promise<string | undefined> {
        return this.nsec.get();
    }

    async getRelays(): Promise<NostrRelays> {
        return {};
    }

    getType(): SignerType {
        return SignerType.KEY;
    }
    
    async signEvent(event: EventTemplate): Promise<VerifiedEvent> {
        return finalizeEvent(event, this.privateKey);
    }

    disconnect() {
        this.nsec.remove();
    }
};

export default KeySigner;