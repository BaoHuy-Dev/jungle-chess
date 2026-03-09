import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment, useGLTF, Center } from '@react-three/drei';

import type { PieceData } from '../../store/gameStore';
import { useLanguage, type TranslationKey } from '../../i18n';
import './PieceInspector.css';

const GLB_URLS: Record<string, string> = {
    rat: '/models/mouse.glb',
    cat: '/models/cat.glb',
    dog: '/models/dog.glb',
    wolf: '/models/wolf.glb',
    leopard: '/models/leopard.glb',
    tiger: '/models/tiger.glb',
    lion: '/models/lion.glb',
    elephant: '/models/elephant.glb',
};

const RANK_STARS: Record<number, string> = {
    1: '⭐', 2: '⭐⭐', 3: '⭐⭐⭐', 4: '⭐⭐⭐⭐',
    5: '⭐⭐⭐⭐⭐', 6: '⭐⭐⭐⭐⭐⭐', 7: '⭐⭐⭐⭐⭐⭐⭐', 8: '⭐⭐⭐⭐⭐⭐⭐⭐',
};

// ─── GLB Model ──────────────────────────────────────────────────────
function AnimalModel({ type }: { type: string }) {
    const url = GLB_URLS[type] || '/models/elephant.glb';
    const gltf = useGLTF(url);

    return (
        <Center>
            <primitive object={gltf.scene.clone(true)} scale={type === 'elephant' ? 2.0 : 2.0} rotation={[0, Math.PI, 0]} />
        </Center>
    );
}

// ─── Inspector 3D Viewport ──────────────────────────────────────────
function InspectorScene({ piece }: { piece: PieceData }) {
    return (
        <>
            <ambientLight intensity={0.6} />
            <directionalLight position={[5, 8, 5]} intensity={1.5} castShadow />
            <pointLight position={[-3, 5, -3]} intensity={0.5} color="#ffebc2" />
            <Environment preset="city" blur={0.6} />

            <AnimalModel type={piece.type} />

            <OrbitControls
                enablePan={false}
                autoRotate
                autoRotateSpeed={2}
                target={[0, 0, 0]}
                minDistance={2}
                maxDistance={8}
            />
        </>
    );
}

// ─── Main Inspector Modal ───────────────────────────────────────────
export function PieceInspector({
    piece,
    onClose,
}: {
    piece: PieceData;
    onClose: () => void;
}) {
    const { t } = useLanguage();
    const name = t(`animal.${piece.type}` as TranslationKey) || piece.type;
    const description = t(`desc.${piece.type}` as TranslationKey) || '';
    const stars = RANK_STARS[piece.rank] || '';
    const sideLabel = piece.side === 'RED' ? t('inspector.sideRed') : t('inspector.sideBlue');
    const sideClass = piece.side === 'RED' ? 'inspector-red' : 'inspector-blue';

    return (
        <div className="piece-inspector-overlay" onClick={onClose}>
            <div className={`piece-inspector-modal ${sideClass}`} onClick={(e) => e.stopPropagation()}>
                {/* Close Button */}
                <button className="inspector-close" onClick={onClose}>✕</button>

                {/* 3D Viewport */}
                <div className="inspector-viewport">
                    <Canvas
                        camera={{ position: [0, 0, 5], fov: 45 }}
                        shadows
                        gl={{ antialias: true, alpha: true }}
                    >
                        <InspectorScene piece={piece} />
                    </Canvas>
                    <div className="inspector-hint">{t('inspector.drag')}</div>
                </div>

                {/* Info Panel */}
                <div className="inspector-info">
                    <div className="inspector-side-badge">{sideLabel}</div>
                    <h2 className="inspector-name">{name}</h2>
                    <div className="inspector-rank">
                        <span className="inspector-rank-label">{t('inspector.power')}</span>
                        <span className="inspector-stars">{stars}</span>
                        <span className="inspector-rank-num">({piece.rank}/8)</span>
                    </div>
                    <p className="inspector-description">{description}</p>
                    <div className="inspector-status">
                        <span className={`status-dot ${piece.alive ? 'alive' : 'dead'}`} />
                        {piece.alive ? t('inspector.alive') : t('inspector.dead')}
                    </div>
                </div>
            </div>
        </div>
    );
}
