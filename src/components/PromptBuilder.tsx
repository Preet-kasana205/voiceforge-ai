import React, { useState } from 'react';
import { Sparkles, Wand2, Loader2, MessageSquare, ShieldAlert, SlidersHorizontal, ChevronDown, ChevronUp } from 'lucide-react';
import { AgentConfig, GenerateAgentRequest } from '../types/agent';
import { generateAgentConfig } from '../services/api';

interface PromptBuilderProps {
  onAgentGenerated: (agent: AgentConfig) => void;
  isConfiguring: boolean;
  setIsConfiguring: (val: boolean) => void;
  geminiConfigured: boolean;
}

const TEMPLATES = [
  {
    title: 'Dental Clinic Receptionist',
    role: 'Medical Office Receptionist',
    prompt: 'A warm, friendly dental office assistant for Dr. Miller Smile Clinic that books cleaning checkups, answers dental insurance questions, and handles patient reschedule requests with empathy.',
    style: 'Warm, reassuring, professional',
    voice: 'Rachel (Calm female)',
  },
  {
    title: 'B2B SaaS Inbound SDR',
    role: 'Sales Development Representative',
    prompt: 'An upbeat, consultative inbound sales rep for CloudFlow, an automated devops platform. Qualifies leads based on company size and cloud spend, answers pricing questions, and books a 15-minute demo with an account executive.',
    style: 'Consultative, energetic, concise',
    voice: 'Jessica (Engaging female)',
  },
  {
    title: 'Airline Disruption Concierge',
    role: 'Customer Care Specialist',
    prompt: 'A calm, ultra-competent flight assistance agent for SkyWings Airlines. Handles cancelled flights, offers rebooking alternatives, baggage claim information, and hotel meal vouchers during delays.',
    style: 'Reassuring, clear, patient',
    voice: 'George (Reassuring male)',
  },
  {
    title: 'Boutique Hotel Concierge',
    role: 'Luxury Hospitality Concierge',
    prompt: 'A charming, knowledgeable concierge for The Grand Palm Hotel in Miami. Recommends top local dining, reserves private pool cabanas, and assists with late checkout requests.',
    style: 'Sophisticated, welcoming, courteous',
    voice: 'Daniel (Authoritative male)',
  },
  {
    title: 'Spanish Language Practice Coach',
    role: 'Language Tutor',
    prompt: 'A supportive, friendly conversational Spanish coach for intermediate learners. Speaks simple Spanish with English explanations when requested, offering gentle feedback on pronunciation and vocabulary.',
    style: 'Encouraging, patient, bilingual',
    voice: 'Sarah (Gentle female)',
  },
];

export const PromptBuilder: React.FC<PromptBuilderProps> = ({
  onAgentGenerated,
  isConfiguring,
  setIsConfiguring,
  geminiConfigured,
}) => {
  const [description, setDescription] = useState('');
  const [role, setRole] = useState('');
  const [style, setStyle] = useState('Friendly, professional, concise');
  const [language, setLanguage] = useState('en');
  const [voicePreference, setVoicePreference] = useState('female');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectTemplate = (tpl: typeof TEMPLATES[0]) => {
    setDescription(tpl.prompt);
    setRole(tpl.role);
    setStyle(tpl.style);
    setError(null);
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim()) {
      setError('Please provide a description of your voice assistant.');
      return;
    }

    try {
      setIsConfiguring(true);
      setError(null);

      const payload: GenerateAgentRequest = {
        description: description.trim(),
        role: role.trim() || undefined,
        style: style.trim() || undefined,
        language,
        voice_preference: voicePreference,
      };

      const generatedAgent = await generateAgentConfig(payload);
      onAgentGenerated(generatedAgent);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Failed to generate agent.');
    } finally {
      setIsConfiguring(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Intro Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Step 1: AI Prompt Synthesis</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight sm:text-4xl">
          Describe Your Voice AI Agent
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl mx-auto">
          Type your idea in plain English. VoiceForge transforms it into a production-ready ElevenLabs Conversational AI system prompt with spoken boundaries, tone guidelines, and first message.
        </p>
      </div>

      {/* Main Prompt Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <form onSubmit={handleGenerate} className="space-y-5 relative">
          <div>
            <label htmlFor="agent-desc" className="block text-sm font-semibold text-slate-200 mb-2">
              What should this voice agent do?
            </label>
            <div className="relative">
              <textarea
                id="agent-desc"
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., A friendly IT helpdesk assistant that diagnoses Wi-Fi and VPN connection problems for remote employees, guides them step-by-step through router restarts, and escalates unresolved tickets..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition resize-y"
              />
              <div className="absolute bottom-3 right-3 text-xs text-slate-500">
                {description.length} chars
              </div>
            </div>
          </div>

          {/* Quick Preset Templates */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Or pick a hackathon template
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {TEMPLATES.map((t, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectTemplate(t)}
                  className="text-left p-3 rounded-xl bg-slate-950/70 border border-slate-800 hover:border-cyan-500/40 hover:bg-slate-800/40 transition group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-300">
                      {t.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2">
                    {t.prompt}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Advanced Fine-Tuning Drawer */}
          <div className="border-t border-slate-800/80 pt-4">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Persona & Voice Preferences</span>
              {showAdvanced ? (
                <ChevronUp className="w-3.5 h-3.5" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5" />
              )}
            </button>

            {showAdvanced && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Target Role / Title
                  </label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Sales Specialist"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Tone / Personality
                  </label>
                  <input
                    type="text"
                    value={style}
                    onChange={(e) => setStyle(e.target.value)}
                    placeholder="e.g. Warm, concise, direct"
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Voice Preference
                  </label>
                  <select
                    value={voicePreference}
                    onChange={(e) => setVoicePreference(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="female">Female (e.g. Rachel / Jessica)</option>
                    <option value="male">Male (e.g. George / Daniel)</option>
                    <option value="any">Any Best Match</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 rounded-xl bg-red-950/50 border border-red-800/60 text-red-300 text-xs">
              <ShieldAlert className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Action */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <MessageSquare className="w-4 h-4 text-slate-500" />
              <span>Optimized for ElevenLabs Conversational speech synthesis</span>
            </div>

            <button
              type="submit"
              disabled={isConfiguring || !description.trim()}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm text-white bg-gradient-to-r from-cyan-500 via-indigo-600 to-fuchsia-600 hover:opacity-95 shadow-lg shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {isConfiguring ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Synthesizing Voice Agent...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-4 h-4" />
                  <span>Generate Agent Configuration</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Feature Value Props */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400 mb-2 font-bold text-sm">
            1
          </div>
          <h3 className="text-sm font-semibold text-white mb-1">Spoken Voice Prompting</h3>
          <p className="text-xs text-slate-400">
            Synthesizes prompts tailored for speech: no bullet points or markdown clutter that sound awkward when read aloud.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 mb-2 font-bold text-sm">
            2
          </div>
          <h3 className="text-sm font-semibold text-white mb-1">Real ElevenLabs Agent API</h3>
          <p className="text-xs text-slate-400">
            Connects directly to ElevenLabs Conversational AI to create live agent IDs with low-latency TTS models.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 mb-2 font-bold text-sm">
            3
          </div>
          <h3 className="text-sm font-semibold text-white mb-1">Browser Voice Sandbox</h3>
          <p className="text-xs text-slate-400">
            Test bi-directional speech instantly in your browser with real microphone streaming and live agent audio playback.
          </p>
        </div>
      </div>
    </div>
  );
};
