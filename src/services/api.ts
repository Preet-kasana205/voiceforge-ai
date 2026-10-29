import { AgentConfig, GenerateAgentRequest, ServerStatus, SessionRecord, VoiceOption } from '../types/agent';

export async function checkServerStatus(): Promise<ServerStatus> {
  const res = await fetch('/api/status');
  if (!res.ok) {
    throw new Error(`Failed to check server status: ${res.statusText}`);
  }
  return res.json();
}

export async function generateAgentConfig(payload: GenerateAgentRequest): Promise<AgentConfig> {
  const res = await fetch('/api/generate-agent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to generate agent configuration.');
  }
  return data;
}

export async function fetchVoices(): Promise<VoiceOption[]> {
  const res = await fetch('/api/voices');
  if (!res.ok) {
    throw new Error('Failed to fetch voices');
  }
  const data = await res.json();
  return data.voices || [];
}

export async function deployAgentToElevenLabs(config: AgentConfig): Promise<{
  agent_id: string;
  is_new: boolean;
  message: string;
}> {
  const res = await fetch('/api/elevenlabs/agent', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to deploy agent to ElevenLabs');
  }
  return data;
}

export async function getConversationSignedUrl(agentId: string): Promise<string> {
  const res = await fetch('/api/elevenlabs/session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ agent_id: agentId }),
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || 'Failed to get conversation signed URL');
  }
  return data.signed_url;
}

export async function getSavedAgents(): Promise<AgentConfig[]> {
  const res = await fetch('/api/agents');
  if (!res.ok) throw new Error('Failed to fetch saved agents');
  const data = await res.json();
  return data.agents || [];
}

export async function saveAgentLocal(config: AgentConfig): Promise<AgentConfig> {
  const res = await fetch('/api/agents', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to save agent locally');
  return data.agent;
}

export async function deleteAgentLocal(id: string): Promise<void> {
  const res = await fetch(`/api/agents/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete agent');
}

export async function getSessions(): Promise<SessionRecord[]> {
  const res = await fetch('/api/sessions');
  if (!res.ok) throw new Error('Failed to fetch session history');
  const data = await res.json();
  return data.sessions || [];
}

export async function saveSession(session: Omit<SessionRecord, 'id'>): Promise<SessionRecord> {
  const res = await fetch('/api/sessions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(session),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to save session');
  return data.session;
}
