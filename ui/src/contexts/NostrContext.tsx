import { createContext, useContext, type ReactNode } from 'react';

import NostrClient from '../lib/nostr/nostr';

interface NostrContextType {
    nostrClient: NostrClient;
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

    return (
        <NostrContext.Provider value={{ nostrClient }}>
            {props.children}
        </NostrContext.Provider>
    );
};
