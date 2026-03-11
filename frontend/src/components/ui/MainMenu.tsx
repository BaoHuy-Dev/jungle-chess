import { useState } from 'react';
import { useGameStore } from '../../store/gameStore';
import { useUIStore } from '../../store/gameStore';
import { useAuthStore } from '../../store/authStore';
import { api } from '../../services/api';
import { SoundManager } from '../../services/SoundManager';
import { useLanguage } from '../../i18n';
import './MainMenu.css';

export function MainMenu() {
    const { setGameState, setAIGame } = useGameStore();
    const { setPage } = useUIStore();
    const { user, logout } = useAuthStore();
    const { t, toggleLanguage } = useLanguage();
    const [joinCode, setJoinCode] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showAIDifficulty, setShowAIDifficulty] = useState(false);

    const startGame = (gamePromise: Promise<any>, aiMode = false, difficulty = '') => {
        setIsLoading(true);
        setError('');
        gamePromise
            .then((state) => {
                setGameState(state);
                if (aiMode) setAIGame(true, difficulty);
                SoundManager.playGameStart();
                setPage('game');
            })
            .catch(() => setError(t('menu.error')))
            .finally(() => setIsLoading(false));
    };

    const handleLocalGame = () => startGame(api.createLocalGame());

    const handleAIGame = (difficulty: string) => {
        setShowAIDifficulty(false);
        startGame(api.createAIGame(difficulty), true, difficulty);
    };

    const handleCreateOnline = () => startGame(api.createOnlineGame());

    const handleJoin = () => {
        if (!joinCode.trim()) return;
        startGame(api.joinGame(joinCode.trim()));
    };

    return (
        <div className="main-menu">
            {/* Animated background */}
            <div className="menu-bg">
                <div className="bg-orb bg-orb-1" />
                <div className="bg-orb bg-orb-2" />
                <div className="bg-orb bg-orb-3" />
                <div className="bg-particles">
                    {Array.from({ length: 20 }).map((_, i) => (
                        <div key={i} className="bg-particle" style={{
                            left: `${Math.random() * 100}%`,
                            top: `${Math.random() * 100}%`,
                            animationDelay: `${Math.random() * 8}s`,
                            animationDuration: `${4 + Math.random() * 6}s`,
                        }} />
                    ))}
                </div>
            </div>

            <div className="menu-content">
                {/* Language Toggle */}
                <button className="lang-toggle-btn" onClick={toggleLanguage}>
                    {t('lang.switch')}
                </button>

                {/* User Profile Bar */}
                {user && (
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        gap: 12, marginBottom: 16, padding: '10px 20px',
                        background: 'rgba(255,255,255,0.06)', borderRadius: 12,
                        border: '1px solid rgba(255,255,255,0.08)',
                    }}>
                        {user.avatarUrl && (
                            <img src={user.avatarUrl} alt={user.name}
                                style={{
                                    width: 36, height: 36, borderRadius: '50%',
                                    border: '2px solid rgba(255,215,0,0.5)',
                                }}
                            />
                        )}
                        <span style={{
                            color: 'rgba(255,255,255,0.85)', fontWeight: 600,
                            fontSize: '0.9rem',
                        }}>
                            {user.name}
                        </span>
                        <button onClick={logout} style={{
                            marginLeft: 'auto', padding: '6px 14px',
                            background: 'rgba(255,107,107,0.15)', border: '1px solid rgba(255,107,107,0.3)',
                            color: '#ff6b6b', borderRadius: 8, cursor: 'pointer',
                            fontSize: '0.8rem', transition: 'all 0.2s',
                        }}
                            onMouseEnter={e => {
                                e.currentTarget.style.background = 'rgba(255,107,107,0.25)';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = 'rgba(255,107,107,0.15)';
                            }}
                        >
                            {t('login.logout')}
                        </button>
                    </div>
                )}

                {/* Logo */}
                <div className="menu-logo">
                    <div className="logo-animals">
                        <span className="logo-animal logo-animal-left">⚔️</span>
                        <span className="logo-animal logo-animal-right">🛡️</span>
                    </div>
                    <h1 className="logo-text">{t('menu.title')}</h1>
                    <p className="logo-subtitle">
                        <span className="subtitle-line" />
                        <span>{t('menu.subtitle')}</span>
                        <span className="subtitle-line" />
                    </p>
                    <div className="logo-divider" />
                </div>

                {/* Menu buttons */}
                <div className="menu-buttons">
                    <button
                        className="menu-btn menu-btn-primary"
                        onClick={handleLocalGame}
                        disabled={isLoading}
                    >
                        <span className="btn-icon">⚔️</span>
                        <span className="btn-text">
                            <span className="btn-title">{t('menu.local')}</span>
                            <span className="btn-desc">{t('menu.localDesc')}</span>
                        </span>
                        <span className="btn-arrow">→</span>
                    </button>

                    <button
                        className="menu-btn menu-btn-ai"
                        onClick={() => setShowAIDifficulty(!showAIDifficulty)}
                        disabled={isLoading}
                    >
                        <span className="btn-icon">🤖</span>
                        <span className="btn-text">
                            <span className="btn-title">{t('menu.ai')}</span>
                            <span className="btn-desc">{t('menu.aiDesc')}</span>
                        </span>
                        <span className="btn-arrow">{showAIDifficulty ? '↓' : '→'}</span>
                    </button>

                    {/* AI Difficulty Selector */}
                    {showAIDifficulty && (
                        <div className="ai-difficulty-panel">
                            <button className="difficulty-btn difficulty-easy" onClick={() => handleAIGame('easy')} disabled={isLoading}>
                                <span className="diff-label">{t('diff.easy')}</span>
                                <span className="diff-desc">{t('diff.easyDesc')}</span>
                            </button>
                            <button className="difficulty-btn difficulty-medium" onClick={() => handleAIGame('medium')} disabled={isLoading}>
                                <span className="diff-label">{t('diff.medium')}</span>
                                <span className="diff-desc">{t('diff.mediumDesc')}</span>
                            </button>
                            <button className="difficulty-btn difficulty-hard" onClick={() => handleAIGame('hard')} disabled={isLoading}>
                                <span className="diff-label">{t('diff.hard')}</span>
                                <span className="diff-desc">{t('diff.hardDesc')}</span>
                            </button>
                        </div>
                    )}

                    <button
                        className="menu-btn menu-btn-online"
                        onClick={handleCreateOnline}
                        disabled={isLoading}
                    >
                        <span className="btn-icon">🌐</span>
                        <span className="btn-text">
                            <span className="btn-title">{t('menu.createRoom')}</span>
                            <span className="btn-desc">{t('menu.createRoomDesc')}</span>
                        </span>
                        <span className="btn-arrow">→</span>
                    </button>

                    <div className="join-section">
                        <input
                            className="join-input"
                            type="text"
                            placeholder={t('menu.joinPlaceholder')}
                            value={joinCode}
                            onChange={(e) => setJoinCode(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                        />
                        <button
                            className="menu-btn menu-btn-join"
                            onClick={handleJoin}
                            disabled={isLoading || !joinCode.trim()}
                        >
                            <span className="btn-icon">🚪</span>
                            <span className="btn-title">{t('menu.joinRoom')}</span>
                        </button>
                    </div>
                </div>

                {/* Error message */}
                {error && <div className="menu-error">{error}</div>}

                {/* Loading */}
                {isLoading && (
                    <div className="menu-loading">
                        <div className="loading-spinner" />
                        <span>{t('menu.connecting')}</span>
                    </div>
                )}

                {/* Rules preview */}
                <div className="menu-rules">
                    <h3>{t('menu.rulesTitle')}</h3>
                    <ul>
                        <li>{t('menu.rule1')}</li>
                        <li>{t('menu.rule2')}</li>
                        <li>{t('menu.rule3')}</li>
                        <li>{t('menu.rule4')}</li>
                        <li>{t('menu.rule5')}</li>
                        <li>{t('menu.rule6')}</li>
                    </ul>
                </div>

                {/* Footer */}
                <div className="menu-footer">
                    <span>{t('menu.footer')}</span>
                </div>
            </div>
        </div>
    );
}
