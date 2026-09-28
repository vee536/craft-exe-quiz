import React from 'react';
import { EndCanvas } from '../canvas/EndCanvas';

interface EndSceneProps {
  children?: React.ReactNode;
}

export const EndScene: React.FC<EndSceneProps> = ({ children }) => {
  return (
    <div className="relative w-full h-full min-h-screen overflow-hidden bg-gradient-to-b from-[#05020a] via-[#0e0720] to-[#1e0e38] flex flex-col justify-between">
      {/* Deep Void Fog */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.12),rgba(0,0,0,0.9))] pointer-events-none" />

      {/* Obsidian Pillars with End Crystals */}
      <div className="absolute bottom-24 inset-x-0 flex justify-between px-16 pointer-events-none z-10">
        {/* Tall Obsidian Pillar 1 */}
        <div className="relative flex flex-col items-center">
          {/* End Crystal with Beaming Ray */}
          <div className="relative mb-2">
            {/* Crystal Core (Rotating diamond) */}
            <div className="w-8 h-8 bg-gradient-to-tr from-purple-500 via-pink-400 to-white rotate-45 border-2 border-white shadow-[0_0_25px_rgba(236,72,153,0.9)] animate-pulse" />
            {/* Vertical Beam of Light shooting into sky */}
            <div className="absolute bottom-4 left-3.5 w-1 h-96 bg-gradient-to-t from-pink-500/80 via-purple-400/40 to-transparent shadow-[0_0_15px_rgba(236,72,153,0.8)]" />
          </div>
          {/* Pillar Body */}
          <div className="w-20 h-64 bg-[#111216] border-x-4 border-t-4 border-[#1f2029] shadow-2xl relative">
            <div className="absolute inset-0 bg-gradient-to-b from-purple-950/30 to-black/80" />
          </div>
        </div>

        {/* Wandering Enderman Left */}
        <div className="absolute bottom-28 left-1/4 flex flex-col items-center opacity-85">
          {/* Enderman Eyes */}
          <div className="w-6 h-10 bg-[#09090b] relative">
            <div className="absolute top-3 -left-1 w-2.5 h-1 bg-[#d946ef] shadow-[0_0_8px_#d946ef]" />
            <div className="absolute top-3 right-0 w-2.5 h-1 bg-[#d946ef] shadow-[0_0_8px_#d946ef]" />
          </div>
          {/* Slender Body */}
          <div className="w-4 h-16 bg-[#09090b]" />
          {/* Long Legs */}
          <div className="flex gap-1">
            <div className="w-1.5 h-28 bg-[#09090b]" />
            <div className="w-1.5 h-28 bg-[#09090b]" />
          </div>
        </div>

        {/* Medium Obsidian Pillar 2 */}
        <div className="relative flex flex-col items-center">
          <div className="relative mb-2">
            <div className="w-8 h-8 bg-gradient-to-tr from-purple-500 via-pink-400 to-white rotate-45 border-2 border-white shadow-[0_0_25px_rgba(236,72,153,0.9)] animate-pulse" style={{ animationDelay: '0.7s' }} />
            <div className="absolute bottom-4 left-3.5 w-1 h-96 bg-gradient-to-t from-pink-500/80 via-purple-400/40 to-transparent shadow-[0_0_15px_rgba(236,72,153,0.8)]" />
          </div>
          <div className="w-24 h-48 bg-[#111216] border-x-4 border-t-4 border-[#1f2029] shadow-2xl relative">
            <div className="absolute inset-0 bg-gradient-to-b from-purple-950/30 to-black/80" />
          </div>
        </div>
      </div>

      {/* End Stone Floating Island Ground */}
      <div className="relative w-full z-10">
        {/* Island Surface */}
        <div className="w-full h-12 bg-[#ded69e] border-t-4 border-[#eee7b3] relative shadow-[0_-10px_30px_rgba(0,0,0,0.8)]">
          {/* Pixel noise on end stone */}
          <div className="absolute inset-0 flex flex-wrap gap-6 p-2 opacity-40">
            {Array.from({ length: 30 }).map((_, i) => (
              <div key={i} className="w-3 h-2 bg-[#b8ad67]" />
            ))}
          </div>
        </div>
        {/* Island Underside Crags dropping into void */}
        <div className="w-full h-14 bg-[#575335] relative">
          <div className="w-full h-6 bg-[#272518]" />
        </div>
      </div>

      {/* End Particle & Dragon Canvas Overlay */}
      <EndCanvas />

      {/* Foreground Content Container */}
      <div className="absolute inset-0 z-20 flex flex-col pointer-events-auto">
        {children}
      </div>
    </div>
  );
};
