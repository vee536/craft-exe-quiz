import React, { useState, useEffect } from 'react';
import { EventProvider } from './context/EventContext';
import { AdminView } from './components/admin/AdminView';
import { ProjectorView } from './components/projector/ProjectorView';
import { Monitor, Sliders, ExternalLink, Flame, Sparkles, TreePine } from 'lucide-react';

export const App: React.FC = () => {
  const [route, setRoute] = useState<'admin' | 'projector' | 'launcher'>(() => {
    const hash = window.location.hash.toLowerCase();
    if (hash.includes('projector')) return 'projector';
    if (hash.includes('admin')) return 'admin';
    return 'launcher';
  });

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.toLowerCase();
      if (hash.includes('projector')) {
        setRoute('projector');
      } else if (hash.includes('admin')) {
        setRoute('admin');
      } else {
        setRoute('launcher');
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const openDualMonitor = () => {
    window.open('/#/projector', '_blank', 'width=1280,height=720,menubar=no,toolbar=no');
    window.location.hash = '#/admin';
  };

  return (
    <EventProvider>
      {route === 'admin' ? (
        <AdminView />
      ) : route === 'projector' ? (
        <ProjectorView />
      ) : (
        /* Launcher Portal */
        <div className="min-h-screen bg-gradient-to-b from-[#09090b] via-[#111215] to-[#18181b] text-white flex flex-col justify-between p-6 select-none font-sans">
          {/* Header */}
          <div className="text-center pt-10">
            <div className="inline-flex items-center gap-2 bg-[#22c55e] text-black font-pixel text-xs px-4 py-1.5 uppercase font-bold tracking-widest mb-4 shadow-pixel-sm">
              Live Event Orchestration System
            </div>
            <h1 className="font-pixel text-4xl md:text-6xl text-[#fef08a] drop-shadow-[4px_4px_0_#854d0e] uppercase mb-2">
              CRAFT<span className="text-[#38bdf8]">.exe</span>
            </h1>
            <p className="font-pixel text-sm md:text-base text-zinc-300 uppercase tracking-wide">
              The Minecraft-Themed IT Quiz Event System
            </p>
          </div>

          {/* Cards for Mode Selection */}
          <div className="max-w-4xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-6 my-10">
            {/* Admin Console Card */}
            <div className="bg-[#18181b] border-4 border-[#52525b] hover:border-amber-400 p-8 shadow-pixel-lg flex flex-col justify-between transition-all group">
              <div>
                <div className="w-12 h-12 bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center mb-4 text-amber-400 shadow-pixel-sm">
                  <Sliders className="w-6 h-6" />
                </div>
                <h2 className="font-pixel text-xl text-white group-hover:text-amber-300 uppercase mb-2">
                  Admin Panel
                </h2>
                  <p className="text-zinc-400 text-sm leading-relaxed mb-6 font-sans">
                    Private quizmaster console for dynamic teams, Round 1 scoring and timer, Round 2 wagers, Round 3 finals, and question banks.
                </p>
              </div>

              <a
                href="#/admin"
                className="w-full bg-amber-500 hover:bg-amber-400 text-black font-pixel text-xs py-3 text-center font-bold shadow-pixel flex items-center justify-center gap-2"
              >
                <Sliders className="w-4 h-4" />
                OPEN ADMIN PANEL
              </a>
            </div>

            {/* Projector Presentation Card */}
            <div className="bg-[#18181b] border-4 border-[#52525b] hover:border-emerald-400 p-8 shadow-pixel-lg flex flex-col justify-between transition-all group">
              <div>
                <div className="w-12 h-12 bg-emerald-500/20 border-2 border-emerald-400 flex items-center justify-center mb-4 text-emerald-400 shadow-pixel-sm">
                  <Monitor className="w-6 h-6" />
                </div>
                <h2 className="font-pixel text-xl text-white group-hover:text-emerald-300 uppercase mb-2">
                  Projector Mode
                </h2>
                <p className="text-zinc-400 text-sm leading-relaxed mb-6 font-sans">
                  Audience-facing 16:9 presentation display. Beautiful Minecraft atmospheric visuals (Overworld, Nether, The End with Ender Dragon), big readable typography, and zero admin controls.
                </p>
              </div>

              <div className="flex flex-col gap-2">
                <a
                  href="#/projector"
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-black font-pixel text-xs py-3 text-center font-bold shadow-pixel flex items-center justify-center gap-2"
                >
                  <Monitor className="w-4 h-4" />
                  OPEN PROJECTOR MODE
                </a>

                <button
                  onClick={openDualMonitor}
                  className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-pixel text-[10px] py-2 text-center border border-zinc-600 flex items-center justify-center gap-1.5"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-amber-400" />
                  Launch Both (Admin + Projector Window)
                </button>
              </div>
            </div>
          </div>

          {/* Three Dimensions Footer Badges */}
          <div className="max-w-4xl mx-auto w-full flex flex-wrap items-center justify-center gap-6 py-4 border-t border-zinc-800 text-xs font-pixel text-zinc-400">
            <span className="flex items-center gap-1 text-emerald-400">
              <TreePine className="w-3.5 h-3.5" /> ROUND 1: THE OVERWORLD
            </span>
            <span>•</span>
              <span className="flex items-center gap-1 text-red-400">
                <Flame className="w-3.5 h-3.5" /> ROUND 2: THE NETHER (WAGER ROUND)
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-purple-400">
              <Sparkles className="w-3.5 h-3.5" /> ROUND 3: THE END (FINALS)
            </span>
          </div>
        </div>
      )}
    </EventProvider>
  );
};
