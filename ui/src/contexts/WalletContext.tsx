import { createContext, useContext, useState, type ReactNode, useEffect } from 'react';
import toast from 'react-hot-toast';

import Wallet from '../lib/wallet/wallet';
import { WalletType } from '../lib/types';

interface QRCodeProps {
    show: boolean;
    title?: string;
    value?: string;
}

interface WalletContextType {
    wallet?: Wallet;
    connectWallet: (type: WalletType, nwcURL?: string) => Promise<void>;
    disconnectWallet: () => Promise<void>;
    invoiceQRCode?: QRCodeProps;
    setInvoiceQRCode: (show: QRCodeProps) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const useWalletContext = (): WalletContextType => {
    const context = useContext(WalletContext);
    if (!context) {
        throw new Error('useWalletContext must be used within a WalletProvider');
    }
    return context;
};

interface WalletProviderProps {
    children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = (props) => {
    const [wallet, setWallet] = useState<Wallet | undefined>();
    const [invoiceQRCode, setInvoiceQRCode] = useState<QRCodeProps>();
    
    useEffect(() => {
        async function loadWallet() {
            setWallet(await Wallet.load());
        }

        void loadWallet();
    }, [])

    const connectWallet = async (type: WalletType, nwcURL?: string) => {
        try {
            setWallet(await Wallet.create(type, nwcURL));
        } catch (e) {
            setWallet(await Wallet.create(WalletType.LIGHTNING));
            toast.error('Couldn\'t connect to the wallet');
            console.error(e);
        }
    };

    const disconnectWallet = async () => {
        // Restore state to default wallet
        wallet?.disconnect();
        setWallet(await Wallet.create(WalletType.LIGHTNING));
    }

    return (
        <WalletContext.Provider value={{
            wallet,
            connectWallet,
            disconnectWallet,
            invoiceQRCode,
            setInvoiceQRCode,
        }}>
            {props.children}
        </WalletContext.Provider>
    );
};
