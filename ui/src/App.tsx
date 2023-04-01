import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Suspense, lazy } from 'react';

import { NostrProvider, ThemeProvider, WalletProvider, UserProvider, useNostrContext, useWalletContext } from './contexts';
import { ErrorBoundary, LoadingSpinner } from './components/common';
import { LoginModal, QRCodeModal } from './components/modals';
import { Header, Sidebar } from './components/layout';
import { RecentReviews } from './components/reviews';
import styles from './App.module.css';

const NotesList = lazy(() => import('./components/notes/List'));
const NoteDetail = lazy(() => import('./components/notes/Detail'));
const CategoriesList = lazy(() => import('./components/notes/categories/List'));
const CategoriesDetail = lazy(() => import('./components/notes/categories/Detail'));
const ReviewDetail = lazy(() => import('./components/reviews/Detail'));
const Profile = lazy(() => import('./components/users/Profile'));

const AppContent = () => {
    const { showLoginModal, setShowLoginModal } = useNostrContext();
    const { invoiceQRCode, setInvoiceQRCode } = useWalletContext();

    return (
        <Router>
            <div className={styles.scrollWrapper}>
                <div className={styles.root}>
                    <div className={styles.container}>
                        <div className={styles.sidebar}>
                            <Sidebar openLoginDialog={() => setShowLoginModal(true)} />
                        </div>

                        <div className={styles.content}>
                            <Header />

                            <main className={styles.main}>
                                <Suspense fallback={<LoadingSpinner message='Loading page...' />}>
                                    <Routes>
                                        <Route path='/' element={<NotesList />} />
                                        <Route path='/notes/:id' element={<NoteDetail />} />
                                        <Route path='/reviews/:reviewID' element={<ReviewDetail />} />
                                        <Route path='/categories' element={<CategoriesList />} />
                                        <Route path='/categories/:name' element={<CategoriesDetail />} />
                                        <Route path='/users/:publicKey' element={<Profile />} />
                                    </Routes>
                                </Suspense>
                            </main>
                        </div>

                        <div className={styles.recentReviews}>
                            <RecentReviews />
                        </div>
                    </div>

                    {/* Modals */}
                    <LoginModal show={showLoginModal} onClose={() => setShowLoginModal(false)} />
                    <QRCodeModal
                        show={invoiceQRCode?.show}
                        title={invoiceQRCode?.title}
                        value={invoiceQRCode?.value}
                        onClose={() => setInvoiceQRCode({show: false})}
                    />
                    <Toaster position='top-right' toastOptions={{duration: 2000}} />
                </div>
            </div>
        </Router>
    );
};

const App = () => {
    return (
        <ErrorBoundary>
            <NostrProvider>
                <UserProvider>
                    <WalletProvider>
                        <ThemeProvider>
                            <AppContent />
                        </ThemeProvider>
                    </WalletProvider>
                </UserProvider>
            </NostrProvider>
        </ErrorBoundary>
    );
};

export default App;
