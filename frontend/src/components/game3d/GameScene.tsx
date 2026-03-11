import { useRef, useCallback, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Environment } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, N8AO } from '@react-three/postprocessing';
import * as THREE from 'three';
import { Board3D } from './Board3D';
import { Piece3D } from './Piece3D';
import { AmbientFireflies, BoardDecorations, GrassTufts, JungleMist, JungleSpores } from './ParticleEffects';
import { useGameStore } from '../../store/gameStore';
import type { PieceData } from '../../store/gameStore';
import { api } from '../../services/api';
import { SoundManager } from '../../services/SoundManager';
import { PieceInspector } from './PieceInspector';

const CELL_SIZE = 1.1;

const useMobile = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    useFrame(() => {
        const mobile = window.innerWidth < 768;
        if (mobile !== isMobile) setIsMobile(mobile);
    });
    return isMobile;
};

const MoveHighlight3D = ({ row, col, isCapture }: { row: number; col: number; isCapture: boolean }) => (
    <mesh position={[(col - 3) * CELL_SIZE, 0.01, (row - 4) * CELL_SIZE]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.35, 0.45, 32]} />
        <meshBasicMaterial color={isCapture ? '#ff0000' : '#ffff00'} transparent opacity={0.6} side={THREE.DoubleSide} />
    </mesh>
);

/**
 * Inner scene content (must be inside Canvas).
 */
