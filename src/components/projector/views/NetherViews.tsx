import React from 'react';
import { useEvent } from '../../../context/EventContext';
import { NetherScene } from '../NetherScene';
import { Flame, ShieldAlert, Award, Clock, CheckCircle, XCircle } from 'lucide-react';

export const NetherIntroView: React.FC = () => {
  const { state } = useEvent();
  const qualifiedCount = state.teams.filter(t => t.isQualifiedR2).length;

  return (
    <NetherScene>
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <div className="bg-[#180505]/95 border-4 border-[#ef4444] p-8 md:p-14 shadow-pixel-glow-red max-w-4xl w-full backdrop-blur-md animate-[fadeIn_0.8s_ease-out]">
          {/* Dimension Tag */}
          <div className="inline-flex items-center gap-2 bg-[#dc2626] text-white font-pixel text-xs md:text-sm px-5 py-2 uppercase font-bold tracking-widest mb-6 shadow-pixel-sm">
            <Flame className="w-4 h-4 text-amber-300 animate-pulse" />
            DIMENSION II: THE NETHER • 20 TEAMS → 10 FINALISTS
          </div>

          {/* Main Title */}
          <h1 className="font-pixel text-4xl md:text-6xl lg:text-7xl text-[#f87171] drop-shadow-[4px_4px_0_#450a0a] tracking-tight mb-4 uppercase">
            THE NETHER 🔥
          </h1>

          <div className="w-48 h-1.5 bg-[#ef4444] mx-auto my-6 shadow-pixel-sm" />

          {/* Dynamic Teams Remaining Banner */}
          <h2 className="font-pixel text-2xl md:text-4xl text-[#fef08a] tracking-wider uppercase mb-4 drop-shadow-[3px_3px_0_#000]">
            {qualifiedCount} TEAMS REMAIN
          </h2>

          <div className="bg-[#2a0808]/90 border-2 border-amber-500/60 p-6 my-4 text-left max-w-2xl mx-auto shadow-pixel">
            <h3 className="font-pixel text-sm text-amber-400 mb-2 uppercase text-center">
              THE ALL-TEAM WAGER ROUND
            </h3>
            <ul className="font-sans text-xs md:text-sm text-zinc-300 space-y-2 list-disc list-inside">
              <li><strong>Equal Opportunity:</strong> All 20 teams answer all 8 questions.</li>
              <li><strong>Wager Options:</strong> 100, 200, 300, or 400 points per question.</li>
              <li><strong>One-Time DOUBLE:</strong> Each team has exactly ONE DOUBLE for the entire round.</li>
              <li><strong>Scoring:</strong> Correct = +Wager (or +2×Wager with DOUBLE); Wrong = −50 (or −100 with DOUBLE).</li>
              <li><strong>No Negative Scores:</strong> Cumulative score is floored at 0 points.</li>
              <li><strong>Clean Slate:</strong> Every team starts Round 2 at 0 points.</li>
            </ul>
          </div>

          <div className="mt-4 font-pixel text-xs text-red-400 tracking-wider">
            TOP 10 TEAMS WILL ADVANCE TO THE END 🐉
          </div>
        </div>
      </div>
    </NetherScene>
  );
};

