import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import {
  EventState,
  Team,
  Question,
  Round,
  TieBreakerType,
  JeopardyBoardConfig,
  SyncMessage,
  WagerAmount,
  Round3AttemptResult
} from '../types';
import { buildInitialRound3State, getInitialEventState } from '../data/initialDemoData';
import { soundManager } from '../utils/audio';
import { syncAllQuestions, syncOneQuestion, deleteQuestionFromDb, saveQuestionResult, saveRoundComplete, buildScoreSnapshot } from '../services/api';

const STORAGE_KEY = 'craft_exe_state_v2';
const CHANNEL_NAME = 'craft_exe_sync_channel';

interface EventContextType {
  state: EventState;

  // Navigation
  setCurrentRound: (round: Round) => void;
  activateTieBreaker: (type: TieBreakerType) => void;
  exitTieBreaker: () => void;
  setWinner: (teamId: string | null) => void;

  // Teams
  addTeam: (name: string) => void;
  updateTeam: (id: string, updates: Partial<Team>) => void;
  deleteTeam: (id: string) => void;
  adjustScore: (teamId: string, delta: number) => void;
  setDirectScore: (teamId: string, score: number) => void;
  setRound1Score: (teamId: string, score: number) => void;
  toggleQualifiedR2: (teamId: string) => void;
  toggleFinalistR3: (teamId: string) => void;
  autoQualifyTop20R1: () => void;
  autoQualifyTop10R2: () => void;
  normalizeRound3Scores: () => void;
  useBlazeRod: (teamId: string) => void;
  resetBlazeRod: (teamId: string) => void;

  // Fair-Turn Engine (Jeopardy / Buzzer)
  getNextFairTeam: () => Team | null;
  setManualTurn: (teamId: string | null) => void;
  recordSteal: (teamId: string) => void;

  // Round 1 Countdown Timer
  startRound1Timer: () => void;
  pauseRound1Timer: () => void;
  resetRound1Timer: (confirmed?: boolean) => void;
  setRound1TimerDuration: (seconds: number) => void;

  // Round 2 Wager Round
  initRound2Scores: () => void;
  setTeamWager: (teamId: string, wager: WagerAmount) => void;
  toggleTeamDouble: (teamId: string) => void;
  lockRound2Wagers: () => void;
  unlockRound2Wagers: () => void;
  revealRound2Question: () => void;
  setTeamRound2Answer: (teamId: string, isCorrect: boolean) => void;
  setAllRound2Answers: (isCorrect: boolean) => void;
  submitRound2QuestionScores: () => void;
  goToRound2Question: (index: number) => void;

  // Round 3 Finals Buzzer
  openRound3Question: (index: number) => void;
  setRound3AnswerTimerDuration: (seconds: number) => void;
  setRound3BuzzerWindowDuration: (seconds: number) => void;
  setRound3BuzzerOpen: (open: boolean) => void;
  selectRound3BuzzedTeam: (teamId: string) => void;
  recordRound3Attempt: (result: Round3AttemptResult) => void;
  closeRound3Question: () => void;

  // Jeopardy Board
  setBoardConfig: (config: JeopardyBoardConfig) => void;
  assignQuestionToBoardCell: (categoryIndex: number, pointIndex: number, questionId: string) => void;
  setCellAnswered: (categoryIndex: number, pointIndex: number, isAnswered: boolean, teamId?: string, wasSteal?: boolean, wasBlaze?: boolean) => void;
  resetBoardCells: () => void;

  // Question Banks (All repositories)
  addQuestion: (bankKey: keyof EventState['questionBanks'], question: Omit<Question, 'id'>) => string;
  updateQuestion: (bankKey: keyof EventState['questionBanks'], question: Question) => void;
  deleteQuestion: (bankKey: keyof EventState['questionBanks'], questionId: string) => void;

  // Active Question Controller
  openJeopardyQuestion: (catIdx: number, ptIdx: number) => void;
  openBankQuestion: (bankKey: keyof EventState['questionBanks'], questionId: string) => void;
  closeActiveQuestion: () => void;
  toggleAnswerReveal: () => void;
  toggleStealBuzzer: () => void;
  toggleBlazeWager: () => void;
  awardActiveQuestionScore: (teamId: string, isCorrect: boolean, isSteal?: boolean) => void;

  // Question Timer (Generic / Active Question)
  toggleTimerEnabled: (enabled: boolean) => void;
  setDefaultTimerDuration: (seconds: number) => void;
  startTimer: () => void;
  pauseTimer: () => void;
  resetTimer: () => void;
  adjustTimerSeconds: (delta: number) => void;

  // Sound & Volume
  playSound: (sound: 'correct' | 'incorrect' | 'steal' | 'blaze' | 'dragon' | 'tick' | 'victory' | 'click') => void;
  toggleMute: () => void;
  setVolume: (vol: number) => void;

  // Persistence & Data Backup
  exportData: () => string;
  importData: (jsonStr: string) => boolean;
  resetToDefault: () => void;
}

const EventContext = createContext<EventContextType | undefined>(undefined);

