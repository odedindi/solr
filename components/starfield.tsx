"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function Stars({ count = 4000 }) {
  const meshRef = useRef<THREE.Points>(null);

  const { positions, colors } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const col = new Float32Array(count * 3);

    // Color palette: cyan, white, light blue
    const colorPalette = [
      [0.024, 0.714, 0.831], // cyan (primary)
      [0.9, 0.92, 0.96], // white-blue
      [0.6, 0.75, 0.9], // light blue
      [0.95, 0.62, 0.04], // amber (accent) - rare
    ];

    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 250;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 250;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 250;

      // Most stars are white/blue, few are cyan, very few are amber
      const colorIndex =
        Math.random() < 0.05
          ? 3
          : Math.random() < 0.2
            ? 0
            : Math.random() < 0.5
              ? 1
              : 2;
      const c = colorPalette[colorIndex];
      col[i * 3] = c[0];
      col[i * 3 + 1] = c[1];
      col[i * 3 + 2] = c[2];
    }
    return { positions: pos, colors: col };
  }, [count]);

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.008;
      meshRef.current.rotation.x += delta * 0.003;
    }
  });

  return (
    <points ref={meshRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.12}
        sizeAttenuation
        vertexColors
        transparent
        opacity={0.9}
      />
    </points>
  );
}

// Distant nebula glow
function NebulaGlow() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.z = state.clock.elapsedTime * 0.02;
    }
  });

  return (
    <mesh ref={meshRef} position={[80, 30, -100]}>
      <planeGeometry args={[100, 100]} />
      <meshBasicMaterial
        color="#06b6d4"
        transparent
        opacity={0.02}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

export function Starfield() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <Canvas camera={{ position: [0, 0, 50], fov: 60 }} dpr={[1, 1.5]}>
        <Stars />
        <NebulaGlow />
        {/* Ambient space lighting */}
        <ambientLight intensity={0.02} color="#06b6d4" />
      </Canvas>
    </div>
  );
}
