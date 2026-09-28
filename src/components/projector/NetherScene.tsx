import React from 'react';
import { NetherCanvas } from '../canvas/NetherCanvas';

interface NetherSceneProps {
  children?: React.ReactNode;
}

export const NetherScene: React.FC<NetherSceneProps> = ({ children }) => {
  return (
    <div className="relative w-full h-full min-h-screen overflow-hidden bg-gradient-to-b from-[#180505] via-[#2a0808] to-[#450a0a] flex flex-col justify-between">
      {/* Nether Sky Fog & Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(239,68,68,0.15),rgba(0,0,0,0.85))] pointer-events-none" />

      {/* Nether Fortress Silhouettes in Background */}
      <div className="absolute top-20 inset-x-0 flex justify-between px-12 opacity-35 pointer-events-none">
        {/* Fortress Bridge Pillar Left */}
        <div className="w-28 h-72 bg-[#1c0808] border-r-4 border-[#3b0d0d] relative shadow-2xl">
          <div className="w-40 h-10 bg-[#2b0c0c] border-b-2 border-[#1c0808]" />
          <div className="w-8 h-16 bg-[#0f0404] mx-auto mt-8 border border-red-950" />
        </div>

        {/* Floating Ghast Silhouette Center-Right */}
        <div className="relative animate-bounce" style={{ animationDuration: '6s' }}>
          <div className="w-24 h-24 bg-zinc-200/80 border-2 border-zinc-400 shadow-[0_0_20px_rgba(255,255,255,0.2)] relative">
            {/* Red crying eyes / mouth */}
            <div className="absolute top-8 left-4 w-3 h-3 bg-red-800" />
            <div className="absolute top-8 right-4 w-3 h-3 bg-red-800" />
            <div className="absolute top-14 left-8 w-8 h-3 bg-red-900" />
            {/* Tentacles */}
            <div className="absolute -bottom-8 inset-x-0 flex justify-around">
              {Array.from({ length: 6 }).map((_, idx) => (
                <div
                  key={idx}
                  className="w-2.5 bg-zinc-300/80 rounded-b"
                  style={{ height: 20 + (idx % 3) * 8 }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Nether Portal Frame Right */}
        <div className="w-28 h-44 bg-[#09090b] border-4 border-[#18181b] relative p-2 shadow-[0_0_30px_rgba(168,85,247,0.5)]">
          {/* Swirling Portal Texture */}
          <div className="w-full h-full bg-gradient-to-tr from-purple-700 via-fuchsia-600 to-indigo-900 animate-pulse opacity-90" />
        </div>
      </div>

      {/* Basalt Columns & Nether Terrain Layers */}
      <div className="absolute bottom-28 inset-x-0 flex items-end justify-around px-8 pointer-events-none opacity-80">
        {/* Basalt pillar clusters */}
        <div className="flex items-end gap-1">
          <div className="w-10 h-32 bg-[#27272a] border-t-4 border-[#3f3f46]" />
          <div className="w-12 h-44 bg-[#18181b] border-t-4 border-[#27272a]" />
          <div className="w-8 h-24 bg-[#27272a] border-t-4 border-[#3f3f46]" />
        </div>

        {/* Floating Blaze Entity (Midground) */}
        <div className="relative animate-pulse" style={{ animationDuration: '2.5s' }}>
          <div className="w-12 h-12 bg-amber-400 border-2 border-amber-600 shadow-[0_0_20px_rgba(245,158,11,0.8)] relative">
            <div className="absolute top-3 left-2 w-2 h-2 bg-black" />
            <div className="absolute top-3 right-2 w-2 h-2 bg-black" />
          </div>
          {/* Orbiting blaze rods */}
          <div className="absolute -top-3 -left-4 w-3 h-8 bg-amber-500 border border-amber-300 animate-bounce" />
          <div className="absolute -top-3 -right-4 w-3 h-8 bg-amber-500 border border-amber-300 animate-bounce" style={{ animationDelay: '0.4s' }} />
          <div className="absolute bottom-[-10px] left-4 w-3 h-8 bg-amber-500 border border-amber-300 animate-bounce" style={{ animationDelay: '0.8s' }} />
        </div>

        <div className="flex items-end gap-1">
          <div className="w-10 h-40 bg-[#18181b] border-t-4 border-[#27272a]" />
          <div className="w-12 h-28 bg-[#27272a] border-t-4 border-[#3f3f46]" />
        </div>
      </div>

      {/* Bubbling Lava Lake & Netherrack Bottom */}
      <div className="relative w-full z-10">
        {/* Bubbling Lava Lake */}
        <div className="w-full h-12 bg-gradient-to-r from-red-600 via-amber-500 to-red-700 border-t-4 border-amber-300 shadow-[0_0_40px_rgba(245,158,11,0.8)] relative">
          <div className="absolute inset-x-0 top-0 h-2 bg-yellow-200 animate-pulse" />
        </div>
        {/* Netherrack / Magma Block Ground */}
        <div className="w-full h-16 bg-[#450a0a] border-t-2 border-[#7f1d1d] relative">
          {/* Netherrack texture flecks */}
          <div className="absolute inset-0 flex flex-wrap gap-4 p-2 opacity-50">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="w-3 h-2 bg-red-950" />
            ))}
          </div>
        </div>
      </div>

      {/* Nether Particle Canvas Overlay */}
      <NetherCanvas />

      {/* Foreground Content Container */}
      <div className="absolute inset-0 z-20 flex flex-col pointer-events-auto">
        {children}
      </div>
    </div>
  );
};
