import { type EventTemplate } from 'nostr-tools';

import LightningBackend from "./lightning";
import NWCBackend from "./nwc";
import WebLNBackend from "./webln";
import StoredString from '../storage';
import { ConfigKey } from '../types';

export enum WalletType {
    LIGHTNING = 'lightning',
    NWC = 'nwc', 
    WEBLN = 'webln'
}

export interface Backend {
    init(): Promise<void>;
    disconnect(): void;
    isAvailable(): boolean;
    getInvoice(amount: number, event: EventTemplate): Promise<string>;
    payInvoice(invoice: string): Promise<string>;
}

class Wallet {
    private backend: Backend;
    private readonly walletType: StoredString<WalletType>;

    private constructor(walletType: WalletType = WalletType.LIGHTNING, nwcURL?: string) {
        this.walletType = new StoredString(ConfigKey.WALLET_TYPE);
        this.walletType.set(walletType);
        
        switch (walletType) {
            case WalletType.LIGHTNING:
                this.backend = new LightningBackend();
                break;
            case WalletType.NWC:
                this.backend = new NWCBackend(nwcURL);
                break;
            case WalletType.WEBLN:
                this.backend = new WebLNBackend();
                break;
        }

        if (!this.backend.isAvailable()) {
            throw new Error('Wallet backend not available');
        }
    }

    static async create(walletType: WalletType, nwcURL?: string): Promise<Wallet> {
        const wallet = new Wallet(walletType, nwcURL);
        await wallet.init();
        return wallet;
    }

    static async load(): Promise<Wallet> {
        const walletType = new StoredString(ConfigKey.WALLET_TYPE).get();
            
        switch (walletType) {
            case WalletType.NWC:
                return await Wallet.create(WalletType.NWC);

        case WalletType.WEBLN:
            return await Wallet.create(WalletType.WEBLN);

        default:
            return await Wallet.create(WalletType.LIGHTNING);
        }
    }

    private async init() {
        await this.backend.init()
    }

    disconnect() {
        this.backend.disconnect();
    }

    async getInvoice(amount: number, event: EventTemplate): Promise<string> {
        return await this.backend.getInvoice(amount, event);
    }

    getWalletType(): WalletType | undefined {
        return this.walletType.get();
    }

    async payInvoice(invoice: string): Promise<string> {
        return await this.backend.payInvoice(invoice)
    }
}

export default Wallet;
