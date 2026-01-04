"use client";
import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Stars, Float } from "@react-three/drei";
import * as THREE from "three";

function NeuralNetwork() {
    const count = 100;
    const connections = 150;

    // Generate random points in a sphere
    const positions = useMemo(() => {
        const pos = new Float32Array(count * 3);
        const distance = 12; // Radius
        for (let i = 0; i < count; i++) {
            const theta = THREE.MathUtils.randFloatSpread(360);
            const phi = THREE.MathUtils.randFloatSpread(360);

            pos[i * 3] = distance * Math.sin(theta) * Math.cos(phi);
            pos[i * 3 + 1] = distance * Math.sin(theta) * Math.sin(phi);
            pos[i * 3 + 2] = distance * Math.cos(theta);
        }
        return pos;
    }, []);

    const lines = useMemo(() => {
        // Create random connections between points
        return []; // Simplified for now to avoid complexity in restoration
    }, []);

    const ref = useRef<THREE.Points>(null);
    useFrame((state, delta) => {
        if (ref.current) {
            ref.current.rotation.x -= delta / 10;
            ref.current.rotation.y -= delta / 15;
        }
    });

    return (
        <group rotation={[0, 0, Math.PI / 4]}>
            <points ref={ref}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={positions.length / 3}
                        array={positions}
                        itemSize={3}
                        args={[positions, 3]}
                    />
                </bufferGeometry>
                <pointsMaterial
                    size={0.15}
                    color="#06b6d4"
                    sizeAttenuation={true}
                    transparent={true}
                    opacity={0.8}
                />
            </points>
        </group>
    );
}

export default function HeroScene() {
    return (
        <div className="absolute inset-0 z-0 h-full w-full opacity-60">
            <Canvas camera={{ position: [0, 0, 20], fov: 60 }} gl={{ antialias: true, alpha: true }}>
                <ambientLight intensity={0.5} />
                <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
                <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                    <NeuralNetwork />
                </Float>
            </Canvas>
        </div>
    )
}
