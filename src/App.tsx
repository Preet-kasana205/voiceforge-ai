/**
 * VoiceForge AI - No-Code Conversational Voice Agent Builder
 */

import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { PromptBuilder } from './components/PromptBuilder';
import { ConfigEditor } from './components/ConfigEditor';
import { VoiceTester } from './components/VoiceTester';
import { SessionHistory } from './components/SessionHistory';
import { LocalRunModal } from './components/LocalRunModal';
import { AgentConfig, ServerStatus, SessionRecord, VoiceOption } from './types/agent';
import { checkServerStatus, fetchVoices, getSavedAgents, getSessions } from './services/api';
import { Loader2 } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'forge' | 'editor' | 'test' | 'history'>('forge');
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null);
  const [activeAgent, setActiveAgent] = useState<AgentConfig | null>(null);
  const [agents, setAgents] = useState<AgentConfig[]>([]);
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [voices, setVoices] = useState<VoiceOption[]>([]);
  const [isConfiguring, setIsConfiguring] = useState<boolean>(false);
  const [isLoadingInitial, setIsLoadingInitial] = useState<boolean>(true);
  const [isLocalModalOpen, setIsLocalModalOpen] = useState<boolean>(false);

  // Initial data loading
  useEffect(() => {
    async function loadInitialData() {
      try {
        const [statusRes, voicesRes, agentsRes, sessionsRes] = await Promise.allSettled([
          checkServerStatus(),
          fetchVoices(),
          getSavedAgents(),
          getSessions(),
        ]);

        if (statusRes.status === 'fulfilled') {
          setServerStatus(statusRes.value);
        }
        if (voicesRes.status === 'fulfilled') {
          setVoices(voicesRes.value);
        }
        if (agentsRes.status === 'fulfilled') {
          setAgents(agentsRes.value);
          if (agentsRes.value.length > 0) {
            setActiveAgent(agentsRes.value[0]);
          }
        }
        if (sessionsRes.status === 'fulfilled') {
          setSessions(sessionsRes.value);
        }
      } catch (err) {
        console.error('Error loading initial data:', err);
      } finally {
        setIsLoadingInitial(false);
      }
    }

    loadInitialData();
  }, []);

  const refreshAgentsAndSessions = async () => {
    try {
      const [agentsData, sessionsData] = await Promise.all([getSavedAgents(), getSessions()]);
      setAgents(agentsData);
      setSessions(sessionsData);
    } catch (e) {
      console.error(e);
    }
  };

  const handleAgentGenerated = (agent: AgentConfig) => {
    setActiveAgent(agent);
    setAgents((prev) => [agent, ...prev]);
    setActiveTab('editor');
  };

  const handleUpdateAgent = (updatedAgent: AgentConfig) => {
    setActiveAgent(updatedAgent);
    setAgents((prev) => prev.map((a) => (a.id === updatedAgent.id ? updatedAgent : a)));
  };

  const handleStartTesting = (agent: AgentConfig) => {
    setActiveAgent(agent);
    setActiveTab('test');
  };

  const handleSelectAgentFromHistory = (agent: AgentConfig) => {
    setActiveAgent(agent);
    setActiveTab('editor');
  };

  const handleSessionSaved = (newSession: SessionRecord) => {
    setSessions((prev) => [newSession, ...prev]);
  };

  if (isLoadingInitial) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mb-3" />
        <p className="text-sm font-medium">Initializing VoiceForge AI Studio...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Header */}
      <Header
        status={serverStatus}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenLocalModal={() => setIsLocalModalOpen(true)}
        hasActiveAgent={Boolean(activeAgent)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'forge' && (
          <PromptBuilder
            onAgentGenerated={handleAgentGenerated}
            isConfiguring={isConfiguring}
            setIsConfiguring={setIsConfiguring}
            geminiConfigured={Boolean(serverStatus?.gemini_configured)}
          />
        )}

        {activeTab === 'editor' && activeAgent && (
          <ConfigEditor
            agent={activeAgent}
            onUpdateAgent={handleUpdateAgent}
            onStartTesting={handleStartTesting}
            voices={voices}
            elevenlabsConfigured={Boolean(serverStatus?.elevenlabs_configured)}
          />
        )}

        {activeTab === 'test' && activeAgent && (
          <VoiceTester
            agent={activeAgent}
            onUpdateAgent={handleUpdateAgent}
            onBackToEditor={() => setActiveTab('editor')}
            elevenlabsConfigured={Boolean(serverStatus?.elevenlabs_configured)}
            onSessionSaved={handleSessionSaved}
          />
        )}

        {activeTab === 'history' && (
          <SessionHistory
            sessions={sessions}
            agents={agents}
            onSelectAgent={handleSelectAgentFromHistory}
            onRefreshData={refreshAgentsAndSessions}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/60 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>VoiceForge AI • No-Code Voice AI Agent Builder for Hackathons</span>
          <span>Powered by Gemini 3.8 Flash & ElevenLabs Conversational AI</span>
        </div>
      </footer>

      {/* Architecture & Local Run Modal */}
      <LocalRunModal isOpen={isLocalModalOpen} onClose={() => setIsLocalModalOpen(false)} />
    </div>
  );
}
