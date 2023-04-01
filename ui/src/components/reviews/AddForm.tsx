import { useState, type SubmitEvent, type ChangeEvent } from 'react';

import { Button, StarRatingInput } from '../common';
import { type Review } from '../../lib/types';
import { MAX_COMMENT_LENGTH, MAX_ZAP_AMOUNT, REVIS_PUBLIC_KEY } from '../../lib/configuration';
import { formatNumber } from '../../lib/zap';
import { useNostrContext } from '../../contexts';
import styles from './AddForm.module.css';

interface AddReviewProps {
    noteID: string,
    onAddReview: (review: Review) => Promise<void>;
    onCancel: () => void;
}

const AddReviewForm = (props: AddReviewProps) => {
    const { nostrClient, setShowLoginModal } = useNostrContext();
    

    const [zapAmount, setZapAmount] = useState<number>(21);
    const [rating, setRating] = useState<number>(3);
    const [comment, setComment] = useState<string>('');
    const [validationError, setValidationError] = useState<string>('');

    const onCommentChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
        setComment(e.target.value);
    };

    const updateZapAmount = (newAmount: number) => {
        const amount = Math.max(1, Math.min(MAX_ZAP_AMOUNT, newAmount));
        setZapAmount(amount);
    };

    const onZapAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/,/g, '');

        if (rawValue === '') {
            return;
        }

        const numValue = parseInt(rawValue);
        if (!isNaN(numValue) && numValue >= 1 && numValue <= MAX_ZAP_AMOUNT) {
            setZapAmount(numValue);
        }
    };

    const onZapAmountBlur = () => {
        if (zapAmount < 1) {
            setZapAmount(1);
        } else if (zapAmount > MAX_ZAP_AMOUNT) {
            setZapAmount(MAX_ZAP_AMOUNT);
        }
    };

    const resetForm = () => {
        setComment('');
        setValidationError('');
        setZapAmount(21);
        setRating(3);
    }

    const onSubmit = async (e: SubmitEvent<HTMLFormElement>): Promise<void> => {
        e.preventDefault();

        if (!nostrClient.getSigner()) {
            setShowLoginModal(true);
            return;
        }

        // Clear previous validation errors
        setValidationError('');

        if (comment.length === 0) {
            setValidationError('Review comment cannot be empty');
            return;
        }

        if (comment.length > MAX_COMMENT_LENGTH) {
            setValidationError(`Review comment cannot be longer than ${MAX_COMMENT_LENGTH}`);
            return;
        }

        const inlineReview: Review = {
            id: Date.now().toString(),
            noteID: props.noteID,
            authorPublicKey: await nostrClient.getSigner()?.getPublicKey() || 'Anon',
            recipient: REVIS_PUBLIC_KEY,
            comment: comment,
            createdAt: Date.now(),
            rating: rating,
            zapAmount: zapAmount
        };

        await props.onAddReview(inlineReview);
        resetForm();
    };

    const onCancel = (): void => {
        resetForm();
        props.onCancel();
    };

    return (
        <div className={styles.createReviewContainer}>
            <div className={styles.createReviewHeader}>
                <h3>Add Review</h3>
            </div>

            <form className={styles.createReviewForm} onSubmit={onSubmit}>
                <div className={styles.zapRatingSection}>
                    <div className={styles.ratingContainer}>
                        <div className={styles.sectionHeader}>
                            <span className={styles.sectionLabel}>Rating</span>
                        </div>
                        <div className={styles.ratingContent}>
                            <StarRatingInput
                                rating={rating}
                                onRatingChange={setRating}
                                size='large'
                            />
                        </div>
                    </div>

                    <div className={styles.zapContainer}>
                        <div className={styles.sectionHeader}>
                            <span className={styles.sectionLabel}>Zap amount</span>
                        </div>
                        <div className={styles.zapContent}>
                            <div className={styles.zapControls}>
                                <Button
                                    type='button'
                                    variant='secondary'
                                    size='small'
                                    onClick={() => updateZapAmount(zapAmount - 1)}
                                    disabled={zapAmount <= 1}
                                    className={styles.amountBtn}
                                >
                                    −
                                </Button>
                                <input
                                    id='amount'
                                    type='text'
                                    value={formatNumber(zapAmount)}
                                    onChange={onZapAmountChange}
                                    onBlur={onZapAmountBlur}
                                    className={styles.amountInput}
                                    onFocus={(e) => e.target.select()}
                                />
                                <Button
                                    type='button'
                                    variant='secondary'
                                    size='small'
                                    onClick={() => updateZapAmount(zapAmount + 1)}
                                    className={styles.amountBtn}
                                >
                                    +
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={styles.commentSection}>
                    <div className={styles.commentContainer}>
                        <div className={styles.commentHeader}>
                            <span className={styles.commentLabel}>Comment</span>
                        </div>
                        <div className={styles.commentContent}>
                            <textarea
                                className={styles.commentTextarea}
                                placeholder='Share your thoughts...'
                                value={comment}
                                onChange={onCommentChange}
                                rows={3}
                            />
                        </div>
                    </div>
                </div>

                {validationError && (
                    <div className={styles.validationError}>
                        {validationError}
                    </div>
                )}

                <div className={styles.formActions}>
                    <Button
                        type='button'
                        variant='secondary'
                        size='medium'
                        onClick={onCancel}
                        className={styles.cancelBtn}
                    >
                        Cancel
                    </Button>
                    <Button
                        type='submit'
                        variant='primary'
                        size='medium'
                        className={styles.submitBtn}
                    >
                        {!nostrClient.getSigner() ? 'Login to Submit' : 'Submit'}
                    </Button>
                </div>
            </form>
        </div>
    );
};

export default AddReviewForm;
