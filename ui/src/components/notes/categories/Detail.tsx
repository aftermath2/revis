import { useMemo, useState } from 'react';
import { useParams, Link } from 'react-router-dom';

import { Note } from '../../../utils/types';
import { sampleNotes, sampleCategories } from '../../../data/sampleData';
import NotesList from '../List';
import styles from './Detail.module.css';

const CategoriesDetail = () => {
    const { '*': categoryPath } = useParams<{ '*': string }>();
    const [notes] = useState<Note[]>(sampleNotes);

    // Find the current category based on the path
    const currentCategory = useMemo(() => {
        if (!categoryPath) return null;
        return sampleCategories.find(cat => cat.path === categoryPath);
    }, [categoryPath]);

    // Generate breadcrumb navigation
    const breadcrumbs = useMemo(() => {
        if (!categoryPath) return [];

        const pathParts = categoryPath.split('/');
        const breadcrumbItems = [];

        for (let i = 0; i < pathParts.length; i++) {
            const currentPath = pathParts.slice(0, i + 1).join('/');
            const category = sampleCategories.find(cat => cat.path === currentPath);

            if (category) {
                breadcrumbItems.push({
                    name: category.name,
                    path: currentPath,
                    isLast: i === pathParts.length - 1
                });
            }
        }

        return breadcrumbItems;
    }, [categoryPath]);

    // Filter notes that belong to this category or its subcategories
    const categoryNotes = useMemo(() => {
        if (!categoryPath) return [];

        return notes.filter(note =>
            note.categories.some(category => {
                // Match exact path or subcategory paths
                return category === categoryPath || category.startsWith(`${categoryPath}/`);
            })
        );
    }, [notes, categoryPath]);

    // Get subcategories for this category
    const subcategories = useMemo(() => {
        if (!categoryPath) return [];

        return sampleCategories.filter(cat => {
            const pathSegments = cat.path.split('/');
            const currentPathSegments = categoryPath.split('/');

            // Check if this is a direct child (one level deeper)
            return pathSegments.length === currentPathSegments.length + 1 &&
                cat.path.startsWith(`${categoryPath}/`);
        });
    }, [categoryPath]);

    if (!currentCategory) {
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
            <div className={styles.header}>
                {currentCategory.description && (
                    <p className={styles.description}>{currentCategory.description}</p>
                )}
            </div>

            {subcategories.length > 0 && (
                <div className={styles.subcategoriesSection}>
                    <h2 className={styles.sectionTitle}>Sub-categories</h2>
                    <div className={styles.subcategoriesGrid}>
                        {subcategories.map(subcategory => {
                            const subcategoryNoteCount = notes.filter(note =>
                                note.categories.some(cat =>
                                    cat === subcategory.path || cat.startsWith(`${subcategory.path}/`)
                                )
                            ).length;

                            return (
                                <Link
                                    key={subcategory.id}
                                    to={`/categories/${subcategory.path}`}
                                    className={styles.subcategoryCard}
                                >
                                    <h3 className={styles.subcategoryName}>{subcategory.name}</h3>
                                    {subcategory.description && (
                                        <p className={styles.subcategoryDescription}>{subcategory.description}</p>
                                    )}
                                    <p className={styles.subcategoryCount}>
                                        {subcategoryNoteCount} {subcategoryNoteCount === 1 ? 'note' : 'notes'}
                                    </p>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            )}

            <div className={styles.notesSection}>
                <h2 className={styles.sectionTitle}>
                    Notes
                </h2>

                {categoryNotes.length > 0 ? (
                    <div className={styles.notesList}>
                        <NotesList filteredNotes={categoryNotes} />
                    </div>
                ) : (
                    <div className={styles.emptyState}>
                        <p className={styles.emptyMessage}>
                            No notes found in this category.
                        </p>
                        <p className={styles.emptySubtext}>
                            {subcategories.length > 0
                                ? 'Try exploring the sub-categories above or check back later for new content.'
                                : 'Check back later for new content.'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CategoriesDetail;
