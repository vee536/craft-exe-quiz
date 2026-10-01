/**
 * Client-Side CSV Exporter Utility for CRAFT.exe IT Quiz
 * Generates clean, Excel-compatible CSV files with UTF-8 BOM.
 */

export function downloadCsvFile(filename: string, content: string): void {
  // \uFEFF is UTF-8 Byte Order Mark, ensuring Excel displays commas & formatting correctly
  const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Exports Round 1 Overworld Results as CSV
 */
export function exportRound1ToCsv(teams: any[]): void {
  const sorted = [...teams].sort((a, b) => (b.round1Score ?? 0) - (a.round1Score ?? 0));
  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  const filename = `round_1_overworld_results_${timestamp}.csv`;

  const lines: string[] = [];
  lines.push('CRAFT.exe - ROUND 1: THE OVERWORLD (PEN & PAPER RESULTS)');
  lines.push(`Exported At,${new Date().toLocaleString()}`);
  lines.push('Rules,15 Questions Pen & Paper Test; Top 20 Teams Advance to Round 2');
  lines.push('');
  lines.push('Rank,Team Name,Round 1 Score (/15),Status,Advances to Round 2?');

  sorted.forEach((t, idx) => {
    const rank = idx + 1;
    const name = `"${(t.name || '').replace(/"/g, '""')}"`;
    const score = t.round1Score ?? 0;
    const isQual = t.isQualifiedR2 || rank <= 20;
    const status = isQual ? 'QUALIFIED' : 'ELIMINATED';
    const adv = isQual ? 'YES - Advances to The Nether' : 'NO';
    lines.push(`${rank},${name},${score},${status},${adv}`);
  });

  lines.push('');
  lines.push(`Total Contestants,${sorted.length}`);
  lines.push(`Advancing Qualifiers,${sorted.filter((t, i) => t.isQualifiedR2 || i < 20).length}`);
  lines.push(`20th Place Cutoff Score,${sorted[19]?.round1Score ?? 'N/A'}`);

  downloadCsvFile(filename, lines.join('\r\n'));
}

/**
 * Exports Round 2 Nether Wager Results as CSV
 */
export function exportRound2ToCsv(
  teams: any[],
  standings: any[] = [],
  questions: any[] = []
): void {
  const r2Teams = [...teams]
    .filter((t: any) => t.isQualifiedR2)
    .sort((a: any, b: any) => (b.round2Score ?? 0) - (a.round2Score ?? 0));

  const timestamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  const filename = `round_2_wager_matrix_${timestamp}.csv`;

  const lines: string[] = [];
  lines.push('CRAFT.exe - ROUND 2: THE NETHER (ALL-TEAM WAGER ROUND) SCORE MATRIX');
  lines.push(`Exported At,${new Date().toLocaleString()}`);
  lines.push('Scoring Rules,Normal: Correct +Wager / Wrong -50; DOUBLE: Correct +2xWager / Wrong -100; Score floored at 0');
  lines.push('Advancement,Top 10 Teams Advance to Dimension III: The End');
  lines.push('');

  // Headers for all 8 questions
  const qHeaders: string[] = [];
  for (let i = 1; i <= 8; i++) {
    qHeaders.push(`Q${i} Wager,Q${i} Result,Q${i} Delta`);
  }
  lines.push(`Rank,Team Name,Final R2 Score,Double Used At,Double Result,Top 10 Finalist?,R3 Starting Score,${qHeaders.join(',')}`);

  const maxScore = r2Teams[0]?.round2Score || 0;

  r2Teams.forEach((team, idx) => {
    const rank = idx + 1;
    const name = `"${(team.name || '').replace(/"/g, '""')}"`;
    const score = team.round2Score ?? 0;
    const standing = standings.find((s: any) => s.teamId === team.id);
    const isFinalist = team.isFinalistR3 || rank <= 10 ? 'YES (Finalist)' : 'NO (Eliminated)';
    const doubleAt = standing?.doubleUsedAtQuestion || team.doubleUsedAtQuestion ? `Q${standing?.doubleUsedAtQuestion || team.doubleUsedAtQuestion}` : 'Not Used';
    const doubleRes = standing?.doubleResult || (doubleAt !== 'Not Used' ? 'COMPLETED' : 'N/A');
    const r3Start = team.round3StartingScore !== undefined && team.round3StartingScore > 0
      ? team.round3StartingScore
      : maxScore > 0
      ? Number(((score / maxScore) * 100).toFixed(2))
      : 0;

    const qCols: string[] = [];
    for (let qIdx = 0; qIdx < 8; qIdx++) {
      const qRec = questions[qIdx];
      const sub = qRec?.wagers?.[team.id] || standing?.wagers?.[qIdx];
      const wagerVal = sub?.wager || 100;
      const isDouble = Boolean(sub?.isDouble);
      const isCorrect = sub?.isCorrect;
      const doubleLabel = isDouble ? ' (2x DOUBLE)' : '';
      const resultText = isCorrect === true ? `CORRECT${doubleLabel}` : isCorrect === false ? `WRONG${doubleLabel}` : 'UNANSWERED';
      const delta = sub?.scoreDelta !== undefined ? sub.scoreDelta : sub?.delta !== undefined ? sub.delta : (sub?.appliedDelta ?? 0);

      qCols.push(`${wagerVal},"${resultText}",${delta > 0 ? '+' : ''}${delta}`);
    }

    lines.push(`${rank},${name},${score},${doubleAt},${doubleRes},${isFinalist},${r3Start},${qCols.join(',')}`);
  });

  lines.push('');
  lines.push('ROUND 2 QUESTIONS AUDIT');
  lines.push('Question #,Category,Question Text,Correct Answer');
  (questions || []).forEach((q: any, idx: number) => {
    const num = idx + 1;
    const cat = `"${(q.category || `Question ${num}`).replace(/"/g, '""')}"`;
    const text = `"${(q.questionText || '').replace(/"/g, '""')}"`;
    const ans = `"${(q.correctAnswer || '').replace(/"/g, '""')}"`;
    lines.push(`${num},${cat},${text},${ans}`);
  });

  downloadCsvFile(filename, lines.join('\r\n'));
}