export const EventProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<EventState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && (parsed.version === 2 || parsed.version === 1)) {
          // Merge with initial state defaults to ensure new fields are populated
          const base = getInitialEventState();
          return {
            ...base,
            ...parsed,
            version: 2,
            round1Timer: parsed.round1Timer || base.round1Timer,
            round2Wager: parsed.round2Wager || base.round2Wager,
            round3: parsed.round3 || base.round3,
            questionBanks: {
              ...base.questionBanks,
              ...(parsed.questionBanks || {})
            }
          };
        }
      }
    } catch {
      // fallback
    }
    return getInitialEventState();
  });

  const channelRef = useRef<BroadcastChannel | null>(null);
  const activeQuestionTimerRef = useRef<number | null>(null);
  const round1TimerRef = useRef<number | null>(null);

  const applyRound3Result = (prev: EventState, teamId: string, result: Round3AttemptResult): EventState => {
    const questionIndex = prev.round3.currentQuestionIndex;
    const questionRecord = prev.round3.questions[questionIndex];
    const team = prev.teams.find(candidate => candidate.id === teamId && candidate.isFinalistR3);
    if (!questionRecord || !team || questionRecord.attempts[teamId]) return prev;

    const penaltyOrAward = result === 'CORRECT' ? 100 : -50;
    const updatedScore = Math.max(0, team.score + penaltyOrAward);
    const scoreChange = updatedScore - team.score;
    const attempts = { ...questionRecord.attempts, [teamId]: { result, scoreChange } };
    const questions = prev.round3.questions.map((record, index) =>
      index === questionIndex ? { ...record, attempts } : record
    );
    const remaining = prev.teams.filter(candidate => candidate.isFinalistR3 && !attempts[candidate.id]);
    const questionResolved = result === 'CORRECT' || remaining.length === 0;

    return {
      ...prev,
      teams: prev.teams.map(candidate => candidate.id === teamId ? { ...candidate, score: updatedScore } : candidate),
      round3: {
        ...prev.round3,
        questions,
        isBuzzerOpen: !questionResolved && remaining.length > 0,
        isBuzzerWindowRunning: !questionResolved && remaining.length > 0,
        buzzerWindowSecondsLeft: prev.round3.buzzerWindowDurationSeconds,
        buzzerTeamId: null,
        lastResult: { teamId, result, scoreChange },
      },
      activeQuestion: {
        ...prev.activeQuestion,
        selectingTeamId: null,
        isTimerRunning: false,
        timerSecondsLeft: 0,
        isAnswerRevealed: questionResolved,
      },
    };
  };

  // Broadcast state changes across windows/tabs
  const broadcastState = useCallback((newState: EventState) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      if (channelRef.current) {
        channelRef.current.postMessage({
          type: 'STATE_UPDATE',
          state: newState
        } as SyncMessage);
      }
    } catch {
      // storage error
    }
  }, []);

  // Update state helper
  const updateState = useCallback((updater: (prev: EventState) => EventState) => {
    setState((prev) => {
      const next = updater(prev);
      const updated = {
        ...next,
        lastUpdated: Date.now()
      };
      broadcastState(updated);
      return updated;
    });
  }, [broadcastState]);

  // Setup BroadcastChannel listener
  useEffect(() => {
    try {
      const bc = new BroadcastChannel(CHANNEL_NAME);
      channelRef.current = bc;

      bc.onmessage = (event: MessageEvent<SyncMessage>) => {
        const data = event.data;
        if (data && data.type === 'STATE_UPDATE') {
          setState(data.state);
        } else if (data && data.type === 'AUDIO_PLAY') {
          soundManager.play(data.sound as any);
        }
      };

      return () => {
        bc.close();
      };
    } catch {
      // BroadcastChannel not supported fallback
    }
  }, []);

  // Sync sound settings with SoundManager
  useEffect(() => {
    soundManager.setMuted(state.soundMuted);
    soundManager.setVolume(state.soundVolume);
  }, [state.soundMuted, state.soundVolume]);

  // Sync all questions to Firestore on initial load (fire-and-forget)
  useEffect(() => {
    syncAllQuestions(state.questionBanks);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // only on mount


  // --- ROUND 1 OVERWORLD COUNTDOWN TIMER TICK ENGINE ---
  useEffect(() => {
    if (state.round1Timer.isRunning) {
      round1TimerRef.current = window.setInterval(() => {
        setState((prev) => {
          if (!prev.round1Timer.isRunning) return prev;
          if (prev.round1Timer.secondsLeft <= 1) {
            soundManager.play('incorrect'); // Time up buzzer
            const updated: EventState = {
              ...prev,
              lastUpdated: Date.now(),
              round1Timer: {
                ...prev.round1Timer,
                secondsLeft: 0,
                isRunning: false,
                isExpired: true,
              }
            };
            broadcastState(updated);
            return updated;
          }

          if (prev.round1Timer.secondsLeft <= 6) {
            soundManager.play('tick');
          }

          const updated: EventState = {
            ...prev,
            lastUpdated: Date.now(),
            round1Timer: {
              ...prev.round1Timer,
              secondsLeft: prev.round1Timer.secondsLeft - 1,
            }
          };
          broadcastState(updated);
          return updated;
        });
      }, 1000);
    } else {
      if (round1TimerRef.current) {
        clearInterval(round1TimerRef.current);
        round1TimerRef.current = null;
      }
    }

    return () => {
      if (round1TimerRef.current) {
        clearInterval(round1TimerRef.current);
      }
    };
  }, [state.round1Timer.isRunning, broadcastState]);

  // Round 1 Timer Controls
  const startRound1Timer = useCallback(() => {
    soundManager.play('click');
    updateState(prev => ({
      ...prev,
      round1Timer: {
        ...prev.round1Timer,
        isRunning: true,
        isExpired: false,
      }
    }));
  }, [updateState]);

  const pauseRound1Timer = useCallback(() => {
    soundManager.play('click');
    updateState(prev => ({
      ...prev,
      round1Timer: {
        ...prev.round1Timer,
        isRunning: false,
      }
    }));
  }, [updateState]);

  const resetRound1Timer = useCallback((confirmed: boolean = false) => {
    if (state.round1Timer.isRunning && !confirmed) {
      if (!window.confirm('Timer is currently running. Are you sure you want to reset the timer?')) {
        return;
      }
    }
    soundManager.play('click');
    updateState(prev => ({
      ...prev,
      round1Timer: {
        ...prev.round1Timer,
        secondsLeft: prev.round1Timer.durationSeconds,
        isRunning: false,
        isExpired: false,
      }
    }));
  }, [state.round1Timer.isRunning, updateState]);

  const setRound1TimerDuration = useCallback((seconds: number) => {
    updateState(prev => ({
      ...prev,
      round1Timer: {
        ...prev.round1Timer,
        durationSeconds: seconds,
        secondsLeft: seconds,
        isExpired: false,
        isRunning: false,
      }
    }));
  }, [updateState]);

  // --- GENERIC ACTIVE QUESTION TIMER TICK ENGINE ---
  useEffect(() => {
    if (state.activeQuestion.isTimerRunning && state.activeQuestion.isTimerEnabled) {
      activeQuestionTimerRef.current = window.setInterval(() => {
        setState((prev) => {
          if (!prev.activeQuestion.isTimerRunning) return prev;
          if (prev.activeQuestion.timerSecondsLeft <= 1) {
            soundManager.play('incorrect');
            const updated: EventState = prev.currentRound === 'ROUND_3_QUESTION' && prev.round3.buzzerTeamId
              ? applyRound3Result(prev, prev.round3.buzzerTeamId, 'NO_ANSWER')
              : {
              ...prev,
              lastUpdated: Date.now(),
              activeQuestion: {
                ...prev.activeQuestion,
                timerSecondsLeft: 0,
                isTimerRunning: false,
              }
            };
            const timestamped = { ...updated, lastUpdated: Date.now() };
            broadcastState(timestamped);
            return timestamped;
          }

          if (prev.activeQuestion.timerSecondsLeft <= 6) {
            soundManager.play('tick');
          }

          const updated: EventState = {
            ...prev,
            lastUpdated: Date.now(),
            activeQuestion: {
              ...prev.activeQuestion,
              timerSecondsLeft: prev.activeQuestion.timerSecondsLeft - 1
            }
          };
          broadcastState(updated);
          return updated;
        });
      }, 1000);
    } else {
      if (activeQuestionTimerRef.current) {
        clearInterval(activeQuestionTimerRef.current);
        activeQuestionTimerRef.current = null;
      }
    }

    return () => {
      if (activeQuestionTimerRef.current) {
        clearInterval(activeQuestionTimerRef.current);
      }
    };
  }, [state.activeQuestion.isTimerRunning, state.activeQuestion.isTimerEnabled, broadcastState]);

  useEffect(() => {
    if (!state.round3.isBuzzerWindowRunning) return;
    const interval = window.setInterval(() => {
      setState(prev => {
        if (!prev.round3.isBuzzerWindowRunning) return prev;
        if (prev.round3.buzzerWindowSecondsLeft <= 1) {
          const updated: EventState = {
            ...prev,
            lastUpdated: Date.now(),
            round3: {
              ...prev.round3,
              isBuzzerOpen: false,
              isBuzzerWindowRunning: false,
              buzzerWindowSecondsLeft: 0,
            },
            activeQuestion: {
              ...prev.activeQuestion,
              isAnswerRevealed: true,
            },
          };
          broadcastState(updated);
          return updated;
        }
        const updated = {
          ...prev,
          lastUpdated: Date.now(),
          round3: {
            ...prev.round3,
            buzzerWindowSecondsLeft: prev.round3.buzzerWindowSecondsLeft - 1,
          },
        };
        broadcastState(updated);
        return updated;
      });
    }, 1000);
    return () => window.clearInterval(interval);
  }, [state.round3.isBuzzerWindowRunning, broadcastState]);

  // Sound broadcaster helper
  const playSound = useCallback((sound: 'correct' | 'incorrect' | 'steal' | 'blaze' | 'dragon' | 'tick' | 'victory' | 'click') => {
    soundManager.play(sound);
    if (channelRef.current) {
      channelRef.current.postMessage({
        type: 'AUDIO_PLAY',
        sound
      } as SyncMessage);
    }
  }, []);

  // Navigation handlers
  const setCurrentRound = useCallback((round: Round) => {
    // Fire round-complete save when admin navigates to a results/scoreboard/winner screen
    if (round === 'ROUND_1_RESULTS') {
      saveRoundComplete({
        round: 'ROUND_1',
        teams: state.teams,
      });
    } else if (round === 'ROUND_2_SCOREBOARD') {
      saveRoundComplete({
        round: 'ROUND_2',
        teams: state.teams,
        round2Wager: state.round2Wager,
        round2Questions: state.questionBanks.round2Main,
      });
    } else if (round === 'ROUND_3_SCOREBOARD' || round === 'WINNER') {
      saveRoundComplete({
        round: 'ROUND_3',
        teams: state.teams,
        round3State: state.round3,
        round3Questions: state.questionBanks.round3Finals,
      });
    }

    updateState(prev => ({
      ...prev,
      currentRound: round,
      activeTieBreaker: 'NONE',
      activeQuestion: {
        ...prev.activeQuestion,
        question: null,
        isTimerRunning: false,
      }
    }));
  }, [updateState, state.teams]);

  const activateTieBreaker = useCallback((type: TieBreakerType) => {
    updateState(prev => ({
      ...prev,
      previousRoundBeforeTieBreaker: prev.currentRound,
      activeTieBreaker: type,
      activeQuestion: {
        ...prev.activeQuestion,
        question: null,
        isTimerRunning: false,
        isAnswerRevealed: false,
        isStealOpen: false,
      }
    }));
  }, [updateState]);

  const exitTieBreaker = useCallback(() => {
    updateState(prev => ({
      ...prev,
      activeTieBreaker: 'NONE',
      currentRound: prev.previousRoundBeforeTieBreaker || prev.currentRound,
      activeQuestion: {
        ...prev.activeQuestion,
        question: null,
        isTimerRunning: false,
      }
    }));
  }, [updateState]);

  const setWinner = useCallback((teamId: string | null) => {
    updateState(prev => ({
      ...prev,
      winnerTeamId: teamId,
      currentRound: 'WINNER'
    }));
    if (teamId) {
      playSound('victory');
    }
  }, [updateState, playSound]);

  // Teams handlers
  const addTeam = useCallback((name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const newTeam: Team = {
      id: `team-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: trimmed,
      score: 0,
      round1Score: 0,
      round2Score: 0,
      round3StartingScore: 0,
      isQualifiedR2: false,
      isFinalistR3: false,
      selectionTurnsTaken: 0,
      stealsCount: 0,
      blazeRodUsed: false,
    };
    updateState(prev => ({
      ...prev,
      teams: [...prev.teams, newTeam]
    }));
  }, [updateState]);

  const updateTeam = useCallback((id: string, updates: Partial<Team>) => {
    updateState(prev => ({
      ...prev,
      teams: prev.teams.map(t => t.id === id ? { ...t, ...updates } : t)
    }));
  }, [updateState]);

  const deleteTeam = useCallback((id: string) => {
    updateState(prev => ({
      ...prev,
      teams: prev.teams.filter(t => t.id !== id),
      activeQuestion: {
        ...prev.activeQuestion,
        selectingTeamId: prev.activeQuestion.selectingTeamId === id ? null : prev.activeQuestion.selectingTeamId
      }
    }));
  }, [updateState]);

  const adjustScore = useCallback((teamId: string, delta: number) => {
    updateState(prev => ({
      ...prev,
      teams: prev.teams.map(t => t.id === teamId ? { ...t, score: Math.max(0, t.score + delta) } : t)
    }));
  }, [updateState]);

  const setDirectScore = useCallback((teamId: string, score: number) => {
    updateState(prev => ({
      ...prev,
      teams: prev.teams.map(t => t.id === teamId ? { ...t, score } : t)
    }));
  }, [updateState]);

  const setRound1Score = useCallback((teamId: string, score: number) => {
    updateState(prev => ({
      ...prev,
      teams: prev.teams.map(t => t.id === teamId ? { ...t, round1Score: Math.max(0, Math.min(15, score)) } : t)
    }));
  }, [updateState]);

  const toggleQualifiedR2 = useCallback((teamId: string) => {
    updateState(prev => ({
      ...prev,
      teams: prev.teams.map(t => t.id === teamId ? { ...t, isQualifiedR2: !t.isQualifiedR2 } : t)
    }));
  }, [updateState]);

  const toggleFinalistR3 = useCallback((teamId: string) => {
    updateState(prev => ({
      ...prev,
      teams: prev.teams.map(t => t.id === teamId ? { ...t, isFinalistR3: !t.isFinalistR3 } : t)
    }));
  }, [updateState]);

  // Auto Qualify Top 20 based on Round 1 score (30 -> 20)
  const autoQualifyTop20R1 = useCallback(() => {
    updateState(prev => {
      const sorted = [...prev.teams].sort((a, b) => b.round1Score - a.round1Score);
      // Cleanly pick top 20 teams
      const top20 = sorted.slice(0, 20);
      const top20Ids = new Set(top20.map(t => t.id));

      const updatedTeams = prev.teams.map(t => ({
        ...t,
        isQualifiedR2: top20Ids.has(t.id),
        round2Score: 0,
        score: top20Ids.has(t.id) ? 0 : t.score,
      }));

      // Ensure every question in Round 2 has wager entries for all qualified teams
      const qualified = updatedTeams.filter(t => t.isQualifiedR2);
      const updatedQuestions = prev.round2Wager.questions.map(q => {
        const wagers = { ...q.wagers };
        qualified.forEach(t => {
          if (!wagers[t.id]) {
            wagers[t.id] = {
              teamId: t.id,
              wager: 100,
              isWagerSet: true,
              isDouble: false,
              isCorrect: null,
            };
          }
        });
        return { ...q, wagers };
      });

      // Save Round 1 completion to Firebase
      saveRoundComplete('ROUND_1', updatedTeams);

      return {
        ...prev,
        teams: updatedTeams,
        round2Wager: {
          ...prev.round2Wager,
          questions: updatedQuestions,
        },
      };
    });
  }, [updateState]);

  // Auto Qualify Top 10 based on Round 2 score (20 -> 10)
  const autoQualifyTop10R2 = useCallback(() => {
    updateState(prev => {
      const r2Teams = prev.teams.filter(t => t.isQualifiedR2);
      const sorted = [...r2Teams].sort((a, b) => b.round2Score - a.round2Score);
      const top10 = sorted.slice(0, 10);
      const top10Ids = new Set(top10.map(t => t.id));

      // Also normalize scores automatically for Round 3 finalists
      const maxR2 = top10.length > 0 ? Math.max(...top10.map(t => t.round2Score)) : 0;

      const updatedTeams = prev.teams.map(t => {
        const isFinalist = top10Ids.has(t.id);
        if (!isFinalist) {
          return { ...t, isFinalistR3: false };
        }
        const starting = maxR2 > 0 ? Number(((t.round2Score / maxR2) * 100).toFixed(2)) : 0;
        return {
          ...t,
          isFinalistR3: true,
          round3StartingScore: starting,
          score: starting,
        };
      });

      // Save Round 2 completion to Firebase
      saveRoundComplete({
        round: 'ROUND_2',
        teams: updatedTeams,
        round2Wager: prev.round2Wager,
        round2Questions: prev.questionBanks.round2Main,
      });

      return {
        ...prev,
        teams: updatedTeams,
      };
    });
  }, [updateState]);

  // Round 3 Normalization: Starting Score = (Team R2 Score / Max R2 Score) * 100
  const normalizeRound3Scores = useCallback(() => {
    updateState(prev => {
      const finalists = prev.teams.filter(t => t.isFinalistR3);
      const maxR2 = finalists.length > 0 ? Math.max(...finalists.map(t => t.round2Score)) : 0;

      const updatedTeams = prev.teams.map(t => {
        if (!t.isFinalistR3) return t;
        let starting = 0.00;
        if (maxR2 > 0) {
          starting = Number(((t.round2Score / maxR2) * 100).toFixed(2));
        }
        return {
          ...t,
          round3StartingScore: starting,
          score: starting, // Initialize active score with normalized starting score
        };
      });

      return {
        ...prev,
        teams: updatedTeams,
      };
    });
  }, [updateState]);

  const useBlazeRod = useCallback((teamId: string) => {
    playSound('blaze');
    updateState(prev => ({
      ...prev,
      teams: prev.teams.map(t => t.id === teamId ? { ...t, blazeRodUsed: true } : t),
      activeQuestion: {
        ...prev.activeQuestion,
        isBlazeWagerActive: true,
        selectingTeamId: teamId,
      }
    }));
  }, [updateState, playSound]);

  const resetBlazeRod = useCallback((teamId: string) => {
    updateState(prev => ({
      ...prev,
      teams: prev.teams.map(t => t.id === teamId ? { ...t, blazeRodUsed: false, doubleUsedAtQuestion: undefined } : t)
    }));
  }, [updateState]);

  // --- ROUND 2 WAGER ACTIONS ---
  // Every team starts Round 2 at 0 points (Round 1 scores do NOT carry over)
  const initRound2Scores = useCallback(() => {
    updateState(prev => ({
      ...prev,
      teams: prev.teams.map(t => ({
        ...t,
        round2Score: 0,
        score: t.isQualifiedR2 ? 0 : t.score,
        blazeRodUsed: false,
        doubleUsedAtQuestion: undefined,
      }))
    }));
  }, [updateState]);

  const setTeamWager = useCallback((teamId: string, wager: WagerAmount) => {
    updateState(prev => {
      const qIdx = prev.round2Wager.currentQuestionIndex;
      const currentQRecord = prev.round2Wager.questions[qIdx];
      if (!currentQRecord || currentQRecord.areWagersLocked || currentQRecord.isRevealed || currentQRecord.isScored) return prev;

      const currentEntry = currentQRecord.wagers[teamId] || {
        teamId,
        wager: 100,
        isWagerSet: false,
        isDouble: false,
        isCorrect: null,
      };

      const updatedEntries = {
        ...currentQRecord.wagers,
        [teamId]: {
          ...currentEntry,
          wager,
          isWagerSet: true,
        }
      };

      const updatedQuestions = prev.round2Wager.questions.map((q, idx) =>
        idx === qIdx ? { ...q, wagers: updatedEntries } : q
      );

      return {
        ...prev,
        round2Wager: {
          ...prev.round2Wager,
          questions: updatedQuestions,
        }
      };
    });
  }, [updateState]);

  const toggleTeamDouble = useCallback((teamId: string) => {
    updateState(prev => {
      const qIdx = prev.round2Wager.currentQuestionIndex;
      const currentQRecord = prev.round2Wager.questions[qIdx];
      if (!currentQRecord || currentQRecord.areWagersLocked || currentQRecord.isRevealed || currentQRecord.isScored) return prev;

      const team = prev.teams.find(t => t.id === teamId);
      const doubleDeclaredElsewhere = prev.round2Wager.questions.some((question, index) =>
        index !== qIdx && question.wagers[teamId]?.isDouble
      );
      const currentEntry = currentQRecord.wagers[teamId] || {
        teamId,
        wager: 100,
        isWagerSet: false,
        isDouble: false,
        isCorrect: null,
      };

      // Check if team has already used double on a PREVIOUS question
      if (!currentEntry.isDouble && (team?.blazeRodUsed || doubleDeclaredElsewhere)) {
        alert(`${team?.name || 'This team'} has already used their one-time DOUBLE in Round 2!`);
        return prev;
      }

      const nextDouble = !currentEntry.isDouble;
      if (nextDouble) {
        soundManager.play('blaze');
      }

      const updatedEntries = {
        ...currentQRecord.wagers,
        [teamId]: {
          ...currentEntry,
          isDouble: nextDouble,
        }
      };

      const updatedQuestions = prev.round2Wager.questions.map((q, idx) =>
        idx === qIdx ? { ...q, wagers: updatedEntries } : q
      );

      return {
        ...prev,
        round2Wager: {
          ...prev.round2Wager,
          questions: updatedQuestions,
        }
      };
    });
  }, [updateState]);

  const lockRound2Wagers = useCallback(() => {
    updateState(prev => {
      const qIdx = prev.round2Wager.currentQuestionIndex;
      const currentQRecord = prev.round2Wager.questions[qIdx];
      if (!currentQRecord || currentQRecord.isRevealed || currentQRecord.isScored) return prev;
      const qualifiedTeams = prev.teams.filter(team => team.isQualifiedR2);
      
      const ensuredWagers = { ...currentQRecord.wagers };
      qualifiedTeams.forEach(team => {
        if (!ensuredWagers[team.id]) {
          ensuredWagers[team.id] = {
            teamId: team.id,
            wager: 100,
            isWagerSet: true,
            isDouble: false,
            isCorrect: null,
          };
        } else {
          ensuredWagers[team.id] = {
            ...ensuredWagers[team.id],
            isWagerSet: true,
          };
        }
      });

      return {
        ...prev,
        round2Wager: {
          ...prev.round2Wager,
          questions: prev.round2Wager.questions.map((question, index) =>
            index === qIdx ? { ...question, areWagersLocked: true, wagers: ensuredWagers } : question
          ),
        },
      };
    });
  }, [updateState]);

  const unlockRound2Wagers = useCallback(() => {
    updateState(prev => {
      const qIdx = prev.round2Wager.currentQuestionIndex;
      const currentQRecord = prev.round2Wager.questions[qIdx];
      if (!currentQRecord || currentQRecord.isRevealed || currentQRecord.isScored) return prev;

      return {
        ...prev,
        round2Wager: {
          ...prev.round2Wager,
          questions: prev.round2Wager.questions.map((question, index) =>
            index === qIdx ? { ...question, areWagersLocked: false } : question
          ),
        },
      };
    });
  }, [updateState]);

  const revealRound2Question = useCallback(() => {
    updateState(prev => {
      const qIdx = prev.round2Wager.currentQuestionIndex;
      const currentQRecord = prev.round2Wager.questions[qIdx];
      if (!currentQRecord?.areWagersLocked || currentQRecord.isScored) return prev;
      const targetQ = prev.questionBanks.round2Main[qIdx];

      const updatedQuestions = prev.round2Wager.questions.map((q, idx) =>
        idx === qIdx ? { ...q, isRevealed: true } : q
      );

      return {
        ...prev,
        round2Wager: {
          ...prev.round2Wager,
          isQuestionRevealed: true,
          questions: updatedQuestions,
        },
        activeQuestion: {
          ...prev.activeQuestion,
          question: targetQ || null,
          bankSource: 'round2Main',
          isAnswerRevealed: false,
          timerSecondsLeft: prev.activeQuestion.defaultTimerDuration,
          isTimerRunning: false,
        }
      };
    });
  }, [updateState]);

  const setTeamRound2Answer = useCallback((teamId: string, isCorrect: boolean) => {
    updateState(prev => {
      const qIdx = prev.round2Wager.currentQuestionIndex;
      const currentQRecord = prev.round2Wager.questions[qIdx];
      if (!currentQRecord?.isRevealed) return prev;

      const currentEntry = currentQRecord.wagers[teamId] || {
        teamId,
        wager: 100,
        isDouble: false,
        isCorrect: null,
      };

      const updatedEntry = {
        ...currentEntry,
        isCorrect,
      };
      let updatedTeams = prev.teams;
      if (currentQRecord.isScored) {
        updatedTeams = prev.teams.map(team => {
          if (team.id !== teamId) return team;
          const baseScore = Math.max(0, team.round2Score - (currentEntry.appliedDelta || 0));
          const rawDelta = isCorrect
            ? (updatedEntry.isDouble ? updatedEntry.wager * 2 : updatedEntry.wager)
            : (updatedEntry.isDouble ? -100 : -50);
          const newScore = Math.max(0, baseScore + rawDelta);
          updatedEntry.appliedDelta = newScore - baseScore;
          return { ...team, round2Score: newScore, score: newScore };
        });
      }
      const updatedEntries = {
        ...currentQRecord.wagers,
        [teamId]: updatedEntry,
      };

      const updatedQuestions = prev.round2Wager.questions.map((q, idx) =>
        idx === qIdx ? { ...q, wagers: updatedEntries } : q
      );

      return {
        ...prev,
        teams: updatedTeams,
        round2Wager: {
          ...prev.round2Wager,
          questions: updatedQuestions,
        }
      };
    });
  }, [updateState]);

  const setAllRound2Answers = useCallback((isCorrect: boolean) => {
    updateState(prev => {
      const qIdx = prev.round2Wager.currentQuestionIndex;
      const currentQRecord = prev.round2Wager.questions[qIdx];
      if (!currentQRecord?.isRevealed) return prev;

      const r2Teams = prev.teams.filter(t => t.isQualifiedR2);
      const updatedEntries = { ...currentQRecord.wagers };
      let updatedTeams = prev.teams;

      r2Teams.forEach(t => {
        const entry = updatedEntries[t.id] || {
          teamId: t.id,
          wager: 100,
          isDouble: false,
          isCorrect: null,
        };
        updatedEntries[t.id] = {
          ...entry,
          isCorrect,
        };
      });

      if (currentQRecord.isScored) {
        updatedTeams = prev.teams.map(team => {
          const entry = updatedEntries[team.id];
          if (!entry) return team;
          const baseScore = Math.max(0, team.round2Score - (entry.appliedDelta || 0));
          const rawDelta = isCorrect
            ? (entry.isDouble ? entry.wager * 2 : entry.wager)
            : (entry.isDouble ? -100 : -50);
          const newScore = Math.max(0, baseScore + rawDelta);
          updatedEntries[team.id] = { ...entry, appliedDelta: newScore - baseScore };
          return { ...team, round2Score: newScore, score: newScore };
        });
      }

      const updatedQuestions = prev.round2Wager.questions.map((q, idx) =>
        idx === qIdx ? { ...q, wagers: updatedEntries } : q
      );

      return {
        ...prev,
        teams: updatedTeams,
        round2Wager: {
          ...prev.round2Wager,
          questions: updatedQuestions,
        }
      };
    });
  }, [updateState]);

  // Apply scoring for Round 2 Question:
  // Normal: Correct -> +wager, Wrong -> -50
  // DOUBLE: Correct -> +2*wager, Wrong -> -100
  // Cumulative score cannot go below 0 (floored at 0)
  const submitRound2QuestionScores = useCallback(() => {
    playSound('correct');
    updateState(prev => {
      const qIdx = prev.round2Wager.currentQuestionIndex;
      const currentQRecord = prev.round2Wager.questions[qIdx];
      if (!currentQRecord || currentQRecord.isScored) return prev;

      // Ensure Top 20 teams are selected
      let r2Teams = prev.teams.filter(team => team.isQualifiedR2);
      let baseTeams = prev.teams;
      if (r2Teams.length === 0) {
        const sorted = [...prev.teams].sort((a, b) => (b.round1Score ?? 0) - (a.round1Score ?? 0)).slice(0, 20);
        const top20Ids = new Set(sorted.map(t => t.id));
        baseTeams = prev.teams.map(t => ({
          ...t,
          isQualifiedR2: top20Ids.has(t.id),
        }));
        r2Teams = baseTeams.filter(t => t.isQualifiedR2);
      }

      // Update team scores
      const updatedWagers = { ...currentQRecord.wagers };
      const updatedTeams = baseTeams.map(t => {
        if (!t.isQualifiedR2) return t;

        let sub = updatedWagers[t.id];
        if (!sub) {
          sub = { teamId: t.id, wager: 100, isWagerSet: true, isDouble: false, isCorrect: false };
        }
        // Default unmarked to false (Wrong) so calculation is never blocked
        const isCorr = sub.isCorrect === true;
        sub = { ...sub, isCorrect: isCorr, isWagerSet: true };

        let delta = 0;
        if (sub.isDouble) {
          delta = isCorr ? 2 * sub.wager : -100;
        } else {
          delta = isCorr ? sub.wager : -50;
        }

        const newScore = Math.max(0, t.round2Score + delta);
        updatedWagers[t.id] = { ...sub, appliedDelta: newScore - t.round2Score };
        const blazeUsed = t.blazeRodUsed || sub.isDouble;
        const doubleAt = sub.isDouble ? qIdx + 1 : t.doubleUsedAtQuestion;

        return {
          ...t,
          round2Score: newScore,
          score: newScore,
          blazeRodUsed: blazeUsed,
          doubleUsedAtQuestion: doubleAt,
        };
      });

      const updatedQuestions = prev.round2Wager.questions.map((q, idx) =>
        idx === qIdx ? { ...q, isRevealed: true, areWagersLocked: true, isScored: true, wagers: updatedWagers } : q
      );

      const allScored = updatedQuestions.every(q => q.isScored);

      // Save a question result record per team to Firestore (fire-and-forget)
      const q2 = prev.questionBanks.round2Main[qIdx];
      if (q2) {
        const scoreSnapshot = buildScoreSnapshot(updatedTeams);
        r2Teams.forEach(t => {
          const sub = updatedWagers[t.id];
          if (!sub || sub.isCorrect === null) return;
          const originalTeam = prev.teams.find(x => x.id === t.id);
          const before = originalTeam?.round2Score ?? 0;
          const after = Math.max(0, before + (sub.appliedDelta ?? 0));
          saveQuestionResult({
            questionId: q2.id,
            questionNumber: qIdx + 1,
            questionIndex: qIdx,
            category: q2.category,
            questionText: q2.questionText,
            correctAnswer: q2.correctAnswer,
            round: 'ROUND_2_WAGER',
            roundType: 'WAGER_ROUND',
            bankKey: 'round2Main',
            teamId: t.id,
            teamName: t.name,
            wager: sub.wager,
            isDouble: Boolean(sub.isDouble),
            isCorrect: Boolean(sub.isCorrect),
            isSteal: false,
            isBlazeWager: Boolean(sub.isDouble),
            teamScoreBefore: before,
            scoreDelta: after - before,
            teamScoreAfter: after,
            allTeamScores: scoreSnapshot,
          });
        });
      }

      // Update Round 2 Wager document and CSV in Firebase
      saveRoundComplete({
        round: 'ROUND_2',
        teams: updatedTeams,
        round2Wager: {
          ...prev.round2Wager,
          questions: updatedQuestions,
          isCompleted: allScored,
        },
        round2Questions: prev.questionBanks.round2Main,
      });

      return {
        ...prev,
        teams: updatedTeams,
        round2Wager: {
          ...prev.round2Wager,
          questions: updatedQuestions,
          isCompleted: allScored,
        },
        activeQuestion: {
          ...prev.activeQuestion,
          isAnswerRevealed: true,
        }
      };
    });
  }, [updateState, playSound]);

  const goToRound2Question = useCallback((index: number) => {
    updateState(prev => {
      const bounded = Math.max(0, Math.min(7, index));
      const targetQ = prev.questionBanks.round2Main[bounded];
      const isAlreadyRevealed = prev.round2Wager.questions[bounded]?.isRevealed || false;

      return {
        ...prev,
        round2Wager: {
          ...prev.round2Wager,
          currentQuestionIndex: bounded,
          isQuestionRevealed: isAlreadyRevealed,
        },
        activeQuestion: {
          ...prev.activeQuestion,
          question: isAlreadyRevealed ? (targetQ || null) : null,
          bankSource: 'round2Main',
          isAnswerRevealed: prev.round2Wager.questions[bounded]?.isScored || false,
        }
      };
    });
  }, [updateState]);

  const openRound3Question = useCallback((index: number) => {
    const bounded = Math.max(0, Math.min(state.questionBanks.round3Finals.length - 1, index));
    const question = state.questionBanks.round3Finals[bounded];
    if (!question) return;

    updateState(prev => {
      const matchingRecord = prev.round3.questions.find(record => record.questionId === question.id);
      const questions = [...prev.round3.questions];
      questions[bounded] = matchingRecord || { questionId: question.id, attempts: {} };
      return {
        ...prev,
        currentRound: 'ROUND_3_QUESTION',
        round3: {
          ...prev.round3,
          currentQuestionIndex: bounded,
          questions,
          isQuestionRevealed: true,
          isBuzzerOpen: false,
          isBuzzerWindowRunning: false,
          buzzerWindowSecondsLeft: prev.round3.buzzerWindowDurationSeconds,
          buzzerTeamId: null,
          lastResult: null,
        },
        activeQuestion: {
          ...prev.activeQuestion,
          question,
          bankSource: 'round3Finals',
          selectingTeamId: null,
          isAnswerRevealed: false,
          isBlazeWagerActive: false,
          isStealOpen: false,
          timerSecondsLeft: prev.round3.answerTimerDurationSeconds,
          isTimerRunning: false,
          isTimerEnabled: true,
          defaultTimerDuration: prev.round3.answerTimerDurationSeconds,
        },
      };
    });
  }, [state.questionBanks.round3Finals, updateState]);

  const setRound3AnswerTimerDuration = useCallback((seconds: number) => {
    const duration = Math.max(1, Math.floor(seconds));
    updateState(prev => ({
      ...prev,
      round3: { ...prev.round3, answerTimerDurationSeconds: duration },
      activeQuestion: {
        ...prev.activeQuestion,
        defaultTimerDuration: duration,
        timerSecondsLeft: prev.round3.buzzerTeamId ? prev.activeQuestion.timerSecondsLeft : duration,
      },
    }));
  }, [updateState]);

  const setRound3BuzzerWindowDuration = useCallback((seconds: number) => {
    const duration = Math.max(1, Math.floor(seconds));
    updateState(prev => ({
      ...prev,
      round3: {
        ...prev.round3,
        buzzerWindowDurationSeconds: duration,
        buzzerWindowSecondsLeft: prev.round3.isBuzzerWindowRunning ? duration : prev.round3.buzzerWindowSecondsLeft,
      },
    }));
  }, [updateState]);

  const setRound3BuzzerOpen = useCallback((open: boolean) => {
    updateState(prev => {
      if (!prev.activeQuestion.question || prev.currentRound !== 'ROUND_3_QUESTION') return prev;
      const attempts = prev.round3.questions[prev.round3.currentQuestionIndex]?.attempts || {};
      const hasEligibleTeam = prev.teams.some(team => team.isFinalistR3 && !attempts[team.id]);
      const isOpen = open && hasEligibleTeam && !prev.activeQuestion.isAnswerRevealed;
      return {
        ...prev,
        round3: {
          ...prev.round3,
          isBuzzerOpen: isOpen,
          isBuzzerWindowRunning: isOpen,
          buzzerWindowSecondsLeft: isOpen ? prev.round3.buzzerWindowDurationSeconds : 0,
        },
      };
    });
  }, [updateState]);

  const selectRound3BuzzedTeam = useCallback((teamId: string) => {
    updateState(prev => {
      const record = prev.round3.questions[prev.round3.currentQuestionIndex];
      const team = prev.teams.find(candidate => candidate.id === teamId && candidate.isFinalistR3);
      if (!team || !record || record.attempts[teamId]) return prev;
      return {
        ...prev,
        round3: {
          ...prev.round3,
          isBuzzerOpen: false,
          isBuzzerWindowRunning: false,
          buzzerTeamId: teamId,
        },
        activeQuestion: {
          ...prev.activeQuestion,
          selectingTeamId: teamId,
          timerSecondsLeft: prev.round3.answerTimerDurationSeconds,
          defaultTimerDuration: prev.round3.answerTimerDurationSeconds,
          isTimerEnabled: true,
          isTimerRunning: true,
          isAnswerRevealed: false,
        },
      };
    });
  }, [updateState]);

  const recordRound3Attempt = useCallback((result: Round3AttemptResult) => {
    const teamId = state.round3.buzzerTeamId;
    if (!teamId) return;
    playSound(result === 'CORRECT' ? 'correct' : 'incorrect');

    // Capture context before state update for Firestore save
    const team = state.teams.find(t => t.id === teamId);
    const scoreBefore = team?.score ?? 0;
    const penaltyOrAward = result === 'CORRECT' ? 100 : result === 'WRONG' ? -50 : 0;
    const scoreAfter = Math.max(0, scoreBefore + penaltyOrAward);
    const activeQ = state.activeQuestion.question;

    updateState(prev => applyRound3Result(prev, teamId, result));

    // Save to Firestore (fire-and-forget)
    if (activeQ) {
      saveQuestionResult({
        questionId: activeQ.id,
        questionText: activeQ.questionText,
        correctAnswer: activeQ.correctAnswer,
        round: 'ROUND_3_QUESTION',
        bankKey: 'round3Finals',
        teamId,
        teamName: team?.name || teamId,
        isCorrect: result === 'CORRECT',
        isSteal: false,
        isBlazeWager: false,
        teamScoreBefore: scoreBefore,
        scoreDelta: scoreAfter - scoreBefore,
        teamScoreAfter: scoreAfter,
        allTeamScores: buildScoreSnapshot(
          state.teams.map(t => t.id === teamId ? { ...t, score: scoreAfter } : t)
        ),
      });
    }
  }, [state.round3.buzzerTeamId, state.teams, state.activeQuestion.question, playSound, updateState]);

  const closeRound3Question = useCallback(() => {
    updateState(prev => ({
      ...prev,
      round3: {
        ...prev.round3,
        isBuzzerOpen: false,
        isBuzzerWindowRunning: false,
        buzzerTeamId: null,
      },
      activeQuestion: {
        ...prev.activeQuestion,
        isTimerRunning: false,
        isAnswerRevealed: true,
      },
    }));
  }, [updateState]);

  // Fair-Turn Engine (for turn-based sections)
  const getNextFairTeam = useCallback((): Team | null => {
    const pool = state.teams.filter(t => {
      if (state.currentRound.startsWith('ROUND_3')) {
        return t.isFinalistR3;
      }
      return t.isQualifiedR2;
    });

    if (pool.length === 0) return null;

    let minTurns = Infinity;
    pool.forEach(t => {
      if (t.selectionTurnsTaken < minTurns) {
        minTurns = t.selectionTurnsTaken;
      }
    });

    const candidates = pool.filter(t => t.selectionTurnsTaken === minTurns);
    return candidates[0] || null;
  }, [state.teams, state.currentRound]);

  const setManualTurn = useCallback((teamId: string | null) => {
    updateState(prev => ({
      ...prev,
      activeQuestion: {
        ...prev.activeQuestion,
        selectingTeamId: teamId
      }
    }));
  }, [updateState]);

  const recordSteal = useCallback((teamId: string) => {
    updateState(prev => ({
      ...prev,
      teams: prev.teams.map(t => t.id === teamId ? { ...t, stealsCount: t.stealsCount + 1 } : t)
    }));
  }, [updateState]);

  // Jeopardy Board handlers
  const setBoardConfig = useCallback((config: JeopardyBoardConfig) => {
    updateState(prev => ({
      ...prev,
      jeopardyBoard: config
    }));
  }, [updateState]);

  const assignQuestionToBoardCell = useCallback((catIdx: number, ptIdx: number, questionId: string) => {
    updateState(prev => {
      const newMatrix = prev.jeopardyBoard.matrix.map((row, rIdx) => {
        if (rIdx !== catIdx) return row;
        return row.map((cell, cIdx) => {
          if (cIdx !== ptIdx) return cell;
          return { ...cell, questionId };
        });
      });
      return {
        ...prev,
        jeopardyBoard: {
          ...prev.jeopardyBoard,
          matrix: newMatrix
        }
      };
    });
  }, [updateState]);

  const setCellAnswered = useCallback((catIdx: number, ptIdx: number, isAnswered: boolean, teamId?: string, wasSteal?: boolean, wasBlaze?: boolean) => {
    updateState(prev => {
      const newMatrix = prev.jeopardyBoard.matrix.map((row, rIdx) => {
        if (rIdx !== catIdx) return row;
        return row.map((cell, cIdx) => {
          if (cIdx !== ptIdx) return cell;
          return {
            ...cell,
            isAnswered,
            answeredByTeamId: teamId,
            wasSteal,
            wasBlazeWager: wasBlaze
          };
        });
      });
      return {
        ...prev,
        jeopardyBoard: {
          ...prev.jeopardyBoard,
          matrix: newMatrix
        }
      };
    });
  }, [updateState]);

  const resetBoardCells = useCallback(() => {
    updateState(prev => {
      const newMatrix = prev.jeopardyBoard.matrix.map(row =>
        row.map(cell => ({
          ...cell,
          isAnswered: false,
          answeredByTeamId: undefined,
          wasSteal: undefined,
          wasBlazeWager: undefined
        }))
      );
      return {
        ...prev,
        jeopardyBoard: {
          ...prev.jeopardyBoard,
          matrix: newMatrix
        }
      };
    });
  }, [updateState]);

  // Question Banks (All Distinct Repositories)
  const addQuestion = useCallback((bankKey: keyof EventState['questionBanks'], q: Omit<Question, 'id'>): string => {
    const id = `${bankKey}-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`;
    const newQuestion: Question = { ...q, id };
    updateState(prev => ({
      ...prev,
      questionBanks: {
        ...prev.questionBanks,
        [bankKey]: [...prev.questionBanks[bankKey], newQuestion]
      }
    }));
    // Sync new question to Firestore (fire-and-forget)
    syncOneQuestion(String(bankKey), newQuestion);
    return id;
  }, [updateState]);

  const updateQuestion = useCallback((bankKey: keyof EventState['questionBanks'], q: Question) => {
    updateState(prev => ({
      ...prev,
      questionBanks: {
        ...prev.questionBanks,
        [bankKey]: prev.questionBanks[bankKey].map(item => item.id === q.id ? q : item)
      }
    }));
    // Sync updated question to Firestore (fire-and-forget)
    syncOneQuestion(String(bankKey), q);
  }, [updateState]);

  const deleteQuestion = useCallback((bankKey: keyof EventState['questionBanks'], qId: string) => {
    updateState(prev => ({
      ...prev,
      questionBanks: {
        ...prev.questionBanks,
        [bankKey]: prev.questionBanks[bankKey].filter(item => item.id !== qId)
      }
    }));
    // Remove question from Firestore (fire-and-forget)
    deleteQuestionFromDb(qId);
  }, [updateState]);

  // Active Question Controller
  const openJeopardyQuestion = useCallback((catIdx: number, ptIdx: number) => {
    const cell = state.jeopardyBoard.matrix[catIdx]?.[ptIdx];
    if (!cell) return;

    const q = state.questionBanks.round2Jeopardy.find(item => item.id === cell.questionId) || {
      id: cell.questionId,
      category: state.jeopardyBoard.categories[catIdx] || 'General',
      points: cell.points,
      difficulty: cell.points >= 400 ? 'Hard' : cell.points >= 200 ? 'Medium' : 'Easy',
      questionText: `Question for ${state.jeopardyBoard.categories[catIdx]} (${cell.points} pts)`,
      correctAnswer: 'Answer pending quizmaster entry',
    };

    const fairTeam = getNextFairTeam();

    updateState(prev => ({
      ...prev,
      currentRound: 'ROUND_2_QUESTION',
      activeQuestion: {
        question: q,
        bankSource: 'round2Jeopardy',
        cellCoordinates: { categoryIndex: catIdx, pointIndex: ptIdx },
        selectingTeamId: prev.activeQuestion.selectingTeamId || fairTeam?.id || null,
        isAnswerRevealed: false,
        isBlazeWagerActive: false,
        isStealOpen: false,
        timerSecondsLeft: prev.activeQuestion.defaultTimerDuration,
        isTimerRunning: false,
        isTimerEnabled: prev.activeQuestion.isTimerEnabled,
        defaultTimerDuration: prev.activeQuestion.defaultTimerDuration,
      }
    }));
  }, [state.jeopardyBoard, state.questionBanks.round2Jeopardy, getNextFairTeam, updateState]);

  const openBankQuestion = useCallback((bankKey: keyof EventState['questionBanks'], questionId: string) => {
    const q = state.questionBanks[bankKey].find(item => item.id === questionId);
    if (!q) return;

    if (bankKey === 'round3Finals') {
      openRound3Question(state.questionBanks.round3Finals.findIndex(item => item.id === questionId));
      return;
    }

    let targetRound = state.currentRound;

    updateState(prev => ({
      ...prev,
      currentRound: targetRound,
      activeQuestion: {
        question: q,
        bankSource: bankKey,
        selectingTeamId: prev.activeQuestion.selectingTeamId,
        isAnswerRevealed: false,
        isBlazeWagerActive: false,
        isStealOpen: false,
        timerSecondsLeft: prev.activeQuestion.defaultTimerDuration,
        isTimerRunning: false,
        isTimerEnabled: prev.activeQuestion.isTimerEnabled,
        defaultTimerDuration: prev.activeQuestion.defaultTimerDuration,
      }
    }));
  }, [state.questionBanks, state.currentRound, openRound3Question, updateState]);

  const closeActiveQuestion = useCallback(() => {
    updateState(prev => {
      let nextRound: Round = prev.currentRound;
      if (prev.currentRound === 'ROUND_2_QUESTION') {
        nextRound = 'ROUND_2_BOARD';
      } else if (prev.currentRound === 'ROUND_3_QUESTION') {
        nextRound = 'ROUND_3_FINALISTS';
      }

      return {
        ...prev,
        currentRound: nextRound,
        activeQuestion: {
          ...prev.activeQuestion,
          question: null,
          isTimerRunning: false,
          isStealOpen: false,
          isBlazeWagerActive: false,
          isAnswerRevealed: false,
        }
      };
    });
  }, [updateState]);

  const toggleAnswerReveal = useCallback(() => {
    updateState(prev => ({
      ...prev,
      activeQuestion: {
        ...prev.activeQuestion,
        isAnswerRevealed: !prev.activeQuestion.isAnswerRevealed
      }
    }));
  }, [updateState]);

  const toggleStealBuzzer = useCallback(() => {
    playSound('steal');
    updateState(prev => ({
      ...prev,
      activeQuestion: {
        ...prev.activeQuestion,
        isStealOpen: !prev.activeQuestion.isStealOpen
      }
    }));
  }, [updateState, playSound]);

  const toggleBlazeWager = useCallback(() => {
    playSound('blaze');
    updateState(prev => ({
      ...prev,
      activeQuestion: {
        ...prev.activeQuestion,
        isBlazeWagerActive: !prev.activeQuestion.isBlazeWagerActive
      }
    }));
  }, [updateState, playSound]);

  const awardActiveQuestionScore = useCallback((teamId: string, isCorrect: boolean, isSteal: boolean = false) => {
    const active = state.activeQuestion;
    if (!active.question) return;

    let points = active.question.points || 100;
    if (active.isBlazeWagerActive) {
      points *= 2;
    }

    const delta = isCorrect ? points : -points;

    if (isCorrect) {
      playSound('correct');
    } else {
      playSound('incorrect');
    }

    // Capture score-before for the answering team (fire-and-forget after state update)
    const teamBefore = state.teams.find(t => t.id === teamId);
    const scoreBefore = teamBefore?.score ?? 0;
    const scoreAfter = Math.max(0, scoreBefore + delta);
    const scoreDelta = scoreAfter - scoreBefore;

    updateState(prev => {
      const selectingId = prev.activeQuestion.selectingTeamId;

      const updatedTeams = prev.teams.map(t => {
        if (t.id === teamId) {
          const newScore = Math.max(0, t.score + delta);
          return {
            ...t,
            score: newScore,
            stealsCount: isSteal ? t.stealsCount + 1 : t.stealsCount,
            selectionTurnsTaken: (!isSteal && t.id === selectingId) ? t.selectionTurnsTaken + 1 : t.selectionTurnsTaken
          };
        }
        if (!isCorrect && !isSteal && t.id === selectingId && t.id !== teamId) {
          return {
            ...t,
            selectionTurnsTaken: t.selectionTurnsTaken + 1
          };
        }
        return t;
      });

      let updatedBoard = prev.jeopardyBoard;
      if (prev.activeQuestion.cellCoordinates) {
        const { categoryIndex, pointIndex } = prev.activeQuestion.cellCoordinates;
        const newMatrix = prev.jeopardyBoard.matrix.map((row, rIdx) => {
          if (rIdx !== categoryIndex) return row;
          return row.map((cell, cIdx) => {
            if (cIdx !== pointIndex) return cell;
            return {
              ...cell,
              isAnswered: true,
              answeredByTeamId: teamId,
              wasSteal: isSteal,
              wasBlazeWager: prev.activeQuestion.isBlazeWagerActive,
            };
          });
        });
        updatedBoard = {
          ...prev.jeopardyBoard,
          matrix: newMatrix
        };
      }

      // Save question result to Firestore (fire-and-forget)
      const answeringTeam = prev.teams.find(t => t.id === teamId);
      saveQuestionResult({
        questionId: active.question!.id,
        questionText: active.question!.questionText,
        correctAnswer: active.question!.correctAnswer,
        round: prev.currentRound,
        bankKey: active.bankSource,
        teamId,
        teamName: answeringTeam?.name || teamId,
        isCorrect,
        isSteal,
        isBlazeWager: active.isBlazeWagerActive,
        teamScoreBefore: scoreBefore,
        scoreDelta,
        teamScoreAfter: scoreAfter,
        allTeamScores: buildScoreSnapshot(updatedTeams),
      });

      return {
        ...prev,
        teams: updatedTeams,
        jeopardyBoard: updatedBoard,
        activeQuestion: {
          ...prev.activeQuestion,
          isTimerRunning: false,
          isAnswerRevealed: true,
          selectingTeamId: null,
        }
      };
    });
  }, [state.activeQuestion, state.teams, playSound, updateState]);

  // Timer controls (Generic / Active Question)
  const toggleTimerEnabled = useCallback((enabled: boolean) => {
    updateState(prev => ({
      ...prev,
      activeQuestion: {
        ...prev.activeQuestion,
        isTimerEnabled: enabled,
        isTimerRunning: false,
      }
    }));
  }, [updateState]);

  const setDefaultTimerDuration = useCallback((seconds: number) => {
    updateState(prev => ({
      ...prev,
      activeQuestion: {
        ...prev.activeQuestion,
        defaultTimerDuration: seconds,
        timerSecondsLeft: seconds,
      }
    }));
  }, [updateState]);

  const startTimer = useCallback(() => {
    updateState(prev => ({
      ...prev,
      activeQuestion: {
        ...prev.activeQuestion,
        isTimerRunning: true,
      }
    }));
  }, [updateState]);

  const pauseTimer = useCallback(() => {
    updateState(prev => ({
      ...prev,
      activeQuestion: {
        ...prev.activeQuestion,
        isTimerRunning: false,
      }
    }));
  }, [updateState]);

  const resetTimer = useCallback(() => {
    updateState(prev => ({
      ...prev,
      activeQuestion: {
        ...prev.activeQuestion,
        isTimerRunning: false,
        timerSecondsLeft: prev.activeQuestion.defaultTimerDuration,
      }
    }));
  }, [updateState]);

  const adjustTimerSeconds = useCallback((delta: number) => {
    updateState(prev => ({
      ...prev,
      activeQuestion: {
        ...prev.activeQuestion,
        timerSecondsLeft: Math.max(0, prev.activeQuestion.timerSecondsLeft + delta)
      }
    }));
  }, [updateState]);

  // Sound settings
  const toggleMute = useCallback(() => {
    updateState(prev => ({
      ...prev,
      soundMuted: !prev.soundMuted
    }));
  }, [updateState]);

  const setVolume = useCallback((vol: number) => {
    updateState(prev => ({
      ...prev,
      soundVolume: vol
    }));
  }, [updateState]);

  // Persistence & Backup
  const exportData = useCallback((): string => {
    return JSON.stringify(state, null, 2);
  }, [state]);

  const importData = useCallback((jsonStr: string): boolean => {
    try {
      const parsed = JSON.parse(jsonStr);
      if (parsed && typeof parsed === 'object') {
        const validated: EventState = {
          ...getInitialEventState(),
          ...parsed,
          version: 2,
          lastUpdated: Date.now()
        };
        setState(validated);
        broadcastState(validated);
        return true;
      }
    } catch {
      // parse failed
    }
    return false;
  }, [broadcastState]);

  const resetToDefault = useCallback(() => {
    const fresh = getInitialEventState();
    setState(fresh);
    broadcastState(fresh);
  }, [broadcastState]);

  return (
    <EventContext.Provider
      value={{
        state,
        setCurrentRound,
        activateTieBreaker,
        exitTieBreaker,
        setWinner,
        addTeam,
        updateTeam,
        deleteTeam,
        adjustScore,
        setDirectScore,
        setRound1Score,
        toggleQualifiedR2,
        toggleFinalistR3,
        autoQualifyTop20R1,
        autoQualifyTop10R2,
        normalizeRound3Scores,
        useBlazeRod,
        resetBlazeRod,
        getNextFairTeam,
        setManualTurn,
        recordSteal,
        startRound1Timer,
        pauseRound1Timer,
        resetRound1Timer,
        setRound1TimerDuration,
        initRound2Scores,
        setTeamWager,
        toggleTeamDouble,
        lockRound2Wagers,
        unlockRound2Wagers,
        revealRound2Question,
        setTeamRound2Answer,
        setAllRound2Answers,
        submitRound2QuestionScores,
        goToRound2Question,
        openRound3Question,
        setRound3AnswerTimerDuration,
        setRound3BuzzerWindowDuration,
        setRound3BuzzerOpen,
        selectRound3BuzzedTeam,
        recordRound3Attempt,
        closeRound3Question,
        setBoardConfig,
        assignQuestionToBoardCell,
        setCellAnswered,
        resetBoardCells,
        addQuestion,
        updateQuestion,
        deleteQuestion,
        openJeopardyQuestion,
        openBankQuestion,
        closeActiveQuestion,
        toggleAnswerReveal,
        toggleStealBuzzer,
        toggleBlazeWager,
        awardActiveQuestionScore,
        toggleTimerEnabled,
        setDefaultTimerDuration,
        startTimer,
        pauseTimer,
        resetTimer,
        adjustTimerSeconds,
        playSound,
        toggleMute,
        setVolume,
        exportData,
        importData,
        resetToDefault,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};

export const useEvent = () => {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvent must be used within an EventProvider');
  }
  return context;
};
