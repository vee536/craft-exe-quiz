import React, { useState, useEffect, useMemo } from 'react';
import { useEvent } from '../../context/EventContext';
import { fetchRoundSummary, fetchQuestionResults, deleteRoundData } from '../../services/api';
import { exportRound2ToCsv } from '../../utils/csvDownload';
import {
  Flame,
  CheckCircle,
  XCircle,
  Search,
  RefreshCw,
  Download,
  ArrowLeft,
  Database,
  Award,
  Filter,
  Sparkles,
  TreePine,
  Sliders,
  Trophy,
  HelpCircle,
  Clock,
  Eye,
  Trash2,
  Radio
} from 'lucide-react';

export const Round2ResultsPage: React.FC = () => {
  const { state } = useEvent();
  const [dbData, setDbData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'finalists' | 'eliminated'>('all');
  const [activeTab, setActiveTab] = useState<'standings' | 'matrix' | 'questions'>('standings');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Background fetch from Firestore
  const loadCloudData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const summary = await fetchRoundSummary('ROUND_2');
      if (summary) {
        setDbData(summary);
      }
      setLastRefreshed(new Date());
    } catch (e) {
      console.warn('Error loading Round 2 cloud data:', e);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Poll Firestore every 3 seconds for remote synchronization
  useEffect(() => {
    loadCloudData(true);
    const interval = setInterval(() => {
      loadCloudData(true);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // ─── UNIFIED REAL-TIME DATA COMPUTATION ────────────────────────────────────
  // Determine if state has live progress, or fallback to cloud data
  const { sortedTeams, standingsMap, questionsList, totalQualified, finalists, highestScore } = useMemo(() => {
    // 1. Teams selection
    let candidateTeams: any[] = state.teams.filter(t => t.isQualifiedR2);
    if (candidateTeams.length === 0) {
      // Fallback: If not yet explicitly flagged, pick top 20 by R1 score
      candidateTeams = [...state.teams]
        .sort((a, b) => (b.round1Score ?? 0) - (a.round1Score ?? 0))
        .slice(0, 20);
    }

    // Check if cloud data has newer / higher scores
    const dbTeams: any[] = dbData?.standings || dbData?.allTeams || [];
    const dbHasScores = dbTeams.some((t: any) => (t.finalR2Score ?? t.round2Score ?? 0) > 0);
    const stateHasScores = candidateTeams.some(t => (t.round2Score ?? 0) > 0);

    let effectiveTeams: any[] = candidateTeams;
    if (!stateHasScores && dbHasScores && dbTeams.length > 0) {
      effectiveTeams = dbTeams.map((dt: any) => {
        const local = state.teams.find(t => t.id === (dt.teamId || dt.id));
        return {
          id: dt.teamId || dt.id,
          name: dt.teamName || dt.name || local?.name || dt.id,
          round2Score: dt.finalR2Score ?? dt.round2Score ?? 0,
          round1Score: dt.round1Score ?? local?.round1Score ?? 0,
          isQualifiedR2: true,
          isFinalistR3: Boolean(dt.isFinalistR3),
          doubleUsedAtQuestion: dt.doubleUsedAtQuestion,
          round3StartingScore: dt.round3StartingScore,
        };
      });
    }

    // Sort descending by round2Score
    const sorted = [...effectiveTeams].sort((a, b) => (b.round2Score ?? 0) - (a.round2Score ?? 0));
    const maxScore = sorted[0]?.round2Score ?? 0;

    // 2. Build standings map with double results and R3 normalized scores
    const sMap = new Map<string, any>();
    sorted.forEach((team, idx) => {
      const overallRank = idx + 1;
      const isTop10 = team.isFinalistR3 || overallRank <= 10;
      const score = team.round2Score ?? 0;

      // Find which question DOUBLE was used
      let doubleAt = team.doubleUsedAtQuestion || null;
      let doubleRes: string | null = null;

      for (let q = 0; q < 8; q++) {
        const qRec = state.round2Wager.questions[q];
        const sub = qRec?.wagers?.[team.id];
        if (sub?.isDouble) {
          doubleAt = q + 1;
          if (sub.isCorrect === true) doubleRes = 'CORRECT';
          if (sub.isCorrect === false) doubleRes = 'WRONG';
          break;
        }
      }

      // If cloud standings have it, adopt it
      const cloudStanding = dbData?.standings?.find((s: any) => s.teamId === team.id);
      if (cloudStanding) {
        if (!doubleAt && cloudStanding.doubleUsedAtQuestion) doubleAt = cloudStanding.doubleUsedAtQuestion;
        if (!doubleRes && cloudStanding.doubleResult) doubleRes = cloudStanding.doubleResult;
      }

      const startingScore = team.round3StartingScore !== undefined && team.round3StartingScore > 0
        ? team.round3StartingScore
        : maxScore > 0
        ? Number(((score / maxScore) * 100).toFixed(2))
        : 0;

      sMap.set(team.id, {
        rank: overallRank,
        isTop10,
        doubleAt,
        doubleRes,
        startingScore,
      });
    });

    // 3. Questions list
    const qList = (state.questionBanks.round2Main && state.questionBanks.round2Main.length > 0)
      ? state.questionBanks.round2Main
      : (dbData?.questions || []);

    const fins = sorted.filter(t => sMap.get(t.id)?.isTop10);

    return {
      sortedTeams: sorted,
      standingsMap: sMap,
      questionsList: qList,
      totalQualified: sorted.length,
      finalists: fins,
      highestScore: maxScore,
    };
  }, [state.teams, state.round2Wager, state.questionBanks.round2Main, dbData]);

  const filteredTeams = sortedTeams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    const isTop10 = standingsMap.get(team.id)?.isTop10;
    if (filterMode === 'finalists') return isTop10;
    if (filterMode === 'eliminated') return !isTop10;
    return true;
  });

  const handleDeleteRound2Data = async () => {
    if (!confirm('Are you sure you want to delete Round 2 wager matrix and question results from Firestore and exports?')) {
      return;
    }
    setLoading(true);
    const ok = await deleteRoundData('ROUND_2');
    if (ok) {
      setDbData(null);
      setActionMessage('Round 2 wager data deleted from Firestore and exports.');
      setTimeout(() => setActionMessage(null), 4000);
    } else {
      alert('Failed to delete Round 2 data. Please check server connection.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#110505] text-white flex flex-col font-sans selection:bg-amber-500 selection:text-black">
      {/* Top Navbar */}
      <header className="bg-[#180505] border-b-4 border-[#ef4444] px-4 md:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3 shadow-pixel-glow-red">
        <div className="flex items-center gap-3">
          <a
            href="#/"
            className="flex items-center gap-1.5 text-zinc-400 hover:text-white font-pixel text-xs px-2.5 py-1.5 border border-zinc-700 bg-[#270b0b] shadow-pixel-sm transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>PORTAL</span>
          </a>
          <span className="text-zinc-600">|</span>
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-red-500 animate-pulse" />
            <h1 className="font-pixel text-sm md:text-base text-[#fef08a] uppercase tracking-wider">
              ROUND 2: THE NETHER <span className="text-[#ef4444] text-xs">• ALL-TEAM WAGER RESULTS</span>
            </h1>
          </div>
        </div>

        {/* Links & Quick Actions */}
        <div className="flex items-center gap-2">
          {/* Link to Round 1 Results */}
          <a
            href="#/round1-results"
            className="bg-[#142216] hover:bg-[#1e3422] border border-emerald-500 text-emerald-300 font-pixel text-[11px] px-3 py-1.5 flex items-center gap-1.5 shadow-pixel-sm transition-all"
          >
            <TreePine className="w-3.5 h-3.5 text-emerald-400" />
            <span>VIEW ROUND 1 RESULTS</span>
          </a>

          {/* Admin link */}
          <a
            href="#/admin"
            className="bg-[#2a0c0c] hover:bg-[#381111] border border-zinc-700 text-zinc-300 font-pixel text-[11px] px-2.5 py-1.5 flex items-center gap-1.5 shadow-pixel-sm transition-all"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">ADMIN</span>
          </a>

          {/* Refresh button */}
          <button
            onClick={async () => {
              await loadCloudData(false);
              setActionMessage('Refreshed data from Firebase collection: round_2_wager_results');
              setTimeout(() => setActionMessage(null), 4000);
            }}
            disabled={loading}
            className="bg-[#2a0c0c] hover:bg-[#381111] border border-amber-500 text-amber-300 font-pixel text-[11px] px-3 py-1.5 font-bold flex items-center gap-1.5 shadow-pixel-sm transition-all cursor-pointer"
            title="Refresh results from Firebase"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>REFRESH</span>
          </button>

          {/* Export CSV button */}
          <button
            onClick={() => exportRound2ToCsv(sortedTeams, Array.from(standingsMap.entries()).map(([k, v]) => ({ teamId: k, ...v })), state.round2Wager.questions)}
            className="bg-amber-500 hover:bg-amber-400 text-black font-pixel text-[11px] px-3.5 py-1.5 font-bold flex items-center gap-1.5 shadow-pixel-sm transition-all cursor-pointer"
            title="Download full 8-Question Wager Matrix CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT WAGER MATRIX CSV</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 space-y-6">
        {/* Live Auto-Sync Status Bar */}
        <div className="bg-[#240808] border-2 border-red-500/80 p-4 shadow-pixel flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <Radio className="w-4 h-4 text-emerald-400" />
            <div className="font-mono text-xs">
              <span className="text-zinc-400">SYNC MODE: </span>
              <strong className="text-emerald-400 font-bold">
                LIVE REAL-TIME REACTIVE AUTO-SORTING (ACTIVE)
              </strong>
              <span className="text-zinc-500 ml-2 text-[11px]">
                • Changes in Admin Console reflect instantly without refresh
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={async () => {
                await loadCloudData(false);
                setActionMessage('Results refreshed from Firebase collection: round_2_wager_results');
                setTimeout(() => setActionMessage(null), 4000);
              }}
              disabled={loading}
              className="bg-amber-500 hover:bg-amber-400 text-black font-pixel text-xs px-4 py-2 font-bold flex items-center gap-2 shadow-pixel transition-all cursor-pointer"
              title="Click to refresh results directly from Firebase collection: round_2_wager_results"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'FETCHING FIREBASE...' : 'REFRESH RESULTS'}</span>
            </button>

            <button
              onClick={handleDeleteRound2Data}
              disabled={loading}
              className="bg-red-950/80 hover:bg-red-900 border border-red-600 text-red-300 font-pixel text-xs px-3 py-2 flex items-center gap-1.5 shadow-pixel-sm transition-all"
              title="Delete Round 2 wager data from Firestore and exports"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
              <span>CLEAR R2 CLOUD DATA</span>
            </button>
          </div>
        </div>

        {actionMessage && (
          <div className="p-3 bg-red-950/90 border-2 border-red-500 text-red-200 font-pixel text-xs flex items-center justify-between shadow-pixel animate-pulse">
            <span>⚠️ {actionMessage}</span>
            <button onClick={() => setActionMessage(null)} className="text-zinc-400 hover:text-white font-mono text-sm px-2">×</button>
          </div>
        )}

        {/* Highlights Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="bg-[#220707] border-2 border-red-600 p-4 shadow-pixel">
            <span className="font-pixel text-[10px] text-zinc-400 uppercase block mb-1">QUALIFIED CONTESTANTS</span>
            <div className="font-pixel text-3xl text-white">{totalQualified} <span className="text-xs text-zinc-400">TEAMS</span></div>
            <span className="font-sans text-[11px] text-zinc-400 mt-1 block">All teams answer all 8 Qs</span>
          </div>

          <div className="bg-[#220707] border-2 border-purple-500 p-4 shadow-pixel">
            <span className="font-pixel text-[10px] text-purple-300 uppercase block mb-1">FINALISTS ADVANCING</span>
            <div className="font-pixel text-3xl text-purple-300">{finalists.length} <span className="text-xs text-purple-200">/ 10</span></div>
            <span className="font-sans text-[11px] text-purple-400 mt-1 block">Advancing to The End 🐉</span>
          </div>

          <div className="bg-[#220707] border-2 border-amber-500 p-4 shadow-pixel">
            <span className="font-pixel text-[10px] text-amber-400 uppercase block mb-1">TOP WAGER SCORE</span>
            <div className="font-pixel text-3xl text-[#fef08a]">{highestScore} <span className="text-xs text-zinc-400">PTS</span></div>
            <span className="font-sans text-[11px] text-zinc-400 mt-1 block">Leaderboard #1 score</span>
          </div>

          <div className="bg-[#220707] border-2 border-emerald-600 p-4 shadow-pixel">
            <span className="font-pixel text-[10px] text-emerald-400 uppercase block mb-1">QUESTIONS SCORED</span>
            <div className="font-pixel text-3xl text-emerald-300">
              {state.round2Wager.questions.filter(q => q.isScored).length} <span className="text-xs text-zinc-400">/ 8</span>
            </div>
            <span className="font-sans text-[11px] text-zinc-400 mt-1 block">Wager questions resolved</span>
          </div>
        </div>

        {/* View Switcher Tabs */}
        <div className="flex items-center gap-2 border-b-2 border-red-900/60 pb-1">
          <button
            onClick={() => setActiveTab('standings')}
            className={`font-pixel text-xs px-4 py-2 border shadow-pixel-sm flex items-center gap-2 transition-all ${
              activeTab === 'standings'
                ? 'bg-red-600 border-amber-400 text-white font-bold scale-105'
                : 'bg-[#220707] border-zinc-700 text-zinc-300 hover:border-zinc-500'
            }`}
          >
            <Trophy className="w-4 h-4 text-amber-300" />
            <span>STANDINGS & ADVANCEMENT</span>
          </button>

          <button
            onClick={() => setActiveTab('matrix')}
            className={`font-pixel text-xs px-4 py-2 border shadow-pixel-sm flex items-center gap-2 transition-all ${
              activeTab === 'matrix'
                ? 'bg-red-600 border-amber-400 text-white font-bold scale-105'
                : 'bg-[#220707] border-zinc-700 text-zinc-300 hover:border-zinc-500'
            }`}
          >
            <Flame className="w-4 h-4 text-amber-400" />
            <span>8-QUESTION WAGER MATRIX</span>
          </button>

          <button
            onClick={() => setActiveTab('questions')}
            className={`font-pixel text-xs px-4 py-2 border shadow-pixel-sm flex items-center gap-2 transition-all ${
              activeTab === 'questions'
                ? 'bg-red-600 border-amber-400 text-white font-bold scale-105'
                : 'bg-[#220707] border-zinc-700 text-zinc-300 hover:border-zinc-500'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-amber-300" />
            <span>QUESTION AUDIT ({questionsList.length})</span>
          </button>
        </div>

        {/* Search & Filter Controls */}
        <div className="bg-[#200707] border-2 border-zinc-700 p-4 shadow-pixel flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 bg-[#0c0303] border border-zinc-700 px-3 py-1.5 flex-1 max-w-md">
            <Search className="w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search team name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent border-none text-white text-xs focus:outline-none w-full font-mono"
            />
          </div>

          <div className="flex items-center gap-1.5 font-pixel text-xs">
            <span className="text-zinc-400 text-[10px] mr-1 hidden sm:inline">FILTER:</span>
            <button
              onClick={() => setFilterMode('all')}
              className={`px-3 py-1.5 border shadow-pixel-sm ${
                filterMode === 'all'
                  ? 'bg-amber-500 border-amber-300 text-black font-bold'
                  : 'bg-[#2a0b0b] border-zinc-700 text-zinc-300 hover:border-zinc-500'
              }`}
            >
              ALL ({totalQualified})
            </button>
            <button
              onClick={() => setFilterMode('finalists')}
              className={`px-3 py-1.5 border shadow-pixel-sm ${
                filterMode === 'finalists'
                  ? 'bg-purple-600 border-purple-400 text-white font-bold'
                  : 'bg-[#2a0b0b] border-zinc-700 text-zinc-300 hover:border-zinc-500'
              }`}
            >
              TOP 10 FINALISTS ({finalists.length})
            </button>
            <button
              onClick={() => setFilterMode('eliminated')}
              className={`px-3 py-1.5 border shadow-pixel-sm ${
                filterMode === 'eliminated'
                  ? 'bg-red-800 border-red-500 text-white font-bold'
                  : 'bg-[#2a0b0b] border-zinc-700 text-zinc-300 hover:border-zinc-500'
              }`}
            >
              ELIMINATED ({totalQualified - finalists.length})
            </button>
          </div>
        </div>

        {/* TAB 1: STANDINGS & ADVANCEMENT */}
        {activeTab === 'standings' && (
          <div className="bg-[#1f0606] border-2 border-red-600 shadow-pixel overflow-hidden">
            <div className="p-4 bg-[#180505] border-b-2 border-red-600 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-amber-400" />
                <h2 className="font-pixel text-sm text-white uppercase tracking-wider">
                  THE NETHER LEADERBOARD • REAL-TIME ADVANCEMENT
                </h2>
              </div>
              <span className="font-mono text-xs text-zinc-400">
                Auto-sorts by Round 2 score • Top 10 advance to The End
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#120303] border-b-2 border-zinc-700 font-pixel text-[10px] text-zinc-400 uppercase">
                    <th className="py-3 px-4 w-16">Rank</th>
                    <th className="py-3 px-4">Team Name</th>
                    <th className="py-3 px-4 text-center w-32">R2 Score</th>
                    <th className="py-3 px-4 text-center w-44">1-Time DOUBLE</th>
                    <th className="py-3 px-4 text-center w-44">Status</th>
                    <th className="py-3 px-4 text-right w-48">R3 Normalized Start</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/80 font-sans text-xs">
                  {filteredTeams.map((team) => {
                    const info = standingsMap.get(team.id);
                    const overallRank = info?.rank ?? 1;
                    const isTop10 = info?.isTop10 ?? false;
                    const isCutoff = overallRank === 10;
                    const score = team.round2Score ?? 0;
                    const doubleAt = info?.doubleAt;
                    const doubleRes = info?.doubleRes;
                    const startingScore = info?.startingScore ?? 0;

                    return (
                      <React.Fragment key={team.id}>
                        <tr
                          className={`transition-colors ${
                            isTop10
                              ? overallRank === 1
                                ? 'bg-[#310c0c]/90 hover:bg-[#3d1111]'
                                : 'bg-[#220707]/80 hover:bg-[#2b0a0a]'
                              : 'bg-[#150404]/60 opacity-65 hover:opacity-100 hover:bg-[#1e0707]'
                          }`}
                        >
                          {/* Rank Badge */}
                          <td className="py-3 px-4">
                            <span
                              className={`font-pixel text-xs w-7 h-7 flex items-center justify-center font-bold ${
                                overallRank === 1
                                  ? 'bg-amber-400 text-black shadow-pixel-sm'
                                  : overallRank <= 3
                                  ? 'bg-zinc-300 text-black shadow-pixel-sm'
                                  : isTop10
                                  ? 'bg-purple-700 text-white shadow-pixel-sm'
                                  : 'bg-zinc-800 text-zinc-400'
                              }`}
                            >
                              #{overallRank}
                            </span>
                          </td>

                          {/* Team Name */}
                          <td className="py-3 px-4 font-bold text-white text-sm">
                            {team.name}
                          </td>

                          {/* Score */}
                          <td className="py-3 px-4 text-center font-pixel text-base text-[#fef08a]">
                            {score} <span className="text-zinc-500 text-[10px]">PTS</span>
                          </td>

                          {/* Double status */}
                          <td className="py-3 px-4 text-center">
                            {doubleAt ? (
                              <span className={`inline-flex items-center gap-1 font-pixel text-[9px] px-2 py-0.5 border ${
                                doubleRes === 'CORRECT'
                                  ? 'bg-emerald-950 border-emerald-500 text-emerald-300'
                                  : doubleRes === 'WRONG'
                                  ? 'bg-red-950 border-red-500 text-red-300'
                                  : 'bg-amber-950 border-amber-500 text-amber-300'
                              }`}>
                                <Flame className="w-3 h-3 text-amber-400" />
                                <span>Used on Q{doubleAt}</span>
                                {doubleRes && <span>({doubleRes})</span>}
                              </span>
                            ) : team.blazeRodUsed ? (
                              <span className="font-pixel text-[9px] text-zinc-500">USED</span>
                            ) : (
                              <span className="font-pixel text-[9px] text-emerald-400">AVAILABLE</span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-3 px-4 text-center">
                            {isTop10 ? (
                              <span className="inline-flex items-center gap-1 font-pixel text-[9px] bg-purple-950 text-purple-300 border border-purple-500 px-2 py-0.5 shadow-pixel-sm">
                                <Sparkles className="w-3 h-3 text-purple-400" /> TOP 10 FINALIST
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 font-pixel text-[9px] bg-red-950/70 text-red-300 border border-red-800 px-2 py-0.5">
                                <XCircle className="w-3 h-3 text-red-400" /> ELIMINATED
                              </span>
                            )}
                          </td>

                          {/* Normalized R3 Score */}
                          <td className="py-3 px-4 text-right">
                            {isTop10 ? (
                              <div>
                                <span className="font-pixel text-sm text-[#fef08a] font-bold">
                                  {Number(startingScore).toFixed(2)}
                                </span>
                                <span className="font-mono text-[10px] text-purple-300 block">
                                  pts for Round 3
                                </span>
                              </div>
                            ) : (
                              <span className="font-mono text-[10px] text-zinc-500">
                                Eliminated
                              </span>
                            )}
                          </td>
                        </tr>

                        {/* Top 10 Divider line */}
                        {isCutoff && filterMode === 'all' && (
                          <tr>
                            <td colSpan={6} className="p-0 bg-transparent">
                              <div className="py-2.5 px-4 bg-gradient-to-r from-purple-950 via-pink-900/80 to-purple-950 border-y-2 border-purple-500 flex items-center justify-between">
                                <div className="flex items-center gap-2 font-pixel text-[10px] text-purple-200">
                                  <span>🐉 TOP 10 FINALIST ADVANCEMENT CUTOFF LINE 🐉</span>
                                </div>
                                <span className="font-mono text-[11px] text-purple-300">
                                  Only the Top 10 advance to Dimension III: The End
                                </span>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: FULL 8-QUESTION WAGER MATRIX */}
        {activeTab === 'matrix' && (
          <div className="bg-[#1f0606] border-2 border-red-600 shadow-pixel overflow-hidden">
            <div className="p-4 bg-[#180505] border-b-2 border-red-600 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-400" />
                <h2 className="font-pixel text-sm text-white uppercase tracking-wider">
                  ALL 8 QUESTIONS WAGER & SCORING MATRIX
                </h2>
              </div>
              <span className="font-mono text-xs text-zinc-400">
                Wager (100-400) • 2X DOUBLE Flag • Result & Delta
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#120303] border-b-2 border-zinc-700 font-pixel text-[10px] text-zinc-400 uppercase">
                    <th className="py-2.5 px-3 w-12 sticky left-0 bg-[#120303] z-10">#</th>
                    <th className="py-2.5 px-3 min-w-[160px] sticky left-12 bg-[#120303] z-10">Team</th>
                    {Array.from({ length: 8 }).map((_, i) => (
                      <th key={i} className="py-2.5 px-2 text-center min-w-[95px] border-l border-zinc-800">
                        Q{i + 1}
                      </th>
                    ))}
                    <th className="py-2.5 px-3 text-right font-pixel text-amber-400 min-w-[100px] border-l-2 border-amber-600">
                      Total R2
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/80 font-sans">
                  {filteredTeams.map((team) => {
                    const info = standingsMap.get(team.id);
                    const overallRank = info?.rank ?? 1;

                    return (
                      <tr key={team.id} className="hover:bg-[#2c0b0b] transition-colors">
                        {/* Rank */}
                        <td className="py-2.5 px-3 font-mono text-zinc-400 font-bold sticky left-0 bg-[#1a0505]">
                          {overallRank}
                        </td>

                        {/* Team Name */}
                        <td className="py-2.5 px-3 font-bold text-white truncate max-w-[180px] sticky left-12 bg-[#1a0505]">
                          {team.name}
                        </td>

                        {/* Questions 1 to 8 cells */}
                        {Array.from({ length: 8 }).map((_, qIdx) => {
                          const qRec = state.round2Wager.questions[qIdx];
                          const sub = qRec?.wagers?.[team.id];
                          const wagerVal = sub?.wager || 100;
                          const isDouble = Boolean(sub?.isDouble);
                          const isCorrect = sub?.isCorrect;
                          const delta = sub?.appliedDelta !== undefined
                            ? sub.appliedDelta
                            : (isCorrect === true ? (isDouble ? wagerVal * 2 : wagerVal) : isCorrect === false ? (isDouble ? -100 : -50) : 0);

                          return (
                            <td key={qIdx} className="py-2 px-1 text-center border-l border-zinc-800">
                              <div className="flex flex-col items-center justify-center">
                                <div className="flex items-center gap-1 font-mono text-[11px]">
                                  <span className="text-amber-400 font-bold">{wagerVal}</span>
                                  {isDouble && (
                                    <span className="bg-red-950 text-red-400 border border-red-600 px-1 py-0.2 text-[8px] font-pixel font-bold">
                                      2X
                                    </span>
                                  )}
                                </div>
                                <div className="mt-0.5">
                                  {isCorrect === true ? (
                                    <span className="font-pixel text-[9px] text-emerald-400 font-bold">
                                      +{delta > 0 ? delta : (isDouble ? wagerVal * 2 : wagerVal)}
                                    </span>
                                  ) : isCorrect === false ? (
                                    <span className="font-pixel text-[9px] text-red-400 font-bold">
                                      {delta < 0 ? delta : (isDouble ? -100 : -50)}
                                    </span>
                                  ) : (
                                    <span className="font-mono text-[9px] text-zinc-600">--</span>
                                  )}
                                </div>
                              </div>
                            </td>
                          );
                        })}

                        {/* Final Score */}
                        <td className="py-2.5 px-3 text-right font-pixel text-sm text-[#fef08a] border-l-2 border-amber-600 bg-[#250808]">
                          {team.round2Score ?? 0}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: QUESTION BY QUESTION AUDIT */}
        {activeTab === 'questions' && (
          <div className="space-y-4">
            {questionsList.map((q: any, idx: number) => {
              const qNumber = idx + 1;
              const qRecord = state.round2Wager.questions[idx];

              return (
                <div key={q.id || idx} className="bg-[#1f0606] border-2 border-red-600/80 p-5 shadow-pixel">
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-zinc-800 pb-3 mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="bg-red-700 text-white font-pixel text-[10px] px-2.5 py-1 uppercase font-bold shadow-pixel-sm">
                          QUESTION {qNumber} OF 8
                        </span>
                        {q.category && (
                          <span className="font-pixel text-xs text-amber-400">
                            {q.category}
                          </span>
                        )}
                        {qRecord?.isScored && (
                          <span className="bg-emerald-950 border border-emerald-500 text-emerald-300 font-pixel text-[9px] px-2 py-0.5">
                            SCORED
                          </span>
                        )}
                      </div>
                      <h3 className="font-sans font-bold text-base md:text-lg text-white mt-1">
                        {q.questionText}
                      </h3>
                    </div>

                    <div className="font-mono text-xs text-zinc-400">
                      ID: {q.id}
                    </div>
                  </div>

                  {q.codeSnippet && (
                    <div className="my-3 bg-[#0a0202] border border-zinc-700 p-3 font-mono text-xs text-emerald-400 overflow-x-auto whitespace-pre">
                      <code>{q.codeSnippet}</code>
                    </div>
                  )}

                  {/* Correct Solution Box */}
                  <div className="my-3 bg-gradient-to-r from-[#17381c] to-[#0d2212] border-2 border-emerald-500 p-3 flex items-center justify-between">
                    <div>
                      <span className="font-pixel text-[9px] text-emerald-300 uppercase block">CORRECT SOLUTION:</span>
                      <span className="font-sans font-black text-sm text-[#fef08a]">{q.correctAnswer}</span>
                    </div>
                  </div>

                  {/* Team Breakdown for this Question */}
                  <div className="mt-3">
                    <span className="font-pixel text-[10px] text-zinc-400 uppercase block mb-2">
                      PARTICIPATING TEAMS WAGERS & RESULTS:
                    </span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-2 text-xs">
                      {sortedTeams.map((team) => {
                        const sub = qRecord?.wagers?.[team.id];
                        const wagerVal = sub?.wager || 100;
                        const isDouble = Boolean(sub?.isDouble);
                        const isCorrect = sub?.isCorrect;
                        const delta = isCorrect === true ? (isDouble ? wagerVal * 2 : wagerVal) : isCorrect === false ? (isDouble ? -100 : -50) : 0;

                        return (
                          <div
                            key={team.id}
                            className={`p-2 border transition-all ${
                              isCorrect === true
                                ? 'bg-[#0f2413] border-emerald-600'
                                : isCorrect === false
                                ? 'bg-[#290d0d] border-red-700'
                                : 'bg-[#18181b] border-zinc-700'
                            }`}
                          >
                            <div className="font-bold text-white truncate text-[11px]">{team.name}</div>
                            <div className="flex items-center justify-between font-mono text-[10px] mt-1">
                              <span className="text-amber-400 font-bold">{wagerVal} pts</span>
                              {isDouble && <span className="text-red-400 font-pixel text-[8px]">2X</span>}
                              {isCorrect === true ? (
                                <span className="text-emerald-400 font-bold">+{delta}</span>
                              ) : isCorrect === false ? (
                                <span className="text-red-400 font-bold">{delta}</span>
                              ) : (
                                <span className="text-zinc-500">Pending</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Footer info */}
        <div className="bg-[#180505] border-t border-red-900 p-4 text-center font-mono text-xs text-zinc-400">
          CRAFT.exe • Official Round 2 Wager Results Audit • Real-Time Engine Active
        </div>
      </main>
    </div>
  );
};
