import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

import Wallet, { WalletType } from '../lib/wallet/wallet';

interface WalletContextType {
    wallet?: Wallet;
    connectWallet: (type: WalletType, nwcURL?: string) => Promise<void>;
    disconnectWallet: () => void;
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
    const [wallet, setWallet] = useState<Wallet>();
    
    useEffect(() => {
        const loadWallet = async () => {
            setWallet(await Wallet.load());
        }

        loadWallet();
    }, [])

    const connectWallet = async (type: WalletType, nwcURL?: string) => {
        setWallet(await Wallet.create(type, nwcURL));
    };

    const disconnectWallet = async () => {
        // Restore state to default wallet
        setWallet(await Wallet.create(WalletType.LIGHTNING));
    }

    return (
        <WalletContext.Provider value={{ wallet, connectWallet, disconnectWallet }}>
            {props.children}
        </WalletContext.Provider>
    );
};
