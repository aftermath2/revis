import { useEffect, useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

import { type AnnotatedNote } from '../../../lib/types';
import { LoadingSpinner } from '../../common';
import { useNostrContext } from '../../../contexts';
import { getCategoryName } from '../../../lib/categories';
import NotesList from '../List';
import styles from './Detail.module.css';

const CategoriesDetail = () => {
    const { nostrClient } = useNostrContext();
    
    const { name } = useParams<{ name: string }>();
    const currentCategory = getCategoryName(name!).toLowerCase();

    const [notes, setNotes] = useState<AnnotatedNote[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    useEffect(() => {
        async function loadNotes() {
            const noteList = await nostrClient.listAnnotatedNotes(undefined, undefined, [name!]);
            setNotes(noteList);
            setIsLoading(false);
        }

        void loadNotes();
    }, [nostrClient, name])

    // Get subcategories for this category
    const subcategories = useMemo(() => {
        const subcategories = new Set<string>();

        notes.map((annotatedNote) => {
            let isSubcategory = false;

            for (const category of annotatedNote.categories) {
                if (category === currentCategory) {
                    isSubcategory = true;
                    continue;
                }

                if (isSubcategory) {
                    subcategories.add(category);
                    break;
                }
            }
        })

        return subcategories;
    }, [currentCategory, notes]);

    if (notes.length === 0) {
        if (isLoading) {
            return <LoadingSpinner />
        }

        return (
            <div className={styles.container}>
                <div className={styles.notFound}>
                    <p>Category not found.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.container}>

            {subcategories.size > 0 && (
                <div className={styles.subcategoriesSection}>
                    <h2 className={styles.sectionTitle}>Related categories</h2>
                    <div className={styles.subcategoriesGrid}>
                        {Array.from(subcategories).map((subcategory) => (
                            <Link
                                key={subcategory}
                                to={`/categories/${subcategory}`}
                                className={styles.subcategoryCard}
                            >
                                <h3 className={styles.subcategoryName}>{getCategoryName(subcategory)}</h3>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            <div className={styles.notesSection}>
                <h2 className={styles.sectionTitle}>
                    Notes
                </h2>

                {notes.length > 0 ? (
                    <div className={styles.notesList}>
                        <NotesList preloadedNotes={notes} />
                    </div>
                ) : (
                    <div className={styles.emptyState}>
                        <p className={styles.emptyMessage}>
                            No notes found in this category.
                        </p>
                        <p className={styles.emptySubtext}>
                            {subcategories.size > 0
                                ? 'Try exploring the categories above or check back later for new content.'
                                : 'Check back later for new content.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoriesDetail;
