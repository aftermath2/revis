import { NWCClient } from '@getalby/sdk/nwc';
import { type EventTemplate } from 'nostr-tools';

import { type Backend } from './wallet';
import LNURLClient from './lnurl';
import { StoredString } from '../storage';
import { ConfigKey } from '../types';

class NWCBackend extends LNURLClient implements Backend {
    private readonly nwcClient: NWCClient;
    private readonly nwcURL: StoredString<string>;
    private canGetBalance?: boolean;
    private canPayInvoice?: boolean;

    constructor(url?: string) {
        super();
        
        this.nwcURL = new StoredString(ConfigKey.NWC_URL);
        if (!url) {
            url = this.nwcURL.get();
            if (!url) {
                throw new Error('No NWC URL provided');
            }
        }
        
        /** nwcURL = nostr+walletconnect://... */
        this.nwcClient = new NWCClient({ nostrWalletConnectUrl: url });
    }

    async init() {
        const info = await this.nwcClient.getInfo();
        this.canGetBalance = info.methods.includes('get_balance');
        this.canPayInvoice = info.methods.includes('pay_invoice');
    }

    disconnect(): void {
        this.nwcURL.remove();
        this.nwcClient.close();
    }

    isAvailable(): boolean {
        return !!this.canPayInvoice;
    }

    async getInvoice(zapRequest: EventTemplate, amount: number, lud16?: string): Promise<string> {
        if (this.canGetBalance) {
            const response = await this.nwcClient.getBalance();
            if (response.balance / 1000 < amount) {
                throw new Error('Balance is lower than the zap amount');
            }
        }

        return await super.getInvoice(zapRequest, amount, lud16);
    }

    async payInvoice(invoice: string): Promise<string> {
        const response = await this.nwcClient.payInvoice({
            invoice: invoice,
        });

        return response.preimage;
    }
}

export default NWCBackend;