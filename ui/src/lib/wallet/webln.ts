import LNURLCLient from './lnurl';
import { Backend } from './wallet';

interface SendPaymentResponse {
  preimage: string;
}

export type WebLNExtension = {
  enable: () => Promise<void>,
  sendPayment: (req: string) => Promise<SendPaymentResponse>;
};

class WebLNBackend extends LNURLCLient implements Backend {
    private readonly webln: WebLNExtension;

    constructor() {
        super();
        this.webln = (window as any).webln;
    }

    async init() {
        if (!this.webln || typeof this.webln === 'undefined') {
            throw new Error('Lightning browser extension not found');
        }

        // This will prompt the user to unlock the wallet if it's locked
        try {
            await this.webln.enable();
        } catch (err) {
            // @ts-ignore
            throw new Error(err.message);
        }

        await super.init();
    }

    isAvailable(): boolean {
        return typeof this.webln !== 'undefined';
    }

    async payInvoice(invoice: string): Promise<string> {
        const response = await this.webln.sendPayment(invoice);
        if (!response) {
            // sendPayment returns nothing if WebLN was enabled
            // but browser extension that provides WebLN was then disabled
            // without reloading the page
            throw new Error('sendPayment returned no response');
        }

        return response.preimage;
    }
}


export default WebLNBackend;