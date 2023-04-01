import { LightningAddress } from '@getalby/lightning-tools';
import { EventTemplate } from 'nostr-tools';

type ZapParams = {
    amount: string;
    nostrEvent: string;
}

class LNURLClient {
    private client: LightningAddress;

    constructor() {
        this.client = new LightningAddress(process.env.REACT_APP_LNURL_ADDRESS || '', {proxy: false});
    }

    async init() {
        await this.client.fetch();
    }

    async getInvoice(amount: number, event: EventTemplate): Promise<string> {
        const params: ZapParams = {
            amount: amount.toString(),
            nostrEvent: JSON.stringify(event),
        };
        const invoice = await this.client.generateInvoice(params);
        return invoice.paymentRequest;
    }

    disconnect() {}
}

export default LNURLClient;