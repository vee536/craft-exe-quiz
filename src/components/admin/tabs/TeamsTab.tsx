import React, { useState } from 'react';
import { useEvent } from '../../../context/EventContext';
import { Team } from '../../../types';
import {
  UserPlus,
  Trash2,
  Edit2,
  Check,
  X,
  Flame,
  Sparkles,
  ArrowUpDown,
  RotateCcw,
  Clock,
  Play,
  Pause,
  ShieldAlert,
  CheckCircle,
  Calculator
} from 'lucide-react';

export const TeamsTab: React.FC = () => {
  const {
    state,
    addTeam,
    updateTeam,
    deleteTeam,
    adjustScore,
    setDirectScore,
    setRound1Score,
    toggleQualifiedR2,
    toggleFinalistR3,
    autoQualifyTop20R1,
    autoQualifyTop10R2,
    normalizeRound3Scores,
    startRound1Timer,
    pauseRound1Timer,
    resetRound1Timer,
    setRound1TimerDuration,
    activateTieBreaker
  } = useEvent();

  const [newTeamName, setNewTeamName] = useState('');
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [bulkInput, setBulkInput] = useState('');
  const [showBulkAdd, setShowBulkAdd] = useState(false);
  const [sortBy, setSortBy] = useState<'r1' | 'r2' | 'score' | 'name' | 'default'>('r1');

  // Timer custom input
  const [timerMinutes, setTimerMinutes] = useState(15);
  const [timerSeconds, setTimerSeconds] = useState(0);

  const handleAddSingle = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTeamName.trim()) {
      addTeam(newTeamName.trim());
      setNewTeamName('');
    }
  };

  const handleBulkAdd = () => {
    const lines = bulkInput.split('\n');
    lines.forEach(line => {
      const trimmed = line.trim();
      if (trimmed) {
        addTeam(trimmed);
      }
    });
    setBulkInput('');
    setShowBulkAdd(false);
  };

  const startEdit = (team: Team) => {
    setEditingTeamId(team.id);
    setEditingName(team.name);
  };

  const saveEdit = (id: string) => {
    if (editingName.trim()) {
      updateTeam(id, { name: editingName.trim() });
    }
    setEditingTeamId(null);
  };

  const cancelEdit = () => {
    setEditingTeamId(null);
    setEditingName('');
  };

  const handleSetTimerDuration = () => {
    const totalSecs = Math.max(10, timerMinutes * 60 + timerSeconds);
    setRound1TimerDuration(totalSecs);
  };

  // Sort logic
  const displayedTeams = [...state.teams].sort((a, b) => {
    if (sortBy === 'r1') return b.round1Score - a.round1Score;
    if (sortBy === 'r2') return b.round2Score - a.round2Score;
    if (sortBy === 'score') return b.score - a.score;
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    return 0;
  });

  const qualifiedCount = state.teams.filter(t => t.isQualifiedR2).length;
  const finalistsCount = state.teams.filter(t => t.isFinalistR3).length;

  // Check for R1 tie at 20th position
  const sortedR1 = [...state.teams].sort((a, b) => b.round1Score - a.round1Score);
  const twentiethScore = sortedR1[19]?.round1Score;
  const twentyFirstScore = sortedR1[20]?.round1Score;
  const hasR1Tie = twentiethScore !== undefined && twentyFirstScore !== undefined && twentiethScore === twentyFirstScore;

  // Check for R2 tie at 10th position
  const sortedR2 = state.teams.filter(t => t.isQualifiedR2).sort((a, b) => b.round2Score - a.round2Score);
  const tenthScore = sortedR2[9]?.round2Score;
  const eleventhScore = sortedR2[10]?.round2Score;
  const hasR2Tie = tenthScore !== undefined && eleventhScore !== undefined && tenthScore === eleventhScore;

  // Timer formatted
  const tMins = Math.floor(state.round1Timer.secondsLeft / 60);
  const tSecs = state.round1Timer.secondsLeft % 60;
  const timerDisplay = `${String(tMins).padStart(2, '0')}:${String(tSecs).padStart(2, '0')}`;

  return (
    <div className="space-y-6">
      {/* ROUND 1 COUNTDOWN TIMER CONTROLLER */}
      <div className="bg-[#18181b] border-2 border-emerald-500/80 p-6 shadow-pixel">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#3f3f46] pb-4 mb-4">
          <div className="flex items-center gap-3">
            <Clock className="w-6 h-6 text-emerald-400" />
            <div>
              <h2 className="font-pixel text-base text-white uppercase">
                ROUND 1 OVERWORLD COUNTDOWN TIMER
              </h2>
              <p className="font-sans text-xs text-zinc-400">
                Syncs live to the contestant-facing Overworld screen (15:00 → 00:00 TIME UP).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-zinc-400">Time Left:</span>
            <div className={`font-pixel text-2xl md:text-3xl font-bold px-4 py-1.5 border ${
              state.round1Timer.isExpired
                ? 'bg-red-950 border-red-500 text-red-400 animate-pulse'
                : state.round1Timer.isRunning
                ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                : 'bg-[#111215] border-zinc-700 text-zinc-300'
            }`}>
              {timerDisplay}
            </div>
            {state.round1Timer.isExpired && (
              <span className="font-pixel text-xs bg-red-600 text-white px-2 py-1">
                TIME UP!
              </span>
            )}
          </div>
        </div>

        {/* Timer Controls & Presets */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {state.round1Timer.isRunning ? (
              <button
                onClick={pauseRound1Timer}
                className="bg-amber-600 hover:bg-amber-500 text-black font-pixel text-xs px-5 py-2.5 font-bold shadow-pixel-sm flex items-center gap-1.5"
              >
                <Pause className="w-4 h-4" /> PAUSE TIMER
              </button>
            ) : (
              <button
                onClick={startRound1Timer}
                className="bg-emerald-600 hover:bg-emerald-500 text-black font-pixel text-xs px-5 py-2.5 font-bold shadow-pixel-sm flex items-center gap-1.5"
              >
                <Play className="w-4 h-4" /> START TIMER
              </button>
            )}

            <button
              onClick={() => resetRound1Timer(false)}
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-pixel text-xs px-4 py-2.5 border border-zinc-600 shadow-pixel-sm flex items-center gap-1.5"
              title="Reset timer to duration"
            >
              <RotateCcw className="w-3.5 h-3.5" /> RESET
            </button>

            {/* Quick Presets */}
            <div className="flex items-center gap-1 ml-auto font-mono text-xs">
              <span className="text-zinc-500">Presets:</span>
              {[10, 15, 20, 25, 30].map(mins => (
                <button
                  key={mins}
                  onClick={() => setRound1TimerDuration(mins * 60)}
                  className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 px-2 py-1"
                >
                  {mins}m
                </button>
              ))}
            </div>
          </div>

          {/* Custom Duration Input */}
          <div className="flex items-center gap-2 font-mono text-xs justify-end">
            <span className="text-zinc-400">Custom Duration:</span>
            <input
              type="number"
              min="0"
              max="99"
              value={timerMinutes}
              onChange={(e) => setTimerMinutes(parseInt(e.target.value) || 0)}
              className="w-14 bg-[#111215] border border-zinc-700 px-2 py-1.5 text-center text-white"
            />
            <span className="text-zinc-500">min</span>
            <input
              type="number"
              min="0"
              max="59"
              value={timerSeconds}
              onChange={(e) => setTimerSeconds(parseInt(e.target.value) || 0)}
              className="w-14 bg-[#111215] border border-zinc-700 px-2 py-1.5 text-center text-white"
            />
            <span className="text-zinc-500">sec</span>
            <button
              onClick={handleSetTimerDuration}
              className="bg-zinc-800 hover:bg-zinc-700 text-amber-400 px-3 py-1.5 border border-zinc-600 font-pixel text-[10px]"
            >
              SET
            </button>
          </div>
        </div>
      </div>

      {/* WORKFLOW AUTOMATION & TIE ALERTS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Step 1: Auto-Qualify Top 20 */}
        <div className={`p-4 border-2 shadow-pixel flex flex-col justify-between ${
          hasR1Tie ? 'bg-amber-950/40 border-amber-500' : 'bg-[#18181b] border-zinc-700'
        }`}>
          <div>
            <div className="font-pixel text-xs text-emerald-400 uppercase mb-1">
              ROUND 1 → ROUND 2 (30 → 20)
            </div>
            <p className="font-sans text-xs text-zinc-400 mb-3">
              Ranks teams by Round 1 score (0–15). Marks do NOT carry to Round 2.
            </p>
            {hasR1Tie && (
              <div className="p-2 bg-red-950/80 border border-red-500 text-red-300 font-mono text-[11px] mb-3 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                Tie at 20th place ({twentiethScore} marks)! Run tie-breaker.
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={autoQualifyTop20R1}
              className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-black font-pixel text-[10px] py-2 font-bold shadow-pixel-sm flex items-center justify-center gap-1"
            >
              <CheckCircle className="w-3.5 h-3.5" /> Auto-Select Top 20
            </button>
            {hasR1Tie && (
              <button
                onClick={() => activateTieBreaker('ROUND_1_TIEBREAKER')}
                className="bg-red-600 hover:bg-red-500 text-white font-pixel text-[9px] px-2 py-2"
                title="Activate Round 1 Tie-Breaker (IT Riddles)"
              >
                Tie-Breaker
              </button>
            )}
          </div>
        </div>

        {/* Step 2: Auto-Qualify Top 10 */}
        <div className={`p-4 border-2 shadow-pixel flex flex-col justify-between ${
          hasR2Tie ? 'bg-red-950/40 border-red-500' : 'bg-[#18181b] border-zinc-700'
        }`}>
          <div>
            <div className="font-pixel text-xs text-red-400 uppercase mb-1">
              ROUND 2 → ROUND 3 (20 → 10)
            </div>
            <p className="font-sans text-xs text-zinc-400 mb-3">
              Ranks 20 teams by cumulative Round 2 wager scores.
            </p>
            {hasR2Tie && (
              <div className="p-2 bg-red-950/80 border border-red-500 text-red-300 font-mono text-[11px] mb-3 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                Tie at 10th qualifier ({tenthScore} pts)! Run sudden-death.
              </div>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={autoQualifyTop10R2}
              className="flex-1 bg-red-600 hover:bg-red-500 text-white font-pixel text-[10px] py-2 font-bold shadow-pixel-sm flex items-center justify-center gap-1"
            >
              <CheckCircle className="w-3.5 h-3.5" /> Auto-Select Top 10
            </button>
            {hasR2Tie && (
              <button
                onClick={() => activateTieBreaker('ROUND_2_TIEBREAKER')}
                className="bg-amber-600 hover:bg-amber-500 text-black font-pixel text-[9px] px-2 py-2"
                title="Activate Round 2 Tie-Breaker (Cybersecurity)"
              >
                Tie-Breaker
              </button>
            )}
          </div>
        </div>

        {/* Step 3: Round 3 Normalization */}
        <div className="p-4 bg-[#18181b] border-2 border-purple-500/80 shadow-pixel flex flex-col justify-between">
          <div>
            <div className="font-pixel text-xs text-purple-400 uppercase mb-1">
              ROUND 3 SCORE NORMALIZATION
            </div>
            <p className="font-sans text-xs text-zinc-400 mb-3">
              Highest R2 score = 100.00. Proportional score for all finalists (to 2 decimal places).
            </p>
          </div>
          <button
            onClick={normalizeRound3Scores}
            className="w-full bg-purple-600 hover:bg-purple-500 text-white font-pixel text-[10px] py-2 font-bold shadow-pixel-sm flex items-center justify-center gap-1.5"
          >
            <Calculator className="w-3.5 h-3.5" /> Normalize R3 Starting Scores
          </button>
        </div>
      </div>

      {/* TEAM CREATION & SORT BAR */}
      <div className="bg-[#18181b] border-2 border-[#3f3f46] p-5 shadow-pixel">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#3f3f46] pb-3 mb-3">
          <div className="flex items-center gap-3">
            <div className="bg-[#27272a] border border-[#52525b] px-3 py-1 font-mono text-xs text-zinc-300">
              Total Teams: <strong className="text-white">{state.teams.length}</strong>
            </div>
            <div className="bg-[#2a0808] border border-red-500/50 px-3 py-1 font-mono text-xs text-red-300 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              R2 Qualifiers: <strong className="text-amber-400">{qualifiedCount}/20</strong>
            </div>
            <div className="bg-[#1e1035] border border-purple-500/50 px-3 py-1 font-mono text-xs text-purple-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              R3 Finalists: <strong className="text-purple-300">{finalistsCount}/10</strong>
            </div>
          </div>

          <div className="flex items-center gap-1 font-mono text-xs">
            <span className="text-zinc-400 flex items-center gap-1">
              <ArrowUpDown className="w-3.5 h-3.5" /> Sort:
            </span>
            <button
              onClick={() => setSortBy('r1')}
              className={`px-2 py-1 border ${sortBy === 'r1' ? 'bg-zinc-700 border-zinc-400 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-400'}`}
            >
              R1 Marks
            </button>
            <button
              onClick={() => setSortBy('r2')}
              className={`px-2 py-1 border ${sortBy === 'r2' ? 'bg-zinc-700 border-zinc-400 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-400'}`}
            >
              R2 Score
            </button>
            <button
              onClick={() => setSortBy('score')}
              className={`px-2 py-1 border ${sortBy === 'score' ? 'bg-zinc-700 border-zinc-400 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-400'}`}
            >
              Active Score
            </button>
            <button
              onClick={() => setSortBy('name')}
              className={`px-2 py-1 border ${sortBy === 'name' ? 'bg-zinc-700 border-zinc-400 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-400'}`}
            >
              Name
            </button>
          </div>
        </div>

        {/* Add Team Input */}
        <div className="flex flex-wrap items-center gap-2">
          <form onSubmit={handleAddSingle} className="flex-1 flex gap-2 min-w-[280px]">
            <input
              type="text"
              placeholder="Enter new team name..."
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              className="flex-1 bg-[#111215] border border-[#52525b] px-4 py-2 text-white font-sans text-xs focus:border-amber-400 focus:outline-none"
            />
            <button
              type="submit"
              className="bg-amber-500 hover:bg-amber-400 text-black font-pixel text-xs px-4 py-2 font-bold shadow-pixel-sm flex items-center gap-1"
            >
              <UserPlus className="w-3.5 h-3.5" /> ADD
            </button>
          </form>

          <button
            onClick={() => setShowBulkAdd(!showBulkAdd)}
            className="bg-[#27272a] hover:bg-zinc-700 text-zinc-300 font-pixel text-xs px-3 py-2 border border-[#52525b]"
          >
            {showBulkAdd ? 'Close Batch' : 'Batch / Paste Teams'}
          </button>
        </div>

        {showBulkAdd && (
          <div className="mt-3 p-3 bg-[#111215] border border-amber-500/50">
            <textarea
              rows={3}
              placeholder="Paste one team per line..."
              value={bulkInput}
              onChange={(e) => setBulkInput(e.target.value)}
              className="w-full bg-[#18181b] border border-[#52525b] p-2 text-white font-mono text-xs focus:outline-none"
            />
            <div className="flex justify-end gap-2 mt-2">
              <button onClick={() => setShowBulkAdd(false)} className="text-zinc-400 font-pixel text-xs px-2">Cancel</button>
              <button onClick={handleBulkAdd} className="bg-amber-500 text-black font-pixel text-xs px-3 py-1 font-bold">Add All</button>
            </div>
          </div>
        )}
      </div>

      {/* ALL 30 TEAMS TABLE */}
      <div className="bg-[#18181b] border-2 border-[#3f3f46] p-5 shadow-pixel overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-[#3f3f46] font-pixel text-[10px] text-zinc-400 uppercase">
              <th className="py-2.5 px-3">#</th>
              <th className="py-2.5 px-3">Team Name</th>
              <th className="py-2.5 px-3 text-center">R1 Marks (0-15)</th>
              <th className="py-2.5 px-3 text-center">R2 Qualify 🔥</th>
              <th className="py-2.5 px-3 text-center">R2 Score</th>
              <th className="py-2.5 px-3 text-center">DOUBLE</th>
              <th className="py-2.5 px-3 text-center">R3 Finalist 🐉</th>
              <th className="py-2.5 px-3 text-center">R3 Starting</th>
              <th className="py-2.5 px-3 text-center">Active Score</th>
              <th className="py-2.5 px-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800 font-sans text-xs">
            {displayedTeams.map((team, idx) => {
              const isEditing = editingTeamId === team.id;

              return (
                <tr
                  key={team.id}
                  className={`hover:bg-[#202227] transition-colors ${
                    !team.isQualifiedR2 ? 'opacity-60' : ''
                  }`}
                >
                  <td className="py-2.5 px-3 font-mono text-zinc-500">{idx + 1}</td>

                  {/* Name */}
                  <td className="py-2.5 px-3 font-bold text-white text-sm">
                    {isEditing ? (
                      <div className="flex items-center gap-1">
                        <input
                          type="text"
                          value={editingName}
                          onChange={(e) => setEditingName(e.target.value)}
                          className="bg-black border border-amber-400 px-2 py-0.5 text-white text-xs focus:outline-none"
                          autoFocus
                        />
                        <button onClick={() => saveEdit(team.id)} className="text-emerald-400"><Check className="w-3.5 h-3.5" /></button>
                        <button onClick={cancelEdit} className="text-red-400"><X className="w-3.5 h-3.5" /></button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span>{team.name}</span>
                        <button onClick={() => startEdit(team)} className="opacity-30 hover:opacity-100 text-zinc-400">
                          <Edit2 className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </td>

                  {/* R1 Marks (0 - 15) */}
                  <td className="py-2.5 px-3 text-center">
                    <input
                      type="number"
                      min="0"
                      max="15"
                      value={team.round1Score}
                      onChange={(e) => setRound1Score(team.id, parseInt(e.target.value) || 0)}
                      className="w-14 bg-[#111215] border border-zinc-700 px-1 py-0.5 text-center font-mono text-white text-xs font-bold"
                    />
                  </td>

                  {/* R2 Qualify Checkbox */}
                  <td className="py-2.5 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={team.isQualifiedR2}
                      onChange={() => toggleQualifiedR2(team.id)}
                      className="w-4 h-4 accent-red-600 cursor-pointer"
                    />
                  </td>

                  {/* R2 Score */}
                  <td className="py-2.5 px-3 text-center font-pixel text-xs text-[#fef08a]">
                    {team.round2Score}
                  </td>

                  {/* Round 2 one-time DOUBLE status */}
                  <td className="py-2.5 px-3 text-center">
                    <span className={`font-pixel text-[9px] ${team.blazeRodUsed ? 'text-zinc-500' : 'text-emerald-400'}`}>
                      {team.blazeRodUsed ? 'USED' : 'AVAILABLE'}
                    </span>
                  </td>

                  {/* R3 Finalist Checkbox */}
                  <td className="py-2.5 px-3 text-center">
                    <input
                      type="checkbox"
                      checked={team.isFinalistR3}
                      onChange={() => toggleFinalistR3(team.id)}
                      className="w-4 h-4 accent-purple-600 cursor-pointer"
                    />
                  </td>

                  {/* R3 Starting Score */}
                  <td className="py-2.5 px-3 text-center font-mono text-xs text-purple-300">
                    {team.round3StartingScore > 0 ? Number(team.round3StartingScore).toFixed(2) : '-'}
                  </td>

                  {/* Active Score Direct Input */}
                  <td className="py-2.5 px-3 text-center">
                    <input
                      type="number"
                      step="0.01"
                      value={team.score}
                      onChange={(e) => setDirectScore(team.id, parseFloat(e.target.value) || 0)}
                      className="w-20 bg-[#111215] border border-amber-500/60 px-1 py-0.5 font-pixel text-xs text-[#fef08a] text-center"
                    />
                  </td>

                  {/* Delete */}
                  <td className="py-2.5 px-3 text-right">
                    <button
                      onClick={() => {
                        if (confirm(`Delete team "${team.name}"?`)) {
                          deleteTeam(team.id);
                        }
                      }}
                      className="text-zinc-500 hover:text-red-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
