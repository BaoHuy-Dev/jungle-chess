import { useMemo, useRef, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ─── Jungle vine decoration along board edges ───────────────────────
function BoardVines() {
    const BOARD_W = 7 * 1.1;
    const BOARD_H = 9 * 1.1;
    const vineRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (!vineRef.current) return;
        const t = state.clock.elapsedTime;
        vineRef.current.children.forEach((child, i) => {
            child.rotation.z = Math.sin(t * 0.5 + i * 0.8) * 0.05;
        });
    });

    const vines = useMemo(() => {
        const v: { x: number; z: number; rotY: number; scale: number; len: number }[] = [];
        // Vines along left and right edges
        for (let i = 0; i < 8; i++) {
            const tz = (i / 7) * BOARD_H - BOARD_H / 2;
            v.push({ x: -BOARD_W / 2 - 0.2, z: tz, rotY: 0, scale: 0.7 + Math.random() * 0.4, len: 0.3 + Math.random() * 0.4 });
            v.push({ x: BOARD_W / 2 + 0.2, z: tz, rotY: Math.PI, scale: 0.7 + Math.random() * 0.4, len: 0.3 + Math.random() * 0.4 });
        }
        // Vines along top and bottom
        for (let i = 0; i < 5; i++) {
            const tx = (i / 4) * BOARD_W - BOARD_W / 2;
            v.push({ x: tx, z: -BOARD_H / 2 - 0.2, rotY: Math.PI / 2, scale: 0.6 + Math.random() * 0.3, len: 0.25 + Math.random() * 0.3 });
            v.push({ x: tx, z: BOARD_H / 2 + 0.2, rotY: -Math.PI / 2, scale: 0.6 + Math.random() * 0.3, len: 0.25 + Math.random() * 0.3 });
        }
        return v;
    }, []);

    return (
        <group ref={vineRef}>
            {vines.map((v, i) => (
                <group key={`vine-${i}`} position={[v.x, 0.15, v.z]} rotation={[0, v.rotY, 0]} scale={v.scale}>
                    {/* Vine stem */}
                    <mesh castShadow>
                        <cylinderGeometry args={[0.008, 0.005, v.len, 4]} />
                        <meshStandardMaterial color="#2a5a1a" roughness={0.9} />
                    </mesh>
                    {/* Leaf clusters */}
                    <mesh position={[0.02, v.len * 0.3, 0.01]} rotation={[0.3, 0, 0.5]}>
                        <sphereGeometry args={[0.025, 4, 4]} />
                        <meshStandardMaterial color="#1a6a1a" roughness={0.85} />
                    </mesh>
                    <mesh position={[-0.02, v.len * 0.15, -0.01]} rotation={[-0.2, 0, -0.4]}>
                        <sphereGeometry args={[0.02, 4, 4]} />
                        <meshStandardMaterial color="#2a7a2a" roughness={0.85} />
                    </mesh>
                    {/* Moss spot at base */}
                    <mesh position={[0, -v.len * 0.4, 0]}>
                        <sphereGeometry args={[0.03, 4, 3]} />
                        <meshStandardMaterial color="#2a5a20" roughness={0.95} />
                    </mesh>
                </group>
            ))}
        </group>
    );
}

const CELL_SIZE = 1.1;

