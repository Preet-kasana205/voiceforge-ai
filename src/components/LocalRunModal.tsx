import React, { useState } from 'react';
import { X, Terminal, Copy, CheckCircle2, ShieldCheck, Cpu, Radio, Sparkles } from 'lucide-react';

interface LocalRunModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LocalRunModal: React.FC<LocalRunModalProps> = ({ isOpen, onClose }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const envSample = `# Gemini API Key for AI prompt synthesis & voice configuration
GEMINI_API_KEY="your-gemini-api-key"

# ElevenLabs API Key for real agent deployment & live WebSocket voice conversations
ELEVENLABS_API_KEY="your-elevenlabs-api-key"

# App Port (default 3000)
PORT=3000`;

  const runCommands = `# 1. Install dependencies
npm install

# 2. Configure .env file
cp .env.example .env
# Edit .env with your GEMINI_API_KEY and ELEVENLABS_API_KEY

# 3. Start development server (Full-stack Express + Vite)
npm run dev

# 4. Open in browser
# http://localhost:3000`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">VoiceForge AI Architecture & Local Run Guide</h2>
              <p className="text-xs text-slate-400">Hackathon MVP Architecture & Quickstart</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Architecture Summary */}
        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-cyan-400" />
            <span>Architecture Breakdown</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                <Sparkles className="w-3.5 h-3.5" />
                <span>1. Prompt Forge (Gemini AI)</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Server-side <code className="text-slate-300">@google/genai</code> uses <code className="text-slate-300">gemini-3.8-flash</code> with JSON schemas to generate conversational prompts without markdown formatting that sounds awkward when spoken aloud.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                <Radio className="w-3.5 h-3.5" />
                <span>2. ElevenLabs Conversational AI</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Server issues REST calls to <code className="text-slate-300">/v1/convai/agents/create</code> and exchanges signed WebSocket tokens, keeping API secrets strictly on the server.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 text-indigo-400 font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>3. Live Audio Sandbox</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Browser uses <code className="text-slate-300">@elevenlabs/client</code> for bi-directional WebRTC/WebSocket audio streaming with turn-taking and live transcription.
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
              <div className="flex items-center gap-1.5 text-amber-400 font-semibold">
                <Terminal className="w-3.5 h-3.5" />
                <span>4. Persistent History</span>
              </div>
              <p className="text-slate-400 text-[11px]">
                Test recordings, durations, star ratings, and transcripts are saved to local persistent storage for review and prompt refinement.
              </p>
            </div>
          </div>
        </div>

        {/* Local Run Commands */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Local Run Commands
            </h3>
            <button
              onClick={() => handleCopy(runCommands, 'commands')}
              className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition"
            >
              {copiedSection === 'commands' ? (
                <>
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed">
            {runCommands}
          </pre>
        </div>

        {/* Environment File Setup */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              Environment Variables (.env)
            </h3>
            <button
              onClick={() => handleCopy(envSample, 'env')}
              className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition"
            >
              {copiedSection === 'env' ? (
                <>
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono text-emerald-400 overflow-x-auto leading-relaxed">
            {envSample}
          </pre>
        </div>

        {/* Close Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};
