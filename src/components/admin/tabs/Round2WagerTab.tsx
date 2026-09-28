import React from 'react';
import { useEvent } from '../../../context/EventContext';
import { WagerAmount } from '../../../types';
import {
  Flame,
  Eye,
  CheckCircle,
  XCircle,
  Award,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

export const Round2WagerTab: React.FC = () => {
  const {
    state,
    initRound2Scores,
    setTeamWager,
    toggleTeamDouble,
    lockRound2Wagers,
    unlockRound2Wagers,
    revealRound2Question,
    setTeamRound2Answer,
    setAllRound2Answers,
    submitRound2QuestionScores,
    goToRound2Question,
    autoQualifyTop10R2,
    activateTieBreaker,
    setCurrentRound
  } = useEvent();

  const { round2Wager, questionBanks, teams } = state;
  const qIdx = round2Wager.currentQuestionIndex;
  const currentQ = questionBanks.round2Main[qIdx];
  const qRecord = round2Wager.questions[qIdx];

  const r2Teams = teams.filter(t => t.isQualifiedR2);
  const isRevealed = round2Wager.isQuestionRevealed || qRecord?.isRevealed;
  const isScored = qRecord?.isScored;
  const areWagersLocked = qRecord?.areWagersLocked ?? false;

  // Check if there is a tie at the 10th position
  const sortedR2 = [...r2Teams].sort((a, b) => b.round2Score - a.round2Score);
  const tenthScore = sortedR2[9]?.round2Score;
  const eleventhScore = sortedR2[10]?.round2Score;
  const hasTieAtTenth = tenthScore !== undefined && eleventhScore !== undefined && tenthScore === eleventhScore;

  const completedCount = round2Wager.questions.filter(q => q.isScored).length;

  return (
    <div className="space-y-6">
      {/* HEADER & ROUND 2 NAVIGATOR */}
      <div className="bg-[#18181b] border-2 border-[#ef4444] p-6 shadow-pixel">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#3f3f46] pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-red-500 animate-pulse" />
              <h2 className="font-pixel text-base md:text-lg text-white uppercase">
                ROUND 2: THE NETHER — ALL-TEAM WAGER ROUND
              </h2>
            </div>
            <p className="font-sans text-xs text-zinc-400 mt-1">
              All 20 teams answer all 8 questions. Wagers: 100, 200, 300, 400. Exactly 1 DOUBLE per team.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (confirm('Reset all Round 2 team scores to 0 and restore all DOUBLEs? (Round 1 scores remain intact)')) {
                  initRound2Scores();
                }
              }}
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-pixel text-xs px-3 py-2 border border-zinc-600 flex items-center gap-1.5 shadow-pixel-sm"
              title="Every team starts Round 2 at 0 points"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset R2 to 0 PTS
            </button>

            <button
              onClick={() => setCurrentRound('ROUND_2_SCOREBOARD')}
              className="bg-red-950 hover:bg-red-900 border border-red-600 text-red-300 font-pixel text-xs px-3 py-2 shadow-pixel-sm flex items-center gap-1.5"
            >
              <Award className="w-3.5 h-3.5 text-amber-400" />
              Projector Scoreboard
            </button>
          </div>
        </div>

        {/* 8 QUESTIONS PROGRESS TABS */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
          <div className="flex items-center gap-1.5">
            {Array.from({ length: 8 }).map((_, idx) => {
              const qRec = round2Wager.questions[idx];
              const isCurrent = idx === qIdx;
              const isDone = qRec?.isScored;

              return (
                <button
                  key={idx}
                  onClick={() => goToRound2Question(idx)}
                  className={`font-pixel text-xs px-3.5 py-2 border shadow-pixel-sm flex items-center gap-1.5 transition-all ${
                    isCurrent
                      ? 'bg-red-600 border-yellow-300 text-white font-bold scale-105 shadow-pixel-glow-red'
                      : isDone
                      ? 'bg-[#2a0808] border-emerald-600 text-emerald-300 hover:border-emerald-400'
                      : 'bg-[#111215] border-zinc-700 text-zinc-400 hover:border-zinc-500'
                  }`}
                >
                  <span>Q{idx + 1}</span>
                  {isDone && <CheckCircle className="w-3 h-3 text-emerald-400" />}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-1 font-pixel text-xs">
            <button
              disabled={qIdx === 0}
              onClick={() => goToRound2Question(qIdx - 1)}
              className="p-1.5 bg-zinc-800 disabled:opacity-30 border border-zinc-700 text-white"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-xs text-zinc-400 px-1">
              {qIdx + 1} / 8
            </span>
            <button
              disabled={qIdx === 7}
              onClick={() => goToRound2Question(qIdx + 1)}
              className="p-1.5 bg-zinc-800 disabled:opacity-30 border border-zinc-700 text-white"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* QUESTION PREVIEW & REVEAL CONTROLS */}
      <div className="bg-[#18181b] border-2 border-zinc-700 p-5 shadow-pixel">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-3 mb-3">
          <div className="flex items-center gap-2">
            <span className="font-pixel text-xs bg-red-600 text-white px-2.5 py-1">
              QUESTION {qIdx + 1} OF 8
            </span>
            <span className="font-pixel text-xs text-amber-400">
              {currentQ?.category}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {!areWagersLocked && !isRevealed ? (
              <button
                onClick={lockRound2Wagers}
                className="bg-amber-500 hover:bg-amber-400 text-black font-pixel text-xs px-4 py-2 font-bold shadow-pixel-sm flex items-center gap-1.5 animate-pulse"
              >
                <CheckCircle className="w-4 h-4" />
                LOCK ALL WAGERS
              </button>
            ) : areWagersLocked && !isRevealed ? (
              <>
                <button
                  onClick={revealRound2Question}
                  className="bg-emerald-600 hover:bg-emerald-500 text-black font-pixel text-xs px-4 py-2 font-bold shadow-pixel-sm flex items-center gap-1.5"
                >
                  <Eye className="w-4 h-4" />
                  REVEAL QUESTION
                </button>
                <button
                  onClick={unlockRound2Wagers}
                  className="bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-pixel text-[10px] px-3 py-2 border border-zinc-600"
                >
                  UNLOCK TO CORRECT
                </button>
              </>
            ) : (
              <span className="font-pixel text-[11px] bg-emerald-950 border border-emerald-600 text-emerald-300 px-3 py-1 flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                QUESTION REVEALED TO AUDIENCE
              </span>
            )}

            {isScored && (
              <span className="font-pixel text-[11px] bg-blue-950 border border-blue-600 text-blue-300 px-3 py-1">
                SCORES RECORDED
              </span>
            )}
          </div>
        </div>

        {/* Prompt */}
        <p className="font-sans font-bold text-base md:text-lg text-white mb-2">
          {currentQ?.questionText}
        </p>

        {currentQ?.codeSnippet && (
          <pre className="bg-black p-3 text-xs font-mono text-emerald-400 border border-zinc-800 rounded my-2 overflow-x-auto whitespace-pre">
            {currentQ.codeSnippet}
          </pre>
        )}

        <div className="bg-[#111215] border border-zinc-800 p-2.5 mt-2 font-mono text-xs flex items-center justify-between">
          <span>Correct Answer: <strong className="text-emerald-400 text-sm">{currentQ?.correctAnswer}</strong></span>
          {currentQ?.explanation && <span className="text-zinc-500 text-[11px] truncate max-w-md">{currentQ.explanation}</span>}
        </div>
      </div>

      {/* 20 TEAMS WAGER & SCORING MATRIX */}
      <div className="bg-[#18181b] border-2 border-[#3f3f46] p-6 shadow-pixel">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#3f3f46] pb-3 mb-4">
          <div>
            <h3 className="font-pixel text-sm text-white uppercase">
              TEAM WAGERS & ANSWERS (QUESTION {qIdx + 1}/8)
            </h3>
            <p className="font-sans text-xs text-zinc-400">
              {areWagersLocked ? 'Wagers and DOUBLE declarations are locked for this question.' : 'Set each team\'s wager (100, 200, 300, 400) and optional DOUBLE before locking.'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-zinc-400 mr-1">Quick Grade:</span>
            <button
              onClick={() => setAllRound2Answers(true)}
              className="font-pixel text-[10px] bg-emerald-950 hover:bg-emerald-900 border border-emerald-600 text-emerald-300 px-2.5 py-1"
            >
              All Correct
            </button>
            <button
              onClick={() => setAllRound2Answers(false)}
              className="font-pixel text-[10px] bg-red-950 hover:bg-red-900 border border-red-600 text-red-300 px-2.5 py-1"
            >
              All Wrong
            </button>
          </div>
        </div>

        {/* Matrix Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-800 font-pixel text-[10px] text-zinc-400 uppercase">
                <th className="py-2.5 px-3">#</th>
                <th className="py-2.5 px-3">Team Name</th>
                <th className="py-2.5 px-3">Current Score</th>
                <th className="py-2.5 px-3 text-center">Wager (Pts)</th>
                <th className="py-2.5 px-3 text-center">Double (2x)</th>
                <th className="py-2.5 px-3 text-center">Answer Status</th>
                <th className="py-2.5 px-3 text-right">Potential Delta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800 font-sans text-sm">
              {r2Teams.map((team, idx) => {
                const sub = qRecord?.wagers[team.id] || {
                  teamId: team.id,
                  wager: 100,
                  isDouble: false,
                  isCorrect: null,
                };

                const currentWager = sub.wager;
                const isDoubleActive = sub.isDouble;
                const doubleAlreadyUsed = team.blazeRodUsed && !isDoubleActive;

                const potentialGain = isDoubleActive ? currentWager * 2 : currentWager;
                const potentialLoss = isDoubleActive ? -100 : -50;

                return (
                  <tr key={team.id} className="hover:bg-[#202227] transition-colors">
                    <td className="py-2.5 px-3 font-mono text-zinc-500 text-xs">{idx + 1}</td>

                    {/* Team Name */}
                    <td className="py-2.5 px-3 font-bold text-white text-sm">
                      {team.name}
                    </td>

                    {/* Current Score */}
                    <td className="py-2.5 px-3 font-pixel text-xs text-[#fef08a]">
                      {team.round2Score} PTS
                    </td>

                    {/* Wager Selector (100, 200, 300, 400) */}
                    <td className="py-2.5 px-3 text-center">
                      <div className="inline-flex items-center gap-1 font-mono text-xs">
                        {([100, 200, 300, 400] as WagerAmount[]).map((val) => (
                          <button
                            key={val}
                            onClick={() => setTeamWager(team.id, val)}
                            disabled={areWagersLocked || isRevealed || isScored}
                            className={`px-2 py-1 border transition-all ${
                              currentWager === val
                                ? 'bg-amber-500 border-amber-300 text-black font-bold shadow-pixel-sm'
                                : 'bg-[#111215] border-zinc-700 text-zinc-400 hover:text-white'
                              } disabled:opacity-50 disabled:cursor-not-allowed`}
                          >
                            {val}
                          </button>
                        ))}
                      </div>
                    </td>

                    {/* One-Time DOUBLE Button */}
                    <td className="py-2.5 px-3 text-center">
                      {doubleAlreadyUsed ? (
                        <span className="font-pixel text-[9px] text-zinc-500 bg-zinc-900 border border-zinc-800 px-2 py-1 inline-block">
                          DOUBLE USED {team.doubleUsedAtQuestion ? `(Q${team.doubleUsedAtQuestion})` : ''}
                        </span>
                      ) : (
                        <button
                          onClick={() => toggleTeamDouble(team.id)}
                          disabled={areWagersLocked || isRevealed || isScored}
                          className={`font-pixel text-[9px] px-2.5 py-1 border shadow-pixel-sm transition-all flex items-center gap-1 mx-auto ${
                            isDoubleActive
                              ? 'bg-red-600 hover:bg-red-500 border-yellow-300 text-white font-bold animate-pulse'
                              : 'bg-[#111215] hover:bg-zinc-800 border-zinc-700 text-amber-400'
                          } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                          <Flame className="w-3 h-3 text-amber-300" />
                          {isDoubleActive ? 'DOUBLE ON' : 'USE DOUBLE'}
                        </button>
                      )}
                    </td>

                    {/* Answer Status (Correct / Wrong) */}
                    <td className="py-2.5 px-3 text-center">
                      <div className="inline-flex items-center gap-1 font-pixel text-[9px]">
                        <button
                          onClick={() => setTeamRound2Answer(team.id, true)}
                          className={`px-2.5 py-1 border flex items-center gap-1 ${
                            sub.isCorrect === true
                              ? 'bg-emerald-600 border-emerald-300 text-white font-bold shadow-pixel-sm'
                              : 'bg-[#111215] border-zinc-700 text-zinc-400 hover:text-emerald-400'
                          }`}
                        >
                          <CheckCircle className="w-3 h-3" /> Correct
                        </button>

                        <button
                          onClick={() => setTeamRound2Answer(team.id, false)}
                          className={`px-2.5 py-1 border flex items-center gap-1 ${
                            sub.isCorrect === false
                              ? 'bg-red-600 border-red-300 text-white font-bold shadow-pixel-sm'
                              : 'bg-[#111215] border-zinc-700 text-zinc-400 hover:text-red-400'
                          }`}
                        >
                          <XCircle className="w-3 h-3" /> Wrong
                        </button>
                      </div>
                    </td>

                    {/* Potential Delta */}
                    <td className="py-2.5 px-3 text-right font-mono text-xs">
                      {sub.isCorrect === true ? (
                        <span className="text-emerald-400 font-bold">+{potentialGain}</span>
                      ) : sub.isCorrect === false ? (
                        <span className="text-red-400 font-bold">{potentialLoss}</span>
                      ) : (
                        <span className="text-zinc-500">
                          +{potentialGain} / {potentialLoss}
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* SUBMIT BUTTON */}
        <div className="mt-6 pt-4 border-t border-[#3f3f46] flex flex-wrap items-center justify-between gap-4">
          <div className="font-mono text-xs text-zinc-400">
            Penalties: Normal = <strong className="text-red-400">−50</strong>, DOUBLE = <strong className="text-red-400">−100</strong> (Score floored at 0).
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={submitRound2QuestionScores}
              className="bg-emerald-600 hover:bg-emerald-500 text-black font-pixel text-xs px-6 py-2.5 font-bold shadow-pixel flex items-center gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              APPLY SCORES FOR QUESTION {qIdx + 1}
            </button>

            {qIdx < 7 && (
              <button
                onClick={() => goToRound2Question(qIdx + 1)}
                className="bg-amber-500 hover:bg-amber-400 text-black font-pixel text-xs px-4 py-2.5 font-bold shadow-pixel flex items-center gap-1.5"
              >
                Next Question (Q{qIdx + 2}) <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* COMPLETION & TOP 10 ADVANCEMENT */}
      {completedCount === 8 && (
        <div className="bg-gradient-to-r from-red-950 via-purple-950 to-red-950 border-4 border-amber-400 p-6 shadow-pixel-glow-gold">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="inline-block bg-amber-500 text-black font-pixel text-xs px-3 py-1 font-bold uppercase mb-2">
                ALL 8 QUESTIONS COMPLETED!
              </div>
              <h3 className="font-pixel text-lg text-white uppercase">
                ROUND 2 HAS CONCLUDED • READY TO ADVANCE TOP 10
              </h3>
              <p className="font-sans text-xs text-zinc-300 mt-1">
                {hasTieAtTenth ? (
                  <span className="text-red-400 font-bold flex items-center gap-1.5">
                    <ShieldAlert className="w-4 h-4 text-red-400" />
                    TIE DETECTED AT 10TH QUALIFIER! Run Sudden-Death Tie-Break before finalizing.
                  </span>
                ) : (
                  'Top 10 Qualifiers are cleanly determined by final Round 2 score.'
                )}
              </p>
            </div>

            <div className="flex items-center gap-2">
              {hasTieAtTenth && (
                <button
                  onClick={() => activateTieBreaker('ROUND_2_TIEBREAKER')}
                  className="bg-red-600 hover:bg-red-500 text-white font-pixel text-xs px-4 py-2.5 font-bold shadow-pixel-sm flex items-center gap-1.5 animate-pulse"
                >
                  <ShieldAlert className="w-4 h-4" />
                  RUN R2 TIE-BREAKER
                </button>
              )}

              <button
                onClick={autoQualifyTop10R2}
                className="bg-amber-500 hover:bg-amber-400 text-black font-pixel text-xs px-5 py-2.5 font-bold shadow-pixel-sm flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                AUTO-SELECT TOP 10 FINALISTS
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
