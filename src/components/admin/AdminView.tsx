import React, { useState } from 'react';
import { useEvent } from '../../context/EventContext';
import { Round } from '../../types';
import { Round2WagerTab } from './tabs/Round2WagerTab';
import { TeamsTab } from './tabs/TeamsTab';
import { Round3ControlTab } from './tabs/Round3ControlTab';
import { QuestionBanksTab } from './tabs/QuestionBanksTab';
import { SettingsTab } from './tabs/SettingsTab';
import { ProjectorView } from '../projector/ProjectorView';
import {
  Monitor,
  Trophy,
  Flame,
  TreePine,
  Sparkles,
  ShieldAlert,
  HelpCircle,
  Cpu,
  Layers,
  Users,
  BookOpen,
  Settings,
  Eye,
  EyeOff,
  Volume2,
  VolumeX,
  X
} from 'lucide-react';

type AdminTab = 'wager' | 'finals' | 'teams' | 'banks' | 'settings';

export const AdminView: React.FC = () => {
  const {
    state,
    setCurrentRound,
    activateTieBreaker,
    exitTieBreaker,
    setWinner,
    toggleMute
  } = useEvent();

  const [activeTab, setActiveTab] = useState<AdminTab>('wager');
  const [showLivePreview, setShowLivePreview] = useState(false);
  const [winnerModalOpen, setWinnerModalOpen] = useState(false);

  const { currentRound, activeTieBreaker, teams } = state;

  const handleLaunchProjector = () => {
    window.open('/#/projector', '_blank', 'width=1280,height=720,menubar=no,toolbar=no');
  };

  const navRounds: { id: Round; label: string; icon: any; color: string }[] = [
    { id: 'HOME', label: 'R1 Overworld (Timer)', icon: TreePine, color: 'text-emerald-400' },
    { id: 'ROUND_1_RESULTS', label: 'R1 Qualifiers (Top 20)', icon: Layers, color: 'text-emerald-300' },
    { id: 'ROUND_2', label: 'R2 Nether Intro', icon: Flame, color: 'text-red-400' },
    { id: 'ROUND_2_WAGER', label: 'R2 Wager Screen', icon: Flame, color: 'text-amber-400' },
    { id: 'ROUND_2_SCOREBOARD', label: 'R2 Scoreboard', icon: Trophy, color: 'text-amber-300' },
    { id: 'ROUND_3_FINALISTS', label: 'R3 Finalists (Top 10)', icon: Sparkles, color: 'text-purple-400' },
    { id: 'ROUND_3_QUESTION', label: 'R3 Finals Buzzer', icon: HelpCircle, color: 'text-fuchsia-400' },
    { id: 'ROUND_3_SCOREBOARD', label: 'R3 Scoreboard', icon: Trophy, color: 'text-purple-300' },
    { id: 'WINNER', label: 'Champion Screen', icon: Trophy, color: 'text-yellow-400' },
  ];

  return (
    <div className="min-h-screen bg-[#111215] text-white flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* TOP MASTER HEADER */}
      <header className="bg-[#18181b] border-b-2 border-[#3f3f46] px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-40 shadow-pixel-sm">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-emerald-500 border border-emerald-300 shadow-pixel-sm" />
            <h1 className="font-pixel text-base md:text-lg text-[#fef08a] uppercase tracking-wider">
              CRAFT<span className="text-[#38bdf8]">.exe</span>
            </h1>
          </div>
          <span className="text-zinc-600">|</span>
          <span className="font-pixel text-[11px] text-zinc-400 uppercase tracking-wide">
            Quizmaster Control Console • 30 → 20 → 10 → 1
          </span>
        </div>

        {/* Action Header Tools */}
        <div className="flex items-center gap-3">
          {/* Mute toggle */}
          <button
            onClick={toggleMute}
            className="p-2 bg-[#27272a] hover:bg-zinc-700 border border-zinc-600 text-zinc-300 shadow-pixel-sm"
            title={state.soundMuted ? 'Unmute SFX' : 'Mute SFX'}
          >
            {state.soundMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Toggle Live Mini-Preview */}
          <button
            onClick={() => setShowLivePreview(!showLivePreview)}
            className={`font-pixel text-xs px-3 py-2 border shadow-pixel-sm flex items-center gap-1.5 transition-all ${
              showLivePreview
                ? 'bg-amber-950 border-amber-500 text-amber-300'
                : 'bg-[#27272a] hover:bg-zinc-700 border-zinc-600 text-zinc-300'
            }`}
          >
            {showLivePreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            {showLivePreview ? 'Hide Monitor' : 'Projector Monitor'}
          </button>

          {/* Launch Projector in New Window */}
          <button
            onClick={handleLaunchProjector}
            className="bg-emerald-600 hover:bg-emerald-500 text-black font-pixel text-xs px-4 py-2 font-bold shadow-pixel-sm flex items-center gap-1.5 transition-all"
          >
            <Monitor className="w-4 h-4" />
            OPEN PROJECTOR
          </button>

          {/* Declare Winner Button */}
          <button
            onClick={() => setWinnerModalOpen(true)}
            className="bg-amber-500 hover:bg-amber-400 text-black font-pixel text-xs px-3 py-2 font-bold shadow-pixel-sm flex items-center gap-1.5"
          >
            <Trophy className="w-4 h-4" />
            CROWN WINNER
          </button>
        </div>
      </header>

      {/* TIE-BREAKER ISOLATED ALERT BANNER */}
      {activeTieBreaker !== 'NONE' && (
        <div className="bg-red-600 text-white px-6 py-3 flex items-center justify-between shadow-pixel-lg border-b-2 border-yellow-300 animate-pulse">
          <div className="flex items-center gap-3 font-pixel text-xs md:text-sm uppercase">
            <ShieldAlert className="w-5 h-5 text-yellow-300" />
            <span>
              TIE-BREAKER CURRENTLY ACTIVE ON PROJECTOR: [{activeTieBreaker.replace(/_/g, ' ')}]
            </span>
          </div>

          <button
            onClick={exitTieBreaker}
            className="bg-black hover:bg-zinc-900 text-yellow-300 font-pixel text-xs px-5 py-2 border-2 border-yellow-300 shadow-pixel-sm"
          >
            EXIT TIE-BREAKER (RETURN)
          </button>
        </div>
      )}

      {/* QUICK EVENT ROUND NAVIGATION BAR */}
      <div className="bg-[#1c1d22] border-b border-zinc-800 px-6 py-2 flex items-center gap-2 overflow-x-auto custom-scrollbar">
        <span className="font-pixel text-[10px] text-zinc-400 uppercase mr-1 whitespace-nowrap">
          Projector Screen:
        </span>
        {navRounds.map((r) => {
          const Icon = r.icon;
          const isActive = currentRound === r.id && activeTieBreaker === 'NONE';

          return (
            <button
              key={r.id}
              onClick={() => setCurrentRound(r.id)}
              className={`font-pixel text-[10px] px-3 py-1.5 border shadow-pixel-sm flex items-center gap-1.5 whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-zinc-800 border-amber-400 text-white font-bold'
                  : 'bg-[#111215] border-zinc-700 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${r.color}`} />
              {r.label}
            </button>
          );
        })}
      </div>

      {/* ISOLATED TIE-BREAKER ACTIVATION BAR */}
      <div className="bg-[#141518] border-b border-zinc-800 px-6 py-2 flex flex-wrap items-center justify-between gap-2">
        <span className="font-pixel text-[10px] text-red-400 uppercase flex items-center gap-1.5">
          <ShieldAlert className="w-3.5 h-3.5" /> Manual Sudden-Death Tie-Breakers:
        </span>

        <div className="flex flex-wrap items-center gap-2">
          {/* R1 Tie-Breaker */}
          <button
            onClick={() => activateTieBreaker('ROUND_1_TIEBREAKER')}
            className={`font-pixel text-[9px] px-3 py-1 border shadow-pixel-sm flex items-center gap-1 ${
              activeTieBreaker === 'ROUND_1_TIEBREAKER'
                ? 'bg-emerald-600 text-black font-bold border-white'
                : 'bg-[#1e293b] text-emerald-300 border-emerald-700 hover:bg-emerald-950'
            }`}
          >
            <TreePine className="w-3 h-3" />
            ACTIVATE R1 TIE-BREAKER (5 TIE + 2 EMG)
          </button>

          {/* R2 Tie-Breaker */}
          <button
            onClick={() => activateTieBreaker('ROUND_2_TIEBREAKER')}
            className={`font-pixel text-[9px] px-3 py-1 border shadow-pixel-sm flex items-center gap-1 ${
              activeTieBreaker === 'ROUND_2_TIEBREAKER'
                ? 'bg-red-600 text-white font-bold border-white'
                : 'bg-[#450a0a] text-red-300 border-red-700 hover:bg-red-950'
            }`}
          >
            <Flame className="w-3 h-3" />
            ACTIVATE R2 TIE-BREAKER (3 TIE + 2 EMG)
          </button>

          {/* R3 Tie-Breaker */}
          <button
            onClick={() => activateTieBreaker('ROUND_3_TIEBREAKER')}
            className={`font-pixel text-[9px] px-3 py-1 border shadow-pixel-sm flex items-center gap-1 ${
              activeTieBreaker === 'ROUND_3_TIEBREAKER'
                ? 'bg-purple-600 text-white font-bold border-white'
                : 'bg-[#3b0764] text-purple-300 border-purple-700 hover:bg-purple-950'
            }`}
          >
            <Cpu className="w-3 h-3" />
            ACTIVATE FINAL TIE-BREAKER (ARCH)
          </button>
        </div>
      </div>

      {/* MAIN TAB SELECTOR BAR */}
      <div className="bg-[#18181b] border-b-2 border-[#3f3f46] px-6 flex items-center gap-2 overflow-x-auto">
        {[
          { id: 'wager', label: 'Round 2 Wager (20→10)', icon: Flame },
          { id: 'teams', label: `Teams & R1 Timer (${teams.length})`, icon: Users },
          { id: 'finals', label: 'Round 3 Finals Buzzer', icon: Layers },
          { id: 'banks', label: 'Question Banks (R1/R2/R3)', icon: BookOpen },
          { id: 'settings', label: 'Settings & Data', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as AdminTab)}
              className={`font-pixel text-xs py-3 px-5 border-b-2 flex items-center gap-2 transition-all ${
                isSelected
                  ? 'border-amber-400 text-amber-400 bg-[#27272a]'
                  : 'border-transparent text-zinc-400 hover:text-zinc-200 hover:bg-[#202227]'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT CONTAINER */}
      <main className="flex-1 p-6 max-w-7xl mx-auto w-full">
        {activeTab === 'wager' && <Round2WagerTab />}
        {activeTab === 'teams' && <TeamsTab />}
        {activeTab === 'finals' && <Round3ControlTab />}
        {activeTab === 'banks' && <QuestionBanksTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </main>

      {/* EMBEDDED PROJECTOR MINI-PREVIEW (PICTURE-IN-PICTURE) */}
      {showLivePreview && (
        <div className="fixed bottom-6 right-6 z-50 w-[420px] aspect-video bg-black border-4 border-amber-400 shadow-pixel-glow-gold flex flex-col overflow-hidden">
          <div className="bg-[#18181b] border-b-2 border-zinc-700 px-3 py-1.5 flex items-center justify-between text-xs">
            <span className="font-pixel text-[9px] text-amber-400 uppercase flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              LIVE PROJECTOR PREVIEW
            </span>
            <button
              onClick={() => setShowLivePreview(false)}
              className="text-zinc-400 hover:text-white font-mono"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex-1 relative overflow-hidden pointer-events-none scale-75 origin-top-left w-[133.33%] h-[133.33%]">
            <ProjectorView />
          </div>
        </div>
      )}

      {/* CROWN WINNER MODAL */}
      {winnerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#18181b] border-4 border-amber-400 p-6 max-w-md w-full shadow-pixel-lg">
            <div className="flex items-center justify-between border-b border-zinc-700 pb-3 mb-4">
              <h3 className="font-pixel text-sm text-amber-400 uppercase flex items-center gap-2">
                <Trophy className="w-4 h-4" /> Crown Event Champion
              </h3>
              <button
                onClick={() => setWinnerModalOpen(false)}
                className="font-pixel text-xs bg-zinc-800 text-zinc-400 hover:text-white px-2 py-1"
              >
                X
              </button>
            </div>

            <p className="font-sans text-xs text-zinc-300 mb-4">
              Choose the winning team to trigger the dramatic Ender Dragon victory ceremony on the projector screen:
            </p>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {teams.filter(t => t.isFinalistR3).map((team) => (
                <button
                  key={team.id}
                  onClick={() => {
                    setWinner(team.id);
                    setWinnerModalOpen(false);
                  }}
                  className="w-full bg-[#111215] hover:bg-[#2e1065] border border-zinc-700 hover:border-amber-400 p-3 text-left flex items-center justify-between transition-all"
                >
                  <span className="font-sans font-bold text-white text-sm">
                    {team.name}
                  </span>
                  <span className="font-pixel text-xs text-amber-400">
                    {Number(team.score).toFixed(2)} PTS
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
