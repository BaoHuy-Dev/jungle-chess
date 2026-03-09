import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const CELL_SIZE = 1.1;

// ─── Ambient Fireflies ────────────────────────────────────────────
export function AmbientFireflies({ count = 60 }: { count?: number }) {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    const particles = useMemo(() => {
        return Array.from({ length: count }, () => ({
            x: (Math.random() - 0.5) * 12,
            y: Math.random() * 4 + 0.5,
            z: (Math.random() - 0.5) * 14,
            speed: 0.3 + Math.random() * 0.7,
            offset: Math.random() * Math.PI * 2,
            radius: 0.5 + Math.random() * 2,
            brightness: 0.5 + Math.random() * 0.5,
        }));
    }, [count]);

    const colorArray = useMemo(() => {
        const colors = new Float32Array(count * 3);
        const color = new THREE.Color();
        for (let i = 0; i < count; i++) {
            const hue = 0.1 + Math.random() * 0.05; // golden tones
            color.setHSL(hue, 0.8, 0.6 + Math.random() * 0.3);
            colors[i * 3] = color.r;
            colors[i * 3 + 1] = color.g;
            colors[i * 3 + 2] = color.b;
        }
        return colors;
    }, [count]);

    useFrame((state) => {
        if (!meshRef.current) return;
        const t = state.clock.elapsedTime;

        particles.forEach((p, i) => {
            const phase = t * p.speed + p.offset;
            dummy.position.set(
                p.x + Math.sin(phase) * p.radius,
                p.y + Math.sin(phase * 1.3) * 0.5,
                p.z + Math.cos(phase * 0.7) * p.radius
            );
            const flicker = 0.02 + Math.sin(phase * 5) * 0.01;
            dummy.scale.setScalar(flicker * p.brightness);
            dummy.updateMatrix();
            meshRef.current!.setMatrixAt(i, dummy.matrix);
        });
        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
            <sphereGeometry args={[1, 6, 6]}>
                <instancedBufferAttribute
                    attach="attributes-color"
                    args={[colorArray, 3]}
                />
            </sphereGeometry>
            <meshStandardMaterial
                emissive="#ffd700"
                emissiveIntensity={4}
                transparent
                opacity={0.9}
                toneMapped={false}
            />
        </instancedMesh>
    );
}

// ─── Den Glow Effect ──────────────────────────────────────────────
export function DenGlow({ row, col, color }: { row: number; col: number; color: string; side: 'RED' | 'BLUE' }) {
    const glowRef = useRef<THREE.Mesh>(null);
    const pillarRefs = useRef<THREE.Group>(null);

    const x = (col - 3) * CELL_SIZE;
    const z = (row - 4) * CELL_SIZE;

    useFrame((state) => {
        const t = state.clock.elapsedTime;
        if (glowRef.current) {
            (glowRef.current.material as THREE.MeshStandardMaterial).emissiveIntensity =
                0.8 + Math.sin(t * 2) * 0.4;
            glowRef.current.scale.setScalar(1 + Math.sin(t * 1.5) * 0.05);
        }
        if (pillarRefs.current) {
            pillarRefs.current.rotation.y = t * 0.3;
        }
    });

    return (
        <group position={[x, 0, z]}>
            {/* Volumetric glow */}
            <mesh ref={glowRef} position={[0, 0.3, 0]}>
                <sphereGeometry args={[0.35, 16, 16]} />
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={1}
                    transparent
                    opacity={0.15}
                    toneMapped={false}
                />
            </mesh>

            {/* Rotating light pillars */}
            <group ref={pillarRefs}>
                {[0, 1, 2, 3].map((i) => {
                    const angle = (i / 4) * Math.PI * 2;
                    return (
                        <mesh
                            key={`pillar-${i}`}
                            position={[Math.cos(angle) * 0.4, 0.25, Math.sin(angle) * 0.4]}
                            castShadow
                        >
                            <cylinderGeometry args={[0.025, 0.035, 0.5, 8]} />
                            <meshStandardMaterial
                                color={color}
                                emissive={color}
                                emissiveIntensity={0.7}
                                metalness={0.7}
                                roughness={0.2}
                            />
                        </mesh>
                    );
                })}
            </group>

            {/* Ground rune circle */}
            <mesh position={[0, 0.1, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <ringGeometry args={[0.3, 0.45, 6]} />
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={0.6}
                    transparent
                    opacity={0.3}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Flag/banner for the den */}
            <mesh position={[0.45, 0.45, 0]} castShadow>
                <cylinderGeometry args={[0.015, 0.015, 0.9, 6]} />
                <meshStandardMaterial color="#3d2b1f" metalness={0.5} roughness={0.3} />
            </mesh>
            <mesh position={[0.52, 0.72, 0]}>
                <planeGeometry args={[0.18, 0.12]} />
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={0.4}
                    side={THREE.DoubleSide}
                />
            </mesh>
        </group>
    );
}

// ─── Trap Visual ──────────────────────────────────────────────────
export function TrapEffect({ row, col, color }: { row: number; col: number; color: string }) {
    const spikeRef = useRef<THREE.Group>(null);

    const x = (col - 3) * CELL_SIZE;
    const z = (row - 4) * CELL_SIZE;

    useFrame((state) => {
        if (!spikeRef.current) return;
        const t = state.clock.elapsedTime;
        spikeRef.current.rotation.y = t * 0.8;
        spikeRef.current.children.forEach((child, i) => {
            child.scale.y = 0.8 + Math.sin(t * 3 + i) * 0.2;
        });
    });

    return (
        <group position={[x, 0.08, z]}>
            {/* Warning ring */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
                <ringGeometry args={[0.32, 0.38, 16]} />
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={0.4}
                    transparent
                    opacity={0.35}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Animated spikes */}
            <group ref={spikeRef}>
                {[0, 1, 2, 3, 4, 5].map((i) => {
                    const angle = (i / 6) * Math.PI * 2;
                    return (
                        <mesh
                            key={`spike-${i}`}
                            position={[Math.cos(angle) * 0.28, 0.08, Math.sin(angle) * 0.28]}
                        >
                            <coneGeometry args={[0.025, 0.12, 4]} />
                            <meshStandardMaterial
                                color={color}
                                emissive={color}
                                emissiveIntensity={0.3}
                                metalness={0.6}
                                roughness={0.3}
                            />
                        </mesh>
                    );
                })}
            </group>
        </group>
    );
}

// ─── Board Edge Decoration ────────────────────────────────────────
export function BoardDecorations() {
    const BOARD_WIDTH = 7 * CELL_SIZE;
    const BOARD_HEIGHT = 9 * CELL_SIZE;

    // Trees and rocks around the board
    const decorations = useMemo(() => {
        const result: { type: 'tree' | 'rock'; x: number; z: number; scale: number; rotation: number }[] = [];
        const margin = 0.8;

        // Trees along sides
        for (let i = 0; i < 6; i++) {
            const t = (i / 5) * BOARD_HEIGHT - BOARD_HEIGHT / 2;
            result.push({ type: 'tree', x: -BOARD_WIDTH / 2 - margin, z: t, scale: 0.5 + Math.random() * 0.3, rotation: Math.random() * Math.PI });
            result.push({ type: 'tree', x: BOARD_WIDTH / 2 + margin, z: t, scale: 0.5 + Math.random() * 0.3, rotation: Math.random() * Math.PI });
        }

        // Rocks at corners
        result.push({ type: 'rock', x: -BOARD_WIDTH / 2 - 0.6, z: -BOARD_HEIGHT / 2 - 0.5, scale: 0.4, rotation: 0.5 });
        result.push({ type: 'rock', x: BOARD_WIDTH / 2 + 0.6, z: -BOARD_HEIGHT / 2 - 0.5, scale: 0.35, rotation: 1.2 });
        result.push({ type: 'rock', x: -BOARD_WIDTH / 2 - 0.6, z: BOARD_HEIGHT / 2 + 0.5, scale: 0.38, rotation: 2.1 });
        result.push({ type: 'rock', x: BOARD_WIDTH / 2 + 0.6, z: BOARD_HEIGHT / 2 + 0.5, scale: 0.32, rotation: 3.0 });

        return result;
    }, []);

    return (
        <group>
            {decorations.map((d, i) => d.type === 'tree' ? (
                <group key={`deco-${i}`} position={[d.x, 0, d.z]} rotation={[0, d.rotation, 0]} scale={d.scale}>
                    {/* Trunk */}
                    <mesh position={[0, 0.3, 0]} castShadow>
                        <cylinderGeometry args={[0.06, 0.08, 0.6, 6]} />
                        <meshStandardMaterial color="#5C3A1E" roughness={0.9} />
                    </mesh>
                    {/* Canopy layers */}
                    <mesh position={[0, 0.7, 0]} castShadow>
                        <coneGeometry args={[0.3, 0.5, 6]} />
                        <meshStandardMaterial color="#1a5c1a" roughness={0.85} />
                    </mesh>
                    <mesh position={[0, 0.95, 0]} castShadow>
                        <coneGeometry args={[0.22, 0.4, 6]} />
                        <meshStandardMaterial color="#228B22" roughness={0.8} />
                    </mesh>
                    <mesh position={[0, 1.15, 0]} castShadow>
                        <coneGeometry args={[0.15, 0.3, 6]} />
                        <meshStandardMaterial color="#2E8B2E" roughness={0.75} />
                    </mesh>
                </group>
            ) : (
                <group key={`deco-${i}`} position={[d.x, 0.08, d.z]} rotation={[0, d.rotation, 0]} scale={d.scale}>
                    <mesh castShadow>
                        <dodecahedronGeometry args={[0.25, 0]} />
                        <meshStandardMaterial color="#555" roughness={0.95} metalness={0.05} />
                    </mesh>
                    <mesh position={[0.15, -0.05, 0.1]} castShadow>
                        <dodecahedronGeometry args={[0.15, 0]} />
                        <meshStandardMaterial color="#666" roughness={0.9} />
                    </mesh>
                </group>
            ))}
        </group>
    );
}

// ─── Grass Tufts ──────────────────────────────────────────────────
export function GrassTufts({ boardLayout }: { boardLayout: number[][] }) {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    const grassPositions = useMemo(() => {
        if (!boardLayout) return [];
        const positions: { x: number; z: number; scale: number; rotation: number }[] = [];

        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 7; c++) {
                if (boardLayout[r][c] === 0) { // Only on normal ground
                    // 2-4 grass tufts per cell
                    const count = 2 + Math.floor(Math.random() * 3);
                    for (let i = 0; i < count; i++) {
                        positions.push({
                            x: (c - 3) * CELL_SIZE + (Math.random() - 0.5) * 0.8,
                            z: (r - 4) * CELL_SIZE + (Math.random() - 0.5) * 0.8,
                            scale: 0.02 + Math.random() * 0.03,
                            rotation: Math.random() * Math.PI,
                        });
                    }
                }
            }
        }
        return positions;
    }, [boardLayout]);

    const count = grassPositions.length;

    useFrame((state) => {
        if (!meshRef.current || count === 0) return;
        const t = state.clock.elapsedTime;

        grassPositions.forEach((p, i) => {
            dummy.position.set(p.x, 0.12 + p.scale * 2, p.z);
            dummy.rotation.set(0, p.rotation, Math.sin(t * 2 + i * 0.5) * 0.15);
            dummy.scale.set(p.scale, p.scale * 3, p.scale);
            dummy.updateMatrix();
            meshRef.current!.setMatrixAt(i, dummy.matrix);
        });
        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    if (count === 0) return null;

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
            <coneGeometry args={[1, 3, 3]} />
            <meshStandardMaterial color="#3a8a28" roughness={0.9} />
        </instancedMesh>
    );
}

// ─── Jungle Mist / Fog ───────────────────────────────────────────
export function JungleMist({ count = 30 }: { count?: number }) {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    const particles = useMemo(() => {
        return Array.from({ length: count }, () => ({
            x: (Math.random() - 0.5) * 14,
            y: 0.1 + Math.random() * 0.6,
            z: (Math.random() - 0.5) * 16,
            speed: 0.1 + Math.random() * 0.2,
            offset: Math.random() * Math.PI * 2,
            scaleBase: 0.3 + Math.random() * 0.6,
        }));
    }, [count]);

    useFrame((state) => {
        if (!meshRef.current) return;
        const t = state.clock.elapsedTime;

        particles.forEach((p, i) => {
            const phase = t * p.speed + p.offset;
            dummy.position.set(
                p.x + Math.sin(phase * 0.3) * 1.5,
                p.y + Math.sin(phase * 0.5) * 0.1,
                p.z + Math.cos(phase * 0.2) * 1.0
            );
            const breathe = p.scaleBase + Math.sin(phase) * 0.1;
            dummy.scale.set(breathe, breathe * 0.3, breathe);
            dummy.rotation.y = phase * 0.1;
            dummy.updateMatrix();
            meshRef.current!.setMatrixAt(i, dummy.matrix);
        });
        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
            <sphereGeometry args={[1, 6, 4]} />
            <meshBasicMaterial color="#1a2a20" transparent opacity={0.06} depthWrite={false} />
        </instancedMesh>
    );
}

// ─── Jungle Spores (glowing floating particles) ──────────────────
export function JungleSpores({ count = 20 }: { count?: number }) {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    const particles = useMemo(() => {
        return Array.from({ length: count }, () => ({
            x: (Math.random() - 0.5) * 10,
            y: 0.5 + Math.random() * 2,
            z: (Math.random() - 0.5) * 12,
            speed: 0.2 + Math.random() * 0.4,
            offset: Math.random() * Math.PI * 2,
            radius: 0.3 + Math.random() * 1,
        }));
    }, [count]);

    useFrame((state) => {
        if (!meshRef.current) return;
        const t = state.clock.elapsedTime;

        particles.forEach((p, i) => {
            const phase = t * p.speed + p.offset;
            dummy.position.set(
                p.x + Math.sin(phase * 0.7) * p.radius,
                p.y + Math.sin(phase * 1.2) * 0.3,
                p.z + Math.cos(phase * 0.5) * p.radius
            );
            const flicker = 0.015 + Math.sin(phase * 4) * 0.008;
            dummy.scale.setScalar(flicker);
            dummy.updateMatrix();
            meshRef.current!.setMatrixAt(i, dummy.matrix);
        });
        meshRef.current.instanceMatrix.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, count]}>
            <sphereGeometry args={[1, 6, 6]} />
            <meshStandardMaterial
                emissive="#44ff88"
                emissiveIntensity={3}
                transparent
                opacity={0.7}
                toneMapped={false}
            />
        </instancedMesh>
    );
}
