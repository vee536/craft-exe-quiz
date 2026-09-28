import React, { useState } from 'react';
import { useEvent } from '../../../context/EventContext';
import {
  Download,
  Upload,
  RotateCcw,
  Volume2,
  VolumeX,
  Monitor,
  CheckCircle,
  AlertTriangle,
  Play
} from 'lucide-react';

export const SettingsTab: React.FC = () => {
  const {
    state,
    exportData,
    importData,
    resetToDefault,
    playSound,
    toggleMute,
    setVolume
  } = useEvent();

  const [importJsonText, setImportJsonText] = useState('');
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleDownloadBackup = () => {
    const jsonStr = exportData();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `craft-exe-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const success = importData(content);
        if (success) {
          setImportStatus('Event data imported successfully!');
        } else {
          setImportStatus('Failed to parse JSON file. Please verify format.');
        }
      }
    };
    reader.readAsText(file);
  };

  const handlePasteImport = () => {
    if (!importJsonText.trim()) return;
    const success = importData(importJsonText.trim());
    if (success) {
      setImportStatus('Event data imported successfully!');
      setImportJsonText('');
    } else {
      setImportStatus('Failed to parse JSON string. Invalid format.');
    }
  };

  const handleLaunchProjector = () => {
    window.open('/#/projector', '_blank', 'width=1280,height=720,menubar=no,toolbar=no');
  };

  return (
    <div className="space-y-6">
      {/* PROJECTOR & DUAL DISPLAY INSTRUCTIONS */}
      <div className="bg-[#18181b] border-2 border-emerald-500/80 p-6 shadow-pixel">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#3f3f46] pb-4 mb-4">
          <div className="flex items-center gap-3">
            <Monitor className="w-6 h-6 text-emerald-400" />
            <div>
              <h2 className="font-pixel text-base md:text-lg text-white uppercase">
                PROJECTOR & DUAL-SCREEN SETUP
              </h2>
              <p className="font-sans text-xs text-zinc-400 mt-0.5">
                Operate on your laptop while projecting to the audience.
              </p>
            </div>
          </div>

          <button
            onClick={handleLaunchProjector}
            className="bg-emerald-600 hover:bg-emerald-500 text-black font-pixel text-xs px-5 py-2.5 font-bold shadow-pixel-sm flex items-center gap-2"
          >
            <Monitor className="w-4 h-4" />
            LAUNCH PROJECTOR WINDOW
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-sans text-xs text-zinc-300">
          <div className="bg-[#111215] p-3 border border-zinc-700">
            <strong className="text-emerald-400 font-pixel text-[10px] block mb-1">
              1. OPEN PROJECTOR VIEW
            </strong>
            Click the button above to launch the clean audience-facing display in a dedicated window.
          </div>
          <div className="bg-[#111215] p-3 border border-zinc-700">
            <strong className="text-emerald-400 font-pixel text-[10px] block mb-1">
              2. DRAG TO PROJECTOR SCREEN
            </strong>
            Drag that window to your connected HDMI/wireless projector or secondary monitor.
          </div>
          <div className="bg-[#111215] p-3 border border-zinc-700">
            <strong className="text-emerald-400 font-pixel text-[10px] block mb-1">
              3. PRESS F11 FOR FULLSCREEN
            </strong>
            Press <kbd className="bg-zinc-800 px-1 border border-zinc-600">F11</kbd> on the projector window for a true borderless 16:9 presentation!
          </div>
        </div>
      </div>

      {/* AUDIO SOUNDBOARD & VOLUME */}
      <div className="bg-[#18181b] border-2 border-[#3f3f46] p-6 shadow-pixel">
        <h2 className="font-pixel text-base text-white uppercase mb-1">
          SOUND EFFECTS & SYNTHESIS
        </h2>
        <p className="font-sans text-xs text-zinc-400 mb-4">
          CRAFT.exe features an offline Web Audio synthesizer simulating Minecraft-style sound cues.
        </p>

        <div className="flex flex-wrap items-center gap-6 mb-6 p-4 bg-[#111215] border border-zinc-700">
          {/* Mute Toggle */}
          <button
            onClick={toggleMute}
            className={`font-pixel text-xs px-4 py-2 border shadow-pixel-sm flex items-center gap-2 ${
              state.soundMuted
                ? 'bg-red-950 border-red-600 text-red-300'
                : 'bg-zinc-800 border-zinc-600 text-zinc-200 hover:bg-zinc-700'
            }`}
          >
            {state.soundMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
            {state.soundMuted ? 'SOUND MUTED' : 'SOUND ACTIVE'}
          </button>

          {/* Volume Slider */}
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-zinc-400">Master Volume:</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={state.soundVolume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="accent-amber-400 w-32 cursor-pointer"
            />
            <span className="font-mono text-xs text-amber-400 font-bold">
              {Math.round(state.soundVolume * 100)}%
            </span>
          </div>
        </div>

        {/* Sound Test Buttons */}
        <div className="space-y-2">
          <label className="font-pixel text-[10px] text-zinc-400 uppercase">
            Test Sound Effects:
          </label>
          <div className="flex flex-wrap gap-2">
            {[
              { type: 'correct', label: 'XP Chime / Correct', color: 'bg-emerald-950 text-emerald-300 border-emerald-700' },
              { type: 'incorrect', label: 'Hurt Buzzer / Wrong', color: 'bg-red-950 text-red-300 border-red-700' },
              { type: 'steal', label: 'Buzzer Steal Alert', color: 'bg-amber-950 text-amber-300 border-amber-700' },
              { type: 'blaze', label: 'Blaze Fire Whoosh', color: 'bg-orange-950 text-orange-300 border-orange-700' },
              { type: 'dragon', label: 'Ender Dragon Roar', color: 'bg-purple-950 text-purple-300 border-purple-700' },
              { type: 'victory', label: 'Victory Fanfare', color: 'bg-yellow-950 text-yellow-300 border-yellow-700' },
              { type: 'tick', label: 'Countdown Tick', color: 'bg-zinc-900 text-zinc-300 border-zinc-700' },
            ].map(s => (
              <button
                key={s.type}
                onClick={() => playSound(s.type as any)}
                className={`font-pixel text-[9px] px-3 py-1.5 border shadow-pixel-sm flex items-center gap-1.5 hover:scale-105 transition-transform ${s.color}`}
              >
                <Play className="w-3 h-3" />
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* BACKUP, EXPORT & IMPORT */}
      <div className="bg-[#18181b] border-2 border-[#3f3f46] p-6 shadow-pixel">
        <h2 className="font-pixel text-base text-white uppercase mb-1">
          EVENT DATA BACKUP & LOCAL PERSISTENCE
        </h2>
        <p className="font-sans text-xs text-zinc-400 mb-4">
          All changes are automatically saved to local browser storage. You can also export the full event configuration to a JSON file.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Export Box */}
          <div className="bg-[#111215] border border-zinc-700 p-4 flex flex-col justify-between">
            <div>
              <div className="font-pixel text-xs text-amber-400 uppercase mb-2 flex items-center gap-2">
                <Download className="w-4 h-4" /> Export Backup
              </div>
              <p className="font-sans text-xs text-zinc-400 mb-4">
                Downloads a <code className="text-zinc-200">.json</code> file with all teams, scores, 5 question banks, and board assignments.
              </p>
            </div>
            <button
              onClick={handleDownloadBackup}
              className="w-full bg-amber-500 hover:bg-amber-400 text-black font-pixel text-xs py-2.5 font-bold shadow-pixel-sm flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              DOWNLOAD EVENT JSON
            </button>
          </div>

          {/* Import Box */}
          <div className="bg-[#111215] border border-zinc-700 p-4 flex flex-col justify-between">
            <div>
              <div className="font-pixel text-xs text-cyan-400 uppercase mb-2 flex items-center gap-2">
                <Upload className="w-4 h-4" /> Import Backup
              </div>
              <p className="font-sans text-xs text-zinc-400 mb-3">
                Load a previously exported JSON backup file or paste the JSON text below.
              </p>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="w-full font-mono text-xs text-zinc-400 file:bg-zinc-800 file:text-white file:border-0 file:px-3 file:py-1 file:font-pixel file:text-[10px] file:mr-2 cursor-pointer mb-2"
              />
            </div>

            {importStatus && (
              <div className="p-2 bg-zinc-900 border border-zinc-700 font-mono text-xs text-amber-300 mt-2">
                {importStatus}
              </div>
            )}
          </div>
        </div>

        {/* Paste JSON Raw Text */}
        <div className="mt-4 p-4 bg-[#111215] border border-zinc-800">
          <label className="font-pixel text-[10px] text-zinc-400 uppercase block mb-1">
            Or Paste JSON String Directly:
          </label>
          <textarea
            rows={3}
            placeholder="Paste exported event JSON here..."
            value={importJsonText}
            onChange={(e) => setImportJsonText(e.target.value)}
            className="w-full bg-[#18181b] border border-zinc-700 p-2 text-zinc-300 font-mono text-xs focus:border-amber-400 focus:outline-none"
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={handlePasteImport}
              className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 font-pixel text-xs px-4 py-1.5 border border-zinc-600"
            >
              Load Pasted JSON
            </button>
          </div>
        </div>

        {/* Reset to Clean Defaults */}
        <div className="mt-6 pt-4 border-t border-red-950 flex items-center justify-between">
          <div>
            <div className="font-pixel text-xs text-red-400 uppercase flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" /> Reset Application State
            </div>
            <p className="font-sans text-xs text-zinc-500">
              Restores initial demo teams, questions and clears live event state.
            </p>
          </div>

          <button
            onClick={() => {
              if (confirm('Are you sure you want to reset all data back to clean demo defaults? Current changes will be replaced.')) {
                resetToDefault();
              }
            }}
            className="bg-red-950 hover:bg-red-900 text-red-300 font-pixel text-xs px-4 py-2 border border-red-800 shadow-pixel-sm flex items-center gap-2"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            RESET TO DEFAULTS
          </button>
        </div>
      </div>
    </div>
  );
};
