import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, PerspectiveCamera, Environment, Text } from '@react-three/drei';
import * as THREE from 'three';

const FloatingIcons = () => {
    const groupRef = useRef<THREE.Group>(null);

    useFrame((state) => {
        if (!groupRef.current) return;
        const t = state.clock.getElapsedTime();
        groupRef.current.rotation.y = Math.sin(t / 4) / 4;
        groupRef.current.rotation.x = Math.cos(t / 4) / 8;
    });

    return (
        <group ref={groupRef}>
            <Float speed={2} rotationIntensity={1} floatIntensity={2}>
                <mesh position={[-2, 1, 0]} rotation={[0, 0.5, 0]}>
                    <boxGeometry args={[0.8, 1, 0.1]} />
                    <meshStandardMaterial color="#4f46e5" roughness={0.1} metalness={0.8} />
                    <Text
                        position={[0, 0, 0.06]}
                        fontSize={0.2}
                        color="white"
                        anchorX="center"
                        anchorY="middle"
                    >
                        CAL
                    </Text>
                </mesh>
            </Float>

            <Float speed={3} rotationIntensity={2} floatIntensity={1}>
                <mesh position={[2, -1, 1]} rotation={[0.4, -0.4, 0]}>
                    <sphereGeometry args={[0.5, 32, 32]} />
                    <meshStandardMaterial color="#10b981" roughness={0} metalness={1} />
                </mesh>
            </Float>

            <Float speed={1.5} rotationIntensity={0.5} floatIntensity={0.5}>
                <mesh position={[0, 2, -1]} rotation={[0.2, 0.2, 0.2]}>
                    <torusKnotGeometry args={[0.4, 0.1, 100, 16]} />
                    <meshStandardMaterial color="#f59e0b" roughness={0.3} metalness={0.9} />
                </mesh>
            </Float>
        </group>
    );
};

export const Login3DBackground: React.FC = () => {
    return (
        <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
            <Canvas dpr={[1, 2]}>
                <PerspectiveCamera makeDefault position={[0, 0, 5]} fov={50} />
                <ambientLight intensity={0.5} />
                <pointLight position={[10, 10, 10]} intensity={1} />
                <spotLight position={[-10, 10, 10]} angle={0.15} penumbra={1} intensity={1} />
                <Environment preset="city" />
                <FloatingIcons />
            </Canvas>
        </div>
    );
};
