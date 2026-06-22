import { Routes, Route, Navigate } from 'react-router-dom';
import { Container, Spinner } from 'react-bootstrap';
import { useAuth } from './useAuth.js';
import NavHeader from './components/NavHeader.jsx';
import LoginForm from './components/LoginForm.jsx';
import Instructions from './components/Instructions.jsx';
import GamePage from './pages/GamePage.jsx';
import RankingPage from './pages/RankingPage.jsx';

function CenteredSpinner() {
  return (
    <div className="d-flex justify-content-center mt-5">
      <Spinner animation="border" role="status" />
    </div>
  );
}


function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <CenteredSpinner />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function App() {
  const { user, loading } = useAuth();

  return (
    <>
      <NavHeader />
      <Container className="py-4">
        <Routes>
          {/* Public landing: the instructions, always reachable. */}
          <Route path="/" element={<Instructions />} />

          {/* The game: logged-in only. */}
          <Route
            path="/play"
            element={
              <RequireAuth>
                <GamePage />
              </RequireAuth>
            }
          />

          
          <Route
            path="/ranking"
            element={
              <RequireAuth>
                <RankingPage />
              </RequireAuth>
            }
          />

          
          <Route
            path="/login"
            element={
              loading ? (
                <CenteredSpinner />
              ) : user ? (
                <Navigate to="/play" replace />
              ) : (
                <LoginForm />
              )
            }
          />

          
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Container>
    </>
  );
}

export default App;