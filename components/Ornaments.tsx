import React, { useRef, useMemo, useEffect } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { getTreePosition, getRandomSpherePosition } from '../utils/math';
import { useGLTF } from '@react-three/drei';

interface OrnamentProps {
  type: 'box' | 'sphere';
  count: number;
  color: string;
  isTree: boolean;
  scale?: number;
  metallic?: number;
  roughness?: number;
}

export const Ornaments: React.FC<OrnamentProps> = ({ 
  type, 
  count, 
  color, 
  isTree, 
  scale = 1,
  metallic = 0.9,
  roughness = 0.1
}) => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  
  // Create dummy object for matrix calculations
  const dummy = useMemo(() => new THREE.Object3D(), []);

  // Precompute positions
  const data = useMemo(() => {
    return new Array(count).fill(0).map((_, i) => {
      // Distribute ornaments evenly but randomly throughout the tree volume
      // We use a different seed/logic than foliage to ensure they sit ON the tree
      const tPos = getTreePosition(i, count, -7, 0.2);
      
      // Push them slightly outward to sit on surface
      const vectorFromCenter = new THREE.Vector3(tPos.x, 0, tPos.z).normalize();
      tPos.add(vectorFromCenter.multiplyScalar(0.5));

      const sPos = getRandomSpherePosition(30); // Wider scatter radius for heavy objects
      
      // Random rotation
      const rotation = new THREE.Euler(
        Math.random() * Math.PI, 
        Math.random() * Math.PI, 
        Math.random() * Math.PI
      );

      // Weight determines how fast they move (heavier items move slower)
      const weight = type === 'box' ? 0.8 : 1.2; 
      
      return { 
        tPos, 
        sPos, 
        currentPos: sPos.clone(),
        rotation,
        weight,
        scale: Math.random() * 0.5 + 0.5 // Random size variation
      };
    });
  }, [count, type]);

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Use a slightly different logic for JS animation compared to Shader animation
    // to give it a layered feel.
    
    data.forEach((d, i) => {
      const target = isTree ? d.tPos : d.sPos;
      
      // Interpolate current position towards target
      // Adjusted by weight for physics feel
      const speed = delta * 2.0 * d.weight; 
      
      d.currentPos.lerp(target, speed);

      // Add floating movement when scattered
      if (!isTree) {
        d.currentPos.y += Math.sin(state.clock.elapsedTime + i) * 0.02;
        
        // Slowly rotate when floating
        d.rotation.x += delta * 0.2;
        d.rotation.y += delta * 0.3;
      } else {
        // Stabilize rotation when in tree form
        // (Simplification: just reset to initial random rotation or align)
      }

      dummy.position.copy(d.currentPos);
      dummy.rotation.copy(d.rotation);
      
      const scaleBase = scale * d.scale;
      // Pop in effect or scale adjust
      dummy.scale.set(scaleBase, scaleBase, scaleBase);

      dummy.updateMatrix();
      meshRef.current!.setMatrixAt(i, dummy.matrix);
    });

    meshRef.current.instanceMatrix.needsUpdate = true;
  });

  const geometry = type === 'box' 
    ? new THREE.BoxGeometry(1, 1, 1) 
    : new THREE.SphereGeometry(0.6, 32, 32);

  return (
    <instancedMesh ref={meshRef} args={[geometry, undefined, count]} castShadow receiveShadow>
      <meshStandardMaterial 
        color={color} 
        metalness={metallic} 
        roughness={roughness}
        emissive={color}
        emissiveIntensity={0.2}
      />
    </instancedMesh>
  );
};