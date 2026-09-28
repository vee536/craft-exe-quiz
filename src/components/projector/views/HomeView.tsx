import React from 'react';
import { useEvent } from '../../../context/EventContext';
import { OverworldScene } from '../OverworldScene';
import { Clock, AlertTriangle } from 'lucide-react';

export const HomeView: React.FC = () => {
  const { state } = useEvent();
  const { round1Timer } = state;

  const minutes = Math.floor(round1Timer.secondsLeft / 60);
  const seconds = round1Timer.secondsLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const isExpired = round1Timer.isExpired || round1Timer.secondsLeft === 0;

  return (
    <OverworldScene>
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-6">
        {/* Minecraft Portal / Craft.exe Branding Box */}
        <div className="bg-[#18181b]/95 border-4 border-[#3f3f46] p-8 md:p-12 shadow-pixel-lg max-w-4xl w-full backdrop-blur-md animate-[fadeIn_0.8s_ease-out]">
          {/* Tagline Badge */}
          <div className="inline-block bg-[#22c55e] text-black font-pixel text-xs md:text-sm px-4 py-1.5 uppercase font-bold tracking-widest mb-4 shadow-pixel-sm">
            Interactive Live IT Quiz Event • 30 Teams → 20 Qualifiers
          </div>

          {/* Main Title */}
          <h1 className="font-pixel text-4xl md:text-6xl text-[#fef08a] drop-shadow-[4px_4px_0_#854d0e] tracking-tight mb-2 uppercase">
            CRAFT<span className="text-[#38bdf8]">.exe</span>
          </h1>

          <div className="w-48 h-1.5 bg-[#4ade80] mx-auto my-4 shadow-pixel-sm" />

          {/* Subtitles */}
          <h2 className="font-pixel text-lg md:text-xl text-white tracking-wider uppercase mb-1 drop-shadow-[2px_2px_0_#000]">
            THE JOURNEY BEGINS
          </h2>

          <p className="font-pixel text-sm md:text-lg text-[#86efac] tracking-wide uppercase drop-shadow-[2px_2px_0_#000] mb-6">
            ROUND 1 — THE OVERWORLD 🌳
          </p>

          {/* PROMINENT LIVE CONTESTANT COUNTDOWN TIMER */}
          <div className={`p-6 border-4 shadow-pixel-lg my-4 transition-all duration-300 ${
            isExpired
              ? 'bg-red-950/90 border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.6)] animate-pulse'
              : round1Timer.secondsLeft <= 60 && round1Timer.isRunning
              ? 'bg-amber-950/80 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.5)]'
              : 'bg-[#111215]/90 border-[#4ade80] shadow-[0_0_20px_rgba(74,222,128,0.3)]'
          }`}>
            <div className="flex items-center justify-center gap-2 mb-2 font-pixel text-xs md:text-sm tracking-widest uppercase">
              {isExpired ? (
                <span className="text-red-400 flex items-center gap-2 animate-bounce">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  STATUS: TIME EXPIRED
                </span>
              ) : (
                <span className="text-emerald-400 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-400" />
                  TIME REMAINING
                </span>
              )}
            </div>

            {/* Giant Digits */}
            <div className={`font-pixel text-5xl md:text-7xl lg:text-8xl tracking-wider select-none my-2 drop-shadow-[4px_4px_0_#000] ${
              isExpired
                ? 'text-red-500'
                : round1Timer.secondsLeft <= 60 && round1Timer.isRunning
                ? 'text-amber-400'
                : 'text-[#fef08a]'
            }`}>
              {formattedTime}
            </div>

            {/* Sub-label */}
            <div className={`font-pixel text-xs md:text-base tracking-widest uppercase mt-2 font-bold ${
              isExpired ? 'text-red-300 animate-pulse' : 'text-zinc-400'
            }`}>
              {isExpired ? 'TIME UP — PLEASE SUBMIT YOUR PAPERS' : round1Timer.isRunning ? 'COUNTDOWN IN PROGRESS' : 'TIMER READY'}
            </div>
          </div>

          {/* Round Info Footer */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 text-xs font-mono text-zinc-300">
            <div className="bg-[#27272a]/80 p-2.5 border border-[#52525b]">
              <strong className="text-amber-400 block font-pixel text-[10px] mb-0.5">FORMAT</strong>
              15 Main Questions (Paper & Pen)
            </div>
            <div className="bg-[#27272a]/80 p-2.5 border border-[#52525b]">
              <strong className="text-emerald-400 block font-pixel text-[10px] mb-0.5">SCORING</strong>
              1 Mark Each (Total 15 Marks)
            </div>
            <div className="bg-[#27272a]/80 p-2.5 border border-[#52525b]">
              <strong className="text-cyan-400 block font-pixel text-[10px] mb-0.5">ADVANCEMENT</strong>
              Top 20 Qualify for The Nether
            </div>
          </div>
        </div>
      </div>
    </OverworldScene>
  );
};

export const Round1ResultsView: React.FC = () => {
  const { state } = useEvent();
  const sorted = [...state.teams].sort((a, b) => b.round1Score - a.round1Score);
  const qualified = sorted.filter(t => t.isQualifiedR2);
  const eliminated = sorted.filter(t => !t.isQualifiedR2);

  return (
    <OverworldScene>
      <div className="flex-1 flex flex-col items-center justify-between px-6 py-6 max-w-6xl mx-auto w-full">
        <div className="w-full bg-[#18181b]/95 border-4 border-[#22c55e] p-6 md:p-8 shadow-pixel-lg backdrop-blur-md flex flex-col max-h-[85vh]">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-block bg-[#22c55e] text-black font-pixel text-xs px-4 py-1 mb-2 font-bold uppercase shadow-pixel-sm">
              Round 1 Completed
            </div>
            <h2 className="font-pixel text-2xl md:text-3xl text-white drop-shadow-[3px_3px_0_#000] uppercase">
              THE OVERWORLD QUALIFIERS (30 → 20)
            </h2>
            <p className="font-pixel text-xs md:text-sm text-[#4ade80] mt-1 uppercase">
              {qualified.length} Teams Advancing to The Nether • Scores Reset to 0 for Round 2
            </p>
          </div>

          {/* Qualifiers Grid (Top 20) */}
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-4">
            <div>
              <div className="font-pixel text-xs text-amber-400 uppercase mb-2 flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-emerald-400 inline-block" />
                Qualified Teams ({qualified.length}/20):
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                {qualified.map((team, idx) => (
                  <div
                    key={team.id}
                    className="bg-[#27272a] border-2 border-[#4ade80] p-3 flex items-center justify-between shadow-pixel"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="font-pixel text-[10px] bg-[#4ade80] text-black w-5 h-5 flex items-center justify-center font-bold flex-shrink-0">
                        {idx + 1}
                      </span>
                      <span className="font-sans font-bold text-white text-sm truncate">
                        {team.name}
                      </span>
                    </div>
                    <span className="font-mono text-xs text-[#fef08a] font-bold flex-shrink-0 ml-2">
                      {team.round1Score}/15
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Eliminated Teams */}
            {eliminated.length > 0 && (
              <div className="border-t border-zinc-800 pt-3">
                <div className="font-pixel text-[10px] text-zinc-500 uppercase mb-2">
                  Not Qualified ({eliminated.length} Teams):
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 opacity-50">
                  {eliminated.map((team) => (
                    <div
                      key={team.id}
                      className="bg-[#18181b] border border-zinc-700 p-2 flex items-center justify-between text-xs"
                    >
                      <span className="font-sans text-zinc-400 truncate">{team.name}</span>
                      <span className="font-mono text-zinc-500 text-[11px]">{team.round1Score}/15</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </OverworldScene>
  );
};
