import { LightningAddress } from '@getalby/lightning-tools';
import { type EventTemplate } from 'nostr-tools';
import { REVIS_LNURL_ADDRESS } from '../configuration';

type ZapParams = {
    amount: string;
    nostr: string;
}

class LNURLClient {
    async init() {}
    
    disconnect() {}

    async getInvoice(zapRequest: EventTemplate, amount: number, lud16: string = REVIS_LNURL_ADDRESS): Promise<string> {
        const amountMsat = amount * 1000;
        const client = new LightningAddress(lud16, {proxy: false});
        await client.fetch();

        if (!client.lnurlpData) throw new Error('Couldn\'t load LNURL data');

        const minSendable = client.lnurlpData.min;
        if (amountMsat < minSendable) {
            throw new Error(`Zap amount (${amountMsat}) is lower than the minimum allowed (${minSendable})`);
        }
        const maxSendable = client.lnurlpData.max;
        if (amountMsat > maxSendable) {
            throw new Error(`Zap amount (${amountMsat}) is higher than the maximum allowed (${maxSendable})`);
        }

        const params: ZapParams = {
            amount: amountMsat.toString(),
            nostr: JSON.stringify(zapRequest),
        };
        const invoice = await client.generateInvoice(params);
        return invoice.paymentRequest;
    }
}

export default LNURLClient;