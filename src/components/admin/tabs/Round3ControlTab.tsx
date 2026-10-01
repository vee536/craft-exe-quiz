import React from 'react';
import { useEvent } from '../../../context/EventContext';
import { Round3AttemptResult } from '../../../types';
import { CheckCircle, Clock, Eye, ShieldAlert, Trophy, XCircle } from 'lucide-react';

export const Round3ControlTab: React.FC = () => {
  const {
    state,
    openRound3Question,
    setRound3AnswerTimerDuration,
    setRound3BuzzerWindowDuration,
    setRound3BuzzerOpen,
    selectRound3BuzzedTeam,
    recordRound3Attempt,
    closeRound3Question,
    setCurrentRound,
    autoQualifyTop10R2,
  } = useEvent();
  const { round3, questionBanks, teams, activeQuestion } = state;
  const index = round3.currentQuestionIndex;
  const question = activeQuestion.question;
  const record = round3.questions[index];
  const finalists = teams.filter(team => team.isFinalistR3);
  const eligible = finalists.filter(team => !record?.attempts[team.id]);
  const ranked = [...finalists].sort((a, b) => b.score - a.score);

  const selectTeam = (teamId: string) => {
    if (teamId) selectRound3BuzzedTeam(teamId);
  };

  const resultButton = (result: Round3AttemptResult, label: string, color: string) => (
    <button
      onClick={() => recordRound3Attempt(result)}
      disabled={!round3.buzzerTeamId}
      className={`flex-1 ${color} disabled:opacity-40 disabled:cursor-not-allowed text-white font-pixel text-xs px-4 py-3 border shadow-pixel-sm flex items-center justify-center gap-2`}
    >
      {result === 'CORRECT' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
      {label}
    </button>
  );

  return (
    <div className="space-y-5">
      {finalists.length === 0 && (
        <div className="bg-amber-950/80 border-2 border-amber-400 p-4 shadow-pixel flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-amber-300">
            <ShieldAlert className="w-5 h-5 flex-shrink-0 text-amber-400" />
            <span className="font-sans text-xs">
              No finalists qualified for Round 3 yet. Advance the Top 10 teams from Round 2 now:
            </span>
          </div>
          <button
            onClick={autoQualifyTop10R2}
            className="bg-amber-400 hover:bg-amber-300 text-black font-pixel text-xs px-4 py-2 font-bold shadow-pixel-sm flex items-center gap-1.5"
          >
            Advance Top 10 to Round 3
          </button>
        </div>
      )}

      <section className="bg-[#18181b] border-2 border-purple-500/80 p-5 shadow-pixel">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-700 pb-3 mb-4">
          <div>
            <h2 className="font-pixel text-sm text-white uppercase">Round 3 Finals Buzzer</h2>
            <p className="text-xs text-zinc-400 mt-1">Every finalist is eligible once per question. Wrong answers reopen the buzzer for remaining teams.</p>
          </div>
          <button onClick={() => setCurrentRound('ROUND_3_SCOREBOARD')} className="bg-purple-800 hover:bg-purple-700 border border-purple-400 text-white font-pixel text-[10px] px-3 py-2 flex items-center gap-2">
            <Trophy className="w-4 h-4" /> PROJECTOR SCOREBOARD
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-4">
          <div>
            <label className="block font-pixel text-[10px] text-zinc-400 mb-2">ROUND 3 QUESTION BANK</label>
            <div className="flex flex-wrap gap-2">
              {questionBanks.round3Finals.map((item, questionIndex) => (
                <button
                  key={item.id}
                  onClick={() => openRound3Question(questionIndex)}
                  className={`border px-3 py-2 text-left ${index === questionIndex && question?.id === item.id ? 'bg-purple-900 border-purple-300 text-white font-bold' : 'bg-[#111215] border-zinc-700 text-zinc-300 hover:border-purple-400'}`}
                >
                  <span className="font-pixel text-[10px] block">QUESTION {questionIndex + 1} / {questionBanks.round3Finals.length}</span>
                  <span className="font-sans text-xs block mt-1 max-w-52 truncate">{item.category}</span>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-zinc-500 mt-2">Add, edit, delete, and attach diagrams in Question Banks.</p>
          </div>
          <div className="grid grid-cols-2 gap-2 min-w-[250px]">
            <label className="text-[10px] font-mono text-zinc-400">Answer time (sec)
              <input type="number" min="1" value={round3.answerTimerDurationSeconds} onChange={event => setRound3AnswerTimerDuration(Number(event.target.value) || 1)} className="block w-full mt-1 bg-black border border-zinc-700 px-2 py-2 text-white text-sm" />
            </label>
            <label className="text-[10px] font-mono text-zinc-400">Buzzer window (sec)
              <input type="number" min="1" value={round3.buzzerWindowDurationSeconds} onChange={event => setRound3BuzzerWindowDuration(Number(event.target.value) || 1)} className="block w-full mt-1 bg-black border border-zinc-700 px-2 py-2 text-white text-sm" />
            </label>
          </div>
        </div>
      </section>

      {question ? (
        <section className="bg-[#18181b] border-2 border-zinc-700 p-5 shadow-pixel">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-zinc-700 pb-3 mb-4">
            <div>
              <div className="font-pixel text-[10px] text-purple-300 mb-2">QUESTION {index + 1} / {questionBanks.round3Finals.length} • {question.category}</div>
              <h3 className="text-lg font-bold text-white">{question.questionText}</h3>
              {question.codeSnippet && <pre className="mt-3 p-3 bg-black text-emerald-300 font-mono text-xs overflow-x-auto whitespace-pre">{question.codeSnippet}</pre>}
              {question.mediaUrl && <img src={question.mediaUrl} alt="Final question diagram" className="mt-3 max-h-48 object-contain border border-zinc-700" />}
            </div>
            <div className="flex gap-2">
              <button onClick={() => closeRound3Question()} className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-600 px-3 py-2 text-xs text-zinc-200">CLOSE & REVEAL ANSWER</button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div className={`p-4 border ${round3.isBuzzerOpen ? 'bg-red-950 border-red-500' : 'bg-[#111215] border-zinc-700'}`}>
              <div className="font-pixel text-[10px] text-zinc-400 mb-2">BUZZER</div>
              <div className="text-2xl font-pixel text-white">{round3.isBuzzerOpen ? `${round3.buzzerWindowSecondsLeft}s` : round3.buzzerTeamId ? 'TEAM BUZZED' : 'CLOSED'}</div>
              <button onClick={() => setRound3BuzzerOpen(!round3.isBuzzerOpen)} disabled={Boolean(round3.buzzerTeamId) || eligible.length === 0 || activeQuestion.isAnswerRevealed} className="mt-3 w-full bg-red-700 hover:bg-red-600 disabled:opacity-40 border border-red-300 px-3 py-2 font-pixel text-[10px] text-white">
                {round3.isBuzzerOpen ? 'CLOSE BUZZER' : 'OPEN BUZZER'}
              </button>
            </div>
            <div className="p-4 bg-[#111215] border border-zinc-700">
              <div className="font-pixel text-[10px] text-zinc-400 mb-2">BUZZED TEAM</div>
              <select
                value={round3.buzzerTeamId || ''}
                onChange={event => selectTeam(event.target.value)}
                className="w-full bg-black border border-purple-500/80 px-2 py-2 text-white text-sm"
              >
                <option value="">{round3.buzzerTeamId ? 'Change team...' : 'Select team that buzzed...'}</option>
                {eligible.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}
              </select>
              {round3.buzzerTeamId && (
                <div className="mt-2 text-xs text-amber-300 font-pixel">
                  ACTIVE: {teams.find(team => team.id === round3.buzzerTeamId)?.name}
                </div>
              )}
            </div>
            <div className="p-4 bg-[#111215] border border-zinc-700">
              <div className="font-pixel text-[10px] text-zinc-400 mb-2 flex items-center gap-2"><Clock className="w-4 h-4" /> ANSWER TIMER</div>
              <div className="text-3xl font-pixel text-white">{round3.buzzerTeamId ? activeQuestion.timerSecondsLeft : '--'}</div>
              <div className="text-[11px] text-zinc-500 mt-2">Timer expiry records NO ANSWER and applies the penalty.</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {resultButton('CORRECT', 'CORRECT +100', 'bg-emerald-700 hover:bg-emerald-600 border-emerald-400')}
            {resultButton('WRONG', 'WRONG -50', 'bg-red-800 hover:bg-red-700 border-red-500')}
            {resultButton('NO_ANSWER', 'NO ANSWER -50', 'bg-zinc-700 hover:bg-zinc-600 border-zinc-400')}
          </div>

          {round3.lastResult && (
            <div className="mt-4 p-3 bg-[#111215] border border-zinc-700 flex flex-wrap items-center justify-between gap-2 text-sm">
              <span className="text-zinc-300">{teams.find(team => team.id === round3.lastResult?.teamId)?.name}: <strong className="text-white">{round3.lastResult.result.replace('_', ' ')}</strong></span>
              <span className={round3.lastResult.scoreChange >= 0 ? 'text-emerald-400 font-bold' : 'text-red-400 font-bold'}>{round3.lastResult.scoreChange > 0 ? '+' : ''}{round3.lastResult.scoreChange} PTS</span>
              {activeQuestion.isAnswerRevealed && <span className="text-amber-300 flex items-center gap-1"><Eye className="w-4 h-4" /> {question.correctAnswer}</span>}
            </div>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-zinc-400">
            <span>{eligible.length} finalist{eligible.length === 1 ? '' : 's'} still eligible on this question</span>
            <span>Attempts recorded: {Object.keys(record?.attempts || {}).length} / {finalists.length}</span>
            {index < questionBanks.round3Finals.length - 1 && <button onClick={() => openRound3Question(index + 1)} className="bg-purple-700 hover:bg-purple-600 px-4 py-2 font-pixel text-[10px] text-white">NEXT QUESTION</button>}
            {index === questionBanks.round3Finals.length - 1 && <button onClick={() => setCurrentRound('ROUND_3_SCOREBOARD')} className="bg-amber-500 hover:bg-amber-400 px-4 py-2 font-pixel text-[10px] text-black">FINAL SCOREBOARD</button>}
          </div>
        </section>
      ) : (
        <div className="bg-[#18181b] border-2 border-purple-500/50 p-8 text-center text-zinc-300">
          <p className="font-pixel text-sm text-purple-300 mb-3">QUESTION READY TO PRESENT</p>
          <p className="text-xs text-zinc-400 mb-4 max-w-md mx-auto">
            Click below to load Question 1 on the Projector and enable buzzer controls:
          </p>
          <button
            onClick={() => openRound3Question(0)}
            className="bg-purple-600 hover:bg-purple-500 text-white font-pixel text-xs px-6 py-3 font-bold shadow-pixel"
          >
            PRESENT QUESTION 1 NOW
          </button>
        </div>
      )}

      <section className="bg-[#18181b] border-2 border-zinc-700 p-5 shadow-pixel overflow-x-auto">
        <h3 className="font-pixel text-xs text-white mb-3">FINALIST SCOREBOARD</h3>
        <table className="w-full text-left text-xs">
          <thead className="text-zinc-400 font-pixel text-[9px] border-b border-zinc-700"><tr><th className="py-2">TEAM</th><th>ROUND 2</th><th>NORMALIZED START</th><th>ROUND 3 CHANGE</th><th className="text-right">FINAL SCORE</th></tr></thead>
          <tbody className="divide-y divide-zinc-800">{ranked.map(team => {
            const scoreChange = round3.questions.reduce((total, questionRecord) => total + (questionRecord.attempts[team.id]?.scoreChange || 0), 0);
            return <tr key={team.id}><td className="py-2 font-bold text-white">{team.name}</td><td className="font-mono text-zinc-300">{team.round2Score}</td><td className="font-mono text-purple-300">{team.round3StartingScore.toFixed(2)}</td><td className={`font-mono ${scoreChange >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{scoreChange > 0 ? '+' : ''}{scoreChange}</td><td className="text-right font-pixel text-amber-300">{team.score.toFixed(2)}</td></tr>;
          })}</tbody>
        </table>
      </section>
    </div>
  );
};