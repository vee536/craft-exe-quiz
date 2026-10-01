import { EventState, Question, Team } from '../types';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// ─── Helpers ────────────────────────────────────────────────────────────────

async function post(path: string, body: unknown): Promise<unknown> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: res.statusText }));
      console.warn(`[API] POST ${path} failed:`, err);
      return null;
    }
    return res.json();
  } catch (e) {
    console.warn(`[API] POST ${path} network error:`, e);
    return null;
  }
}

async function get(path: string): Promise<any> {
  try {
    const res = await fetch(`${BASE_URL}${path}`);
    if (!res.ok) {
      return null;
    }
    return res.json();
  } catch (e) {
    console.warn(`[API] GET ${path} network error:`, e);
    return null;
  }
}

/**
 * Checks if the backend Express API server is running and reachable.
 */
export async function checkServerHealth(): Promise<boolean> {
  try {
    const res = await fetch(`${BASE_URL}/api/health`);
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Fetches the saved Firestore round summary for a given round.
 */
export async function fetchRoundSummary(round: string): Promise<any> {
  const res = await get(`/api/events/round-summary/${round}`);
  return res?.data || null;
}

/**
 * Fetches all question results for a given round from Firestore.
 */
export async function fetchQuestionResults(round: string): Promise<any[]> {
  const res = await get(`/api/events/question-results/${round}`);
  return res?.results || [];
}

async function del(path: string): Promise<any> {
  try {
    const res = await fetch(`${BASE_URL}${path}`, { method: 'DELETE' });
    if (!res.ok) {
      return null;
    }
    return res.json();
  } catch (e) {
    console.warn(`[API] DELETE ${path} network error:`, e);
    return null;
  }
}

/**
 * Deletes stored Firestore summary and question results for a given round.
 */
export async function deleteRoundData(round: string): Promise<boolean> {
  const res = await del(`/api/events/round-data/${round}`);
  return Boolean(res?.success);
}

/**
 * Resets all Firestore event data (round summaries, question results, and exports).
 */
export async function resetAllEventData(): Promise<boolean> {
  const res = await del('/api/events/reset-all');
  return Boolean(res?.success);
}

// ─── Questions ───────────────────────────────────────────────────────────────

/**
 * Syncs all question banks to Firestore.
 * Call once when the admin panel loads or when question banks are edited.
 */
export async function syncAllQuestions(questionBanks: EventState['questionBanks']): Promise<void> {
  const questions: Array<Question & { bankKey: string }> = [];

  for (const [bankKey, bank] of Object.entries(questionBanks)) {
    for (const q of bank as Question[]) {
      questions.push({ ...q, bankKey });
    }
  }

  if (questions.length === 0) return;

  await post('/api/questions/sync', { questions });
  console.log(`[API] Synced ${questions.length} questions to Firestore`);
}

/**
 * Upsert a single question to Firestore (called on add or edit).
 */
export async function syncOneQuestion(bankKey: string, question: Question): Promise<void> {
  await post('/api/questions/sync', { questions: [{ ...question, bankKey }] });
}

/**
 * Delete a single question from Firestore by its ID.
 */
export async function deleteQuestionFromDb(questionId: string): Promise<void> {
  try {
    await fetch(`${BASE_URL}/api/questions/${encodeURIComponent(questionId)}`, {
      method: 'DELETE',
    });
  } catch (e) {
    console.warn(`[API] DELETE question ${questionId} failed:`, e);
  }
}

// ─── Question Results ────────────────────────────────────────────────────────

export interface QuestionResultPayload {
  questionId: string;
  questionNumber?: number;
  questionIndex?: number;
  category?: string;
  questionText: string;
  correctAnswer: string;
  round: string;
  roundType?: string;
  bankKey: string | null;
  teamId: string;
  teamName: string;
  wager?: number;
  isDouble?: boolean;
  isCorrect: boolean;
  isSteal: boolean;
  isBlazeWager: boolean;
  teamScoreBefore: number;
  scoreDelta: number;
  teamScoreAfter: number;
  allTeamScores: Record<string, number>;
}

/**
 * Save a single question result to Firestore after it is answered.
 */
export async function saveQuestionResult(payload: QuestionResultPayload): Promise<void> {
  await post('/api/events/question-result', payload);
}

export interface RoundCompletePayload {
  round: string;
  teams: Team[];
  round2Wager?: any;
  round2Questions?: Question[];
  round3State?: any;
  round3Questions?: Question[];
}

/**
 * Call when a round ends — saves rich round summary to Firestore and generates a CSV file.
 */
export async function saveRoundComplete(
  roundOrPayload: string | RoundCompletePayload,
  maybeTeams?: Team[]
): Promise<void> {
  const payload: RoundCompletePayload =
    typeof roundOrPayload === 'string'
      ? { round: roundOrPayload, teams: maybeTeams || [] }
      : roundOrPayload;

  const result = await post('/api/events/round-complete', payload) as { csvPath?: string } | null;
  if (result?.csvPath) {
    console.log(`[API] Round ${payload.round} CSV written: ${result.csvPath}`);
  }
}

// ─── Convenience: build allTeamScores snapshot ──────────────────────────────

export function buildScoreSnapshot(teams: Team[]): Record<string, number> {
  return Object.fromEntries(teams.map((t) => [t.id, t.score]));
}
