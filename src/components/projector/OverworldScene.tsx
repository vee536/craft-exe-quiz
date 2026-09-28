import React from 'react';
import { OverworldCanvas } from '../canvas/OverworldCanvas';

interface OverworldSceneProps {
  children?: React.ReactNode;
}

export const OverworldScene: React.FC<OverworldSceneProps> = ({ children }) => {
  return (
    <div className="relative w-full h-full min-h-screen overflow-hidden bg-gradient-to-b from-[#7dd3fc] via-[#bae6fd] to-[#fed7aa] flex flex-col justify-between">
      {/* Sun & Pixel Clouds */}
      <div className="absolute top-8 right-16 w-20 h-20 bg-amber-200 border-4 border-amber-300 shadow-[0_0_30px_rgba(251,191,36,0.6)]" />
      
      {/* Pixel Clouds */}
      <div className="absolute top-12 left-10 opacity-75 animate-[pulse_6s_ease-in-out_infinite]">
        <div className="w-36 h-10 bg-white/90 shadow-pixel-sm relative">
          <div className="absolute -top-6 left-6 w-20 h-6 bg-white/90" />
        </div>
      </div>
      <div className="absolute top-24 right-48 opacity-60">
        <div className="w-48 h-12 bg-white/90 shadow-pixel-sm relative">
          <div className="absolute -top-6 left-10 w-24 h-6 bg-white/90" />
        </div>
      </div>

      {/* Cherry Blossom Trees (Background Layer) */}
      <div className="absolute bottom-36 left-8 flex items-end opacity-90">
        {/* Cherry Tree Left */}
        <div className="relative">
          {/* Foliage */}
          <div className="w-36 h-28 bg-[#f472b6] border-4 border-[#db2777] shadow-pixel relative">
            <div className="absolute -top-6 left-4 w-28 h-8 bg-[#fbcfe8]" />
            <div className="absolute top-3 left-3 w-8 h-8 bg-[#fdf2f8]" />
            <div className="absolute top-10 right-4 w-10 h-10 bg-[#f472b6]" />
          </div>
          {/* Trunk */}
          <div className="w-10 h-24 bg-[#5c3a21] border-2 border-[#382315] mx-auto shadow-pixel-sm" />
        </div>
      </div>

      <div className="absolute bottom-36 right-12 flex items-end opacity-90">
        {/* Cherry Tree Right */}
        <div className="relative">
          <div className="w-44 h-32 bg-[#ec4899] border-4 border-[#be185d] shadow-pixel relative">
            <div className="absolute -top-8 left-6 w-32 h-10 bg-[#fbcfe8]" />
            <div className="absolute top-4 left-6 w-12 h-12 bg-[#fdf2f8]" />
          </div>
          <div className="w-12 h-28 bg-[#5c3a21] border-2 border-[#382315] mx-auto shadow-pixel-sm" />
        </div>
      </div>

      {/* Pixel Animals & Flowers Grazing Area */}
      <div className="absolute bottom-24 left-1/4 flex items-end gap-16 z-20 pointer-events-none opacity-90">
        {/* Minecraft Sheep */}
        <div className="relative animate-bounce" style={{ animationDuration: '3.5s' }}>
          {/* Sheep body */}
          <div className="w-16 h-12 bg-white border-2 border-zinc-300 shadow-pixel-sm relative">
            {/* Head */}
            <div className="absolute -top-4 -left-5 w-8 h-8 bg-[#fce7f3] border border-zinc-400">
              <div className="absolute top-2 left-1 w-2 h-2 bg-black" />
            </div>
          </div>
          {/* Legs */}
          <div className="flex justify-between px-1.5">
            <div className="w-2.5 h-6 bg-[#d4d4d8]" />
            <div className="w-2.5 h-6 bg-[#d4d4d8]" />
            <div className="w-2.5 h-6 bg-[#d4d4d8]" />
            <div className="w-2.5 h-6 bg-[#d4d4d8]" />
          </div>
        </div>

        {/* Minecraft Pig */}
        <div className="relative animate-bounce" style={{ animationDuration: '4.2s' }}>
          <div className="w-14 h-10 bg-[#f472b6] border-2 border-[#db2777] shadow-pixel-sm relative">
            {/* Pig Head */}
            <div className="absolute -top-3 -right-4 w-7 h-7 bg-[#f472b6] border border-[#db2777]">
              {/* Snout */}
              <div className="absolute bottom-1 right-0 w-4 h-3 bg-[#db2777]" />
              {/* Eye */}
              <div className="absolute top-1.5 left-1 w-1.5 h-1.5 bg-black" />
            </div>
          </div>
          {/* Legs */}
          <div className="flex justify-between px-1">
            <div className="w-2 h-5 bg-[#db2777]" />
            <div className="w-2 h-5 bg-[#db2777]" />
            <div className="w-2 h-5 bg-[#db2777]" />
            <div className="w-2 h-5 bg-[#db2777]" />
          </div>
        </div>

        {/* Minecraft Chicken */}
        <div className="relative animate-bounce" style={{ animationDuration: '2.8s' }}>
          <div className="w-8 h-8 bg-white border border-zinc-300 shadow-pixel-sm relative">
            {/* Beak & Wattle */}
            <div className="absolute top-1 -right-2 w-3 h-2 bg-amber-500" />
            <div className="absolute top-3 -right-1 w-1.5 h-2 bg-red-600" />
            <div className="absolute top-1 left-2 w-1.5 h-1.5 bg-black" />
          </div>
          {/* Red legs */}
          <div className="flex justify-around">
            <div className="w-1 h-3 bg-amber-600" />
            <div className="w-1 h-3 bg-amber-600" />
          </div>
        </div>
      </div>

      {/* Terrain Layers (Grass, Dirt & Flowing River) */}
      <div className="relative w-full z-10">
        {/* River Stream */}
        <div className="w-full h-8 bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-600 border-t-2 border-cyan-200 opacity-80" />
        {/* Grass Block Top Layer */}
        <div className="w-full h-10 bg-[#4ade80] border-t-4 border-[#22c55e] relative">
          {/* Grass block overhang pixels */}
          <div className="absolute -bottom-2 inset-x-0 flex justify-around">
            {Array.from({ length: 32 }).map((_, i) => (
              <div
                key={i}
                className="w-4 h-2 bg-[#22c55e]"
                style={{ height: (i % 3 + 1) * 3 }}
              />
            ))}
          </div>
        </div>
        {/* Dirt Base */}
        <div className="w-full h-16 bg-[#866043] border-t-2 border-[#5c3a21] shadow-inner" />
      </div>

      {/* Particle Canvas Overlay */}
      <OverworldCanvas />

      {/* Foreground Content Container */}
      <div className="absolute inset-0 z-20 flex flex-col pointer-events-auto">
        {children}
      </div>
    </div>
  );
};