function SceneContent({ onInspect }: { onInspect: (piece: PieceData) => void }) {
    const { gameState, selectedPiece, validMoves, selectPiece, clearSelection, setGameState } = useGameStore();
    const prevTurnRef = useRef<string | null>(null);
    const isMobile = useMobile();

    // Track turn changes for sound
    useFrame(() => {
        if (gameState) {
            if (prevTurnRef.current && prevTurnRef.current !== gameState.currentTurn) {
                SoundManager.playTurnChange();
            }
            prevTurnRef.current = gameState.currentTurn;
        }
    });

    const handlePieceClick = useCallback(async (piece: PieceData) => {
        if (!gameState || gameState.status !== 'PLAYING') return;

        // If clicking own piece during own turn -> select it
        if (piece.side === gameState.currentTurn) {
            try {
                const movesResp = await api.getValidMoves(gameState.gameId, piece.row, piece.col);
                selectPiece(piece.row, piece.col, movesResp.validMoves);
                SoundManager.playSelect();
            } catch (e) {
                console.error('Failed to get valid moves:', e);
            }
            return;
        }

        // If clicking enemy piece when we have a selection -> try to capture
        if (selectedPiece) {
            const isValidTarget = validMoves.some((m) => m[0] === piece.row && m[1] === piece.col);
            if (isValidTarget) {
                try {
                    const newState = await api.makeMove(
                        gameState.gameId,
                        selectedPiece.row,
                        selectedPiece.col,
                        piece.row,
                        piece.col
                    );
                    setGameState(newState);
                    SoundManager.playCapture();

                    if (newState.status === 'FINISHED') {
                        setTimeout(() => SoundManager.playWin(), 500);
                    }
                } catch (e) {
                    console.error('Move failed:', e);
                    SoundManager.playInvalid();
                }
                clearSelection();
            } else {
                SoundManager.playInvalid();
            }
        }
    }, [gameState, selectedPiece, validMoves, selectPiece, clearSelection, setGameState]);

    const handleCellClick = useCallback(async (row: number, col: number) => {
        if (!gameState || !selectedPiece || gameState.status !== 'PLAYING') return;

        const isValidMove = validMoves.some((m) => m[0] === row && m[1] === col);
        if (isValidMove) {
            try {
                const newState = await api.makeMove(
                    gameState.gameId,
                    selectedPiece.row,
                    selectedPiece.col,
                    row,
                    col
                );
                setGameState(newState);
                SoundManager.playMove();

                if (newState.status === 'FINISHED') {
                    setTimeout(() => SoundManager.playWin(), 500);
                }
            } catch (e) {
                console.error('Move failed:', e);
                SoundManager.playInvalid();
            }
            clearSelection();
        } else {
            clearSelection();
        }
    }, [gameState, selectedPiece, validMoves, clearSelection, setGameState]);

    if (!gameState) return null;

    // Valid move positions with enemy pieces (for capture highlighting)
    const capturePositions = new Set(
        validMoves
            .filter(([r, c]) => gameState.pieces.some((p) => p.alive && p.row === r && p.col === c))
            .map(([r, c]) => `${r}-${c}`)
    );

    // Dens and Traps logic is now handled in Board3D.tsx

    return (
        <>
            {/* Dark Fantasy Cinematic Lighting */}
            <ambientLight intensity={0.25} color="#7788aa" />
            <directionalLight
                position={[8, 18, 8]}
                intensity={1.1}
                color="#ffeedd"
                castShadow={!isMobile}
                shadow-mapSize={isMobile ? [512, 512] : [2048, 2048]}
                shadow-camera-far={40}
                shadow-camera-left={-10}
                shadow-camera-right={10}
                shadow-camera-top={10}
                shadow-camera-bottom={-10}
            />
            {/* Warm sunlight */}
            <directionalLight position={[10, 15, 10]} intensity={1.2} color="#fff8e7" castShadow />
            {/* Bright ambient sky light */}
            <ambientLight intensity={0.7} color="#d4e8f9" />
            {/* Soft fill light */}
            <pointLight position={[-10, 8, -10]} intensity={0.6} color="#f0f8ff" />

            {/* Bright Sky & Atmosphere */}
            <color attach="background" args={['#c8e1f0']} />
            <fog attach="fog" args={['#c8e1f0', 15, 35]} />
            <Environment preset="forest" blur={0.6} />

            {/* Board */}
            <Board3D boardLayout={gameState.boardLayout} isMobile={isMobile} />

            {/* Board decorations (trees, rocks) */}
            <BoardDecorations />

            {/* Grass tufts on ground cells */}
            <GrassTufts boardLayout={gameState.boardLayout} />

            {/* Ambient jungle particles - Reduced count on mobile */}
            <AmbientFireflies count={isMobile ? 15 : 40} />

            {/* Jungle mist low-lying fog - Reduced count on mobile */}
            <JungleMist count={isMobile ? 10 : 25} />

            {/* Floating jungle spores - Reduced count on mobile */}
            <JungleSpores count={isMobile ? 5 : 15} />

            {/* Pieces */}
            {gameState.pieces.map((piece, idx) => (
                <Piece3D
                    key={`${piece.type}-${piece.side}-${idx}`}
                    piece={piece}
                    isActive={selectedPiece?.row === piece.row && selectedPiece?.col === piece.col}
                    isMobile={isMobile}
                    onClick={() => handlePieceClick(piece)}
                    onDoubleClick={() => onInspect(piece)}
                />
            ))}

            {/* Valid move highlights */}
            {validMoves.map(([r, c]) => (
                <MoveHighlight3D
                    key={`move-${r}-${c}`}
                    row={r}
                    col={c}
                    isCapture={capturePositions.has(`${r}-${c}`)}
                />
            ))}

            {/* Click plane for empty cells */}
            {gameState.boardLayout.map((rowArr, r) =>
                rowArr.map((_, c) => (
                    <mesh
                        key={`click-${r}-${c}`}
                        position={[(c - 3) * CELL_SIZE, 0.01, (r - 4) * CELL_SIZE]}
                        onClick={(e) => { e.stopPropagation(); handleCellClick(r, c); }}
                        visible={false}
                    >
                        <boxGeometry args={[CELL_SIZE * 0.95, 0.01, CELL_SIZE * 0.95]} />
                        <meshBasicMaterial transparent opacity={0} />
                    </mesh>
                ))
            )}

            {/* Contact shadows */}
            <ContactShadows
                position={[0, -0.02, 0]}
                opacity={0.5}
                scale={14}
                blur={2.5}
                far={4}
            />

            {/* Camera controls - Fake Isometric Angle */}
            <OrbitControls
                makeDefault
                maxPolarAngle={Math.PI / 2.5}
                minPolarAngle={Math.PI / 4}
                maxDistance={25}
                minDistance={8}
                enablePan={false}
                target={[0, 0, 0]}
                enableDamping
                dampingFactor={0.05}
            />

            {/* Post Processing - Disabled on Mobile for performance */}
            {!isMobile && (
                <EffectComposer>
                    <N8AO aoRadius={0.5} intensity={1.5} />
                    <Bloom luminanceThreshold={0.8} mipmapBlur intensity={0.4} />
                    <Vignette eskil={false} offset={0.1} darkness={0.4} />
                </EffectComposer>
            )}
        </>
    );
}

/**
 * Main 3D Game Scene component.
 */
export function GameScene() {
    const [inspectedPiece, setInspectedPiece] = useState<PieceData | null>(null);

    return (
        <div style={{ width: '100%', height: '100%', position: 'absolute', top: 0, left: 0 }}>
            <Canvas
                shadows
                camera={{
                    position: [0, 11, 9],
                    fov: 42,
                    near: 0.1,
                    far: 100,
                }}
                gl={{
                    antialias: true,
                    toneMapping: THREE.ACESFilmicToneMapping,
                    toneMappingExposure: 1.3,
                }}
                style={{ background: 'linear-gradient(to bottom, #020406 0%, #060a0e 40%, #040608 100%)' }}
                onCreated={() => SoundManager.init()}
            >
                <SceneContent onInspect={setInspectedPiece} />
            </Canvas>

            {/* Piece Inspector Modal */}
            {inspectedPiece && (
                <PieceInspector
                    piece={inspectedPiece}
                    onClose={() => setInspectedPiece(null)}
                />
            )}
        </div>
    );
}
