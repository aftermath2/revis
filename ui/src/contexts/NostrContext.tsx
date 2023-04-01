import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

import NostrClient from '../lib/nostr/nostr';

interface NostrContextType {
    nostrClient: NostrClient;
    showLoginModal: boolean;
    setShowLoginModal: (show: boolean) => void;
}

const NostrContext = createContext<NostrContextType | undefined>(undefined);

export const useNostrContext = (): NostrContextType => {
    const context = useContext(NostrContext);
    if (!context) {
        throw new Error('useNostrContext must be used within a NostrProvider');
    }
    return context;
};

interface NostrProviderProps {
    children: ReactNode;
}

export const NostrProvider: React.FC<NostrProviderProps> = (props) => {
    const nostrClient = new NostrClient();

    const [showLoginModal, setShowLoginModal] = useState<boolean>(false);

    return (
        <NostrContext.Provider value={{ nostrClient, showLoginModal, setShowLoginModal }}>
            {props.children}
        </NostrContext.Provider>
    );
};
