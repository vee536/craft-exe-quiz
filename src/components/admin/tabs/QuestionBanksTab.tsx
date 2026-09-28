import React, { useState } from 'react';
import { useEvent } from '../../../context/EventContext';
import { Question, QuestionDifficulty, EventState } from '../../../types';
import {
  Plus,
  Search,
  Trash2,
  Edit,
  ExternalLink,
  Copy,
  BookOpen,
  Code,
  Image as ImageIcon
} from 'lucide-react';

type BankKey = Exclude<keyof EventState['questionBanks'], 'round2Jeopardy'>;

export const QuestionBanksTab: React.FC = () => {
  const { state, addQuestion, updateQuestion, deleteQuestion, openBankQuestion } = useEvent();
  const [activeBankKey, setActiveBankKey] = useState<BankKey>('round2Main');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // Form State
  const [formCategory, setFormCategory] = useState('');
  const [formPoints, setFormPoints] = useState(200);
  const [formDifficulty, setFormDifficulty] = useState<QuestionDifficulty>('Medium');
  const [formQuestionText, setFormQuestionText] = useState('');
  const [formCorrectAnswer, setFormCorrectAnswer] = useState('');
  const [formExplanation, setFormExplanation] = useState('');
  const [formCodeSnippet, setFormCodeSnippet] = useState('');
  const [formMediaUrl, setFormMediaUrl] = useState('');

  const bankConfigs: Record<BankKey, { label: string; icon: string; themeColor: string; defaultCat: string }> = {
    round1Main: {
      label: '🌳 R1 Main (15 Qs)',
      icon: '🌳',
      themeColor: 'text-emerald-400 border-emerald-500',
      defaultCat: 'Overworld Written Quiz'
    },
    round1TieBreakers: {
      label: '🌳 R1 Tie-Break (5 Qs)',
      icon: '🌿',
      themeColor: 'text-emerald-300 border-emerald-600',
      defaultCat: 'R1 Tie-Breaker'
    },
    round1Emergency: {
      label: '🌳 R1 Emergency (2 Qs)',
      icon: '🚨',
      themeColor: 'text-emerald-200 border-emerald-700',
      defaultCat: 'R1 Emergency'
    },
    round2Main: {
      label: '🔥 R2 Main Wager (8 Qs)',
      icon: '🔥',
      themeColor: 'text-red-400 border-red-500',
      defaultCat: 'Nether Wager Round'
    },
    round2TieBreakers: {
      label: '🔥 R2 Tie-Break (3 Qs)',
      icon: '🛡️',
      themeColor: 'text-amber-400 border-amber-500',
      defaultCat: 'Nether Tie-Breaker'
    },
    round2Emergency: {
      label: '🔥 R2 Emergency (2 Qs)',
      icon: '⚠️',
      themeColor: 'text-orange-400 border-orange-500',
      defaultCat: 'Nether Emergency'
    },
    round3Finals: {
      label: '🐉 R3 Finals Buzzer',
      icon: '🐉',
      themeColor: 'text-purple-400 border-purple-500',
      defaultCat: 'Final Rapid-Fire'
    },
    round3TieBreakers: {
      label: '🐉 R3 Architecture Tie',
      icon: '📐',
      themeColor: 'text-pink-400 border-pink-500',
      defaultCat: 'Architecture & Flowcharts'
    },
  };

  const currentQuestions = state.questionBanks[activeBankKey] || [];

  const filteredQuestions = currentQuestions.filter(q => {
    const matchesSearch =
      q.questionText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.correctAnswer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDiff = selectedDifficulty === 'ALL' || q.difficulty === selectedDifficulty;
    return matchesSearch && matchesDiff;
  });

  const openAddModal = () => {
    setEditingQuestion(null);
    setFormCategory(bankConfigs[activeBankKey]?.defaultCat || 'General IT');
    setFormPoints(activeBankKey === 'round1Main' ? 1 : activeBankKey === 'round2Main' ? 400 : 100);
    setFormDifficulty('Medium');
    setFormQuestionText('');
    setFormCorrectAnswer('');
    setFormExplanation('');
    setFormCodeSnippet('');
    setFormMediaUrl('');
    setIsModalOpen(true);
  };

  const openEditModal = (q: Question) => {
    setEditingQuestion(q);
    setFormCategory(q.category);
    setFormPoints(q.points);
    setFormDifficulty(q.difficulty);
    setFormQuestionText(q.questionText);
    setFormCorrectAnswer(q.correctAnswer);
    setFormExplanation(q.explanation || '');
    setFormCodeSnippet(q.codeSnippet || '');
    setFormMediaUrl(q.mediaUrl || '');
    setIsModalOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formQuestionText.trim() || !formCorrectAnswer.trim()) {
      alert('Please provide both question text and correct answer.');
      return;
    }

    if (editingQuestion) {
      updateQuestion(activeBankKey, {
        ...editingQuestion,
        category: formCategory.trim() || 'General',
        points: formPoints,
        difficulty: formDifficulty,
        questionText: formQuestionText.trim(),
        correctAnswer: formCorrectAnswer.trim(),
        explanation: formExplanation.trim() || undefined,
        codeSnippet: formCodeSnippet.trim() || undefined,
        mediaUrl: formMediaUrl.trim() || undefined,
      });
    } else {
      addQuestion(activeBankKey, {
        category: formCategory.trim() || 'General',
        points: formPoints,
        difficulty: formDifficulty,
        questionText: formQuestionText.trim(),
        correctAnswer: formCorrectAnswer.trim(),
        explanation: formExplanation.trim() || undefined,
        codeSnippet: formCodeSnippet.trim() || undefined,
        mediaUrl: formMediaUrl.trim() || undefined,
        isUsed: false,
      });
    }

    setIsModalOpen(false);
  };

  const handleDuplicate = (q: Question) => {
    addQuestion(activeBankKey, {
      ...q,
      questionText: `${q.questionText} (Copy)`,
      isUsed: false,
    });
  };

  return (
    <div className="space-y-6">
      {/* BANK SUB-TABS */}
      <div className="bg-[#18181b] border-2 border-[#3f3f46] p-4 shadow-pixel">
        <div className="font-pixel text-xs text-zinc-400 uppercase mb-3">
          Select Question Bank (Round 1: 15+5+2 | Round 2: 8+3+2 | Round 3 Finals):
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {(Object.keys(bankConfigs) as BankKey[]).map((key) => {
            const cfg = bankConfigs[key];
            const count = state.questionBanks[key]?.length || 0;
            const isSelected = activeBankKey === key;

            return (
              <button
                key={key}
                onClick={() => {
                  setActiveBankKey(key);
                  setSearchTerm('');
                  setSelectedDifficulty('ALL');
                }}
                className={`p-2.5 border text-left flex flex-col justify-between transition-all shadow-pixel-sm ${
                  isSelected
                    ? `bg-[#27272a] ${cfg.themeColor} border-2`
                    : 'bg-[#111215] border-zinc-700 hover:border-zinc-500 text-zinc-400'
                }`}
              >
                <div className="font-pixel text-[11px] truncate">
                  {cfg.label}
                </div>
                <div className="font-mono text-[10px] text-zinc-400 mt-2 flex items-center justify-between">
                  <span>Questions:</span>
                  <strong className={isSelected ? 'text-white' : 'text-zinc-300'}>{count}</strong>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* FILTER & ADD TOOLBAR */}
      <div className="bg-[#18181b] border-2 border-[#3f3f46] p-4 shadow-pixel flex flex-wrap items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search question text, answer, or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#111215] border border-zinc-700 pl-9 pr-4 py-1.5 text-white font-sans text-xs focus:border-amber-400 focus:outline-none"
          />
        </div>

        {/* Difficulty Filter */}
        <div className="flex items-center gap-1 font-mono text-xs">
          <span className="text-zinc-400">Difficulty:</span>
          {['ALL', 'Easy', 'Medium', 'Hard', 'Expert'].map((diff) => (
            <button
              key={diff}
              onClick={() => setSelectedDifficulty(diff)}
              className={`px-2 py-1 border ${
                selectedDifficulty === diff
                  ? 'bg-zinc-700 border-zinc-400 text-white'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-400'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>

        {/* Add Question Button */}
        <button
          onClick={openAddModal}
          className="bg-amber-500 hover:bg-amber-400 text-black font-pixel text-xs px-4 py-2 font-bold shadow-pixel-sm flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" />
          ADD QUESTION
        </button>
      </div>

      {/* QUESTIONS LIST */}
      <div className="space-y-3">
        {filteredQuestions.length > 0 ? (
          filteredQuestions.map((q, idx) => (
            <div
              key={q.id}
              className="bg-[#18181b] border-2 border-zinc-700 p-5 shadow-pixel hover:border-zinc-500 transition-colors"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs text-zinc-500">#{idx + 1}</span>
                  <span className="font-pixel text-[10px] bg-zinc-800 text-amber-400 px-2 py-0.5 border border-zinc-700 uppercase">
                    {q.category}
                  </span>
                  <span className="font-mono text-xs text-amber-400 font-bold">
                    {q.points} {q.points === 1 ? 'MARK' : 'PTS'}
                  </span>
                  <span className={`font-mono text-[10px] px-1.5 py-0.2 border ${
                    q.difficulty === 'Easy' ? 'text-emerald-400 border-emerald-800' :
                    q.difficulty === 'Medium' ? 'text-amber-400 border-amber-800' :
                    q.difficulty === 'Hard' ? 'text-orange-400 border-orange-800' :
                    'text-red-400 border-red-800'
                  }`}>
                    {q.difficulty}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {activeBankKey !== 'round1Main' && activeBankKey !== 'round2Main' && (
                    <button
                    onClick={() => openBankQuestion(activeBankKey, q.id)}
                    className="bg-amber-500 hover:bg-amber-400 text-black font-pixel text-[9px] px-2.5 py-1 font-bold shadow-pixel-sm flex items-center gap-1"
                    title="Launch immediately on Projector"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Launch
                    </button>
                  )}
                  <button
                    onClick={() => handleDuplicate(q)}
                    className="p-1 text-zinc-400 hover:text-white"
                    title="Duplicate Question"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => openEditModal(q)}
                    className="p-1 text-zinc-400 hover:text-amber-400"
                    title="Edit Question"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Delete this question from the bank?')) {
                        deleteQuestion(activeBankKey, q.id);
                      }
                    }}
                    className="p-1 text-zinc-400 hover:text-red-400"
                    title="Delete Question"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Question Text */}
              <p className="font-sans font-bold text-base text-white mb-2">
                {q.questionText}
              </p>

              {/* Code Snippet Preview */}
              {q.codeSnippet && (
                <pre className="bg-[#09090b] p-3 text-xs font-mono text-emerald-400 border border-zinc-800 rounded my-2 overflow-x-auto whitespace-pre">
                  {q.codeSnippet}
                </pre>
              )}

              {/* Media URL Preview */}
              {q.mediaUrl && (
                <div className="my-2">
                  <img
                    src={q.mediaUrl}
                    alt="Question visual"
                    className="max-h-32 border border-zinc-700 object-contain"
                  />
                </div>
              )}

              {/* Answer & Explanation */}
              <div className="bg-[#111215] border border-zinc-800 p-3 mt-2 font-mono text-xs">
                <span className="text-zinc-400">Answer: </span>
                <strong className="text-emerald-400 text-sm">{q.correctAnswer}</strong>
                {q.explanation && (
                  <p className="font-sans text-xs text-zinc-400 mt-1">
                    {q.explanation}
                  </p>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="bg-[#18181b] border-2 border-dashed border-zinc-700 p-10 text-center">
            <BookOpen className="w-8 h-8 text-zinc-600 mx-auto mb-2" />
            <p className="font-sans text-zinc-400 text-sm mb-3">
              No questions found in this bank matching your search.
            </p>
            <button
              onClick={openAddModal}
              className="bg-amber-500 text-black font-pixel text-xs px-4 py-2 font-bold shadow-pixel-sm inline-flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Add First Question
            </button>
          </div>
        )}
      </div>

      {/* ADD / EDIT QUESTION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#18181b] border-4 border-amber-400 p-6 max-w-2xl w-full shadow-pixel-lg my-8">
            <div className="flex items-center justify-between border-b border-zinc-700 pb-3 mb-4">
              <h3 className="font-pixel text-sm text-amber-400 uppercase">
                {editingQuestion ? 'Edit Question' : 'Add New Question to Bank'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="font-pixel text-xs bg-zinc-800 text-zinc-400 hover:text-white px-2 py-1"
              >
                X
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="space-y-4 font-sans text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Category */}
                <div>
                  <label className="block text-zinc-400 font-mono mb-1">Category:</label>
                  <input
                    type="text"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full bg-[#111215] border border-zinc-700 p-2 text-white font-sans text-xs focus:border-amber-400 focus:outline-none"
                    required
                  />
                </div>

                {/* Points */}
                <div>
                  <label className="block text-zinc-400 font-mono mb-1">Points / Marks:</label>
                  <input
                    type="number"
                    value={formPoints}
                    onChange={(e) => setFormPoints(parseInt(e.target.value) || 100)}
                    className="w-full bg-[#111215] border border-zinc-700 p-2 text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
                    required
                  />
                </div>

                {/* Difficulty */}
                <div>
                  <label className="block text-zinc-400 font-mono mb-1">Difficulty:</label>
                  <select
                    value={formDifficulty}
                    onChange={(e) => setFormDifficulty(e.target.value as QuestionDifficulty)}
                    className="w-full bg-[#111215] border border-zinc-700 p-2 text-white font-mono text-xs focus:border-amber-400 focus:outline-none"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                    <option value="Expert">Expert</option>
                  </select>
                </div>
              </div>

              {/* Question Text */}
              <div>
                <label className="block text-zinc-400 font-mono mb-1">Question Text:</label>
                <textarea
                  rows={3}
                  value={formQuestionText}
                  onChange={(e) => setFormQuestionText(e.target.value)}
                  placeholder="Enter the quiz question prompt..."
                  className="w-full bg-[#111215] border border-zinc-700 p-2 text-white font-sans text-sm focus:border-amber-400 focus:outline-none"
                  required
                />
              </div>

              {/* Correct Answer */}
              <div>
                <label className="block text-zinc-400 font-mono mb-1">Correct Answer:</label>
                <input
                  type="text"
                  value={formCorrectAnswer}
                  onChange={(e) => setFormCorrectAnswer(e.target.value)}
                  placeholder="Enter exact correct answer..."
                  className="w-full bg-[#111215] border border-zinc-700 p-2 text-white font-sans text-sm font-bold focus:border-amber-400 focus:outline-none"
                  required
                />
              </div>

              {/* Explanation */}
              <div>
                <label className="block text-zinc-400 font-mono mb-1">Optional Explanation / Notes:</label>
                <textarea
                  rows={2}
                  value={formExplanation}
                  onChange={(e) => setFormExplanation(e.target.value)}
                  placeholder="Additional context shown when answer is revealed..."
                  className="w-full bg-[#111215] border border-zinc-700 p-2 text-zinc-300 font-sans text-xs focus:border-amber-400 focus:outline-none"
                />
              </div>

              {/* Optional Code Snippet */}
              <div>
                <label className="block text-zinc-400 font-mono mb-1 flex items-center gap-1">
                  <Code className="w-3.5 h-3.5 text-emerald-400" />
                  Optional Code Snippet / Flowchart ASCII:
                </label>
                <textarea
                  rows={3}
                  value={formCodeSnippet}
                  onChange={(e) => setFormCodeSnippet(e.target.value)}
                  placeholder="e.g. def foo(): or [Client] ---> [Server]"
                  className="w-full bg-[#09090b] border border-zinc-700 p-2 text-emerald-400 font-mono text-xs focus:border-amber-400 focus:outline-none"
                />
              </div>

              {/* Optional Media Image URL */}
              <div>
                <label className="block text-zinc-400 font-mono mb-1 flex items-center gap-1">
                  <ImageIcon className="w-3.5 h-3.5 text-cyan-400" />
                  Optional Diagram / Image URL:
                </label>
                <input
                  type="text"
                  value={formMediaUrl}
                  onChange={(e) => setFormMediaUrl(e.target.value)}
                  placeholder="https://example.com/diagram.png or data:image/png;base64,..."
                  className="w-full bg-[#111215] border border-zinc-700 p-2 text-cyan-300 font-mono text-xs focus:border-amber-400 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-zinc-700 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 font-pixel text-xs text-zinc-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-amber-500 hover:bg-amber-400 text-black font-pixel text-xs px-5 py-2 font-bold shadow-pixel-sm"
                >
                  {editingQuestion ? 'Update Question' : 'Save to Bank'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
