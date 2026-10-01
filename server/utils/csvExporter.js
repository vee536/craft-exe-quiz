import { writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const EXPORTS_DIR = join(__dirname, '..', 'exports');

// Ensure exports directory exists
try { mkdirSync(EXPORTS_DIR, { recursive: true }); } catch {}

/**
 * Generate a specialized CSV for Round 2 Wager Round.
 */
export function generateRound2WagerCsv(round2Wager, teams, questions) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = `round_2_wager_${timestamp}.csv`;
  const filepath = join(EXPORTS_DIR, filename);

  const r2Teams = teams.filter(t => t.isQualifiedR2).sort((a, b) => b.round2Score - a.round2Score);
  const lines = [];

  // Title
  lines.push('CRAFT.exe - ROUND 2: THE NETHER (ALL-TEAM WAGER ROUND) SCORE REPORT');
  lines.push(`Exported At,${new Date().toISOString()}`);
  lines.push('Scoring Rules,Normal: Correct +Wager / Wrong -50; DOUBLE: Correct +2xWager / Wrong -100; Score floored at 0');
  lines.push('');

  // Section 1: Comprehensive Team Wager Matrix
  lines.push('ROUND 2 TEAM MATRIX (ALL 8 QUESTIONS)');
  const qHeaders = [];
  for (let i = 1; i <= 8; i++) {
    qHeaders.push(`Q${i} Wager,Q${i} Result,Q${i} Delta`);
  }
  lines.push(`Rank,Team Name,Final R2 Score,Double Used At,Top 10 Finalist?,R3 Starting Score,${qHeaders.join(',')}`);

  r2Teams.forEach((team, idx) => {
    const isFinalist = team.isFinalistR3 ? 'YES' : 'NO';
    const doubleAt = team.doubleUsedAtQuestion ? `Q${team.doubleUsedAtQuestion}` : 'Not Used';
    const qCols = [];

    for (let qIdx = 0; qIdx < 8; qIdx++) {
      const qRec = round2Wager?.questions?.[qIdx];
      const sub = qRec?.wagers?.[team.id];
      const wagerVal = sub?.wager || 100;
      const isDouble = sub?.isDouble ? ' (2x DOUBLE)' : '';
      const ansResult = sub?.isCorrect === true ? `CORRECT${isDouble}` : sub?.isCorrect === false ? `WRONG${isDouble}` : 'UNANSWERED';
      const deltaVal = sub?.appliedDelta !== undefined ? sub.appliedDelta : (sub?.isCorrect === true ? (sub.isDouble ? wagerVal * 2 : wagerVal) : sub?.isCorrect === false ? (sub.isDouble ? -100 : -50) : 0);
      qCols.push(`${wagerVal},"${ansResult}",${deltaVal > 0 ? '+' : ''}${deltaVal}`);
    }

    lines.push([
      idx + 1,
      `"${team.name.replace(/"/g, '""')}"`,
      team.round2Score,
      doubleAt,
      isFinalist,
      team.round3StartingScore || 0,
      qCols.join(','),
    ].join(','));
  });

  lines.push('');
  lines.push('ROUND 2 QUESTIONS AUDIT');
  lines.push('Question #,Category,Question Text,Correct Answer');
  (questions || []).forEach((q, idx) => {
    lines.push([
      idx + 1,
      `"${(q.category || '').replace(/"/g, '""')}"`,
      `"${(q.questionText || '').replace(/"/g, '""')}"`,
      `"${(q.correctAnswer || '').replace(/"/g, '""')}"`,
    ].join(','));
  });

  writeFileSync(filepath, lines.join('\n'), 'utf8');
  return filepath;
}

/**
 * Generate a standard CSV for question-by-question results within any round.
 */
export function generateRoundCsv(round, results, teams) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const roundLabel = round.toLowerCase().replace(/_/g, '_');
  const filename = `${roundLabel}_${timestamp}.csv`;
  const filepath = join(EXPORTS_DIR, filename);

  const resultRows = results.map((r) => ({
    round: r.round || round,
    bank: r.bankKey || '',
    question: `"${(r.questionText || '').replace(/"/g, '""')}"`,
    answer: `"${(r.correctAnswer || '').replace(/"/g, '""')}"`,
    team: r.teamName || r.teamId || '',
    correct: r.isCorrect ? 'YES' : 'NO',
    steal: r.isSteal ? 'YES' : 'NO',
    blaze: r.isBlazeWager ? 'YES' : 'NO',
    score_before: r.teamScoreBefore ?? '',
    score_delta: r.scoreDelta ?? '',
    score_after: r.teamScoreAfter ?? '',
    timestamp: r.answeredAt ? new Date(r.answeredAt._seconds * 1000).toISOString() : '',
  }));

  const sortedTeams = [...teams].sort((a, b) => b.score - a.score);
  const summaryRows = sortedTeams.map((t, i) => ({
    rank: i + 1,
    team: t.name || t.id,
    round1Score: t.round1Score ?? '',
    round2Score: t.round2Score ?? '',
    finalScore: t.score ?? '',
    qualifiedR2: t.isQualifiedR2 ? 'YES' : 'NO',
    finalistR3: t.isFinalistR3 ? 'YES' : 'NO',
  }));

  const lines = [];

  lines.push('QUESTION RESULTS');
  lines.push('Round,Bank,Question,Correct Answer,Team,Correct?,Steal?,BlazeWager?,Score Before,Score Delta,Score After,Timestamp');
  for (const r of resultRows) {
    lines.push(
      [r.round, r.bank, r.question, r.answer, r.team, r.correct, r.steal, r.blaze,
        r.score_before, r.score_delta, r.score_after, r.timestamp].join(',')
    );
  }

  lines.push('');
  lines.push('ROUND SUMMARY');
  lines.push('Rank,Team,Round1 Score,Round2 Score,Final Score,Qualified R2?,Finalist R3?');
  for (const s of summaryRows) {
    lines.push(
      [s.rank, s.team, s.round1Score, s.round2Score, s.finalScore, s.qualifiedR2, s.finalistR3].join(',')
    );
  }

  writeFileSync(filepath, lines.join('\n'), 'utf8');
  return filepath;
}