export function Board3D({ boardLayout }: { boardLayout: number[][] }) {
    const waterRef = useRef<THREE.Mesh>(null);
    const runeRefs = useRef<THREE.Mesh[]>([]);

    // Ancient Stone Materials
    const materials = useMemo(() => {
        return {
            stoneTop: new THREE.MeshStandardMaterial({ color: '#4a4a42', roughness: 0.85, metalness: 0.15 }),
            stoneSide: new THREE.MeshStandardMaterial({ color: '#3a3a32', roughness: 0.9, metalness: 0.1 }),
            stoneDark: new THREE.MeshStandardMaterial({ color: '#2a2a24', roughness: 0.95, metalness: 0.05 }),
            mossStone: new THREE.MeshStandardMaterial({ color: '#3d4a32', roughness: 0.9, metalness: 0.05 }),
            trapStone: new THREE.MeshStandardMaterial({ color: '#2d2d28', roughness: 0.8, metalness: 0.2 }),
            denStone: new THREE.MeshStandardMaterial({ color: '#3d3d35', roughness: 0.75, metalness: 0.25 }),
            borderStone: new THREE.MeshStandardMaterial({ color: '#333330', roughness: 0.9, metalness: 0.1 }),
        };
    }, []);

    // Mystical Water Shader - dark fantasy river
    const waterShader = useMemo(() => ({
        uniforms: {
            uTime: { value: 0 },
        },
        vertexShader: `
            varying vec2 vUv;
            varying vec3 vPosition;
            uniform float uTime;
            void main() {
                vUv = uv;
                vPosition = position;
                vec3 pos = position;
                pos.z += sin(pos.x * 4.0 + uTime * 1.5) * 0.06;
                pos.z += cos(pos.y * 3.0 + uTime * 2.0) * 0.03;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
            }
        `,
        fragmentShader: `
            uniform float uTime;
            varying vec2 vUv;
            varying vec3 vPosition;
            void main() {
                vec2 p = vUv * 8.0;
                float c = sin(p.x * 2.5 + uTime * 0.8) * cos(p.y * 2.5 + uTime * 1.2) * 0.5 + 0.5;
                float c2 = cos(p.x * 3.5 - uTime * 0.6) * sin(p.y * 3.5 + uTime * 0.5) * 0.5 + 0.5;
                float foam = smoothstep(0.85, 1.0, c * c2) * 0.3;
                vec3 deepColor = vec3(0.02, 0.08, 0.15);
                vec3 shallowColor = vec3(0.05, 0.2, 0.35);
                vec3 glowColor = vec3(0.1, 0.4, 0.5);
                vec3 finalColor = mix(deepColor, shallowColor, c * 0.6);
                finalColor += glowColor * c2 * 0.2;
                finalColor += vec3(foam);
                float shimmer = sin(uTime * 3.0 + p.x * 5.0 + p.y * 5.0) * 0.03;
                finalColor += vec3(shimmer);
                gl_FragColor = vec4(finalColor, 0.92);
            }
        `
    }), []);

    useFrame((state) => {
        if (waterRef.current && waterRef.current.material) {
            const mat = waterRef.current.material as THREE.ShaderMaterial;
            if (mat.uniforms?.uTime) mat.uniforms.uTime.value = state.clock.elapsedTime;
        }
        // Animate rune glows
        const t = state.clock.elapsedTime;
        runeRefs.current.forEach((mesh, i) => {
            if (mesh && mesh.material) {
                const mat = mesh.material as THREE.MeshStandardMaterial;
                mat.emissiveIntensity = 0.6 + Math.sin(t * 2.5 + i * 1.3) * 0.4;
            }
        });
    });

    const { blocks, markers } = useMemo(() => {
        const b: ReactNode[] = [];
        const m: ReactNode[] = [];
        runeRefs.current = [];

        if (!boardLayout) return { blocks: b, markers: m };

        const addBlock = (x: number, y: number, z: number, topMat: THREE.Material, sideMat: THREE.Material, key: string) => {
            b.push(
                <mesh key={key} position={[x, y, z]} receiveShadow castShadow>
                    <boxGeometry args={[CELL_SIZE, 0.5, CELL_SIZE]} />
                    <primitive attach="material-0" object={sideMat} />
                    <primitive attach="material-1" object={sideMat} />
                    <primitive attach="material-2" object={topMat} />
                    <primitive attach="material-3" object={sideMat} />
                    <primitive attach="material-4" object={sideMat} />
                    <primitive attach="material-5" object={sideMat} />
                </mesh>
            );
        };

        // Add slight moss variation to stone tiles
        const getMossVariation = (r: number, c: number) => {
            const hash = (r * 7 + c * 13) % 3;
            return hash === 0 ? materials.mossStone : materials.stoneTop;
        };

        let runeIdx = 0;
        for (let r = 0; r < 9; r++) {
            for (let c = 0; c < 7; c++) {
                const cellType = boardLayout[r][c];
                const x = (c - 3) * CELL_SIZE;
                const z = (r - 4) * CELL_SIZE;
                const blockKey = `block-${r}-${c}`;

                if (cellType === 1) {
                    // River water tile - no stone block
                    continue;
                }

                let topMat = getMossVariation(r, c);
                let sideMat = materials.stoneSide;
                let height = -0.25;

                if (cellType === 2 || cellType === 3) {
                    // Trap - sunken stone with glowing runes
                    topMat = materials.trapStone;
                    sideMat = materials.stoneDark;
                    height = -0.32;
                    const tint = cellType === 2 ? '#ff2222' : '#2266ff';
                    const runeIndex = runeIdx++;

                    // Glowing rune diamond
                    m.push(
                        <mesh key={`trap-rune-${r}-${c}`}
                            ref={(el) => { if (el) runeRefs.current[runeIndex] = el; }}
                            position={[x, -0.06, z]} rotation={[-Math.PI / 2, Math.PI / 4, 0]}>
                            <ringGeometry args={[0.15, 0.35, 4]} />
                            <meshStandardMaterial color={tint} emissive={tint} emissiveIntensity={0.8} transparent opacity={0.85} side={THREE.DoubleSide} />
                        </mesh>
                    );
                    // Inner rune circle
                    m.push(
                        <mesh key={`trap-inner-${r}-${c}`} position={[x, -0.055, z]} rotation={[-Math.PI / 2, 0, 0]}>
                            <ringGeometry args={[0.08, 0.12, 16]} />
                            <meshStandardMaterial color={tint} emissive={tint} emissiveIntensity={1.0} transparent opacity={0.7} side={THREE.DoubleSide} />
                        </mesh>
                    );
                    // Small corner rune dots
                    for (let di = 0; di < 4; di++) {
                        const angle = (di / 4) * Math.PI * 2 + Math.PI / 4;
                        m.push(
                            <mesh key={`trap-dot-${r}-${c}-${di}`}
                                position={[x + Math.cos(angle) * 0.4, -0.055, z + Math.sin(angle) * 0.4]}
                                rotation={[-Math.PI / 2, 0, 0]}>
                                <circleGeometry args={[0.03, 8]} />
                                <meshStandardMaterial color={tint} emissive={tint} emissiveIntensity={1.2} />
                            </mesh>
                        );
                    }
                } else if (cellType === 4 || cellType === 5) {
                    // Den - raised temple platform with glow
                    topMat = materials.denStone;
                    sideMat = materials.stoneDark;
                    height = -0.15;
                    const tint = cellType === 4 ? '#ff3333' : '#3388ff';
                    const runeIndex = runeIdx++;

                    // Glowing den circle
                    m.push(
                        <mesh key={`den-glow-${r}-${c}`}
                            ref={(el) => { if (el) runeRefs.current[runeIndex] = el; }}
                            position={[x, 0.11, z]} rotation={[-Math.PI / 2, 0, 0]}>
                            <circleGeometry args={[0.38, 16]} />
                            <meshStandardMaterial color={tint} emissive={tint} emissiveIntensity={1.0} transparent opacity={0.6} />
                        </mesh>
                    );
                    // Rune ring around den
                    m.push(
                        <mesh key={`den-ring-${r}-${c}`} position={[x, 0.115, z]} rotation={[-Math.PI / 2, 0, 0]}>
                            <ringGeometry args={[0.38, 0.48, 6]} />
                            <meshStandardMaterial color={tint} emissive={tint} emissiveIntensity={0.7} transparent opacity={0.5} side={THREE.DoubleSide} />
                        </mesh>
                    );
                } else {
                    // Normal stone tile with slight random height for aged feel
                    const hash = (r * 17 + c * 31) % 100;
                    height = -0.25 + (hash / 100) * 0.03 - 0.015;
                }

                addBlock(x, height, z, topMat, sideMat, blockKey);

                // Add tile border grooves between cells (carved stone lines)
                if (cellType !== 1) {
                    m.push(
                        <mesh key={`groove-${r}-${c}`} position={[x, 0.01, z]} rotation={[-Math.PI / 2, 0, 0]}>
                            <planeGeometry args={[CELL_SIZE * 0.98, CELL_SIZE * 0.98]} />
                            <meshStandardMaterial color="#3a3a32" roughness={0.95} transparent opacity={0.3} />
                        </mesh>
                    );
                }
            }
        }

        return { blocks: b, markers: m };
    }, [boardLayout, materials]);

    return (
        <group>
            {/* Dark Mystical River Water */}
            <mesh ref={waterRef} position={[0, -0.25, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
                <planeGeometry args={[7 * CELL_SIZE + 2, 9 * CELL_SIZE + 2, 48, 48]} />
                <shaderMaterial args={[waterShader]} transparent depthWrite={false} />
            </mesh>

            {/* Dark Abyss below water */}
            <mesh position={[0, -1.0, 0]} rotation={[-Math.PI / 2, 0, 0]}>
                <planeGeometry args={[7 * CELL_SIZE + 4, 9 * CELL_SIZE + 4]} />
                <meshBasicMaterial color="#020508" />
            </mesh>

            {/* Ancient stone foundation */}
            <mesh position={[0, -1.2, 0]} receiveShadow>
                <boxGeometry args={[7 * CELL_SIZE + 0.6, 1.5, 9 * CELL_SIZE + 0.6]} />
                <meshStandardMaterial color="#1a1a18" roughness={0.95} metalness={0.05} />
            </mesh>

            {/* Board border frame - carved stone edges */}
            {/* Left border */}
            <mesh position={[-3.5 * CELL_SIZE - 0.15, -0.1, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.3, 0.6, 9 * CELL_SIZE + 0.6]} />
                <primitive object={materials.borderStone} attach="material" />
            </mesh>
            {/* Right border */}
            <mesh position={[3.5 * CELL_SIZE + 0.15, -0.1, 0]} castShadow receiveShadow>
                <boxGeometry args={[0.3, 0.6, 9 * CELL_SIZE + 0.6]} />
                <primitive object={materials.borderStone} attach="material" />
            </mesh>
            {/* Top border */}
            <mesh position={[0, -0.1, -4.5 * CELL_SIZE - 0.15]} castShadow receiveShadow>
                <boxGeometry args={[7 * CELL_SIZE + 0.9, 0.6, 0.3]} />
                <primitive object={materials.borderStone} attach="material" />
            </mesh>
            {/* Bottom border */}
            <mesh position={[0, -0.1, 4.5 * CELL_SIZE + 0.15]} castShadow receiveShadow>
                <boxGeometry args={[7 * CELL_SIZE + 0.9, 0.6, 0.3]} />
                <primitive object={materials.borderStone} attach="material" />
            </mesh>

            {/* Ancient Stone Tile Blocks */}
            {blocks}

            {/* Glowing Rune Markers (Traps and Dens) */}
            {markers}

            {/* Jungle Vines & Moss along board edges */}
            <BoardVines />

            {/* Corner moss patches */}
            {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz], i) => (
                <mesh key={`moss-corner-${i}`}
                    position={[sx * 3.5 * CELL_SIZE, 0.02, sz * 4.5 * CELL_SIZE]}
                    rotation={[-Math.PI / 2, 0, i * 1.2]}>
                    <circleGeometry args={[0.25 + i * 0.05, 6]} />
                    <meshStandardMaterial color="#2a5a20" roughness={0.95} transparent opacity={0.5} />
                </mesh>
            ))}

            {/* Ancient stone engravings on border (decorative carved symbols) */}
            {[0, 1, 2, 3].map((i) => {
                const angle = (i / 4) * Math.PI * 2;
                const bw = 7 * CELL_SIZE;
                const bh = 9 * CELL_SIZE;
                const positions: [number, number, number][] = [
                    [-bw / 2 - 0.15, 0.08, 0],
                    [bw / 2 + 0.15, 0.08, 0],
                    [0, 0.08, -bh / 2 - 0.15],
                    [0, 0.08, bh / 2 + 0.15],
                ];
                return (
                    <mesh key={`carving-${i}`} position={positions[i]} rotation={[-Math.PI / 2, angle, 0]}>
                        <ringGeometry args={[0.08, 0.12, 6]} />
                        <meshStandardMaterial color="#554433" emissive="#332211" emissiveIntensity={0.2}
                            metalness={0.5} roughness={0.6} transparent opacity={0.6} />
                    </mesh>
                );
            })}
        </group>
    );
}
