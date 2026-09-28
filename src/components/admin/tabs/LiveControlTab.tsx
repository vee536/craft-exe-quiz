import React from 'react';
import { useEvent } from '../../../context/EventContext';
import { BlazeRodIcon } from '../../common/BlazeRodIcon';
import {
  Play,
  Pause,
  RotateCcw,
  Eye,
  EyeOff,
  ShieldAlert,
  Flame,
  CheckCircle,
  XCircle,
  Clock,
  ArrowRight,
  UserCheck
} from 'lucide-react';

export const LiveControlTab: React.FC = () => {
  const {
    state,
    closeActiveQuestion,
    toggleAnswerReveal,
    toggleStealBuzzer,
    awardActiveQuestionScore,
    toggleTimerEnabled,
    setDefaultTimerDuration,
    startTimer,
    pauseTimer,
    resetTimer,
    adjustTimerSeconds,
    useBlazeRod,
    setManualTurn,
    getNextFairTeam
  } = useEvent();

  const { activeQuestion, teams, currentRound } = state;
  const q = activeQuestion.question;
  const selectingTeam = teams.find(t => t.id === activeQuestion.selectingTeamId);
  const fairTeam = getNextFairTeam();

  // Eligible teams based on round
  const eligibleTeams = teams.filter(t => {
    if (currentRound.startsWith('ROUND_3')) return t.isFinalistR3;
    return t.isQualifiedR2;
  });

  return (
    <div className="space-y-6">
      {/* ACTIVE QUESTION CONTROLLER CARD */}
      <div className="bg-[#18181b] border-2 border-[#3f3f46] p-6 shadow-pixel">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#3f3f46] pb-4 mb-4">
          <div className="flex items-center gap-3">
            <span className="font-pixel text-xs bg-amber-500 text-black px-3 py-1 font-bold">
              ACTIVE QUESTION
            </span>
            <h3 className="font-pixel text-sm md:text-base text-white">
              {q ? `${q.category} — ${q.points} PTS` : 'No Question Open on Projector'}
            </h3>
          </div>

          {q && (
            <button
              onClick={closeActiveQuestion}
              className="bg-[#27272a] hover:bg-zinc-700 text-zinc-300 font-pixel text-xs px-4 py-2 border border-[#52525b] shadow-pixel-sm transition-colors flex items-center gap-2"
            >
              <ArrowRight className="w-4 h-4 text-amber-400" />
              Close / Return to Board
            </button>
          )}
        </div>

        {q ? (
          <div className="space-y-6">
            {/* Question Info Box */}
            <div className="bg-[#111215] border border-zinc-700 p-4">
              <div className="text-zinc-400 font-mono text-xs mb-1">
                Question ({q.difficulty} difficulty):
              </div>
              <p className="font-sans font-bold text-lg text-white mb-3">
                {q.questionText}
              </p>

              {q.codeSnippet && (
                <pre className="bg-black p-3 text-xs font-mono text-emerald-400 border border-zinc-800 rounded mb-3 overflow-x-auto whitespace-pre">
                  {q.codeSnippet}
                </pre>
              )}

              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-zinc-800 pt-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-zinc-400">Answer:</span>
                  <span className={`font-sans font-bold text-sm ${activeQuestion.isAnswerRevealed ? 'text-emerald-400' : 'text-zinc-500 italic'}`}>
                    {activeQuestion.isAnswerRevealed ? q.correctAnswer : '•••••••• Hidden from Audience'}
                  </span>
                </div>

                <button
                  onClick={toggleAnswerReveal}
                  className={`font-pixel text-xs px-3 py-1.5 border shadow-pixel-sm flex items-center gap-2 transition-all ${
                    activeQuestion.isAnswerRevealed
                      ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                      : 'bg-[#27272a] border-zinc-600 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  {activeQuestion.isAnswerRevealed ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {activeQuestion.isAnswerRevealed ? 'Hide Answer' : 'Reveal Answer to Projector'}
                </button>
              </div>
            </div>

            {/* LIVE ACTION TOOLBAR */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Steal Buzzer Button */}
              <div className="bg-[#27272a] border border-[#52525b] p-4 flex flex-col justify-between shadow-pixel-sm">
                <div>
                  <div className="font-pixel text-xs text-zinc-400 uppercase mb-1 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-red-400" />
                    Buzzer / Steal Mode
                  </div>
                  <p className="text-xs text-zinc-400 mb-3">
                    Activate if the selecting team answers incorrectly.
                  </p>
                </div>
                <button
                  onClick={toggleStealBuzzer}
                  className={`w-full py-2.5 font-pixel text-xs border shadow-pixel-sm flex items-center justify-center gap-2 transition-all ${
                    activeQuestion.isStealOpen
                      ? 'bg-red-600 border-red-400 text-white animate-pulse'
                      : 'bg-[#18181b] hover:bg-red-950/60 border-red-600 text-red-400'
                  }`}
                >
                  <ShieldAlert className="w-4 h-4" />
                  {activeQuestion.isStealOpen ? 'CLOSE BUZZER / STEAL' : 'OPEN BUZZER / STEAL'}
                </button>
              </div>

              {/* Blaze Rod Wager Button (Round 2 Only) */}
              <div className="bg-[#27272a] border border-[#52525b] p-4 flex flex-col justify-between shadow-pixel-sm">
                <div>
                  <div className="font-pixel text-xs text-zinc-400 uppercase mb-1 flex items-center gap-2">
                    <Flame className="w-4 h-4 text-amber-400" />
                    Blaze Rod 2x Wager
                  </div>
                  <p className="text-xs text-zinc-400 mb-3">
                    {selectingTeam
                      ? selectingTeam.blazeRodUsed
                        ? `${selectingTeam.name} has ALREADY USED their Blaze Rod.`
                        : `${selectingTeam.name} has Blaze Rod AVAILABLE.`
                      : 'Select a team first to activate.'}
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    <div className="border border-zinc-700 bg-[#18181b] px-3 py-2">
                      <div className="text-zinc-400">Question value</div>
                      <strong className="text-white">{q ? q.points : 0}</strong>
                    </div>
                    <div className="border border-zinc-700 bg-[#18181b] px-3 py-2">
                      <div className="text-zinc-400">Blaze Rod value</div>
                      <strong className="text-amber-400">{q ? q.points * 2 : 0}</strong>
                    </div>
                  </div>
                  <button
                    disabled={!selectingTeam || selectingTeam.blazeRodUsed}
                    onClick={() => {
                      if (selectingTeam) useBlazeRod(selectingTeam.id);
                    }}
                    className={`w-full py-2.5 font-pixel text-xs border shadow-pixel-sm flex items-center justify-center gap-1.5 transition-all ${
                      selectingTeam && !selectingTeam.blazeRodUsed
                        ? 'bg-amber-600 hover:bg-amber-500 border-amber-300 text-black font-bold'
                        : 'bg-zinc-800 border-zinc-700 text-zinc-500 cursor-not-allowed'
                    }`}
                  >
                    <Flame className="w-4 h-4" />
                    USE BLAZE ROD (2x)
                  </button>
                </div>
              </div>

              {/* Question Timer Controls */}
              <div className="bg-[#27272a] border border-[#52525b] p-4 shadow-pixel-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-pixel text-xs text-zinc-400 uppercase flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    Timer Controls
                  </div>
                  <label className="flex items-center gap-1.5 text-xs text-zinc-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={activeQuestion.isTimerEnabled}
                      onChange={(e) => toggleTimerEnabled(e.target.checked)}
                      className="accent-emerald-500"
                    />
                    <span className="font-mono">{activeQuestion.isTimerEnabled ? 'ENABLED' : 'OFF'}</span>
                  </label>
                </div>

                {activeQuestion.isTimerEnabled ? (
                  <>
                    <div className="grid grid-cols-2 gap-2 my-2">
                      <label className="font-mono text-xs text-zinc-400">
                        <span className="block mb-1">Duration (seconds)</span>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={activeQuestion.defaultTimerDuration}
                          onChange={(event) => {
                            const duration = Number(event.target.value);
                            if (Number.isFinite(duration) && duration > 0) {
                              setDefaultTimerDuration(Math.floor(duration));
                            }
                          }}
                          className="w-full bg-[#111215] border border-zinc-600 px-2 py-1.5 text-white font-mono text-sm focus:border-emerald-400 focus:outline-none"
                        />
                      </label>
                      <div className="font-mono text-xs text-zinc-400">
                        <span className="block mb-1">Seconds left</span>
                        <span className="block border border-zinc-700 bg-[#18181b] px-2 py-1.5 text-emerald-400 text-sm">
                          {activeQuestion.timerSecondsLeft}s
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 mb-2">
                      {activeQuestion.isTimerRunning ? (
                        <button
                          onClick={pauseTimer}
                          className="flex-1 bg-amber-600 hover:bg-amber-500 text-black font-pixel text-[10px] py-1.5 border border-amber-300 flex items-center justify-center gap-1"
                        >
                          <Pause className="w-3.5 h-3.5" /> PAUSE TIMER
                        </button>
                      ) : (
                        <button
                          onClick={startTimer}
                          className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-pixel text-[10px] py-1.5 border border-emerald-400 flex items-center justify-center gap-1"
                        >
                          <Play className="w-3.5 h-3.5" /> START TIMER
                        </button>
                      )}
                      <button
                        onClick={resetTimer}
                        className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-pixel text-[10px] px-2 py-1.5 border border-zinc-600 flex items-center gap-1"
                        title="Reset to default duration"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        RESET TIMER
                      </button>
                    </div>

                    {/* Presets */}
                    <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-400">
                      <span>Presets:</span>
                      {[15, 30, 45, 60].map(sec => (
                        <button
                          key={sec}
                          onClick={() => setDefaultTimerDuration(sec)}
                          className={`px-1.5 py-0.5 border ${
                            activeQuestion.defaultTimerDuration === sec
                              ? 'bg-zinc-700 border-zinc-400 text-white'
                              : 'bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-400'
                          }`}
                        >
                          {sec}s
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-xs text-zinc-500 italic py-3 text-center">
                    Untimed Question Mode (Timer bar hidden on projector)
                  </p>
                )}
              </div>
            </div>

            {/* SCORING & RESULT CONFIRMATION */}
            <div className="bg-[#111215] border-2 border-zinc-700 p-5 shadow-pixel-sm">
              <div className="font-pixel text-xs text-zinc-300 uppercase mb-3 flex items-center justify-between">
                <span>Award Points for This Question</span>
                <span className="font-mono text-amber-400 text-xs">
                  Value:{' '}
                  <strong>
                    {activeQuestion.isBlazeWagerActive ? q.points * 2 : q.points} pts
                  </strong>
                  {activeQuestion.isBlazeWagerActive && ' (2x WAGER APPLIED)'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {eligibleTeams.map((team) => {
                  const isSelecting = team.id === activeQuestion.selectingTeamId;

                  return (
                    <div
                      key={team.id}
                      className={`p-3 border flex flex-col justify-between ${
                        isSelecting
                          ? 'bg-[#2a1d0f] border-amber-500'
                          : 'bg-[#18181b] border-zinc-700'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-sans font-bold text-white text-sm">
                            {team.name}
                          </span>
                          {isSelecting && (
                            <span className="font-pixel text-[9px] bg-amber-500 text-black px-1.5 py-0.5 font-bold">
                              PICKING
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-xs text-[#fef08a]">
                          {team.score}
                        </span>
                      </div>

                      <div className="flex gap-2 mt-2">
                        {/* Correct Button */}
                        <button
                          onClick={() => awardActiveQuestionScore(team.id, true, !isSelecting)}
                          className="flex-1 bg-emerald-700 hover:bg-emerald-600 text-white font-pixel text-[10px] py-1.5 border border-emerald-400 flex items-center justify-center gap-1 shadow-pixel-sm"
                        >
                          <CheckCircle className="w-3 h-3 text-emerald-200" />
                          CORRECT {isSelecting ? '' : '(STEAL)'}
                        </button>

                        {/* Wrong / Deduct Button */}
                        <button
                          onClick={() => awardActiveQuestionScore(team.id, false, false)}
                          className="bg-red-800 hover:bg-red-700 text-white font-pixel text-[10px] px-3 py-1.5 border border-red-500 flex items-center justify-center gap-1 shadow-pixel-sm"
                          title="Wrong answer (deduct points)"
                        >
                          <XCircle className="w-3 h-3 text-red-200" />
                          WRONG
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center bg-[#111215] border border-dashed border-zinc-700">
            <p className="font-sans text-zinc-400 text-base mb-3">
              No active question is currently open.
            </p>
            <p className="font-mono text-xs text-zinc-500">
              Go to the <strong className="text-zinc-300">Jeopardy Board</strong> or{' '}
              <strong className="text-zinc-300">Question Banks</strong> tab to open a question on the projector.
            </p>
          </div>
        )}
      </div>

      {/* FAIR-TURN ENGINE STATUS & QUEUE */}
      <div className="bg-[#18181b] border-2 border-[#3f3f46] p-6 shadow-pixel">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#3f3f46] pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-amber-400" />
              <h3 className="font-pixel text-sm md:text-base text-white">
                FAIR-TURN ENGINE (GUARANTEED EQUAL OPPORTUNITY)
              </h3>
            </div>
            <p className="font-sans text-xs text-zinc-400 mt-1">
              Next turn is automatically assigned to whichever team has taken the fewest board picks. Steals do NOT consume a selection turn.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {fairTeam && (
              <div className="bg-[#2a1d0f] border border-amber-500 px-4 py-2 flex items-center gap-3">
                <span className="font-pixel text-xs text-amber-400">RECOMMENDED NEXT:</span>
                <span className="font-sans font-bold text-white text-base">{fairTeam.name}</span>
              </div>
            )}
            <label className="flex items-center gap-2 text-xs font-mono text-zinc-300">
              <span>Current team</span>
              <select
                value={activeQuestion.selectingTeamId || ''}
                onChange={(event) => setManualTurn(event.target.value || null)}
                className="bg-[#111215] border border-zinc-600 px-3 py-2 text-white font-sans text-sm focus:border-amber-400 focus:outline-none"
              >
                <option value="">No team selected</option>
                {eligibleTeams.map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {/* Team Turns Table */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {eligibleTeams.map((team) => {
            const isCurrent = team.id === activeQuestion.selectingTeamId;

            return (
              <div
                key={team.id}
                className={`p-3 border flex items-center justify-between ${
                  isCurrent
                    ? 'bg-[#2a0808] border-amber-400 shadow-pixel'
                    : 'bg-[#27272a] border-zinc-700'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-sans font-bold text-white text-sm">
                      {team.name}
                    </span>
                    {isCurrent && (
                      <span className="font-pixel text-[8px] bg-amber-400 text-black px-1.5 py-0.5 font-bold">
                        ACTIVE
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 font-mono text-xs text-zinc-400 mt-1">
                    <span>Picks: <strong className="text-white">{team.selectionTurnsTaken}</strong></span>
                    <span>•</span>
                    <span>Steals: <strong className="text-cyan-400">{team.stealsCount}</strong></span>
                  </div>
                </div>

                <BlazeRodIcon used={team.blazeRodUsed} statusLabel size="sm" />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
