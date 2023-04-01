import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import SettingsIcon from '@mui/icons-material/Settings';
import { nip19 } from 'nostr-tools';

import { Avatar, Divider, LoadingSpinner } from '../common';
import { useNostrContext, useUserContext } from '../../contexts';
import { SignerType, type UserMetadata } from '../../lib/types';
import { ReviewsList } from '../reviews';
import styles from './Profile.module.css';

const Profile = () => {
    const { nostrClient, setShowLoginModal } = useNostrContext();
    const { user } = useUserContext();

    const { publicKey } = useParams<{ publicKey: string }>();
    if (!publicKey?.startsWith('nprofile')) {
        throw new Error('Invalid user ID');
    }
    const nprofile = nip19.decode(publicKey) as nip19.DecodedNprofile;
    
    const [userMetadata, setUserMetadata] = useState<UserMetadata>();
    const [isCurrentUser, setIsCurrentUser] = useState(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    useEffect(() => {
        async function loadUser() {
            setIsCurrentUser(user.publicKey === nprofile.data.pubkey);

            if (isCurrentUser) {
                setUserMetadata(user.metadata);
            } else {
                setUserMetadata(await nostrClient.getUserMetadata(nprofile.data.pubkey));
            }
            setIsLoading(false);
        }

        void loadUser();
    }, [nostrClient, isCurrentUser, user, nprofile])

    const loadUserReviews = useCallback(async (limit: number, until?: number) => {
        return await nostrClient.listUserReviews(nprofile.data.pubkey, limit, until);
    }, [nostrClient, nprofile.data.pubkey])

    const showPrivateKey = nostrClient.getSigner()?.getType() === SignerType.KEY && user?.privateKey;

    const onOpenSettings = () => {
        setShowLoginModal(true);
    };

    const onCopyPrivateKey = async () => {
        if (user?.privateKey) {
            try {
                await navigator.clipboard.writeText(user?.privateKey);
                toast.success('Copied to clipboard', {
                    iconTheme: {
                        primary: '#f7931a',
                        secondary: 'white'
                    },
                })
            } catch (err) {
                // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                throw new Error(`Failed to copy to clipboard: ${err}`);
            }
        }
    };

    if (isLoading) {
        return <LoadingSpinner />
    }

    return (
        <div className={styles.container}>
            <div className={styles.content}>
                <div className={styles.profileHeader}>
                    {isCurrentUser && (
                        <button
                            className={styles.settingsButton}
                            onClick={onOpenSettings}
                            title='Account Settings'
                            aria-label='Account Settings'
                        >
                            <SettingsIcon />
                        </button>
                    )}
                    <div className={styles.profileContent}>
                        <Avatar 
                            publicKey={nprofile.data.pubkey}
                            url={userMetadata?.picture}
                            width='120px'
                        />
                        <div className={styles.profileInfo}>
                            <h1 className={styles.profileName}>{isCurrentUser ? 'You' : userMetadata?.name}</h1>
                            <p className={styles.profileDescription}>{userMetadata?.about}</p>
                        </div>

                        {isCurrentUser && showPrivateKey && (
                            <div className={styles.accountDetails}>
                                <div className={styles.infoItem}>
                                    <label>Private Key:</label>
                                    <div className={styles.privateKeyContainer}>
                                        <div className={styles.privateKey}>
                                            {'•'.repeat(63)}
                                            <button
                                                className={styles.copyButton}
                                                // eslint-disable-next-line @typescript-eslint/no-misused-promises
                                                onClick={onCopyPrivateKey}
                                                title='Copy private key to clipboard'
                                            >
                                                <ContentCopyIcon />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <Divider spacing='small' />

                <div className={styles.section}>
                    <ReviewsList
                        loadReviews={loadUserReviews}
                        emptyMessage={isCurrentUser
                            ? 'Your reviews will appear here once you start writing them.'
                            : `${userMetadata?.name} hasn't written any reviews yet.`
                        }
                    />
                </div>
            </div>
        </div>
    );
};

export default Profile;
