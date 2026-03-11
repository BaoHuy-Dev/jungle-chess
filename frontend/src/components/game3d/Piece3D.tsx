import { useRef, useState, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, Clone } from '@react-three/drei';
import * as THREE from 'three';
import type { PieceData } from '../../store/gameStore';

const CELL_SIZE = 1.1;

// ─── Animal-specific accent colors (warrior theme) ─────────────────
const ANIMAL_ACCENTS: Record<string, { color: string; emissive: string }> = {
    elephant: { color: '#8B7355', emissive: '#4a3a20' },  // Ancient bronze
    lion: { color: '#DAA520', emissive: '#8B6914' },   // Golden crown
    tiger: { color: '#FF6B35', emissive: '#CC3300' },   // Flame orange
    leopard: { color: '#9B59B6', emissive: '#6C3483' },   // Magical purple
    wolf: { color: '#7F8C8D', emissive: '#515A5A' },   // Steel grey
    dog: { color: '#2E86C1', emissive: '#1A5276' },   // Shield blue
    cat: { color: '#27AE60', emissive: '#1E8449' },   // Rogue green
    rat: { color: '#F39C12', emissive: '#B7770D' },   // Brave gold
};

// ─── Custom GLB Models ──────────────────────────────────────────────
function CustomModel({ url, scale = 0.5, yOffset = 0 }: { url: string; scale?: number; yOffset?: number }) {
    const gltf = useGLTF(url);

    return <Clone object={gltf.scene} scale={scale} position={[0, yOffset, 0]} castShadow receiveShadow />;
}

// Preload all models
useGLTF.preload('/models/mouse.glb');
useGLTF.preload('/models/cat.glb');
useGLTF.preload('/models/dog.glb');
useGLTF.preload('/models/wolf.glb');
useGLTF.preload('/models/leopard.glb');
useGLTF.preload('/models/tiger.glb');
useGLTF.preload('/models/lion.glb');
useGLTF.preload('/models/elephant.glb');

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

// ─── Dark Fantasy Warrior Materials ─────────────────────────────────
const MATERIALS = {
    // Stone chess base - ancient carved stone
    redBase: new THREE.MeshStandardMaterial({
        color: '#3d2b1f',
        metalness: 0.3,
        roughness: 0.7,
    }),
    blueBase: new THREE.MeshStandardMaterial({
        color: '#2b3d4f',
        metalness: 0.3,
        roughness: 0.7,
    }),
    // Stone top disc
    stoneTop: new THREE.MeshStandardMaterial({
        color: '#1a1a1a',
        metalness: 0.2,
        roughness: 0.85,
    }),
    // Warrior signet materials - battle-worn metal with glow
    redSignet: new THREE.MeshStandardMaterial({
        color: '#cc2222',
        emissive: '#ff0000',
        emissiveIntensity: 0.6,
        metalness: 0.85,
        roughness: 0.25,
    }),
    blueSignet: new THREE.MeshStandardMaterial({
        color: '#2266cc',
        emissive: '#0044ff',
        emissiveIntensity: 0.6,
        metalness: 0.85,
        roughness: 0.25,
    }),
    deadSignet: new THREE.MeshStandardMaterial({
        color: '#222222',
        emissive: '#000000',
        emissiveIntensity: 0,
        metalness: 0.3,
        roughness: 0.9,
    }),
    // Rune glow ring
    redRune: new THREE.MeshStandardMaterial({
        color: '#ff4444',
        emissive: '#ff2222',
        emissiveIntensity: 1.2,
        metalness: 0.9,
        roughness: 0.1,
        transparent: true,
        opacity: 0.9,
    }),
    blueRune: new THREE.MeshStandardMaterial({
        color: '#4488ff',
        emissive: '#2266ff',
        emissiveIntensity: 1.2,
        metalness: 0.9,
        roughness: 0.1,
        transparent: true,
        opacity: 0.9,
    }),
    // Armor plate material
    armor: new THREE.MeshStandardMaterial({
        color: '#444444',
        metalness: 0.9,
        roughness: 0.3,
    }),
};


