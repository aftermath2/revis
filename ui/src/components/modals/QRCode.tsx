import React, { useEffect, useState } from 'react';
import QRCodeSVG from 'react-qr-code';
import toast from 'react-hot-toast';

import { Button } from '../common';
import { INVOICE_TIMEOUT } from '../../lib/configuration';
import styles from './QRCode.module.css';

interface QRCodeModalProps {
    show?: boolean;
    value?: string;
    title?: string;
    onClose: () => void;
}

const QRCodeModal: React.FC<QRCodeModalProps> = (props) => {
    // Seconds
    const [timeLeft, setTimeLeft] = useState<number>(INVOICE_TIMEOUT);

    useEffect(() => {
        if (!props.show) {
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    props.onClose();
                    return INVOICE_TIMEOUT;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [props]);

    if (!props.show) return null;

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const formattedTime = `${minutes}:${seconds.toString().padStart(2, '0')}`;

    const onBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            props.onClose();
        }
    };

    const onCopyText = async () => {
        if (!props.value) {
            return;
        }

        try {
            await navigator.clipboard.writeText(props.value);
            toast.success('Copied to clipboard', {
                iconTheme: {
                    primary: '#f7931a',
                    secondary: 'white'
                },
            });
        } catch (err) {
            // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
            throw new Error(`Failed to copy to clipboard: ${err}`);
        }
    }

    return (
        <div className={styles.backdrop} onClick={onBackdropClick}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h2 className={styles.title}>{props.title || 'Pay the invoice'}</h2>
                </div>

                
                <div>
                    <div className={styles.countdown}>
                        <div className={styles.countdownTimer}>
                            <span className={styles.countdownLabel}>Time remaining:</span>
                            <span className={styles.countdownTime}>{formattedTime}</span>
                        </div>
                    </div>

                    <div className={styles.content}>
                        <div className={styles.qrContainer}>
                            <QRCodeSVG
                            value={props.value || ''}
                            size={256}
                            level='H'
                            className={styles.qrCode}
                            />
                        </div>
                    </div>

                    <div className={styles.footer}>
                        {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
                        <Button onClick={onCopyText}>
                            <span>Copy text to clipboard</span>
                        </Button>
                        <Button onClick={props.onClose} variant='secondary'>
                            <span>Cancel</span>
                        </Button>
                    </div>
                </div>
                
            </div>
        </div>
    );
};

export default QRCodeModal;
