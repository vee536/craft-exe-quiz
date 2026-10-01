import express from 'express';
import { db } from '../firebase.js';
import { generateRoundCsv, generateRound2WagerCsv } from '../utils/csvExporter.js';
import { createReadStream, existsSync, readdirSync, unlinkSync } from 'fs';
import path from 'path';

const router = express.Router();
const EVENT_ID = process.env.EVENT_ID || 'craft_exe_2024';

/**
 * POST /api/events/question-result
 * Saves a single question result after it's answered.
 */
router.post('/question-result', async (req, res) => {
  try {
    const data = req.body;
    const required = ['questionId', 'round', 'teamId', 'isCorrect'];
    for (const field of required) {
      if (data[field] === undefined || data[field] === null) {
        return res.status(400).json({ error: `Missing required field: ${field}` });
      }
    }

    const docRef = db
      .collection('events')
      .doc(EVENT_ID)
      .collection('question_results')
      .doc();

    const isWagerRound = data.round === 'ROUND_2_WAGER' || data.round === 'ROUND_2' || data.roundType === 'WAGER_ROUND';

    await docRef.set({
      questionId: data.questionId,
      questionNumber: data.questionNumber ?? null,
      questionIndex: data.questionIndex ?? null,
      category: data.category || '',
      questionText: data.questionText || '',
      correctAnswer: data.correctAnswer || '',
      round: data.round,
      roundType: isWagerRound ? 'WAGER_ROUND' : (data.roundType || 'STANDARD'),
      bankKey: data.bankKey || null,
      teamId: data.teamId,
      teamName: data.teamName || data.teamId,
      wager: data.wager !== undefined ? Number(data.wager) : (isWagerRound ? 100 : null),
      isDouble: Boolean(data.isDouble || data.isBlazeWager),
      isBlazeWager: Boolean(data.isBlazeWager || data.isDouble),
      isCorrect: Boolean(data.isCorrect),
      isSteal: Boolean(data.isSteal),
      teamScoreBefore: data.teamScoreBefore ?? null,
      scoreDelta: data.scoreDelta ?? null,
      teamScoreAfter: data.teamScoreAfter ?? null,
      allTeamScores: data.allTeamScores || {},
      answeredAt: new Date(),
    });

    console.log(`[Events] Question result saved: ${data.questionId} | Team: ${data.teamName} | Wager: ${data.wager ?? 'N/A'} | Correct: ${data.isCorrect}`);
    res.json({ success: true, docId: docRef.id });
  } catch (err) {
    console.error('[Events] question-result error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * POST /api/events/round-complete
 * Saves a rich round summary to Firestore and generates a CSV file.
 */
router.post('/round-complete', async (req, res) => {
  try {
    const { round, teams, round2Wager, round2Questions, round3State, round3Questions } = req.body;
    if (!round || !Array.isArray(teams)) {
      return res.status(400).json({ error: 'round and teams are required' });
    }

    const now = new Date();
    const isRound2 = round === 'ROUND_2' || round.startsWith('ROUND_2');
    let docData;
    let csvPath;

    if (isRound2) {
      // Specialized Wager Round Document Structure
      const r2Teams = teams.filter(t => t.isQualifiedR2).sort((a, b) => b.round2Score - a.round2Score);
      const finalists = r2Teams.filter(t => t.isFinalistR3);
      const maxScore = r2Teams[0]?.round2Score || 0;

      // 1. Build team standings with individual 8-question wager breakdown
      const standings = r2Teams.map((team, idx) => {
        let doubleUsedAt = team.doubleUsedAtQuestion || null;
        let doubleResult = null;
        let correctCount = 0;
        let wrongCount = 0;

        const wagerHistory = [];
        for (let qIdx = 0; qIdx < 8; qIdx++) {
          const qRec = round2Wager?.questions?.[qIdx];
          const sub = qRec?.wagers?.[team.id];
          const qObj = round2Questions?.[qIdx];
          const wagerVal = sub?.wager || 100;
          const isDbl = Boolean(sub?.isDouble);
          if (isDbl) {
            doubleUsedAt = qIdx + 1;
            if (sub?.isCorrect !== null && sub?.isCorrect !== undefined) {
              doubleResult = sub.isCorrect ? 'CORRECT' : 'WRONG';
            }
          }
          if (sub?.isCorrect === true) correctCount++;
          if (sub?.isCorrect === false) wrongCount++;

          wagerHistory.push({
            questionNumber: qIdx + 1,
            questionId: qObj?.id || `r2-q${qIdx + 1}`,
            category: qObj?.category || '',
            wager: wagerVal,
            isDouble: isDbl,
            isCorrect: sub?.isCorrect ?? null,
            delta: sub?.appliedDelta ?? 0,
          });
        }

        return {
          rank: idx + 1,
          teamId: team.id,
          teamName: team.name,
          finalR2Score: team.round2Score,
          round1Score: team.round1Score,
          isFinalistR3: Boolean(team.isFinalistR3),
          round3StartingScore: team.round3StartingScore || (maxScore > 0 ? Number(((team.round2Score / maxScore) * 100).toFixed(2)) : 0),
          doubleUsedAtQuestion: doubleUsedAt,
          doubleResult: doubleResult,
          correctAnswersCount: correctCount,
          wrongAnswersCount: wrongCount,
          wagers: wagerHistory,
        };
      });

      // 2. Build question matrix with each team's wager and result
      const questionsList = Array.from({ length: 8 }).map((_, qIdx) => {
        const qObj = round2Questions?.[qIdx];
        const qRec = round2Wager?.questions?.[qIdx];
        let correctCount = 0;
        let wrongCount = 0;
        let doublesCount = 0;

        const teamWagers = r2Teams.map(t => {
          const sub = qRec?.wagers?.[t.id];
          if (sub?.isDouble) doublesCount++;
          if (sub?.isCorrect === true) correctCount++;
          if (sub?.isCorrect === false) wrongCount++;
          return {
            teamId: t.id,
            teamName: t.name,
            wager: sub?.wager || 100,
            isDouble: Boolean(sub?.isDouble),
            isCorrect: sub?.isCorrect ?? null,
            scoreDelta: sub?.appliedDelta ?? 0,
          };
        });

        return {
          questionNumber: qIdx + 1,
          questionId: qObj?.id || `r2-q${qIdx + 1}`,
          category: qObj?.category || `Question ${qIdx + 1}`,
          questionText: qObj?.questionText || '',
          correctAnswer: qObj?.correctAnswer || '',
          isScored: Boolean(qRec?.isScored),
          doublesDeclaredCount: doublesCount,
          correctAnswersCount: correctCount,
          wrongAnswersCount: wrongCount,
          teamWagers,
        };
      });

      docData = {
        round: 'ROUND_2',
        roundType: 'WAGER_ROUND',
        roundTitle: 'Dimension II: The Nether (All-Team Wager Round)',
        completedAt: now,
        scoringRules: {
          wagerTiers: [100, 200, 300, 400],
          normalScoring: 'Correct: +Wager, Wrong: -50',
          doublePowerUp: 'One-time Blaze Rod: Correct +2xWager, Wrong: -100',
          scoreFloor: 'Scores cannot drop below 0 points',
          advancingFinalistsCount: 10,
        },
        summary: {
          totalQualifiedTeams: r2Teams.length,
          finalistsSelected: finalists.length,
          highestR2Score: maxScore,
          questionsScored: round2Wager?.questions?.filter(q => q.isScored).length || 0,
          totalQuestions: 8,
        },
        standings,
        questions: questionsList,
        allTeams: teams.map(t => ({
          id: t.id,
          name: t.name,
          round1Score: t.round1Score,
          round2Score: t.round2Score,
          score: t.score,
          isQualifiedR2: t.isQualifiedR2,
          isFinalistR3: t.isFinalistR3,
        })),
      };

      csvPath = generateRound2WagerCsv(round2Wager, teams, round2Questions);
    } else {
      // Standard Round Document Structure
      docData = {
        round,
        completedAt: now,
        teams: teams.map((t) => ({
          id: t.id,
          name: t.name,
          score: t.score,
          round1Score: t.round1Score,
          round2Score: t.round2Score,
          round3StartingScore: t.round3StartingScore,
          isQualifiedR2: t.isQualifiedR2,
          isFinalistR3: t.isFinalistR3,
        })),
      };

      // Fetch all question results matching this round prefix
      const resultsSnap = await db
        .collection('events')
        .doc(EVENT_ID)
        .collection('question_results')
        .where('round', '>=', round)
        .where('round', '<=', round + '\uf8ff')
        .get();

      const results = resultsSnap.docs.map((d) => d.data());
      csvPath = generateRoundCsv(round, results, teams);
    }

    // Determine dedicated separate root collection
    const colName = isRound2 ? 'round_2_wager_results' : round.startsWith('ROUND_3') ? 'round_3_finals_results' : 'round_1_results';
    const timeId = now.toISOString().replace(/[:.]/g, '-');

    // 1. Write to separate top-level root collection (both 'latest' and timestamped history)
    await db.collection(colName).doc('latest').set(docData);
    await db.collection(colName).doc(timeId).set(docData);

    // 2. Also write to events/{EVENT_ID}/round_summaries/{round} for backward compatibility
    await db
      .collection('events')
      .doc(EVENT_ID)
      .collection('round_summaries')
      .doc(round)
      .set(docData);

    console.log(`[Events] Round ${round} summary saved to root collection '${colName}' and 'round_summaries'. CSV: ${csvPath}`);
    res.json({ success: true, collection: colName, csvPath, docData });
  } catch (err) {
    console.error('[Events] round-complete error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/events/:eventId/export/:round
 * Download the most recent CSV for a given round.
 */
router.get('/:eventId/export/:round', (req, res) => {
  const { round } = req.params;
  const exportsDir = path.join(process.cwd(), 'exports');

  let files;
  try {
    files = readdirSync(exportsDir).filter((f) => f.startsWith(round.toLowerCase()) && f.endsWith('.csv'));
  } catch {
    return res.status(404).json({ error: 'No exports found' });
  }

  if (files.length === 0) {
    return res.status(404).json({ error: `No CSV found for round: ${round}` });
  }

  files.sort();
  const latestFile = path.join(exportsDir, files[files.length - 1]);

  if (!existsSync(latestFile)) {
    return res.status(404).json({ error: 'CSV file not found on disk' });
  }

  res.setHeader('Content-Disposition', `attachment; filename="${path.basename(latestFile)}"`);
  res.setHeader('Content-Type', 'text/csv');
  createReadStream(latestFile).pipe(res);
});

/**
 * GET /api/events/round-summary/:round
 * Fetch stored Firestore summary for a given round.
 */
router.get('/round-summary/:round', async (req, res) => {
  try {
    const { round } = req.params;
    const isRound2 = round === 'ROUND_2' || round.startsWith('ROUND_2');
    const colName = isRound2 ? 'round_2_wager_results' : round.startsWith('ROUND_3') ? 'round_3_finals_results' : 'round_1_results';

    // 1. Try dedicated root collection first
    const rootSnap = await db.collection(colName).doc('latest').get();
    if (rootSnap.exists) {
      return res.json({ success: true, round, collection: colName, data: rootSnap.data() });
    }

    // 2. Fallback to events/{EVENT_ID}/round_summaries/{round}
    const docRef = db.collection('events').doc(EVENT_ID).collection('round_summaries').doc(round);
    const snap = await docRef.get();
    if (snap.exists) {
      return res.json({ success: true, round, collection: 'round_summaries', data: snap.data() });
    }

    res.status(404).json({ error: `No summary found for round: ${round}` });
  } catch (err) {
    console.error('[Events] GET round-summary error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/events/question-results/:round
 * Fetch all question results for a given round from Firestore.
 */
router.get('/question-results/:round', async (req, res) => {
  try {
    const { round } = req.params;
    const snap = await db
      .collection('events')
      .doc(EVENT_ID)
      .collection('question_results')
      .where('round', '>=', round)
      .where('round', '<=', round + '\uf8ff')
      .get();

    const results = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    results.sort((a, b) => {
      const aTime = a.answeredAt?._seconds || 0;
      const bTime = b.answeredAt?._seconds || 0;
      return aTime - bTime;
    });

    res.json({ success: true, count: results.length, results });
  } catch (err) {
    console.error('[Events] GET question-results error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/events/round-data/:round
 * Deletes Firestore summary and question results for a given round, plus matching CSV files.
 */
router.delete('/round-data/:round', async (req, res) => {
  try {
    const { round } = req.params;
    const isRound2 = round === 'ROUND_2' || round.startsWith('ROUND_2');
    const colName = isRound2 ? 'round_2_wager_results' : round.startsWith('ROUND_3') ? 'round_3_finals_results' : 'round_1_results';
    let deletedQuestionsCount = 0;

    // 1. Delete all docs in separate root collection
    const rootDocs = await db.collection(colName).get();
    if (!rootDocs.empty) {
      const batch = db.batch();
      rootDocs.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
    }

    // 2. Delete round summary document
    const summaryRef = db.collection('events').doc(EVENT_ID).collection('round_summaries').doc(round);
    await summaryRef.delete();

    // 3. Delete question_results for this round
    const snap = await db
      .collection('events')
      .doc(EVENT_ID)
      .collection('question_results')
      .where('round', '>=', round)
      .where('round', '<=', round + '\uf8ff')
      .get();

    if (!snap.empty) {
      const batch = db.batch();
      snap.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();
      deletedQuestionsCount = snap.docs.length;
    }

    // 3. Delete matching CSV files in exports folder
    const exportsDir = path.join(process.cwd(), 'exports');
    if (existsSync(exportsDir)) {
      const files = readdirSync(exportsDir);
      files.forEach((file) => {
        if (file.toLowerCase().startsWith(round.toLowerCase())) {
          try {
            unlinkSync(path.join(exportsDir, file));
          } catch {}
        }
      });
    }

    console.log(`[Events] Deleted data for round: ${round} (${deletedQuestionsCount} questions)`);
    res.json({ success: true, round, deletedQuestionsCount });
  } catch (err) {
    console.error('[Events] DELETE round-data error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/events/reset-all
 * Resets all Firestore event data (round_summaries and question_results) and clears exports.
 */
router.delete('/reset-all', async (req, res) => {
  try {
    let deletedSummariesCount = 0;
    let deletedQuestionsCount = 0;

    // 1. Delete all round summaries in subcollection and root collections
    for (const c of ['round_1_results', 'round_2_wager_results', 'round_3_finals_results']) {
      const snap = await db.collection(c).get();
      if (!snap.empty) {
        const batch = db.batch();
        snap.docs.forEach((doc) => batch.delete(doc.ref));
        await batch.commit();
      }
    }

    const summariesSnap = await db.collection('events').doc(EVENT_ID).collection('round_summaries').get();
    if (!summariesSnap.empty) {
      const batch = db.batch();
      summariesSnap.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
      deletedSummariesCount = summariesSnap.docs.length;
    }

    // 2. Delete all question results
    const questionsSnap = await db.collection('events').doc(EVENT_ID).collection('question_results').get();
    if (!questionsSnap.empty) {
      const batch = db.batch();
      questionsSnap.docs.forEach((doc) => batch.delete(doc.ref));
      await batch.commit();
      deletedQuestionsCount = questionsSnap.docs.length;
    }

    // 3. Delete all CSV files in exports
    const exportsDir = path.join(process.cwd(), 'exports');
    if (existsSync(exportsDir)) {
      const files = readdirSync(exportsDir);
      files.forEach((file) => {
        if (file.endsWith('.csv')) {
          try {
            unlinkSync(path.join(exportsDir, file));
          } catch {}
        }
      });
    }

    console.log(`[Events] Reset all event data: ${deletedSummariesCount} summaries, ${deletedQuestionsCount} questions deleted.`);
    res.json({ success: true, deletedSummariesCount, deletedQuestionsCount });
  } catch (err) {
    console.error('[Events] DELETE reset-all error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
