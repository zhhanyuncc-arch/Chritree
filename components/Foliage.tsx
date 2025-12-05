import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { getTreePosition, getRandomSpherePosition } from '../utils/math';
import { extend } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';

// --- Custom Shader Material ---
// Handles the interpolation on the GPU for performance with thousands of particles
const FoliageMaterial = shaderMaterial(
  {
    uTime: 0,
    uProgress: 0, // 0 = Scattered, 1 = Tree
    uColorHigh: new THREE.Color('#0f4d2a'), // Emerald Green
    uColorLow: new THREE.Color('#001a0b'), // Deep Dark Green
    uColorGold: new THREE.Color('#ffd700'), // Gold
  },
  // Vertex Shader
  `
    uniform float uTime;
    uniform float uProgress;
    
    attribute vec3 aScatterPos;
    attribute vec3 aTreePos;
    attribute float aRandom;
    
    varying vec2 vUv;
    varying float vRandom;
    varying float vDepth;

    // Cubic bezier ease-in-out approximation for smoother transition
    float easeInOutCubic(float x) {
      return x < 0.5 ? 4.0 * x * x * x : 1.0 - pow(-2.0 * x + 2.0, 3.0) / 2.0;
    }

    void main() {
      vUv = uv;
      vRandom = aRandom;

      // Add a slight delay based on randomness to make the morph organic
      float localProgress = clamp((uProgress - aRandom * 0.2) / 0.8, 0.0, 1.0);
      float easedProgress = easeInOutCubic(localProgress);

      // Interpolate positions
      vec3 pos = mix(aScatterPos, aTreePos, easedProgress);

      // Add "breathing" animation
      float breathe = sin(uTime * 2.0 + aRandom * 10.0) * 0.1;
      
      // Add slight turbulence when scattered
      float floatY = sin(uTime * 0.5 + aScatterPos.x) * (1.0 - easedProgress) * 0.5;

      pos.y += breathe + floatY;
      
      vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
      vDepth = -mvPosition.z;
      
      // Scale particles based on depth and state
      // Tree state = tighter, sharper points. Scattered = floaty dust.
      float sizeBase = mix(15.0, 10.0, easedProgress); 
      gl_PointSize = sizeBase * (1.0 / -mvPosition.z);
      
      gl_Position = projectionMatrix * mvPosition;
    }
  `,
  // Fragment Shader
  `
    uniform float uTime;
    uniform vec3 uColorHigh;
    uniform vec3 uColorLow;
    uniform vec3 uColorGold;
    
    varying float vRandom;
    varying float vDepth;

    void main() {
      // Create soft circular particle
      vec2 center = gl_PointCoord - 0.5;
      float dist = length(center);
      if (dist > 0.5) discard;

      // Soft glow edge
      float strength = 1.0 - (dist * 2.0);
      strength = pow(strength, 2.0);

      // Twinkle effect
      float twinkle = sin(uTime * 3.0 + vRandom * 20.0) * 0.5 + 0.5;

      // Base color mix
      vec3 color = mix(uColorLow, uColorHigh, vRandom);
      
      // Add gold sparkles to some particles
      if (vRandom > 0.85) {
        color = mix(color, uColorGold, twinkle * 0.8);
      }

      gl_FragColor = vec4(color, strength);
    }
  `
);

extend({ FoliageMaterial });

// Workaround to avoid polluting global JSX namespace which causes issues with other elements
const FoliageMaterialImpl = 'foliageMaterial' as any;

interface FoliageProps {
  count?: number;
  isTree: boolean;
}

export const Foliage: React.FC<FoliageProps> = ({ count = 12000, isTree }) => {
  const materialRef = useRef<any>(null);

  // Generate buffers once
  const { positions, scatterPositions, treePositions, randoms } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const scat = new Float32Array(count * 3);
    const tree = new Float32Array(count * 3);
    const rand = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Random Scatter Position
      const s = getRandomSpherePosition(25);
      scat[i * 3] = s.x;
      scat[i * 3 + 1] = s.y;
      scat[i * 3 + 2] = s.z;

      // Tree Position
      const t = getTreePosition(i, count, -7, 0.8);
      tree[i * 3] = t.x;
      tree[i * 3 + 1] = t.y;
      tree[i * 3 + 2] = t.z;

      // Random attribute (0-1)
      rand[i] = Math.random();
      
      // Initial position (doesn't matter much as shader handles mix)
      pos[i * 3] = 0;
      pos[i * 3 + 1] = 0;
      pos[i * 3 + 2] = 0;
    }

    return {
      positions: pos,
      scatterPositions: scat,
      treePositions: tree,
      randoms: rand,
    };
  }, [count]);

  useFrame((state, delta) => {
    if (materialRef.current) {
      materialRef.current.uTime = state.clock.elapsedTime;
      
      // Smoothly interpolate uProgress based on isTree state
      const target = isTree ? 1 : 0;
      // Using simple lerp for the uniform value
      materialRef.current.uProgress = THREE.MathUtils.lerp(
        materialRef.current.uProgress, 
        target, 
        delta * 1.5 // Speed of transition
      );
    }
  });

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aScatterPos"
          count={scatterPositions.length / 3}
          array={scatterPositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aTreePos"
          count={treePositions.length / 3}
          array={treePositions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-aRandom"
          count={randoms.length}
          array={randoms}
          itemSize={1}
        />
      </bufferGeometry>
      <FoliageMaterialImpl 
        ref={materialRef} 
        transparent 
        depthWrite={false} 
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};