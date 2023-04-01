import { Backend } from './wallet';
import LNURLCLient from './lnurl';

class LightningBackend extends LNURLCLient implements Backend {
    isAvailable(): boolean {
        return true;
    }

    async payInvoice(invoice: string): Promise<string> {
        return '';
    }
}

export default LightningBackend;