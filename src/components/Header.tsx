import React from 'react';
import { Mic, Radio, Terminal, Sparkles, CheckCircle2, AlertTriangle } from 'lucide-react';
import { ServerStatus } from '../types/agent';

interface HeaderProps {
  status: ServerStatus | null;
  activeTab: 'forge' | 'editor' | 'test' | 'history';
  onTabChange: (tab: 'forge' | 'editor' | 'test' | 'history') => void;
  onOpenLocalModal: () => void;
  hasActiveAgent: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  status,
  activeTab,
  onTabChange,
  onOpenLocalModal,
  hasActiveAgent,
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-fuchsia-500 p-0.5 shadow-lg shadow-indigo-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Radio className="w-5 h-5 text-cyan-400 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg text-white tracking-tight">VoiceForge</span>
                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 text-cyan-300 border border-cyan-500/30">
                  AI MVP
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">No-Code ElevenLabs Conversational Voice Builder</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center space-x-1 sm:space-x-2 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => onTabChange('forge')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'forge'
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>1. Prompt Forge</span>
              </span>
            </button>

            <button
              onClick={() => onTabChange('editor')}
              disabled={!hasActiveAgent && activeTab === 'forge'}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'editor'
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-sm'
                  : hasActiveAgent
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  : 'text-slate-600 cursor-not-allowed opacity-60'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <span>2. Config Editor</span>
              </span>
            </button>

            <button
              onClick={() => onTabChange('test')}
              disabled={!hasActiveAgent && activeTab === 'forge'}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'test'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm'
                  : hasActiveAgent
                  ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  : 'text-slate-600 cursor-not-allowed opacity-60'
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Mic className="w-4 h-4 text-emerald-400" />
                <span>3. Live Voice Test</span>
              </span>
            </button>

            <button
              onClick={() => onTabChange('history')}
              className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                activeTab === 'history'
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <span>History</span>
            </button>
          </nav>

          {/* Right Status Badges & Local Guide */}
          <div className="flex items-center gap-2">
            {/* Status pills */}
            <div className="hidden md:flex items-center gap-2 text-xs">
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border ${
                  status?.gemini_configured
                    ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                    : 'bg-amber-950/40 border-amber-800/60 text-amber-300'
                }`}
                title={status?.gemini_configured ? 'Gemini 3.8 Flash configured' : 'GEMINI_API_KEY required for AI agent generation'}
              >
                {status?.gemini_configured ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span>Gemini AI</span>
              </div>

              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md border ${
                  status?.elevenlabs_configured
                    ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-300'
                    : 'bg-amber-950/40 border-amber-800/60 text-amber-300'
                }`}
                title={
                  status?.elevenlabs_configured
                    ? 'ElevenLabs API connected'
                    : 'ELEVENLABS_API_KEY missing on server (needed for real agent deployment & live voice calls)'
                }
              >
                {status?.elevenlabs_configured ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                )}
                <span>ElevenLabs</span>
              </div>
            </div>

            <button
              onClick={onOpenLocalModal}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
              title="How to run locally and architecture details"
            >
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden sm:inline">Run Locally</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
