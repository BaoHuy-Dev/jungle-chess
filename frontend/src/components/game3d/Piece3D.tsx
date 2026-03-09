import { useRef, useMemo, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
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
    const copiedScene = useMemo(() => {
        if (!gltf || !gltf.scene) return new THREE.Group();
        return gltf.scene.clone(true); // deep clone to preserve all materials & textures
    }, [gltf]);

    // Just enable shadows, keep original materials 100% intact
    useEffect(() => {
        if (!copiedScene) return;
        copiedScene.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });
    }, [copiedScene]);

    return <primitive object={copiedScene} scale={scale} position={[0, yOffset, 0]} />;
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

// ─── Per-Animal Weapon & Armor Meshes ───────────────────────────────
function AnimalWeapons({ type }: { type: string }) {
    const accent = ANIMAL_ACCENTS[type] || { color: '#888', emissive: '#444' };

    switch (type) {
        case 'elephant':
            return (
                <group>
                    {/* Heavy battle tusks with ancient engravings */}
                    <mesh position={[-0.18, 0.28, 0.08]} rotation={[0.3, 0, 0.35]} castShadow>
                        <coneGeometry args={[0.025, 0.22, 6]} />
                        <meshStandardMaterial color="#f5f0d0" metalness={0.4} roughness={0.35} />
                    </mesh>
                    <mesh position={[0.18, 0.28, 0.08]} rotation={[0.3, 0, -0.35]} castShadow>
                        <coneGeometry args={[0.025, 0.22, 6]} />
                        <meshStandardMaterial color="#f5f0d0" metalness={0.4} roughness={0.35} />
                    </mesh>
                    {/* Massive armored shoulder plates */}
                    <mesh position={[-0.15, 0.35, -0.02]} rotation={[0, 0, 0.4]} castShadow>
                        <boxGeometry args={[0.14, 0.06, 0.1]} />
                        <meshStandardMaterial color={accent.color} metalness={0.85} roughness={0.25}
                            emissive={accent.emissive} emissiveIntensity={0.3} />
                    </mesh>
                    <mesh position={[0.15, 0.35, -0.02]} rotation={[0, 0, -0.4]} castShadow>
                        <boxGeometry args={[0.14, 0.06, 0.1]} />
                        <meshStandardMaterial color={accent.color} metalness={0.85} roughness={0.25}
                            emissive={accent.emissive} emissiveIntensity={0.3} />
                    </mesh>
                    {/* Battle helm crest */}
                    <mesh position={[0, 0.48, -0.04]} castShadow>
                        <boxGeometry args={[0.04, 0.08, 0.16]} />
                        <meshStandardMaterial color="#5a4a3a" metalness={0.7} roughness={0.3} />
                    </mesh>
                </group>
            );
        case 'lion':
            return (
                <group>
                    {/* Golden crown with jewels */}
                    <mesh position={[0, 0.5, 0]} castShadow>
                        <cylinderGeometry args={[0.1, 0.12, 0.035, 6]} />
                        <meshStandardMaterial color="#DAA520" metalness={0.95} roughness={0.1}
                            emissive="#8B6914" emissiveIntensity={0.6} />
                    </mesh>
                    {[0, 1, 2, 3, 4].map(i => (
                        <mesh key={`crown-${i}`}
                            position={[Math.cos(i * Math.PI * 2 / 5) * 0.1, 0.55, Math.sin(i * Math.PI * 2 / 5) * 0.1]}
                            castShadow>
                            <coneGeometry args={[0.018, 0.06, 4]} />
                            <meshStandardMaterial color="#ffd700" metalness={0.95} roughness={0.08}
                                emissive="#ffd700" emissiveIntensity={0.5} />
                        </mesh>
                    ))}
                    {/* Massive greatsword */}
                    <mesh position={[0.22, 0.3, 0]} rotation={[0, 0, 0.15]} castShadow>
                        <boxGeometry args={[0.028, 0.42, 0.008]} />
                        <meshStandardMaterial color="#d0d0d0" metalness={0.95} roughness={0.12} />
                    </mesh>
                    {/* Sword crossguard */}
                    <mesh position={[0.21, 0.12, 0]} rotation={[0, 0, 0.15]} castShadow>
                        <boxGeometry args={[0.1, 0.018, 0.018]} />
                        <meshStandardMaterial color="#DAA520" metalness={0.9} roughness={0.15}
                            emissive="#8B6914" emissiveIntensity={0.3} />
                    </mesh>
                    {/* Heavy armor chestplate */}
                    <mesh position={[0, 0.3, 0.04]} castShadow>
                        <boxGeometry args={[0.18, 0.14, 0.04]} />
                        <meshStandardMaterial color="#DAA520" metalness={0.85} roughness={0.2}
                            emissive="#8B6914" emissiveIntensity={0.2} />
                    </mesh>
                </group>
            );
        case 'tiger':
            return (
                <group>
                    {/* Flaming dual blades */}
                    <mesh position={[-0.18, 0.3, 0.03]} rotation={[0.1, 0, 0.25]} castShadow>
                        <boxGeometry args={[0.02, 0.32, 0.005]} />
                        <meshStandardMaterial color="#ff6633" metalness={0.8} roughness={0.15}
                            emissive="#ff3300" emissiveIntensity={0.8} />
                    </mesh>
                    <mesh position={[0.18, 0.3, 0.03]} rotation={[0.1, 0, -0.25]} castShadow>
                        <boxGeometry args={[0.02, 0.32, 0.005]} />
                        <meshStandardMaterial color="#ff6633" metalness={0.8} roughness={0.15}
                            emissive="#ff3300" emissiveIntensity={0.8} />
                    </mesh>
                    {/* Flame glow on blades */}
                    <mesh position={[-0.18, 0.38, 0.03]}>
                        <sphereGeometry args={[0.04, 8, 8]} />
                        <meshBasicMaterial color="#ff4400" transparent opacity={0.4} />
                    </mesh>
                    <mesh position={[0.18, 0.38, 0.03]}>
                        <sphereGeometry args={[0.04, 8, 8]} />
                        <meshBasicMaterial color="#ff4400" transparent opacity={0.4} />
                    </mesh>
                    {/* Glowing rune armor */}
                    <mesh position={[0, 0.28, 0.04]} castShadow>
                        <boxGeometry args={[0.16, 0.1, 0.03]} />
                        <meshStandardMaterial color="#444" metalness={0.9} roughness={0.2}
                            emissive={accent.emissive} emissiveIntensity={0.4} />
                    </mesh>
                </group>
            );
        case 'leopard':
            return (
                <group>
                    {/* Dual magical daggers */}
                    <mesh position={[-0.15, 0.25, 0.06]} rotation={[0.3, 0, 0.5]} castShadow>
                        <coneGeometry args={[0.012, 0.18, 4]} />
                        <meshStandardMaterial color="#bb88ff" metalness={0.85} roughness={0.15}
                            emissive="#9944ff" emissiveIntensity={0.7} />
                    </mesh>
                    <mesh position={[0.15, 0.25, 0.06]} rotation={[0.3, 0, -0.5]} castShadow>
                        <coneGeometry args={[0.012, 0.18, 4]} />
                        <meshStandardMaterial color="#bb88ff" metalness={0.85} roughness={0.15}
                            emissive="#9944ff" emissiveIntensity={0.7} />
                    </mesh>
                    {/* Dagger energy glow */}
                    <pointLight position={[-0.15, 0.3, 0.06]} intensity={0.3} color="#9944ff" distance={0.5} />
                    <pointLight position={[0.15, 0.3, 0.06]} intensity={0.3} color="#9944ff" distance={0.5} />
                    {/* Light stealth armor */}
                    <mesh position={[0, 0.26, 0.02]} castShadow>
                        <boxGeometry args={[0.12, 0.08, 0.025]} />
                        <meshStandardMaterial color="#2a2040" metalness={0.7} roughness={0.3}
                            emissive="#6C3483" emissiveIntensity={0.3} />
                    </mesh>
                </group>
            );
        case 'wolf':
            return (
                <group>
                    {/* Large battle axe handle */}
                    <mesh position={[0.2, 0.28, 0]} rotation={[0, 0, 0.2]} castShadow>
                        <cylinderGeometry args={[0.012, 0.012, 0.38, 6]} />
                        <meshStandardMaterial color="#5C3A1E" roughness={0.8} metalness={0.2} />
                    </mesh>
                    {/* Axe blade */}
                    <mesh position={[0.24, 0.44, 0]} rotation={[0, 0, 0.2]} castShadow>
                        <boxGeometry args={[0.12, 0.08, 0.01]} />
                        <meshStandardMaterial color="#888" metalness={0.95} roughness={0.15}
                            emissive="#515A5A" emissiveIntensity={0.2} />
                    </mesh>
                    {/* Spiked shoulder armor */}
                    <mesh position={[-0.14, 0.35, 0]} rotation={[0, 0, 0.3]} castShadow>
                        <coneGeometry args={[0.04, 0.08, 4]} />
                        <meshStandardMaterial color="#666" metalness={0.9} roughness={0.2} />
                    </mesh>
                    <mesh position={[0.06, 0.38, -0.04]} castShadow>
                        <coneGeometry args={[0.03, 0.06, 4]} />
                        <meshStandardMaterial color="#666" metalness={0.9} roughness={0.2} />
                    </mesh>
                </group>
            );
        case 'dog':
            return (
                <group>
                    {/* Spear */}
                    <mesh position={[0.18, 0.3, 0]} rotation={[0, 0, 0.12]} castShadow>
                        <cylinderGeometry args={[0.01, 0.01, 0.4, 6]} />
                        <meshStandardMaterial color="#5C3A1E" roughness={0.8} metalness={0.2} />
                    </mesh>
                    {/* Spear tip */}
                    <mesh position={[0.2, 0.52, 0]} rotation={[0, 0, 0.12]} castShadow>
                        <coneGeometry args={[0.02, 0.06, 4]} />
                        <meshStandardMaterial color="#ccc" metalness={0.95} roughness={0.12} />
                    </mesh>
                    {/* Shield */}
                    <mesh position={[-0.16, 0.28, 0.06]} rotation={[0, 0.3, 0]} castShadow>
                        <cylinderGeometry args={[0.1, 0.1, 0.015, 8]} />
                        <meshStandardMaterial color={accent.color} metalness={0.7} roughness={0.3}
                            emissive={accent.emissive} emissiveIntensity={0.3} />
                    </mesh>
                    {/* Shield boss */}
                    <mesh position={[-0.16, 0.28, 0.07]} rotation={[0, 0.3, 0]}>
                        <sphereGeometry args={[0.03, 8, 8]} />
                        <meshStandardMaterial color="#ddd" metalness={0.9} roughness={0.15} />
                    </mesh>
                    {/* Protective armor */}
                    <mesh position={[0, 0.28, 0.02]} castShadow>
                        <boxGeometry args={[0.14, 0.1, 0.025]} />
                        <meshStandardMaterial color="#3a5577" metalness={0.7} roughness={0.3} />
                    </mesh>
                </group>
            );
        case 'cat':
            return (
                <group>
                    {/* Hood */}
                    <mesh position={[0, 0.48, -0.03]} castShadow>
                        <sphereGeometry args={[0.08, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
                        <meshStandardMaterial color="#2a3a2a" roughness={0.8} metalness={0.2} />
                    </mesh>
                    {/* Curved daggers with magical glow */}
                    <mesh position={[-0.14, 0.24, 0.06]} rotation={[0.4, 0.2, 0.6]} castShadow>
                        <coneGeometry args={[0.01, 0.15, 4]} />
                        <meshStandardMaterial color="#55ff77" metalness={0.8} roughness={0.15}
                            emissive="#22aa44" emissiveIntensity={0.6} />
                    </mesh>
                    <mesh position={[0.14, 0.24, 0.06]} rotation={[0.4, -0.2, -0.6]} castShadow>
                        <coneGeometry args={[0.01, 0.15, 4]} />
                        <meshStandardMaterial color="#55ff77" metalness={0.8} roughness={0.15}
                            emissive="#22aa44" emissiveIntensity={0.6} />
                    </mesh>
                    {/* Light armor with stealth pattern */}
                    <mesh position={[0, 0.26, 0.02]} castShadow>
                        <boxGeometry args={[0.1, 0.07, 0.02]} />
                        <meshStandardMaterial color="#1a2a1a" metalness={0.5} roughness={0.4}
                            emissive="#1E8449" emissiveIntensity={0.2} />
                    </mesh>
                </group>
            );
        case 'rat':
            return (
                <group>
                    {/* Short sword */}
                    <mesh position={[0.12, 0.22, 0.03]} rotation={[0.1, 0, -0.2]} castShadow>
                        <boxGeometry args={[0.015, 0.16, 0.004]} />
                        <meshStandardMaterial color="#ccc" metalness={0.9} roughness={0.15} />
                    </mesh>
                    {/* Sword handle */}
                    <mesh position={[0.11, 0.14, 0.03]} rotation={[0.1, 0, -0.2]} castShadow>
                        <boxGeometry args={[0.05, 0.012, 0.012]} />
                        <meshStandardMaterial color="#F39C12" metalness={0.8} roughness={0.25}
                            emissive="#B7770D" emissiveIntensity={0.3} />
                    </mesh>
                    {/* Tiny shield */}
                    <mesh position={[-0.1, 0.2, 0.05]} rotation={[0, 0.3, 0]} castShadow>
                        <cylinderGeometry args={[0.06, 0.06, 0.01, 6]} />
                        <meshStandardMaterial color={accent.color} metalness={0.7} roughness={0.3}
                            emissive={accent.emissive} emissiveIntensity={0.3} />
                    </mesh>
                    {/* Tiny armor */}
                    <mesh position={[0, 0.19, 0.02]} castShadow>
                        <boxGeometry args={[0.08, 0.05, 0.018]} />
                        <meshStandardMaterial color="#887755" metalness={0.6} roughness={0.35} />
                    </mesh>
                </group>
            );
        default:
            return null;
    }
}

// ─── Dark Fantasy Warrior Chess Piece ───────────────────────────────
export function Piece3D({
    piece,
    isActive,
    onClick,
    onDoubleClick,
}: {
    piece: PieceData;
    isActive: boolean;
    onClick: () => void;
    onDoubleClick?: () => void;
}) {
    const groupRef = useRef<THREE.Group>(null);
    const runeRef = useRef<THREE.Mesh>(null);
    const auraRef = useRef<THREE.Mesh>(null);
    const [hovered, setHovered] = useState(false);

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

        // Battle stance rotation
        if (isActive) {
            g.rotation.y += delta * 1.8;
        } else {
            g.rotation.y = THREE.MathUtils.lerp(g.rotation.y, piece.side === 'RED' ? Math.PI : 0, delta * 10);
        }

        // Warrior breathing - subtle power pulse
        const breathe = 1 + Math.sin(t * 1.5 + piece.col * 0.7) * 0.015;
        g.scale.set(breathe * baseScale, breathe * baseScale, breathe * baseScale);

        // Animated rune glow
        if (runeRef.current) {
            const mat = runeRef.current.material as THREE.MeshStandardMaterial;
            mat.emissiveIntensity = 0.8 + Math.sin(t * 3 + piece.row) * 0.5;
            runeRef.current.rotation.z = t * 0.5;
        }

        // Aura pulse
        if (auraRef.current) {
            const pulse = 0.3 + Math.sin(t * 2) * 0.15;
            (auraRef.current.material as THREE.MeshBasicMaterial).opacity = pulse;
            auraRef.current.scale.setScalar(1 + Math.sin(t * 1.5) * 0.05);
        }
    });

    if (!piece.alive && !isActive) return null;

    const baseMaterial = piece.side === 'RED' ? MATERIALS.redBase : MATERIALS.blueBase;
    const runeMaterial = piece.side === 'RED' ? MATERIALS.redRune : MATERIALS.blueRune;
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
            <mesh castShadow receiveShadow position={[0, 0.03, 0]}>
                <cylinderGeometry args={[0.32, 0.38, 0.06, 8]} />
                <primitive object={baseMaterial} attach="material" />
            </mesh>
            {/* Second tier base */}
            <mesh castShadow receiveShadow position={[0, 0.07, 0]}>
                <cylinderGeometry args={[0.28, 0.32, 0.04, 8]} />
                <meshStandardMaterial color="#2a2a2a" metalness={0.4} roughness={0.6} />
            </mesh>

            {/* Ancient engravings on base - decorative ring */}
            <mesh position={[0, 0.035, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.33, 0.37, 8]} />
                <meshStandardMaterial
                    color={accent.color}
                    emissive={accent.emissive}
                    emissiveIntensity={0.4}
                    metalness={0.8}
                    roughness={0.3}
                />
            </mesh>

            {/* Inner stone disc with dark surface */}
            <mesh receiveShadow position={[0, 0.091, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <circleGeometry args={[0.22, 32]} />
                <primitive object={MATERIALS.stoneTop} attach="material" />
            </mesh>

            {/* Glowing Rune Ring - animated magical engravings */}
            <mesh ref={runeRef} position={[0, 0.092, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.22, 0.27, 6]} />
                <primitive object={runeMaterial} attach="material" />
            </mesh>

            {/* Armor collar ring around base of standee */}
            <mesh position={[0, 0.1, 0]} castShadow>
                <torusGeometry args={[0.18, 0.02, 6, 8]} />
                <meshStandardMaterial color="#3a3a3a" metalness={0.8} roughness={0.3} />
            </mesh>

            {/* Upright Custom 3D Model */}
            <CustomModel
                url={GLB_URLS[piece.type] || '/models/elephant.glb'}
                scale={piece.type === 'elephant' ? 0.4 : 0.4}
                yOffset={0.08}
            />

            {/* Per-Animal Weapon & Armor Equipment */}
            {piece.alive && <AnimalWeapons type={piece.type} />}

            {/* Warrior Aura - subtle power emanation */}
            {piece.alive && (
                <mesh ref={auraRef} position={[0, 0.25, 0]}>
                    <sphereGeometry args={[0.4, 16, 16]} />
                    <meshBasicMaterial
                        color={sideColor}
                        transparent
                        opacity={0.15}
                        side={THREE.BackSide}
                        depthWrite={false}
                    />
                </mesh>
            )}

            {/* Active Selection - Glowing Battle Ring */}
            {isActive && (
                <>
                    <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                        <ringGeometry args={[0.45, 0.55, 32]} />
                        <meshBasicMaterial color={sideColor} transparent opacity={0.7} side={THREE.DoubleSide} />
                    </mesh>
                    {/* Upward energy pillar */}
                    <mesh position={[0, 0.5, 0]}>
                        <cylinderGeometry args={[0.02, 0.15, 0.8, 8]} />
                        <meshBasicMaterial color={sideColor} transparent opacity={0.25} />
                    </mesh>
                </>
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
