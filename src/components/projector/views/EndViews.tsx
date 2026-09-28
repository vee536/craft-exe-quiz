import React, { useEffect } from 'react';
import { useEvent } from '../../../context/EventContext';
import { EndScene } from '../EndScene';
import { Trophy, Sparkles, Award, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';

export const FinalistsView: React.FC = () => {
  const { state } = useEvent();
  const finalists = state.teams.filter(t => t.isFinalistR3);

  return (
    <EndScene>
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-6 max-w-6xl mx-auto w-full">
        <div className="bg-[#05020a]/95 border-4 border-[#a855f7] p-8 md:p-14 shadow-pixel-glow-purple max-w-4xl w-full backdrop-blur-md animate-[fadeIn_0.8s_ease-out]">
          {/* Dimension Tag */}
          <div className="inline-flex items-center gap-2 bg-[#7e22ce] text-white font-pixel text-xs md:text-sm px-5 py-2 uppercase font-bold tracking-widest mb-6 shadow-pixel-sm">
            <Sparkles className="w-4 h-4 text-purple-300 animate-spin" />
            DIMENSION III: THE END • 10 FINALISTS → 1 CHAMPION
          </div>

          {/* Main Title */}
          <h1 className="font-pixel text-4xl md:text-6xl lg:text-7xl text-[#d8b4fe] drop-shadow-[4px_4px_0_#3b0764] tracking-tight mb-4 uppercase">
            THE END 🐉
          </h1>

          <div className="w-48 h-1.5 bg-[#a855f7] mx-auto my-6 shadow-pixel-sm" />

          {/* Finalists Banner */}
          <h2 className="font-pixel text-2xl md:text-4xl text-[#fef08a] tracking-wider uppercase mb-2 drop-shadow-[3px_3px_0_#000]">
            THE 10 FINALISTS
          </h2>

          <p className="font-sans text-xs md:text-sm text-purple-200 mb-6">
            Starting scores normalized from Round 2 performance: <strong className="text-amber-400 font-mono">(R2 Score ÷ Highest R2 Score) × 100</strong>
          </p>

          {/* Dynamic Finalists Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-3xl mx-auto">
            {finalists.map((team, idx) => (
              <div
                key={team.id}
                className="bg-[#1e1035] border-2 border-[#a855f7] p-3.5 flex items-center justify-between shadow-pixel hover:border-pink-400 transition-colors"
              >
                <div className="flex items-center gap-3 truncate">
                  <span className="font-pixel text-xs bg-[#a855f7] text-black w-6 h-6 flex items-center justify-center font-bold flex-shrink-0">
                    {idx + 1}
                  </span>
                  <span className="font-sans font-black text-white text-base md:text-lg truncate">
                    {team.name}
                  </span>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <span className="font-pixel text-sm text-[#fef08a]">
                    {Number(team.score).toFixed(2)}
                  </span>
                  <span className="font-mono text-[10px] text-zinc-400 block">
                    (R2: {team.round2Score})
                  </span>
                </div>
              </div>
            ))}
          </div>

          {finalists.length === 0 && (
            <p className="font-sans text-zinc-400 text-sm mt-4">
              Quizmaster is selecting the 10 advancing finalists in the Admin Panel...
            </p>
          )}
        </div>
      </div>
    </EndScene>
  );
};

export const Round3QuestionView: React.FC = () => {
  const { state } = useEvent();
  const { activeQuestion, teams, round3, questionBanks } = state;
  const q = activeQuestion.question;

  if (!q) {
    return <FinalistsView />;
  }

  const selectingTeam = teams.find(t => t.id === round3.buzzerTeamId);
  const questionNumber = round3.currentQuestionIndex + 1;
  const timerPercentage = activeQuestion.defaultTimerDuration > 0
    ? (activeQuestion.timerSecondsLeft / activeQuestion.defaultTimerDuration) * 100
    : 100;

  return (
    <EndScene>
      <div className="flex-1 flex flex-col justify-between px-8 py-6 max-w-6xl mx-auto w-full">
        {/* Header Bar */}
        <div className="bg-[#0e0720]/95 border-4 border-[#a855f7] p-5 shadow-pixel-glow-purple backdrop-blur-md flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-[#9333ea] text-white font-pixel text-xs px-4 py-2 uppercase font-bold shadow-pixel-sm">
              QUESTION {questionNumber} / {questionBanks.round3Finals.length}
            </div>
            <div className="font-pixel text-xl text-[#fef08a] drop-shadow-[2px_2px_0_#000]">
              +100 / -50 POINTS
            </div>
          </div>

          {selectingTeam && (
            <div className="bg-[#2e1065] border border-purple-400 px-4 py-1.5 flex items-center gap-2">
                <span className="font-pixel text-[10px] text-zinc-300 uppercase">ANSWER NOW:</span>
              <span className="font-sans font-bold text-white text-base">{selectingTeam.name}</span>
                <span className="font-pixel text-xs text-amber-300">{activeQuestion.timerSecondsLeft}</span>
            </div>
          )}
        </div>

        {/* Question Body */}
        <div className="my-auto py-6">
          <div className="bg-[#110c22]/95 border-4 border-[#581c87] p-8 md:p-12 shadow-pixel-lg backdrop-blur-md">
            <h2 className="font-sans font-extrabold text-2xl md:text-4xl lg:text-5xl text-white leading-tight mb-6 text-center drop-shadow-md">
              {q.questionText}
            </h2>

            {q.codeSnippet && (
              <div className="my-6 bg-[#030108] border-2 border-[#7e22ce] p-5 font-mono text-sm md:text-lg text-fuchsia-300 overflow-x-auto shadow-inner rounded-sm whitespace-pre">
                <code>{q.codeSnippet}</code>
              </div>
            )}

            {q.mediaUrl && (
              <div className="my-6 flex justify-center">
                <img
                  src={q.mediaUrl}
                  alt="Final question visual"
                  className="max-h-[350px] border-4 border-purple-800 shadow-pixel object-contain"
                />
              </div>
            )}

            {/* Steal / Buzzer Banner */}
            {round3.isBuzzerOpen && (
              <div className="mt-8 p-4 bg-gradient-to-r from-purple-700 via-pink-600 to-purple-700 border-4 border-yellow-300 text-white font-pixel text-center text-sm md:text-xl uppercase font-black shadow-pixel-glow-purple animate-pulse">
                BUZZER OPEN • ALL ELIGIBLE FINALISTS • {round3.buzzerWindowSecondsLeft}s
              </div>
            )}

            {round3.lastResult && (
              <div className={`mt-5 p-3 border-2 text-center font-pixel text-sm ${round3.lastResult.result === 'CORRECT' ? 'bg-emerald-950 border-emerald-400 text-emerald-200' : 'bg-red-950 border-red-500 text-red-200'}`}>
                {teams.find(team => team.id === round3.lastResult?.teamId)?.name}: {round3.lastResult.result.replace('_', ' ')}
                <span className="ml-3">{round3.lastResult.scoreChange > 0 ? '+' : ''}{round3.lastResult.scoreChange} PTS</span>
              </div>
            )}

            {/* Revealed Answer Card */}
            {activeQuestion.isAnswerRevealed && (
              <div className="mt-8 bg-gradient-to-r from-[#3b0764] to-[#1e1035] border-4 border-[#d8b4fe] p-6 shadow-pixel animate-[fadeIn_0.5s_ease-out]">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-5 h-5 text-fuchsia-300" />
                  <span className="font-pixel text-xs text-fuchsia-300 uppercase font-bold tracking-wider">
                    CORRECT SOLUTION:
                  </span>
                </div>
                <div className="font-sans font-black text-2xl md:text-3xl text-[#fef08a] mb-2">
                  {q.correctAnswer}
                </div>
                {q.explanation && (
                  <p className="font-sans text-sm md:text-base text-purple-100/90 leading-relaxed border-t border-purple-700/50 pt-2 mt-2">
                    {q.explanation}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Optional Timer */}
        {(round3.isBuzzerOpen || round3.buzzerTeamId) && (
          <div className="bg-[#0e0720]/95 border-2 border-[#a855f7] p-4 shadow-pixel backdrop-blur-md">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 font-pixel text-xs text-zinc-300">
                <Clock className="w-4 h-4 text-purple-400" />
                <span>{round3.buzzerTeamId ? 'ANSWER NOW' : 'BUZZER WINDOW'}</span>
              </div>
              <div className={`font-pixel text-xl md:text-2xl font-bold ${
                (round3.buzzerTeamId ? activeQuestion.timerSecondsLeft : round3.buzzerWindowSecondsLeft) <= 5 ? 'text-red-500 animate-ping' : 'text-[#c084fc]'
              }`}>
                {round3.buzzerTeamId ? activeQuestion.timerSecondsLeft : round3.buzzerWindowSecondsLeft}s
              </div>
            </div>

            <div className="w-full h-4 bg-[#05020a] border-2 border-[#581c87] overflow-hidden p-0.5">
              <div
                className={`h-full transition-all duration-1000 ease-linear ${
                  activeQuestion.timerSecondsLeft <= 5
                    ? 'bg-red-500 shadow-[0_0_10px_#ef4444]'
                    : 'bg-[#a855f7] shadow-[0_0_10px_#a855f7]'
                }`}
                style={{ width: `${Math.max(0, round3.buzzerTeamId ? timerPercentage : (round3.buzzerWindowSecondsLeft / round3.buzzerWindowDurationSeconds) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </EndScene>
  );
};

export const Round3ScoreboardView: React.FC = () => {
  const { state } = useEvent();
  const finalists = state.teams
    .filter(t => t.isFinalistR3)
    .sort((a, b) => b.score - a.score);

  return (
    <EndScene>
      <div className="flex-1 flex flex-col justify-between px-8 py-6 max-w-6xl mx-auto w-full">
        <div className="bg-[#05020a]/95 border-4 border-[#a855f7] p-6 shadow-pixel-glow-purple text-center backdrop-blur-md mb-4">
          <div className="inline-flex items-center gap-2 bg-[#7e22ce] text-white font-pixel text-xs px-4 py-1.5 uppercase font-bold mb-2 shadow-pixel-sm">
            <Trophy className="w-4 h-4 text-amber-300" />
            FINAL STANDINGS
          </div>
          <h2 className="font-pixel text-2xl md:text-4xl text-[#fef08a] uppercase drop-shadow-[3px_3px_0_#000]">
            THE END — LEADERBOARD 🐉
          </h2>
          <p className="font-sans text-xs text-purple-200 mt-1">
            Scores maintained to 2 decimal places from normalized Round 2 starting points
          </p>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar my-2">
          {finalists.map((team, idx) => (
            <div
              key={team.id}
              className={`p-5 flex items-center justify-between border-2 shadow-pixel transition-all backdrop-blur-md ${
                idx === 0
                  ? 'bg-[#2e1065]/95 border-amber-400 shadow-pixel-glow-gold'
                  : 'bg-[#150a26]/90 border-[#7e22ce]'
              }`}
            >
              <div className="flex items-center gap-4">
                <span className={`font-pixel text-base w-9 h-9 flex items-center justify-center font-bold ${
                  idx === 0
                    ? 'bg-amber-400 text-black shadow-pixel-sm'
                    : idx === 1
                    ? 'bg-zinc-300 text-black shadow-pixel-sm'
                    : idx === 2
                    ? 'bg-amber-700 text-white shadow-pixel-sm'
                    : 'bg-[#1e1035] text-purple-300 border border-[#7e22ce]'
                }`}>
                  #{idx + 1}
                </span>

                <span className="font-sans font-black text-white text-xl md:text-3xl">
                  {team.name}
                </span>
              </div>

              <div className="font-pixel text-3xl md:text-5xl text-[#fef08a] drop-shadow-[2px_2px_0_#000]">
                {Number(team.score).toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        <div className="bg-[#05020a]/80 border-t border-[#581c87] px-6 py-2 flex items-center justify-between text-xs text-zinc-400 font-mono mt-3">
          <span>{finalists.length} Finalists in The End</span>
          <span>Championship within reach</span>
        </div>
      </div>
    </EndScene>
  );
};

export const WinnerView: React.FC = () => {
  const { state } = useEvent();
  const winner = state.teams.find(t => t.id === state.winnerTeamId);
  const finalists = state.teams
    .filter(t => t.isFinalistR3)
    .sort((a, b) => b.score - a.score);

  useEffect(() => {
    const end = Date.now() + 5 * 1000;
    const colors = ['#f59e0b', '#ec4899', '#a855f7', '#38bdf8', '#4ade80'];

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors: colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <EndScene>
      <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-8 max-w-5xl mx-auto w-full">
        <div className="bg-[#05020a]/95 border-4 border-amber-400 p-8 md:p-14 shadow-pixel-glow-gold max-w-4xl w-full backdrop-blur-md animate-[bounce_1s_ease-out]">
          <div className="inline-block bg-purple-950 border border-purple-400 text-purple-200 font-pixel text-xs md:text-sm px-6 py-2 uppercase font-bold tracking-widest mb-6 shadow-pixel-sm">
            THE ENDER DRAGON HAS FALLEN
          </div>

          <h1 className="font-pixel text-3xl md:text-5xl lg:text-6xl text-amber-400 drop-shadow-[4px_4px_0_#78350f] tracking-tight mb-4 uppercase">
            🏆 CRAFT.exe CHAMPION
          </h1>

          <div className="w-56 h-2 bg-gradient-to-r from-amber-500 via-yellow-200 to-amber-500 mx-auto my-6 shadow-pixel-sm" />

          {/* Winning Team Name */}
          <div className="my-6 p-6 bg-gradient-to-r from-[#2e1065] via-[#4c1d95] to-[#2e1065] border-4 border-amber-400 shadow-pixel-glow-gold">
            <h2 className="font-sans font-black text-4xl md:text-6xl lg:text-7xl text-white drop-shadow-[4px_4px_0_#000]">
              {winner ? winner.name : 'CHAMPION TEAM'}
            </h2>
            {winner && (
              <p className="font-pixel text-xl md:text-2xl text-[#fef08a] mt-3 drop-shadow">
                FINAL SCORE: {Number(winner.score).toFixed(2)} POINTS
              </p>
            )}
          </div>

          {/* Final Standings Podium */}
          {finalists.length > 0 && (
            <div className="mt-8 border-t border-purple-800/80 pt-6">
              <h3 className="font-pixel text-xs text-purple-300 uppercase mb-4 tracking-wider">
                FINAL STANDINGS
              </h3>
              <div className="flex flex-wrap justify-center gap-4">
                {finalists.slice(0, 4).map((f, i) => (
                  <div key={f.id} className="bg-[#150a26] border border-purple-500 px-4 py-2 font-sans">
                    <span className="font-pixel text-xs text-amber-400 mr-2">#{i + 1}</span>
                    <strong className="text-white mr-2">{f.name}</strong>
                    <span className="font-mono text-zinc-400">({Number(f.score).toFixed(2)} pts)</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </EndScene>
  );
};
