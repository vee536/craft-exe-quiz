import React, { useState, useEffect, useMemo } from 'react';
import { useEvent } from '../../context/EventContext';
import { fetchRoundSummary, fetchQuestionResults, deleteRoundData } from '../../services/api';
import { exportRound1ToCsv } from '../../utils/csvDownload';
import {
  TreePine,
  CheckCircle,
  XCircle,
  Search,
  RefreshCw,
  Download,
  ArrowLeft,
  Database,
  Award,
  Filter,
  Layers,
  Flame,
  Monitor,
  Sliders,
  ExternalLink,
  Trash2,
  Radio
} from 'lucide-react';

export const Round1ResultsPage: React.FC = () => {
  const { state } = useEvent();
  const [dbData, setDbData] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'all' | 'qualified' | 'eliminated'>('all');
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const loadCloudData = async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const summary = await fetchRoundSummary('ROUND_1');
      if (summary) {
        setDbData(summary);
      }
      setLastRefreshed(new Date());
    } catch (e) {
      console.warn('Error loading Round 1 cloud data:', e);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  // Poll Firestore every 3 seconds for remote sync
  useEffect(() => {
    loadCloudData(true);
    const interval = setInterval(() => {
      loadCloudData(true);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // ─── UNIFIED REAL-TIME DATA COMPUTATION ────────────────────────────────────
  const { sortedTeams, totalTeams, qualifiedTeams, eliminatedTeams, highestScore, cutoffScore } = useMemo(() => {
    const stateHasScores = state.teams.some(t => (t.round1Score ?? 0) > 0);
    const dbTeams: any[] = dbData?.teams || [];
    const dbHasScores = dbTeams.some((t: any) => (t.round1Score ?? 0) > 0);

    let effectiveTeams: any[] = state.teams;
    if (!stateHasScores && dbHasScores && dbTeams.length > 0) {
      effectiveTeams = dbTeams.map((dt: any) => {
        const local = state.teams.find(t => t.id === dt.id);
        return {
          id: dt.id,
          name: dt.name || local?.name || dt.id,
          round1Score: dt.round1Score ?? 0,
          isQualifiedR2: Boolean(dt.isQualifiedR2),
        };
      });
    }

    const sorted = [...effectiveTeams].sort((a, b) => (b.round1Score ?? 0) - (a.round1Score ?? 0));
    const qual = sorted.filter((t, idx) => t.isQualifiedR2 || idx < 20);
    const elim = sorted.filter((t, idx) => !t.isQualifiedR2 && idx >= 20);
    const high = sorted[0]?.round1Score ?? 0;
    const cutoff = sorted[19]?.round1Score ?? (sorted[sorted.length - 1]?.round1Score ?? 0);

    return {
      sortedTeams: sorted,
      totalTeams: sorted.length,
      qualifiedTeams: qual,
      eliminatedTeams: elim,
      highestScore: high,
      cutoffScore: cutoff,
    };
  }, [state.teams, dbData]);

  const filteredTeams = sortedTeams.filter((team, idx) => {
    const overallRank = sortedTeams.findIndex(t => t.id === team.id) + 1;
    const isQual = team.isQualifiedR2 || overallRank <= 20;
    const matchesSearch = team.name.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filterMode === 'qualified') return isQual;
    if (filterMode === 'eliminated') return !isQual;
    return true;
  });

  const handleDeleteRound1Data = async () => {
    if (!confirm('Are you sure you want to delete Round 1 data from Firestore and exports folder?')) {
      return;
    }
    setLoading(true);
    const ok = await deleteRoundData('ROUND_1');
    if (ok) {
      setDbData(null);
      setActionMessage('Round 1 data deleted from Firestore and exports.');
      setTimeout(() => setActionMessage(null), 4000);
    } else {
      alert('Failed to delete Round 1 data. Please check server connection.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0d120e] text-white flex flex-col font-sans selection:bg-emerald-500 selection:text-black">
      {/* Top Navbar */}
      <header className="bg-[#121b14] border-b-4 border-[#22c55e] px-4 md:px-8 py-3.5 flex flex-wrap items-center justify-between gap-3 shadow-pixel">
        <div className="flex items-center gap-3">
          <a
            href="#/"
            className="flex items-center gap-1.5 text-zinc-400 hover:text-white font-pixel text-xs px-2.5 py-1.5 border border-zinc-700 bg-[#18231a] shadow-pixel-sm transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>PORTAL</span>
          </a>
          <span className="text-zinc-600">|</span>
          <div className="flex items-center gap-2">
            <TreePine className="w-5 h-5 text-emerald-400 animate-pulse" />
            <h1 className="font-pixel text-sm md:text-base text-[#fef08a] uppercase tracking-wider">
              ROUND 1: THE OVERWORLD <span className="text-emerald-400 text-xs">• PEN & PAPER RESULTS</span>
            </h1>
          </div>
        </div>

        {/* Links & Quick Actions */}
        <div className="flex items-center gap-2">
          {/* Link to Round 2 Results */}
          <a
            href="#/round2-results"
            className="bg-[#271010] hover:bg-[#381616] border border-red-500 text-red-300 font-pixel text-[11px] px-3 py-1.5 flex items-center gap-1.5 shadow-pixel-sm transition-all"
          >
            <Flame className="w-3.5 h-3.5 text-red-400" />
            <span>VIEW ROUND 2 RESULTS</span>
          </a>

          {/* Admin link */}
          <a
            href="#/admin"
            className="bg-[#1c281e] hover:bg-[#253629] border border-zinc-700 text-zinc-300 font-pixel text-[11px] px-2.5 py-1.5 flex items-center gap-1.5 shadow-pixel-sm transition-all"
          >
            <Sliders className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">ADMIN</span>
          </a>

          {/* Refresh button */}
          <button
            onClick={async () => {
              await loadCloudData(false);
              setActionMessage('Results refreshed from Firebase collection: round_1_results');
              setTimeout(() => setActionMessage(null), 4000);
            }}
            disabled={loading}
            className="bg-[#1c281e] hover:bg-[#253629] border border-emerald-500 text-emerald-300 font-pixel text-[11px] px-3 py-1.5 font-bold flex items-center gap-1.5 shadow-pixel-sm transition-all cursor-pointer"
            title="Refresh results from Firebase"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>REFRESH</span>
          </button>

          {/* Export CSV button */}
          <button
            onClick={() => exportRound1ToCsv(sortedTeams)}
            className="bg-emerald-500 hover:bg-emerald-400 text-black font-pixel text-[11px] px-3.5 py-1.5 font-bold flex items-center gap-1.5 shadow-pixel-sm transition-all cursor-pointer"
            title="Download clean Excel-ready CSV spreadsheet"
          >
            <Download className="w-3.5 h-3.5" />
            <span>EXPORT CSV</span>
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 space-y-6">
        {/* Live Auto-Sync Status Bar */}
        <div className="bg-[#142016] border-2 border-emerald-600/70 p-4 shadow-pixel flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <Radio className="w-4 h-4 text-emerald-400" />
            <div className="font-mono text-xs">
              <span className="text-zinc-400">SYNC MODE: </span>
              <strong className="text-emerald-300 font-bold">
                LIVE REAL-TIME REACTIVE AUTO-SORTING (ACTIVE)
              </strong>
              <span className="text-zinc-500 ml-2 text-[11px]">
                • Changes in Admin reflect instantly without refresh
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={async () => {
                await loadCloudData(false);
                setActionMessage('Results refreshed from Firebase collection: round_1_results');
                setTimeout(() => setActionMessage(null), 4000);
              }}
              disabled={loading}
              className="bg-emerald-500 hover:bg-emerald-400 text-black font-pixel text-xs px-4 py-2 font-bold flex items-center gap-2 shadow-pixel transition-all cursor-pointer"
              title="Click to refresh results directly from Firebase collection: round_1_results"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>{loading ? 'FETCHING FIREBASE...' : 'REFRESH RESULTS'}</span>
            </button>

            <button
              onClick={handleDeleteRound1Data}
              disabled={loading}
              className="bg-red-950/80 hover:bg-red-900 border border-red-600 text-red-300 font-pixel text-xs px-3 py-1.5 flex items-center gap-1.5 shadow-pixel-sm transition-all"
              title="Delete Round 1 data from Firestore and exports"
            >
              <Trash2 className="w-3.5 h-3.5 text-red-400" />
              <span>CLEAR R1 CLOUD DATA</span>
            </button>
          </div>
        </div>

        {actionMessage && (
          <div className="p-3 bg-red-950/90 border-2 border-red-500 text-red-200 font-pixel text-xs flex items-center justify-between shadow-pixel animate-pulse">
            <span>⚠️ {actionMessage}</span>
            <button onClick={() => setActionMessage(null)} className="text-zinc-400 hover:text-white font-mono text-sm px-2">×</button>
          </div>
        )}

        {/* Highlight Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="bg-[#142016] border-2 border-emerald-600 p-4 shadow-pixel">
            <span className="font-pixel text-[10px] text-zinc-400 uppercase block mb-1">TOTAL CONTESTANTS</span>
            <div className="font-pixel text-3xl text-white">{totalTeams} <span className="text-xs text-zinc-400">TEAMS</span></div>
            <span className="font-sans text-[11px] text-zinc-400 mt-1 block">Paper & pen test (15 Qs)</span>
          </div>

          <div className="bg-[#142016] border-2 border-[#22c55e] p-4 shadow-pixel">
            <span className="font-pixel text-[10px] text-emerald-400 uppercase block mb-1">ADVANCING QUALIFIERS</span>
            <div className="font-pixel text-3xl text-[#4ade80]">{qualifiedTeams.length} <span className="text-xs text-emerald-300">/ 20</span></div>
            <span className="font-sans text-[11px] text-emerald-400 mt-1 block">Qualified for Round 2 🔥</span>
          </div>

          <div className="bg-[#142016] border-2 border-amber-500/80 p-4 shadow-pixel">
            <span className="font-pixel text-[10px] text-amber-400 uppercase block mb-1">HIGHEST SCORE</span>
            <div className="font-pixel text-3xl text-[#fef08a]">{highestScore} <span className="text-xs text-zinc-400">/ 15</span></div>
            <span className="font-sans text-[11px] text-zinc-400 mt-1 block">Top paper score</span>
          </div>

          <div className="bg-[#142016] border-2 border-purple-500/80 p-4 shadow-pixel">
            <span className="font-pixel text-[10px] text-purple-300 uppercase block mb-1">QUALIFYING CUTOFF</span>
            <div className="font-pixel text-3xl text-purple-200">{cutoffScore} <span className="text-xs text-zinc-400">MARKS</span></div>
            <span className="font-sans text-[11px] text-zinc-400 mt-1 block">20th place threshold</span>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-[#142016] border-2 border-zinc-700 p-4 shadow-pixel flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 bg-[#090d0a] border border-zinc-700 px-3 py-1.5 flex-1 max-w-md">
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
                  ? 'bg-emerald-600 border-emerald-400 text-black font-bold'
                  : 'bg-[#18231a] border-zinc-700 text-zinc-300 hover:border-zinc-500'
              }`}
            >
              ALL ({totalTeams})
            </button>
            <button
              onClick={() => setFilterMode('qualified')}
              className={`px-3 py-1.5 border shadow-pixel-sm ${
                filterMode === 'qualified'
                  ? 'bg-emerald-600 border-emerald-400 text-black font-bold'
                  : 'bg-[#18231a] border-zinc-700 text-zinc-300 hover:border-zinc-500'
              }`}
            >
              TOP 20 QUALIFIED ({qualifiedTeams.length})
            </button>
            <button
              onClick={() => setFilterMode('eliminated')}
              className={`px-3 py-1.5 border shadow-pixel-sm ${
                filterMode === 'eliminated'
                  ? 'bg-red-800 border-red-500 text-white font-bold'
                  : 'bg-[#18231a] border-zinc-700 text-zinc-300 hover:border-zinc-500'
              }`}
            >
              ELIMINATED ({eliminatedTeams.length})
            </button>
          </div>
        </div>

        {/* RESULTS LEADERBOARD TABLE */}
        <div className="bg-[#142016] border-2 border-emerald-700/80 shadow-pixel overflow-hidden">
          <div className="p-4 bg-[#101912] border-b-2 border-emerald-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <h2 className="font-pixel text-sm text-white uppercase tracking-wider">
                OVERWORLD STANDINGS & CUTOFF MATRIX
              </h2>
            </div>
            <span className="font-mono text-xs text-zinc-400">
              Auto-sorts by score • Top 20 advance to The Nether
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#0b100c] border-b-2 border-zinc-700 font-pixel text-[10px] text-zinc-400 uppercase">
                  <th className="py-3 px-4 w-16">Rank</th>
                  <th className="py-3 px-4">Team Name</th>
                  <th className="py-3 px-4 text-center w-36">R1 Score (0-15)</th>
                  <th className="py-3 px-4 text-center w-48">Score Bar</th>
                  <th className="py-3 px-4 text-center w-44">Status</th>
                  <th className="py-3 px-4 text-right w-44">Round 2 Advancement</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/80 font-sans text-xs">
                {filteredTeams.map((team) => {
                  const overallRank = sortedTeams.findIndex(t => t.id === team.id) + 1;
                  const isTop20 = team.isQualifiedR2 || overallRank <= 20;
                  const score = team.round1Score ?? 0;
                  const scorePct = Math.round((score / 15) * 100);
                  const isCutoffItem = overallRank === 20;

                  return (
                    <React.Fragment key={team.id}>
                      <tr
                        className={`transition-colors ${
                          isTop20
                            ? overallRank === 1
                              ? 'bg-[#1b2b1e]/90 hover:bg-[#203324]'
                              : 'bg-[#142016]/80 hover:bg-[#1a291d]'
                            : 'bg-[#101411]/60 opacity-60 hover:opacity-100 hover:bg-[#161c17]'
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
                                : isTop20
                                ? 'bg-emerald-600 text-white'
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
                        <td className="py-3 px-4 text-center font-pixel text-sm text-[#fef08a]">
                          {score} <span className="text-zinc-500 text-[10px]">/ 15</span>
                        </td>

                        {/* Progress Bar */}
                        <td className="py-3 px-4 text-center">
                          <div className="w-full bg-[#0a0d0a] h-3 border border-zinc-700 overflow-hidden">
                            <div
                              className={`h-full transition-all ${
                                isTop20 ? 'bg-emerald-400' : 'bg-zinc-600'
                              }`}
                              style={{ width: `${scorePct}%` }}
                            />
                          </div>
                        </td>

                        {/* Status */}
                        <td className="py-3 px-4 text-center">
                          {isTop20 ? (
                            <span className="inline-flex items-center gap-1 font-pixel text-[9px] bg-emerald-950 text-emerald-300 border border-emerald-600 px-2 py-0.5 shadow-pixel-sm">
                              <CheckCircle className="w-3 h-3 text-emerald-400" /> QUALIFIED
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 font-pixel text-[9px] bg-red-950/70 text-red-300 border border-red-800 px-2 py-0.5">
                              <XCircle className="w-3 h-3 text-red-400" /> ELIMINATED
                            </span>
                          )}
                        </td>

                        {/* Round 2 Action */}
                        <td className="py-3 px-4 text-right">
                          {isTop20 ? (
                            <span className="font-pixel text-[10px] text-amber-400">
                              Advances to The Nether 🔥
                            </span>
                          ) : (
                            <span className="font-mono text-[10px] text-zinc-500">
                              Did not make cutoff
                            </span>
                          )}
                        </td>
                      </tr>

                      {/* Visual Cutoff divider line after 20th rank */}
                      {isCutoffItem && filterMode === 'all' && (
                        <tr>
                          <td colSpan={6} className="p-0 bg-transparent">
                            <div className="py-2.5 px-4 bg-gradient-to-r from-red-900/60 via-purple-900/80 to-red-900/60 border-y-2 border-purple-500 flex items-center justify-between">
                              <div className="flex items-center gap-2 font-pixel text-[10px] text-purple-200">
                                <span>⚔️ TOP 20 ADVANCEMENT CUTOFF LINE ({cutoffScore} MARKS) ⚔️</span>
                              </div>
                              <span className="font-mono text-[11px] text-purple-300">
                                Teams above qualify for Round 2 Wager Round
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

        {/* Footer info */}
        <div className="bg-[#121b14] border-t border-emerald-900 p-4 text-center font-mono text-xs text-zinc-400">
          CRAFT.exe • Official Round 1 Results Audit • Real-Time Engine Active
        </div>
      </main>
    </div>
  );
};
