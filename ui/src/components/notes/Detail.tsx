import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import { useNostrContext } from '../../contexts';
import { Note, Review } from '../../lib/types';
import { sampleNotes } from '../../data/sampleData';
import NoteCard from './Card';
import ReviewsList from '../reviews/List';
import { Divider } from '../common';
import styles from './Detail.module.css';

const NoteDetail = () => {
    const { nostrClient, setShowLoginModal } = useNostrContext();
    const navigate = useNavigate();

    const { id } = useParams<{ id: string }>();
    const [notes] = useState<Note[]>(sampleNotes);
    const [note, setNote] = useState<Note | null>();

    useEffect(() => {
        setNote(notes.find(n => n.id === id));
    }, [id, notes]);

    const onAddReview = (review: Review) => {
        if (!nostrClient.getSigner()) {
            setShowLoginModal(true);
            return;
        }

        setNote(prevNote => {
            if (!prevNote) return prevNote;

            return {
                ...prevNote,
                reviews: [...prevNote.reviews, review]
            };
        });
    }

    const onReviewClick = (reviewID: string) => {
        navigate(`/notes/${id}/reviews/${reviewID}`);
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
                reviews={note.reviews}
                onAddReview={onAddReview}
                onReviewClick={onReviewClick}
                showAddButton={true}
            />
        </div>
    );
};

export default NoteDetail;
