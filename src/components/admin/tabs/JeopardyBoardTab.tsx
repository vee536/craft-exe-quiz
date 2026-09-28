import React, { useState } from 'react';
import { useEvent } from '../../../context/EventContext';
import { RotateCcw, ExternalLink, ArrowRightLeft, Check, Sparkles } from 'lucide-react';

export const JeopardyBoardTab: React.FC = () => {
  const {
    state,
    setBoardConfig,
    assignQuestionToBoardCell,
    setCellAnswered,
    resetBoardCells,
    openJeopardyQuestion
  } = useEvent();

  const { jeopardyBoard, questionBanks, teams } = state;
  const { categories, pointTiers, matrix } = jeopardyBoard;
  const r2Bank = questionBanks.round2Jeopardy;

  const [editingCategories, setEditingCategories] = useState<string[]>(categories);
  const [selectedCellForSwap, setSelectedCellForSwap] = useState<{ catIdx: number; ptIdx: number } | null>(null);

  const handleCategoryChange = (idx: number, val: string) => {
    const updated = [...editingCategories];
    updated[idx] = val;
    setEditingCategories(updated);
    setBoardConfig({
      ...jeopardyBoard,
      categories: updated
    });
  };

  const handleAutoAssign = () => {
    // Attempt to match questions from r2Bank to board cells
    categories.forEach((cat, catIdx) => {
      pointTiers.forEach((pts, ptIdx) => {
        const match = r2Bank.find(
          q => q.category.toLowerCase().includes(cat.toLowerCase()) && q.points === pts
        ) || r2Bank.find(q => q.points === pts);

        if (match) {
          assignQuestionToBoardCell(catIdx, ptIdx, match.id);
        }
      });
    });
  };

  return (
    <div className="space-y-6">
      {/* HEADER & CONTROLS */}
      <div className="bg-[#18181b] border-2 border-[#3f3f46] p-6 shadow-pixel">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#3f3f46] pb-4 mb-4">
          <div>
            <h2 className="font-pixel text-base md:text-lg text-white uppercase">
              ROUND 2 JEOPARDY BOARD CONFIGURATOR
            </h2>
            <p className="font-sans text-xs text-zinc-400 mt-1">
              This 5×5 layout is the active playing board. You can swap any question from your large Round 2 Bank ({r2Bank.length} questions available) into any slot.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleAutoAssign}
              className="bg-[#27272a] hover:bg-zinc-700 text-amber-300 font-pixel text-xs px-3 py-2 border border-[#52525b] shadow-pixel-sm transition-colors flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4 text-amber-400" />
              Auto-Match from Bank
            </button>

            <button
              onClick={() => {
                if (confirm('Reset all 25 board questions to unanswered status?')) {
                  resetBoardCells();
                }
              }}
              className="bg-red-950 hover:bg-red-900 text-red-300 font-pixel text-xs px-3 py-2 border border-red-700 shadow-pixel-sm transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Board Cells
            </button>
          </div>
        </div>

        {/* EDIT CATEGORY NAMES */}
        <div className="space-y-2">
          <label className="font-pixel text-[11px] text-zinc-400 uppercase">
            Board Column Categories (5 Columns):
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-2">
            {categories.map((cat, idx) => (
              <div key={idx} className="flex flex-col">
                <span className="text-[10px] font-mono text-amber-400 mb-1">
                  Col {idx + 1}:
                </span>
                <input
                  type="text"
                  value={cat}
                  onChange={(e) => handleCategoryChange(idx, e.target.value)}
                  className="bg-[#111215] border border-zinc-700 px-3 py-1.5 text-white font-sans text-xs font-bold focus:border-amber-400 focus:outline-none"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5x5 BOARD GRID EDITOR */}
      <div className="bg-[#18181b] border-2 border-[#3f3f46] p-6 shadow-pixel overflow-x-auto">
        <div className="min-w-[800px]">
          {/* Header Row */}
          <div className="grid grid-cols-5 gap-3 mb-3">
            {categories.map((cat, idx) => (
              <div
                key={idx}
                className="bg-[#2a0808] border-2 border-[#ef4444] p-3 text-center shadow-pixel"
              >
                <div className="font-pixel text-xs text-[#fef08a] truncate">
                  {cat}
                </div>
              </div>
            ))}
          </div>

          {/* Point Rows */}
          {pointTiers.map((pts, ptIdx) => (
            <div key={pts} className="grid grid-cols-5 gap-3 mb-3">
              {categories.map((_, catIdx) => {
                const cell = matrix[catIdx]?.[ptIdx];
                const isAnswered = cell?.isAnswered;
                const assignedQ = r2Bank.find(q => q.id === cell?.questionId);
                const answeredTeam = cell?.answeredByTeamId ? teams.find(t => t.id === cell.answeredByTeamId) : null;

                return (
                  <div
                    key={`cell-edit-${catIdx}-${ptIdx}`}
                    className={`border-2 p-3 flex flex-col justify-between transition-all min-h-[140px] ${
                      isAnswered
                        ? 'bg-[#111215] border-zinc-700 opacity-65'
                        : 'bg-[#1e1b2e] border-indigo-700 hover:border-amber-400'
                    }`}
                  >
                    <div>
                      {/* Top Bar: Points + Status */}
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="font-pixel text-sm text-[#fef08a] font-bold">
                          {pts} PTS
                        </span>
                        {isAnswered ? (
                          <span className="text-[10px] font-mono text-zinc-400 bg-black/60 px-1 border border-zinc-700">
                            Answered
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-1 border border-emerald-700">
                            Available
                          </span>
                        )}
                      </div>

                      {/* Question Text / Snippet */}
                      <p className="font-sans text-xs text-zinc-300 line-clamp-3 mb-2">
                        {assignedQ ? assignedQ.questionText : `Unassigned / Placeholder`}
                      </p>

                      {answeredTeam && (
                        <div className="text-[10px] font-sans font-bold text-amber-300 truncate">
                          ✓ {answeredTeam.name}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between gap-1 border-t border-zinc-800 pt-2 mt-2">
                      <button
                        onClick={() => setSelectedCellForSwap({ catIdx, ptIdx })}
                        className="font-pixel text-[8px] bg-zinc-800 hover:bg-zinc-700 text-zinc-300 px-1.5 py-1 border border-zinc-600 flex items-center gap-1"
                        title="Swap question from Bank"
                      >
                        <ArrowRightLeft className="w-2.5 h-2.5 text-amber-400" />
                        Swap
                      </button>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setCellAnswered(catIdx, ptIdx, !isAnswered)}
                          className={`font-mono text-[9px] px-1 py-0.5 border ${
                            isAnswered
                              ? 'bg-zinc-800 text-zinc-400 border-zinc-700'
                              : 'bg-emerald-950 text-emerald-400 border-emerald-700'
                          }`}
                          title="Toggle Answered state"
                        >
                          <Check className="w-2.5 h-2.5" />
                        </button>

                        <button
                          onClick={() => openJeopardyQuestion(catIdx, ptIdx)}
                          className="font-pixel text-[8px] bg-amber-500 hover:bg-amber-400 text-black px-1.5 py-1 font-bold shadow-pixel-sm flex items-center gap-1"
                          title="Open on Projector"
                        >
                          <ExternalLink className="w-2.5 h-2.5" />
                          Launch
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* SWAP QUESTION MODAL */}
      {selectedCellForSwap && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-[#18181b] border-4 border-amber-400 p-6 max-w-3xl w-full max-h-[85vh] flex flex-col shadow-pixel-lg">
            <div className="flex items-center justify-between border-b border-zinc-700 pb-3 mb-4">
              <div>
                <h3 className="font-pixel text-sm text-amber-400 uppercase">
                  Select Question for Slot [{categories[selectedCellForSwap.catIdx]} — {pointTiers[selectedCellForSwap.ptIdx]} PTS]
                </h3>
                <p className="font-sans text-xs text-zinc-400">
                  Pick any question from your full {r2Bank.length}-question Round 2 Bank:
                </p>
              </div>
              <button
                onClick={() => setSelectedCellForSwap(null)}
                className="font-pixel text-xs bg-zinc-800 text-zinc-400 hover:text-white px-2 py-1"
              >
                X
              </button>
            </div>

            {/* Questions List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
              {r2Bank.map((q) => {
                const isCurrentlyAssigned = matrix[selectedCellForSwap.catIdx]?.[selectedCellForSwap.ptIdx]?.questionId === q.id;

                return (
                  <div
                    key={q.id}
                    onClick={() => {
                      assignQuestionToBoardCell(selectedCellForSwap.catIdx, selectedCellForSwap.ptIdx, q.id);
                      setSelectedCellForSwap(null);
                    }}
                    className={`p-3 border flex items-center justify-between cursor-pointer transition-all ${
                      isCurrentlyAssigned
                        ? 'bg-amber-950/60 border-amber-400'
                        : 'bg-[#111215] border-zinc-800 hover:border-zinc-500'
                    }`}
                  >
                    <div className="flex-1 pr-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-pixel text-[9px] bg-zinc-800 text-zinc-300 px-1.5 py-0.5">
                          {q.category}
                        </span>
                        <span className="font-mono text-xs text-amber-400 font-bold">
                          {q.points} PTS
                        </span>
                        <span className="font-mono text-[10px] text-zinc-500">
                          ({q.difficulty})
                        </span>
                        {isCurrentlyAssigned && (
                          <span className="font-pixel text-[8px] bg-amber-400 text-black px-1">
                            CURRENTLY ASSIGNED
                          </span>
                        )}
                      </div>
                      <p className="font-sans text-sm text-white font-medium">
                        {q.questionText}
                      </p>
                      <p className="font-mono text-xs text-emerald-400 mt-1">
                        Answer: {q.correctAnswer}
                      </p>
                    </div>

                    <button className="font-pixel text-[9px] bg-amber-500 text-black px-2 py-1 font-bold">
                      ASSIGN
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
