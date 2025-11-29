import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { useNostrContext, useUserContext } from '../../contexts';
import { type NostrEvent } from 'nostr-tools';
import { ITEMS_PER_LOAD } from '../../lib/constants';
import { type Note, type Review } from '../../lib/types';
import NoteCard from './Card';
import ReviewsList from '../reviews/List';
import { Divider } from '../common';
import styles from './Detail.module.css';

const NoteDetail = () => {
    const { nostrClient } = useNostrContext();
    const { setShowLoginModal } = useUserContext();
    const navigate = useNavigate();

    const { id } = useParams<{ id: string }>();
    const [note, setNote] = useState<Note>();
    const [noteEvent, setNoteEvent] = useState<NostrEvent>();
    const [reviews, setReviews] = useState<Review[]>([]);

    useEffect(() => {
        async function loadNotes() {
            const [n, event] = await nostrClient.getNote(id || "");
            setNote(n);
            setNoteEvent(event);
        };

        async function loadReviews() {
            const reviewList = await nostrClient.listReviews([id || ""], ITEMS_PER_LOAD);
            setReviews(reviewList);
        }

        void loadNotes();
        void loadReviews();
    });

    const onAddReview = async (review: Review) => {
        if (!nostrClient.getSigner()) {
            setShowLoginModal(true);
            return;
        }

        if (!noteEvent) throw new Error("Review event not found");

        const zapRequest = await nostrClient.createZapRequest(noteEvent, review.zapAmount, review.comment, review.rating);
        await nostrClient.publish(zapRequest);

        setReviews([...[review], ...reviews])
    }

    const onReviewClick = (reviewID: string) => {
        void navigate(`/reviews/${reviewID}`);
    };

    if (!note) {
        return (
            <div className={styles.noteDetail}>
                <div className={styles.notFound}>
                    <h2>Note not found</h2>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <NoteCard note={note} />

            <Divider spacing="small" />

            <ReviewsList
                noteID={note.id}
                reviews={reviews}
                onAddReview={onAddReview}
                onReviewClick={onReviewClick}
                showAddButton={true}
            />
        </div>
    );
};

export default NoteDetail;
