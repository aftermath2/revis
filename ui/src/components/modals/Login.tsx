import { useState, useTransition } from 'react';
import CasinoIcon from '@mui/icons-material/Casino';
import { 
    generateSecretKey,
    nip19
} from 'nostr-tools';

import { useNostrContext, useUserContext, useWalletContext } from '../../contexts';
import { SignerType, WalletType } from '../../lib/types';
import Button from '../common/Button';
import styles from './Login.module.css';

interface ActiveOption {
    option: string
}

const ActiveOption = (props: ActiveOption) => {
    return (
        <div className={styles.activeOptionContainer}>
            <div className={styles.connectionStatus}>
                <span className={styles.statusIcon}>✓</span>
                <div className={styles.statusContent}>
                    <span className={styles.statusLabel}>Connected</span>
                    <span className={styles.option}>
                        {props.option}
                    </span>
                </div>
            </div>
        </div>
    )
}

interface LoginModalProps {
    show: boolean;
    onClose: () => void;
}

const LoginModal = (props: LoginModalProps) => {
    const { nostrClient } = useNostrContext();
    const { login, logout } = useUserContext();
    const { wallet, connectWallet, disconnectWallet } = useWalletContext();

    const [privateKey, setPrivateKey] = useState('');
    const [error, setError] = useState('');
    const [showNWCInput, setShowNWCInput] = useState(false);
    const [nwcString, setNWCString] = useState('');
    const [nwcStringError, setNWCStringError] = useState('');
    const [signerType, setSignerType] = useState<SignerType | undefined>(nostrClient.getSigner()?.getType());
    
    const [isPending, startTransition] = useTransition();

    const onGenerateKey = () => {
        const sk = generateSecretKey();
        const nsec = nip19.nsecEncode(sk);
        setPrivateKey(nsec);
    };

    const onPrivateKeySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (privateKey.length < 8) {
            setError('Private key must be at least 8 characters long');
            return;
        }

        nostrClient.setSigner(SignerType.KEY, privateKey);
        setSignerType(SignerType.KEY);

        startTransition(async () => {
            await login();
        });
    };

    const onEnableExtension = () => {
        nostrClient.setSigner(SignerType.EXTENSION);
        setSignerType(SignerType.EXTENSION);

        startTransition(async () => {
            await login();
        });
    };

    const onDisconnectSigner = () => {
        nostrClient.disconnectSigner();
        logout();
        setPrivateKey('');
        setSignerType(undefined);
    };

    const onEnableWebLN = () => {
        startTransition(async () => {
            await connectWallet(WalletType.WEBLN);
        });
    };

    const onEnableNWC = () => {
        setShowNWCInput(true);
    };

    const onNWCSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!nwcString.startsWith('nostr+walletconnect://')) {
            setNWCStringError('Invalid NWC URL');
            return;
        }

        startTransition(async () => {
            await connectWallet(WalletType.NWC, nwcString);
            setNWCString('');
            setNWCStringError('');
            setShowNWCInput(false);
        });
    };

    const onBackButton = () => {
        setShowNWCInput(false);
        setNWCString('');
        setNWCStringError('');
    };

    const onDisconnectWallet = () => {
        startTransition(async () => {
            await disconnectWallet();
            setShowNWCInput(false);
        });
    };

    const onClose = () => {
        setPrivateKey('');
        setError('');
        setShowNWCInput(false);
        setNWCString('');
        setNWCStringError('');
        // Don't reset active methods on close - they should persist
        props.onClose();
    };

    if (!props.show) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2>Account</h2>
                    <button
                        onClick={onClose}
                        className={styles.closeButton}
                        aria-label='Close dialog'
                    >
                        ×
                    </button>
                </div>

                <div className={styles.body}>
                    {/* Section 1: Signer type */}
                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h3>Signer</h3>
                            {signerType && (
                                <button
                                    onClick={onDisconnectSigner}
                                    className={styles.disconnectButton}
                                    aria-label='Disconnect'
                                >
                                    Disconnect
                                </button>
                            )}
                        </div>

                        {!signerType && (
                            <p className={styles.sectionDescription}>
                                Enter your private key or use a browser extension
                            </p>
                        )}

                        {signerType === SignerType.KEY ? (
                            <ActiveOption option='Private key' />
                        ) : signerType === SignerType.EXTENSION ? (
                            <ActiveOption option='Browser extension' />
                        ) : (
                            <form onSubmit={onPrivateKeySubmit} className={styles.optionContainer}>
                                <div className={styles.inputGroup}>
                                    <label htmlFor='private-key' className={styles.label}>
                                        Private Key
                                    </label>
                                    <div className={styles.inputWithButton}>
                                        <div className={styles.privateKeyInputContainer}>
                                            <input
                                                id='private-key'
                                                type='password'
                                                value={privateKey}
                                                onChange={(e) => setPrivateKey(e.target.value)}
                                                placeholder='nsec...'
                                                className={styles.formInput}
                                            />
                                            {!privateKey && (
                                                <button
                                                    className={styles.generateButton}
                                                    onClick={onGenerateKey}
                                                    title='Generate random key'
                                                    aria-label='Generate random key'
                                                    disabled={isPending}
                                                >
                                                    <CasinoIcon />
                                                </button>
                                            )}
                                        </div>
                                        <Button
                                            type='submit'
                                            variant='primary'
                                            size='medium'
                                            className={styles.submitButton}
                                        >
                                            Submit
                                        </Button>
                                    </div>
                                    {error && <div className={styles.errorMessage}>{error}</div>}
                                </div>

                                <div className={styles.divider}>
                                    <span className={styles.dividerText}>OR</span>
                                </div>

                                <div className={styles.alternativeOption}>
                                    <Button
                                        variant='secondary'
                                        size='large'
                                        fullWidth
                                        onClick={onEnableExtension}
                                        className={styles.openButton}
                                    >
                                        Browser extension
                                    </Button>
                                </div>
                            </form>
                        )}
                    </div>

                    {/* Section 2: Wallet type */}
                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h3>Wallet</h3>
                            {showNWCInput && !wallet && (
                                <button
                                    onClick={onBackButton}
                                    className={styles.backButton}
                                    aria-label='Back'
                                >
                                    ← Back
                                </button>
                            )}
                            {wallet?.getWalletType() !== WalletType.LIGHTNING && wallet?.isAvailable() && (
                                <button
                                    onClick={onDisconnectWallet}
                                    className={styles.disconnectButton}
                                    aria-label='Disconnect'
                                    disabled={isPending}
                                >
                                    Disconnect
                                </button>
                            )}
                        </div>

                        {!wallet && (
                            <p className={styles.sectionDescription}>
                                Connect to your wallet
                            </p>
                        )}

                        {wallet?.getWalletType() === WalletType.WEBLN ? (
                            <ActiveOption option='Web LN' />
                        ) : wallet?.getWalletType() === WalletType.NWC ? (
                            <ActiveOption option='Nostr wallet connect' />
                        ) : showNWCInput ? (
                            <form onSubmit={onNWCSubmit} className={styles.optionContainer}>
                                <div className={styles.inputGroup}>
                                    <label htmlFor='credential' className={styles.label}>
                                        NWC
                                    </label>
                                    <div className={styles.inputWithButton}>
                                        <input
                                            id='credential'
                                            type='password'
                                            value={nwcString}
                                            onChange={(e) => setNWCString(e.target.value)}
                                            placeholder='nostr+walletconnect://'
                                            className={styles.formInput}
                                            autoFocus
                                        />
                                        <Button
                                            type='submit'
                                            variant='primary'
                                            size='medium'
                                            className={styles.submitButton}
                                        >
                                            Submit
                                        </Button>
                                    </div>
                                    {nwcStringError && <div className={styles.errorMessage}>{nwcStringError}</div>}
                                </div>
                            </form>
                        ) : (
                            <div className={styles.optionContainer}>
                                <div className={styles.alternativeOption}>
                                    <Button
                                        variant='secondary'
                                        size='large'
                                        fullWidth
                                        onClick={onEnableWebLN}
                                        className={styles.openButton}
                                        disabled={isPending}
                                    >
                                        WebLN
                                    </Button>
                                </div>

                                <div className={styles.divider}>
                                    <span className={styles.dividerText}>OR</span>
                                </div>

                                <div className={styles.alternativeOption}>
                                    <Button
                                        variant='secondary'
                                        size='large'
                                        fullWidth
                                        onClick={onEnableNWC}
                                        className={styles.openButton}
                                    >
                                        NWC
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginModal;
