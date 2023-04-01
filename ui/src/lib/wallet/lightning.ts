import { type Backend } from './wallet';
import LNURLCLient from './lnurl';

class LightningBackend extends LNURLCLient implements Backend {
    isAvailable(): boolean {
        return true;
    }

    // eslint-disable-next-line @typescript-eslint/require-await
    async payInvoice(_: string): Promise<string> {
        return '';
    }
}

export default LightningBackend;