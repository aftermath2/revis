import { createContext, useContext, useState, useMemo, useEffect, useRef, type ReactNode } from 'react';

import NostrClient from '../lib/nostr/client';

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
    const nostrClient = useMemo(() => new NostrClient(), []);
    const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
    const loadedRelays = useRef(false);

    useEffect(() => {
        if (loadedRelays.current) {
            return;
        }

        const loadRelays = async () => {
            await nostrClient.loadSignerRelays();
        };

        loadedRelays.current = true;
        void loadRelays();
    }, [nostrClient]);

    return (
        <NostrContext.Provider value={{ nostrClient, showLoginModal, setShowLoginModal }}>
            {props.children}
        </NostrContext.Provider>
    );
};
