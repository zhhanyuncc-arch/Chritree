import React, { useState, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Scene } from './components/Scene';
import { UI } from './components/UI';

const Loader = () => {
  return (
    <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center bg-black z-50 text-[#ffd700] font-serif tracking-widest">
      <div className="animate-pulse">LOADING EXPERIENCE...</div>
    </div>
  );
};

export default function App() {
  const [isTree, setIsTree] = useState(true);

  return (
    <div className="w-full h-screen bg-black relative">
      <UI isTree={isTree} setIsTree={setIsTree} />
      
      <Suspense fallback={<Loader />}>
        <Canvas
          shadows
          dpr={[1, 2]}
          gl={{ 
            antialias: false, // Post-processing handles AA usually, or we turn it off for perf
            toneMapping: React.Fragment as any, // Let EffectComposer handle it or default
            powerPreference: "high-performance"
          }} 
          camera={{ position: [0, 0, 25], fov: 45 }}
        >
          <color attach="background" args={['#000502']} />
          <Scene isTree={isTree} />
        </Canvas>
      </Suspense>
    </div>
  );
}