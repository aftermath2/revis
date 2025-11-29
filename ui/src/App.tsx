import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { NostrProvider, ThemeProvider, WalletProvider, UserProvider, useUserContext } from './contexts';
import { ErrorBoundary, LoadingSpinner } from './components/common';
import { LoginDialog } from './components/dialogs';
import { Header, Sidebar } from './components/layout';
import { NoteDetail, NotesList } from './components/notes';
import { CategoriesDetail, CategoriesList } from './components/notes/categories';
import { ReviewDetail, RecentReviews } from './components/reviews';
import { Profile, ReviewsList } from './components/users';
import styles from './App.module.css';

const AppContent = () => {
  const { showLoginModal, setShowLoginModal, isLoading: loading } = useUserContext();

  return (
    loading ? <LoadingSpinner /> :
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
                  <Route path='/reviews/:reviewID' element={<ReviewDetail />} />
                  <Route path='/categories' element={<CategoriesList />} />
                  <Route path='/categories/*' element={<CategoriesDetail />} />
                  <Route path='/users/:publicKey' element={<Profile />} />
                  <Route path='/users/:publicKey/reviews' element={<ReviewsList />} />
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
