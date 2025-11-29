import { createContext, useContext, useState, type ReactNode, useEffect } from 'react';

import NostrClient, { type UserMetadata } from '../lib/nostr/nostr';
import { type User } from '../lib/types';

interface UserContextType {
    user: User
    showLoginModal: boolean;
    setShowLoginModal: (show: boolean) => void;
    isLoading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUserContext = (): UserContextType => {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error('useUserContext must be used within a UserProvider');
    }
    return context;
};

interface UserProviderProps {
    children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = (props) => {
    const nostrClient = new NostrClient();

    const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
    const [publicKey, setPublicKey] = useState<string | undefined>();
    const [privateKey, setPrivateKey] = useState<string | undefined>();
    const [userMetadata, setUserMetadata] = useState<UserMetadata>();
    const [loading, setLoading] = useState<boolean>(true);

    useEffect(() => {
        async function loadUser() {
            const publicKey = await nostrClient.getSigner()?.getPublicKey();
            const privateKey = await nostrClient.getSigner()?.getPrivateKey();
            setPublicKey(publicKey);
            setPrivateKey(privateKey);

            if (publicKey) {
                const metadata = await nostrClient.getUserMetadata(publicKey);
                setUserMetadata(metadata);
            }
            
            setLoading(false);
        }

        void loadUser();
    })

    return (
        <UserContext.Provider value={{
            user: {
                publicKey,
                privateKey,
                metadata: userMetadata
            },
            showLoginModal,
            setShowLoginModal,
            isLoading: loading,
        }}>
            {props.children}
        </UserContext.Provider>
    );
};
