import React from 'react';

interface UIProps {
  isTree: boolean;
  setIsTree: (val: boolean) => void;
}

export const UI: React.FC<UIProps> = ({ isTree, setIsTree }) => {
  return (
    <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-10 flex flex-col justify-between p-8">
      {/* Header */}
      <div className="flex flex-col items-center animate-fade-in-down">
        <h1 className="text-4xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-b from-[#ffd700] to-[#b8860b] font-serif font-bold tracking-widest uppercase drop-shadow-lg" style={{ fontFamily: '"Cinzel", serif' }}>
          ARIX
        </h1>
        <div className="h-[1px] w-24 bg-[#ffd700] my-2 shadow-[0_0_10px_#ffd700]"></div>
        <h2 className="text-[#a5d6a7] text-sm md:text-base tracking-[0.3em] font-light">
          SIGNATURE COLLECTION
        </h2>
      </div>

      {/* Controls */}
      <div className="flex flex-col items-center justify-center gap-6 pointer-events-auto pb-12">
        <div className="flex gap-4 p-1 rounded-full bg-black/40 backdrop-blur-md border border-[#ffffff10]">
            <button
            onClick={() => setIsTree(false)}
            className={`px-6 py-3 rounded-full text-xs font-bold tracking-widest transition-all duration-500 border border-transparent
                ${!isTree 
                ? 'bg-[#ffd700] text-black shadow-[0_0_20px_rgba(255,215,0,0.4)]' 
                : 'text-[#ffd700] hover:bg-[#ffd70020] hover:border-[#ffd70050]'
                }`}
            >
            SCATTER
            </button>
            <button
            onClick={() => setIsTree(true)}
            className={`px-6 py-3 rounded-full text-xs font-bold tracking-widest transition-all duration-500 border border-transparent
                ${isTree 
                ? 'bg-[#ffd700] text-black shadow-[0_0_20px_rgba(255,215,0,0.4)]' 
                : 'text-[#ffd700] hover:bg-[#ffd70020] hover:border-[#ffd70050]'
                }`}
            >
            ASSEMBLE
            </button>
        </div>
        
        <p className="text-[#a5d6a7]/60 text-xs tracking-widest font-serif italic">
          Experience the Magic of Structure
        </p>
      </div>
    </div>
  );
};