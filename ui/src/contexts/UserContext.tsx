import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

import { type User, type UserMetadata } from '../lib/types';
import { useNostrContext } from './NostrContext';

interface UserContextType {
    user: User
    login: () => Promise<void>
    logout: () => void
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
    const { nostrClient } = useNostrContext();

    const [publicKey, setPublicKey] = useState<string>();
    const [privateKey, setPrivateKey] = useState<string>();
    const [userMetadata, setUserMetadata] = useState<UserMetadata>();
    const loadedUser = useRef(false);

    const login = useCallback(async () => {
        const pubKey = await nostrClient.getSigner()?.getPublicKey();
        const privKey = await nostrClient.getSigner()?.getPrivateKey();
        setPublicKey(pubKey);
        setPrivateKey(privKey);

        if (pubKey) {
            const metadata = await nostrClient.getUserMetadata(pubKey);
            setUserMetadata(metadata);
        }
    }, [nostrClient])

    const logout = () => {
        setPublicKey(undefined);
        setPrivateKey(undefined);
        setUserMetadata(undefined);
    }

    useEffect(() => {
        if (loadedUser.current) {
            return;
        }

        async function loadUser() {
            // If there is no signer or the metadata is already loaded, return immediately
            if (!nostrClient.getSigner() || userMetadata) {
                return;
            }
            
            await login();
        }
        
        void loadUser();
        loadedUser.current = true;
    }, [nostrClient, userMetadata, login])

    return (
        <UserContext.Provider value={{
            user: {
                publicKey,
                privateKey,
                metadata: userMetadata
            },
            login,
            logout
        }}>
            {props.children}
        </UserContext.Provider>
    );
};
