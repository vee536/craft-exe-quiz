export type Round =
  | 'HOME'
  | 'ROUND_1'
  | 'ROUND_1_RESULTS'
  | 'ROUND_2'
  | 'ROUND_2_WAGER'
  | 'ROUND_2_BOARD'
  | 'ROUND_2_QUESTION'
  | 'ROUND_2_SCOREBOARD'
  | 'ROUND_3'
  | 'ROUND_3_FINALISTS'
  | 'ROUND_3_QUESTION'
  | 'ROUND_3_SCOREBOARD'
  | 'WINNER';

export type TieBreakerType =
  | 'NONE'
  | 'ROUND_1_TIEBREAKER'
  | 'ROUND_2_TIEBREAKER'
  | 'ROUND_3_TIEBREAKER';

export interface Team {
  id: string;
  name: string;
  score: number; // Active displayed score
  round1Score: number; // 0 to 15 marks
  round2Score: number; // Cumulative R2 wager score (floored at 0)
  round3StartingScore: number; // Normalized (e.g. 100.00, 80.00)
  isQualifiedR2: boolean; // Top 20 qualifier
  isFinalistR3: boolean; // Top 10 finalist
  selectionTurnsTaken: number;
  stealsCount: number;
  blazeRodUsed: boolean; // DOUBLE used in Round 2
  doubleUsedAtQuestion?: number; // Question 1..8 on which DOUBLE was used
}

export type QuestionDifficulty = 'Easy' | 'Medium' | 'Hard' | 'Expert';

export interface Question {
  id: string;
  category: string;
  points: number;
  difficulty: QuestionDifficulty;
  questionText: string;
  correctAnswer: string;
  explanation?: string;
  mediaUrl?: string;
  codeSnippet?: string;
  isUsed?: boolean;
}

export interface JeopardyCell {
  categoryIndex: number;
  pointIndex: number;
  points: number;
  questionId: string;
  isAnswered: boolean;
  answeredByTeamId?: string;
  wasSteal?: boolean;
  wasBlazeWager?: boolean;
}

export interface JeopardyBoardConfig {
  categories: string[];
  pointTiers: number[];
  matrix: JeopardyCell[][];
}

export interface ActiveQuestionState {
  question: Question | null;
  bankSource:
    | 'round1Main'
    | 'round1TieBreakers'
    | 'round1Emergency'
    | 'round2Main'
    | 'round2TieBreakers'
    | 'round2Emergency'
    | 'round2Jeopardy'
    | 'round3Finals'
    | 'round3TieBreakers'
    | null;
  cellCoordinates?: { categoryIndex: number; pointIndex: number };
  selectingTeamId: string | null;
  isAnswerRevealed: boolean;
  isBlazeWagerActive: boolean;
  isStealOpen: boolean;
  timerSecondsLeft: number;
  isTimerRunning: boolean;
  isTimerEnabled: boolean;
  defaultTimerDuration: number;
}

export interface Round1TimerState {
  durationSeconds: number; // e.g. 900 for 15 mins
  secondsLeft: number;
  isRunning: boolean;
  isExpired: boolean;
}

export type WagerAmount = 100 | 200 | 300 | 400;

export interface TeamWagerSubmission {
  teamId: string;
  wager: WagerAmount;
  isWagerSet?: boolean;
  isDouble: boolean;
  isCorrect: boolean | null; // null = pending, true = correct, false = wrong
  appliedDelta?: number;
}

export interface Round2QuestionRecord {
  questionIndex: number; // 0 to 7
  questionId: string;
  isRevealed: boolean;
  areWagersLocked: boolean;
  isScored: boolean;
  wagers: Record<string, TeamWagerSubmission>; // teamId -> submission
}

export interface Round2WagerState {
  currentQuestionIndex: number; // 0 to 7
  isQuestionRevealed: boolean;
  questions: Round2QuestionRecord[];
  isCompleted: boolean;
}

export type Round3AttemptResult = 'CORRECT' | 'WRONG' | 'NO_ANSWER';

export interface Round3Attempt {
  result: Round3AttemptResult;
  scoreChange: number;
}

export interface Round3QuestionRecord {
  questionId: string;
  attempts: Record<string, Round3Attempt>;
}

export interface Round3State {
  currentQuestionIndex: number;
  questions: Round3QuestionRecord[];
  isQuestionRevealed: boolean;
  isBuzzerOpen: boolean;
  buzzerWindowDurationSeconds: number;
  buzzerWindowSecondsLeft: number;
  isBuzzerWindowRunning: boolean;
  answerTimerDurationSeconds: number;
  buzzerTeamId: string | null;
  lastResult: { teamId: string; result: Round3AttemptResult; scoreChange: number } | null;
}

export interface EventState {
  version: number;
  lastUpdated: number;
  teams: Team[];
  currentRound: Round;
  activeTieBreaker: TieBreakerType;
  previousRoundBeforeTieBreaker: Round;
  round1Timer: Round1TimerState;
  round2Wager: Round2WagerState;
  round3: Round3State;
  questionBanks: {
    round1Main: Question[]; // 15 main questions
    round1TieBreakers: Question[]; // 5 tie-break questions
    round1Emergency: Question[]; // 2 emergency questions
    round2Main: Question[]; // 8 main questions
    round2TieBreakers: Question[]; // 3 tie-break questions
    round2Emergency: Question[]; // 2 emergency questions
    round2Jeopardy: Question[]; // Legacy / extra bank
    round3Finals: Question[]; // Final round questions
    round3TieBreakers: Question[]; // Architecture tie-break questions
  };
  jeopardyBoard: JeopardyBoardConfig;
  activeQuestion: ActiveQuestionState;
  winnerTeamId: string | null;
  soundMuted: boolean;
  soundVolume: number;
}

export type SyncMessage =
  | { type: 'STATE_UPDATE'; state: EventState }
  | { type: 'AUDIO_PLAY'; sound: string }
  | { type: 'PING' }
  | { type: 'PONG' };