export const NetherWagerQuestionView: React.FC = () => {
  const { state } = useEvent();
  const { round2Wager, questionBanks, teams, activeQuestion } = state;
  const qIndex = round2Wager.currentQuestionIndex;
  const currentQ = questionBanks.round2Main[qIndex];
  const qRecord = round2Wager.questions[qIndex];
  const r2Teams = teams.filter(t => t.isQualifiedR2);

  const isRevealed = round2Wager.isQuestionRevealed || qRecord?.isRevealed;

  // Count teams with DOUBLE active on this question
  const doubleTeams = r2Teams.filter(t => qRecord?.wagers[t.id]?.isDouble);

  return (
    <NetherScene>
      <div className="flex-1 flex flex-col justify-between px-6 py-5 max-w-7xl mx-auto w-full">
        {/* Top Header Card */}
        <div className="bg-[#180505]/95 border-4 border-[#ef4444] p-4 shadow-pixel-glow-red backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-[#dc2626] text-white font-pixel text-xs md:text-sm px-4 py-2 uppercase font-bold shadow-pixel-sm">
              QUESTION {qIndex + 1} / 8
            </div>
            {currentQ && (
              <span className="font-pixel text-xs text-amber-400 hidden sm:inline">
                {currentQ.category}
              </span>
            )}
          </div>

          {/* Double declarations pill */}
          <div className="flex items-center gap-2 bg-[#2a0808] border border-amber-500/70 px-4 py-1.5 shadow-pixel-sm">
            <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
            <span className="font-pixel text-xs text-amber-300">
              DOUBLES DECLARED: <strong className="text-white">{doubleTeams.length}</strong>
            </span>
          </div>

          <div className="font-mono text-xs text-zinc-400">
            All 20 Teams Competing Simultaneously
          </div>
        </div>

        {/* STEP 1: BEFORE QUESTION REVEALED (WAGER LOCKING SCREEN) */}
        {!isRevealed ? (
          <div className="my-auto py-4">
            <div className="bg-[#18181b]/95 border-4 border-amber-500 p-8 shadow-pixel-lg backdrop-blur-md text-center max-w-5xl mx-auto">
              <div className="inline-block bg-amber-500 text-black font-pixel text-xs px-4 py-1 font-bold uppercase mb-4 shadow-pixel-sm">
                STEP 1: LOCK WAGERS BEFORE REVEAL
              </div>

              <h2 className="font-pixel text-3xl md:text-5xl text-white drop-shadow mb-3 uppercase">
                QUESTION {qIndex + 1} OF 8
              </h2>

              <p className="font-sans text-base text-zinc-300 max-w-2xl mx-auto mb-6">
                All 20 teams must select their wager (<strong className="text-amber-400">100, 200, 300, 400</strong>) and declare their optional <strong className="text-amber-400">ONE-TIME DOUBLE</strong> with the Quizmaster before the question is revealed.
              </p>

              {/* Status grid of teams locking wagers */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2.5 max-h-[45vh] overflow-y-auto pr-2 custom-scrollbar text-left">
                {r2Teams.map((team) => {
                  const entry = qRecord?.wagers[team.id];
                  const wagerVal = entry?.wager || 100;
                  const isDouble = entry?.isDouble || false;

                  return (
                    <div
                      key={team.id}
                      className={`p-2.5 border transition-all ${
                        isDouble
                          ? 'bg-amber-950/80 border-amber-400 shadow-pixel-glow-gold'
                          : 'bg-[#27272a] border-zinc-700'
                      }`}
                    >
                      <div className="font-sans font-bold text-xs text-white truncate">
                        {team.name}
                      </div>
                      <div className="flex items-center justify-between mt-1 font-mono text-xs">
                        <span className="text-amber-400 font-bold">{wagerVal} PTS</span>
                        {isDouble ? (
                          <span className="font-pixel text-[8px] bg-red-600 text-white px-1 py-0.5 animate-pulse">
                            2X DOUBLE
                          </span>
                        ) : team.blazeRodUsed ? (
                          <span className="text-[9px] text-zinc-500">
                            DOUBLE USED
                          </span>
                        ) : (
                          <span className="text-[9px] text-emerald-400">
                            Available
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-6 text-zinc-500 font-mono text-xs">
                Quizmaster will reveal the question once all wagers are recorded.
              </div>
            </div>
          </div>
        ) : (
          /* STEP 2 & 3: QUESTION REVEALED TO ALL TEAMS */
          <div className="my-auto py-4">
            <div className="bg-[#18181b]/95 border-4 border-[#3f3f46] p-8 md:p-12 shadow-pixel-lg backdrop-blur-md max-w-5xl mx-auto">
              {/* Question Text */}
              <h2 className="font-sans font-extrabold text-2xl md:text-4xl lg:text-5xl text-white leading-tight mb-6 text-center drop-shadow-md">
                {currentQ?.questionText}
              </h2>

              {/* Optional Code Snippet */}
              {currentQ?.codeSnippet && (
                <div className="my-6 bg-[#09090b] border-2 border-[#52525b] p-5 font-mono text-sm md:text-lg text-emerald-400 overflow-x-auto shadow-inner rounded-sm whitespace-pre">
                  <code>{currentQ.codeSnippet}</code>
                </div>
              )}

              {/* Double Wager Teams Banner */}
              {doubleTeams.length > 0 && (
                <div className="my-4 p-3 bg-gradient-to-r from-amber-600/30 via-red-600/30 to-amber-600/30 border-2 border-amber-400 flex flex-wrap items-center justify-center gap-2">
                  <Flame className="w-5 h-5 text-amber-400 animate-spin" />
                  <span className="font-pixel text-xs text-amber-300 uppercase font-bold">
                    DOUBLES ACTIVE ({doubleTeams.length} TEAMS):
                  </span>
                  {doubleTeams.map(t => (
                    <span key={t.id} className="bg-red-950 border border-red-500 text-amber-300 font-sans text-xs px-2 py-0.5 font-bold">
                      {t.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Answer Revealed Card */}
              {activeQuestion.isAnswerRevealed && (
                <div className="mt-8 bg-gradient-to-r from-[#14532d] to-[#064e3b] border-4 border-[#4ade80] p-6 shadow-pixel animate-[fadeIn_0.5s_ease-out]">
                  <div className="flex items-center gap-2 mb-2">
                    <Award className="w-5 h-5 text-emerald-300" />
                    <span className="font-pixel text-xs text-emerald-300 uppercase font-bold tracking-wider">
                      CORRECT SOLUTION:
                    </span>
                  </div>
                  <div className="font-sans font-black text-2xl md:text-3xl text-[#fef08a] mb-2">
                    {currentQ?.correctAnswer}
                  </div>
                  {currentQ?.explanation && (
                    <p className="font-sans text-sm md:text-base text-emerald-100/90 leading-relaxed border-t border-emerald-700/50 pt-2 mt-2">
                      {currentQ.explanation}
                    </p>
                  )}
                </div>
              )}

              {/* Scoring Formula Reminder */}
              <div className="mt-6 pt-4 border-t border-zinc-800 flex flex-wrap items-center justify-between text-[11px] font-mono text-zinc-400">
                <span>Normal: Correct = <strong className="text-emerald-400">+Wager</strong> | Wrong = <strong className="text-red-400">−50</strong></span>
                <span>DOUBLE: Correct = <strong className="text-amber-400">+2×Wager</strong> | Wrong = <strong className="text-red-400">−100</strong></span>
                <span>Cumulative Minimum: <strong className="text-white">0 PTS</strong></span>
              </div>
            </div>
          </div>
        )}

        {/* Optional Timer if enabled */}
        {activeQuestion.isTimerEnabled && isRevealed && (
          <div className="bg-[#180505]/95 border-2 border-[#ef4444] p-3 shadow-pixel backdrop-blur-md">
            <div className="flex items-center justify-between mb-1.5 font-pixel text-xs text-zinc-300">
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" /> TIME REMAINING
              </span>
              <span className="text-[#4ade80] text-sm">{activeQuestion.timerSecondsLeft}s</span>
            </div>
            <div className="w-full h-3 bg-[#18181b] border border-zinc-700 overflow-hidden">
              <div
                className="h-full bg-emerald-400 transition-all duration-1000 ease-linear"
                style={{
                  width: `${(activeQuestion.timerSecondsLeft / (activeQuestion.defaultTimerDuration || 30)) * 100}%`
                }}
              />
            </div>
          </div>
        )}
      </div>
    </NetherScene>
  );
};

export const Round2ScoreboardView: React.FC = () => {
  const { state } = useEvent();
  const { round2Wager } = state;
  const qualified = state.teams
    .filter(t => t.isQualifiedR2)
    .sort((a, b) => b.round2Score - a.round2Score);

  const completedQuestionsCount = round2Wager.questions.filter(q => q.isScored).length;

  return (
    <NetherScene>
      <div className="flex-1 flex flex-col justify-between px-8 py-6 max-w-6xl mx-auto w-full">
        {/* Header */}
        <div className="bg-[#180505]/95 border-4 border-[#ef4444] p-6 shadow-pixel-glow-red text-center backdrop-blur-md mb-3">
          <div className="inline-flex items-center gap-2 bg-[#dc2626] text-white font-pixel text-xs px-4 py-1.5 uppercase font-bold mb-2 shadow-pixel-sm">
            <Flame className="w-4 h-4 text-amber-300" />
            ROUND 2 SCOREBOARD • PROGRESS: {completedQuestionsCount} / 8 QUESTIONS
          </div>
          <h2 className="font-pixel text-2xl md:text-4xl text-[#fef08a] uppercase drop-shadow-[3px_3px_0_#000]">
            THE NETHER LEADERBOARD 🔥
          </h2>
          <p className="font-sans text-xs md:text-sm text-zinc-300 mt-1">
            Top 10 Qualify for Round 3 (The End) • Scores cannot fall below 0
          </p>
        </div>

        {/* Ranked Teams List (20 Teams) */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar my-1">
          {qualified.map((team, idx) => {
            const isTop10 = idx < 10;
            const isCutoff = idx === 9; // Divider after 10th

            return (
              <React.Fragment key={team.id}>
                <div
                  className={`p-3.5 flex items-center justify-between border-2 shadow-pixel transition-all backdrop-blur-md ${
                    isTop10
                      ? idx === 0
                        ? 'bg-[#2a0808]/95 border-amber-400 shadow-pixel-glow-gold'
                        : 'bg-[#18181b]/95 border-emerald-600/80'
                      : 'bg-[#18181b]/80 border-[#3f3f46] opacity-75'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Rank Badge */}
                    <span className={`font-pixel text-xs md:text-sm w-7 h-7 flex items-center justify-center font-bold ${
                      idx === 0
                        ? 'bg-amber-400 text-black shadow-pixel-sm'
                        : isTop10
                        ? 'bg-emerald-600 text-white'
                        : 'bg-zinc-800 text-zinc-400'
                    }`}>
                      #{idx + 1}
                    </span>

                    {/* Team Name */}
                    <span className="font-sans font-black text-white text-base md:text-xl">
                      {team.name}
                    </span>

                    {isTop10 && (
                      <span className="font-pixel text-[8px] bg-emerald-950 text-emerald-300 px-1.5 py-0.5 border border-emerald-700 hidden sm:inline">
                        TOP 10
                      </span>
                    )}
                  </div>

                  {/* Right Side: DOUBLE Status + Score */}
                  <div className="flex items-center gap-6">
                    <span className={`font-pixel text-[9px] ${team.blazeRodUsed ? 'text-zinc-500' : 'text-emerald-400'}`}>
                      DOUBLE {team.blazeRodUsed ? 'USED' : 'AVAILABLE'}
                    </span>

                    {/* Team Score */}
                    <div className="font-pixel text-xl md:text-3xl text-[#fef08a] drop-shadow min-w-[90px] text-right">
                      {team.round2Score}
                    </div>
                  </div>
                </div>

                {/* VISUAL CUTOFF LINE AFTER 10TH POSITION */}
                {isCutoff && (
                  <div className="py-2 flex items-center gap-3 my-1">
                    <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
                    <span className="font-pixel text-[10px] text-purple-300 uppercase tracking-widest bg-[#180505] px-3 py-1 border border-purple-500">
                      🐉 TOP 10 QUALIFYING CUTOFF LINE 🐉
                    </span>
                    <div className="flex-1 h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Footer */}
        <div className="bg-[#180505]/80 border-t border-[#7f1d1d] px-6 py-2 flex items-center justify-between text-xs text-zinc-400 font-mono mt-2">
          <span>{qualified.length} Teams in The Nether Wager Round</span>
          <span>Top 10 Qualifiers Advance to The End</span>
        </div>
      </div>
    </NetherScene>
  );
};