// ─── Dark Fantasy Warrior Chess Piece ───────────────────────────────
export function Piece3D({
    piece,
    isActive,
    isMobile,
    onClick,
    onDoubleClick,
}: {
    piece: PieceData;
    isActive: boolean;
    isMobile?: boolean;
    onClick: () => void;
    onDoubleClick?: () => void;
}) {
    const groupRef = useRef<THREE.Group>(null);
    const runeRef = useRef<THREE.Mesh>(null);
    const targetRotRef = useRef<number>(piece.side === 'RED' ? 0 : Math.PI);
    const [hovered, setHovered] = useState(false);

    // Localize materials to prevent shared state flickering in useFrame
    const localMaterials = useMemo(() => {
        const sideMaterials = piece.side === 'RED'
            ? { base: MATERIALS.redBase, rune: MATERIALS.redRune, signet: MATERIALS.redSignet }
            : { base: MATERIALS.blueBase, rune: MATERIALS.blueRune, signet: MATERIALS.blueSignet };

        return {
            base: sideMaterials.base.clone(),
            rune: sideMaterials.rune.clone(),
            signet: sideMaterials.signet.clone(),
            stoneTop: MATERIALS.stoneTop.clone(),
        };
    }, [piece.side]);

    const targetX = (piece.col - 3) * CELL_SIZE;
    const targetZ = (piece.row - 4) * CELL_SIZE;

    const accent = ANIMAL_ACCENTS[piece.type] || { color: '#888', emissive: '#444' };
    const baseScale = 0.8 + (piece.rank / 8) * 0.4; // Larger pieces for higher rank

    useFrame((state, delta) => {
        if (!groupRef.current) return;
        const g = groupRef.current;
        const t = state.clock.elapsedTime;

        // Smooth movement
        g.position.x = THREE.MathUtils.lerp(g.position.x, targetX, delta * 10);
        g.position.z = THREE.MathUtils.lerp(g.position.z, targetZ, delta * 10);

        // Hover & Active float
        const targetY = isActive ? 0.35 : (hovered ? 0.18 : 0.0);
        g.position.y = THREE.MathUtils.lerp(g.position.y, targetY, delta * 8);

        // Directional Facing
        const dx = targetX - g.position.x;
        const dz = targetZ - g.position.z;
        const distSq = dx * dx + dz * dz;

        // If moving significantly, face the direction of movement
        if (distSq > 0.001) {
            targetRotRef.current = Math.atan2(dx, dz);
        } else if (!isActive && distSq < 0.0001) {
            // Revert to facing the opponent when stopping
            targetRotRef.current = piece.side === 'RED' ? 0 : Math.PI;
        }

        // Battle stance rotation
        if (isActive) {
            g.rotation.y += delta * 1.8;
        } else {
            // Smoothly interpolate rotation avoiding spinning the long way around
            let diff = targetRotRef.current - g.rotation.y;
            // Normalize angle difference to [-PI, PI]
            diff = Math.atan2(Math.sin(diff), Math.cos(diff));
            g.rotation.y += diff * delta * 15;
        }

        // Warrior breathing - subtle power pulse (Disabled on mobile)
        const breathe = isMobile ? 1 : (1 + Math.sin(t * 1.5 + piece.col * 0.7) * 0.015);
        g.scale.set(breathe * baseScale, breathe * baseScale, breathe * baseScale);

        // Animated rune glow
        if (runeRef.current) {
            const mat = runeRef.current.material as THREE.MeshStandardMaterial;
            mat.emissiveIntensity = 0.8 + Math.sin(t * 3 + piece.row) * 0.5;
            runeRef.current.rotation.z = t * 0.5;
        }
    });

    if (!piece.alive && !isActive) return null;

    const sideColor = piece.side === 'RED' ? '#ff3333' : '#3388ff';

    return (
        <group
            ref={groupRef}
            position={[targetX, 0.1, targetZ]}
            rotation={[0, piece.side === 'RED' ? 0 : Math.PI, 0]}
            onClick={(e) => {
                e.stopPropagation();
                if (piece.alive) onClick();
            }}
            onDoubleClick={(e) => {
                e.stopPropagation();
                if (onDoubleClick) onDoubleClick();
            }}
            onPointerOver={(e) => {
                e.stopPropagation();
                setHovered(true);
                document.body.style.cursor = 'pointer';
            }}
            onPointerOut={() => {
                setHovered(false);
                document.body.style.cursor = 'default';
            }}
        >
            {/* Stone Chess Base - carved ancient stone pedestal */}
            <mesh castShadow={!isMobile} receiveShadow={!isMobile} position={[0, 0.03, 0]}>
                <cylinderGeometry args={[0.32, 0.38, 0.06, isMobile ? 6 : 8]} />
                <primitive object={localMaterials.base} attach="material" />
            </mesh>
            {/* Second tier base - Skipped on mobile */}
            {!isMobile && (
                <mesh castShadow receiveShadow position={[0, 0.07, 0]}>
                    <cylinderGeometry args={[0.28, 0.32, 0.04, 8]} />
                    <meshStandardMaterial color="#2a2a2a" metalness={0.4} roughness={0.6} />
                </mesh>
            )}

            {/* Ancient engravings on base - decorative ring */}
            <mesh position={[0, 0.035, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.33, 0.37, isMobile ? 6 : 8]} />
                <meshStandardMaterial
                    color={accent.color}
                    emissive={accent.emissive}
                    emissiveIntensity={0.4}
                    metalness={0.8}
                    roughness={0.3}
                />
            </mesh>

            {/* Inner stone disc with dark surface - Increased Y gap for z-fighting */}
            <mesh receiveShadow={!isMobile} position={[0, isMobile ? 0.12 : 0.091, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[0.22, isMobile ? 16 : 32]} />
                <primitive object={localMaterials.stoneTop} attach="material" />
            </mesh>

            {/* Glowing Rune Ring - Increased Y gap for z-fighting */}
            <mesh ref={runeRef} position={[0, isMobile ? 0.13 : 0.092, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.22, 0.27, 6]} />
                <primitive object={localMaterials.rune} attach="material" />
            </mesh>

            {/* Armor collar ring around base of standee */}
            <mesh position={[0, 0.1, 0]} castShadow>
                <torusGeometry args={[0.18, 0.02, 6, 8]} />
                <meshStandardMaterial color="#3a3a3a" metalness={0.8} roughness={0.3} />
            </mesh>

            {/* Upright Custom 3D Model */}
            <CustomModel
                url={GLB_URLS[piece.type] || '/models/elephant.glb'}
                scale={0.95}
                yOffset={0.08}
            />

            {/* Active Selection - Glowing Battle Ring */}
            {isActive && (
                <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.45, 0.55, 32]} />
                    <meshBasicMaterial color={sideColor} transparent opacity={0.7} side={THREE.DoubleSide} />
                </mesh>
            )}

            {/* Hover glow ring */}
            {hovered && !isActive && (
                <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.38, 0.42, 32]} />
                    <meshBasicMaterial color={accent.color} transparent opacity={0.4} side={THREE.DoubleSide} />
                </mesh>
            )}
        </group>
    );
}
