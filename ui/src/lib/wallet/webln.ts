import LNURLCLient from './lnurl';
import { type Backend } from './wallet';

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
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-explicit-any
        this.webln = (window as any).webln;
    }

    async init() {
        if (!this.webln || typeof this.webln === 'undefined') {
            throw new Error('Lightning browser extension not found');
        }

        // This will prompt the user to unlock the wallet if it's locked
        await this.webln.enable();
    }

    isAvailable(): boolean {
        return typeof this.webln !== 'undefined';
    }

    async payInvoice(invoice: string): Promise<string> {
        const response = await this.webln.sendPayment(invoice);
        if (!response) {
            throw new Error('sendPayment returned no response');
        }

        return response.preimage;
    }
}


export default WebLNBackend;