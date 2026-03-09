import { useEffect, useRef } from 'react';
import { useGameStore, useUIStore } from '../../store/gameStore';
import { SoundManager } from '../../services/SoundManager';
import { websocket } from '../../services/websocket';
import { useLanguage } from '../../i18n';
import './GameHUD.css';

export function GameHUD() {
    const { gameState, isAIGame, setGameState } = useGameStore();
    const { soundEnabled, toggleSound, setPage } = useUIStore();
    const { t } = useLanguage();
    const wsConnectedRef = useRef(false);

    // Connect WebSocket for real-time updates (especially for AI games)
    useEffect(() => {
        if (!gameState || wsConnectedRef.current) return;

        websocket.connect(gameState.gameId, (newState) => {
            setGameState(newState);
            // Auto-detect AI capture/win sounds
            if (newState.status === 'FINISHED') {
                setTimeout(() => SoundManager.playWin(), 300);
            }
        }).catch(console.error);
        wsConnectedRef.current = true;

        return () => {
            websocket.disconnect();
            wsConnectedRef.current = false;
        };
    }, [gameState?.gameId, setGameState]);

    // Sync sound muted state
    useEffect(() => {
        SoundManager.setMuted(!soundEnabled);
    }, [soundEnabled]);

    // Play BGM during game
    useEffect(() => {
        // Only attempt to play if we just joined/started a game
        if (gameState) {
            SoundManager.playBGM();
        }
        return () => {
            SoundManager.stopBGM();
        };
    }, [gameState?.gameId]);

    if (!gameState) return null;

    const redPieces = gameState.pieces.filter((p) => p.side === 'RED');
    const bluePieces = gameState.pieces.filter((p) => p.side === 'BLUE');
    const redAlive = redPieces.filter((p) => p.alive);
    const blueAlive = bluePieces.filter((p) => p.alive);
    const redCaptured = bluePieces.filter((p) => !p.alive);
    const blueCaptured = redPieces.filter((p) => !p.alive);
    const isRedTurn = gameState.currentTurn === 'RED';

    const handleBackToMenu = () => {
        websocket.disconnect();
        wsConnectedRef.current = false;
        useGameStore.getState().resetGame();
        setPage('menu');
    };

    return (
        <div className="game-hud">
            {/* Top bar - game info */}
            <div className="hud-top">
                <div className="hud-top-left">
                    <button className="hud-btn" onClick={handleBackToMenu} title="Menu">
                        {t('hud.menu')}
                    </button>
                    <div className="game-id">
                        <span className="label">{t('hud.room')}</span>
                        <span className="value">{gameState.gameId}</span>
                    </div>
                </div>

                <div className={`turn-indicator ${isRedTurn ? 'red-turn' : 'blue-turn'}`}>
                    <div className="turn-dot" />
                    <span>
                        {isRedTurn ? t('hud.redTurn') : t('hud.blueTurn')}
                        {isAIGame && !isRedTurn && <span className="ai-thinking"> {t('hud.aiThinking')}</span>}
                    </span>
                </div>

                <div className="hud-top-right">
                    <div className="game-status">
                        {gameState.status === 'FINISHED'
                            ? (gameState.winner === 'RED' ? t('hud.redWins') : t('hud.blueWins'))
                            : t('hud.playing')
                        }
                    </div>
                    <button className="hud-btn sound-btn" onClick={toggleSound} title={soundEnabled ? t('hud.muteOn') : t('hud.muteOff')}>
                        {soundEnabled ? '🔊' : '🔇'}
                    </button>
                </div>
            </div>

            {/* Left panel - Red player */}
            <div className="hud-player hud-player-red">
                <div className="player-header">
                    <div className={`player-avatar red-avatar ${isRedTurn ? 'active-turn' : ''}`}>🔴</div>
                    <div className="player-info">
                        <span className="player-name">{t('hud.redPlayer')}</span>
                        <span className="piece-count">{redAlive.length}/8 {t('hud.pieces')}</span>
                    </div>
                </div>
                {redCaptured.length > 0 && (
                    <div className="captured-pieces">
                        <span className="captured-label">{t('hud.captured')}</span>
                        <div className="captured-list">
                            {redCaptured.map((p, i) => (
                                <span key={i} className="captured-piece" title={p.name}>
                                    {p.name}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Right panel - Blue player */}
            <div className="hud-player hud-player-blue">
                <div className="player-header">
                    <div className={`player-avatar blue-avatar ${!isRedTurn ? 'active-turn' : ''}`}>
                        {isAIGame ? '🤖' : '🔵'}
                    </div>
                    <div className="player-info">
                        <span className="player-name">{isAIGame ? t('hud.aiPlayer') : t('hud.bluePlayer')}</span>
                        <span className="piece-count">{blueAlive.length}/8 {t('hud.pieces')}</span>
                    </div>
                </div>
                {blueCaptured.length > 0 && (
                    <div className="captured-pieces">
                        <span className="captured-label">{t('hud.captured')}</span>
                        <div className="captured-list">
                            {blueCaptured.map((p, i) => (
                                <span key={i} className="captured-piece" title={p.name}>
                                    {p.name}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Game Over overlay */}
            {gameState.status === 'FINISHED' && (
                <div className="game-over-overlay">
                    <div className="game-over-card">
                        <div className="confetti-container">
                            {Array.from({ length: 30 }).map((_, i) => (
                                <div key={i} className="confetti" style={{
                                    left: `${Math.random() * 100}%`,
                                    animationDelay: `${Math.random() * 2}s`,
                                    backgroundColor: ['#ffd700', '#ff3300', '#0077ff', '#ff69b4', '#00ff88'][i % 5],
                                }} />
                            ))}
                        </div>
                        <h1 className="winner-text">
                            🏆 {gameState.winner === 'RED' ? t('hud.redPlayer') : (isAIGame ? 'AI' : t('hud.bluePlayer'))} {t('hud.victory')} 🏆
                        </h1>
                        <p className="game-over-sub">
                            {gameState.winner === 'RED'
                                ? (isAIGame ? t('hud.beatAI') : t('hud.congRed'))
                                : (isAIGame ? t('hud.aiWon') : t('hud.congBlue'))
                            }
                        </p>
                        <div className="game-over-buttons">
                            <button className="play-again-btn" onClick={handleBackToMenu}>
                                {t('hud.playAgain')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
