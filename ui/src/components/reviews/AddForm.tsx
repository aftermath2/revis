import { useState, FormEvent, ChangeEvent } from 'react';

import { Button, StarRatingInput } from '../common';
import { Review } from '../../lib/types';
import { formatNumber } from '../../lib/zapUtils';
import { useNostrContext } from '../../contexts';
import styles from './AddForm.module.css';

interface AddReviewProps {
    onAddReview: (review: Review) => void;
    onCancel: () => void;
}

const AddReviewForm = (props: AddReviewProps) => {
    const { nostrClient, setShowLoginModal } = useNostrContext();

    const [zapAmount, setZapAmount] = useState<number>(1);
    const [rating, setRating] = useState<number>(3);
    const [comment, setComment] = useState<string>('');
    const [validationError, setValidationError] = useState<string>('');

    const onCommentChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
        const newValue = e.target.value.trim();
        setComment(newValue);
    };

    const updateZapAmount = (newAmount: number) => {
        const amount = Math.max(1, Math.min(100000000, newAmount));
        setZapAmount(amount);
    };

    const onZapAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/,/g, '');

        if (rawValue === '') {
            return;
        }

        const numValue = parseInt(rawValue);
        if (!isNaN(numValue) && numValue >= 1 && numValue <= 100000000) {
            setZapAmount(numValue);
        }
    };

    const onZapAmountBlur = () => {
        if (zapAmount < 1) {
            setZapAmount(1);
        } else if (zapAmount > 100000000) {
            setZapAmount(100000000);
        }
    };

    const onSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
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

        // TODO: generate ID
        const reviewID = Date.now().toString();
        const newReview: Review = {
            id: reviewID,
            author: await nostrClient.getSigner()?.getPublicKey() || 'Anon',
            comment: comment,
            createdAt: new Date().toISOString(),
            rating: rating,
            zapAmount: zapAmount
        };

        props.onAddReview(newReview);

        // TODO: publish review

        // Reset form
        setComment('');
        setValidationError('');
        setZapAmount(1);
        setRating(3);
    };

    const onCancel = (): void => {
        setComment('');
        setValidationError('');
        setZapAmount(1);
        setRating(3);
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
                                size="large"
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
