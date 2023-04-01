import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import { NostrProvider, useNostrContext, ThemeProvider, WalletProvider } from './contexts';
import { ErrorBoundary } from './components/common';
import { LoginDialog } from './components/dialogs';
import { Header, Sidebar } from './components/layout';
import { NoteDetail, NotesList } from './components/notes';
import { CategoriesDetail, CategoriesList } from './components/notes/categories';
import { ReviewDetail, RecentReviews } from './components/reviews';
import { Profile, ReviewsList } from './components/users';
import styles from './App.module.css';

const AppContent = () => {
  const { showLoginModal, setShowLoginModal, nostrClient } = useNostrContext();

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
                <Routes>
                  <Route path='/' element={<NotesList />} />
                  <Route path='/notes/:id' element={<NoteDetail />} />
                  <Route path='/notes/:noteId/reviews/:reviewId' element={<ReviewDetail />} />
                  <Route path='/categories' element={<CategoriesList />} />
                  <Route path='/categories/*' element={<CategoriesDetail />} />
                  <Route
                    path='/profile'
                    element={nostrClient.getSigner() ? <Profile /> : <Navigate to='/' replace />}
                  />
                  <Route path='/users/:username' element={<Profile />} />
                  <Route path='/users/:username/reviews' element={<ReviewsList />} />
                </Routes>
              </main>
            </div>

            <div className={styles.recentReviews}>
              <RecentReviews />
            </div>
          </div>

          <LoginDialog show={showLoginModal} onClose={() => setShowLoginModal(false)} />
        </div>
      </div>
    </Router>
  );
};

const App = () => {
  return (
    <ErrorBoundary>
      <NostrProvider>
        <WalletProvider>
          <ThemeProvider>
              <AppContent />
          </ThemeProvider>
        </WalletProvider>
      </NostrProvider>
    </ErrorBoundary>
  );
};

export default App;
