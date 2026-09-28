import React from 'react';
import { useEvent } from '../../context/EventContext';
import { HomeView, Round1ResultsView } from './views/HomeView';
import {
  NetherIntroView,
  NetherWagerQuestionView,
  Round2ScoreboardView
} from './views/NetherViews';
import {
  FinalistsView,
  Round3QuestionView,
  Round3ScoreboardView,
  WinnerView
} from './views/EndViews';
import { TieBreakerOverlayView } from './views/TieBreakerOverlayView';

export const ProjectorView: React.FC = () => {
  const { state } = useEvent();
  const { currentRound, activeTieBreaker } = state;

  return (
    <div className="w-screen h-screen overflow-hidden select-none bg-black text-white relative">
      {/* Tie-breaker overlay if active */}
      {activeTieBreaker !== 'NONE' && <TieBreakerOverlayView />}

      {/* Main Round View Router */}
      {currentRound === 'HOME' || currentRound === 'ROUND_1' ? (
        <HomeView />
      ) : currentRound === 'ROUND_1_RESULTS' ? (
        <Round1ResultsView />
      ) : currentRound === 'ROUND_2' ? (
        <NetherIntroView />
      ) : currentRound === 'ROUND_2_WAGER' || currentRound === 'ROUND_2_QUESTION' || currentRound === 'ROUND_2_BOARD' ? (
        <NetherWagerQuestionView />
      ) : currentRound === 'ROUND_2_SCOREBOARD' ? (
        <Round2ScoreboardView />
      ) : currentRound === 'ROUND_3' || currentRound === 'ROUND_3_FINALISTS' ? (
        <FinalistsView />
      ) : currentRound === 'ROUND_3_QUESTION' ? (
        <Round3QuestionView />
      ) : currentRound === 'ROUND_3_SCOREBOARD' ? (
        <Round3ScoreboardView />
      ) : currentRound === 'WINNER' ? (
        <WinnerView />
      ) : (
        <HomeView />
      )}
    </div>
  );
};
