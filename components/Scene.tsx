import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls, Environment, ContactShadows } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette, Noise } from '@react-three/postprocessing';
import * as THREE from 'three';
import { Foliage } from './Foliage';
import { Ornaments } from './Ornaments';

interface SceneProps {
  isTree: boolean;
}

const Rig = ({ isTree }: { isTree: boolean }) => {
  const { camera } = useThree();
  const vec = new THREE.Vector3();
  
  useFrame((state) => {
    // Subtle camera movement
    if (isTree) {
        // Slow orbit
        const t = state.clock.getElapsedTime() * 0.1;
        camera.position.lerp(vec.set(Math.sin(t) * 20, 2, Math.cos(t) * 20), 0.05);
        camera.lookAt(0, 0, 0);
    } else {
        // Pull back when scattered
        camera.position.lerp(vec.set(0, 5, 35), 0.02);
        camera.lookAt(0, 0, 0);
    }
  });
  return null;
}

export const Scene: React.FC<SceneProps> = ({ isTree }) => {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 25]} fov={50} />
      {/* <Rig isTree={isTree} /> */}
      <OrbitControls 
        enablePan={false} 
        enableZoom={true} 
        minDistance={10} 
        maxDistance={50} 
        autoRotate={isTree}
        autoRotateSpeed={0.5}
      />

      {/* --- Lighting --- */}
      <ambientLight intensity={0.2} color="#022b1c" />
      
      {/* Key Light (Gold/Warm) */}
      <spotLight 
        position={[10, 20, 10]} 
        angle={0.3} 
        penumbra={1} 
        intensity={200} 
        color="#ffd700" 
        castShadow 
      />
      
      {/* Fill Light (Cool/Emerald) */}
      <pointLight position={[-10, 0, -10]} intensity={50} color="#00ff88" />
      
      {/* Back/Rim Light for silhouette */}
      <spotLight 
        position={[0, 10, -20]} 
        intensity={100} 
        color="#ffffff" 
        angle={0.5} 
      />

      {/* --- Environment --- */}
      <Environment preset="city" background={false} />
      
      <group position={[0, 2, 0]}>
        {/* Core Foliage */}
        <Foliage isTree={isTree} count={15000} />
        
        {/* Ornaments - Gold Spheres */}
        <Ornaments 
          type="sphere" 
          count={300} 
          color="#ffd700" 
          isTree={isTree} 
          scale={0.5} 
        />
        
        {/* Ornaments - Red/Emerald Boxes */}
        <Ornaments 
          type="box" 
          count={100} 
          color="#8b0000" 
          isTree={isTree} 
          scale={0.7} 
          roughness={0.3}
        />
        
         {/* Ornaments - White/Silver tiny lights/stars */}
         <Ornaments 
          type="sphere" 
          count={200} 
          color="#ffffff" 
          isTree={isTree} 
          scale={0.2} 
          metallic={1}
          roughness={0}
        />
      </group>

      {/* Floor Shadows */}
      <ContactShadows 
        opacity={0.5} 
        scale={40} 
        blur={2} 
        far={10} 
        resolution={256} 
        color="#000000" 
        position={[0, -8, 0]}
      />

      {/* --- Post Processing for Cinematic Look --- */}
      <EffectComposer disableNormalPass>
        <Bloom 
          luminanceThreshold={0.5} 
          mipmapBlur 
          intensity={1.5} 
          radius={0.6}
        />
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
        <Noise opacity={0.02} />
      </EffectComposer>
    </>
  );
};