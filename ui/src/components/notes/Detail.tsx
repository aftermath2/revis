import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { nip19, type NostrEvent } from 'nostr-tools';

import { Divider, LoadingSpinner } from '../common';
import { useNostrContext } from '../../contexts';
import { type AnnotatedNote } from '../../lib/types';
import NoteCard from './Card';
import ReviewsList from '../reviews/List';
import styles from './Detail.module.css';

const NoteDetail = () => {
    const { nostrClient } = useNostrContext();

    const { id } = useParams<{ id: string }>();
    const noteID = nip19.decode(id!) as nip19.DecodedNote;

    const [note, setNote] = useState<AnnotatedNote>();
    const [noteEvent, setNoteEvent] = useState<NostrEvent>();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadNote() {
            const resp = await nostrClient.getAnnotatedNote(noteID.data);
            setNote(resp.annotatedNote);
            setNoteEvent(resp.event);
            setIsLoading(false);
        };

        void loadNote();
    }, [nostrClient, noteID.data])

    // eslint-disable-next-line @typescript-eslint/require-await
    const loadReviews = useCallback(async (limit: number, until?: number) => {
        if (!note) throw Error('Note not found');

        return Array.from(note.reviewsMap.keys()).filter((review) => {
            return until ? review.createdAt < until : true;
        }).slice(0, limit);
    }, [note])

    if (!note) {
        if (isLoading) {
            return <LoadingSpinner />
        }

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

            <Divider spacing='small' />

            <ReviewsList
                loadReviews={loadReviews}
                noteID={note.id}
                noteEvent={noteEvent}
                emptyMessage='No reviews found. Be the first to add one!'
            />
        </div>
    );
};

export default NoteDetail;
