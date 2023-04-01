import { useState, memo } from 'react';
import { OfflineBolt } from '@mui/icons-material';

import { Button } from '../common';
import styles from './ZapForm.module.css';

interface ZapFormProps {
    onSubmit: (amount: number, message?: string) => void;
    onCancel: () => void;
}

export const ZapForm = memo((props: ZapFormProps) => {
    const [amount, setAmount] = useState(1);
    const [comment, setComment] = useState('');
    const [showComment, setShowComment] = useState(false);

    const onSubmit = () => {
        if (amount >= 1 && amount <= 100000000) {
            props.onSubmit(amount, comment.trim() || undefined);
        }
    };

    const formatNumber = (num: number): string => {
        return num.toLocaleString();
    };

    const updateAmount = (newAmount: number) => {
        const amount = Math.max(1, Math.min(100000000, newAmount));
        setAmount(amount);
    };

    const onAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/,/g, '');

        if (rawValue === '') {
            setAmount(1);
            return;
        }

        const value = parseInt(rawValue, 10);
        if (!isNaN(value) && value >= 1 && value <= 100000000) {
            setAmount(value);
        }
    };

    const onBlur = () => {
        if (amount < 1) {
            setAmount(1);
        } else if (amount > 100000000) {
            setAmount(100000000);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <OfflineBolt className={styles.headerIcon} />
                <span className={styles.headerText}>Zap</span>
            </div>

            <div className={styles.amountSection}>
                <div className={styles.amountHeader}>
                    <div className={styles.zapControls}>
                        <Button
                            type='button'
                            variant='secondary'
                            size='small'
                            onClick={() => updateAmount(amount - 1)}
                            disabled={amount <= 1}
                            className={styles.amountBtn}
                        >
                            −
                        </Button>
                        <input
                            type='text'
                            value={formatNumber(amount)}
                            onChange={onAmountChange}
                            onBlur={onBlur}
                            onFocus={(e) => e.target.select()}
                            className={styles.amountInput}
                            aria-label='Zap amount'
                            placeholder='Enter amount'
                        />
                        <Button
                            type='button'
                            variant='secondary'
                            size='small'
                            onClick={() => updateAmount(amount + 1)}
                            className={styles.amountBtn}
                        >
                            +
                        </Button>
                    </div>
                </div>
            </div>

            {!showComment && (
                <button
                    className={styles.addCommentButton}
                    onClick={() => setShowComment(true)}
                >
                    Add a comment (optional)
                </button>
            )}

            {showComment && (
                <div className={styles.messageSection}>
                    <textarea
                        className={styles.messageInput}
                        placeholder='Share why you are voting for this review...'
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        rows={3}
                        autoFocus
                    />
                </div>
            )}

            <div className={styles.actions}>
                <Button
                    variant='secondary'
                    size='small'
                    onClick={props.onCancel}
                >
                    Cancel
                </Button>
                <Button
                    variant='primary'
                    size='small'
                    onClick={onSubmit}
                >
                    Submit
                </Button>
            </div>
        </div>
    );
});

export default ZapForm;
