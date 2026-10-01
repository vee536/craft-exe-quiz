import express from 'express';
import { db } from '../firebase.js';

const router = express.Router();

const EVENT_ID = process.env.EVENT_ID || 'craft_exe_2024';

/**
 * POST /api/questions/sync
 * Body: { questions: Array<{ id, bankKey, category, points, difficulty, questionText, correctAnswer, explanation?, mediaUrl?, codeSnippet? }> }
 * Upserts all questions into Firestore `questions` collection.
 */
router.post('/sync', async (req, res) => {
  try {
    const { questions } = req.body;
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ error: 'questions array is required' });
    }

    const batch = db.batch();
    const now = new Date();

    for (const q of questions) {
      if (!q.id) continue;
      const ref = db.collection('questions').doc(q.id);
      batch.set(ref, {
        id: q.id,
        bankKey: q.bankKey || 'unknown',
        category: q.category || '',
        points: q.points || 0,
        difficulty: q.difficulty || 'Easy',
        questionText: q.questionText || '',
        correctAnswer: q.correctAnswer || '',
        explanation: q.explanation || null,
        mediaUrl: q.mediaUrl || null,
        codeSnippet: q.codeSnippet || null,
        syncedAt: now,
      }, { merge: true });
    }

    await batch.commit();
    console.log(`[Questions] Synced ${questions.length} questions to Firestore`);
    res.json({ success: true, synced: questions.length });
  } catch (err) {
    console.error('[Questions] Sync error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * DELETE /api/questions/:id
 * Removes a single question from the Firestore `questions` collection.
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) return res.status(400).json({ error: 'Question id is required' });

    await db.collection('questions').doc(id).delete();
    console.log(`[Questions] Deleted question: ${id}`);
    res.json({ success: true, deleted: id });
  } catch (err) {
    console.error('[Questions] Delete error:', err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
