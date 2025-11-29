import { useState } from 'react';
import CasinoIcon from '@mui/icons-material/Casino';

import { useNostrContext, useWalletContext } from '../../contexts';
import { WalletType as WalletBackendType } from '../../lib/wallet/wallet';
import Button from '../common/Button';
import styles from './Login.module.css';
import { SignerType } from '../../lib/nostr/nostr';

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

interface LoginDialogProps {
    show: boolean;
    onClose: () => void;
}

const LoginDialog = (props: LoginDialogProps) => {
    const { nostrClient } = useNostrContext();
    const { wallet, connectWallet, disconnectWallet } = useWalletContext();

    const [privateKey, setPrivateKey] = useState('');
    const [error, setError] = useState('');
    const [showNWCInput, setShowNWCInput] = useState(false);
    const [nwcString, setNWCString] = useState('');
    const [nwcStringError, setNWCStringError] = useState('');

    const onGenerateKey = async () => {
        nostrClient.setSigner(SignerType.KEY);
        const nsec = await nostrClient.getSigner()?.getPrivateKey();
        if (nsec) {
            setPrivateKey(nsec);
            setError('');
        } else {
            setError('Couldn\'t generate private key');
        }
    };

    const onPrivateKeySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (privateKey.length < 8) {
            setError('Private key must be at least 8 characters long');
            return;
        }

        nostrClient.setSigner(SignerType.KEY, privateKey);
    };

    const onEnableExtension = () => {
        nostrClient.setSigner(SignerType.EXTENSION);
    };

    const onDisconnectSigner = () => {
        nostrClient.disconnectSigner();
    };

    const onEnableWebLN = async () => {
        await connectWallet(WalletBackendType.WEBLN);
    };

    const onEnableNWC = () => {
        setShowNWCInput(true);
    };

    const onNWCSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nwcString.startsWith('nostr+walletconnect://')) {
            setNWCStringError('Invalid NWC URL');
            return;
        }

        await connectWallet(WalletBackendType.NWC, nwcString);
        setNWCString('');
        setNWCStringError('');
        setShowNWCInput(false);
    };

    const onBackButton = () => {
        setShowNWCInput(false);
        setNWCString('');
        setNWCStringError('');
    };

    const onDisconnectWallet = () => {
        disconnectWallet();
        setShowNWCInput(false);
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
                    <h2>Access Your Account</h2>
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
                            {nostrClient.getSigner() && (
                                <button
                                    onClick={onDisconnectSigner}
                                    className={styles.disconnectButton}
                                    aria-label='Disconnect'
                                >
                                    Disconnect
                                </button>
                            )}
                        </div>

                        {!nostrClient.getSigner() && (
                            <p className={styles.sectionDescription}>
                                Enter your private key or use a browser extension
                            </p>
                        )}

                        {nostrClient.getSigner()?.getType() === SignerType.KEY ? (
                            <ActiveOption option='Private key' />
                        ) : nostrClient.getSigner()?.getType() === SignerType.EXTENSION ? (
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
                                        <span className={styles.buttonIcon}>🔓</span>
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
                            {wallet && (
                                <button
                                    onClick={onDisconnectWallet}
                                    className={styles.disconnectButton}
                                    aria-label='Disconnect'
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

                        {wallet?.getWalletType() === WalletBackendType.WEBLN ? (
                            <ActiveOption option='Web LN' />
                        ) : wallet?.getWalletType() === WalletBackendType.NWC ? (
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
                                    >
                                        <span className={styles.buttonIcon}>🔑</span>
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
                                        <span className={styles.buttonIcon}>🎫</span>
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

export default LoginDialog;
