import React from 'react';
import { useEvent } from '../../../context/EventContext';
import { HelpCircle, ShieldAlert, Cpu, Award } from 'lucide-react';

export const TieBreakerOverlayView: React.FC = () => {
  const { state } = useEvent();
  const { activeTieBreaker, activeQuestion } = state;
  const q = activeQuestion.question;

  if (activeTieBreaker === 'NONE') return null;

  // Choose Theme configs based on active tie-breaker
  let themeTitle = '';
  let themeSub = '';
  let themeIcon = null;
  let bgStyle = '';
  let borderStyle = '';

  if (activeTieBreaker === 'ROUND_1_TIEBREAKER') {
    themeTitle = 'ROUND 1 TIE-BREAKER';
    themeSub = 'THEME: IT RIDDLES 🌳';
    themeIcon = <HelpCircle className="w-8 h-8 text-amber-300" />;
    bgStyle = 'bg-gradient-to-b from-[#2e1c0c] via-[#4a2e14] to-[#2e1c0c]';
    borderStyle = 'border-[#d97706]';
  } else if (activeTieBreaker === 'ROUND_2_TIEBREAKER') {
    themeTitle = 'ROUND 2 TIE-BREAKER';
    themeSub = 'THEME: CYBERSECURITY & NETWORK DEFENSE 🔥';
    themeIcon = <ShieldAlert className="w-8 h-8 text-red-400" />;
    bgStyle = 'bg-gradient-to-b from-[#180505] via-[#2a0808] to-[#180505]';
    borderStyle = 'border-[#ef4444]';
  } else if (activeTieBreaker === 'ROUND_3_TIEBREAKER') {
    themeTitle = 'FINAL TIE-BREAKER';
    themeSub = 'THEME: IT ARCHITECTURE / PIPELINES / FLOWCHARTS 🐉';
    themeIcon = <Cpu className="w-8 h-8 text-purple-400" />;
    bgStyle = 'bg-gradient-to-b from-[#0e0720] via-[#1e0e38] to-[#0e0720]';
    borderStyle = 'border-[#a855f7]';
  }

  return (
    <div className={`fixed inset-0 z-50 flex flex-col justify-between p-8 ${bgStyle} animate-[fadeIn_0.5s_ease-out]`}>
      {/* Tie-Breaker Header */}
      <div className={`bg-black/90 border-4 ${borderStyle} p-6 shadow-pixel-lg flex items-center justify-between`}>
        <div className="flex items-center gap-4">
          {themeIcon}
          <div>
            <div className="font-pixel text-xs bg-amber-500 text-black px-3 py-1 inline-block font-bold uppercase mb-1 shadow-pixel-sm">
              SUDDEN DEATH TIE-BREAKER
            </div>
            <h1 className="font-pixel text-2xl md:text-3xl text-white uppercase drop-shadow">
              {themeTitle}
            </h1>
            <p className="font-pixel text-xs md:text-sm text-amber-300 mt-1 uppercase">
              {themeSub}
            </p>
          </div>
        </div>

        <div className="font-pixel text-xs bg-red-600/90 text-white px-4 py-2 border border-red-400 animate-pulse">
          TIE-BREAKER IN PROGRESS
        </div>
      </div>

      {/* Tie-Breaker Question Body */}
      <div className="flex-1 flex flex-col items-center justify-center my-auto max-w-5xl mx-auto w-full">
        {q ? (
          <div className={`w-full bg-[#111216]/95 border-4 ${borderStyle} p-8 md:p-12 shadow-pixel-lg backdrop-blur-md`}>
            {/* Category / Points */}
            <div className="flex items-center justify-between mb-6">
              <span className="font-pixel text-xs text-amber-400 uppercase">
                {q.category}
              </span>
              <span className="font-pixel text-sm text-zinc-400">
                {q.difficulty} Difficulty
              </span>
            </div>

            {/* Question Text */}
            <h2 className="font-sans font-extrabold text-2xl md:text-4xl text-white leading-relaxed text-center mb-8 drop-shadow">
              {q.questionText}
            </h2>

            {/* Code / Flowchart Diagram */}
            {q.codeSnippet && (
              <div className="my-6 bg-[#030108] border-2 border-zinc-700 p-6 font-mono text-sm md:text-base text-cyan-300 overflow-x-auto rounded-sm whitespace-pre">
                <code>{q.codeSnippet}</code>
              </div>
            )}

            {/* Diagram Image if available */}
            {q.mediaUrl && (
              <div className="my-6 flex justify-center">
                <img
                  src={q.mediaUrl}
                  alt="Architecture / Flowchart diagram"
                  className="max-h-[420px] border-4 border-zinc-700 shadow-pixel object-contain"
                />
              </div>
            )}

            {/* Revealed Answer */}
            {activeQuestion.isAnswerRevealed && (
              <div className="mt-8 bg-gradient-to-r from-[#14532d] to-[#064e3b] border-4 border-[#4ade80] p-6 shadow-pixel animate-[fadeIn_0.5s_ease-out]">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-5 h-5 text-emerald-300" />
                  <span className="font-pixel text-xs text-emerald-300 uppercase font-bold tracking-wider">
                    RESOLVED ANSWER:
                  </span>
                </div>
                <div className="font-sans font-black text-2xl md:text-3xl text-[#fef08a] mb-2">
                  {q.correctAnswer}
                </div>
                {q.explanation && (
                  <p className="font-sans text-sm md:text-base text-emerald-100/90 leading-relaxed border-t border-emerald-700/50 pt-2 mt-2">
                    {q.explanation}
                  </p>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center p-12 bg-black/80 border-4 border-zinc-700 max-w-xl">
            <h3 className="font-pixel text-xl text-[#fef08a] mb-4">
              TIE-BREAKER ACTIVATED
            </h3>
            <p className="font-sans text-zinc-300 text-base">
              The quizmaster will select and present questions from the Admin Panel.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center font-mono text-xs text-zinc-400 bg-black/60 py-2 border-t border-zinc-800">
        Sudden Death Mode • Admin controls turn progression & resolves ties
      </div>
    </div>
  );
};
