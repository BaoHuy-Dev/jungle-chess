import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/authStore';
import { useUIStore } from './store/gameStore';
import { GameScene } from './components/game3d/GameScene';
import { GameHUD } from './components/ui/GameHUD';
import { MainMenu } from './components/ui/MainMenu';
import { LoginPage } from './components/ui/LoginPage';
import { AuthCallback } from './components/ui/AuthCallback';
import './App.css';

function ProtectedApp() {
  const { currentPage } = useUIStore();

  return (
    <div className="app">
      {currentPage === 'menu' && <MainMenu />}
      {currentPage === 'game' && (
        <>
          <GameScene />
          <GameHUD />
        </>
      )}
    </div>
  );
}

function App() {
  const { isAuthenticated, isLoading, loadUser, token } = useAuthStore();

  useEffect(() => {
    if (token) {
      loadUser();
    }
  }, []);

  if (isLoading && token) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #0a0a1a 0%, #1a0a2e 50%, #0a0a1a 100%)',
        color: 'rgba(255,255,255,0.6)',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 40, height: 40,
            border: '3px solid rgba(255,255,255,0.1)',
            borderTop: '3px solid #ffd700',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            margin: '0 auto 16px',
          }} />
          <span>Đang tải...</span>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/auth/callback" element={<AuthCallback />} />
      <Route path="/login" element={
        isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
      } />
      <Route path="/*" element={
        isAuthenticated ? <ProtectedApp /> : <Navigate to="/login" replace />
      } />
    </Routes>
  );
}

export default App;
